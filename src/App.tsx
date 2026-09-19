import React, { useState, useEffect } from "react";
import { User, DiagnosticCode, MaintenanceRecord, ProjectNote } from "./types";
import { storageService } from "./services/storage";
import { Navbar } from "./components/Navbar";
import { LoginModal } from "./components/LoginModal";
import { DiagnosticLookup } from "./components/DiagnosticLookup";
import { CodeManagement } from "./components/CodeManagement";
import { MaintenanceHistory } from "./components/MaintenanceHistory";
import { ProjectNotes } from "./components/ProjectNotes";
import { UserControlPanel } from "./components/UserControlPanel";
import { ElectricalDiagramViewer } from "./components/ElectricalDiagramViewer";
import { PneumaticDiagramViewer } from "./components/PneumaticDiagramViewer";
import { HydraulicDiagramViewer } from "./components/HydraulicDiagramViewer";
import { LoginPage } from "./components/LoginPage";

export default function App() {
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [codes, setCodes] = useState<DiagnosticCode[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [notes, setNotes] = useState<ProjectNote[]>([]);

  const [activeTab, setActiveTab] = useState<string>("diagnostico");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [prefillMaintenanceCode, setPrefillMaintenanceCode] = useState<string | null>(null);
  const [diagnosticSearchQuery, setDiagnosticSearchQuery] = useState<string>("");

  // Initialize storage state
  const loadAllData = () => {
    const loadedUsers = storageService.getUsers();
    const loadedCurrentUser = storageService.getCurrentUser();
    const loadedCodes = storageService.getCodes();
    const loadedMaintenance = storageService.getMaintenanceRecords();
    const loadedNotes = storageService.getProjectNotes();

    setUsers(loadedUsers);
    setCurrentUser(loadedCurrentUser);
    setCodes(loadedCodes);
    setMaintenance(loadedMaintenance);
    setNotes(loadedNotes);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handlers for Users
  const handleSelectUser = (user: User) => {
    storageService.setCurrentUser(user);
    setCurrentUser(user);
  };

  const handleAuthenticate = (username: string, pass: string): boolean => {
    const found = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && (!u.password || u.password === pass)
    );
    if (found) {
      handleSelectUser(found);
      return true;
    }
    return false;
  };

  const handleQuickSwitchUser = () => {
    if (!currentUser) return;
    const targetRole = currentUser.role === "admin" ? "operador" : "admin";
    const targetUser = users.find((u) => u.role === targetRole) || users[0];
    if (targetUser) {
      handleSelectUser(targetUser);
    }
  };

  const handleAddUser = (userData: Omit<User, "id" | "createdAt">) => {
    const newUser = storageService.createUser(userData);
    setUsers(storageService.getUsers());
  };

  const handleUpdateUser = (id: string, updates: Partial<User>) => {
    storageService.updateUser(id, updates);
    setUsers(storageService.getUsers());
    const refreshed = storageService.getCurrentUser();
    setCurrentUser(refreshed);
  };

  const handleDeleteUser = (id: string) => {
    storageService.deleteUser(id);
    setUsers(storageService.getUsers());
  };

  // Handlers for Diagnostic Codes
  const handleAddCode = (codeData: Omit<DiagnosticCode, "id" | "createdAt" | "updatedAt">) => {
    storageService.addCode(codeData);
    setCodes(storageService.getCodes());
  };

  const handleBatchAddCodes = (codesData: Omit<DiagnosticCode, "id" | "createdAt" | "updatedAt">[]) => {
    const count = storageService.addBatchCodes(codesData);
    setCodes(storageService.getCodes());
    return count;
  };

  const handleUpdateCode = (id: string, updates: Partial<DiagnosticCode>) => {
    storageService.updateCode(id, updates);
    setCodes(storageService.getCodes());
  };

  const handleDeleteCode = (id: string) => {
    storageService.deleteCode(id);
    setCodes(storageService.getCodes());
  };

  // Handlers for Maintenance Records
  const handleAddMaintenance = (record: Omit<MaintenanceRecord, "id" | "createdAt">) => {
    storageService.addMaintenanceRecord(record);
    setMaintenance(storageService.getMaintenanceRecords());
  };

  const handleDeleteMaintenance = (id: string) => {
    storageService.deleteMaintenanceRecord(id);
    setMaintenance(storageService.getMaintenanceRecords());
  };

  // Handlers for Project Notes
  const handleAddNote = (note: Omit<ProjectNote, "id" | "createdAt">) => {
    storageService.addProjectNote(note);
    setNotes(storageService.getProjectNotes());
  };

  const handleUpdateNote = (id: string, updates: Partial<ProjectNote>) => {
    storageService.updateProjectNote(id, updates);
    setNotes(storageService.getProjectNotes());
  };

  const handleDeleteNote = (id: string) => {
    storageService.deleteProjectNote(id);
    setNotes(storageService.getProjectNotes());
  };

  // Navigate to maintenance tab with prefilled code
  const handleSelectCodeForMaintenance = (code: string) => {
    setPrefillMaintenanceCode(code);
    setActiveTab("manutencoes");
  };

  const handleLogout = () => {
    storageService.logout();
    setCurrentUser(null);
  };

  if (!currentUser) {
    return (
      <LoginPage
        users={users}
        onLoginSuccess={handleSelectUser}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onQuickSwitchUser={handleQuickSwitchUser}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "diagnostico" && (
          <DiagnosticLookup
            codes={codes}
            onSelectCodeForMaintenance={handleSelectCodeForMaintenance}
            onNavigateToUpload={() => setActiveTab("codigos")}
            initialSearchTerm={diagnosticSearchQuery}
            onNavigateToElectricalDiagram={() => setActiveTab("diagrama")}
            onNavigateToPneumaticDiagram={() => setActiveTab("pneumatico")}
            onNavigateToHydraulicDiagram={() => setActiveTab("hidraulico")}
          />
        )}

        {activeTab === "diagrama" && (
          <ElectricalDiagramViewer
            codes={codes}
            currentUser={currentUser}
            onSelectCodeForMaintenance={handleSelectCodeForMaintenance}
            onNavigateToDiagnostic={(codeQuery) => {
              setDiagnosticSearchQuery(codeQuery);
              setActiveTab("diagnostico");
            }}
          />
        )}

        {activeTab === "pneumatico" && (
          <PneumaticDiagramViewer
            codes={codes}
            currentUser={currentUser}
            onSelectCodeForMaintenance={handleSelectCodeForMaintenance}
            onNavigateToDiagnostic={(codeQuery) => {
              setDiagnosticSearchQuery(codeQuery);
              setActiveTab("diagnostico");
            }}
          />
        )}

        {activeTab === "hidraulico" && (
          <HydraulicDiagramViewer
            currentUser={currentUser!}
            onSelectCodeForMaintenance={handleSelectCodeForMaintenance}
            onNavigateToDiagnostic={(codeQuery) => {
              setDiagnosticSearchQuery(codeQuery);
              setActiveTab("diagnostico");
            }}
            onNavigateToElectricalDiagram={() => setActiveTab("diagrama")}
            onNavigateToPneumaticDiagram={() => setActiveTab("pneumatico")}
          />
        )}

        {activeTab === "codigos" && (
          <CodeManagement
            codes={codes}
            currentUser={currentUser}
            onAddCode={handleAddCode}
            onBatchAddCodes={handleBatchAddCodes}
            onUpdateCode={handleUpdateCode}
            onDeleteCode={handleDeleteCode}
          />
        )}

        {activeTab === "manutencoes" && (
          <MaintenanceHistory
            records={maintenance}
            codes={codes}
            currentUser={currentUser}
            onAddRecord={handleAddMaintenance}
            onDeleteRecord={handleDeleteMaintenance}
            prefillCode={prefillMaintenanceCode}
            onClearPrefillCode={() => setPrefillMaintenanceCode(null)}
          />
        )}

        {activeTab === "pendencias" && (
          <ProjectNotes
            notes={notes}
            currentUser={currentUser}
            onAddNote={handleAddNote}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
          />
        )}

        {activeTab === "painel" && (
          <UserControlPanel
            users={users}
            currentUser={currentUser}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onSelectUser={handleSelectUser}
            onReloadDatabase={loadAllData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>
            Diagnóstico de Máquinas Industriais &bull; Sistema Base com Suporte a Manuais
          </span>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>{codes.length} Códigos Ativos</span>
            <span>&bull;</span>
            <span>{maintenance.length} Manutenções</span>
            <span>&bull;</span>
            <span>{notes.length} Pendências</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-900/60 max-w-7xl mx-auto px-4 flex items-center justify-center text-xs text-slate-400">
          <span>Desenvolvido por <strong className="text-slate-200 font-semibold">Alex Alves</strong></span>
        </div>
      </footer>

      {/* Login & Switch User Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        users={users}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        onAuthenticate={handleAuthenticate}
      />
    </div>
  );
}
