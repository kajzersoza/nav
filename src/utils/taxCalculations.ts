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
    isPartialYear: false,
    activeMonths: 12,
  },
  2026: {
    taxYear: 2026,
    expenseRate: 0.45,
    monthlyMinWage: 322800, // 2026-os garantált / minimálbér becslés
    employmentType: 'EMPLOYED_36H',
    hipaMode: 'BANDED',
    hipaRatePercent: 2,
    aamLimit: 18000000, // 2026-tól érvényes 18M Ft-os emelt AAM keret
    chamberFee: 5000,
    startDate: '2026-10-01',
    isPartialYear: true,
    activeMonths: 3, // Október, November, December = 3 hónap
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
    isPartialYear: false,
    activeMonths: 12,
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

  const isPartial = Boolean(config.isPartialYear && config.activeMonths && config.activeMonths < 12);
  const activeMonths = isPartial ? (config.activeMonths || 3) : 12;

  const annualMinWage = config.monthlyMinWage * 12;
  const fullYearTaxFreeAllowance = annualMinWage / 2; // Teljes évi 6 havi minimálbér jövedelemmentesség

  // Szja tv. 53. § alapján törtév esetén: minden megkezdett naptári hónapra a minimálbér fele jár!
  const annualTaxFreeAllowance = activeMonths * (config.monthlyMinWage / 2);
  const taxableRate = 1 - config.expenseRate; // 45% költséghányad mellett a jövedelem 55% (0.55)
  const revenueTaxFreeThreshold = Math.round(annualTaxFreeAllowance / taxableRate);

  // Alanyi áfamentesség törtidőszakra (Szja és Áfa tv. alapján napi arányosítással: 92 / 365)
  const activeDays = isPartial ? 92 : 365;
  const proRataAamLimit = isPartial ? Math.round(config.aamLimit * (activeDays / 365)) : config.aamLimit;

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
  const totalTaxableIncome = totalGross - recognizedExpense; // 55%

  const remainingRevenueAllowance = Math.max(0, revenueTaxFreeThreshold - totalGross);
  const usedRevenuePercentage = Math.min(100, Math.round((totalGross / revenueTaxFreeThreshold) * 100));
  const isOverAllowance = totalTaxableIncome > annualTaxFreeAllowance;

  const taxableIncomeAboveThreshold = Math.max(0, totalTaxableIncome - annualTaxFreeAllowance);

  let cumulativeGross = 0;
  let cumulativeTaxable = 0;

  const quartersResult: Record<1 | 2 | 3 | 4, QuarterData> = {
    1: {} as QuarterData,
    2: {} as QuarterData,
    3: {} as QuarterData,
    4: {} as QuarterData,
  };

  const quarterLabels: Record<1 | 2 | 3 | 4, { label: string; months: string[]; deadline: string }> = {
    1: {
      label: 'I. Negyedév',
      months: ['Január', 'Február', 'Március'],
      deadline: isPartial ? 'Nem létezett még a vállalkozás' : `${config.taxYear}. április 12.`,
    },
    2: {
      label: 'II. Negyedév',
      months: ['Április', 'Május', 'Június'],
      deadline: isPartial ? 'Nem létezett még a vállalkozás' : `${config.taxYear}. július 12.`,
    },
    3: {
      label: 'III. Negyedév',
      months: ['Július', 'Augusztus', 'Szeptember'],
      deadline: isPartial ? 'Nem létezett még a vállalkozás' : `${config.taxYear}. október 12.`,
    },
    4: {
      label: isPartial ? 'IV. Negyedév (Első aktív időszak)' : 'IV. Negyedév',
      months: ['Október', 'November', 'December'],
      deadline: `${config.taxYear + 1}. január 12.`,
    },
  };

  let totalSzja = 0;
  let totalTb = 0;
  let totalSzocho = 0;

  for (const q of [1, 2, 3, 4] as const) {
    const qGross = quartersMap[q].gross;
    const qTaxable = Math.round(qGross * taxableRate);

    const prevCumulativeTaxable = cumulativeTaxable;
    cumulativeGross += qGross;
    cumulativeTaxable += qTaxable;

    // Check how much of cumulative taxable exceeds the allowance
    const prevOver = Math.max(0, prevCumulativeTaxable - annualTaxFreeAllowance);
    const currOver = Math.max(0, cumulativeTaxable - annualTaxFreeAllowance);
    const newTaxableThisQuarter = Math.max(0, currOver - prevOver);

    let szja = 0;
    let tb = 0;
    let szocho = 0;

    if (newTaxableThisQuarter > 0) {
      szja = Math.round(newTaxableThisQuarter * 0.15); // 15% SZJA
      // Mellékállásban csak a tényleges adóköteles jövedelem után kell fizetni:
      tb = Math.round(newTaxableThisQuarter * 0.185); // 18.5% TB járulék
      szocho = Math.round(newTaxableThisQuarter * 0.13); // 13% Szocho
    }

    totalSzja += szja;
    totalTb += tb;
    totalSzocho += szocho;

    const isActive = isPartial ? q === 4 : true;

    quartersResult[q] = {
      quarter: q,
      label: quarterLabels[q].label,
      months: quarterLabels[q].months,
      grossIncome: qGross,
      tip: quartersMap[q].tip,
      deliveries: quartersMap[q].deliveries,
      hours: quartersMap[q].hours,
      taxableIncome: qTaxable,
      cumulativeGrossBefore: cumulativeGross - qGross,
      cumulativeGrossAfter: cumulativeGross,
      cumulativeTaxableBefore: prevCumulativeTaxable,
      cumulativeTaxableAfter: cumulativeTaxable,
      szjaPayable: szja,
      tbPayable: tb,
      szochoPayable: szocho,
      totalTaxPayable: szja + tb + szocho,
      deadlineDate: quarterLabels[q].deadline,
      isZeroReturn: (szja + tb + szocho) === 0,
      isActiveQuarter: isActive,
    };
  }

  // HIPA calculation
  let hipaEstimated = 0;
  if (totalGross > 0) {
    if (config.hipaMode === 'BANDED') {
      if (totalGross <= 2500000) {
        hipaEstimated = isPartial ? 2500 : 10000; // Törtév sávos adókedvezmény
      } else if (totalGross <= 12000000) {
        hipaEstimated = isPartial ? 12500 : 50000;
      } else {
        hipaEstimated = isPartial ? 30000 : 120000;
      }
    } else {
      const hipaBase = totalGross * taxableRate;
      hipaEstimated = Math.round(hipaBase * (config.hipaRatePercent / 100));
    }
  }

  const chamberFee = totalGross > 0 ? config.chamberFee : (isPartial ? 5000 : 0);
  const totalNavTaxes = totalSzja + totalTb + totalSzocho;
  const totalObligations = totalNavTaxes + hipaEstimated + chamberFee;

  const netEarnings = (totalGross + totalTips) - totalObligations - totalVehicleCost;
  const effectiveTaxRatePercent = totalGross > 0 ? Number(((totalObligations / totalGross) * 100).toFixed(1)) : 0;
  const netPerHour = totalHours > 0 ? Math.round(netEarnings / totalHours) : 0;
  const averagePerDelivery = totalDeliveries > 0 ? Math.round((totalGross + totalTips) / totalDeliveries) : 0;

  return {
    taxYear: config.taxYear,
    isPartialYear: isPartial,
    startDate: config.startDate,
    activeMonths,
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
    fullYearTaxFreeAllowance,
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
    aamLimit: proRataAamLimit,
    remainingAamQuota: Math.max(0, proRataAamLimit - totalGross),
    aamUsagePercentage: Math.min(100, Math.round((totalGross / proRataAamLimit) * 100)),
  };
}

