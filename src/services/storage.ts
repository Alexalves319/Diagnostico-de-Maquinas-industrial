import { User, DiagnosticCode, MaintenanceRecord, ProjectNote, UserRole } from "../types";
import { ELECTRICAL_DIAGNOSTIC_CODES } from "../data/electricalData";
import { PNEUMATIC_DIAGNOSTIC_CODES } from "../data/pneumaticData";

const STORAGE_KEYS = {
  USERS: "diag_users_v1",
  CURRENT_USER: "diag_current_user_v1",
  CODES: "diag_codes_v1",
  MAINTENANCE: "diag_maintenance_v1",
  NOTES: "diag_notes_v1",
};

// Initial default users as strictly requested (Operador e Administrador)
const INITIAL_USERS: User[] = [
  {
    id: "usr_admin",
    username: "admin",
    name: "Administrador do Sistema",
    role: "admin",
    password: "admin123",
    createdAt: new Date().toISOString(),
  },
  {
    id: "usr_operador",
    username: "operador",
    name: "Operador Técnico",
    role: "operador",
    password: "operador123",
    createdAt: new Date().toISOString(),
  },
];

// Initial diagnostic and operational reference codes for NISSEI ASB-70DPW V4 SERVO
const INITIAL_CODES: DiagnosticCode[] = [
  {
    id: "code_nissei_p1_v1",
    code: "V1-P1",
    title: "Servo-Bomba 1 (V1/P1) — Sistema de Injeção (INJECTION)",
    causes: "Desvios de pressão ou velocidade na unidade de injeção. Causas prováveis: oscilação na dosagem da rosca (SCREW BW), ar no circuito da bomba YUKEN ASE5, obstrução na linha de avanço/recuo da unidade (INJ. UNIT FW/BW), superaquecimento do servo driver AMSE1 ou nível insuficiente de óleo ISO VG46.",
    resolution: "1. Parâmetros padrão do manual: SCREW BW: 3 MPa / 30% vel. | INJ. UNIT FW: 7 MPa / 10% vel. | INJ. UNIT BW: 4 MPa / 10% vel. | UNLOAD: 0 MPa / 0%.\n2. Inspecionar o servo driver AMSE1 no painel elétrico quanto a alarmes de sobrecarga ou encoder.\n3. Checar o volume de enchimento de referência no corpo da bomba YUKEN ASE5 (600 ml de ISO VG46).\n4. Verificar se há engripamento mecânico no carro da unidade injetora ou vazamentos nas mangueiras flexíveis.\n5. Comparar os valores reais com os ajustes de fábrica de acordo com o molde instalado.",
    relatedFunctions: "Unidade de Injeção, Rosca Plastificadora (SCREW BW), Avanço e Recuo do Bico Injetor",
    severity: "alta",
    sourceReference: "Manual NISSEI ASB-70DPW V4 (Doc 389A61809 ENG, Seção P1/V1)",
    createdAt: "2026-09-17T14:25:00.000Z",
    updatedAt: "2026-09-17T14:25:00.000Z",
  },
  {
    id: "code_nissei_p2_v2",
    code: "V2-P2",
    title: "Servo-Bomba 2 (V2/P2) — Molde de Injeção (INJ. M, Main Ram & Lip Mold)",
    causes: "Falha de fechamento, alta pressão ou abertura do molde de injeção. Causas prováveis: perda de pressão de travamento no cilindro Main Ram (não atinge 14 MPa), transição irregular entre avanço rápido (CL FA 7 MPa/80%) e lento (CL SD 7 MPa/50%), emperramento mecânico do Lip Mold ou falha no servo acionador AMSE2.",
    resolution: "1. Parâmetros padrão do manual:\n   - Fechamento do Molde: CL FA: 7 MPa (80%) | CL SD: 7 MPa (50%) | CL (M.SET): 5 MPa (5%)\n   - Abertura do Molde: OP SD: 1 MPa (4%) | OP FA: 14 MPa (90%) | OP SD 2: 8 MPa (60%) | OP (M.SET): 10 MPa (70%)\n   - Main Ram (Pistão Principal): FW: 14 MPa (50%) | BW: 6 MPa (50%)\n   - Lip Mold: CL (M.SET): 4 MPa (50%) | OP (M.SET): 10 MPa (80%)\n   - UNLOAD: 0 MPa / 0%\n2. Se o Main Ram não travar com 14 MPa, verificar vedações do cilindro e válvula de pré-enchimento.\n3. Testar a calibração do transdutor de pressão do canal P2 e verificar alarmes do drive AMSE2.\n4. Lubrificar colunas guias e verificar paralelismo das placas.",
    relatedFunctions: "Fechamento/Abertura do Molde de Injeção, Cilindro Main Ram e Lip Mold",
    severity: "critica",
    sourceReference: "Manual NISSEI ASB-70DPW V4 (Doc 389A61809 ENG, Seção P2/V2)",
    createdAt: "2026-09-17T14:25:00.000Z",
    updatedAt: "2026-09-17T14:25:00.000Z",
  },
  {
    id: "code_nissei_p3_v3",
    code: "V3-P3",
    title: "Servo-Bomba 3 (V3/P3) — Sistema de Sopro (BLOW M., Stretch, Bottom & Split Mold)",
    causes: "Falha na pressurização ou movimentação da estação de sopro. Causas prováveis: molde de sopro não mantém a pressão de Clamping/Hold Press (14 MPa), velocidade ou força irregular na unidade de estiramento (Stretch Unit), atrito nos trilhos do Bottom Mold (fundo) ou abertura prematura do Split Mold.",
    resolution: "1. Parâmetros padrão do manual:\n   - Molde de Sopro: CL FA: 10 MPa (80%) | CL SD: 2 MPa (10%) | CLAMPING: 14 MPa (60%) | HOLD PRESS: 14 MPa (60%) | CL ([Link]): 5 MPa (15%) | OP FA: 7 MPa (60%) | OP SD: 6 MPa (20%) | OP (M.SET): 3 MPa (30%)\n   - Stretch Unit (Estiramento): DW FA: 10 MPa (50%) | DW SD: 8 MPa (50%) | DW ([Link]): 5 MPa (60%) | UP FA: 5 MPa (30%) | UP SD: 4 MPa (50%) | UP ([Link]): 5 MPa (60%)\n   - Bottom Mold (Fundo): UP: 12 MPa (80%) | DW: 1 MPa (10%)\n   - Split Mold (Bipartido): CL: 10 MPa (99%) | OP: 10 MPa (99%)\n   - UNLOAD: 0 MPa / 0%\n2. Inspecionar estabilidade da pressão de 14 MPa no fechamento para evitar abertura com ar de sopro.\n3. Checar alinhamento das hastes de estiramento e sensores de fim de curso superior/inferior.\n4. Verificar servo driver AMSE3 e temperatura da bomba P3.",
    relatedFunctions: "Molde de Sopro, Unidade de Estiramento (Stretch Unit), Fundo (Bottom Mold) e Split Mold",
    severity: "alta",
    sourceReference: "Manual NISSEI ASB-70DPW V4 (Doc 389A61809 ENG, Seção P3/V3)",
    createdAt: "2026-09-17T14:25:00.000Z",
    updatedAt: "2026-09-17T14:25:00.000Z",
  },
  {
    id: "code_nissei_oil_ase5",
    code: "ASE5-OIL",
    title: "Especificação & Enchimento do Óleo Hidráulico — Bomba YUKEN ASE5 SERVO",
    causes: "Nível incorreto de óleo, aeração, cavitação ou perda de viscosidade do fluido hidráulico. Volume de referência no pump inferior a 600 ml após manutenção ou vazamento, gerando ruído anormal e superaquecimento.",
    resolution: "1. Fluido especificado pelo fabricante: Óleo hidráulico mineral ISO VG46 antidesgaste.\n2. Quantidade de enchimento de referência do pump: 600 ml (conforme tabela de especificações gerais).\n3. Verificar antes de dar partida na máquina se o corpo da servo-bomba YUKEN ASE5 foi devidamente pré-carregado com 600 ml de óleo para evitar funcionamento a seco.\n4. Monitorar a temperatura operacional (ideal entre 40°C e 55°C).\n5. Fazer a sangria de ar nos bujões superiores das bombas V1, V2 e V3.",
    relatedFunctions: "Lubrificação e Potência Hidráulica dos três grupos de servo-bombas V1, V2 e V3",
    severity: "alta",
    sourceReference: "Manual NISSEI ASB-70DPW V4 (Seção 4: Especificações Gerais do Conjunto)",
    createdAt: "2026-09-17T14:25:00.000Z",
    updatedAt: "2026-09-17T14:25:00.000Z",
  },
  {
    id: "code_nissei_main_ram",
    code: "MAIN-RAM",
    title: "Cilindro de Fechamento Principal (Main Ram FW / BW) — P2/V2",
    causes: "Pressão de travamento não atinge os 14 MPa nominais ou retorno (BW) lento. Causas: vazamento interno nas gaxetas do cilindro de alta pressão, válvula de pré-enchimento com assentamento desgastado ou transdutor com leitura incorreta.",
    resolution: "1. Valores padrão de ajuste: Main Ram FW: 14 MPa (50% vel.) | Main Ram BW: 6 MPa (50% vel.).\n2. Monitorar no manômetro e na tela se a bomba P2 sustenta 14 MPa durante toda a fase de injeção.\n3. Se a pressão oscilar, checar a válvula direcional proporcional e o sinal do driver AMSE2.\n4. Inspecionar visualmente as vedações contra vazamentos externos na carcaça do cilindro principal.",
    relatedFunctions: "Travamento de Alta Pressão do Molde de Injeção PET",
    severity: "critica",
    sourceReference: "Manual NISSEI ASB-70DPW V4 (Tabela 2: Molde de Injeção / P2)",
    createdAt: "2026-09-17T14:25:00.000Z",
    updatedAt: "2026-09-17T14:25:00.000Z",
  },
  {
    id: "code_nissei_stretch_unit",
    code: "STRETCH-UNIT",
    title: "Unidade de Estiramento do Sopro (Stretch Unit DW / UP) — P3/V3",
    causes: "Descida irregular das hastes de estiramento ou retorno incompleto. Causas: pressão divergente dos padrões de fábrica (DW FA 10 MPa / DW SD 8 MPa / UP FA 5 MPa), sensor de fim de curso desregulado, falta de lubrificação nas guias ou vazamento no cilindro de estiramento.",
    resolution: "1. Parâmetros padrão de fábrica:\n   - Descida rápida: DW FA: 10 MPa (50%)\n   - Descida lenta/amortecimento: DW SD: 8 MPa (50%)\n   - Descida intertravada: DW ([Link]): 5 MPa (60%)\n   - Subida rápida: UP FA: 5 MPa (30%)\n   - Subida lenta: UP SD: 4 MPa (50%)\n   - Subida intertravada: UP ([Link]): 5 MPa (60%)\n2. Inspecionar o paralelismo das hastes e certificar-se de que não haja contato mecânico forçado com a cavidade da pré-forma.\n3. Verificar se as válvulas reguladoras de fluxo e a servo-bomba P3 (AMSE3) respondem sem atraso.",
    relatedFunctions: "Estiramento Longitudinal das Pré-formas na Estação de Sopro",
    severity: "media",
    sourceReference: "Manual NISSEI ASB-70DPW V4 (Tabela 3: Sistema de Sopro / P3)",
    createdAt: "2026-09-17T14:25:00.000Z",
    updatedAt: "2026-09-17T14:25:00.000Z",
  },
  ...ELECTRICAL_DIAGNOSTIC_CODES,
  ...PNEUMATIC_DIAGNOSTIC_CODES,
];

