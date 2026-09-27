import { TaxConfig, WoltEntry, TaxCalculationResult, TaxDeadline, QuarterData } from '../types/tax';

export const DEFAULT_CONFIGS: Record<number, TaxConfig> = {
  2025: {
    taxYear: 2025,
    expenseRate: 0.45,
    monthlyMinWage: 290800,
    employmentType: 'EMPLOYED_36H',
    hipaMode: 'BANDED',
    hipaRatePercent: 2,
    aamLimit: 12000000,
    chamberFee: 5000,
  },
  2026: {
    taxYear: 2026,
    expenseRate: 0.45,
    monthlyMinWage: 322800,
    employmentType: 'EMPLOYED_36H',
    hipaMode: 'BANDED',
    hipaRatePercent: 2,
    aamLimit: 18000000,
    chamberFee: 5000,
  },
  2027: {
    taxYear: 2027,
    expenseRate: 0.45,
    monthlyMinWage: 355000,
    employmentType: 'EMPLOYED_36H',
    hipaMode: 'BANDED',
    hipaRatePercent: 2,
    aamLimit: 18000000,
    chamberFee: 5000,
  }
};

export function getQuarterFromMonth(month: number): 1 | 2 | 3 | 4 {
  if (month <= 3) return 1;
  if (month <= 6) return 2;
  if (month <= 9) return 3;
  return 4;
}

export function formatHUF(amount: number): string {
  return Math.round(amount).toLocaleString('hu-HU') + ' Ft';
}