export function generateTaxDeadlines(year: number): TaxDeadline[] {
  const formPrefix = String(year).slice(-2);
  const nextFormPrefix = String(year + 1).slice(-2);

  // 2026: Vállalkozás indulása 2026. október 1.
  if (year === 2026) {
    return [
      {
        id: '2026-mkik-registration',
        title: 'MKIK Kamarai bejelentkezés & tagdíj',
        formNumber: 'MKIK Regisztráció',
        date: '2026-10-05',
        category: 'CHAMBER',
        description: 'Kötelező kamarai regisztráció az egyéni vállalkozás bejelentésétől (2026.10.01.) számított 5 napon belül, valamint az 5 000 Ft-os hozzájárulás megfizetése.',
        actionRequired: 'Online regisztráció a székhely szerinti kereskedelmi és iparkamaránál és 5 000 Ft átutalása.',
        completed: true,
        completedAt: '2026-10-02',
      },
      {
        id: '2026-hipa-registration',
        title: 'HIPA Bejelentkezés az Önkormányzathoz (15 napon belül)',
        formNumber: 'HIPA / E-önkormányzat',
        date: '2026-10-15',
        category: 'HIPA',
        description: 'Bejelentkezés a székhely szerinti önkormányzati adóhatósághoz az indulástól számított 15 napon belül az E-önkormányzat portálon, valamint a sávos HIPA nyilatkozat megtétele.',
        actionRequired: 'Ügyfélkapus belépés az ohp-20.asp.lgov.hu oldalon, bejelentkezési nyomtatvány beküldése.',
        completed: false,
      },
      {
        id: '2026-wolt-oct-check',
        title: 'Wolt Októberi számlák & kifizetések lekönyvelése',
        formNumber: 'Wolt Elszámolás',
        date: '2026-11-06',
        category: 'WOLT_CYCLE',
        description: 'Az első havi (október 1–31.) önszámlázási elszámolások és banki jóváírások egyeztetése az átalányadó nyilvántartásban.',
        actionRequired: 'A Wolt Partner portálról a havi számlaadatok ellenőrzése és appba történő rögzítése.',
        completed: false,
      },
      {
        id: '2026-q4-58',
        title: `Legelső NAV bevallásod: 2026. IV. negyedév ('${formPrefix}58)`,
        formNumber: `'${formPrefix}58 (ONYA)`,
        date: `${year + 1}-01-12`,
        quarter: 4,
        category: 'QUARTERLY_58',
        description: '2026.10.01 – 2026.12.31 közötti időszak (a vállalkozás indulása óta). Ha a bruttó bevételed 880 364 Ft alatt maradt, 0 Ft-os bevallást kell benyújtanod!',
        actionRequired: `Beküldés az ONYA-n (${year + 1}. január 12-ig). 0 Ft fizetendő esetén is kötelező a beküldés!`,
        navAccount: '10032000-06056353 (NAV Személyi jövedelemadó)',
        navAccountName: 'NAV SZJA számla (ha a kereten felül adó fizetendő)',
        completed: false,
      },
      {
        id: '2027-mkik-annual',
        title: 'MKIK Kamarai hozzájárulás 2027-re',
        formNumber: 'MKIK',
        date: '2027-03-31',
        category: 'CHAMBER',
        description: 'A 2027-es adóév kötelező kamarai hozzájárulásának megfizetése a székhely szerinti Iparkamarának (5 000 Ft).',
        actionRequired: 'Átutalás a kamara bankszámlájára.',
        completed: false,
      },
      {
        id: '2026-annual-szja',
        title: `2026. Évi SZJA bevallás véglegesítése ('${formPrefix}SZJA)`,
        formNumber: `'${formPrefix}SZJA (eSZJA)`,
        date: `${year + 1}-05-20`,
        category: 'ANNUAL_SZJA',
        description: 'A NAV által készített tervezet kiegészítése a 2026. október 1. és december 31. közötti törtidőszaki átalányadós bevételeiddel.',
        actionRequired: 'Belépés az eszja.nav.gov.hu oldalra, adatok ellenőrzése és jóváhagyása.',
        completed: false,
      },
      {
        id: '2026-hipa-annual-closing',
        title: '2026. Évi HIPA bevallás és elszámolás (Törtév)',
        formNumber: 'HIPA / E-önkormányzat',
        date: `${year + 1}-05-31`,
        category: 'HIPA',
        description: 'A 2026-os törtidőszak (Q4) helyi iparűzési adójának véglegesítése az E-önkormányzat portálon az önkormányzat felé.',
        actionRequired: 'E-önkormányzat portálon HIPA nyomtatvány beküldése és a törtidőszaki díj rendezése.',
        completed: false,
      }
    ];
  }

  // 2027 és egyéb teljes évek
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
      description: 'Helyi iparűzési adó előleg fizetési határidő az önkormányzat felé.',
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
      description: '07.01 – 09.30 közötti időszak. Ellenőrizd a bevételt: közeledsz-e a mentes határhoz!',
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

// 2026. október 1-jei induláshoz illeszkedő valósághű mintaadatok (IV. negyedév)
export const INITIAL_SAMPLE_ENTRIES_2026: WoltEntry[] = [
  {
    id: 'sample-2026-10-1',
    sourceType: 'WOLT',
    clientName: 'Wolt Magyarország Kft.',
    date: '2026-10-16',
    year: 2026,
    month: 10,
    period: 'FIRST_HALF',
    periodLabel: '2026. Október 1–15.',
    grossIncome: 142500,
    tip: 12400,
    deliveriesCount: 145,
    hoursWorked: 46,
    fuelAndVehicleCost: 18000,
    invoiceNumber: 'WOLT-2026-10-01',
    notes: 'A vállalkozás indulása (2026.10.01) utáni legelső kétheti kifizetés!',
    createdAt: Date.now() - 40000000,
  },
  {
    id: 'sample-2026-10-2',
    sourceType: 'WOLT',
    clientName: 'Wolt Magyarország Kft.',
    date: '2026-10-31',
    year: 2026,
    month: 10,
    period: 'SECOND_HALF',
    periodLabel: '2026. Október 16–31.',
    grossIncome: 156800,
    tip: 14200,
    deliveriesCount: 158,
    hoursWorked: 50,
    fuelAndVehicleCost: 20500,
    invoiceNumber: 'WOLT-2026-10-02',
    notes: 'Hóvégi forgalom és esős időjárási bónuszok',
    createdAt: Date.now() - 30000000,
  },
  {
    id: 'sample-2026-11-1',
    sourceType: 'WOLT',
    clientName: 'Wolt Magyarország Kft.',
    date: '2026-11-15',
    year: 2026,
    month: 11,
    period: 'FIRST_HALF',
    periodLabel: '2026. November 1–15.',
    grossIncome: 148200,
    tip: 11900,
    deliveriesCount: 150,
    hoursWorked: 48,
    fuelAndVehicleCost: 19000,
    invoiceNumber: 'WOLT-2026-11-01',
    notes: 'November eleje, stabil hétvégi műszakok',
    createdAt: Date.now() - 20000000,
  },
  {
    id: 'sample-2026-11-other',
    sourceType: 'OTHER',
    clientName: 'Egyéni Megbízó (Csomagszállítás / Tanácsadás)',
    date: '2026-11-24',
    year: 2026,
    month: 11,
    period: 'CUSTOM',
    periodLabel: '2026. November (Egyéb számla)',
    grossIncome: 55000,
    tip: 0,
    deliveriesCount: 8,
    hoursWorked: 6,
    fuelAndVehicleCost: 4000,
    invoiceNumber: 'SZAMLA-2026-001',
    notes: 'Közvetlen vállalkozói megbízás az EV keretében',
    createdAt: Date.now() - 15000000,
  },
  {
    id: 'sample-2026-11-2',
    sourceType: 'WOLT',
    clientName: 'Wolt Magyarország Kft.',
    date: '2026-11-30',
    year: 2026,
    month: 11,
    period: 'SECOND_HALF',
    periodLabel: '2026. November 16–30.',
    grossIncome: 164000,
    tip: 15300,
    deliveriesCount: 165,
    hoursWorked: 52,
    fuelAndVehicleCost: 22000,
    invoiceNumber: 'WOLT-2026-11-02',
    notes: 'Black Friday időszak, kiemelt rendelésszám',
    createdAt: Date.now() - 10000000,
  },
  {
    id: 'sample-2026-12-1',
    sourceType: 'WOLT',
    clientName: 'Wolt Magyarország Kft.',
    date: '2026-12-15',
    year: 2026,
    month: 12,
    period: 'FIRST_HALF',
    periodLabel: '2026. December 1–15.',
    grossIncome: 182400,
    tip: 19500,
    deliveriesCount: 178,
    hoursWorked: 56,
    fuelAndVehicleCost: 24000,
    invoiceNumber: 'WOLT-2026-12-01',
    notes: 'Mikulás és karácsonyi előkészületek, magas borravalók',
    createdAt: Date.now() - 5000000,
  },
  {
    id: 'sample-2026-12-2',
    sourceType: 'WOLT',
    clientName: 'Wolt Magyarország Kft.',
    date: '2026-12-31',
    year: 2026,
    month: 12,
    period: 'SECOND_HALF',
    periodLabel: '2026. December 16–31.',
    grossIncome: 171100,
    tip: 18200,
    deliveriesCount: 168,
    hoursWorked: 52,
    fuelAndVehicleCost: 23000,
    invoiceNumber: 'WOLT-2026-12-02',
    notes: 'Karácsonyi és Szilveszteri ünnepi műszakok',
    createdAt: Date.now() - 1000000,
  },
];
