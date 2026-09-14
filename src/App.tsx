import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { InstitutePortal } from './components/InstitutePortal';
import { AdminHub } from './components/AdminHub';
import { LoginModal } from './components/LoginModal';
import { BankAdviceModal } from './components/BankAdviceModal';
import { ConsolidatedExportModal } from './components/ConsolidatedExportModal';
import { SettingsModal } from './components/SettingsModal';
import { StorageService, syncWithGoogleSheet } from './services/apiService';
import { Institute, StaffMember, MonthlyTransaction, SystemConfig, UserSession } from './types/payroll';

export function App() {
  // State from Storage Service
  const [config, setConfig] = useState<SystemConfig>(StorageService.getConfig());
  const [institutes, setInstitutes] = useState<Institute[]>(StorageService.getInstitutes());
  const [staff, setStaff] = useState<StaffMember[]>(StorageService.getStaff());
  const [transactions, setTransactions] = useState<MonthlyTransaction[]>(StorageService.getTransactions());

  // Navigation & Sessions
  // Default session starts with GVITW Samanabad (33028) so the app opens immediately into an interactive view!
  const [session, setSession] = useState<UserSession>({
    role: 'INSTITUTE',
    instituteCode: '33028',
    instituteName: 'GVTIW Samanabad Faisalabad',
    district: 'Faisalabad',
    userName: 'Principal GVTIW'
  });
  const [activeTab, setActiveTab] = useState<'INSTITUTE' | 'ADMIN'>('INSTITUTE');

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBankAdviceOpen, setIsBankAdviceOpen] = useState(false);
  const [consolidatedModalType, setConsolidatedModalType] = useState<'DW' | 'VISITING' | null>(null);

  // Active current institute
  const currentInstitute = institutes.find(i => i.code === (session.instituteCode || '33028')) || institutes[0];

  // Handlers for persistence
  const handleSaveTransactions = (updatedTxns: MonthlyTransaction[]) => {
    setTransactions(updatedTxns);
    StorageService.saveTransactions(updatedTxns);
  };

  const handleSubmitToDD = async (instituteCode: string) => {
    const updated = transactions.map(t => {
      if (t.instituteCode === instituteCode && t.payrollMonth === config.activeMonth) {
        return { ...t, status: 'Submitted' as const, submittedAt: new Date().toLocaleString() };
      }
      return t;
    });

    setTransactions(updated);
    StorageService.saveTransactions(updated);

    // Trigger Cloud Sync if configured
    if (config.appsScriptUrl) {
      await syncWithGoogleSheet(config.appsScriptUrl, instituteCode, updated.filter(t => t.instituteCode === instituteCode), session.userName);
    }
  };

  const handleSaveConfig = (updatedConfig: SystemConfig) => {
    setConfig(updatedConfig);
    StorageService.saveConfig(updatedConfig);
  };

  const handleResetData = () => {
    StorageService.resetToDefault();
    setConfig(StorageService.getConfig());
    setInstitutes(StorageService.getInstitutes());
    setStaff(StorageService.getStaff());
    setTransactions(StorageService.getTransactions());
  };

  const handleSelectInstituteFromAdmin = (code: string) => {
    const inst = institutes.find(i => i.code === code);
    if (inst) {
      setSession({
        role: 'INSTITUTE',
        instituteCode: inst.code,
        instituteName: inst.name,
        district: inst.district,
        userName: `${inst.shortName} In-Charge`
      });
      setActiveTab('INSTITUTE');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Official Top Navigation */}
      <Navbar
        session={session}
        activeMonth={config.activeMonth}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={() => {
          setSession({ role: 'GUEST', userName: 'Guest Viewer' });
          setIsLoginOpen(true);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'ADMIN' || session.role === 'DISTRICT_ADMIN' ? (
          <AdminHub
            institutes={institutes}
            staff={staff}
            transactions={transactions}
            config={config}
            onOpenBankAdvice={() => setIsBankAdviceOpen(true)}
            onOpenConsolidatedExport={(type) => setConsolidatedModalType(type)}
            onSelectInstituteView={handleSelectInstituteFromAdmin}
          />
        ) : (
          <InstitutePortal
            institute={currentInstitute}
            staff={staff}
            transactions={transactions}
            config={config}
            onSaveTransactions={handleSaveTransactions}
            onSubmitToDD={handleSubmitToDD}
          />
        )}
      </main>

      {/* Official Corporate Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-6 mt-12 print-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-300">
              Technical Education & Vocational Training Authority (TEVTA)
            </span>
            <span>•</span>
            <span>District Director Office Faisalabad & Chiniot</span>
          </div>

          <div className="text-[11px] text-slate-500 text-center sm:text-right">
            Non-Regular Staff Salary Management & Disbursement Engine (SMS-DES) • v1.0.0
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        institutes={institutes}
        onLoginSuccess={(newSession) => {
          setSession(newSession);
          if (newSession.role === 'DISTRICT_ADMIN') {
            setActiveTab('ADMIN');
          } else {
            setActiveTab('INSTITUTE');
          }
        }}
      />

      <BankAdviceModal
        isOpen={isBankAdviceOpen}
        onClose={() => setIsBankAdviceOpen(false)}
        staff={staff}
        transactions={transactions}
        config={config}
      />

      <ConsolidatedExportModal
        isOpen={consolidatedModalType !== null}
        onClose={() => setConsolidatedModalType(null)}
        type={consolidatedModalType || 'DW'}
        staff={staff}
        transactions={transactions}
        config={config}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        onResetData={handleResetData}
      />

    </div>
  );
}

export default App;
