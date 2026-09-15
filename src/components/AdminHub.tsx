import React, { useState } from 'react';
import { Institute, StaffMember, MonthlyTransaction, SystemConfig } from '../types/payroll';
import { formatPKR } from '../utils/currencyWords';
import { runComplianceAudit } from '../utils/auditEngine';
import { EmployeeManagerModal } from './EmployeeManagerModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { 
  Building2, Users, FileText, CheckCircle2, Clock, AlertTriangle, 
  Send, ExternalLink, Download, FileSpreadsheet, Eye, MessageCircle, ShieldAlert,
  Search, Plus, Edit, Trash2, LayoutGrid, List, Filter, Landmark, UserCheck
} from 'lucide-react';

interface AdminHubProps {
  institutes: Institute[];
  staff: StaffMember[];
  transactions: MonthlyTransaction[];
  config: SystemConfig;
  onOpenBankAdvice: () => void;
  onOpenConsolidatedExport: (type: 'DW' | 'VISITING') => void;
  onSelectInstituteView: (instituteCode: string) => void;
  onUpdateStaff?: (staff: StaffMember[]) => void;
}

export const AdminHub: React.FC<AdminHubProps> = ({
  institutes,
  staff,
  transactions,
  config,
  onOpenBankAdvice,
  onOpenConsolidatedExport,
  onSelectInstituteView,
  onUpdateStaff
}) => {
  const [districtFilter, setDistrictFilter] = useState<'ALL' | 'Faisalabad' | 'Chiniot'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAdminTab, setActiveAdminTab] = useState<'CAMPUSES' | 'STAFF_DIRECTORY' | 'AUDIT_WATCHLIST'>('CAMPUSES');
  const [staffTypeFilter, setStaffTypeFilter] = useState<'ALL' | 'Daily Wages' | 'Visiting Faculty'>('ALL');
  const [selectedInstituteFilter, setSelectedInstituteFilter] = useState<string>('ALL');

  // Employee CRUD Modal States
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [selectedStaffForEdit, setSelectedStaffForEdit] = useState<StaffMember | null>(null);
  const [selectedStaffForDelete, setSelectedStaffForDelete] = useState<StaffMember | null>(null);

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

  // Filtered staff for District Directory
  const filteredDistrictStaff = staff.filter(stf => {
    const matchesType = staffTypeFilter === 'ALL' || stf.staffType === staffTypeFilter;
    const matchesInst = selectedInstituteFilter === 'ALL' || stf.instituteCode === selectedInstituteFilter;
    const matchesSearch = 
      stf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stf.cnic.includes(searchQuery) ||
      stf.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (stf.instituteName && stf.instituteName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesInst && matchesSearch;
  });

  // Employee CRUD handlers
  const handleOpenAddEmployee = () => {
    setSelectedStaffForEdit(null);
    setIsEmployeeModalOpen(true);
  };

  const handleOpenEditEmployee = (member: StaffMember) => {
    setSelectedStaffForEdit(member);
    setIsEmployeeModalOpen(true);
  };

  const handleSaveEmployee = (newOrUpdatedMember: StaffMember) => {
    const exists = staff.some(s => s.id === newOrUpdatedMember.id);
    let updatedStaffList: StaffMember[];
    if (exists) {
      updatedStaffList = staff.map(s => s.id === newOrUpdatedMember.id ? newOrUpdatedMember : s);
    } else {
      updatedStaffList = [newOrUpdatedMember, ...staff];
    }
    if (onUpdateStaff) {
      onUpdateStaff(updatedStaffList);
    }
  };

  const handleDeleteEmployee = (staffId: string) => {
    const updatedStaffList = staff.filter(s => s.id !== staffId);
    if (onUpdateStaff) {
      onUpdateStaff(updatedStaffList);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Executive Command Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 sm:gap-6 relative z-10">
          <div className="min-w-0 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800/60">
                DISTRICT DIRECTOR EXECUTIVE HUB
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                TEVTA Faisalabad & Chiniot
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white font-heading tracking-tight">
              Monthly Salary Disbursal & Operations Control Center
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span>Active Processing Cycle: <strong className="text-indigo-600 dark:text-indigo-400">{config.activeMonth}</strong></span>
              <span>•</span>
              <span>Statutory Deadline: <strong className="text-slate-700 dark:text-slate-300">{config.submissionDeadline}</strong></span>
            </p>
          </div>

          {/* Quick 1-Click Action Export & CRUD Tools */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              onClick={handleOpenAddEmployee}
              className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs sm:text-sm px-3.5 sm:px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 sm:gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Employee</span>
            </button>

            <button
              onClick={onOpenBankAdvice}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm px-3.5 sm:px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 sm:gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>BOP Bank Advice</span>
            </button>

            <button
              onClick={() => onOpenConsolidatedExport('DW')}
              className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-semibold text-xs sm:text-sm px-3.5 sm:px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 sm:gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Consolidated DW</span>
            </button>

            <button
              onClick={() => onOpenConsolidatedExport('VISITING')}
              className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-semibold text-xs sm:text-sm px-3.5 sm:px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 sm:gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Visiting Sheet</span>
            </button>
          </div>
        </div>

        {/* Executive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          
          <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Total District Liability</div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-heading mt-1">
              Rs. {formatPKR(grandTotalDistrict)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              For {staff.length} Non-Regular Staff
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Daily Wages Debit Account</div>
            <div className="text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-400 font-heading mt-1">
              Rs. {formatPKR(totalDwAmount)}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1 truncate">
              A/C: {config.tevtaDwAccount}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Visiting Honorarium Debit A/C</div>
            <div className="text-lg sm:text-xl font-bold text-teal-600 dark:text-teal-400 font-heading mt-1">
              Rs. {formatPKR(totalVisAmount)}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1 truncate">
              A/C: {config.tevtaVisitingAccount}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-xs font-semibold">
              <span>Campuses Submitted</span>
              <span className="text-slate-900 dark:text-white font-mono font-bold">{submittedCount} / {institutes.length}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mt-2">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${submissionPercent}%` }} 
              />
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              {submissionPercent}% Monthly Reports Received
            </div>
          </div>

        </div>

      </div>

      {/* Admin Module Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveAdminTab('CAMPUSES')}
          className={`px-5 py-3 border-b-2 transition-all flex items-center gap-2 ${
            activeAdminTab === 'CAMPUSES'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Campuses & Institutes Matrix ({institutes.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('STAFF_DIRECTORY')}
          className={`px-5 py-3 border-b-2 transition-all flex items-center gap-2 ${
            activeAdminTab === 'STAFF_DIRECTORY'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Central District Staff Directory ({staff.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('AUDIT_WATCHLIST')}
          className={`px-5 py-3 border-b-2 transition-all flex items-center gap-2 ${
            activeAdminTab === 'AUDIT_WATCHLIST'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <span>Statutory Audit & 89-Day Compliance ({auditAlerts.length})</span>
        </button>
      </div>

      {/* Tab 1: Campuses Submissions Matrix */}
      {activeAdminTab === 'CAMPUSES' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          
          {/* Table Filters & Actions */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Institutes Submission Telemetry ({filteredInstitutes.length})
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* District Filter Buttons */}
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setDistrictFilter('ALL')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    districtFilter === 'ALL' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All ({institutes.length})
                </button>
                <button
                  onClick={() => setDistrictFilter('Faisalabad')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    districtFilter === 'Faisalabad' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Faisalabad
                </button>
                <button
                  onClick={() => setDistrictFilter('Chiniot')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    districtFilter === 'Chiniot' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Chiniot
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search campus code or name..."
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-52"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="table-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
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
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {filteredInstitutes.map((inst) => (
                  <tr key={inst.code} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{inst.code}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-200">{inst.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Principal: {inst.principalName} ({inst.contactMobile})</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {inst.district}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-700 dark:text-slate-300">{inst.dwCount}</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-700 dark:text-slate-300">{inst.visCount}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      Rs. {formatPKR(inst.totalClaim)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {inst.status === 'Submitted' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Submitted
                        </span>
                      ) : inst.status === 'Draft' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800/60 px-2.5 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" /> In Progress
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800/60 px-2.5 py-0.5 rounded-full">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => onSelectInstituteView(inst.code)}
                          title="Review / Open Institute Portal"
                          className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/50 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {inst.status !== 'Submitted' && (
                          <a
                            href={`https://wa.me/${inst.contactMobile.replace(/[^0-9]/g, '')}?text=Dear%20Principal%20${encodeURIComponent(inst.name)},%20please%20submit%20the%20Daily%20Wages%20and%20Visiting%20Staff%20monthly%20salary%20bill%20for%20${encodeURIComponent(config.activeMonth)}%20via%20the%20TEVTA%20portal.`}
                            target="_blank"
                            rel="noreferrer"
                            title="Send WhatsApp Reminder"
                            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/50 transition-colors"
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
      )}

      {/* Tab 2: Central District Staff Directory (CRUD Management) */}
      {activeAdminTab === 'STAFF_DIRECTORY' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Central District Non-Regular Employees Registry ({filteredDistrictStaff.length})</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage, onboard, edit and monitor employee profile pictures and bank details across all campuses.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={selectedInstituteFilter}
                onChange={(e) => setSelectedInstituteFilter(e.target.value)}
                className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Institutes ({institutes.length})</option>
                {institutes.map(inst => (
                  <option key={inst.code} value={inst.code}>{inst.code} - {inst.shortName}</option>
                ))}
              </select>

              <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setStaffTypeFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    staffTypeFilter === 'ALL' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStaffTypeFilter('Daily Wages')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    staffTypeFilter === 'Daily Wages' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Daily Wages
                </button>
                <button
                  onClick={() => setStaffTypeFilter('Visiting Faculty')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    staffTypeFilter === 'Visiting Faculty' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Visiting
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search staff, CNIC..."
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-48"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              </div>

              <button
                onClick={handleOpenAddEmployee}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Employee</span>
              </button>
            </div>
          </div>

          <div className="table-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Campus / Institute</th>
                  <th className="py-3 px-4">CNIC & Category</th>
                  <th className="py-3 px-4">Stream & Scale</th>
                  <th className="py-3 px-4">Statutory Rate</th>
                  <th className="py-3 px-4">BOP Account Number</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {filteredDistrictStaff.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-indigo-400" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">No employees in district registry yet.</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Live data can be captured directly from your deployed Web App URL or entered manually.</p>
                      <button
                        onClick={handleOpenAddEmployee}
                        className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add New Employee</span>
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredDistrictStaff.map((staffMember) => (
                  <tr key={staffMember.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    
                    {/* Employee Profile */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shrink-0">
                          {staffMember.photoUrl ? (
                            <img src={staffMember.photoUrl} alt={staffMember.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                              {staffMember.name[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {staffMember.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {staffMember.designation}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Campus */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {staffMember.instituteName || staffMember.instituteCode}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        EMIS: {staffMember.instituteCode}
                      </div>
                    </td>

                    {/* CNIC */}
                    <td className="py-3 px-4 font-mono">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{staffMember.cnic}</div>
                      <span className="text-[10px] text-slate-500">{staffMember.category}</span>
                    </td>

                    {/* Stream */}
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        staffMember.staffType === 'Daily Wages'
                          ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60'
                          : 'bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60'
                      }`}>
                        {staffMember.staffType}
                      </span>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">BPS-{staffMember.bps}</div>
                    </td>

                    {/* Rates */}
                    <td className="py-3 px-4 font-mono">
                      {staffMember.staffType === 'Daily Wages' ? (
                        <span className="font-bold text-slate-900 dark:text-emerald-400">Rs. {formatPKR(staffMember.dailyRate)} / day</span>
                      ) : (
                        <span className="text-[11px] text-teal-600 dark:text-teal-400 font-bold">Th: Rs. {staffMember.theoryHourlyRate} • Pr: Rs. {staffMember.practicalHourlyRate}</span>
                      )}
                    </td>

                    {/* BOP Account */}
                    <td className="py-3 px-4 font-mono">
                      <div className="text-slate-800 dark:text-slate-200 font-semibold">{staffMember.bankAccount}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{staffMember.bankBranch}</div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                        {staffMember.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => handleOpenEditEmployee(staffMember)}
                          title="Edit Profile"
                          className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/50 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedStaffForDelete(staffMember)}
                          title="Delete Employee"
                          className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                )))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Tab 3: Compliance & Statutory Audit Alerts Section */}
      {activeAdminTab === 'AUDIT_WATCHLIST' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-heading font-bold text-sm mb-3">
            <ShieldAlert className="w-4 h-4" />
            <span>Statutory Compliance & Audit Watchlist ({auditAlerts.length} Flagged Items)</span>
          </div>
          {auditAlerts.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">All staff records pass statutory validation rules.</p>
              <p className="text-xs text-slate-400 mt-1">No 89-day breach or duplicate CNICs detected.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {auditAlerts.map(alert => (
                <div 
                  key={alert.id}
                  className={`p-3.5 rounded-xl border flex items-start space-x-3 ${
                    alert.type === 'DANGER' 
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200' 
                      : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
                  <div>
                    <div className="font-semibold">{alert.title}</div>
                    <div className="text-[11px] opacity-90 mt-0.5">{alert.message}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Employee Manager Modal for Adding/Editing */}
      <EmployeeManagerModal
        isOpen={isEmployeeModalOpen}
        onClose={() => {
          setIsEmployeeModalOpen(false);
          setSelectedStaffForEdit(null);
        }}
        staffToEdit={selectedStaffForEdit}
        institutes={institutes}
        config={config}
        onSaveStaff={handleSaveEmployee}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={selectedStaffForDelete !== null}
        onClose={() => setSelectedStaffForDelete(null)}
        staff={selectedStaffForDelete}
        onConfirmDelete={handleDeleteEmployee}
      />

    </div>
  );
};
