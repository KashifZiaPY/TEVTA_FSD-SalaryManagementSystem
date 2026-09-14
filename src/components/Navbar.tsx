import React from 'react';
import { UserSession } from '../types/payroll';
import { Building2, Shield, Calendar, LogOut, Settings, Award } from 'lucide-react';

interface NavbarProps {
  session: UserSession;
  activeMonth: string;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  activeTab: 'INSTITUTE' | 'ADMIN';
  setActiveTab: (tab: 'INSTITUTE' | 'ADMIN') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  session,
  activeMonth,
  onOpenLogin,
  onLogout,
  onOpenSettings,
  activeTab,
  setActiveTab
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand & Emblem */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-emerald-500 p-0.5 shadow-lg shadow-blue-900/30 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Building2 className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                  Govt. of the Punjab
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  District Faisalabad & Chiniot
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold font-heading text-slate-100 tracking-tight flex items-center gap-2">
                TEVTA Salary Management System
                <span className="hidden md:inline-block text-xs font-normal text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
                  SMS-DES v1.0
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
