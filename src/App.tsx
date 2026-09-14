import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { InstitutePortal } from './components/InstitutePortal';
import { AdminHub } from './components/AdminHub';
import { LoginModal } from './components/LoginModal';
import { BankAdviceModal } from './components/BankAdviceModal';
import { ConsolidatedExportModal } from './components/ConsolidatedExportModal';
import { SettingsModal } from './components/SettingsModal';
import { AnimatedSplashLogos } from './components/AnimatedSplashLogos';
import { StorageService, syncWithGoogleSheet } from './services/apiService';
import { Institute, StaffMember, MonthlyTransaction, SystemConfig, UserSession } from './types/payroll';

export function App() {
  // Theme state: default to 'dark', with persistence in localStorage
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('tevta_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  });

  // Sync theme class to document.documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('tevta_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Startup initialization state (identical to GVTIW Executive Budget Dashboard)
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // State from Storage Service
  const [config, setConfig] = useState<SystemConfig>(StorageService.getConfig());
  const [institutes, setInstitutes] = useState<Institute[]>(StorageService.getInstitutes());
  const [staff, setStaff] = useState<StaffMember[]>(StorageService.getStaff());
  const [transactions, setTransactions] = useState<MonthlyTransaction[]>(StorageService.getTransactions());

  // Navigation & Sessions
  // Default session starts with District Director Office, Faisalabad & Chiniot
  const [session, setSession] = useState<UserSession>({
    role: 'DISTRICT_ADMIN',
    instituteCode: 'CENTRAL-DD',
    instituteName: 'Office of the District Director, TEVTA Faisalabad & Chiniot',
    district: 'Faisalabad',
    userName: 'DD Office Admin'
  });
  const [activeTab, setActiveTab] = useState<'INSTITUTE' | 'ADMIN'>('ADMIN');

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBankAdviceOpen, setIsBankAdviceOpen] = useState(false);
  const [consolidatedModalType, setConsolidatedModalType] = useState<'DW' | 'VISITING' | null>(null);

  // Initial startup timer (smooth entry experience matching the budget dashboard)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

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

  if (isInitializing) {
    return (
      <AnimatedSplashLogos
        punjabLogo="/gop-logo.png"
        tevtaLogo="/tevta-logo.png"
        officeName="Office of the District Director, TEVTA Faisalabad & Chiniot"
        darkMode={theme === 'dark'}
        onSkip={() => setIsInitializing(false)}
      />
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col font-sans transition-colors duration-150`}>
      
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
        onReplaySplash={() => setIsInitializing(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-200">
              District Director Office TEVTA Faisalabad & Chiniot
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline text-slate-400">Govt. of the Punjab</span>
          </div>

          <div className="text-xs text-slate-300 font-medium">
            e-Salary Management System developed by <span className="font-bold text-amber-400">MKZ</span> for District Director Office TEVTA Faisalabad & Chiniot <span className="font-mono text-blue-400 font-semibold">v1.0</span>
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
        onReplaySplash={() => setIsInitializing(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

    </div>
  );
}

export default App;
