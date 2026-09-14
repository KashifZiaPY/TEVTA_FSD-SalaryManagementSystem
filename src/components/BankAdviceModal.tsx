import React, { useState } from 'react';
import { StaffMember, MonthlyTransaction, SystemConfig } from '../types/payroll';
import { formatPKR, numberToWordsPKR } from '../utils/currencyWords';
import { Printer, X, Building2, CheckCircle2 } from 'lucide-react';

interface BankAdviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffMember[];
  transactions: MonthlyTransaction[];
  config: SystemConfig;
}

export const BankAdviceModal: React.FC<BankAdviceModalProps> = ({
  isOpen,
  onClose,
  staff,
  transactions,
  config
}) => {
  const [adviceType, setAdviceType] = useState<'Daily Wages' | 'Visiting Faculty'>('Daily Wages');
  const [chequeNo, setChequeNo] = useState('------------------------');
  const [chequeDate, setChequeDate] = useState('14-09-2026');

  if (!isOpen) return null;

  const currentTxns = transactions.filter(t => t.payrollMonth === config.activeMonth && t.staffType === adviceType);
  const totalAmount = currentTxns.reduce((acc, t) => acc + (t.netSalary || 0), 0);
  const debitAccount = adviceType === 'Daily Wages' ? config.tevtaDwAccount : config.tevtaVisitingAccount;
  const accountTitle = adviceType === 'Daily Wages' ? 'TEVTA/NAVTEC/SALARIES' : 'DM OFFICE NON SALARY';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col">
        
        {/* Controls Toolbar (Hidden in Print) */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 print-hidden">
          <div className="flex items-center space-x-3">
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setAdviceType('Daily Wages')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  adviceType === 'Daily Wages' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Daily Wages Advice (A/C: {config.tevtaDwAccount})
              </button>
              <button
                onClick={() => setAdviceType('Visiting Faculty')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  adviceType === 'Visiting Faculty' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Visiting Staff Advice (A/C: {config.tevtaVisitingAccount})
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow transition-all flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Print Official Bank Advice
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Paper Area */}
        <div className="p-8 sm:p-12 bg-white text-black overflow-y-auto print-container flex-1">
          
          {/* Official Letterhead */}
          <div className="text-center border-b-2 border-black pb-4 mb-6">
            <h4 className="text-sm font-bold tracking-wider">GOVT. OF THE PUNJAB</h4>
            <h2 className="text-lg font-extrabold uppercase tracking-tight">
              DISTRICT DIRECTOR OFFICE (TEVTA)
            </h2>
            <p className="text-xs font-semibold">
              GOVT. STAFF TRAINING COLLEGE (NEW CAMPUS, JARANWALA ROAD, FAISALABAD)
            </p>
            <p className="text-[11px] text-gray-700">
              Ph.# 041-8542522 Fax # 041-2431706 | Email: director.fsd@tevta.gop.pk / ddf.fsd@tevta.gop.pk
            </p>
          </div>

          {/* Addressee */}
          <div className="flex justify-between items-start text-xs font-sans mb-4">
            <div>
              <p className="font-bold">The Manager,</p>
              <p>Bank of Punjab,</p>
              <p>Madina Town / D-Ground Branch,</p>
              <p>Faisalabad.</p>
            </div>
            <div className="text-right">
              <p><strong>Ref No:</strong> DD(T)/FSD/Salary/{config.activePeriod}</p>
              <p><strong>Dated:</strong> {chequeDate}</p>
            </div>
          </div>

          {/* Subject */}
          <div className="mb-4">
            <p className="text-xs font-bold underline">
              Subject: Transfer of Salary for the Month of {config.activeMonth} - TEVTA {adviceType} Employees
            </p>
          </div>

          {/* Body with Cheque and Verbal Sum */}
          <div className="text-xs leading-relaxed mb-6 text-justify">
            <p>
              Find enclosed herewith one cross cheque No. <strong>{chequeNo}</strong> dated <strong>{chequeDate}</strong> for 
              {' '}<strong>Rs: {formatPKR(totalAmount)}/-</strong> for the subject cited above. 
              ({' '}<strong>{numberToWordsPKR(totalAmount)}</strong>{' '}) 
              with request to transfer the amount into the following accounts. You are requested to Transfer 
              {' '}<strong>Rs: {formatPKR(totalAmount)}/-</strong> in below mentioned accounts and debit From 
              Our <strong>{accountTitle} Account No. {debitAccount}</strong> for the said amount.
            </p>
          </div>

          {/* Beneficiary Accounts Table */}
          <div className="mb-8">
            <table className="w-full text-[10px] border-collapse border border-black">
              <thead>
                <tr className="bg-gray-100 font-bold text-center border-b border-black">
                  <th className="border border-black p-1">Sr. #</th>
                  <th className="border border-black p-1 text-left">Name of Employee</th>
                  <th className="border border-black p-1 text-left">Designation</th>
                  <th className="border border-black p-1 text-left">Institute Name</th>
                  <th className="border border-black p-1">BPS</th>
                  <th className="border border-black p-1">CNIC</th>
                  <th className="border border-black p-1 text-right">Net Salary</th>
                  <th className="border border-black p-1">Branch Code</th>
                  <th className="border border-black p-1 text-left">Bank Branch Name</th>
                  <th className="border border-black p-1 font-mono">16-Digit Account No</th>
                </tr>
              </thead>
              <tbody>
                {currentTxns.map((txn, index) => {
                  const staffMember = staff.find(s => s.id === txn.staffId);
                  if (!staffMember) return null;

                  return (
                    <tr key={txn.id} className="border-b border-gray-300">
                      <td className="border border-black p-1 text-center font-mono">{index + 1}</td>
                      <td className="border border-black p-1 font-semibold">{staffMember.name}</td>
                      <td className="border border-black p-1">{staffMember.designation}</td>
                      <td className="border border-black p-1">{staffMember.instituteName || staffMember.instituteCode}</td>
                      <td className="border border-black p-1 text-center">{staffMember.bps}</td>
                      <td className="border border-black p-1 text-center font-mono">{staffMember.cnic}</td>
                      <td className="border border-black p-1 text-right font-mono font-bold">{formatPKR(txn.netSalary)}</td>
                      <td className="border border-black p-1 text-center font-mono">{staffMember.branchCode}</td>
                      <td className="border border-black p-1">{staffMember.bankBranch}</td>
                      <td className="border border-black p-1 font-mono font-bold text-center tracking-wider">{staffMember.bankAccount}</td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-100 font-bold border-t-2 border-black">
                  <td colSpan={6} className="border border-black p-1 text-right">GRAND TOTAL (PKR):</td>
                  <td className="border border-black p-1 text-right font-mono font-bold">Rs. {formatPKR(totalAmount)}</td>
                  <td colSpan={3} className="border border-black p-1"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Official Signatures */}
          <div className="grid grid-cols-2 gap-8 text-center text-xs mt-16 pt-8">
            <div>
              <div className="w-48 border-t border-black mx-auto mb-1"></div>
              <p className="font-bold">Accounts / Budget Officer</p>
              <p className="text-[10px] text-gray-700">District Director Office (TEVTA) Faisalabad</p>
            </div>
            <div>
              <div className="w-48 border-t border-black mx-auto mb-1"></div>
              <p className="font-bold">District Director (TEVTA)</p>
              <p className="text-[10px] text-gray-700">District Faisalabad & Chiniot</p>
            </div>
          </div>

          {/* Document System Footer */}
          <div className="mt-8 pt-2 border-t border-gray-300 flex justify-between items-center text-[9px] text-gray-500 font-mono">
            <span>e-Salary Management System developed by MKZ for District Director Office TEVTA Faisalabad & Chiniot v1.0</span>
            <span>Generated on: {new Date().toLocaleDateString('en-GB')}</span>
          </div>

        </div>

      </div>
    </div>
  );
};