// Base storage operations
export const storageService = {
  // Users
  getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_USERS;
    }
  },

  saveUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getCurrentUser(): User | null {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return null;
    const users = this.getUsers();
    try {
      const parsed = JSON.parse(raw);
      const exists = users.find((u) => u.id === parsed.id || u.username === parsed.username);
      if (exists) return exists;
    } catch {
      return null;
    }
    return null;
  },

  setCurrentUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  createUser(userData: Omit<User, "id" | "createdAt">): User {
    const users = this.getUsers();
    const newUser: User = {
      ...userData,
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    this.saveUsers(users);
    this.tryBgSync("users.php", "POST", newUser);
    return newUser;
  },

  updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    users[index] = { ...users[index], ...updates };
    this.saveUsers(users);
    const current = this.getCurrentUser();
    if (current && current.id === id) {
      this.setCurrentUser(users[index]);
    }
    this.tryBgSync("users.php", "PUT", { id, ...updates });
    return users[index];
  },

  deleteUser(id: string): boolean {
    const users = this.getUsers();
    // Do not delete if only 1 admin remains
    const userToDelete = users.find((u) => u.id === id);
    if (!userToDelete) return false;
    if (userToDelete.role === "admin") {
      const adminCount = users.filter((u) => u.role === "admin").length;
      if (adminCount <= 1) {
        throw new Error("Não é permitido excluir o único administrador ativo do sistema.");
      }
    }
    const filtered = users.filter((u) => u.id !== id);
    this.saveUsers(filtered);
    this.tryBgSync("users.php", "DELETE", undefined, `id=${encodeURIComponent(id)}`);
    return true;
  },

  // Diagnostic Codes
  getCodes(): DiagnosticCode[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CODES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CODES, JSON.stringify(INITIAL_CODES));
      return INITIAL_CODES;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Check if new initial codes need to be merged into the existing list
        let updated = false;
        const currentCodeKeys = new Set(parsed.map((c: DiagnosticCode) => c.code.trim().toUpperCase()));
        for (const initial of INITIAL_CODES) {
          if (!currentCodeKeys.has(initial.code.trim().toUpperCase())) {
            parsed.push(initial);
            currentCodeKeys.add(initial.code.trim().toUpperCase());
            updated = true;
          }
        }
        if (updated) {
          localStorage.setItem(STORAGE_KEYS.CODES, JSON.stringify(parsed));
        }
        return parsed;
      }
      localStorage.setItem(STORAGE_KEYS.CODES, JSON.stringify(INITIAL_CODES));
      return INITIAL_CODES;
    } catch {
      return INITIAL_CODES;
    }
  },

  saveCodes(codes: DiagnosticCode[]): void {
    localStorage.setItem(STORAGE_KEYS.CODES, JSON.stringify(codes));
  },

  addCode(codeData: Omit<DiagnosticCode, "id" | "createdAt" | "updatedAt">): DiagnosticCode {
    const codes = this.getCodes();
    const now = new Date().toISOString();
    const newCode: DiagnosticCode = {
      ...codeData,
      id: `code_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };
    codes.unshift(newCode);
    this.saveCodes(codes);
    this.tryBgSync("codes.php", "POST", newCode);
    return newCode;
  },

  addBatchCodes(codesData: Omit<DiagnosticCode, "id" | "createdAt" | "updatedAt">[]): number {
    const currentCodes = this.getCodes();
    const now = new Date().toISOString();
    let addedCount = 0;

    for (const data of codesData) {
      const cleanCode = data.code.trim().toUpperCase();
      // If code already exists, update it, otherwise create new
      const existingIdx = currentCodes.findIndex((c) => c.code.trim().toUpperCase() === cleanCode);
      if (existingIdx >= 0) {
        currentCodes[existingIdx] = {
          ...currentCodes[existingIdx],
          ...data,
          code: cleanCode,
          updatedAt: now,
        };
        this.tryBgSync("codes.php", "POST", currentCodes[existingIdx]);
      } else {
        const createdItem = {
          ...data,
          code: cleanCode,
          id: `code_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          createdAt: now,
          updatedAt: now,
        };
        currentCodes.push(createdItem);
        this.tryBgSync("codes.php", "POST", createdItem);
        addedCount++;
      }
    }

    this.saveCodes(currentCodes);
    return addedCount;
  },

  updateCode(id: string, updates: Partial<DiagnosticCode>): DiagnosticCode | null {
    const codes = this.getCodes();
    const index = codes.findIndex((c) => c.id === id);
    if (index === -1) return null;
    codes[index] = {
      ...codes[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveCodes(codes);
    this.tryBgSync("codes.php", "POST", codes[index]);
    return codes[index];
  },

  deleteCode(id: string): boolean {
    const codes = this.getCodes();
    const filtered = codes.filter((c) => c.id !== id);
    this.saveCodes(filtered);
    this.tryBgSync("codes.php", "DELETE", undefined, `id=${encodeURIComponent(id)}`);
    return true;
  },

  // Maintenance Records
  getMaintenanceRecords(): MaintenanceRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MAINTENANCE);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveMaintenanceRecords(records: MaintenanceRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(records));
  },

  addMaintenanceRecord(recordData: Omit<MaintenanceRecord, "id" | "createdAt">): MaintenanceRecord {
    const records = this.getMaintenanceRecords();
    const newRecord: MaintenanceRecord = {
      ...recordData,
      id: `maint_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    records.unshift(newRecord);
    this.saveMaintenanceRecords(records);
    this.tryBgSync("maintenance.php", "POST", newRecord);
    return newRecord;
  },

  deleteMaintenanceRecord(id: string): boolean {
    const records = this.getMaintenanceRecords();
    const filtered = records.filter((r) => r.id !== id);
    this.saveMaintenanceRecords(filtered);
    this.tryBgSync("maintenance.php", "DELETE", undefined, `id=${encodeURIComponent(id)}`);
    return true;
  },

  // Project Notes & Reminders
  getProjectNotes(): ProjectNote[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveProjectNotes(notes: ProjectNote[]): void {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  },

  addProjectNote(noteData: Omit<ProjectNote, "id" | "createdAt">): ProjectNote {
    const notes = this.getProjectNotes();
    const newNote: ProjectNote = {
      ...noteData,
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    notes.unshift(newNote);
    this.saveProjectNotes(notes);
    this.tryBgSync("notes.php", "POST", newNote);
    return newNote;
  },

  updateProjectNote(id: string, updates: Partial<ProjectNote>): ProjectNote | null {
    const notes = this.getProjectNotes();
    const index = notes.findIndex((n) => n.id === id);
    if (index === -1) return null;
    notes[index] = { ...notes[index], ...updates };
    this.saveProjectNotes(notes);
    this.tryBgSync("notes.php", "POST", notes[index]);
    return notes[index];
  },

  deleteProjectNote(id: string): boolean {
    const notes = this.getProjectNotes();
    const filtered = notes.filter((n) => n.id !== id);
    this.saveProjectNotes(filtered);
    this.tryBgSync("notes.php", "DELETE", undefined, `id=${encodeURIComponent(id)}`);
    return true;
  },

  // Export full backup
  exportBackupData() {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      codes: this.getCodes(),
      maintenance: this.getMaintenanceRecords(),
      notes: this.getProjectNotes(),
      users: this.getUsers().map(({ password, ...u }) => u), // exclude password in export
    };
  },

  // Import backup data
  importBackupData(jsonString: string): { importedCodes: number; importedMaintenance: number; importedNotes: number } {
    const data = JSON.parse(jsonString);
    let importedCodes = 0;
    let importedMaintenance = 0;
    let importedNotes = 0;

    if (Array.isArray(data.codes)) {
      this.saveCodes(data.codes);
      importedCodes = data.codes.length;
    }
    if (Array.isArray(data.maintenance)) {
      this.saveMaintenanceRecords(data.maintenance);
      importedMaintenance = data.maintenance.length;
    }
    if (Array.isArray(data.notes)) {
      this.saveProjectNotes(data.notes);
      importedNotes = data.notes.length;
    }

    return { importedCodes, importedMaintenance, importedNotes };
  },

  // ==========================================================
  // INTEGRAÇÃO COM BANCO DE DADOS MYSQL (XAMPP)
  // ==========================================================
  
  // Testar conexão com o MySQL via API PHP do XAMPP
  async testMySQLConnection(): Promise<{
    connected: boolean;
    message: string;
    database?: string;
    tables?: string[];
    counts?: Record<string, number>;
  }> {
    try {
      const res = await fetch("api/test_db.php", {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        throw new Error(`Servidor respondeu com status HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        return {
          connected: true,
          message: data.message || "Conexão com MySQL ativa!",
          database: data.database,
          tables: data.tables,
          counts: data.counts,
        };
      } else {
        return {
          connected: false,
          message: data.error || "Não foi possível conectar ao banco de dados.",
        };
      }
    } catch (err: any) {
      return {
        connected: false,
        message:
          "Servidor MySQL/Apache não acessível nesta porta. Quando rodar no XAMPP (htdocs), o banco MySQL estará ativo.",
      };
    }
  },

  // Sincronizar todos os dados locais diretamente para as tabelas do MySQL
  async syncLocalToMySQL(): Promise<{ success: boolean; message: string }> {
    try {
      const payload = {
        users: this.getUsers(),
        codes: this.getCodes(),
        maintenance: this.getMaintenanceRecords(),
        notes: this.getProjectNotes(),
      };

      const res = await fetch("api/sync.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        return { success: true, message: data.message || "Dados sincronizados com o MySQL com sucesso!" };
      }
      return { success: false, message: data.error || "Erro ao salvar no MySQL." };
    } catch (err: any) {
      return { success: false, message: err.message || "Erro de conexão ao enviar dados para o MySQL." };
    }
  },

  // Carregar dados existentes do MySQL para a aplicação
  async syncMySQLToLocal(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch("api/sync.php", { method: "GET" });
      const data = await res.json();
      if (data.success) {
        if (Array.isArray(data.users) && data.users.length > 0) this.saveUsers(data.users);
        if (Array.isArray(data.codes) && data.codes.length > 0) this.saveCodes(data.codes);
        if (Array.isArray(data.maintenance) && data.maintenance.length > 0) this.saveMaintenanceRecords(data.maintenance);
        if (Array.isArray(data.notes) && data.notes.length > 0) this.saveProjectNotes(data.notes);

        return { success: true, message: "Dados atualizados a partir do banco MySQL com sucesso!" };
      }
      return { success: false, message: data.error || "Erro ao consultar dados no MySQL." };
    } catch (err: any) {
      return { success: false, message: err.message || "Erro de conexão ao consultar o MySQL." };
    }
  },

  // Tentar sincronização em segundo plano de uma ação (sem travar a interface)
  async tryBgSync(endpoint: string, method: "POST" | "DELETE" | "PUT", body?: any, query?: string) {
    try {
      const url = query ? `api/${endpoint}?${query}` : `api/${endpoint}`;
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch {
      // Falha silenciosa se estiver em modo offline / preview sem XAMPP
    }
  },

  // Baixar o arquivo database.sql pronto para o phpMyAdmin
  downloadDatabaseSQL() {
    const link = document.createElement("a");
    link.href = "database.sql";
    link.download = "database.sql";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
