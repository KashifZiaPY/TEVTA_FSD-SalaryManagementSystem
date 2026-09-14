import { StaffMember, MonthlyTransaction, AuditAlert } from '../types/payroll';

/**
 * Validates a Bank of Punjab (BOP) account number:
 * - Must be strictly 16 digits
 * - No characters or punctuation
 */
export function isValidBOPAccount(acc: string): boolean {
  if (!acc) return false;
  const cleaned = acc.replace(/[\s,\-']/g, '');
  return /^\d{16}$/.test(cleaned);
}

/**
 * Validates CNIC format: 00000-0000000-0 (13 digits)
 */
export function isValidCNIC(cnic: string): boolean {
  if (!cnic) return false;
  return /^\d{5}-\d{7}-\d{1}$/.test(cnic.trim());
}

/**
 * Audit & Anomaly Detection Engine
 * Scans staff registry and monthly submissions for compliance with TEVTA & Punjab Govt rules
 */
export function runComplianceAudit(
  staffList: StaffMember[],
  transactions: MonthlyTransaction[]
): AuditAlert[] {
  const alerts: AuditAlert[] = [];

  // 1. Check for Duplicate CNICs across institutes (Anti-Ghost Control)
  const cnicMap = new Map<string, { name: string; institute: string; id: string }[]>();
  staffList.forEach(s => {
    if (s.cnic) {
      const existing = cnicMap.get(s.cnic) || [];
      existing.push({ name: s.name, institute: s.instituteName || s.instituteCode, id: s.id });
      cnicMap.set(s.cnic, existing);
    }
  });

  cnicMap.forEach((occurrences, cnic) => {
    if (occurrences.length > 1) {
      alerts.push({
        id: `DUP-CNIC-${cnic}`,
        type: 'DANGER',
        title: 'Duplicate CNIC Detected',
        message: `CNIC ${cnic} is registered under ${occurrences.length} institutes (${occurrences.map(o => o.institute).join(', ')}). Possible duplicate billing risk!`,
        cnic
      });
    }
  });

  // 2. Check 89-Day Statutory Contract Limit (Statutory Break Requirement)
  staffList.forEach(s => {
    if (s.staffType === 'Daily Wages' && s.contractPeriod.includes('89')) {
      const daysWorked = s.contractDaysElapsed || 75; // Default demo baseline
      if (daysWorked >= 80) {
        alerts.push({
          id: `89-DAY-${s.id}`,
          type: daysWorked >= 89 ? 'DANGER' : 'WARNING',
          title: daysWorked >= 89 ? '89-Day Contract Limit Reached' : '89-Day Statutory Break Due Soon',
          message: `${s.name} (${s.designation}) has completed ${daysWorked} of 89 sanctioned days. Mandatory statutory gap required before re-engagement.`,
          staffName: s.name,
          instituteName: s.instituteName || s.instituteCode
        });
      }
    }
  });

  // 3. Check Visiting Faculty Contact Hours Ceiling
  transactions.forEach(t => {
    if (t.staffType === 'Visiting Faculty') {
      const totalHours = (t.theoryHours || 0) + (t.practicalHours || 0);
      if (totalHours > 160) {
        alerts.push({
          id: `HIGH-HOURS-${t.id}`,
          type: 'WARNING',
          title: 'High Contact Hours Claim',
          message: `Visiting instructor logged ${totalHours} hours in current month (${t.theoryHours}h Theory + ${t.practicalHours}h Practical). Exceeds recommended 160h limit. Requires DD sanction.`,
          instituteName: t.instituteCode
        });
      }
    }
  });

  // 4. Check Invalid Bank Accounts
  staffList.forEach(s => {
    if (!isValidBOPAccount(s.bankAccount)) {
      alerts.push({
        id: `INVALID-BANK-${s.id}`,
        type: 'WARNING',
        title: 'Non-Standard Bank Account Length',
        message: `${s.name} (${s.instituteName || s.instituteCode}) has account '${s.bankAccount}' which is not 16 digits. BOP electronic batch transfer will bounce.`,
        staffName: s.name,
        instituteName: s.instituteName || s.instituteCode
      });
    }
  });

  return alerts;
}
