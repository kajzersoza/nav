import React, { useState } from 'react';
import { TaxCalculationResult } from '../types/tax';
import { formatHUF } from '../utils/taxCalculations';
import { ExternalLink, CheckCircle2, Copy, Check, AlertTriangle } from 'lucide-react';

interface OnyaGuideViewProps {
  summary: TaxCalculationResult;
  year: number;
}

export const OnyaGuideView: React.FC<OnyaGuideViewProps> = ({ summary, year }) => {
  const [selectedQuarter, setSelectedQuarter] = useState<1 | 2 | 3 | 4>(summary.isPartialYear ? 4 : 3);
  const [copiedData, setCopiedData] = useState(false);

  const quarterData = summary.quarters[selectedQuarter];
  const formCode = `'${String(year).slice(-2)}58`; // e.g. '2658 or '2558

  const handleCopySummary = () => {
    const text = `
=== NAV ONYA ${formCode} KITÖLTÉSI ADATOK (${quarterData.label}) ===
Adóév: ${year}
Negyedév: ${quarterData.label} (${quarterData.months.join(', ')})
Bruttó Wolt bevétel a negyedévben: ${formatHUF(quarterData.grossIncome)}
Költséghányad (45%): ${formatHUF(Math.round(quarterData.grossIncome * 0.45))}
Jövedelem (55%): ${formatHUF(quarterData.taxableIncome)}
Göngyölt jövedelem negyedév végén: ${formatHUF(quarterData.cumulativeTaxableAfter)}
Adómentes éves limit: ${formatHUF(summary.annualTaxFreeAllowance)}
Státusz: ${quarterData.isZeroReturn ? 'ADÓMENTES (0 Ft-os bevallás)' : 'ADÓKÖTELES RÉSZ KÉPZŐDÖTT'}
SZJA (15%): ${formatHUF(quarterData.szjaPayable)}
TB járulék (18.5%): ${formatHUF(quarterData.tbPayable)}
Szocho (13%): ${formatHUF(quarterData.szochoPayable)}
Összes fizetendő: ${formatHUF(quarterData.totalTaxPayable)}
Beadási határidő: ${quarterData.deadlineDate}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedData(true);
    setTimeout(() => setCopiedData(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-800 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/60 px-2 py-0.5 rounded">
                NAV ONYA Útmutató
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Nyomtatvány: {formCode}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              Negyedéves Járulékbevallás Kitöltési Asszisztens
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Mellékállású átalányadózóként <strong>negyedévente</strong> be kell küldened a NAV felé a {formCode}-as járulékbevallást az Online Nyomtatványkitöltő Alkalmazásban (ONYA).
              Itt látod a pontos számokat, amiket be kell írnod!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors whitespace-nowrap shadow-xs"
            >
              {copiedData ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">Kimutatás másolva!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Kimutatás másolása</span>
                </>
              )}
            </button>

            <a
              href="https://onya.nav.gov.hu"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors whitespace-nowrap shadow-xs"
            >
              <span>Belépés az ONYA-ra</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Quarter selector */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold whitespace-nowrap mr-2">Válassz negyedévet:</span>
          {([1, 2, 3, 4] as const).map(q => {
            const isSelected = selectedQuarter === q;
            const qData = summary.quarters[q];
            return (
              <button
                key={q}
                onClick={() => setSelectedQuarter(q)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/50 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span>{qData.label}</span>
                <span className="ml-1.5 font-mono text-[11px] opacity-75">
                  ({qData.totalTaxPayable === 0 ? '0 Ft adó' : formatHUF(qData.totalTaxPayable)})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Quarter Snapshot Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Negyedéves Wolt Bevétel</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
            {formatHUF(quarterData.grossIncome)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            45% költség: {formatHUF(Math.round(quarterData.grossIncome * 0.45))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Adóköteles Jövedelem (55%)</div>
          <div className="text-xl font-bold font-mono text-cyan-700 dark:text-cyan-300 mt-1 tabular-nums">
            {formatHUF(quarterData.taxableIncome)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
            Év elejétől göngyölve: {formatHUF(quarterData.cumulativeTaxableAfter)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Beadási Határidő & Státusz</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {quarterData.deadlineDate}
          </div>
          <div className="mt-1">
            {quarterData.isZeroReturn ? (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                0 Ft-os bevallás (Mentes)
              </span>
            ) : (
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Fizetendő: {formatHUF(quarterData.totalTaxPayable)}
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Step by Step Walkthrough */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 space-y-6 shadow-xs">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Lépésről-lépésre ONYA Kitöltési Útmutató ({quarterData.label})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kövesd az alábbi 5 egyszerű lépést a negyedéves bevallás sikeres leadásához.
          </p>
        </div>

        <div className="space-y-4">
          
          {/* Step 1 */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-400 font-bold font-mono text-sm flex items-center justify-center shrink-0">
              1
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Belépés a NAV ONYA portálra</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Nyisd meg az <a href="https://onya.nav.gov.hu" target="_blank" rel="noopener noreferrer" className="text-cyan-700 dark:text-cyan-400 font-semibold underline">onya.nav.gov.hu</a> oldalt, 
                és jelentkezz be az Ügyfélkapu (KAÜ) vagy Digitális Állampolgárság (DÁP) azonosítóddal.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-400 font-bold font-mono text-sm flex items-center justify-center shrink-0">
              2
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Új nyomtatvány kiválasztása: {formCode}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                A bal oldali menüben kattints az <strong>"Új nyomtatvány / bejelentés"</strong> menüpontra, majd írd be a keresőbe: 
                <span className="font-mono text-cyan-800 dark:text-cyan-300 font-bold mx-1 px-1 bg-slate-200 dark:bg-slate-900 rounded">{formCode.replace("'", "")}</span>. 
                Válaszd ki az egyéni vállalkozói járulékbevallást.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-400 font-bold font-mono text-sm flex items-center justify-center shrink-0">
              3
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Időszak és Jogviszony kód beállítása</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Az időszaknál válaszd a(z) <strong>{quarterData.label}</strong> időtartamát:
              </p>
              <div className="mt-2 p-2.5 bg-white dark:bg-slate-900 rounded-lg text-xs font-mono text-cyan-800 dark:text-cyan-300 border border-slate-200 dark:border-slate-800 font-semibold">
                {selectedQuarter === 1 && 'Időszak: 2026.01.01 – 2026.03.31'}
                {selectedQuarter === 2 && 'Időszak: 2026.04.01 – 2026.06.30'}
                {selectedQuarter === 3 && 'Időszak: 2026.07.01 – 2026.09.30'}
                {selectedQuarter === 4 && 'Időszak: 2026.10.01 – 2026.12.31'}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                <strong>Alkalmazás minősége / Jogviszony kód:</strong> Válaszd a <strong>"21"</strong>-es kódot 
                (<em>Heti 36 órát meghaladó munkaviszony melletti kiegészítő egyéni vállalkozó</em>) vagy nappali tagozatos diákként a megfelelő hallgatói státuszt.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-400 font-bold font-mono text-sm flex items-center justify-center shrink-0">
              4
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Adatok beírása / 0 Ft-os bevallás</h4>
              
              {quarterData.isZeroReturn ? (
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-200">
                    <strong className="text-emerald-800 dark:text-emerald-300 font-bold">0 Ft fizetendő adó!</strong> Az ONYA felületén jelöld be, hogy 
                    <em>"A bevallási időszakban járulékfizetési kötelezettségem nem keletkezett (0 Ft-os bevallás)"</em>, 
                    vagy hagyd 0 Ft-on a járulékalapokat. Mivel a mentes kereten belül vagy, nem kell forintokat utalnod!
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-950 dark:text-amber-200">
                    <strong className="text-amber-800 dark:text-amber-300 font-bold">Figyelem: Átlépted a mentes keretet!</strong> Az alábbi mezőket töltsd ki:
                    <ul className="list-disc pl-5 mt-2 space-y-1 font-mono text-slate-900 dark:text-white">
                      <li>SZJA előleg (15%): {formatHUF(quarterData.szjaPayable)}</li>
                      <li>TB járulék (18.5%): {formatHUF(quarterData.tbPayable)}</li>
                      <li>Szociális hozzájárulási adó (13%): {formatHUF(quarterData.szochoPayable)}</li>
                    </ul>
                    <div className="mt-2 text-amber-900 dark:text-amber-300 font-semibold">
                      Összes átutalandó a NAV felé: <strong>{formatHUF(quarterData.totalTaxPayable)}</strong> (Határidő: {quarterData.deadlineDate})
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 5 */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-400 font-bold font-mono text-sm flex items-center justify-center shrink-0">
              5
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Ellenőrzés & Beküldés</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Kattints az <strong>"Ellenőrzés"</strong> gombra a jobb felső sarokban. 
                Ha nincs hiba (zöld pipa), kattints a <strong>"Tovább a beadáshoz"</strong> és véglegesítsd a benyújtást!
                Töltsd le a visszaigazoló PDF nyugtát.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
