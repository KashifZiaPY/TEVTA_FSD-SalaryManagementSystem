import React from 'react';
import { UserSession } from '../types/payroll';
import { Building2, Shield, Calendar, LogOut, Settings, Award, RefreshCw, Sun, Moon } from 'lucide-react';
import { PunjabGovtEmblem, TevtaEmblem } from './Emblems';

interface NavbarProps {
  session: UserSession;
  activeMonth: string;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  activeTab: 'INSTITUTE' | 'ADMIN';
  setActiveTab: (tab: 'INSTITUTE' | 'ADMIN') => void;
  onReplaySplash?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  session,
  activeMonth,
  onOpenLogin,
  onLogout,
  onOpenSettings,
  activeTab,
  setActiveTab,
  onReplaySplash,
  theme = 'dark',
  onToggleTheme
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between min-h-[4.25rem] py-2 gap-3">
          
          {/* Top Headings with TEVTA Emblem on the Right */}
          <div className="flex items-center gap-3 min-w-0 shrink">
            {/* Entity Title & Identity */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/60 shrink-0">
                  TEVTA Punjab
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60 shrink-0">
                  Govt. of the Punjab
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono hidden xl:inline-block truncate">
                  District Director Office Faisalabad & Chiniot
                </span>
              </div>
              <h1 className="text-sm sm:text-base lg:text-lg font-bold font-heading text-slate-900 dark:text-slate-100 tracking-tight flex flex-wrap items-center gap-1.5">
                <span className="truncate">e-Salary Management System</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/50 shrink-0">
                  by <strong className="text-amber-600 dark:text-amber-400 font-bold">MKZ</strong> • v1.0
                </span>
              </h1>
            </div>

            {/* TEVTA Emblem - positioned on the RIGHT side of top headings */}
            <div 
              onClick={onReplaySplash} 
              title="TEVTA Punjab - Click to view initialization sequence"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white p-1.5 shadow-sm border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 transition-transform"
            >
              <TevtaEmblem className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Navigation Controls & Role Badges */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-auto">
            {/* Active Month Indicator */}
            <div className="hidden md:flex items-center space-x-2 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="font-semibold text-slate-900 dark:text-slate-200">{activeMonth}</span>
            </div>

            {/* View Switcher (Admin Mode) */}
            {session.role === 'DISTRICT_ADMIN' && (
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  onClick={() => setActiveTab('ADMIN')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                    activeTab === 'ADMIN'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">DD Executive</span> Hub
                </button>
                <button
                  onClick={() => setActiveTab('INSTITUTE')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                    activeTab === 'INSTITUTE'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Institute</span> Portal
                </button>
              </div>
            )}

            {/* Light / Dark Mode Switcher Button */}
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className={`p-2 rounded-lg transition-all border flex items-center gap-1.5 text-xs font-semibold ${
                  theme === 'dark'
                    ? 'text-amber-400 hover:text-amber-300 bg-slate-800/80 hover:bg-slate-700/80 border-slate-700'
                    : 'text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-300 shadow-sm'
                }`}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="hidden sm:inline-block">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-slate-700 shrink-0" />
                    <span className="hidden sm:inline-block text-slate-700">Dark</span>
                  </>
                )}
              </button>
            )}

            {/* User Session Profile & Login Button */}
            {session.role === 'GUEST' ? (
              <button
                onClick={onOpenLogin}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <Shield className="w-4 h-4" />
                <span>Login</span>
              </button>
            ) : (
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <div className="hidden md:block text-right">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-end gap-1">
                    {session.role === 'DISTRICT_ADMIN' ? (
                      <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" /> DD Admin
                      </span>
                    ) : (
                      <span className="truncate max-w-[150px]">{session.instituteName || session.userName}</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    Code: {session.instituteCode || 'Central'}
                  </div>
                </div>

                <button
                  onClick={onOpenSettings}
                  title="System Settings & Google Sheet Sync"
                  className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <Settings className="w-4 h-4" />
                </button>

                <button
                  onClick={onLogout}
                  title="Logout Session"
                  className="p-2 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
