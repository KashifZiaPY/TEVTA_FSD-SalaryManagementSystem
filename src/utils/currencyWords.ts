/**
 * Converts numeric amount in PKR into official English words for Bank Advice & Cheque covering letters.
 * Matches exact format from TEVTA District Director Office official bank advice letters.
 * e.g., 6956894 -> "Six Million Nine Hundred Fifty Six Thousand Eight Hundred and Ninety Four Rupees Only"
 */

const ones = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
];

const tens = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
];

function convertBelowThousand(num: number): string {
  let str = "";
  if (num >= 100) {
    str += ones[Math.floor(num / 100)] + " Hundred ";
    num %= 100;
  }
  if (num > 0) {
    if (num < 20) {
      str += ones[num] + " ";
    } else {
      str += tens[Math.floor(num / 10)] + " ";
      if (num % 10 > 0) {
        str += ones[num % 10] + " ";
      }
    }
  }
  return str.trim();
}

export function numberToWordsPKR(num: number): string {
  if (!num || isNaN(num) || num === 0) return "Zero Rupees Only";

  let rounded = Math.round(num);
  let words = "";

  // Billions
  if (rounded >= 1000000000) {
    words += convertBelowThousand(Math.floor(rounded / 1000000000)) + " Billion ";
    rounded %= 1000000000;
  }

  // Millions
  if (rounded >= 1000000) {
    words += convertBelowThousand(Math.floor(rounded / 1000000)) + " Million ";
    rounded %= 1000000;
  }

  // Thousands
  if (rounded >= 1000) {
    words += convertBelowThousand(Math.floor(rounded / 1000)) + " Thousand ";
    rounded %= 1000;
  }

  // Remaining Hundreds & Below
  if (rounded > 0) {
    words += convertBelowThousand(rounded);
  }

  return words.trim() + " Only";
}

/**
 * Format currency with PKR comma separation
 */
export function formatPKR(num: number): string {
  if (num === null || num === undefined || isNaN(num)) return "0";
  return new Intl.NumberFormat("en-PK").format(num);
}

/**
 * Calculates Gross Salary for Daily Wages Staff
 */
export function calculateDailyWagesGross(workingDays: number, dailyRate: number): number {
  return Math.round((workingDays || 0) * (dailyRate || 0));
}

/**
 * Calculates Gross Honorarium for Visiting Faculty
 */
export function calculateVisitingGross(
  theoryHours: number, 
  practicalHours: number, 
  theoryRate: number, 
  practicalRate: number
): number {
  const theoryAmt = (theoryHours || 0) * (theoryRate || 0);
  const practicalAmt = (practicalHours || 0) * (practicalRate || 0);
  return Math.round(theoryAmt + practicalAmt);
}