export function calculateTaxes(entries: WoltEntry[], config: TaxConfig): TaxCalculationResult {
  const yearEntries = entries
    .filter(e => e.year === config.taxYear)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const annualMinWage = config.monthlyMinWage * 12;
  const annualTaxFreeAllowance = annualMinWage / 2; // Éves minimálbér fele = jövedelem adómentes része
  const taxableRate = 1 - config.expenseRate; // pl. 1 - 0.45 = 0.55 (55%)
  const revenueTaxFreeThreshold = Math.round(annualTaxFreeAllowance / taxableRate);

  let cumulativeGross = 0;
  let cumulativeTaxable = 0;

  // Initialize quarters
  const quartersMap: Record<1 | 2 | 3 | 4, {
    gross: number;
    tip: number;
    deliveries: number;
    hours: number;
  }> = {
    1: { gross: 0, tip: 0, deliveries: 0, hours: 0 },
    2: { gross: 0, tip: 0, deliveries: 0, hours: 0 },
    3: { gross: 0, tip: 0, deliveries: 0, hours: 0 },
    4: { gross: 0, tip: 0, deliveries: 0, hours: 0 },
  };

  let totalGross = 0;
  let woltGross = 0;
  let otherGross = 0;
  let totalTips = 0;
  let totalDeliveries = 0;
  let totalHours = 0;
  let totalVehicleCost = 0;

  for (const entry of yearEntries) {
    const q = getQuarterFromMonth(entry.month);
    quartersMap[q].gross += entry.grossIncome;
    quartersMap[q].tip += entry.tip || 0;
    quartersMap[q].deliveries += entry.deliveriesCount || 0;
    quartersMap[q].hours += entry.hoursWorked || 0;

    totalGross += entry.grossIncome;
    if (entry.sourceType === 'OTHER') {
      otherGross += entry.grossIncome;
    } else {
      woltGross += entry.grossIncome;
    }
    totalTips += entry.tip || 0;
    totalDeliveries += entry.deliveriesCount || 0;
    totalHours += entry.hoursWorked || 0;
    totalVehicleCost += entry.fuelAndVehicleCost || 0;
  }

  const recognizedExpense = Math.round(totalGross * config.expenseRate);
  const totalTaxableIncome = Math.round(totalGross * taxableRate);

  // Progressive computation per quarter
  let runningGross = 0;
  let runningTaxable = 0;
  let totalSzja = 0;
  let totalTb = 0;
  let totalSzocho = 0;

  const quartersResult: Record<1 | 2 | 3 | 4, QuarterData> = {} as any;
  const quarterDeadlineDates: Record<1 | 2 | 3 | 4, string> = {
    1: `${config.taxYear}-04-12`,
    2: `${config.taxYear}-07-12`,
    3: `${config.taxYear}-10-12`,
    4: `${config.taxYear + 1}-01-12`,
  };

  const quarterLabels: Record<1 | 2 | 3 | 4, { label: string; months: string[] }> = {
    1: { label: 'I. Negyedév', months: ['Január', 'Február', 'Március'] },
    2: { label: 'II. Negyedév', months: ['Április', 'Május', 'Június'] },
    3: { label: 'III. Negyedév', months: ['Július', 'Augusztus', 'Szeptember'] },
    4: { label: 'IV. Negyedév', months: ['Október', 'November', 'December'] },
  };

  ([1, 2, 3, 4] as const).forEach(q => {
    const qGross = quartersMap[q].gross;
    const qTaxable = Math.round(qGross * taxableRate);
    
    const prevTaxable = runningTaxable;
    const nextTaxable = prevTaxable + qTaxable;

    // How much of this quarter's taxable income exceeds the annual tax free allowance?
    let qTaxableAbove = 0;
    if (nextTaxable > annualTaxFreeAllowance) {
      if (prevTaxable >= annualTaxFreeAllowance) {
        qTaxableAbove = qTaxable;
      } else {
        qTaxableAbove = nextTaxable - annualTaxFreeAllowance;
      }
    }

    const qSzja = Math.round(qTaxableAbove * 0.15);
    const qTb = Math.round(qTaxableAbove * 0.185);
    const qSzocho = Math.round(qTaxableAbove * 0.13);
    const qTotalTax = qSzja + qTb + qSzocho;

    totalSzja += qSzja;
    totalTb += qTb;
    totalSzocho += qSzocho;

    quartersResult[q] = {
      quarter: q,
      label: quarterLabels[q].label,
      months: quarterLabels[q].months,
      grossIncome: qGross,
      tip: quartersMap[q].tip,
      deliveries: quartersMap[q].deliveries,
      hours: quartersMap[q].hours,
      taxableIncome: qTaxable,
      cumulativeGrossBefore: runningGross,
      cumulativeGrossAfter: runningGross + qGross,
      cumulativeTaxableBefore: prevTaxable,
      cumulativeTaxableAfter: nextTaxable,
      szjaPayable: qSzja,
      tbPayable: qTb,
      szochoPayable: qSzocho,
      totalTaxPayable: qTotalTax,
      deadlineDate: quarterDeadlineDates[q],
      isZeroReturn: qTotalTax === 0,
    };

    runningGross += qGross;
    runningTaxable += qTaxable;
  });

  const taxableIncomeAboveThreshold = Math.max(0, totalTaxableIncome - annualTaxFreeAllowance);
  const isOverAllowance = totalTaxableIncome > annualTaxFreeAllowance;
  const remainingRevenueAllowance = Math.max(0, revenueTaxFreeThreshold - totalGross);
  const usedRevenuePercentage = Math.min(100, Math.round((totalGross / revenueTaxFreeThreshold) * 100));

  // HIPA calculation estimate
  // In Hungary sávos (banded) flat-rate HIPA:
  // Under 2.5M Ft revenue: base is 50,000 Ft * rate (e.g. 2% = 1,000 Ft) or small business base
  // Under 12M Ft: base is 2.5M Ft base * rate (50,000 Ft at 2%)
  // Under 18M Ft: base is 6.0M Ft base * rate (120,000 Ft at 2%)
  let hipaEstimated = 0;
  if (config.hipaMode === 'BANDED') {
    if (totalGross === 0) {
      hipaEstimated = 0;
    } else if (totalGross <= 2500000) {
      hipaEstimated = Math.round(50000 * (config.hipaRatePercent / 100));
    } else if (totalGross <= 12000000) {
      hipaEstimated = Math.round(2500000 * (config.hipaRatePercent / 100));
    } else {
      hipaEstimated = Math.round(6000000 * (config.hipaRatePercent / 100));
    }
  } else {
    // Standard HIPA: revenue * (1 - 0.45) * rate%
    hipaEstimated = Math.round(totalTaxableIncome * (config.hipaRatePercent / 100));
  }

  const chamberFee = totalGross > 0 ? config.chamberFee : 0;
  const totalNavTaxes = totalSzja + totalTb + totalSzocho;
  const totalObligations = totalNavTaxes + hipaEstimated + chamberFee;

  const netEarnings = (totalGross + totalTips) - totalObligations - totalVehicleCost;
  const effectiveTaxRatePercent = totalGross > 0 ? Number(((totalObligations / totalGross) * 100).toFixed(1)) : 0;
  const netPerHour = totalHours > 0 ? Math.round(netEarnings / totalHours) : 0;
  const averagePerDelivery = totalDeliveries > 0 ? Math.round((totalGross + totalTips) / totalDeliveries) : 0;

  return {
    taxYear: config.taxYear,
    totalGrossRevenue: totalGross,
    woltGrossRevenue: woltGross,
    otherGrossRevenue: otherGross,
    totalTips,
    totalDeliveries,
    totalHours,
    totalVehicleCost,
    expenseRatePercent: Math.round(config.expenseRate * 100),
    totalRecognizedExpense: recognizedExpense,
    totalTaxableIncome,
    annualMinWage,
    annualTaxFreeAllowance,
    revenueTaxFreeThreshold,
    remainingRevenueAllowance,
    usedRevenuePercentage,
    isOverAllowance,
    taxableIncomeAboveThreshold,
    szjaPayable: totalSzja,
    tbPayable: totalTb,
    szochoPayable: totalSzocho,
    totalNavTaxes,
    hipaEstimated,
    chamberFee,
    totalObligations,
    netEarnings,
    effectiveTaxRatePercent,
    netPerHour,
    averagePerDelivery,
    quarters: quartersResult,
    aamLimit: config.aamLimit,
    remainingAamQuota: Math.max(0, config.aamLimit - totalGross),
    aamUsagePercentage: Math.min(100, Math.round((totalGross / config.aamLimit) * 100)),
  };
}

