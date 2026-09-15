import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { InstitutePortal } from './components/InstitutePortal';
import { AdminHub } from './components/AdminHub';
import { LoginModal } from './components/LoginModal';
import { BankAdviceModal } from './components/BankAdviceModal';
import { ConsolidatedExportModal } from './components/ConsolidatedExportModal';
import { SettingsModal } from './components/SettingsModal';
import { AnimatedSplashLogos } from './components/AnimatedSplashLogos';
import { ExecutiveBannerStrip } from './components/ExecutiveBannerStrip';
import { EmployeeManagerModal } from './components/EmployeeManagerModal';
import { StorageService, syncWithGoogleSheet, fetchLiveDataFromWebApp, syncStaffMemberToWebApp } from './services/apiService';
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
  const [isSyncingLive, setIsSyncingLive] = useState<boolean>(false);
  const [liveSyncNotification, setLiveSyncNotification] = useState<string | null>(null);

  // State from Storage Service
  const [config, setConfig] = useState<SystemConfig>(StorageService.getConfig());
  const [institutes, setInstitutes] = useState<Institute[]>(StorageService.getInstitutes());
  const [staff, setStaff] = useState<StaffMember[]>(StorageService.getStaff());
  const [transactions, setTransactions] = useState<MonthlyTransaction[]>(StorageService.getTransactions());

  // Function to load live data directly from deployed Web App URL
  const handleRefreshLiveData = async () => {
    if (!config.appsScriptUrl) return;
    setIsSyncingLive(true);
    setLiveSyncNotification('Contacting deployed Web App URL for live data...');
    try {
      const result = await fetchLiveDataFromWebApp(config.appsScriptUrl);
      if (result.success) {
        if (result.staff) {
          setStaff(result.staff);
          StorageService.saveStaff(result.staff);
        }
        if (result.transactions) {
          setTransactions(result.transactions);
          StorageService.saveTransactions(result.transactions);
        }
        if (result.institutes && result.institutes.length > 0) {
          setInstitutes(result.institutes);
          StorageService.saveInstitutes(result.institutes);
        }
        setLiveSyncNotification(result.message);
      } else {
        setLiveSyncNotification(result.message);
      }
    } catch (err: any) {
      setLiveSyncNotification(`Error fetching live data: ${err.message}`);
    } finally {
      setIsSyncingLive(false);
      setTimeout(() => setLiveSyncNotification(null), 6000);
    }
  };

  // Trigger initial live fetch if configured
  useEffect(() => {
    if (config.appsScriptUrl) {
      handleRefreshLiveData();
    }
  }, [config.appsScriptUrl]);

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
  const [isQuickAddStaffOpen, setIsQuickAddStaffOpen] = useState(false);
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

  const handleUpdateStaff = (updatedStaff: StaffMember[]) => {
    setStaff(updatedStaff);
    StorageService.saveStaff(updatedStaff);
    if (config.appsScriptUrl && updatedStaff.length > 0) {
      syncStaffMemberToWebApp(config.appsScriptUrl, updatedStaff[0], 'upsertStaff').catch(console.warn);
    }
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

  // Calculations for executive ribbon
  const currentMonthTxns = transactions.filter(t => t.payrollMonth === config.activeMonth);
  const totalMonthlyClaim = currentMonthTxns.reduce((acc, t) => acc + (t.netSalary || 0), 0);
  const submittedInstitutesCount = institutes.filter(inst => 
    currentMonthTxns.some(t => t.instituteCode === inst.code && (t.status === 'Submitted' || t.status === 'Approved'))
  ).length;

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
        
        {/* Live Web App Sync Status Alert */}
        {liveSyncNotification && (
          <div className="mb-4 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-xs flex items-center justify-between shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-ping" />
              <span>{liveSyncNotification}</span>
            </div>
            <button
              onClick={() => setLiveSyncNotification(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-semibold px-2 py-0.5 rounded"
            >
              ✕ Dismiss
            </button>
          </div>
        )}

        {/* Executive Banner Ribbon Strip */}
        <ExecutiveBannerStrip
          totalStaffCount={staff.length}
          totalInstitutesCount={institutes.length}
          submittedInstitutesCount={submittedInstitutesCount}
          totalMonthlyClaim={totalMonthlyClaim}
          config={config}
          activeRole={session.role}
          instituteName={session.instituteName}
          onQuickBankAdvice={() => setIsBankAdviceOpen(true)}
          onQuickAddEmployee={() => setIsQuickAddStaffOpen(true)}
          onRefreshLiveData={handleRefreshLiveData}
          isSyncingLive={isSyncingLive}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {activeTab === 'ADMIN' || session.role === 'DISTRICT_ADMIN' ? (
          <AdminHub
            institutes={institutes}
            staff={staff}
            transactions={transactions}
            config={config}
            onOpenBankAdvice={() => setIsBankAdviceOpen(true)}
            onOpenConsolidatedExport={(type) => setConsolidatedModalType(type)}
            onSelectInstituteView={handleSelectInstituteFromAdmin}
            onUpdateStaff={handleUpdateStaff}
          />
        ) : (
          <InstitutePortal
            institute={currentInstitute}
            staff={staff}
            transactions={transactions}
            config={config}
            onSaveTransactions={handleSaveTransactions}
            onSubmitToDD={handleSubmitToDD}
            onUpdateStaff={handleUpdateStaff}
          />
        )}
      </main>

      {/* Official Corporate Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs py-6 mt-12 print-hidden shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              District Director Office TEVTA Faisalabad & Chiniot
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline text-slate-500 dark:text-slate-400">Govt. of the Punjab</span>
          </div>

          <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
            e-Salary Management System developed by <span className="font-bold text-amber-500 dark:text-amber-400">MKZ</span> for District Director Office TEVTA Faisalabad & Chiniot <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">v1.0</span>
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

      <EmployeeManagerModal
        isOpen={isQuickAddStaffOpen}
        onClose={() => setIsQuickAddStaffOpen(false)}
        institutes={institutes}
        config={config}
        onSaveStaff={(newMember) => {
          const updated = [newMember, ...staff];
          handleUpdateStaff(updated);
        }}
      />

    </div>
  );
}

export default App;

