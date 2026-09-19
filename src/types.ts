export type UserRole = "operador" | "admin";

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  password?: string; // In-memory/local storage authentication for prototype
  createdAt: string;
}

export type SeverityLevel = "baixa" | "media" | "alta" | "critica";

export interface DiagnosticCode {
  id: string;
  code: string; // e.g. "E-101", "F04", "ERR_OIL"
  title: string; // Nome da falha ou função afetada
  causes: string; // O porquê de ocorrer essa falha (causas prováveis)
  resolution: string; // Como resolver (passo a passo de solução)
  relatedFunctions?: string; // Funções e finalidades da máquina
  severity: SeverityLevel;
  sourceReference?: string; // Manual, seção, página
  addedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type MaintenanceStatus = "concluida" | "em_andamento" | "aguardando_pecas" | "cancelada";

export interface MaintenanceRecord {
  id: string;
  machineId: string; // Identificação ou tag da máquina informada pelo usuário
  faultCode?: string; // Código de falha associado (opcional)
  description: string; // Descrição do serviço / diagnóstico realizado
  actionTaken: string; // Ações tomadas e resolução
  partsReplaced?: string; // Peças ou componentes substituídos/ajustados
  status: MaintenanceStatus;
  technician: string; // Técnico / Operador responsável
  date: string; // ISO date string
  durationMinutes?: number;
  notes?: string;
  createdAt: string;
}

export type PriorityLevel = "baixa" | "media" | "alta" | "urgente";
export type TaskStatus = "pendente" | "em_andamento" | "concluido";

export interface ProjectNote {
  id: string;
  projectName: string; // Nome do projeto ou identificador da máquina
  title: string;
  description: string;
  priority: PriorityLevel;
  status: TaskStatus;
  dueDate?: string;
  assignedTo?: string;
  createdAt: string;
  completedAt?: string;
}

export interface UserPermissions {
  canConsultDiagnostics: boolean;
  canRegisterMaintenance: boolean;
  canViewReports: boolean;
  canExportPDF: boolean;
  canManageProjectNotes: boolean;
  canAddCodes: boolean;
  canEditCodes: boolean;
  canDeleteCodes: boolean;
  canManageUsers: boolean;
  canAccessControlPanel: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  operador: {
    canConsultDiagnostics: true,
    canRegisterMaintenance: true,
    canViewReports: true,
    canExportPDF: true,
    canManageProjectNotes: true,
    canAddCodes: false,
    canEditCodes: false,
    canDeleteCodes: false,
    canManageUsers: false,
    canAccessControlPanel: false,
  },
  admin: {
    canConsultDiagnostics: true,
    canRegisterMaintenance: true,
    canViewReports: true,
    canExportPDF: true,
    canManageProjectNotes: true,
    canAddCodes: true,
    canEditCodes: true,
    canDeleteCodes: true,
    canManageUsers: true,
    canAccessControlPanel: true,
  },
};
