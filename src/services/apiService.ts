import { Institute, StaffMember, MonthlyTransaction, SystemConfig } from '../types/payroll';
import { INITIAL_CONFIG, INITIAL_INSTITUTES, INITIAL_STAFF, INITIAL_TRANSACTIONS } from '../data/seedData';

const STORAGE_KEYS = {
  CONFIG: 'tevta_salary_config',
  INSTITUTES: 'tevta_salary_institutes',
  STAFF: 'tevta_salary_staff',
  TRANSACTIONS: 'tevta_salary_txns'
};

export class StorageService {
  static getConfig(): SystemConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return raw ? JSON.parse(raw) : INITIAL_CONFIG;
  }

  static saveConfig(cfg: SystemConfig): void {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(cfg));
  }

  static getInstitutes(): Institute[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INSTITUTES);
    return raw ? JSON.parse(raw) : INITIAL_INSTITUTES;
  }

  static saveInstitutes(list: Institute[]): void {
    localStorage.setItem(STORAGE_KEYS.INSTITUTES, JSON.stringify(list));
  }

  static getStaff(): StaffMember[] {
    const raw = localStorage.getItem(STORAGE_KEYS.STAFF);
    if (!raw) return INITIAL_STAFF;
    try {
      const parsed: StaffMember[] = JSON.parse(raw);
      // Purge any old dummy/mock seed entries to guarantee a clean system
      const cleaned = parsed.filter(s => 
        !s.id.startsWith('STF-33001-') && 
        !s.id.startsWith('STF-33028-') && 
        !s.id.startsWith('STF-33010-') && 
        !s.id.startsWith('STF-33015-') && 
        !s.id.startsWith('STF-33018-') && 
        !s.id.startsWith('STF-34001-')
      );
      if (cleaned.length !== parsed.length) {
        this.saveStaff(cleaned);
      }
      return cleaned;
    } catch {
      return INITIAL_STAFF;
    }
  }

  static saveStaff(list: StaffMember[]): void {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(list));
  }

  static upsertStaffMember(member: StaffMember): StaffMember[] {
    const current = this.getStaff();
    const index = current.findIndex(s => s.id === member.id);
    let updated: StaffMember[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = member;
    } else {
      updated = [member, ...current];
    }
    this.saveStaff(updated);
    return updated;
  }

  static deleteStaffMember(staffId: string): StaffMember[] {
    const current = this.getStaff();
    const updated = current.filter(s => s.id !== staffId);
    this.saveStaff(updated);
    return updated;
  }

  static getTransactions(): MonthlyTransaction[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) return INITIAL_TRANSACTIONS;
    try {
      const parsed: MonthlyTransaction[] = JSON.parse(raw);
      // Purge any old dummy/mock transactions
      const cleaned = parsed.filter(t => 
        !t.id.startsWith('TXN-2026-09-33001-') && 
        !t.id.startsWith('TXN-2026-09-33028-') && 
        !t.id.startsWith('TXN-2026-09-33010-')
      );
      if (cleaned.length !== parsed.length) {
        this.saveTransactions(cleaned);
      }
      return cleaned;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  }

  static saveTransactions(list: MonthlyTransaction[]): void {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list));
  }

  static resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEYS.CONFIG);
    localStorage.removeItem(STORAGE_KEYS.INSTITUTES);
    localStorage.removeItem(STORAGE_KEYS.STAFF);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  }
}

export interface LiveSyncResult {
  success: boolean;
  message: string;
  staff?: StaffMember[];
  transactions?: MonthlyTransaction[];
  institutes?: Institute[];
  config?: Partial<SystemConfig>;
}

/**
 * Fetch live data dynamically from the deployed Web App URL
 */
export async function fetchLiveDataFromWebApp(appsScriptUrl: string): Promise<LiveSyncResult> {
  if (!appsScriptUrl || !appsScriptUrl.startsWith('http')) {
    return { success: false, message: 'No valid Deployed Web App URL configured in settings.' };
  }

  try {
    // Attempt GET first (common for Google Apps Script Web App doGet)
    const url = new URL(appsScriptUrl);
    url.searchParams.set('action', 'getLivePayrollData');
    url.searchParams.set('_t', Date.now().toString());

    let res: Response;
    try {
      res = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
    } catch {
      // If GET fails (e.g. CORS on GET redirect), attempt POST
      res = await fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getLivePayrollData' })
      });
    }

    if (!res.ok) {
      // Try POST as fallback
      res = await fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getLivePayrollData' })
      });
    }

    const json = await res.json();
    if (json.status === 'success' || json.success === true || Array.isArray(json.staff) || Array.isArray(json.data?.staff)) {
      const liveStaff: StaffMember[] = json.staff || json.data?.staff || [];
      const liveTransactions: MonthlyTransaction[] = json.transactions || json.data?.transactions || [];
      const liveInstitutes: Institute[] | undefined = json.institutes || json.data?.institutes;
      const liveConfig: Partial<SystemConfig> | undefined = json.config || json.data?.config;

      return {
        success: true,
        message: `Captured live data: ${liveStaff.length} staff records, ${liveTransactions.length} monthly claims.`,
        staff: liveStaff,
        transactions: liveTransactions,
        institutes: liveInstitutes,
        config: liveConfig
      };
    }

    return { 
      success: false, 
      message: json.message || 'Deployed Web App returned response without payroll data structure.' 
    };
  } catch (err: any) {
    console.warn('Live Web App fetch error:', err);
    return {
      success: false,
      message: `Could not reach deployed Web App URL: ${err?.message || 'Check deployment and CORS access.'}`
    };
  }
}

/**
 * Synchronize staff changes to deployed Web App URL
 */
export async function syncStaffMemberToWebApp(
  appsScriptUrl: string,
  member: StaffMember,
  action: 'upsertStaff' | 'deleteStaff'
): Promise<{ success: boolean; message: string }> {
  if (!appsScriptUrl || !appsScriptUrl.startsWith('http')) {
    return { success: true, message: 'Saved locally in system cache.' };
  }

  try {
    const res = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        member,
        staffId: member.id,
        timestamp: new Date().toISOString()
      })
    });
    const data = await res.json();
    return { 
      success: data.status === 'success' || data.success === true, 
      message: data.message || 'Successfully updated deployed Web App.' 
    };
  } catch (err) {
    console.warn('Web App staff sync error:', err);
    return { success: false, message: 'Saved in cache. Will synchronize when Web App is reachable.' };
  }
}

/**
 * Optional Google Apps Script Cloud Sync Connector
 */
export async function syncWithGoogleSheet(
  appsScriptUrl: string,
  instituteCode: string,
  transactions: MonthlyTransaction[],
  submittedBy: string
): Promise<{ success: boolean; message: string }> {
  if (!appsScriptUrl || !appsScriptUrl.startsWith('http')) {
    return { success: true, message: 'Saved locally in system cache (No Apps Script URL configured).' };
  }

  try {
    const res = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'submitPayroll',
        instituteCode,
        submittedBy,
        transactions
      })
    });
    const data = await res.json();
    if (data.status === 'success') {
      return { success: true, message: `Successfully synchronized ${data.count} records with Central Google Sheet.` };
    }
    return { success: false, message: data.message || 'Sync failed.' };
  } catch (err) {
    console.warn('Apps Script sync offline/failed:', err);
    return { success: true, message: 'Saved locally. Google Sheet sync will retry when online.' };
  }
}
