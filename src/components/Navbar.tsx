import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Download,
  Upload,
  Calendar,
  RefreshCw,
  Trash2,
  ChevronDown,
  FileText,
  Calculator,
  Database,
  FileSpreadsheet,
  Sun,
  Moon,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'overview' | 'calendar' | 'ledger' | 'onya' | 'calculator';
  setActiveTab: (tab: 'overview' | 'calendar' | 'ledger' | 'onya' | 'calculator') => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenAddModal: () => void;
  onExportBackup: () => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportCSV: () => void;
  onResetSampleData: () => void;
  onClearAllData: () => void;
  urgentDeadlineDays: number | null;
  entriesCount: number;
  woltRevenue: number;
  otherRevenue: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedYear,
  setSelectedYear,
  theme,
  onToggleTheme,
  onOpenAddModal,
  onExportBackup,
  onImportBackup,
  onExportCSV,
  onResetSampleData,
  onClearAllData,
  urgentDeadlineDays,
  entriesCount,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submenu states
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [dataMenuOpen, setDataMenuOpen] = useState(false);

  const navMenuRef = useRef<HTMLDivElement>(null);
  const dataMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navMenuRef.current && !navMenuRef.current.contains(event.target as Node)) {
        setNavMenuOpen(false);
      }
      if (dataMenuRef.current && !dataMenuRef.current.contains(event.target as Node)) {
        setDataMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isNavTabActive = activeTab === 'calendar' || activeTab === 'onya';

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 select-none transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-4 relative">
        
        {/* Brand / Logo (responsive text so it never overflows on small screens) */}
        <div 
          onClick={() => setActiveTab('overview')} 
          className="flex items-center gap-1.5 sm:gap-2.5 shrink min-w-0 cursor-pointer group"
          title="Kezdőlap / Áttekintés"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold text-sm sm:text-base shrink-0 group-hover:border-cyan-400 transition-colors">
            W
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-base font-bold tracking-tight text-slate-900 dark:text-white truncate">
              <span className="hidden sm:inline">Wolt & Vállalkozói Adózás</span>
              <span className="sm:hidden">Wolt Adózás</span>
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono hidden md:inline-block">
              {selectedYear === 2026 ? 'Indulás: 2026.10.01 (Törtév) · Átalányadó 45%' : `Átalányadó 45% · ${selectedYear}`}
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links with clean submenus */}
        <nav className="hidden lg:flex items-center gap-1.5">
          
          {/* Overview */}
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/40 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            Áttekintés & Keret
          </button>

          {/* Revenue Ledger */}
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'ledger'
                ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/40 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <span>Bevételek</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400">
              {entriesCount}
            </span>
          </button>

          {/* NAV Határidők & ONYA Dropdown Submenu */}
          <div className="relative" ref={navMenuRef}>
            <button
              onClick={() => setNavMenuOpen(!navMenuOpen)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                isNavTabActive
                  ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/40 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <span>NAV & Határidők</span>
              {urgentDeadlineDays !== null && urgentDeadlineDays <= 14 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${navMenuOpen ? 'rotate-180 text-cyan-600 dark:text-cyan-400' : 'text-slate-400'}`} />
            </button>

            {navMenuOpen && (
              <div className="absolute left-0 mt-1.5 w-60 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    setActiveTab('calendar');
                    setNavMenuOpen(false);
                  }}
                  className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center gap-2.5 transition-colors ${
                    activeTab === 'calendar' ? 'bg-cyan-50 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                  <div>
                    <div className="font-semibold flex items-center gap-1.5">
                      <span>NAV Határidő Naptár</span>
                      {urgentDeadlineDays !== null && urgentDeadlineDays <= 14 && (
                        <span className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-800/40">
                          Sürgős
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500">Negyedéves '58, HIPA, MKIK</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('onya');
                    setNavMenuOpen(false);
                  }}
                  className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center gap-2.5 transition-colors border-t border-slate-100 dark:border-slate-800/60 ${
                    activeTab === 'onya' ? 'bg-cyan-50 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-semibold">ONYA '58 Útmutató</div>
                    <div className="text-[11px] text-slate-500">Lépésről lépésre NAV beküldés</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Calculator */}
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'calculator'
                ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/40 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-slate-400" />
            <span>Kalkulátor & Órabér</span>
          </button>

        </nav>

        {/* Right side compact actions with Submenu & Responsive Year Dropdown */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          
          {/* Mobile Year Selector (native touch-friendly picker so options are 100% visible and unclipped!) */}
          <div className="relative sm:hidden">
            <div className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-cyan-700 dark:text-cyan-300 flex items-center gap-1 shadow-xs pointer-events-none">
              <span>{selectedYear}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </div>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10 text-base"
              aria-label="Adóév kiválasztása"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>

          {/* Desktop/Tablet Year selector segmented toggle */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5">
            {[2025, 2026, 2027].map(yr => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
                  selectedYear === yr
                    ? 'bg-white dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>

          {/* Theme Toggle Button (Light/Dark mode) */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
            title={theme === 'dark' ? 'Váltás világos témára' : 'Váltás sötét témára'}
            aria-label="Téma váltás (világos / sötét)"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            )}
            <span className="hidden md:inline">{theme === 'dark' ? 'Világos' : 'Sötét'}</span>
          </button>

          {/* Primary CTA: Add Revenue */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shadow-xs active:scale-95 shrink-0"
            title="Új Wolt vagy egyéb vállalkozói számla rögzítése"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">+ Új Bevétel</span>
            <span className="sm:hidden text-[11px]">Új</span>
          </button>

          {/* Data & Tools Dropdown Submenu */}
          <div className="relative" ref={dataMenuRef}>
            <button
              onClick={() => setDataMenuOpen(!dataMenuOpen)}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1 shrink-0 ${
                dataMenuOpen
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Adatkezelés & Műveletek (Mintaadatok, törlés, mentés)"
            >
              <Database className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span className="hidden md:inline">Adatkezelés</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dataMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {dataMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/60">
                  Mintaadatok & Törlés
                </div>

                <button
                  onClick={() => {
                    onResetSampleData();
                    setDataMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs flex items-center gap-2.5 text-cyan-700 dark:text-cyan-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                  <div>
                    <div className="font-semibold">Mintaadatok betöltése</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Wolt + egyéb számlák ({selectedYear})</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onClearAllData();
                    setDataMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs flex items-center gap-2.5 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0" />
                  <div>
                    <div className="font-semibold">Összes adat törlése</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Tiszta lap indítása</div>
                  </div>
                </button>

                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-y border-slate-100 dark:border-slate-800/60 mt-1">
                  Mentés & Fájl Export
                </div>

                <button
                  onClick={() => {
                    onExportCSV();
                    setDataMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-semibold">Excel / CSV letöltése</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Könyvelőnek továbbítható</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onExportBackup();
                    setDataMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <Download className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                  <div>
                    <div className="font-semibold">Biztonsági mentés (JSON)</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Minden adat lementése</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setDataMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <Upload className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <div>
                    <div className="font-semibold">Mentés visszatöltése</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">JSON fájl beolvasása</div>
                  </div>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={onImportBackup}
                  className="hidden"
                />
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Mobile navigation tab bar - Clean grid without overflow or sliders */}
      <div className="lg:hidden grid grid-cols-5 border-t border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2 text-center font-medium transition-colors ${
            activeTab === 'overview' ? 'text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-500 dark:border-cyan-400 font-bold bg-cyan-50/50 dark:bg-slate-900/60' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Áttekintés
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`py-2 text-center font-medium transition-colors ${
            activeTab === 'ledger' ? 'text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-500 dark:border-cyan-400 font-bold bg-cyan-50/50 dark:bg-slate-900/60' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Bevételek
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`py-2 text-center font-medium transition-colors relative ${
            activeTab === 'calendar' ? 'text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-500 dark:border-cyan-400 font-bold bg-cyan-50/50 dark:bg-slate-900/60' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Határidők
          {urgentDeadlineDays !== null && urgentDeadlineDays <= 14 && (
            <span className="absolute top-1.5 right-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('onya')}
          className={`py-2 text-center font-medium transition-colors ${
            activeTab === 'onya' ? 'text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-500 dark:border-cyan-400 font-bold bg-cyan-50/50 dark:bg-slate-900/60' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          ONYA '58
        </button>
        <button
          onClick={() => setActiveTab('calculator')}
          className={`py-2 text-center font-medium transition-colors ${
            activeTab === 'calculator' ? 'text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-500 dark:border-cyan-400 font-bold bg-cyan-50/50 dark:bg-slate-900/60' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Kalkulátor
        </button>
      </div>
    </header>
  );
};
