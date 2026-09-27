import React, { useState } from 'react';
import { TaxCalculationResult } from '../types/tax';
import { formatHUF } from '../utils/taxCalculations';
import { Bike, Car, DollarSign, Sparkles, TrendingUp, PiggyBank, CheckCircle } from 'lucide-react';

interface CourierPerformanceProps {
  summary: TaxCalculationResult;
}

export const CourierPerformance: React.FC<CourierPerformanceProps> = ({ summary }) => {
  // Simulator states
  const [simDeliveriesPerHour, setSimDeliveriesPerHour] = useState<number>(3);
  const [simAvgFee, setSimAvgFee] = useState<number>(950);
  const [simTipAvg, setSimTipAvg] = useState<number>(150);
  const [simHoursPerWeek, setSimHoursPerWeek] = useState<number>(15);

  const hourlyGross = simDeliveriesPerHour * (simAvgFee + simTipAvg);
  const weeklyGross = hourlyGross * simHoursPerWeek;
  const monthlyGross = weeklyGross * 4.33;
  const annualGross = weeklyGross * 52;

  // Comparison with Billingo / Számlázz.hu costs
  const billingoMonthly = 5200; // Bruttó ~5 200 Ft/hó
  const szamlazzMonthly = 5500; // Bruttó ~5 500 Ft/hó
  const annualSoftwareSaved = billingoMonthly * 12;

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Savings against Billingo / Számlázz.hu */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-emerald-950/40 border border-cyan-800/40 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <PiggyBank className="w-3.5 h-3.5" />
                Automatizáció előfizetés nélkül
              </span>
              <span className="text-xs text-slate-400 font-mono">0 Ft havidíj</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Évi ~{formatHUF(annualSoftwareSaved)} megtakarítás a zsebedben
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              A Wolt <strong>önszámlázási megállapodás</strong> alapján automatikusan kiállítja a számlákat és beküldi a NAV Online Számla rendszerébe.
              Nem szükséges havi 4 500 – 6 000 Ft-ot kifizetned számlázó modulokra (Billingo Átalányadó Plusz / Számlázz.hu MOST), 
              mivel ezzel az appal kézben tarthatod a keretet és a határidőket!
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-center shrink-0 min-w-[200px]">
            <div className="text-xs text-slate-400 font-medium">Megspórolt szoftverköltség</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              +{formatHUF(annualSoftwareSaved)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">éves szinten megmarad</div>
          </div>
        </div>
      </div>

      {/* Actual Wolt Courier Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400">Valós Címdíj Átlagod</div>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {summary.averagePerDelivery > 0 ? formatHUF(summary.averagePerDelivery) : '—'}
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>Díjsáv: 500 – 1 500 Ft</span>
            <span className="font-mono text-cyan-400">{summary.totalDeliveries} cím</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400">Tiszta Nettó Órabéred</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {summary.netPerHour > 0 ? `${formatHUF(summary.netPerHour)} / óra` : '—'}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Várható sáv: 2 500 – 4 500 Ft/óra
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400">Borravaló Arány</div>
          <div className="text-2xl font-bold font-mono text-cyan-300 mt-1 tabular-nums">
            {formatHUF(summary.totalTips)}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            {summary.totalGrossRevenue > 0
              ? `${Math.round((summary.totalTips / summary.totalGrossRevenue) * 100)}% a bruttó bevételhez képest`
              : 'Nincs elég adat'}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400">Üzemanyag & Fenntartás</div>
          <div className="text-2xl font-bold font-mono text-slate-300 mt-1 tabular-nums">
            {formatHUF(summary.totalVehicleCost)}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Saját jármű valós költsége
          </div>
        </div>

      </div>

      {/* Wolt Pricing Guide & Interactive Earnings Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Interactive Earnings Simulator */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-5">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Wolt Futár Bevétel- és Órabér Kalkulátor
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Számold ki a várható bevételedet a heti futár óráid és teljesítményed alapján.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Delivery rate per hour */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                <span className="text-slate-300 font-medium">Óránkénti átlagos címszám:</span>
                <span className="font-mono font-bold text-cyan-300 text-sm">{simDeliveriesPerHour} cím / óra</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSimDeliveriesPerHour(prev => Math.max(1, +(prev - 0.5).toFixed(1)))}
                  className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-lg flex items-center justify-center shrink-0 active:scale-95 transition-all"
                  aria-label="Címszám csökkentése"
                >
                  -
                </button>
                <div className="flex-1 grid grid-cols-4 gap-1.5">
                  {[2.0, 2.5, 3.0, 4.0].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSimDeliveriesPerHour(val)}
                      className={`py-2 rounded-lg font-mono font-medium transition-all text-center ${
                        simDeliveriesPerHour === val
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setSimDeliveriesPerHour(prev => Math.min(6, +(prev + 0.5).toFixed(1)))}
                  className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-lg flex items-center justify-center shrink-0 active:scale-95 transition-all"
                  aria-label="Címszám növelése"
                >
                  +
                </button>
              </div>
            </div>

            {/* Average fee */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                <span className="text-slate-300 font-medium">Átlagos címdíj (távolság + bónusz):</span>
                <span className="font-mono font-bold text-cyan-300 text-sm">{formatHUF(simAvgFee)} / cím</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSimAvgFee(prev => Math.max(500, prev - 50))}
                  className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-lg flex items-center justify-center shrink-0 active:scale-95 transition-all"
                  aria-label="Címdíj csökkentése"
                >
                  -
                </button>
                <div className="flex-1 grid grid-cols-4 gap-1.5">
                  {[750, 950, 1150, 1400].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSimAvgFee(val)}
                      className={`py-2 rounded-lg font-mono font-medium transition-all text-center ${
                        simAvgFee === val
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {val} Ft
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setSimAvgFee(prev => Math.min(2500, prev + 50))}
                  className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-lg flex items-center justify-center shrink-0 active:scale-95 transition-all"
                  aria-label="Címdíj növelése"
                >
                  +
                </button>
              </div>
            </div>

            {/* Tip per delivery */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                <span className="text-slate-300 font-medium">Várható borravaló címenként:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">+{formatHUF(simTipAvg)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSimTipAvg(prev => Math.max(0, prev - 25))}
                  className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-lg flex items-center justify-center shrink-0 active:scale-95 transition-all"
                  aria-label="Borravaló csökkentése"
                >
                  -
                </button>
                <div className="flex-1 grid grid-cols-4 gap-1.5">
                  {[0, 100, 150, 250].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSimTipAvg(val)}
                      className={`py-2 rounded-lg font-mono font-medium transition-all text-center ${
                        simTipAvg === val
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {val === 0 ? '0 Ft' : `+${val} Ft`}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setSimTipAvg(prev => Math.min(800, prev + 25))}
                  className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-lg flex items-center justify-center shrink-0 active:scale-95 transition-all"
                  aria-label="Borravaló növelése"
                >
                  +
                </button>
              </div>
            </div>

            {/* Hours per week */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                <span className="text-slate-300 font-medium">Heti futárkodás (mellékállásban):</span>
                <span className="font-mono font-bold text-white text-sm">{simHoursPerWeek} óra / hét</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSimHoursPerWeek(prev => Math.max(2, prev - 1))}
                  className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-lg flex items-center justify-center shrink-0 active:scale-95 transition-all"
                  aria-label="Óraszám csökkentése"
                >
                  -
                </button>
                <div className="flex-1 grid grid-cols-4 gap-1.5">
                  {[10, 15, 20, 30].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSimHoursPerWeek(val)}
                      className={`py-2 rounded-lg font-mono font-medium transition-all text-center ${
                        simHoursPerWeek === val
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {val} óra
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setSimHoursPerWeek(prev => Math.min(50, prev + 1))}
                  className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-lg flex items-center justify-center shrink-0 active:scale-95 transition-all"
                  aria-label="Óraszám növelése"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Results box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Becsült bruttó órabér:</span>
              <span className="font-mono font-bold text-white text-base">{formatHUF(hourlyGross)} / óra</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Havi várható bruttó:</span>
              <span className="font-mono font-bold text-cyan-300 text-base">{formatHUF(monthlyGross)}</span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-slate-800 pt-2">
              <span className="text-slate-400">Éves várható bevétel:</span>
              <span className="font-mono font-bold text-emerald-400 text-base">{formatHUF(annualGross)}</span>
            </div>
            <div className="text-[11px] text-slate-400 pt-1">
              {annualGross <= summary.revenueTaxFreeThreshold ? (
                <span className="text-emerald-400 font-semibold">
                  ✓ Ez az éves bevétel teljesen befér az adómentes keretbe ({formatHUF(summary.revenueTaxFreeThreshold)})! 0 Ft NAV adó.
                </span>
              ) : (
                <span className="text-amber-400">
                  ! Az éves bevétel túllépi az adómentes keretet {formatHUF(annualGross - summary.revenueTaxFreeThreshold)}-tal. A többletre 46.5% adó terhelődik.
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Right: Courier Pricing Breakdown according to Guide */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-white">
              Wolt Címdíjak & Dinamikus Bónuszok
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Hogyan épül fel a felkérések díjazása a Wolt rendszerében?
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="font-semibold text-slate-200">500 – 700 Ft / cím</div>
              <p className="text-slate-400 mt-1">
                Rövid, párszáz méteres, csúcsidőn kívüli feladatok (gyors felvétel és leadás).
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="font-semibold text-cyan-300">700 – 1 100 Ft / cím (A kiszállítások zöme)</div>
              <p className="text-slate-400 mt-1">
                Átlagos városi távolságok és átlagos forgalmú időszakok.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="font-semibold text-amber-300">1 100 – 1 500+ Ft / cím</div>
              <p className="text-slate-400 mt-1">
                Hosszú távolságok (3–5 km+), kedvezőtlen időjárás (eső, hó), vagy kiemelt csúcsidő (ebéd 11:30–13:30, vacsora 17:30–20:30).
              </p>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 text-xs text-slate-300 space-y-2">
            <div className="font-semibold text-white">Kétheti Elszámolási Ciklusok:</div>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <strong className="text-slate-300">1–15. időszak:</strong> Elszámolás a hó közepén, kifizetés a rákövetkező héten (hó 20-22 körül).
              </li>
              <li>
                <strong className="text-slate-300">16–hó vége:</strong> Elszámolás a hónap utolsó napján, kifizetés következő hó 5-7. napja körül.
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
