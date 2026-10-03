import React, { useState } from 'react';
import { TaxDeadline } from '../types/tax';
import { getDaysRemaining } from '../utils/taxCalculations';
import { downloadCalendarFile } from '../utils/calendarExport';
import { CheckCircle2, Circle, Download, ExternalLink, Copy, Check } from 'lucide-react';

interface DeadlineCalendarProps {
  deadlines: TaxDeadline[];
  onToggleDeadline: (id: string) => void;
  year: number;
  onOpenOnyaGuide: () => void;
}

export const DeadlineCalendar: React.FC<DeadlineCalendarProps> = ({
  deadlines,
  onToggleDeadline,
  year,
  onOpenOnyaGuide,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const filteredDeadlines = deadlines.filter(d => {
    if (filter === 'PENDING') return !d.completed;
    if (filter === 'COMPLETED') return d.completed;
    return true;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(id);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  const pendingCount = deadlines.filter(d => !d.completed).length;

  return (
    <div className="space-y-6">
      
      {/* Header section with Export and filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Hivatalos NAV & Adózási Határidők ({year})
            </h2>
            <span className="text-xs font-mono font-semibold text-cyan-800 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/60 px-2 py-0.5 rounded">
              {pendingCount} esedékes teendő
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {year === 2026
              ? 'A 2026. október 1-jei bejelentéshez igazított törvényi határidők és indulási teendők.'
              : 'Mellékállású átalányadózó egyéni vállalkozók pontos törvényi és bevallási határidői.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
                filter === 'ALL' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Összes ({deadlines.length})
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
                filter === 'PENDING' ? 'bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Függőben ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('COMPLETED')}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
                filter === 'COMPLETED' ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Kész ({deadlines.length - pendingCount})
            </button>
          </div>

          <button
            onClick={() => downloadCalendarFile(deadlines, year)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-cyan-50 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-500/30 border border-cyan-300 dark:border-cyan-500/40 transition-colors whitespace-nowrap shadow-xs"
            title="Importáld az összes határidőt Google Naptárba vagy telefonodra"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Naptárba (.ics)</span>
          </button>
        </div>
      </div>

      {/* 2026 Registration Announcement Banner */}
      {year === 2026 && (
        <div className="bg-cyan-50/80 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/40 rounded-xl p-4 flex items-start gap-3 text-xs shadow-xs">
          <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 font-bold shrink-0 mt-0.5">
            2026.10.01
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white">
              Vállalkozás bejelentése: 2026. október 1. (Törtév)
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Mivel az egyéni vállalkozásodat <strong>2026. október 1-jén</strong> jelentetted be, a 2026. I., II. és III. negyedévi határidők rád nem vonatkoztak. Az alábbiakban a bejelentésedhez igazított teendőid láthatók: az indulást követő Kamarai (5 napon belül) és HIPA (15 napon belül) bejelentkezés, majd a legelső kötelező NAV járulékbevallásod (IV. negyedév: <strong>2027. január 12.</strong>)!
            </p>
          </div>
        </div>
      )}

      {/* Deadline list */}
      <div className="grid grid-cols-1 gap-4">
        {filteredDeadlines.map(item => {
          const days = getDaysRemaining(item.date);
          const isUrgent = days >= 0 && days <= 14 && !item.completed;
          const isOverdue = days < 0 && !item.completed;

          return (
            <div
              key={item.id}
              className={`border rounded-xl p-5 transition-all shadow-xs ${
                item.completed
                  ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 opacity-80'
                  : isOverdue
                  ? 'bg-red-50/80 dark:bg-red-950/20 border-red-200 dark:border-red-800/60'
                  : isUrgent
                  ? 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                
                {/* Left check & details */}
                <div className="flex items-start gap-4">
                  
                  {/* Complete checkbox */}
                  <button
                    onClick={() => onToggleDeadline(item.id)}
                    className="mt-0.5 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors shrink-0"
                    title={item.completed ? 'Visszaállítás függőbe' : 'Megjelölés teljesítettként'}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-cyan-800 dark:text-cyan-400">
                        {item.formNumber}
                      </span>
                      <span className="text-slate-400 font-mono">·</span>
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
                        {item.date}
                      </span>

                      {/* Status indicator */}
                      {item.completed ? (
                        <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/50 px-2 py-0.5 rounded">
                          Teljesítve ✓
                        </span>
                      ) : isOverdue ? (
                        <span className="text-[11px] font-semibold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 px-2 py-0.5 rounded animate-pulse">
                          Lejárt {Math.abs(days)} napja!
                        </span>
                      ) : isUrgent ? (
                        <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded">
                          {days === 0 ? 'MA ESEDÉKES!' : `Még ${days} nap`}
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded">
                          Még {days} nap
                        </span>
                      )}
                    </div>

                    <h3 className={`text-base font-bold ${item.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                      {item.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                      {item.description}
                    </p>

                    <div className="text-xs text-slate-500 dark:text-slate-400 pt-1 flex items-start gap-1.5 flex-wrap">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">Hogyan teljesítsd:</span>
                      <span>{item.actionRequired}</span>
                    </div>

                    {item.navAccount && (
                      <div className="mt-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
                        <div className="font-mono text-slate-700 dark:text-slate-300 truncate">
                          <span className="text-slate-500">NAV számlaszám: </span>
                          <span className="text-cyan-700 dark:text-cyan-300 font-bold">{item.navAccount}</span>
                        </div>
                        <button
                          onClick={() => handleCopy(item.navAccount!, item.id)}
                          className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors shrink-0 shadow-xs"
                        >
                          {copiedAccount === item.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span className="text-emerald-700 dark:text-emerald-400 font-bold">Másolva!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Másolás</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                </div>

                {/* Right action CTAs */}
                <div className="flex flex-wrap sm:flex-nowrap lg:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-800/80 w-full lg:w-auto">
                  <div className="flex items-center gap-2">
                    {item.category === 'QUARTERLY_58' && (
                      <button
                        onClick={onOpenOnyaGuide}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-500/10 dark:hover:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30 transition-colors whitespace-nowrap shadow-xs"
                      >
                        ONYA '58 Kitöltő
                      </button>
                    )}

                    <a
                      href={
                        item.category === 'QUARTERLY_58'
                          ? 'https://onya.nav.gov.hu'
                          : item.category === 'HIPA'
                          ? 'https://ohp-20.asp.lgov.hu'
                          : 'https://nav.gov.hu'
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs"
                    >
                      <span>Hivatalos portál</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    Kategória: {item.category}
                  </span>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
