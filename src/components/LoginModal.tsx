import React, { useState } from 'react';
import { Institute, UserSession } from '../types/payroll';
import { Lock, Building2, Shield, KeyRound, X, CheckCircle } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutes: Institute[];
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  institutes,
  onLoginSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'INSTITUTE' | 'ADMIN'>('INSTITUTE');
  const [selectedCode, setSelectedCode] = useState('33028');
  const [pin, setPin] = useState('3302');
  const [adminPin, setAdminPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleInstituteLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const inst = institutes.find(i => i.code === selectedCode);
    if (!inst) {
      setErrorMsg('Institute Code not recognized.');
      return;
    }

    if (inst.pin !== pin) {
      setErrorMsg('Invalid PIN. Please check with the Principal or DD Office.');
      return;
    }

    onLoginSuccess({
      role: 'INSTITUTE',
      instituteCode: inst.code,
      instituteName: inst.name,
      district: inst.district,
      userName: `${inst.shortName} In-Charge`
    });
    onClose();
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Admin Master PIN standard (7101 or admin)
    if (adminPin === '7101' || adminPin.toLowerCase() === 'admin') {
      onLoginSuccess({
        role: 'DISTRICT_ADMIN',
        userName: 'District Director (TEVTA) Admin',
        district: 'Faisalabad & Chiniot'
      });
      onClose();
    } else {
      setErrorMsg('Invalid Executive Administrative PIN. Authorized personnel only.');
    }
  };

  const handleQuickInstitutePick = (code: string, defaultPin: string) => {
    setSelectedCode(code);
    setPin(defaultPin);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900/60 via-slate-800 to-emerald-900/60 p-6 border-b border-slate-800 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center">
              <Lock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-heading">Secure Access Gateway</h2>
              <p className="text-xs text-slate-400">District Director Office TEVTA Faisalabad & Chiniot</p>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex bg-slate-950/60 p-1 rounded-xl mt-5 border border-slate-700/60 text-xs">
            <button
              onClick={() => { setActiveTab('INSTITUTE'); setErrorMsg(''); }}
              className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'INSTITUTE'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Institute Login
            </button>
            <button
              onClick={() => { setActiveTab('ADMIN'); setErrorMsg(''); }}
              className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'ADMIN'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              District Director Hub
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <span className="font-bold">⚠️ Error:</span> {errorMsg}
            </div>
          )}

          {activeTab === 'INSTITUTE' ? (
            <form onSubmit={handleInstituteLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Your Institute
                </label>
                <select
                  value={selectedCode}
                  onChange={(e) => {
                    const inst = institutes.find(i => i.code === e.target.value);
                    if (inst) handleQuickInstitutePick(inst.code, inst.pin);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {institutes.map(inst => (
                    <option key={inst.code} value={inst.code}>
                      [{inst.code}] {inst.name} ({inst.district})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Security PIN / Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter 4-digit PIN"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Default Demo PIN for {selectedCode}: <span className="font-mono text-emerald-400">{institutes.find(i => i.code === selectedCode)?.pin || '1234'}</span>
                </p>
              </div>

              {/* Quick Institute Chips */}
              <div className="pt-1">
                <div className="text-[11px] font-semibold text-slate-400 mb-1.5">Quick Demo Picks:</div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickInstitutePick('33028', '3302')}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  >
                    GVITW Samanabad (33028)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickInstitutePick('33010', '5412')}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  >
                    GATC Faisalabad (33010)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickInstitutePick('34001', '4102')}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  >
                    GTTI Chiniot (34001)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-2.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
              >
                <CheckCircle className="w-4 h-4" />
                Authenticate & Open Institute Portal
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-3 text-xs text-amber-300">
                District Director Central Management Hub. Grants full oversight across all 26+ institutes, audit alerts, and consolidated proforma generation.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  District Executive PIN
                </label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-amber-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    placeholder="Enter Master PIN (e.g. 7101)"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Authorized DD Executive PIN: <span className="font-mono text-amber-400">7101</span>
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold py-2.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
              >
                <Shield className="w-4 h-4" />
                Access District Executive Hub
              </button>
            </form>
          )}
        </div>

        {/* Owner branding signature */}
        <div className="px-6 py-3 bg-slate-950/90 border-t border-slate-800 text-center text-[10px] sm:text-[11px] text-slate-400 font-mono">
          e-Salary Management System developed by <span className="text-amber-400 font-bold">MKZ</span> for District Director Office TEVTA Faisalabad & Chiniot <span className="text-blue-400 font-semibold">v1.0</span>
        </div>

      </div>
    </div>
  );
};