export function generateTaxDeadlines(year: number): TaxDeadline[] {
  const formPrefix = String(year).slice(-2);
  const nextFormPrefix = String(year + 1).slice(-2);

  return [
    {
      id: `${year}-mkik-chamber`,
      title: 'MKIK Kamarai hozzájárulás befizetése',
      formNumber: 'MKIK',
      date: `${year}-03-31`,
      category: 'CHAMBER',
      description: 'Éves kötelező regisztrációs díj a székhely szerinti Kereskedelmi és Iparkamarának (fix 5 000 Ft).',
      actionRequired: 'Átutalás a területi gazdasági kamara számlájára (Közlemény: adószám + Kamarai regisztráció).',
      completed: false,
    },
    {
      id: `${year}-q1-58`,
      title: `I. Negyedéves járulékbevallás ('${formPrefix}58)`,
      formNumber: `'${formPrefix}58 (vagy ONYA)`,
      date: `${year}-04-12`,
      quarter: 1,
      category: 'QUARTERLY_58',
      description: '01.01 – 03.31 közötti időszak. Ha a kereten belül maradtál, 0 Ft-os bevallást kell beküldeni ONYA-n!',
      actionRequired: 'Beküldés az ONYA-n (Online Nyomtatványkitöltő Alkalmazás) az ügyfélkapuddal.',
      navAccount: '10032000-06056353 (NAV Személyi jövedelemadó)',
      navAccountName: 'NAV SZJA / TB számla (ha van fizetendő)',
      completed: false,
    },
    {
      id: `${year}-annual-szja`,
      title: `Éves SZJA bevallás (${formPrefix}SZJA véglegesítés)`,
      formNumber: `'${formPrefix}SZJA`,
      date: `${year}-05-20`,
      category: 'ANNUAL_SZJA',
      description: `A NAV által készített ${year - 1}-es adóévi tervezet kiegészítése az egyéni vállalkozói átalányadós adatokkal.`,
      actionRequired: 'Belépés az eSZJA felületre, átalányadós jövedelem jóváhagyása és beadás.',
      completed: false,
    },
    {
      id: `${year}-hipa-annual`,
      title: 'Éves HIPA (Helyi Iparűzési Adó) bevallás és elszámolás',
      formNumber: 'HIPA / E-önkormányzat',
      date: `${year}-05-31`,
      category: 'HIPA',
      description: 'Előző évi HIPA elszámolása és sávos adózási nyilatkozat az önkormányzat felé az E-önkormányzat portálon.',
      actionRequired: 'E-önkormányzat portálon vagy NAV-on keresztüli HIPA nyomtatvány beküldése és befizetés.',
      completed: false,
    },
    {
      id: `${year}-q2-58`,
      title: `II. Negyedéves járulékbevallás ('${formPrefix}58)`,
      formNumber: `'${formPrefix}58 (vagy ONYA)`,
      date: `${year}-07-12`,
      quarter: 2,
      category: 'QUARTERLY_58',
      description: '04.01 – 06.30 közötti időszak. Ha nem lépted túl a mentes keretet, 0 Ft-os bevallás beadása.',
      actionRequired: 'Beküldés az ONYA felületen az ügyfélkapuval.',
      navAccount: '10032000-06056353',
      completed: false,
    },
    {
      id: `${year}-hipa-advance`,
      title: 'HIPA I. félévi előleg befizetés (ha releváns)',
      formNumber: 'HIPA előleg',
      date: `${year}-09-15`,
      category: 'HIPA',
      description: 'Helyi iparűzési adó előleg fizetési határidő az önkormányzat felé (sávos adózóknál az előző évi bevallás szerint).',
      actionRequired: 'Átutalás az illetékes önkormányzat iparűzési adó beszedési számlájára.',
      completed: false,
    },
    {
      id: `${year}-q3-58`,
      title: `III. Negyedéves járulékbevallás ('${formPrefix}58)`,
      formNumber: `'${formPrefix}58 (vagy ONYA)`,
      date: `${year}-10-12`,
      quarter: 3,
      category: 'QUARTERLY_58',
      description: '07.01 – 09.30 közötti időszak. Ellenőrizd a bevételt: közeledsz-e a ~3,5-3,8M Ft adómentes határhoz!',
      actionRequired: 'Beküldés az ONYA felületen az ügyfélkapuval.',
      navAccount: '10032000-06056353',
      completed: false,
    },
    {
      id: `${year}-q4-58`,
      title: `IV. Negyedéves járulékbevallás ('${formPrefix}58)`,
      formNumber: `'${formPrefix}58 (vagy ONYA)`,
      date: `${year + 1}-01-12`,
      quarter: 4,
      category: 'QUARTERLY_58',
      description: `10.01 – 12.31 közötti időszak (a teljes ${year}-es év zárása). Adók és járulékok végső negyedéves rendezése.`,
      actionRequired: `Beküldés az ONYA-n (${year + 1}. január 12-ig).`,
      navAccount: '10032000-06056353',
      completed: false,
    },
  ];
}

