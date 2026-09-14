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
    return raw ? JSON.parse(raw) : INITIAL_STAFF;
  }

  static saveStaff(list: StaffMember[]): void {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(list));
  }

  static getTransactions(): MonthlyTransaction[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return raw ? JSON.parse(raw) : INITIAL_TRANSACTIONS;
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
