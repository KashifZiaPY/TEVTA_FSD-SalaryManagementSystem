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
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand & Emblem */}
          <div className="flex items-center space-x-3.5">
            {/* Dual Logos (Govt of Punjab + TEVTA) */}
            <div className="flex items-center -space-x-2 sm:space-x-1.5 shrink-0">
              <div 
                onClick={onReplaySplash} 
                title="Government of the Punjab - Click to view initialization sequence"
                className="w-11 h-11 rounded-xl bg-white p-1 shadow-md border border-emerald-500/40 flex items-center justify-center overflow-hidden cursor-pointer hover:scale-105 transition-transform"
              >
                <PunjabGovtEmblem className="w-full h-full object-contain" />
              </div>
              <div 
                onClick={onReplaySplash} 
                title="TEVTA Punjab - Click to view initialization sequence"
                className="w-11 h-11 rounded-xl bg-white p-1 shadow-md border border-blue-500/40 flex items-center justify-center overflow-hidden cursor-pointer hover:scale-105 transition-transform"
              >
                <TevtaEmblem className="w-full h-full object-contain" />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                  Govt. of the Punjab
                </span>
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline-block">
                  District Director Office TEVTA Faisalabad & Chiniot
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold font-heading text-slate-100 tracking-tight flex items-center gap-2">
                e-Salary Management System
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-blue-300 bg-blue-950/70 px-2 py-0.5 rounded border border-blue-800/50">
                  by <strong className="text-amber-400 font-bold">MKZ</strong> • v1.0
                </span>
              </h1>
            </div>
          </div>

          {/* Navigation Controls & Role Badges */}
          <div className="flex items-center space-x-3">
            {/* Active Month Indicator */}
            <div className="hidden lg:flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="font-semibold text-slate-200">{activeMonth}</span>
            </div>

            {/* View Switcher (Admin Mode) */}
            {session.role === 'DISTRICT_ADMIN' && (
              <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
                <button
                  onClick={() => setActiveTab('ADMIN')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === 'ADMIN'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  DD Executive Hub
                </button>
                <button
                  onClick={() => setActiveTab('INSTITUTE')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === 'INSTITUTE'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  Institute Portal
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
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg shadow-md transition-all flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Institute / Admin Login
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="hidden md:block text-right">
                  <div className="text-xs font-semibold text-slate-200 flex items-center justify-end gap-1">
                    {session.role === 'DISTRICT_ADMIN' ? (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" /> DD Office Admin
                      </span>
                    ) : (
                      <span>{session.instituteName || session.userName}</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Code: {session.instituteCode || 'Central'}
                  </div>
                </div>

                <button
                  onClick={onOpenSettings}
                  title="System Settings & Google Sheet Sync"
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
                >
                  <Settings className="w-4 h-4" />
                </button>

                <button
                  onClick={onLogout}
                  title="Logout Session"
                  className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors border border-transparent hover:border-rose-900/50"
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
