import React from 'react';
import { TaxCalculationResult, TaxConfig } from '../types/tax';
import { formatHUF } from '../utils/taxCalculations';
import { ShieldCheck, AlertCircle, TrendingUp, Info, HelpCircle } from 'lucide-react';

interface TaxLimitMeterProps {
  summary: TaxCalculationResult;
  config: TaxConfig;
  revenueFilter: 'ALL' | 'WOLT' | 'OTHER';
  setRevenueFilter: (f: 'ALL' | 'WOLT' | 'OTHER') => void;
  onChangeExpenseRate?: (rate: number) => void;
  onOpenAddModal: () => void;
  onOpenOnya: () => void;
}

export const TaxLimitMeter: React.FC<TaxLimitMeterProps> = ({
  summary,
  config,
  revenueFilter,
  setRevenueFilter,
  onChangeExpenseRate,
  onOpenAddModal,
  onOpenOnya,
}) => {
  const percentage = Math.min(100, Math.round((summary.totalGrossRevenue / summary.revenueTaxFreeThreshold) * 100));
  const isClose = percentage >= 80 && !summary.isOverAllowance;

  return (
    <div className="space-y-6">
      
      {/* Revenue Source Filter Switcher Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white">Megjelenített Bevételi Forrás:</span>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              Szimultán adózás
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            A NAV az összes bevételedre (Wolt + Egyéb) egyszerre, együttesen állapítja meg az adómentességet és az adókat!
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 shrink-0">
          <button
            onClick={() => setRevenueFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              revenueFilter === 'ALL'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Teljes Bevétel ({formatHUF(summary.totalGrossRevenue)})
          </button>
          <button
            onClick={() => setRevenueFilter('WOLT')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              revenueFilter === 'WOLT'
                ? 'bg-cyan-400 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Csak Wolt ({formatHUF(summary.woltGrossRevenue)})
          </button>
          <button
            onClick={() => setRevenueFilter('OTHER')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              revenueFilter === 'OTHER'
                ? 'bg-purple-400 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Csak Egyéb ({formatHUF(summary.otherGrossRevenue)})
          </button>
        </div>
      </div>

      {/* Info Callout if filtered */}
      {revenueFilter !== 'ALL' && (
        <div className="bg-slate-900/60 border border-cyan-800/40 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              Kiválasztva: <strong className="text-white">{revenueFilter === 'WOLT' ? 'Wolt Futárkodás' : 'Egyéb Vállalkozói Számlák'}</strong> (
              <span className="font-mono text-cyan-300">{formatHUF(revenueFilter === 'WOLT' ? summary.woltGrossRevenue : summary.otherGrossRevenue)}</span>
              ). Az adómentes keretfelhasználás és az adózás a teljes <strong className="text-white font-mono">{formatHUF(summary.totalGrossRevenue)}</strong> együttes összeg alapján számítódik.
            </span>
          </div>
          <button
            onClick={() => setRevenueFilter('ALL')}
            className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 whitespace-nowrap underline shrink-0"
          >
            Összes mutatása
          </button>
        </div>
      )}

      {/* Hero Limit Gauge Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 relative overflow-hidden shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-medium text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-0.5 rounded-full">
                {summary.taxYear} Adóév · 45% Átalányköltség
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Minimálbér: {formatHUF(config.monthlyMinWage)} / hó
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Éves Adómentes Keretfigyelő
            </h2>

            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Mellékállású átalányadózóként az éves minimálbér feléig (
              <span className="text-cyan-300 font-mono font-medium">{formatHUF(summary.annualTaxFreeAllowance)}</span> jövedelemig) 
              a vállalkozói bevételed után <strong className="text-emerald-400">0 Ft SZJA, 0 Ft TB és 0 Ft Szocho</strong> terhel. 
              Ez 45%-os költséghányadnál <strong className="text-white font-mono">{formatHUF(summary.revenueTaxFreeThreshold)}</strong> teljes bruttó bevételig biztosít adómentességet!
            </p>
          </div>

          {/* Big Status Badge */}
          <div className="shrink-0 bg-slate-950/70 border border-slate-800 rounded-xl p-4 sm:p-5 text-right flex flex-col items-start lg:items-end justify-center min-w-[240px]">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              {summary.isOverAllowance ? 'Keret túllépve' : 'Hátralévő adómentes keret'}
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white mt-1 tabular-nums">
              {summary.isOverAllowance ? (
                <span className="text-amber-400">+{formatHUF(summary.totalGrossRevenue - summary.revenueTaxFreeThreshold)}</span>
              ) : (
                <span className="text-emerald-400">{formatHUF(summary.remainingRevenueAllowance)}</span>
              )}
            </div>
            <div className="text-xs text-slate-400 mt-1 font-mono">
              {summary.isOverAllowance
                ? 'Adóköteles jövedelem feletti rész képződött'
                : `Még ${formatHUF(summary.remainingRevenueAllowance)} számlázható adómentesen`}
            </div>
          </div>

        </div>

        {/* Progress bar with Wolt and Other segments */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-slate-400 mb-2 gap-1.5">
            <div>
              Teljes bruttó bevétel: <span className="text-white font-bold tabular-nums">{formatHUF(summary.totalGrossRevenue)}</span>
              <span className="text-slate-500 ml-2 font-sans">
                (Wolt: <strong className="text-cyan-300 font-mono">{formatHUF(summary.woltGrossRevenue)}</strong> · Egyéb: <strong className="text-purple-300 font-mono">{formatHUF(summary.otherGrossRevenue)}</strong>)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>{percentage}% keret-kihasználtság</span>
              <span className="text-slate-600">/</span>
              <span>Limit: {formatHUF(summary.revenueTaxFreeThreshold)}</span>
            </div>
          </div>

          {/* Segmented multi-color progress bar */}
          <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 flex">
            {/* Wolt portion */}
            <div
              className="h-full bg-cyan-400 rounded-l-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((summary.woltGrossRevenue / summary.revenueTaxFreeThreshold) * 100))}%` }}
              title={`Wolt bevétel: ${formatHUF(summary.woltGrossRevenue)}`}
            />
            {/* Other portion */}
            <div
              className={`h-full bg-purple-400 transition-all duration-500 ${summary.woltGrossRevenue === 0 ? 'rounded-l-full' : ''} ${percentage >= 100 ? 'rounded-r-full' : ''}`}
              style={{ width: `${Math.min(100 - Math.min(100, Math.round((summary.woltGrossRevenue / summary.revenueTaxFreeThreshold) * 100)), Math.round((summary.otherGrossRevenue / summary.revenueTaxFreeThreshold) * 100))}%` }}
              title={`Egyéb vállalkozói bevétel: ${formatHUF(summary.otherGrossRevenue)}`}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between mt-2.5 text-xs text-slate-400 gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
                Wolt ({formatHUF(summary.woltGrossRevenue)})
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" />
                Egyéb ({formatHUF(summary.otherGrossRevenue)})
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                0 Ft adósáv
              </span>
            </div>
            <div>
              {summary.isOverAllowance ? (
                <span className="text-amber-400 font-medium flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Figyelem: A határ feletti rész 46.5%-os adózás alá esik!
                </span>
              ) : (
                <span className="text-emerald-400 font-medium">
                  Biztonságos zóna – Kizárólag 0 Ft-os bevallás szükséges!
                </span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Gross */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-400">
            {revenueFilter === 'WOLT' ? 'Wolt Futár Bevétel' : revenueFilter === 'OTHER' ? 'Egyéb Vállalkozói Bevétel' : 'Teljes Éves Bevétel'}
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1.5 tabular-nums">
            {formatHUF(
              revenueFilter === 'WOLT'
                ? summary.woltGrossRevenue
                : revenueFilter === 'OTHER'
                ? summary.otherGrossRevenue
                : summary.totalGrossRevenue
            )}
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>Wolt: {formatHUF(summary.woltGrossRevenue)}</span>
            <span className="font-mono text-purple-300">Egyéb: {formatHUF(summary.otherGrossRevenue)}</span>
          </div>
        </div>

        {/* Recognized Flat Expense */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-400">45% Költséghányad (Elismert)</div>
          <div className="text-2xl font-bold font-mono text-cyan-300 mt-1.5 tabular-nums">
            {formatHUF(summary.totalRecognizedExpense)}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Nem kell számlát gyűjtened róla, a törvény automatikusan elismeri!
          </div>
        </div>

        {/* Calculated Net Profit */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-400">Tiszta Zsebbe Maradó Pénz</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1.5 tabular-nums">
            {formatHUF(summary.netEarnings)}
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>Bruttó ~{summary.totalGrossRevenue > 0 ? Math.round((summary.netEarnings / summary.totalGrossRevenue) * 100) : 100}%-a</span>
            <span className="text-emerald-300 font-mono">
              {summary.netPerHour > 0 ? `${formatHUF(summary.netPerHour)} / óra` : ''}
            </span>
          </div>
        </div>

        {/* Total Taxes / Obligations */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
          <div className="text-xs font-medium text-slate-400">NAV & Fix Kötelezettségek</div>
          <div className="text-2xl font-bold font-mono text-white mt-1.5 tabular-nums">
            {formatHUF(summary.totalObligations)}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            {summary.totalNavTaxes === 0 ? (
              <span className="text-emerald-400 font-medium">NAV adó: 0 Ft (csak Kamara + HIPA)</span>
            ) : (
              <span className="text-amber-400 font-mono">NAV adó: {formatHUF(summary.totalNavTaxes)}</span>
            )}
          </div>
        </div>

      </div>

      {/* Tax Breakdown Table & Quarters View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 cols: Quarterly NAV Overview */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">
                Negyedéves Bontás & NAV Járulékfizetés
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                A 2658-as bevallást és az esetleges adófizetést negyedévente kell teljesíteni.
              </p>
            </div>
            <button
              onClick={onOpenOnya}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 border border-cyan-800/60 bg-cyan-950/40 px-3 py-1.5 rounded-lg transition-colors"
            >
              ONYA Kitöltési Adatok
            </button>
          </div>

          {/* Mobile view of quarters */}
          <div className="md:hidden space-y-3">
            {([1, 2, 3, 4] as const).map(q => {
              const data = summary.quarters[q];
              return (
                <div key={q} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white text-sm">{data.label}</span>
                      <span className="text-[11px] text-slate-500 block">{data.months.join(', ')}</span>
                    </div>
                    <div>
                      {data.grossIncome === 0 ? (
                        <span className="text-slate-500 font-mono text-[11px]">Nincs tétel</span>
                      ) : data.isZeroReturn ? (
                        <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded">
                          0 Ft-os bevallás
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-amber-300 bg-amber-950/70 border border-amber-800/60 px-2 py-0.5 rounded">
                          Fizetendő járulék
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase">Bruttó bevétel</span>
                      <span className="font-mono font-bold text-white tabular-nums">{formatHUF(data.grossIncome)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase">Jövedelem (55%)</span>
                      <span className="font-mono text-slate-300 tabular-nums">{formatHUF(data.taxableIncome)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase">NAV adó</span>
                      <span className={`font-mono font-semibold tabular-nums ${data.totalTaxPayable === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {formatHUF(data.totalTaxPayable)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase">Határidő</span>
                      <span className="font-mono text-cyan-300">{data.deadlineDate}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop view of quarters */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="py-2.5 px-3">Időszak</th>
                  <th className="py-2.5 px-3 text-right">Bruttó Bevétel</th>
                  <th className="py-2.5 px-3 text-right">Jövedelem (55%)</th>
                  <th className="py-2.5 px-3 text-right">Fizetendő NAV Adó</th>
                  <th className="py-2.5 px-3 text-center">Határidő</th>
                  <th className="py-2.5 px-3 text-center">Státusz</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {([1, 2, 3, 4] as const).map(q => {
                  const data = summary.quarters[q];
                  return (
                    <tr key={q} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 font-medium text-slate-200">
                        <div>{data.label}</div>
                        <div className="text-[11px] text-slate-500">{data.months.join(', ')}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-medium text-white tabular-nums">
                        {formatHUF(data.grossIncome)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-300 tabular-nums">
                        {formatHUF(data.taxableIncome)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums">
                        {data.totalTaxPayable === 0 ? (
                          <span className="text-emerald-400">0 Ft</span>
                        ) : (
                          <span className="text-amber-400">{formatHUF(data.totalTaxPayable)}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-400">
                        {data.deadlineDate}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {data.grossIncome === 0 ? (
                          <span className="text-slate-500 font-mono text-[11px]">Nincs adat</span>
                        ) : data.isZeroReturn ? (
                          <span className="inline-block text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded">
                            0 Ft-os bevallás
                          </span>
                        ) : (
                          <span className="inline-block text-[11px] font-medium text-amber-300 bg-amber-950/60 border border-amber-800/50 px-2 py-0.5 rounded">
                            Fizetendő járulék
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              Az adókat (SZJA 15%, TB 18.5%, Szocho 13%) csak az adómentes keret feletti részre kell megfizetni!
            </span>
            <span className="font-mono text-slate-300">
              Összes NAV kötelezettség: <strong className="text-white">{formatHUF(summary.totalNavTaxes)}</strong>
            </span>
          </div>
        </div>

        {/* Right 1 col: Annual Obligations & Fixed Costs */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-white">Fix & Adminisztratív Díjak</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              A Wolt-futár egyéni vállalkozás kötelező éves költségei.
            </p>
          </div>

          <div className="space-y-3">
            {/* Kamarai hozzájárulás */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">MKIK Kamarai hozzájárulás</span>
                <span className="font-mono font-bold text-white">5 000 Ft / év</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Kereskedelmi és Iparkamara éves díja. Határidő: <strong className="text-slate-300">Március 31.</strong>
              </p>
            </div>

            {/* HIPA */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">HIPA (Helyi Iparűzési Adó)</span>
                <span className="font-mono font-bold text-cyan-300">{formatHUF(summary.hipaEstimated)}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Sávos adózással számolva (2.5M Ft bevételig 1 000 Ft, 12M Ft-ig ~50 000 Ft/év). Határidő: <strong className="text-slate-300">Május 31.</strong>
              </p>
            </div>

            {/* AAM limit */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">Alanyi Áfamentesség (AAM)</span>
                <span className="font-mono text-slate-400">{summary.aamUsagePercentage}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full"
                  style={{ width: `${summary.aamUsagePercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 font-mono">
                <span>{formatHUF(summary.totalGrossRevenue)}</span>
                <span>Max: {formatHUF(summary.aamLimit)}</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/40 text-xs text-slate-300 space-y-1">
            <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Tiszta megmaradó arány: ~95–98%
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Mentes keret alatt a Wolttól kapott bruttó összeg szinte teljes egésze megmarad, amiből csak a saját járműved fenntartását kell fedezned!
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
