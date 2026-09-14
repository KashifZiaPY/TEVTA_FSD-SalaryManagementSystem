import React from 'react';
import { StaffMember, MonthlyTransaction, SystemConfig } from '../types/payroll';
import { formatPKR } from '../utils/currencyWords';
import { Printer, Download, X, FileSpreadsheet } from 'lucide-react';

interface ConsolidatedExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'DW' | 'VISITING';
  staff: StaffMember[];
  transactions: MonthlyTransaction[];
  config: SystemConfig;
}

export const ConsolidatedExportModal: React.FC<ConsolidatedExportModalProps> = ({
  isOpen,
  onClose,
  type,
  staff,
  transactions,
  config
}) => {
  if (!isOpen) return null;

  const staffType = type === 'DW' ? 'Daily Wages' : 'Visiting Faculty';
  const currentTxns = transactions.filter(t => t.payrollMonth === config.activeMonth && t.staffType === staffType);
  const totalAmount = currentTxns.reduce((acc, t) => acc + (t.netSalary || 0), 0);
  const debitAccount = type === 'DW' ? config.tevtaDwAccount : config.tevtaVisitingAccount;

  const handleDownloadCSV = () => {
    let headers: string[];
    let rows: string[][];

    if (type === 'DW') {
      headers = ["Sr", "Institute", "Name", "Designation", "BPS", "CNIC", "Department", "Category", "Rate", "Days", "Net_Salary", "Bank_Account", "Branch", "Branch_Code"];
      rows = currentTxns.map((t, idx) => {
        const s = staff.find(sm => sm.id === t.staffId);
        return [
          String(idx + 1),
          `"${s?.instituteName || s?.instituteCode || ''}"`,
          `"${s?.name || ''}"`,
          `"${s?.designation || ''}"`,
          String(s?.bps || 1),
          `"${s?.cnic || ''}"`,
          `"${s?.department || ''}"`,
          `"${s?.category || ''}"`,
          String(s?.dailyRate || 1538),
          String(t.workingDays || 0),
          String(t.netSalary || 0),
          `"'${s?.bankAccount || ''}"`,
          `"${s?.bankBranch || ''}"`,
          `"${s?.branchCode || ''}"`
        ];
      });
    } else {
      headers = ["Sr", "Institute", "Instructor_Name", "Designation", "BPS", "CNIC", "Department", "Theory_Hours", "Practical_Hours", "Days", "Total_Rate", "Net_Salary", "Bank_Account", "Branch", "Branch_Code"];
      rows = currentTxns.map((t, idx) => {
        const s = staff.find(sm => sm.id === t.staffId);
        return [
          String(idx + 1),
          `"${s?.instituteName || s?.instituteCode || ''}"`,
          `"${s?.name || ''}"`,
          `"${s?.designation || ''}"`,
          String(s?.bps || 14),
          `"${s?.cnic || ''}"`,
          `"${s?.department || ''}"`,
          String(t.theoryHours || 0),
          String(t.practicalHours || 0),
          String(t.workingDays || 0),
          `"${s?.theoryHourlyRate || 500}/${s?.practicalHourlyRate || 250}"`,
          String(t.netSalary || 0),
          `"'${s?.bankAccount || ''}"`,
          `"${s?.bankBranch || ''}"`,
          `"${s?.branchCode || ''}"`
        ];
      });
    }

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TEVTA_Consolidated_${type}_${config.activePeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col">
        
        {/* Controls */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4 print-hidden">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white font-heading">
              Official Consolidated Statement: {staffType} ({config.activeMonth})
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadCSV}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Download CSV / Excel
            </button>
            <button
              onClick={() => window.print()}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow transition-all flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Print AG Proforma
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable AG Office Document Area */}
        <div className="p-8 bg-white text-black overflow-y-auto print-container flex-1">
          
          <div className="text-center mb-6">
            <h2 className="text-base font-extrabold uppercase tracking-wide">
              TECHNICAL EDUCATION AND VOCATIONAL TRAINING AUTHORITY
            </h2>
            <h3 className="text-sm font-bold uppercase mt-0.5">
              SALARY OF {staffType.toUpperCase()} STAFF FOR THE MONTH OF {config.activeMonth.toUpperCase()}
            </h3>
            <p className="text-xs font-semibold text-gray-700 mt-0.5">
              DISTRICT NAME: FAISALABAD & CHINIOT | DEBIT A/C: {debitAccount}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[10px] border-collapse border border-black">
              <thead>
                <tr className="bg-gray-100 font-bold text-center border-b border-black">
                  <th className="border border-black p-1">Sr. No.</th>
                  <th className="border border-black p-1 text-left">Name of Institute</th>
                  <th className="border border-black p-1 text-left">Employee Name</th>
                  <th className="border border-black p-1 text-left">Designation</th>
                  <th className="border border-black p-1">PS</th>
                  <th className="border border-black p-1">CNIC No.</th>
                  <th className="border border-black p-1 text-left">Department</th>
                  {type === 'DW' ? (
                    <>
                      <th className="border border-black p-1">Category</th>
                      <th className="border border-black p-1 text-right">Daily Rate</th>
                      <th className="border border-black p-1 text-center">Working Days</th>
                      <th className="border border-black p-1 text-right">Net Salary</th>
                    </>
                  ) : (
                    <>
                      <th className="border border-black p-1 text-center">Theory Hrs</th>
                      <th className="border border-black p-1 text-center">Practical Hrs</th>
                      <th className="border border-black p-1 text-center">Rate</th>
                      <th className="border border-black p-1 text-center">Days</th>
                      <th className="border border-black p-1 text-right">Total Salary</th>
                    </>
                  )}
                  <th className="border border-black p-1 font-mono">16-Digit Account</th>
                  <th className="border border-black p-1 text-left">Bank Branch</th>
                  <th className="border border-black p-1">Code</th>
                </tr>
              </thead>
              <tbody>
                {currentTxns.map((t, idx) => {
                  const s = staff.find(sm => sm.id === t.staffId);
                  if (!s) return null;

                  return (
                    <tr key={t.id} className="border-b border-gray-300">
                      <td className="border border-black p-1 text-center font-mono">{idx + 1}</td>
                      <td className="border border-black p-1">{s.instituteName || s.instituteCode}</td>
                      <td className="border border-black p-1 font-semibold">{s.name}</td>
                      <td className="border border-black p-1">{s.designation}</td>
                      <td className="border border-black p-1 text-center">{s.bps}</td>
                      <td className="border border-black p-1 text-center font-mono">{s.cnic}</td>
                      <td className="border border-black p-1">{s.department}</td>
                      {type === 'DW' ? (
                        <>
                          <td className="border border-black p-1 text-center">{s.category}</td>
                          <td className="border border-black p-1 text-right font-mono">{s.dailyRate}</td>
                          <td className="border border-black p-1 text-center font-mono font-semibold">{t.workingDays}</td>
                          <td className="border border-black p-1 text-right font-mono font-bold">{formatPKR(t.netSalary)}</td>
                        </>
                      ) : (
                        <>
                          <td className="border border-black p-1 text-center font-mono">{t.theoryHours}</td>
                          <td className="border border-black p-1 text-center font-mono">{t.practicalHours}</td>
                          <td className="border border-black p-1 text-center font-mono">{s.theoryHourlyRate}/{s.practicalHourlyRate}</td>
                          <td className="border border-black p-1 text-center font-mono">{t.workingDays}</td>
                          <td className="border border-black p-1 text-right font-mono font-bold">{formatPKR(t.netSalary)}</td>
                        </>
                      )}
                      <td className="border border-black p-1 font-mono text-center font-bold tracking-wider">{s.bankAccount}</td>
                      <td className="border border-black p-1">{s.bankBranch}</td>
                      <td className="border border-black p-1 text-center font-mono">{s.branchCode}</td>
                    </tr>
                  );
                })}
                <tr className="bg-yellow-50 font-bold border-t-2 border-black">
                  <td colSpan={type === 'DW' ? 10 : 11} className="border border-black p-1 text-right font-bold">
                    GRAND TOTAL AMOUNT (PKR):
                  </td>
                  <td className="border border-black p-1 text-right font-mono font-bold text-xs">
                    Rs. {formatPKR(totalAmount)}
                  </td>
                  <td colSpan={3} className="border border-black p-1"></td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  );
};
