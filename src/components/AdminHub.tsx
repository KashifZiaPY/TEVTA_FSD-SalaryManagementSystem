import React, { useState } from 'react';
import { Institute, StaffMember, MonthlyTransaction, SystemConfig } from '../types/payroll';
import { formatPKR } from '../utils/currencyWords';
import { runComplianceAudit } from '../utils/auditEngine';
import { 
  Building2, Users, FileText, CheckCircle2, Clock, AlertTriangle, 
  Send, ExternalLink, Download, FileSpreadsheet, Eye, MessageCircle, ShieldAlert
} from 'lucide-react';

interface AdminHubProps {
  institutes: Institute[];
  staff: StaffMember[];
  transactions: MonthlyTransaction[];
  config: SystemConfig;
  onOpenBankAdvice: () => void;
  onOpenConsolidatedExport: (type: 'DW' | 'VISITING') => void;
  onSelectInstituteView: (instituteCode: string) => void;
}

export const AdminHub: React.FC<AdminHubProps> = ({
  institutes,
  staff,
  transactions,
  config,
  onOpenBankAdvice,
  onOpenConsolidatedExport,
  onSelectInstituteView
}) => {
  const [districtFilter, setDistrictFilter] = useState<'ALL' | 'Faisalabad' | 'Chiniot'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculations
  const currentMonthTxns = transactions.filter(t => t.payrollMonth === config.activeMonth);
  const dwTxns = currentMonthTxns.filter(t => t.staffType === 'Daily Wages');
  const visTxns = currentMonthTxns.filter(t => t.staffType === 'Visiting Faculty');

  const totalDwAmount = dwTxns.reduce((acc, t) => acc + (t.netSalary || 0), 0);
  const totalVisAmount = visTxns.reduce((acc, t) => acc + (t.netSalary || 0), 0);
  const grandTotalDistrict = totalDwAmount + totalVisAmount;

  // Institutes telemetry
  const instituteStats = institutes.map(inst => {
    const instTxns = currentMonthTxns.filter(t => t.instituteCode === inst.code);
    const instStaff = staff.filter(s => s.instituteCode === inst.code);
    const totalClaim = instTxns.reduce((acc, t) => acc + (t.netSalary || 0), 0);
    const isSubmitted = instTxns.length > 0 && instTxns.some(t => t.status === 'Submitted' || t.status === 'Approved');
    const isDraft = instTxns.length > 0 && !isSubmitted;

    return {
      ...inst,
      staffCount: instStaff.length,
      dwCount: instStaff.filter(s => s.staffType === 'Daily Wages').length,
      visCount: instStaff.filter(s => s.staffType === 'Visiting Faculty').length,
      totalClaim,
      status: isSubmitted ? 'Submitted' : (isDraft ? 'Draft' : 'Pending'),
      lastUpdated: instTxns[0]?.submittedAt || 'Not started'
    };
  });

  const filteredInstitutes = instituteStats.filter(i => {
    const matchesDistrict = districtFilter === 'ALL' || i.district === districtFilter;
    const matchesSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.code.includes(searchQuery);
    return matchesDistrict && matchesSearch;
  });

  const submittedCount = instituteStats.filter(i => i.status === 'Submitted').length;
  const submissionPercent = Math.round((submittedCount / (institutes.length || 1)) * 100);

  // Compliance Audit Alerts
  const auditAlerts = runComplianceAudit(staff, currentMonthTxns);

  return (
    <div className="space-y-8">
      
      {/* Executive Command Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-md border border-amber-800/60">
                DISTRICT DIRECTOR EXECUTIVE HUB
              </span>
              <span className="text-xs text-slate-400 font-mono">
                TEVTA Faisalabad & Chiniot
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading tracking-tight">
              Monthly Salary Disbursal Control Center
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Active Processing Cycle: <strong className="text-emerald-400">{config.activeMonth}</strong> | Deadline: {config.submissionDeadline}
            </p>
          </div>

          {/* Quick 1-Click Action Export Tools */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenBankAdvice}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              BOP Bank Advice & Cheque Letter
            </button>
            <button
              onClick={() => onOpenConsolidatedExport('DW')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Consolidated DW Proforma
            </button>
            <button
              onClick={() => onOpenConsolidatedExport('VISITING')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-teal-400" />
              Consolidated Visiting Proforma
            </button>
          </div>
        </div>

        {/* Executive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 shadow">
            <div className="text-slate-400 text-xs font-semibold">Total District Liability</div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-heading mt-1">
              Rs. {formatPKR(grandTotalDistrict)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              For {staff.length} Non-Regular Staff
            </div>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 shadow">
            <div className="text-slate-400 text-xs font-semibold">Daily Wages Debit Account</div>
            <div className="text-lg sm:text-xl font-bold text-blue-400 font-heading mt-1">
              Rs. {formatPKR(totalDwAmount)}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              A/C: {config.tevtaDwAccount}
            </div>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 shadow">
            <div className="text-slate-400 text-xs font-semibold">Visiting Honorarium Debit A/C</div>
            <div className="text-lg sm:text-xl font-bold text-teal-400 font-heading mt-1">
              Rs. {formatPKR(totalVisAmount)}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              A/C: {config.tevtaVisitingAccount}
            </div>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 shadow">
            <div className="flex justify-between items-center text-slate-400 text-xs font-semibold">
              <span>Institutes Submitted</span>
              <span className="text-white font-mono">{submittedCount} / {institutes.length}</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-2">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${submissionPercent}%` }} 
              />
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1">
              {submissionPercent}% Reporting Complete
            </div>
          </div>

        </div>

      </div>

      {/* Compliance & Audit Alerts Section */}
      {auditAlerts.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center space-x-2 text-amber-400 font-heading font-bold text-sm mb-3">
            <ShieldAlert className="w-4 h-4" />
            <span>Statutory Compliance & Audit Watchlist ({auditAlerts.length} Flagged Items)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {auditAlerts.map(alert => (
              <div 
                key={alert.id}
                className={`p-3 rounded-xl border flex items-start space-x-3 ${
                  alert.type === 'DANGER' 
                    ? 'bg-rose-950/40 border-rose-800/60 text-rose-200' 
                    : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                }`}
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                <div>
                  <div className="font-semibold">{alert.title}</div>
                  <div className="text-[11px] opacity-90 mt-0.5">{alert.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Institute Submissions Telemetry Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        
        {/* Table Filters & Actions */}
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white font-heading">
              Campuses & Institutes Submission Status ({filteredInstitutes.length})
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* District Filter Buttons */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setDistrictFilter('ALL')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  districtFilter === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Districts ({institutes.length})
              </button>
              <button
                onClick={() => setDistrictFilter('Faisalabad')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  districtFilter === 'Faisalabad' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Faisalabad
              </button>
              <button
                onClick={() => setDistrictFilter('Chiniot')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  districtFilter === 'Chiniot' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Chiniot
              </button>
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search institute name or code..."
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-52"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="table-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Institute Name</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4 text-center">DW Staff</th>
                <th className="py-3 px-4 text-center">Visiting</th>
                <th className="py-3 px-4 text-right">Claim Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredInstitutes.map((inst) => (
                <tr key={inst.code} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-blue-400">{inst.code}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-200">{inst.name}</div>
                    <div className="text-[11px] text-slate-400">Principal: {inst.principalName} ({inst.contactMobile})</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                      {inst.district}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-300">{inst.dwCount}</td>
                  <td className="py-3 px-4 text-center font-mono text-slate-300">{inst.visCount}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                    Rs. {formatPKR(inst.totalClaim)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {inst.status === 'Submitted' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Submitted
                      </span>
                    ) : inst.status === 'Draft' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-950/70 border border-amber-800/60 px-2.5 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" /> In Progress
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-950/70 border border-rose-800/60 px-2.5 py-0.5 rounded-full">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => onSelectInstituteView(inst.code)}
                        title="Review / Open Institute Portal"
                        className="p-1.5 rounded-lg bg-blue-950/60 text-blue-400 hover:bg-blue-900/60 border border-blue-800/50 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {inst.status !== 'Submitted' && (
                        <a
                          href={`https://wa.me/${inst.contactMobile.replace(/[^0-9]/g, '')}?text=Dear%20Principal%20${encodeURIComponent(inst.name)},%20please%20submit%20the%20Daily%20Wages%20and%20Visiting%20Staff%20monthly%20salary%20bill%20for%20${encodeURIComponent(config.activeMonth)}%20via%20the%20TEVTA%20portal.`}
                          target="_blank"
                          rel="noreferrer"
                          title="Send WhatsApp Reminder"
                          className="p-1.5 rounded-lg bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900/60 border border-emerald-800/50 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
