import React, { useState, useEffect } from 'react';
import { Institute, StaffMember, MonthlyTransaction, SystemConfig, StaffType } from '../types/payroll';
import { formatPKR, calculateDailyWagesGross, calculateVisitingGross } from '../utils/currencyWords';
import { isValidBOPAccount } from '../utils/auditEngine';
import { EmployeeManagerModal } from './EmployeeManagerModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { 
  Building2, Users, Save, CheckCircle2, AlertCircle, 
  Clock, DollarSign, FileSpreadsheet, Lock, Sparkles,
  Search, Plus, Edit, Trash2, LayoutGrid, List, Phone,
  CreditCard, ShieldCheck, Download, RefreshCw, UserCheck
} from 'lucide-react';

interface InstitutePortalProps {
  institute: Institute;
  staff: StaffMember[];
  transactions: MonthlyTransaction[];
  config: SystemConfig;
  onSaveTransactions: (transactions: MonthlyTransaction[]) => void;
  onSubmitToDD: (instituteCode: string) => void;
  onUpdateStaff?: (staff: StaffMember[]) => void;
}

export const InstitutePortal: React.FC<InstitutePortalProps> = ({
  institute,
  staff,
  transactions,
  config,
  onSaveTransactions,
  onSubmitToDD,
  onUpdateStaff
}) => {
  // Staff filtered by this institute
  const myStaff = staff.filter(s => s.instituteCode === institute.code);

  // Local state for billing edits
  const [localTxns, setLocalTxns] = useState<{ [staffId: string]: MonthlyTransaction }>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [principalSignName, setPrincipalSignName] = useState(institute.principalName || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | StaffType>('ALL');
  const [viewMode, setViewMode] = useState<'TABLE' | 'CARDS'>('TABLE');

  // Modals for CRUD
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [selectedStaffForEdit, setSelectedStaffForEdit] = useState<StaffMember | null>(null);
  const [selectedStaffForDelete, setSelectedStaffForDelete] = useState<StaffMember | null>(null);

  // Initialize transactions for current active month
  useEffect(() => {
    const txnMap: { [staffId: string]: MonthlyTransaction } = {};
    
    myStaff.forEach(stf => {
      const existing = transactions.find(
        t => t.staffId === stf.id && 
             t.instituteCode === institute.code && 
             t.payrollMonth === config.activeMonth
      );

      if (existing) {
        txnMap[stf.id] = { ...existing };
      } else {
        // Auto default transaction
        const defaultDays = stf.staffType === 'Daily Wages' ? 26 : 0;
        const defaultTheory = stf.staffType === 'Visiting Faculty' ? 40 : 0;
        const defaultPractical = stf.staffType === 'Visiting Faculty' ? 20 : 0;

        const gross = stf.staffType === 'Daily Wages'
          ? calculateDailyWagesGross(defaultDays, stf.dailyRate)
          : calculateVisitingGross(defaultTheory, defaultPractical, stf.theoryHourlyRate, stf.practicalHourlyRate);

        txnMap[stf.id] = {
          id: `TXN-${institute.code}-${stf.id}-${config.activePeriod}`,
          payrollMonth: config.activeMonth,
          payrollPeriod: config.activePeriod,
          staffId: stf.id,
          instituteCode: institute.code,
          staffType: stf.staffType,
          workingDays: defaultDays,
          theoryHours: defaultTheory,
          practicalHours: defaultPractical,
          grossSalary: gross,
          deductions: 0,
          netSalary: gross,
          status: 'Draft'
        };
      }
    });

    setLocalTxns(txnMap);
    setHasUnsavedChanges(false);
  }, [institute.code, config.activeMonth, config.activePeriod, myStaff.length]);

  // Handle transaction numeric inputs
  const handleInputChange = (
    staffId: string, 
    field: 'workingDays' | 'theoryHours' | 'practicalHours' | 'deductions', 
    val: number
  ) => {
    const stf = myStaff.find(s => s.id === staffId);
    if (!stf) return;

    const currentTxn = localTxns[staffId];
    if (!currentTxn) return;

    const updatedTxn = { ...currentTxn, [field]: Math.max(0, val) };

    // Re-calculate Gross and Net
    if (stf.staffType === 'Daily Wages') {
      const gross = calculateDailyWagesGross(updatedTxn.workingDays, stf.dailyRate);
      updatedTxn.grossSalary = gross;
      updatedTxn.netSalary = Math.max(0, gross - (updatedTxn.deductions || 0));
    } else {
      const gross = calculateVisitingGross(
        updatedTxn.theoryHours, 
        updatedTxn.practicalHours, 
        stf.theoryHourlyRate, 
        stf.practicalHourlyRate
      );
      updatedTxn.grossSalary = gross;
      updatedTxn.netSalary = Math.max(0, gross - (updatedTxn.deductions || 0));
    }

    setLocalTxns(prev => ({ ...prev, [staffId]: updatedTxn }));
    setHasUnsavedChanges(true);
  };

  // Quick Batch Fill (e.g. Set all Daily Wages to 26 days)
  const handleBatchFillDW = (days: number = 26) => {
    const updated = { ...localTxns };
    myStaff.forEach(stf => {
      if (stf.staffType === 'Daily Wages') {
        const gross = calculateDailyWagesGross(days, stf.dailyRate);
        const existingDed = updated[stf.id]?.deductions || 0;
        updated[stf.id] = {
          ...(updated[stf.id] || {}),
          id: updated[stf.id]?.id || `TXN-${institute.code}-${stf.id}-${config.activePeriod}`,
          payrollMonth: config.activeMonth,
          payrollPeriod: config.activePeriod,
          staffId: stf.id,
          instituteCode: institute.code,
          staffType: 'Daily Wages',
          workingDays: days,
          theoryHours: 0,
          practicalHours: 0,
          grossSalary: gross,
          deductions: existingDed,
          netSalary: Math.max(0, gross - existingDed),
          status: 'Draft'
        };
      }
    });
    setLocalTxns(updated);
    setHasUnsavedChanges(true);
  };

  // Save Draft to Central State & LocalStorage
  const handleSaveDraft = () => {
    const txnsArray = Object.values(localTxns);
    const otherInstituteTxns = transactions.filter(
      t => !(t.instituteCode === institute.code && t.payrollMonth === config.activeMonth)
    );
    const merged = [...otherInstituteTxns, ...txnsArray];
    onSaveTransactions(merged);
    setHasUnsavedChanges(false);
  };

  // Final Digital Submission to District Director
  const handleFinalSubmit = () => {
    handleSaveDraft();
    onSubmitToDD(institute.code);
    setIsSubmitModalOpen(false);
  };

  // Staff CRUD Handlers
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

  // Totals calculations
  const totalDwClaim = myStaff
    .filter(s => s.staffType === 'Daily Wages')
    .reduce((acc, s) => acc + (localTxns[s.id]?.netSalary || 0), 0);

  const totalVisitingClaim = myStaff
    .filter(s => s.staffType === 'Visiting Faculty')
    .reduce((acc, s) => acc + (localTxns[s.id]?.netSalary || 0), 0);

  const grandTotalClaim = totalDwClaim + totalVisitingClaim;

  // Filter staff for table / cards
  const filteredStaff = myStaff.filter(s => {
    const matchesType = typeFilter === 'ALL' || s.staffType === typeFilter;
    const matchesQuery = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.cnic.includes(searchQuery) ||
      s.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesQuery;
  });

  // Current Submission Status
  const currentSubmission = transactions.find(
    t => t.instituteCode === institute.code && t.payrollMonth === config.activeMonth
  );
  const isLockedOrSubmitted = currentSubmission?.status === 'Submitted' || currentSubmission?.status === 'Approved';

  return (
    <div className="space-y-6">
      
      {/* Institute Executive Card & Billing Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 sm:gap-6">
          
          <div className="min-w-0 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/60 px-2.5 py-0.5 rounded-md">
                EMIS / CODE: {institute.code}
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-md">
                District {institute.district}
              </span>
              {isLockedOrSubmitted ? (
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Claim Submitted & Signed
                </span>
              ) : (
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800/60 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Monthly Claim In Draft
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading tracking-tight">
              {institute.name}
            </h1>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-2">
              <span>Principal: <strong>{institute.principalName}</strong></span>
              <span>•</span>
              <span>Mobile: <strong>{institute.contactMobile}</strong></span>
              <span>•</span>
              <span>Active Cycle: <strong className="text-indigo-600 dark:text-indigo-400">{config.activeMonth}</strong></span>
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              onClick={handleOpenAddEmployee}
              className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs sm:text-sm font-semibold px-3.5 sm:px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 sm:gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Employee</span>
            </button>

            <button
              onClick={handleSaveDraft}
              disabled={isLockedOrSubmitted}
              className={`text-xs sm:text-sm font-semibold px-3.5 sm:px-4 py-2.5 rounded-xl border transition-all flex items-center gap-1.5 sm:gap-2 ${
                hasUnsavedChanges
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg animate-pulse border-amber-400'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Save className="w-4 h-4" />
              <span>{hasUnsavedChanges ? 'Save Changes *' : 'Save Draft'}</span>
            </button>

            <button
              onClick={() => setIsSubmitModalOpen(true)}
              disabled={isLockedOrSubmitted}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-1.5 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Submit to DD Office</span>
            </button>
          </div>

        </div>

        {/* Financial KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          
          <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Total Campus Claim (Net PKR)</div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-heading mt-1">
              Rs. {formatPKR(grandTotalClaim)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              For {myStaff.length} Non-Regular Employees
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Daily Wages Staff Bill</div>
            <div className="text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-400 font-heading mt-1">
              Rs. {formatPKR(totalDwClaim)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {myStaff.filter(s => s.staffType === 'Daily Wages').length} DW Employees
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Visiting Faculty Honorarium</div>
            <div className="text-lg sm:text-xl font-bold text-teal-600 dark:text-teal-400 font-heading mt-1">
              Rs. {formatPKR(totalVisitingClaim)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {myStaff.filter(s => s.staffType === 'Visiting Faculty').length} Instructors
            </div>
          </div>

        </div>

      </div>

      {/* Roster & Attendance Control Strip */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        
        {/* Strip Header with Filters & Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
              Staff Payroll Registry ({filteredStaff.length})
            </h3>
          </div>

          {/* Quick Action Buttons & Search */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            
            {/* Type Segmented Control */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setTypeFilter('ALL')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  typeFilter === 'ALL' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All ({myStaff.length})
              </button>
              <button
                onClick={() => setTypeFilter('Daily Wages')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  typeFilter === 'Daily Wages' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Daily Wages ({myStaff.filter(s => s.staffType === 'Daily Wages').length})
              </button>
              <button
                onClick={() => setTypeFilter('Visiting Faculty')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  typeFilter === 'Visiting Faculty' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Visiting ({myStaff.filter(s => s.staffType === 'Visiting Faculty').length})
              </button>
            </div>

            {/* Quick Batch Fill */}
            {!isLockedOrSubmitted && (
              <button
                type="button"
                onClick={() => handleBatchFillDW(26)}
                title="Fill 26 days for all Daily Wages staff"
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-semibold flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Auto-Fill 26 Days</span>
              </button>
            )}

            {/* View Switcher: Table vs Cards */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setViewMode('TABLE')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'TABLE' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}
                title="Monthly Attendance Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('CARDS')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'CARDS' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}
                title="Employee Profile Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff, CNIC, trade..."
                className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-44 sm:w-56"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>

          </div>

        </div>

        {/* View Mode 1: Table View */}
        {viewMode === 'TABLE' ? (
          <div className="table-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Employee Profile</th>
                  <th className="py-3 px-4">CNIC & Category</th>
                  <th className="py-3 px-4">Rate (PKR)</th>
                  <th className="py-3 px-4 text-center">Attendance / Hours</th>
                  <th className="py-3 px-4 text-right">Gross Claim</th>
                  <th className="py-3 px-4 text-center">Deductions</th>
                  <th className="py-3 px-4 text-right">Net Claim</th>
                  <th className="py-3 px-4">BOP Account</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-indigo-400" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">No employees match the filter criteria.</p>
                      <button
                        onClick={handleOpenAddEmployee}
                        className="mt-3 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                      >
                        + Add a new employee to this campus
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((staffMember, index) => {
                    const txn = localTxns[staffMember.id] || {
                      workingDays: 0,
                      theoryHours: 0,
                      practicalHours: 0,
                      grossSalary: 0,
                      deductions: 0,
                      netSalary: 0
                    };
                    const isAccountValid = isValidBOPAccount(staffMember.bankAccount);

                    return (
                      <tr key={staffMember.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        
                        {/* Serial Number */}
                        <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                          {index + 1}
                        </td>

                        {/* Profile with Avatar */}
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
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                {staffMember.name}
                                {staffMember.staffType === 'Daily Wages' ? (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 font-semibold">
                                    DW
                                  </span>
                                ) : (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 font-semibold">
                                    VIS
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                {staffMember.designation} (BPS-{staffMember.bps}) • {staffMember.department}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* CNIC & Category */}
                        <td className="py-3 px-4 font-mono">
                          <div className="text-slate-800 dark:text-slate-200 font-semibold">{staffMember.cnic}</div>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {staffMember.category}
                          </span>
                        </td>

                        {/* Rate */}
                        <td className="py-3 px-4 font-mono">
                          {staffMember.staffType === 'Daily Wages' ? (
                            <div>
                              <span className="text-slate-900 dark:text-emerald-400 font-bold">Rs. {formatPKR(staffMember.dailyRate)}</span>
                              <div className="text-[10px] text-slate-400">/ Day</div>
                            </div>
                          ) : (
                            <div className="text-[11px]">
                              <div>Th: <strong className="text-teal-600 dark:text-teal-400">Rs. {staffMember.theoryHourlyRate}</strong></div>
                              <div>Pr: <strong className="text-teal-600 dark:text-teal-400">Rs. {staffMember.practicalHourlyRate}</strong></div>
                            </div>
                          )}
                        </td>

                        {/* Attendance / Hours Editor */}
                        <td className="py-3 px-4 text-center">
                          {staffMember.staffType === 'Daily Wages' ? (
                            <div className="inline-flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                              <input
                                type="number"
                                min={0}
                                max={31}
                                disabled={isLockedOrSubmitted}
                                value={txn.workingDays || 0}
                                onChange={(e) => handleInputChange(staffMember.id, 'workingDays', Number(e.target.value))}
                                className="w-14 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                              />
                              <span className="text-[11px] text-slate-500 font-semibold pr-1.5">Days</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center space-x-2">
                              <div className="text-left">
                                <span className="text-[10px] text-slate-400 block">Theory</span>
                                <input
                                  type="number"
                                  min={0}
                                  max={120}
                                  disabled={isLockedOrSubmitted}
                                  value={txn.theoryHours || 0}
                                  onChange={(e) => handleInputChange(staffMember.id, 'theoryHours', Number(e.target.value))}
                                  className="w-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-1.5 py-1 text-center font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 text-xs"
                                />
                              </div>
                              <div className="text-left">
                                <span className="text-[10px] text-slate-400 block">Practical</span>
                                <input
                                  type="number"
                                  min={0}
                                  max={120}
                                  disabled={isLockedOrSubmitted}
                                  value={txn.practicalHours || 0}
                                  onChange={(e) => handleInputChange(staffMember.id, 'practicalHours', Number(e.target.value))}
                                  className="w-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-1.5 py-1 text-center font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 text-xs"
                                />
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Gross Claim */}
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                          Rs. {formatPKR(txn.grossSalary)}
                        </td>

                        {/* Deductions Input */}
                        <td className="py-3 px-4 text-center">
                          <input
                            type="number"
                            min={0}
                            disabled={isLockedOrSubmitted}
                            value={txn.deductions || 0}
                            onChange={(e) => handleInputChange(staffMember.id, 'deductions', Number(e.target.value))}
                            className="w-16 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-right font-mono text-rose-600 dark:text-rose-400 font-semibold focus:outline-none focus:border-rose-500"
                          />
                        </td>

                        {/* Net Claim */}
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          Rs. {formatPKR(txn.netSalary)}
                        </td>

                        {/* Bank Details */}
                        <td className="py-3 px-4">
                          <div className="font-mono text-xs text-slate-800 dark:text-slate-200 font-semibold">{staffMember.bankAccount}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                            {staffMember.bankBranch} (Code: {staffMember.branchCode})
                          </div>
                          {isAccountValid ? (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Valid BOP
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
                              <AlertCircle className="w-3 h-3" /> Warning
                            </span>
                          )}
                        </td>

                        {/* Actions (Edit / Delete) */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => handleOpenEditEmployee(staffMember)}
                              title="Edit Employee Profile & Rates"
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* View Mode 2: Executive Profile Cards Grid */
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStaff.map((staffMember) => {
              const txn = localTxns[staffMember.id] || { netSalary: 0, workingDays: 0, theoryHours: 0, practicalHours: 0 };
              const isAccountValid = isValidBOPAccount(staffMember.bankAccount);

              return (
                <div 
                  key={staffMember.id}
                  className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-md flex flex-col justify-between hover:border-indigo-400 transition-all group"
                >
                  <div>
                    {/* Top Row: Avatar + Badges + Edit Actions */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 border-2 border-indigo-500/40 shadow shrink-0">
                          {staffMember.photoUrl ? (
                            <img src={staffMember.photoUrl} alt={staffMember.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-lg">
                              {staffMember.name[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                            {staffMember.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {staffMember.designation} (BPS-{staffMember.bps})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditEmployee(staffMember)}
                          title="Edit Profile"
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedStaffForDelete(staffMember)}
                          title="Delete Employee"
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-900 text-rose-500 hover:text-rose-600 border border-slate-200 dark:border-slate-700 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap gap-1.5 mt-3 text-[10px]">
                      <span className="px-2 py-0.5 rounded-md font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                        {staffMember.staffType}
                      </span>
                      <span className="px-2 py-0.5 rounded-md font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {staffMember.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-md font-mono text-slate-500 dark:text-slate-400">
                        {staffMember.department}
                      </span>
                    </div>

                    {/* Info Matrix */}
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">CNIC:</span>
                        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{staffMember.cnic}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Rate:</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                          {staffMember.staffType === 'Daily Wages' ? `Rs. ${formatPKR(staffMember.dailyRate)} / day` : `Th: Rs. ${staffMember.theoryHourlyRate} • Pr: Rs. ${staffMember.practicalHourlyRate}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">BOP Account:</span>
                        <span className="font-mono text-slate-800 dark:text-slate-200">{staffMember.bankAccount}</span>
                      </div>
                      {staffMember.phone && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Phone:</span>
                          <a href={`tel:${staffMember.phone}`} className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {staffMember.phone}
                          </a>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Card Bottom: Monthly Claim Callout */}
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-medium">Monthly Net Claim</div>
                      <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        Rs. {formatPKR(txn.netSalary)}
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-slate-500 dark:text-slate-400">
                      {staffMember.staffType === 'Daily Wages' ? (
                        <span><strong>{txn.workingDays || 0}</strong> Days Billed</span>
                      ) : (
                        <span><strong>{(txn.theoryHours || 0) + (txn.practicalHours || 0)}</strong> Hours Total</span>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Confirmation & Digital Sign-off Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">Principal Digital Sign-Off</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Monthly Salary Claim Submission to DD Office</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2 mb-4 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Institute:</span>
                <strong className="text-slate-900 dark:text-slate-200">{institute.name}</strong>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Active Month:</span>
                <strong className="text-indigo-600 dark:text-indigo-400">{config.activeMonth}</strong>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Total Staff Billed:</span>
                <strong className="text-slate-900 dark:text-slate-200">{myStaff.length} Employees</strong>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-2">
                <span>Grand Total Net Claim:</span>
                <strong className="text-emerald-600 dark:text-emerald-400 text-sm font-mono">Rs. {formatPKR(grandTotalClaim)}</strong>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Authorized Signatory (Principal / In-Charge Name)
              </label>
              <input
                type="text"
                value={principalSignName}
                onChange={(e) => setPrincipalSignName(e.target.value)}
                required
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                By submitting, you certify that all stated working days and contact hours have been physically verified from the institute attendance register.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm & Lock Submission
              </button>
            </div>
          </div>
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
        defaultInstituteCode={institute.code}
        institutes={[institute]}
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
