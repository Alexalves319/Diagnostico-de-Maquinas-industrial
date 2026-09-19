import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Helper to get Gemini client lazily
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Endpoint to parse manual text or excerpts and extract error codes
app.post("/api/parse-manual", async (req, res) => {
  try {
    const { manualText, manualName } = req.body;
    if (!manualText || typeof manualText !== "string" || manualText.trim().length === 0) {
      return res.status(400).json({ error: "O texto do manual não foi fornecido." });
    }

    const ai = getGenAI();
    let extracted: any[] = [];

    if (ai) {
      const prompt = `Você é um especialista em diagnóstico de máquinas industriais e análise de manuais técnicos.
Analise o conteúdo do manual abaixo e extraia TODOS os códigos de falha, alarmes, erros ou diagnósticos mencionados.
Para cada código, extraia com precisão:
1. "code": O código exato da falha (ex: "E-01", "F104", "ALM-22", "ERR_PRES_03", etc).
2. "title": Nome resumido da falha ou função afetada.
3. "causes": Explicação técnica clara de POR QUE ocorre essa falha (motivos mecânicos, elétricos, hidráulicos, sensores, etc).
4. "resolution": Procedimento detalhado passo a passo de COMO RESOLVER (o que inspecionar, testar, ajustar, limpar ou trocar).
5. "relatedFunctions": A função, subsistema ou finalidade da máquina relacionada a esta falha.
6. "severity": Classificação de severidade ("baixa", "media", "alta" ou "critica").
7. "sourceReference": Nome do manual, seção ou página indicada no texto.

Manual (${manualName || "Documento fornecido"}):
"""
${manualText.slice(0, 45000)}
"""

Retorne APENAS um JSON array no formato:
[
  {
    "code": "...",
    "title": "...",
    "causes": "...",
    "resolution": "...",
    "relatedFunctions": "...",
    "severity": "baixa" | "media" | "alta" | "critica",
    "sourceReference": "..."
  }
]`;

      // Try Gemini with timeout protection so users get snappy responses
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout Gemini")), 7000)
        );

        const geminiPromise = ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        const response = await Promise.race([geminiPromise, timeoutPromise]);
        const responseText = response.text || "[]";
        const parsed = JSON.parse(responseText);
        if (Array.isArray(parsed) && parsed.length > 0) {
          extracted = parsed;
          return res.json({
            success: true,
            extractedCodes: extracted,
            source: "gemini",
          });
        }
      } catch (genErr: any) {
        console.warn("Análise Gemini falhou ou excedeu tempo limite:", genErr.message);
      }
    }

    // Heuristic structured extraction fallback
    const fallbackCodes = extractHeuristicCodes(manualText, manualName || "Manual Anexado");
    return res.json({
      success: true,
      extractedCodes: fallbackCodes,
      source: "heuristic",
    });
  } catch (error: any) {
    console.error("Erro ao analisar manual:", error);
    const fallbackCodes = extractHeuristicCodes(req.body.manualText || "", req.body.manualName || "Manual");
    return res.json({
      success: true,
      extractedCodes: fallbackCodes,
      source: "heuristic-fallback",
    });
  }
});

// Endpoint for AI diagnostic assistance on specific symptom or code
app.post("/api/ai-diagnose", async (req, res) => {
  try {
    const { code, description, machineNotes, knownCodesContext } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.status(503).json({
        error: "Serviço de IA não configurado.",
        solution: "Verifique a configuração de GEMINI_API_KEY no painel de Secrets.",
      });
    }

    const prompt = `Você é um engenheiro sênior de manutenção industrial e diagnóstico eletromecânico.
O operador está solicitando suporte para diagnóstico rápido.

Dados informados pelo operador:
- Código pesquisado: ${code || "Não especificado"}
- Sintoma / Descrição: ${description || "Não especificado"}
- Observações da máquina ou contexto: ${machineNotes || "Nenhum detalhe adicional"}
${
  knownCodesContext && knownCodesContext.length > 0
    ? `Códigos já cadastrados na base para referência:\n${JSON.stringify(knownCodesContext, null, 2)}`
    : ""
}

Forneça um relatório de diagnóstico técnico objetivo e estruturado em português:
1. **Identificação e Significado da Falha**
2. **Por que isso ocorre (Causas Raiz Mais Prováveis)**
3. **Procedimento de Solução Passo a Passo (Ordem de testes do mais simples ao mais complexo)**
4. **Cuidados e Medidas de Segurança (Lockout/Tagout, despressurização, EPIs)**
5. **Verificações preventivas para não reincidir**`;

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout Gemini")), 7000)
    );

    const geminiPromise = ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    const response = await Promise.race([geminiPromise, timeoutPromise]);

    return res.json({
      diagnosis: response.text,
    });
  } catch (error: any) {
    console.error("Erro no diagnóstico de IA:", error);
    // Provide a helpful fallback guide even if remote AI times out or has 503
    const code = req.body.code || "FALHA";
    const fallbackDiagnosis = `### Diagnóstico Preliminar para o Código: ${code}

1. **Identificação e Significado da Falha**:
   Alerta operacional registrado para o código **${code}**.

2. **Por que isso ocorre (Causas Raiz Mais Prováveis)**:
   - Sinal elétrico fora dos parâmetros nominais (tensão, corrente ou resistência).
   - Acionamento de sensor de fim de curso, barreira ótica ou termostato de segurança.
   - Perda de comunicação ou sobrecarga momentânea de acionamento mecânico.

3. **Procedimento de Solução Passo a Passo**:
   - **Passo 1**: Realizar inspeção visual de cabos, conectores e sensores associados ao subsistema.
   - **Passo 2**: Verificar alimentação de comando (24VDC ou correspondente) com multímetro.
   - **Passo 3**: Testar o mecanismo mecânico manualmente (com máquina desligada) para detectar travamento ou atrito excessivo.
   - **Passo 4**: Reinicializar o controlador/módulo e observar se o erro persiste no rearme.

4. **Cuidados e Medidas de Segurança**:
   - Aplicar Lockout/Tagout (LOTO) e despressurizar linhas pneumáticas/hidráulicas antes de qualquer intervenção física.
   - Utilizar EPIs adequados (luvas contra corte/queimadura e óculos de proteção).

5. **Ação Recomendada**:
   - Registre esta intervenção na aba **Histórico de Manutenções** para alimentar o relatório técnico em PDF.`;

    return res.json({
      diagnosis: fallbackDiagnosis,
      isFallback: true,
    });
  }
});

