import React from 'react';
import { 
  Building2, Users, FileCheck2, Shield, Calendar, ArrowUpRight, 
  Sparkles, CheckCircle, Clock, Landmark, Cloud, RefreshCw
} from 'lucide-react';
import { formatPKR } from '../utils/currencyWords';
import { SystemConfig } from '../types/payroll';
import { PunjabGovtEmblem } from './Emblems';

interface ExecutiveBannerStripProps {
  totalStaffCount: number;
  totalInstitutesCount: number;
  submittedInstitutesCount: number;
  totalMonthlyClaim: number;
  config: SystemConfig;
  activeRole: 'INSTITUTE' | 'DISTRICT_ADMIN' | 'GUEST';
  instituteName?: string;
  onQuickBankAdvice?: () => void;
  onQuickAddEmployee?: () => void;
  onRefreshLiveData?: () => void;
  isSyncingLive?: boolean;
  onOpenSettings?: () => void;
}

export const ExecutiveBannerStrip: React.FC<ExecutiveBannerStripProps> = ({
  totalStaffCount,
  totalInstitutesCount,
  submittedInstitutesCount,
  totalMonthlyClaim,
  config,
  activeRole,
  instituteName,
  onQuickBankAdvice,
  onQuickAddEmployee,
  onRefreshLiveData,
  isSyncingLive,
  onOpenSettings
}) => {
  const percentComplete = Math.round((submittedInstitutesCount / (totalInstitutesCount || 1)) * 100);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-800/40 text-white shadow-xl mb-6 p-4 sm:p-6">
      {/* Background Subtle Corporate Accents */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-5 sm:gap-6">
        
        {/* Left Headline & Scope with GOP Emblem to the right of the heading */}
        <div className="space-y-2 min-w-0 max-w-2xl flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Shield className="w-3 h-3 text-indigo-400" />
              Multi-National Enterprise Architecture
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-800/60">
              <CheckCircle className="w-3 h-3 text-emerald-400" /> BOP Automated Clearing
            </span>
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              Faisalabad & Chiniot District Director Hub
            </span>
          </div>

          {/* Main Top Banner Heading with GOP Emblem on the Right */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold font-heading tracking-tight text-white">
              e-Salary Central Disbursal & Employee Management
            </h2>

            {/* GOP Emblem positioned to the RIGHT of the main top banner heading */}
            <div 
              title="Government of the Punjab Emblem"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white p-1.5 shadow-md border border-emerald-400/40 flex items-center justify-center shrink-0 hover:scale-105 transition-transform"
            >
              <PunjabGovtEmblem className="w-full h-full object-contain" />
            </div>
          </div>
          
          <p className="text-xs text-indigo-200/80 leading-relaxed">
            {activeRole === 'DISTRICT_ADMIN' ? (
              <span>Unified payroll administration for <strong className="text-white font-semibold">{totalInstitutesCount} Technical Institutes</strong> across District Faisalabad & Chiniot.</span>
            ) : (
              <span>Active Campus Node: <strong className="text-white font-semibold">{instituteName || 'Campus Portal'}</strong> • Direct BOP e-Advice clearance.</span>
            )}
          </p>
        </div>

        {/* Right KPIs & Quick Enterprise Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          
          {/* Quick Metrics Capsule */}
          <div className="flex items-center gap-4 bg-slate-950/60 backdrop-blur-md px-4 py-2.5 rounded-xl border border-indigo-800/50 shadow-inner">
            <div className="text-left">
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Total Month Disbursal
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-emerald-400">
                Rs. {formatPKR(totalMonthlyClaim)}
              </div>
            </div>

            <div className="h-8 w-px bg-slate-800" />

            <div className="text-left">
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Staff Registry
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-indigo-300">
                {totalStaffCount} <span className="text-xs text-slate-400 font-normal">Active</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons & Live Web App Sync */}
          <div className="flex items-center gap-2">
            {config.appsScriptUrl ? (
              <button
                type="button"
                onClick={onRefreshLiveData}
                disabled={isSyncingLive}
                title="Fetch live records from deployed Web App"
                className="bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-emerald-400/40 shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingLive ? 'animate-spin' : ''}`} />
                <span>{isSyncingLive ? 'Syncing...' : 'Fetch Live Data'}</span>
              </button>
            ) : onOpenSettings ? (
              <button
                type="button"
                onClick={onOpenSettings}
                title="Configure Google Apps Script Deployed Web App URL for live cloud sync"
                className="bg-slate-900/80 hover:bg-slate-800 text-indigo-300 text-xs font-medium px-3.5 py-2.5 rounded-xl border border-indigo-500/30 transition-all flex items-center gap-1.5"
              >
                <Cloud className="w-3.5 h-3.5 text-indigo-400" />
                <span>Connect Live Web App</span>
              </button>
            ) : null}

            {onQuickAddEmployee && (
              <button
                type="button"
                onClick={onQuickAddEmployee}
                className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
              >
                <Users className="w-4 h-4" />
                <span>+ Add Employee</span>
              </button>
            )}

            {onQuickBankAdvice && (
              <button
                type="button"
                onClick={onQuickBankAdvice}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
              >
                <Landmark className="w-4 h-4" />
                <span>BOP Advice</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Mini Progress Strip */}
      <div className="mt-4 pt-3 border-t border-indigo-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-indigo-200/70">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-mono text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Cycle: <strong>{config.activeMonth}</strong>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> Cut-off: {config.submissionDeadline}
          </span>
          {config.appsScriptUrl && (
            <>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Web App Connected
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 font-mono">
          <span>Institutes Compliance:</span>
          <span className="font-bold text-emerald-400">{submittedInstitutesCount}/{totalInstitutesCount} ({percentComplete}%)</span>
          <div className="w-20 bg-slate-900 rounded-full h-1.5 overflow-hidden border border-indigo-800/60 inline-block">
            <div className="bg-emerald-400 h-full rounded-full transition-all" style={{ width: `${percentComplete}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};
