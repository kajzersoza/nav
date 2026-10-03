export type PeriodType = 'FIRST_HALF' | 'SECOND_HALF' | 'FULL_MONTH' | 'CUSTOM';
export type RevenueSourceType = 'WOLT' | 'OTHER';

export interface WoltEntry {
  id: string;
  sourceType?: RevenueSourceType; // 'WOLT' or 'OTHER', defaults to 'WOLT'
  clientName?: string; // pl. "Wolt Magyarország Kft.", vagy más megbízó neve
  date: string; // YYYY-MM-DD (payment or invoice date)
  year: number;
  month: number; // 1-12
  period: PeriodType;
  periodLabel: string; // e.g., "2026. Október 1–15." vagy "Egyéb kifizetés"
  grossIncome: number; // Ft (bruttó kifizetés a számlán)
  tip: number; // Ft (borravaló, ha van)
  deliveriesCount: number; // címek száma (futárnál)
  hoursWorked: number; // ledolgozott órák
  fuelAndVehicleCost: number; // jármű/üzemanyag/egyéb költség (Ft)
  invoiceNumber: string; // számla / kifizetés azonosító
  notes: string;
  createdAt: number;
}

export type EmploymentType = 'EMPLOYED_36H' | 'STUDENT_DAYTIME';
export type HipaMode = 'BANDED' | 'STANDARD';

export interface TaxConfig {
  taxYear: number;
  expenseRate: number; // 0.45 = 45% (Wolt courier flat rate)
  monthlyMinWage: number; // 2026: 322 800 Ft (or 2025: 290 800 Ft)
  employmentType: EmploymentType; // heti 36+ óra főállás vagy nappali diák
  hipaMode: HipaMode;
  hipaRatePercent: number; // standard 2%
  aamLimit: number; // 12 000 000 Ft or 18 000 000 Ft
  chamberFee: number; // 5 000 Ft
  startDate?: string; // e.g. "2026-10-01"
  isPartialYear?: boolean; // true ha törtév (2026.10.01 indulás)
  activeMonths?: number; // pl. 3 hónap (október-december)
}

export interface TaxDeadline {
  id: string;
  title: string;
  formNumber: string; // e.g. "2658", "26SZJA", "HIPA", "MKIK"
  date: string; // YYYY-MM-DD
  quarter?: 1 | 2 | 3 | 4;
  category: 'QUARTERLY_58' | 'ANNUAL_SZJA' | 'HIPA' | 'CHAMBER' | 'WOLT_CYCLE';
  description: string;
  actionRequired: string;
  navAccount?: string; // NAV számlaszám ha befizetendő
  navAccountName?: string;
  completed: boolean;
  completedAt?: string;
}

export interface QuarterData {
  quarter: 1 | 2 | 3 | 4;
  label: string;
  months: string[];
  grossIncome: number;
  tip: number;
  deliveries: number;
  hours: number;
  taxableIncome: number;
  cumulativeGrossBefore: number;
  cumulativeGrossAfter: number;
  cumulativeTaxableBefore: number;
  cumulativeTaxableAfter: number;
  szjaPayable: number;
  tbPayable: number;
  szochoPayable: number;
  totalTaxPayable: number;
  deadlineDate: string;
  isZeroReturn: boolean; // 0 Ft-os bevallás szükséges-e
  isActiveQuarter: boolean; // false ha a vállalkozás még nem működött (pl. 2026 Q1-Q3)
}

export interface TaxCalculationResult {
  taxYear: number;
  totalGrossRevenue: number;
  woltGrossRevenue: number;
  otherGrossRevenue: number;
  totalTips: number;
  totalDeliveries: number;
  totalHours: number;
  totalVehicleCost: number;
  
  // Flat rate metrics
  expenseRatePercent: number;
  totalRecognizedExpense: number; // 45% igazolás nélküli költség
  totalTaxableIncome: number; // 55% adóköteles jövedelem
  
  // Thresholds & Pro-rata metrics
  isPartialYear: boolean;
  startDate?: string;
  activeMonths: number;
  annualMinWage: number;
  fullYearTaxFreeAllowance: number; // Teljes évi mentes jövedelemkeret
  annualTaxFreeAllowance: number; // Időarányos mentes jövedelemkeret (3 hónapra: 484 200 Ft)
  revenueTaxFreeThreshold: number; // Időarányos adómentes bevételi keret (484 200 / 0.55 = 880 364 Ft)
  remainingRevenueAllowance: number;
  usedRevenuePercentage: number;
  isOverAllowance: boolean;
  
  // Tax breakdown
  taxableIncomeAboveThreshold: number;
  szjaPayable: number; // 15%
  tbPayable: number; // 18.5%
  szochoPayable: number; // 13%
  totalNavTaxes: number;
  hipaEstimated: number; // Helyi iparűzési adó becslés
  chamberFee: number; // 5 000 Ft
  totalObligations: number;
  
  // Net calculations
  netEarnings: number; // Bruttó + Borravaló - Adók - Kamara - HIPA - Járműköltség
  effectiveTaxRatePercent: number;
  netPerHour: number;
  averagePerDelivery: number;
  
  // Quarters breakdown
  quarters: Record<1 | 2 | 3 | 4, QuarterData>;
  
  // AAM monitoring (időarányos)
  aamLimit: number;
  remainingAamQuota: number;
  aamUsagePercentage: number;
}
