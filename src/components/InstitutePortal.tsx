import React, { useState } from 'react';
import { Institute, StaffMember, MonthlyTransaction, SystemConfig } from '../types/payroll';
import { formatPKR } from '../utils/currencyWords';
import { isValidBOPAccount } from '../utils/auditEngine';
import { 
  Users, Briefcase, Calendar, CheckCircle2, Clock, Send, 
  Printer, AlertCircle, FileSpreadsheet, ShieldCheck, Lock, ChevronRight
} from 'lucide-react';

interface InstitutePortalProps {
  institute: Institute;
  staff: StaffMember[];
  transactions: MonthlyTransaction[];
  config: SystemConfig;
  onSaveTransactions: (txns: MonthlyTransaction[]) => void;
  onSubmitToDD: (instituteCode: string) => void;
}

export const InstitutePortal: React.FC<InstitutePortalProps> = ({
  institute,
  staff,
  transactions,
  config,
  onSaveTransactions,
  onSubmitToDD
}) => {
  const [activeTab, setActiveTab] = useState<'Daily Wages' | 'Visiting Faculty'>('Daily Wages');
  const [filterQuery, setFilterQuery] = useState('');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [principalSignName, setPrincipalSignName] = useState(institute.principalName);
  const [successToast, setSuccessToast] = useState('');

  // Filter staff belonging to this institute
  const myStaff = staff.filter(s => s.instituteCode === institute.code);
  const myDwStaff = myStaff.filter(s => s.staffType === 'Daily Wages');
  const myVisStaff = myStaff.filter(s => s.staffType === 'Visiting Faculty');

  // Find or initialize transactions for this institute
  const myTxns = transactions.filter(t => t.instituteCode === institute.code && t.payrollMonth === config.activeMonth);

  // Check if already submitted
  const isSubmitted = myTxns.length > 0 && myTxns.every(t => t.status === 'Submitted' || t.status === 'Approved');

  // Handle live input change for Daily Wages working days
  const handleWorkingDaysChange = (staffId: string, days: number) => {
    if (isSubmitted) return;
    const clampedDays = Math.min(31, Math.max(0, isNaN(days) ? 0 : days));
    const targetStaff = staff.find(s => s.id === staffId);
    if (!targetStaff) return;

    const rate = targetStaff.dailyRate || (targetStaff.category === 'Skilled' ? config.skilledDailyRate : config.unskilledDailyRate);
    const gross = clampedDays * rate;

    const updated = [...transactions];
    const existingIndex = updated.findIndex(t => t.staffId === staffId && t.payrollMonth === config.activeMonth);

    if (existingIndex >= 0) {
      updated[existingIndex] = {
        ...updated[existingIndex],
        workingDays: clampedDays,
        grossSalary: gross,
        netSalary: gross - (updated[existingIndex].deductions || 0)
      };
    } else {
      updated.push({
        id: `TXN-${config.activePeriod}-${institute.code}-${staffId.split('-').pop()}`,
        payrollMonth: config.activeMonth,
        payrollPeriod: config.activePeriod,
        staffId,
        instituteCode: institute.code,
        staffType: 'Daily Wages',
        workingDays: clampedDays,
        theoryHours: 0,
        practicalHours: 0,
        grossSalary: gross,
        deductions: 0,
        netSalary: gross,
        status: 'Draft'
      });
    }
    onSaveTransactions(updated);
  };

  // Handle live input change for Visiting hours
  const handleVisitingHoursChange = (staffId: string, field: 'theory' | 'practical' | 'days', value: number) => {
    if (isSubmitted) return;
    const num = Math.max(0, isNaN(value) ? 0 : value);
    const targetStaff = staff.find(s => s.id === staffId);
    if (!targetStaff) return;

    const thRate = targetStaff.theoryHourlyRate || config.defaultTheoryRate;
    const prRate = targetStaff.practicalHourlyRate || config.defaultPracticalRate;

    const updated = [...transactions];
    const existingIndex = updated.findIndex(t => t.staffId === staffId && t.payrollMonth === config.activeMonth);

    let curTh = existingIndex >= 0 ? updated[existingIndex].theoryHours : 0;
    let curPr = existingIndex >= 0 ? updated[existingIndex].practicalHours : 0;
    let curDays = existingIndex >= 0 ? updated[existingIndex].workingDays : 24;

    if (field === 'theory') curTh = num;
    if (field === 'practical') curPr = num;
    if (field === 'days') curDays = Math.min(31, num);

    const gross = (curTh * thRate) + (curPr * prRate);

    if (existingIndex >= 0) {
      updated[existingIndex] = {
        ...updated[existingIndex],
        theoryHours: curTh,
        practicalHours: curPr,
        workingDays: curDays,
        grossSalary: gross,
        netSalary: gross - (updated[existingIndex].deductions || 0)
      };
    } else {
      updated.push({
        id: `TXN-${config.activePeriod}-${institute.code}-${staffId.split('-').pop()}`,
        payrollMonth: config.activeMonth,
        payrollPeriod: config.activePeriod,
        staffId,
        instituteCode: institute.code,
        staffType: 'Visiting Faculty',
        workingDays: curDays,
        theoryHours: curTh,
        practicalHours: curPr,
        grossSalary: gross,
        deductions: 0,
        netSalary: gross,
        status: 'Draft'
      });
    }
    onSaveTransactions(updated);
  };

  // Summary figures
  const currentCategoryStaff = activeTab === 'Daily Wages' ? myDwStaff : myVisStaff;
  const filteredStaff = currentCategoryStaff.filter(s => 
    s.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    s.cnic.includes(filterQuery) ||
    s.designation.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const totalDwAmount = myTxns.filter(t => t.staffType === 'Daily Wages').reduce((acc, t) => acc + (t.netSalary || 0), 0);
  const totalVisAmount = myTxns.filter(t => t.staffType === 'Visiting Faculty').reduce((acc, t) => acc + (t.netSalary || 0), 0);
  const grandTotalClaim = totalDwAmount + totalVisAmount;

  const handleFinalSubmit = () => {
    onSubmitToDD(institute.code);
    setIsSubmitModalOpen(false);
    setSuccessToast(`Successfully submitted salary bill of PKR ${formatPKR(grandTotalClaim)} to District Director Office!`);
    setTimeout(() => setSuccessToast(''), 6000);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500 rounded-xl text-emerald-200 text-sm flex items-center justify-between shadow-xl animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast('')} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Institute Official Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold bg-blue-950 text-blue-400 px-2.5 py-1 rounded-md border border-blue-800/60">
                INSTITUTE CODE: {institute.code}
              </span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md">
                District {institute.district}
              </span>
              {isSubmitted ? (
                <span className="text-xs font-semibold bg-emerald-950/90 text-emerald-400 px-3 py-1 rounded-md border border-emerald-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> SUBMITTED TO DD OFFICE
                </span>
              ) : (
                <span className="text-xs font-semibold bg-amber-950/90 text-amber-300 px-3 py-1 rounded-md border border-amber-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> DRAFT IN PROGRESS
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white font-heading tracking-tight">
              {institute.name}
            </h2>
            <p className="text-xs text-slate-400 mt-1 flex flex-wrap gap-4">
              <span>Principal: <strong className="text-slate-200">{institute.principalName}</strong></span>
              <span>Contact: <strong className="text-slate-200">{institute.contactMobile}</strong></span>
              <span>Active Billing Month: <strong className="text-emerald-400">{config.activeMonth}</strong></span>
            </p>
          </div>

          {/* Action Buttons & Totals */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-right">
              <div className="text-[11px] uppercase tracking-wider text-slate-400">Total Monthly Claim</div>
              <div className="text-lg sm:text-xl font-bold text-emerald-400 font-heading">
                Rs. {formatPKR(grandTotalClaim)}
              </div>
            </div>

            {!isSubmitted ? (
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                disabled={myStaff.length === 0}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Submit Bill to District Director
              </button>
            ) : (
              <button
                onClick={() => window.print()}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-700 transition-all flex items-center gap-2"
              >
                <Printer className="w-4 h-4 text-blue-400" />
                Print Submission Slip
              </button>
            )}
          </div>
        </div>

        {/* Quick Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-xs">Daily Wages Staff</div>
            <div className="text-base font-bold text-white mt-0.5">{myDwStaff.length} Sanctioned</div>
            <div className="text-xs text-blue-400 font-mono mt-0.5">Rs. {formatPKR(totalDwAmount)}</div>
          </div>
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-xs">Visiting Faculty</div>
            <div className="text-base font-bold text-white mt-0.5">{myVisStaff.length} Instructors</div>
            <div className="text-xs text-teal-400 font-mono mt-0.5">Rs. {formatPKR(totalVisAmount)}</div>
          </div>
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-xs">Debit Account (DW)</div>
            <div className="text-xs font-mono text-slate-300 mt-1 font-semibold">{config.tevtaDwAccount}</div>
            <div className="text-[10px] text-slate-400">BOP Salaries A/C</div>
          </div>
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-xs">Debit Account (Visiting)</div>
            <div className="text-xs font-mono text-slate-300 mt-1 font-semibold">{config.tevtaVisitingAccount}</div>
            <div className="text-[10px] text-slate-400">DM Non-Salary A/C</div>
          </div>
        </div>

      </div>

      {/* Staff Type Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('Daily Wages')}
            className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'Daily Wages'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Daily Wages Staff ({myDwStaff.length})
          </button>
          <button
            onClick={() => setActiveTab('Visiting Faculty')}
            className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'Visiting Faculty'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Visiting Faculty ({myVisStaff.length})
          </button>
        </div>

        <input
          type="text"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder={`Search ${activeTab} by name, CNIC, or trade...`}
          className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full sm:w-80"
        />
      </div>

      {/* Main Interactive Attendance Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="table-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Sr.</th>
                <th className="py-3 px-4">Employee Details</th>
                <th className="py-3 px-4">Designation & Scale</th>
                <th className="py-3 px-4">Contract / Tenure</th>
                {activeTab === 'Daily Wages' ? (
                  <>
                    <th className="py-3 px-4 text-center">Approved Rate</th>
                    <th className="py-3 px-4 text-center">Working Days</th>
                    <th className="py-3 px-4 text-right">Gross Salary</th>
                  </>
                ) : (
                  <>
                    <th className="py-3 px-4 text-center">Rates (Th/Pr)</th>
                    <th className="py-3 px-4 text-center">Theory Hrs</th>
                    <th className="py-3 px-4 text-center">Practical Hrs</th>
                    <th className="py-3 px-4 text-center">Days</th>
                    <th className="py-3 px-4 text-right">Total Honorarium</th>
                  </>
                )}
                <th className="py-3 px-4">Bank Account (16-Digit BOP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No sanctioned {activeTab} employees found for {institute.name}.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staffMember, idx) => {
                  const txn = myTxns.find(t => t.staffId === staffMember.id);
                  const isAccountValid = isValidBOPAccount(staffMember.bankAccount);

                  return (
                    <tr key={staffMember.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-400 text-center">{idx + 1}</td>
                      
                      {/* Name & CNIC */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-100">{staffMember.name}</div>
                        <div className="text-[11px] font-mono text-slate-400">{staffMember.cnic}</div>
                        <div className="text-[10px] text-slate-500">{staffMember.department}</div>
                      </td>

                      {/* Designation */}
                      <td className="py-3 px-4">
                        <div className="text-slate-200">{staffMember.designation}</div>
                        <span className="inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                          BPS-{staffMember.bps} • {staffMember.category}
                        </span>
                      </td>

                      {/* Contract */}
                      <td className="py-3 px-4">
                        <div className="text-slate-300">{staffMember.contractPeriod}</div>
                        {staffMember.contractDaysElapsed !== undefined && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Progress: {staffMember.contractDaysElapsed} / 89 days
                          </div>
                        )}
                      </td>

                      {/* Inputs & Calculations based on tab */}
                      {activeTab === 'Daily Wages' ? (
                        <>
                          <td className="py-3 px-4 text-center font-mono text-slate-300">
                            Rs. {staffMember.dailyRate}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isSubmitted ? (
                              <span className="font-mono text-sm font-bold text-slate-200">
                                {txn?.workingDays || 0}
                              </span>
                            ) : (
                              <input
                                type="number"
                                min={0}
                                max={31}
                                value={txn?.workingDays ?? 26}
                                onChange={(e) => handleWorkingDaysChange(staffMember.id, parseInt(e.target.value, 10))}
                                className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                              />
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                            Rs. {formatPKR(txn?.netSalary ?? (26 * staffMember.dailyRate))}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 px-4 text-center font-mono text-xs text-slate-400">
                            {staffMember.theoryHourlyRate || 500} / {staffMember.practicalHourlyRate || 250}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isSubmitted ? (
                              <span className="font-mono text-sm font-bold text-slate-200">
                                {txn?.theoryHours || 0}
                              </span>
                            ) : (
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={txn?.theoryHours ?? 26}
                                onChange={(e) => handleVisitingHoursChange(staffMember.id, 'theory', parseInt(e.target.value, 10))}
                                className="w-14 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                              />
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isSubmitted ? (
                              <span className="font-mono text-sm font-bold text-slate-200">
                                {txn?.practicalHours || 0}
                              </span>
                            ) : (
                              <input
                                type="number"
                                min={0}
                                max={200}
                                value={txn?.practicalHours ?? 111}
                                onChange={(e) => handleVisitingHoursChange(staffMember.id, 'practical', parseInt(e.target.value, 10))}
                                className="w-14 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                              />
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isSubmitted ? (
                              <span className="font-mono text-sm font-bold text-slate-200">
                                {txn?.workingDays || 0}
                              </span>
                            ) : (
                              <input
                                type="number"
                                min={0}
                                max={31}
                                value={txn?.workingDays ?? 24}
                                onChange={(e) => handleVisitingHoursChange(staffMember.id, 'days', parseInt(e.target.value, 10))}
                                className="w-14 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                              />
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-teal-400">
                            Rs. {formatPKR(txn?.netSalary ?? ((26 * 500) + (111 * 250)))}
                          </td>
                        </>
                      )}

                      {/* Bank Details */}
                      <td className="py-3 px-4">
                        <div className="font-mono text-xs text-slate-200">{staffMember.bankAccount}</div>
                        <div className="text-[10px] text-slate-400">
                          {staffMember.bankBranch} (Code: {staffMember.branchCode})
                        </div>
                        {isAccountValid ? (
                          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Valid 16-Digit BOP
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
                            <AlertCircle className="w-3 h-3" /> Account Format Warning
                          </span>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation & Digital Sign-off Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-heading">Principal Digital Sign-Off</h3>
                <p className="text-xs text-slate-400">Monthly Salary Claim Submission to DD Office</p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 mb-4 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Institute:</span>
                <strong className="text-slate-200">{institute.name}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Active Month:</span>
                <strong className="text-emerald-400">{config.activeMonth}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Staff Billed:</span>
                <strong className="text-slate-200">{myStaff.length} Employees</strong>
              </div>
              <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-2">
                <span>Grand Total Net Claim:</span>
                <strong className="text-emerald-400 text-sm font-mono">Rs. {formatPKR(grandTotalClaim)}</strong>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Authorized Signatory (Principal / In-Charge Name)
              </label>
              <input
                type="text"
                value={principalSignName}
                onChange={(e) => setPrincipalSignName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                By submitting, you certify that all stated working days and contact hours have been physically verified from the institute attendance register.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
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

    </div>
  );
};
