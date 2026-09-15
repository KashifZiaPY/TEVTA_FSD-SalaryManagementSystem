import { Institute, StaffMember, MonthlyTransaction, SystemConfig } from '../types/payroll';

export const INITIAL_CONFIG: SystemConfig = {
  activeMonth: "September 2026",
  activePeriod: "2026-09",
  submissionDeadline: "2026-09-25 23:59",
  isPortalLocked: false,
  tevtaDwAccount: "5310027832200037",      // TEVTA/NAVTEC/SALARIES Account
  tevtaVisitingAccount: "5310006795600073", // DM OFFICE NON SALARY Account
  unskilledDailyRate: 1538,
  skilledDailyRate: 1975,
  defaultTheoryRate: 500,
  defaultPracticalRate: 250,
  appsScriptUrl: (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_APPS_SCRIPT_URL) || ""
};

export const INITIAL_INSTITUTES: Institute[] = [
  {
    code: "33001",
    name: "District Director Office (TEVTA) Faisalabad",
    shortName: "DD Office Faisalabad",
    district: "Faisalabad",
    pin: "7101",
    principalName: "District Director TEVTA",
    contactMobile: "041-8542522",
    officialEmail: "director.fsd@tevta.gop.pk",
    status: "Active"
  },
  {
    code: "33028",
    name: "Govt. Vocational Training Institute for Women Samanabad Faisalabad",
    shortName: "GVTIW Samanabad",
    district: "Faisalabad",
    pin: "3302",
    principalName: "Mrs. Nasreen Akhtar",
    contactMobile: "041-9200028",
    officialEmail: "gvtiw.smd@gmail.com",
    status: "Active"
  },
  {
    code: "33010",
    name: "Govt. Apprenticeship Training Centre Faisalabad",
    shortName: "GATC, FSD",
    district: "Faisalabad",
    pin: "5412",
    principalName: "Engr. Muhammad Tariq",
    contactMobile: "041-9200010",
    officialEmail: "gatc.fsd@tevta.gop.pk",
    status: "Active"
  },
  {
    code: "33015",
    name: "Govt. Technical Training Institute Faisalabad",
    shortName: "GTTI Faisalabad",
    district: "Faisalabad",
    pin: "6621",
    principalName: "Engr. Zahid Mahmood",
    contactMobile: "041-9200015",
    officialEmail: "gtti.fsd@tevta.gop.pk",
    status: "Active"
  },
  {
    code: "33016",
    name: "Govt. College of Technology (Women) Faisalabad",
    shortName: "GCTW Faisalabad",
    district: "Faisalabad",
    pin: "4419",
    principalName: "Prof. Farzana Kauser",
    contactMobile: "041-9200016",
    officialEmail: "gctw.fsd@tevta.gop.pk",
    status: "Active"
  },
  {
    code: "33018",
    name: "Govt. Technical Training Centre (DMTC) Samundri",
    shortName: "GTTC Samundri",
    district: "Faisalabad",
    pin: "8823",
    principalName: "Muhammad Asif",
    contactMobile: "041-9200018",
    officialEmail: "gttc.smd@tevta.gop.pk",
    status: "Active"
  },
  {
    code: "33022",
    name: "Govt. Technical Training Centre (F) Chak Jhumra",
    shortName: "GTTC F Chak Jhumra",
    district: "Faisalabad",
    pin: "3312",
    principalName: "Ms. Sadia Parveen",
    contactMobile: "041-9200022",
    officialEmail: "gttc.cj@tevta.gop.pk",
    status: "Active"
  },
  {
    code: "33025",
    name: "Govt. Technical Training Centre (F) Tandlianwala",
    shortName: "GTTC F Tandlianwala",
    district: "Faisalabad",
    pin: "9012",
    principalName: "Ms. Robina Yasmeen",
    contactMobile: "041-9200025",
    officialEmail: "gttc.tdw@tevta.gop.pk",
    status: "Active"
  },
  {
    code: "33030",
    name: "Govt. Staff Training College (GSTC) Faisalabad",
    shortName: "GSTC Faisalabad",
    district: "Faisalabad",
    pin: "1104",
    principalName: "Principal GSTC",
    contactMobile: "041-8542522",
    officialEmail: "gstc.fsd@tevta.gop.pk",
    status: "Active"
  },
  {
    code: "33035",
    name: "Govt. College of Technology (GCT) Faisalabad",
    shortName: "GCT (M) Faisalabad",
    district: "Faisalabad",
    pin: "9901",
    principalName: "Principal GCT Faisalabad",
    contactMobile: "041-9200035",
    officialEmail: "gct.fsd@tevta.gop.pk",
    status: "Active"
  },
  {
    code: "34001",
    name: "Govt. Technical Training Institute (B) Chiniot",
    shortName: "GTTI (B) Chiniot",
    district: "Chiniot",
    pin: "4102",
    principalName: "Engr. Khalid Mehmood",
    contactMobile: "047-9200001",
    officialEmail: "gtti.chn@tevta.gop.pk",
    status: "Active"
  },
  {
    code: "34005",
    name: "Govt. Vocational Training Institute for Women Chiniot",
    shortName: "GVTIW Chiniot",
    district: "Chiniot",
    pin: "7821",
    principalName: "Mrs. Shazia Bano",
    contactMobile: "047-9200005",
    officialEmail: "gvtiw.chn@tevta.gop.pk",
    status: "Active"
  },
  {
    code: "34008",
    name: "Govt. Technical Training Centre / DMTC Lalian",
    shortName: "GTTC Lalian",
    district: "Chiniot",
    pin: "5519",
    principalName: "Muhammad Irfan",
    contactMobile: "047-9200008",
    officialEmail: "gttc.lalian@tevta.gop.pk",
    status: "Active"
  },
  {
    code: "34012",
    name: "Govt. Technical Training Centre (M) Bhowana",
    shortName: "GTTC M Bhowana",
    district: "Chiniot",
    pin: "6631",
    principalName: "Tariq Javed",
    contactMobile: "047-9200012",
    officialEmail: "gttc.bhowana@tevta.gop.pk",
    status: "Active"
  }
];

// Clean real-time production roster (dummy placeholder staff & claims removed)
// Live data is captured dynamically from deployed Web App URL
export const INITIAL_STAFF: StaffMember[] = [];

export const INITIAL_TRANSACTIONS: MonthlyTransaction[] = [];