// Heuristic extractor as reliable fallback or offline parser
function extractHeuristicCodes(text: string, manualName: string) {
  const codes: any[] = [];
  // Split into chunks by double newline or error markers
  const paragraphs = text.split(/\n\s*\n|\r\n\s*\r\n/);
  const codeRegex = /\b([A-Z]{1,4}[-_]?[0-9]{1,5}|E[-_]?[0-9]{2,4}|F[-_]?[0-9]{2,4}|ALM[-_]?[0-9]{1,4}|ERR[-_]?[A-Z0-9]{2,8})\b/i;

  for (const block of paragraphs) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    const match = trimmed.match(codeRegex);
    if (match) {
      const codeFound = match[1].toUpperCase();
      // Extract title/description
      let title = "";
      let causes = "";
      let resolution = "";

      const lines = trimmed.split("\n").map((l) => l.trim());
      for (const line of lines) {
        if (!title && line.includes(match[0])) {
          title = line
            .replace(match[0], "")
            .replace(/^(código|codigo|code|alarme|falha|erro|\:|\-|\–|\s)+/i, "")
            .trim();
        }
        if (line.match(/(causa|porqu[eê]|motivo|origem)/i)) {
          causes += (causes ? " " : "") + line.replace(/^(causa[s]?|por que|porquê|motivo[s]?|\:|\-)+/i, "").trim();
        }
        if (line.match(/(solu[cç][aã]o|como resolver|a[cç][aã]o|corre[cç][aã]o|reparo|procedimento)/i)) {
          resolution += (resolution ? " " : "") + line.replace(/^(solu[cç][aã]o|como resolver|a[cç][aã]o|corre[cç][aã]o|reparo|procedimento|\:|\-)+/i, "").trim();
        }
      }

      if (!title) {
        title = `Falha do Sistema ${codeFound}`;
      }
      if (!causes) {
        causes = "Causas indicadas no documento: verificação de sensores, atuadores, alimentação elétrica ou pressão hidráulica/pneumática.";
      }
      if (!resolution) {
        resolution = "Procedimento: Inspecionar conexões físicas, verificar integridade do circuito e realizar rearme ou substituição de componente defeituoso.";
      }

      let severity: "baixa" | "media" | "alta" | "critica" = "media";
      if (trimmed.match(/cr[ií]tic|urgente|parada imediata|emerg[eê]ncia/i)) {
        severity = "critica";
      } else if (trimmed.match(/alta|grave|perigo|risco/i)) {
        severity = "alta";
      } else if (trimmed.match(/baixa|aviso|alerta leve|informativo/i)) {
        severity = "baixa";
      }

      codes.push({
        code: codeFound,
        title,
        causes,
        resolution,
        relatedFunctions: "Subsistema principal da máquina",
        severity,
        sourceReference: manualName || "Manual Anexado",
      });
    }
  }

  // If no block matched via double-newline, try line-by-line
  if (codes.length === 0) {
    const lines = text.split("\n");
    for (const line of lines) {
      const match = line.match(codeRegex);
      if (match) {
        codes.push({
          code: match[1].toUpperCase(),
          title: line.replace(match[0], "").replace(/[:\-\–]/g, " ").trim() || `Falha ${match[1].toUpperCase()}`,
          causes: "Causas indicadas no manual técnico para este código de falha.",
          resolution: "Procedimento recomendado: Testar fiação, sensores e condições operacionais de trabalho.",
          relatedFunctions: "Função de operação industrial",
          severity: "media",
          sourceReference: manualName || "Manual",
        });
      }
    }
  }

  return codes;
}

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Diagnóstico de Máquinas server running on port ${PORT}`);
  });
}

startServer();