export function getDaysRemaining(targetDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDateStr);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export const INITIAL_SAMPLE_ENTRIES_2026: WoltEntry[] = [
  {
    id: 'sample-1',
    sourceType: 'WOLT',
    clientName: 'Wolt Magyarország Kft.',
    date: '2026-01-16',
    year: 2026,
    month: 1,
    period: 'FIRST_HALF',
    periodLabel: '2026. Január 1–15.',
    grossIncome: 142500,
    tip: 11200,
    deliveriesCount: 145,
    hoursWorked: 48,
    fuelAndVehicleCost: 18000,
    invoiceNumber: 'WOLT-2026-01-01',
    notes: 'Két heti elszámolás (hétvégi csúcsidőszakkal)',
    createdAt: Date.now() - 200000000,
  },
  {
    id: 'sample-other-1',
    sourceType: 'OTHER',
    clientName: 'Egyéni Megbízó (Csomagszállítás / Tanácsadás)',
    date: '2026-01-25',
    year: 2026,
    month: 1,
    period: 'CUSTOM',
    periodLabel: '2026. Január (Egyéb)',
    grossIncome: 65000,
    tip: 0,
    deliveriesCount: 10,
    hoursWorked: 8,
    fuelAndVehicleCost: 5000,
    invoiceNumber: 'SZAMLA-2026-001',
    notes: 'Közvetlen megbízási szerződés / egyéb vállalkozói tevékenység',
    createdAt: Date.now() - 190000000,
  },
  {
    id: 'sample-2',
    date: '2026-01-31',
    year: 2026,
    month: 1,
    period: 'SECOND_HALF',
    periodLabel: '2026. Január 16–31.',
    grossIncome: 158000,
    tip: 13500,
    deliveriesCount: 160,
    hoursWorked: 52,
    fuelAndVehicleCost: 21000,
    invoiceNumber: 'WOLT-2026-01-02',
    notes: 'Hóvégi hideg időjárási dinamikus bónusz',
    createdAt: Date.now() - 180000000,
  },
  {
    id: 'sample-3',
    date: '2026-02-15',
    year: 2026,
    month: 2,
    period: 'FIRST_HALF',
    periodLabel: '2026. Február 1–15.',
    grossIncome: 135400,
    tip: 9800,
    deliveriesCount: 138,
    hoursWorked: 44,
    fuelAndVehicleCost: 16500,
    invoiceNumber: 'WOLT-2026-02-01',
    notes: 'Február eleje',
    createdAt: Date.now() - 150000000,
  },
  {
    id: 'sample-4',
    date: '2026-02-28',
    year: 2026,
    month: 2,
    period: 'SECOND_HALF',
    periodLabel: '2026. Február 16–28.',
    grossIncome: 148900,
    tip: 12100,
    deliveriesCount: 152,
    hoursWorked: 49,
    fuelAndVehicleCost: 19000,
    invoiceNumber: 'WOLT-2026-02-02',
    notes: 'Valentin-napi forgalom',
    createdAt: Date.now() - 130000000,
  },
  {
    id: 'sample-5',
    date: '2026-03-15',
    year: 2026,
    month: 3,
    period: 'FIRST_HALF',
    periodLabel: '2026. Március 1–15.',
    grossIncome: 162000,
    tip: 14300,
    deliveriesCount: 165,
    hoursWorked: 54,
    fuelAndVehicleCost: 22000,
    invoiceNumber: 'WOLT-2026-03-01',
    notes: 'Március eleje',
    createdAt: Date.now() - 110000000,
  },
  {
    id: 'sample-6',
    date: '2026-03-31',
    year: 2026,
    month: 3,
    period: 'SECOND_HALF',
    periodLabel: '2026. Március 16–31.',
    grossIncome: 154000,
    tip: 12900,
    deliveriesCount: 155,
    hoursWorked: 50,
    fuelAndVehicleCost: 20000,
    invoiceNumber: 'WOLT-2026-03-02',
    notes: 'Húsvét előtti időszak',
    createdAt: Date.now() - 90000000,
  },
  {
    id: 'sample-7',
    date: '2026-04-15',
    year: 2026,
    month: 4,
    period: 'FIRST_HALF',
    periodLabel: '2026. Április 1–15.',
    grossIncome: 171200,
    tip: 15800,
    deliveriesCount: 170,
    hoursWorked: 55,
    fuelAndVehicleCost: 23000,
    invoiceNumber: 'WOLT-2026-04-01',
    notes: 'II. negyedév indulása',
    createdAt: Date.now() - 70000000,
  },
  {
    id: 'sample-8',
    sourceType: 'WOLT',
    clientName: 'Wolt Magyarország Kft.',
    date: '2026-04-30',
    year: 2026,
    month: 4,
    period: 'SECOND_HALF',
    periodLabel: '2026. Április 16–30.',
    grossIncome: 165000,
    tip: 13900,
    deliveriesCount: 162,
    hoursWorked: 51,
    fuelAndVehicleCost: 21500,
    invoiceNumber: 'WOLT-2026-04-02',
    notes: 'Tavaszi esős napok bónusza',
    createdAt: Date.now() - 50000000,
  },
  {
    id: 'sample-other-2',
    sourceType: 'OTHER',
    clientName: 'Foodora / Egyéb Kézbesítés',
    date: '2026-05-10',
    year: 2026,
    month: 5,
    period: 'CUSTOM',
    periodLabel: '2026. Május (Egyéb bevétel)',
    grossIncome: 88000,
    tip: 3500,
    deliveriesCount: 22,
    hoursWorked: 14,
    fuelAndVehicleCost: 7000,
    invoiceNumber: 'SZAMLA-2026-045',
    notes: 'Kiegészítő futárkodás és egyéb szolgáltatási számla',
    createdAt: Date.now() - 40000000,
  },
  {
    id: 'sample-9',
    date: '2026-05-15',
    year: 2026,
    month: 5,
    period: 'FIRST_HALF',
    periodLabel: '2026. Május 1–15.',
    grossIncome: 178000,
    tip: 16200,
    deliveriesCount: 175,
    hoursWorked: 56,
    fuelAndVehicleCost: 24000,
    invoiceNumber: 'WOLT-2026-05-01',
    notes: 'Május 1. ünnepi forgalom',
    createdAt: Date.now() - 30000000,
  },
  {
    id: 'sample-10',
    date: '2026-05-31',
    year: 2026,
    month: 5,
    period: 'SECOND_HALF',
    periodLabel: '2026. Május 16–31.',
    grossIncome: 184500,
    tip: 17100,
    deliveriesCount: 182,
    hoursWorked: 58,
    fuelAndVehicleCost: 25000,
    invoiceNumber: 'WOLT-2026-05-02',
    notes: 'Május vége',
    createdAt: Date.now() - 15000000,
  },
  {
    id: 'sample-11',
    date: '2026-06-15',
    year: 2026,
    month: 6,
    period: 'FIRST_HALF',
    periodLabel: '2026. Június 1–15.',
    grossIncome: 169000,
    tip: 14500,
    deliveriesCount: 168,
    hoursWorked: 52,
    fuelAndVehicleCost: 22000,
    invoiceNumber: 'WOLT-2026-06-01',
    notes: 'Június eleje',
    createdAt: Date.now() - 8000000,
  },
  {
    id: 'sample-12',
    date: '2026-06-30',
    year: 2026,
    month: 6,
    period: 'SECOND_HALF',
    periodLabel: '2026. Június 16–30.',
    grossIncome: 174000,
    tip: 15200,
    deliveriesCount: 172,
    hoursWorked: 53,
    fuelAndVehicleCost: 23500,
    invoiceNumber: 'WOLT-2026-06-02',
    notes: 'II. negyedév vége',
    createdAt: Date.now() - 2000000,
  },
];
