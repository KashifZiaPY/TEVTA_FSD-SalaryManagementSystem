import React, { useState } from 'react';
import { SystemConfig } from '../types/payroll';
import { Settings, Save, RotateCcw, X, Cloud, Link2, CheckCircle2, Play, Sun, Moon } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SystemConfig;
  onSaveConfig: (updated: SystemConfig) => void;
  onResetData: () => void;
  onReplaySplash?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onResetData,
  onReplaySplash,
  theme = 'dark',
  onToggleTheme
}) => {
  const [form, setForm] = useState<SystemConfig>({ ...config });
  const [savedToast, setSavedToast] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(form);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center">
              <Settings className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-heading">System & Sync Settings</h3>
              <p className="text-xs text-slate-400">Google Sheet Backend & Financial Parameters</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {savedToast && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Settings updated successfully!
            </div>
          )}

          {/* Light / Dark Mode Appearance Switch */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                {theme === 'dark' ? <Moon className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <span>Display Appearance</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Switch between high-contrast Dark Mode and official Light Mode
              </div>
            </div>

            {onToggleTheme && (
              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700/80 shadow-inner">
                <button
                  type="button"
                  onClick={() => theme !== 'light' && onToggleTheme()}
                  className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all text-xs ${
                    theme === 'light'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => theme !== 'dark' && onToggleTheme()}
                  className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all text-xs ${
                    theme === 'dark'
                      ? 'bg-blue-600 text-white shadow-md font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  Dark
                </button>
              </div>
            )}
          </div>

          {/* Apps Script Web App URL */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
              <Cloud className="w-4 h-4" />
              <span>Google Apps Script Web App URL</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Paste the URL generated when deploying your Apps Script as a Web App (`https://script.google.com/.../exec`).
            </p>
            <div className="relative">
              <Link2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="url"
                value={form.appsScriptUrl || ''}
                onChange={(e) => setForm({ ...form, appsScriptUrl: e.target.value })}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Active Period */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Active Payroll Month</label>
              <input
                type="text"
                value={form.activeMonth}
                onChange={(e) => setForm({ ...form, activeMonth: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Period Key</label>
              <input
                type="text"
                value={form.activePeriod}
                onChange={(e) => setForm({ ...form, activePeriod: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* TEVTA Debit Bank Accounts */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Daily Wages Debit A/C</label>
              <input
                type="text"
                value={form.tevtaDwAccount}
                onChange={(e) => setForm({ ...form, tevtaDwAccount: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Visiting Staff Debit A/C</label>
              <input
                type="text"
                value={form.tevtaVisitingAccount}
                onChange={(e) => setForm({ ...form, tevtaVisitingAccount: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Standard Rates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Unskilled Daily Rate (PKR)</label>
              <input
                type="number"
                value={form.unskilledDailyRate}
                onChange={(e) => setForm({ ...form, unskilledDailyRate: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Skilled Daily Rate (PKR)</label>
              <input
                type="number"
                value={form.skilledDailyRate}
                onChange={(e) => setForm({ ...form, skilledDailyRate: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Reset Baseline Data */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset system data to official September 2026 baseline records?')) {
                    onResetData();
                    onClose();
                  }
                }}
                className="text-rose-400 hover:text-rose-300 flex items-center gap-1.5 text-xs font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Baseline Data
              </button>

              {onReplaySplash && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onReplaySplash();
                  }}
                  className="text-amber-400 hover:text-amber-300 flex items-center gap-1.5 text-xs font-semibold"
                >
                  <Play className="w-3.5 h-3.5" />
                  Startup Sequence
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow"
              >
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </button>
            </div>
          </div>

        </form>

        {/* Owner branding signature */}
        <div className="px-6 py-3 bg-slate-950/90 border-t border-slate-800 text-center text-[10px] sm:text-[11px] text-slate-400 font-mono">
          e-Salary Management System developed by <span className="text-amber-400 font-bold">MKZ</span> for District Director Office TEVTA Faisalabad & Chiniot <span className="text-blue-400 font-semibold">v1.0</span>
        </div>

      </div>
    </div>
  );
};
