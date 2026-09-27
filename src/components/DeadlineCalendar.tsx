import React, { useState } from 'react';
import { TaxDeadline } from '../types/tax';
import { getDaysRemaining } from '../utils/taxCalculations';
import { downloadCalendarFile } from '../utils/calendarExport';
import { Calendar, CheckCircle2, Circle, Clock, Download, ExternalLink, Copy, Check, AlertCircle } from 'lucide-react';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white">
              Hivatalos NAV & Adózási Határidők ({year})
            </h2>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
              {pendingCount} esedékes teendő
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Mellékállású átalányadózó egyéni vállalkozók pontos törvényi és bevallási határidői.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                filter === 'ALL' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Összes ({deadlines.length})
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                filter === 'PENDING' ? 'bg-slate-800 text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Függőben ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('COMPLETED')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                filter === 'COMPLETED' ? 'bg-slate-800 text-emerald-300 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Kész ({deadlines.length - pendingCount})
            </button>
          </div>

          <button
            onClick={() => downloadCalendarFile(deadlines, year)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 transition-colors whitespace-nowrap"
            title="Importáld az összes határidőt Google Naptárba vagy telefonodra"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Naptárba (.ics)</span>
          </button>
        </div>
      </div>

      {/* Deadline list */}
      <div className="grid grid-cols-1 gap-4">
        {filteredDeadlines.map(item => {
          const days = getDaysRemaining(item.date);
          const isUrgent = days >= 0 && days <= 14 && !item.completed;
          const isOverdue = days < 0 && !item.completed;

          return (
            <div
              key={item.id}
              className={`border rounded-xl p-5 transition-all ${
                item.completed
                  ? 'bg-slate-900/40 border-slate-800/60 opacity-75'
                  : isOverdue
                  ? 'bg-red-950/20 border-red-800/60'
                  : isUrgent
                  ? 'bg-amber-950/20 border-amber-800/60'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                
                {/* Left check & details */}
                <div className="flex items-start gap-4">
                  
                  {/* Complete checkbox */}
                  <button
                    onClick={() => onToggleDeadline(item.id)}
                    className="mt-0.5 text-slate-400 hover:text-cyan-400 transition-colors shrink-0"
                    title={item.completed ? 'Visszaállítás függőbe' : 'Megjelölés teljesítettként'}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-600 hover:text-slate-400" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-semibold text-cyan-400">
                        {item.formNumber}
                      </span>
                      <span className="text-slate-600 font-mono">·</span>
                      <span className="text-xs font-mono text-slate-300">
                        {item.date}
                      </span>

                      {/* Status indicator */}
                      {item.completed ? (
                        <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-2 py-0.5 rounded">
                          Teljesítve ✓
                        </span>
                      ) : isOverdue ? (
                        <span className="text-[11px] font-medium text-red-300 bg-red-950/60 border border-red-800/60 px-2 py-0.5 rounded animate-pulse">
                          Lejárt {Math.abs(days)} napja!
                        </span>
                      ) : isUrgent ? (
                        <span className="text-[11px] font-medium text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                          {days === 0 ? 'MA ESEDÉKES!' : `Még ${days} nap`}
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">
                          Még {days} nap
                        </span>
                      )}
                    </div>

                    <h3 className={`text-base font-semibold ${item.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                      {item.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                      {item.description}
                    </p>

                    <div className="text-xs text-slate-400 pt-1 flex items-start gap-1.5">
                      <span className="font-semibold text-slate-300 shrink-0">Hogyan teljesítsd:</span>
                      <span>{item.actionRequired}</span>
                    </div>

                    {item.navAccount && (
                      <div className="mt-2.5 p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                        <div className="font-mono text-slate-300 truncate">
                          <span className="text-slate-500">NAV számlaszám: </span>
                          <span className="text-cyan-300 font-semibold">{item.navAccount}</span>
                        </div>
                        <button
                          onClick={() => handleCopy(item.navAccount!, item.id)}
                          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors shrink-0"
                        >
                          {copiedAccount === item.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Másolva!</span>
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
                <div className="flex flex-wrap sm:flex-nowrap lg:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80 w-full lg:w-auto">
                  <div className="flex items-center gap-2">
                    {item.category === 'QUARTERLY_58' && (
                      <button
                        onClick={onOpenOnyaGuide}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/30 transition-colors whitespace-nowrap"
                      >
                        ONYA '58 Kitöltő
                      </button>
                    )}

                    <a
                      href={
                        item.category === 'QUARTERLY_58'
                          ? 'https://onya.nav.gov.hu'
                          : item.category === 'ANNUAL_SZJA'
                          ? 'https://eszja.nav.gov.hu'
                          : 'https://ohp-20.asp.lgov.hu'
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors whitespace-nowrap"
                    >
                      <span>Megnyitás</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <button
                    onClick={() => onToggleDeadline(item.id)}
                    className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors ml-auto sm:ml-0"
                  >
                    {item.completed ? 'Visszavonás' : 'Késznek jelölés'}
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Official NAV Reference Box */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 text-xs text-slate-400 space-y-2">
        <h4 className="font-semibold text-slate-200 flex items-center gap-1.5 text-sm">
          <AlertCircle className="w-4 h-4 text-cyan-400" />
          Törvényi Szabály: Mikor kell 0 Ft-os bevallást beküldeni?
        </h4>
        <p className="leading-relaxed">
          A mellékállású átalányadózó egyéni vállalkozónak a negyedéves <strong>'58-as (pl. 2658-as) nyomtatványt</strong> akkor is be kell küldenie a negyedévet követő hó 12. napjáig, ha <strong>nincs fizetendő járuléka</strong> (mert az adómentes kereten belül van). 
          Az Online Nyomtatványkitöltő Alkalmazásban (ONYA) ilyenkor <strong>0 Ft-os bevallásként</strong> nyújtható be az adatszolgáltatás, amellyel igazolod a NAV felé a törvényes megfelelést.
        </p>
      </div>

    </div>
  );
};
