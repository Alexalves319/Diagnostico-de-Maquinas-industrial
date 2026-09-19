import { jsPDF } from "jspdf";
import { MaintenanceRecord } from "../types";

export function generateMaintenancePDF(
  records: MaintenanceRecord[],
  filterInfo?: {
    machineFilter?: string;
    statusFilter?: string;
    technicianName?: string;
  }
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 18;

  // Header band
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("SISTEMA DE DIAGNÓSTICO E MANUTENÇÃO INDUSTRIAL", 14, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text("RELATÓRIO OFICIAL DE HISTÓRICO DE MANUTENÇÕES", 14, 19);

  const issueDate = new Date().toLocaleString("pt-BR");
  doc.setFontSize(8);
  doc.text(`Emitido em: ${issueDate}`, pageWidth - 14, 19, { align: "right" });

  y = 36;

  // Summary Metrics Box
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.roundedRect(14, y, pageWidth - 28, 20, 2, 2, "FD");

  const total = records.length;
  const concluidas = records.filter((r) => r.status === "concluida").length;
  const emAndamento = records.filter((r) => r.status === "em_andamento").length;
  const aguardando = records.filter((r) => r.status === "aguardando_pecas").length;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text("RESUMO DO HISTÓRICO:", 18, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const metricsLine = `Total: ${total} registro(s)   |   Concluídas: ${concluidas}   |   Em Andamento: ${emAndamento}   |   Aguardando Peças: ${aguardando}`;
  doc.text(metricsLine, 18, y + 14);

  if (filterInfo?.machineFilter || filterInfo?.statusFilter) {
    const filterText = `Filtros aplicados: ${filterInfo.machineFilter ? `Máquina: "${filterInfo.machineFilter}" ` : ""}${filterInfo.statusFilter ? `Status: "${filterInfo.statusFilter}"` : ""}`;
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(filterText, pageWidth - 18, y + 14, { align: "right" });
  }

  y += 28;

  if (records.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text("Nenhum registro de manutenção encontrado para os critérios selecionados.", 14, y + 10);
  } else {
    // Render each maintenance item as a structured card
    records.forEach((record, index) => {
      // Check page break
      if (y > pageHeight - 45) {
        doc.addPage();
        y = 20;

        // Header continuation
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text("RELATÓRIO DE MANUTENÇÕES (CONTINUAÇÃO)", 14, 12);
        doc.setDrawColor(226, 232, 240);
        doc.line(14, 15, pageWidth - 14, 15);
      }

      const cardStartY = y;
      const cardWidth = pageWidth - 28;

      // Status styling
      let statusLabel = "Concluída";
      let statusColor: [number, number, number] = [22, 101, 52]; // Green
      if (record.status === "em_andamento") {
        statusLabel = "Em Andamento";
        statusColor = [180, 83, 9]; // Amber
      } else if (record.status === "aguardando_pecas") {
        statusLabel = "Aguardando Peças";
        statusColor = [194, 65, 12]; // Orange
      } else if (record.status === "cancelada") {
        statusLabel = "Cancelada";
        statusColor = [153, 27, 27]; // Red
      }

      // Card Background
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(14, y, cardWidth, 38, 2, 2, "FD");

      // Card Top bar
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y, cardWidth, 8, "F");
      doc.line(14, y + 8, 14 + cardWidth, y + 8);

      // Card Title: Machine ID & Fault Code
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      const titleText = `#${index + 1} - Máquina: ${record.machineId || "Geral"} ${record.faultCode ? `[Código: ${record.faultCode}]` : ""}`;
      doc.text(titleText, 18, y + 5.5);

      // Status pill
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(statusLabel.toUpperCase(), pageWidth - 18, y + 5.5, { align: "right" });

      // Body lines
      y += 12;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text("Data/Hora:", 18, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      const dateFormatted = record.date ? new Date(record.date).toLocaleString("pt-BR") : "Não informada";
      doc.text(dateFormatted, 34, y);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(71, 85, 105);
      doc.text("Técnico:", 85, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(record.technician || "Não especificado", 98, y);

      y += 5;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(71, 85, 105);
      doc.text("Diagnóstico / Falha:", 18, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 41, 59);
      const descWrapped = doc.splitTextToSize(record.description || "Sem descrição", cardWidth - 48);
      doc.text(descWrapped[0] || "", 48, y);

      y += 5;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(71, 85, 105);
      doc.text("Ação / Solução:", 18, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 41, 59);
      const actionWrapped = doc.splitTextToSize(record.actionTaken || "Nenhuma ação descrita", cardWidth - 48);
      doc.text(actionWrapped[0] || "", 44, y);

      y += 5;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(71, 85, 105);
      doc.text("Peças / Componentes:", 18, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 41, 59);
      doc.text(record.partsReplaced || "Nenhum componente substituído", 50, y);

      y = cardStartY + 42;
    });

    // Signature footer block on the last page
    if (y > pageHeight - 35) {
      doc.addPage();
      y = 20;
    }

    y += 8;
    doc.setDrawColor(203, 213, 225);
    doc.line(18, y + 12, 80, y + 12);
    doc.line(pageWidth - 80, y + 12, pageWidth - 18, y + 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Assinatura do Técnico / Operador", 49, y + 16, { align: "center" });
    doc.text("Visto da Supervisão / Gestão", pageWidth - 49, y + 16, { align: "center" });
  }

  // Page Numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Página ${i} de ${totalPages} • Diagnóstico & Manutenção Industrial`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );
  }

  // Trigger download
  const cleanDate = new Date().toISOString().slice(0, 10);
  doc.save(`relatorio-manutencoes-${cleanDate}.pdf`);
}
