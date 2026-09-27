import React from 'react';
import { TaxDeadline } from '../types/tax';
import { getDaysRemaining } from '../utils/taxCalculations';
import { AlertTriangle, Clock, CheckCircle2, ChevronRight, ArrowUpRight } from 'lucide-react';

interface UrgentAlertBannerProps {
  deadlines: TaxDeadline[];
  onOpenCalendar: () => void;
  onOpenOnyaGuide: () => void;
  isOverAllowance: boolean;
}

export const UrgentAlertBanner: React.FC<UrgentAlertBannerProps> = ({
  deadlines,
  onOpenCalendar,
  onOpenOnyaGuide,
  isOverAllowance,
}) => {
  // Find pending deadlines sorted by date
  const pending = deadlines
    .filter(d => !d.completed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (pending.length === 0) {
    return (
      <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-200">
            <span className="font-semibold text-emerald-300">Minden aktuális NAV kötelezettség teljesítve!</span> Nincs függőben lévő bevallás vagy befizetési határidő erre az időszakra.
          </p>
        </div>
        <button
          onClick={onOpenCalendar}
          className="text-xs text-emerald-400 hover:text-emerald-300 font-medium whitespace-nowrap flex items-center gap-1"
        >
          Naptár megtekintése <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  const next = pending[0];
  const days = getDaysRemaining(next.date);

  let toneClasses = 'bg-slate-900/90 border-slate-800 text-slate-200';
  let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';

  if (days < 0) {
    toneClasses = 'bg-red-950/40 border-red-800/60 text-red-200';
    badgeColor = 'bg-red-900/50 text-red-200 border-red-700';
  } else if (days <= 7) {
    toneClasses = 'bg-amber-950/40 border-amber-800/60 text-amber-200';
    badgeColor = 'bg-amber-900/50 text-amber-200 border-amber-700';
  } else if (days <= 21) {
    toneClasses = 'bg-cyan-950/30 border-cyan-800/50 text-cyan-200';
    badgeColor = 'bg-cyan-900/40 text-cyan-200 border-cyan-700';
  }

  return (
    <div className={`border rounded-xl p-4 sm:p-5 transition-all ${toneClasses}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-lg bg-black/30 border border-white/5 shrink-0 mt-0.5">
            {days < 0 ? (
              <AlertTriangle className="w-5 h-5 text-red-400 animate-bounce" />
            ) : days <= 7 ? (
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            ) : (
              <Clock className="w-5 h-5 text-cyan-400" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded border ${badgeColor}`}>
                {days < 0
                  ? `HATÁRIDŐ LEJÁRT (${Math.abs(days)} napja!)`
                  : days === 0
                  ? 'MA ESEDÉKES!'
                  : `${days} nap van hátra`}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {next.date} · {next.formNumber}
              </span>
            </div>

            <h3 className="text-base font-semibold text-white mt-1">
              Következő esedékes teendő: {next.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {next.description} {next.actionRequired}
            </p>

            {next.category === 'QUARTERLY_58' && (
              <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
                <span className="font-semibold text-slate-300">Wolt Átalányadó státuszod:</span>
                {isOverAllowance ? (
                  <span className="text-amber-300">
                    Átlépted a mentes keretet! A járulékokat (SZJA + TB + Szocho) be kell fizetned a határidő napjáig!
                  </span>
                ) : (
                  <span className="text-emerald-400">
                    Adómentes kereten belül vagy! 0 Ft-os bevallás beadása szükséges az ONYA-n.
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
          {next.category === 'QUARTERLY_58' && (
            <button
              onClick={onOpenOnyaGuide}
              className="flex-1 md:flex-initial px-3 py-2 text-xs font-semibold rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95"
            >
              ONYA Kitöltési Segédlet
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onOpenCalendar}
            className="flex-1 md:flex-initial px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-1 whitespace-nowrap active:scale-95"
          >
            Naptár részletei
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
