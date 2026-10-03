import React, { useState } from 'react';
import { WoltEntry } from '../types/tax';
import { formatHUF, getQuarterFromMonth } from '../utils/taxCalculations';
import { ConfirmModal } from './ConfirmModal';
import {
  Plus,
  Trash2,
  Edit2,
  Download,
  Upload,
  RefreshCw,
  FileText,
  Search,
  Bike,
  Briefcase,
  Layers,
} from 'lucide-react';

interface IncomeLedgerProps {
  entries: WoltEntry[];
  year: number;
  revenueFilter: 'ALL' | 'WOLT' | 'OTHER';
  setRevenueFilter: (f: 'ALL' | 'WOLT' | 'OTHER') => void;
  onAddClick: () => void;
  onEditClick: (entry: WoltEntry) => void;
  onDeleteClick: (id: string) => void;
  onResetSampleData: () => void;
  onClearAll: () => void;
  onExportCSV: () => void;
  onImportCSV: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const IncomeLedger: React.FC<IncomeLedgerProps> = ({
  entries,
  year,
  revenueFilter,
  setRevenueFilter,
  onAddClick,
  onEditClick,
  onDeleteClick,
  onResetSampleData,
  onClearAll,
  onExportCSV,
  onImportCSV,
}) => {
  const [selectedQuarter, setSelectedQuarter] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [entryToDelete, setEntryToDelete] = useState<WoltEntry | null>(null);
  const csvInputRef = React.useRef<HTMLInputElement>(null);

  // All entries of current year for header totals
  const allYearEntries = entries.filter(e => e.year === year);
  const totalAllGross = allYearEntries.reduce((sum, e) => sum + e.grossIncome, 0);
  const woltTotalGross = allYearEntries.filter(e => e.sourceType !== 'OTHER').reduce((sum, e) => sum + e.grossIncome, 0);
  const otherTotalGross = allYearEntries.filter(e => e.sourceType === 'OTHER').reduce((sum, e) => sum + e.grossIncome, 0);

  // Filtered entries for view
  const yearEntries = entries
    .filter(e => e.year === year)
    .filter(e => {
      if (revenueFilter === 'WOLT') return e.sourceType !== 'OTHER';
      if (revenueFilter === 'OTHER') return e.sourceType === 'OTHER';
      return true;
    })
    .filter(e => {
      if (selectedQuarter === 'ALL') return true;
      return getQuarterFromMonth(e.month) === selectedQuarter;
    })
    .filter(e => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        e.periodLabel.toLowerCase().includes(q) ||
        (e.clientName && e.clientName.toLowerCase().includes(q)) ||
        (e.invoiceNumber && e.invoiceNumber.toLowerCase().includes(q)) ||
        (e.notes && e.notes.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const currentViewGross = yearEntries.reduce((sum, e) => sum + e.grossIncome, 0);
  const currentViewTips = yearEntries.reduce((sum, e) => sum + (e.tip || 0), 0);
  const currentViewDeliveries = yearEntries.reduce((sum, e) => sum + (e.deliveriesCount || 0), 0);
  const currentViewHours = yearEntries.reduce((sum, e) => sum + (e.hoursWorked || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Top action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Bevételek & Számlák Nyilvántartása ({year})</span>
            <span className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              {allYearEntries.length} tétel
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Wolt futár elszámolások és egyéb vállalkozói bevételek közös nyilvántartása és szimultán adózása.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onAddClick}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shadow-xs active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Új Bevétel rögzítése</span>
          </button>

          <button
            onClick={onResetSampleData}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 border border-cyan-200 dark:border-cyan-800/50 transition-colors whitespace-nowrap shadow-xs"
            title="Mintaadatok újratöltése a teszteléshez"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="hidden sm:inline">Mintaadatok</span>
          </button>

          <button
            onClick={onClearAll}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800/40 transition-colors whitespace-nowrap shadow-xs"
            title="Összes rögzített adat törlése tiszta laphoz"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
            <span className="hidden sm:inline">Törlés</span>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onExportCSV}
              className="flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors whitespace-nowrap shadow-xs"
              title="Exportálás Excel/CSV formátumba könyvelőnek"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            <button
              onClick={() => csvInputRef.current?.click()}
              className="flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors whitespace-nowrap shadow-xs"
              title="CSV importálás"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
            </button>
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv"
              onChange={onImportCSV}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Summary KPI Strip: Total vs Wolt vs Other */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total revenue */}
        <div 
          onClick={() => setRevenueFilter('ALL')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            revenueFilter === 'ALL'
              ? 'bg-white dark:bg-slate-900 border-cyan-500 shadow-sm ring-1 ring-cyan-500'
              : 'bg-white/80 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-300">
              <Layers className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              Teljes Vállalkozói Bevétel
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {allYearEntries.length} db
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
            {formatHUF(totalAllGross)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            NAV átalányadó és mentesség közös alapja
          </div>
        </div>

        {/* Wolt courier revenue */}
        <div 
          onClick={() => setRevenueFilter('WOLT')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            revenueFilter === 'WOLT'
              ? 'bg-white dark:bg-slate-900 border-cyan-400 shadow-sm ring-1 ring-cyan-400'
              : 'bg-white/80 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-bold text-cyan-800 dark:text-cyan-300">
              <Bike className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              Wolt Futár Bevétel
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/40">
              {allYearEntries.filter(e => e.sourceType !== 'OTHER').length} db
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-cyan-700 dark:text-cyan-300 mt-1 tabular-nums">
            {formatHUF(woltTotalGross)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Kétheti önszámlás elszámolások
          </div>
        </div>

        {/* Other freelance revenue */}
        <div 
          onClick={() => setRevenueFilter('OTHER')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            revenueFilter === 'OTHER'
              ? 'bg-white dark:bg-slate-900 border-purple-400 shadow-sm ring-1 ring-purple-400'
              : 'bg-white/80 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-bold text-purple-800 dark:text-purple-300">
              <Briefcase className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              Egyéb Vállalkozói Bevétel
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40">
              {allYearEntries.filter(e => e.sourceType === 'OTHER').length} db
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-purple-700 dark:text-purple-300 mt-1 tabular-nums">
            {formatHUF(otherTotalGross)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Foodora, megbízások, egyéb számlák
          </div>
        </div>
      </div>

      {/* Filter and stats row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Revenue Source Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setRevenueFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
                revenueFilter === 'ALL' ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Minden tétel ({allYearEntries.length})
            </button>
            <button
              onClick={() => setRevenueFilter('WOLT')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
                revenueFilter === 'WOLT' ? 'bg-cyan-400 text-slate-950 font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Csak Wolt
            </button>
            <button
              onClick={() => setRevenueFilter('OTHER')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
                revenueFilter === 'OTHER' ? 'bg-purple-400 text-slate-950 font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Csak Egyéb
            </button>
          </div>

          {/* Quarter buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setSelectedQuarter('ALL')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                selectedQuarter === 'ALL' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Egész év
            </button>
            {[1, 2, 3, 4].map(q => (
              <button
                key={q}
                onClick={() => setSelectedQuarter(q)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                  selectedQuarter === q ? 'bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Q{q}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Keresés megbízó, számlaszám..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 shadow-xs"
          />
        </div>

      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        
        {yearEntries.length === 0 ? (
          <div className="p-8 sm:p-12 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Nincs a szűrésnek megfelelő tétel ({year})</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Kattints az "+ Új Bevétel rögzítése" gombra új tétel hozzáadásához, vagy válts a szűrőkön!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={onAddClick}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold rounded-lg bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors shadow-xs"
              >
                + Új Bevétel felvitele
              </button>
              <button
                onClick={onResetSampleData}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-xs"
              >
                Mintaadatok betöltése
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile View: High-density touch friendly cards */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/80">
              {yearEntries.map(entry => {
                const isOther = entry.sourceType === 'OTHER';
                const deliveryAvg = entry.deliveriesCount > 0
                  ? Math.round((entry.grossIncome + (entry.tip || 0)) / entry.deliveriesCount)
                  : 0;

                return (
                  <div key={entry.id} className="p-4 space-y-3 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                            isOther 
                              ? 'bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60' 
                              : 'bg-cyan-50 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60'
                          }`}>
                            {isOther ? 'Egyéb számla' : 'Wolt Futár'}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white text-sm">{entry.periodLabel}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5 mt-1">
                          <span>{entry.date}</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-700 dark:text-slate-300">{entry.clientName || (isOther ? 'Egyéb partner' : 'Wolt Kft.')}</span>
                          {entry.invoiceNumber && (
                            <>
                              <span className="text-slate-400">·</span>
                              <span className="text-slate-500 dark:text-slate-400">{entry.invoiceNumber}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => onEditClick(entry)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Szerkesztés"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEntryToDelete(entry)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Törlés"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Financial metrics grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-950/70 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Bruttó bevétel</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-sm tabular-nums">
                          {formatHUF(entry.grossIncome)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Borravaló</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm tabular-nums">
                          {entry.tip > 0 ? `+${formatHUF(entry.tip)}` : '0 Ft'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Címek & Órák</span>
                        <span className="font-mono text-slate-700 dark:text-slate-200">
                          {entry.deliveriesCount ? `${entry.deliveriesCount} cím` : '—'} · {entry.hoursWorked ? `${entry.hoursWorked}h` : '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Átlag / cím</span>
                        <span className="font-mono text-cyan-700 dark:text-cyan-300 font-semibold">
                          {deliveryAvg > 0 ? formatHUF(deliveryAvg) : '—'}
                        </span>
                      </div>
                    </div>

                    {entry.fuelAndVehicleCost > 0 && (
                      <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 px-1">
                        <span>Jármű / üzemanyag ráfordítás:</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300">-{formatHUF(entry.fuelAndVehicleCost)}</span>
                      </div>
                    )}

                    {entry.notes && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 italic bg-slate-100 dark:bg-slate-950/40 px-2 py-1 rounded">
                        {entry.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop View: Full detailed table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono bg-slate-50/70 dark:bg-slate-950/40">
                    <th className="py-3 px-4">Típus</th>
                    <th className="py-3 px-4">Megbízó / Időszak</th>
                    <th className="py-3 px-4">Számlaszám</th>
                    <th className="py-3 px-4 text-right">Bruttó Bevétel</th>
                    <th className="py-3 px-4 text-right">Borravaló</th>
                    <th className="py-3 px-4 text-center">Címek</th>
                    <th className="py-3 px-4 text-right">Átlag/cím</th>
                    <th className="py-3 px-4 text-center">Óraszám</th>
                    <th className="py-3 px-4 text-right">Költség</th>
                    <th className="py-3 px-4 text-right">Művelet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {yearEntries.map(entry => {
                    const isOther = entry.sourceType === 'OTHER';
                    const deliveryAvg = entry.deliveriesCount > 0
                      ? Math.round((entry.grossIncome + (entry.tip || 0)) / entry.deliveriesCount)
                      : 0;

                    return (
                      <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                            isOther 
                              ? 'bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60' 
                              : 'bg-cyan-50 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60'
                          }`}>
                            {isOther ? 'Egyéb' : 'Wolt'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-slate-100">{entry.periodLabel}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {entry.date} · {entry.clientName || (isOther ? 'Egyéb ügyfél' : 'Wolt Kft.')}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">
                          {entry.invoiceNumber || '—'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                          {formatHUF(entry.grossIncome)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {entry.tip > 0 ? `+${formatHUF(entry.tip)}` : '—'}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-600 dark:text-slate-400">
                          {entry.deliveriesCount || '—'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-cyan-700 dark:text-cyan-300">
                          {deliveryAvg > 0 ? formatHUF(deliveryAvg) : '—'}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-600 dark:text-slate-400">
                          {entry.hoursWorked ? `${entry.hoursWorked} h` : '—'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-500 dark:text-slate-400">
                          {entry.fuelAndVehicleCost ? `-${formatHUF(entry.fuelAndVehicleCost)}` : '—'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onEditClick(entry)}
                              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                              title="Szerkesztés"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEntryToDelete(entry)}
                              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                              title="Törlés"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Table Footer Summary */}
        {yearEntries.length > 0 && (
          <div className="p-3.5 sm:p-4 bg-slate-50/70 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-400 gap-2">
            <div className="flex items-center gap-3">
              <span>Mutatott tételek: <strong className="text-slate-900 dark:text-white">{yearEntries.length} db</strong></span>
              <span>Címek: <strong className="text-slate-700 dark:text-slate-200">{currentViewDeliveries} db</strong></span>
              <span>Futár órák: <strong className="text-slate-700 dark:text-slate-200">{currentViewHours} h</strong></span>
            </div>
            <div className="flex items-center gap-4 font-mono">
              <span>Borravaló: <strong className="text-emerald-600 dark:text-emerald-400">+{formatHUF(currentViewTips)}</strong></span>
              <span>Szűrt bruttó: <strong className="text-cyan-700 dark:text-cyan-300 text-sm font-bold">{formatHUF(currentViewGross)}</strong></span>
            </div>
          </div>
        )}

      </div>

      {/* In-App Delete Confirmation Modal for Single Entry */}
      <ConfirmModal
        isOpen={entryToDelete !== null}
        title="Tétel Törlése"
        message="Biztosan törölni szeretnéd ezt a tételt a nyilvántartásodból? A törlést követően az adómentes keret és az adózás azonnal újraszámolódik."
        itemDetails={entryToDelete ? [
          { label: 'Típus', value: entryToDelete.sourceType === 'OTHER' ? 'Egyéb vállalkozói számla' : 'Wolt futár elszámolás' },
          { label: 'Időszak / Dátum', value: `${entryToDelete.periodLabel} (${entryToDelete.date})` },
          { label: 'Megbízó / Ügyfél', value: entryToDelete.clientName || (entryToDelete.sourceType === 'OTHER' ? 'Egyéb ügyfél' : 'Wolt Magyarország Kft.') },
          { label: 'Bruttó összeg', value: formatHUF(entryToDelete.grossIncome) },
          ...(entryToDelete.invoiceNumber ? [{ label: 'Számlaszám', value: entryToDelete.invoiceNumber }] : []),
        ] : []}
        confirmText="Törlés véglegesítése"
        cancelText="Mégse"
        isDestructive={true}
        onConfirm={() => {
          if (entryToDelete) {
            onDeleteClick(entryToDelete.id);
            setEntryToDelete(null);
          }
        }}
        onCancel={() => setEntryToDelete(null)}
      />

    </div>
  );
};
