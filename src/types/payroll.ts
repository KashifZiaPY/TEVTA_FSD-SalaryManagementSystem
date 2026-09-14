export type StaffType = 'Daily Wages' | 'Visiting Faculty';

export type EmployeeCategory = 'Skilled' | 'Semi-Skilled' | 'Un-Skilled';

export type SubmissionStatus = 'Draft' | 'Submitted' | 'Approved' | 'Disbursed';

export interface Institute {
  code: string;
  name: string;
  shortName: string;
  district: 'Faisalabad' | 'Chiniot';
  pin: string;
  principalName: string;
  contactMobile: string;
  officialEmail: string;
  status: 'Active' | 'Suspended';
}

export interface StaffMember {
  id: string;
  instituteCode: string;
  instituteName?: string;
  staffType: StaffType;
  name: string;
  fatherName?: string;
  cnic: string;
  designation: string;
  bps: number;
  department: string;
  category: EmployeeCategory;
  joiningDate?: string;
  contractPeriod: string; // e.g. "89 Days", "6 Months", "12 Months"
  contractDaysElapsed?: number;
  dailyRate: number;
  theoryHourlyRate: number;
  practicalHourlyRate: number;
  bankName: string;
  bankBranch: string;
  branchCode: string;
  bankAccount: string; // Stored as 16-digit text
  status: 'Active' | 'Relieved' | 'Expired';
}

export interface MonthlyTransaction {
  id: string;
  payrollMonth: string; // e.g. "September 2026"
  payrollPeriod: string; // e.g. "2026-09"
  staffId: string;
  instituteCode: string;
  staffType: StaffType;
  workingDays: number;
  theoryHours: number;
  practicalHours: number;
  grossSalary: number;
  deductions: number;
  netSalary: number;
  status: SubmissionStatus;
  submittedBy?: string;
  submittedAt?: string;
  approvedBy?: string;
  remarks?: string;
}

export interface UserSession {
  role: 'INSTITUTE' | 'DISTRICT_ADMIN' | 'GUEST';
  instituteCode?: string;
  instituteName?: string;
  district?: string;
  userName: string;
}

export interface SystemConfig {
  activeMonth: string;
  activePeriod: string;
  submissionDeadline: string;
  isPortalLocked: boolean;
  tevtaDwAccount: string;       // 5310027832200037
  tevtaVisitingAccount: string; // 5310006795600073
  unskilledDailyRate: number;   // 1538
  skilledDailyRate: number;     // 1975
  defaultTheoryRate: number;    // 500
  defaultPracticalRate: number; // 250
  appsScriptUrl?: string;
}

export interface AuditAlert {
  id: string;
  type: 'WARNING' | 'DANGER' | 'INFO';
  title: string;
  message: string;
  staffName?: string;
  instituteName?: string;
  cnic?: string;
}
