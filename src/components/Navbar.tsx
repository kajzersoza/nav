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
  ShieldCheck,
  Briefcase,
  Database,
  FileSpreadsheet,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'overview' | 'calendar' | 'ledger' | 'onya' | 'calculator';
  setActiveTab: (tab: 'overview' | 'calendar' | 'ledger' | 'onya' | 'calculator') => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
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
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Brand / Logo */}
        <div 
          onClick={() => setActiveTab('overview')} 
          className="flex items-center gap-2.5 shrink-0 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-base group-hover:border-cyan-400 transition-colors">
            W
          </div>
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-bold tracking-tight text-white whitespace-nowrap">
              Wolt & Vállalkozói Adózás
            </span>
            <span className="text-[10px] text-slate-400 font-mono hidden xs:inline-block">
              Átalányadó 45% · {selectedYear}
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links with clean submenus (NO horizontal slider) */}
        <nav className="hidden lg:flex items-center gap-1.5">
          
          {/* Overview */}
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            Áttekintés & Keret
          </button>

          {/* Revenue Ledger */}
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'ledger'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <span>Bevételek</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400">
              {entriesCount}
            </span>
          </button>

          {/* NAV Határidők & ONYA Dropdown Submenu */}
          <div className="relative" ref={navMenuRef}>
            <button
              onClick={() => setNavMenuOpen(!navMenuOpen)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                isNavTabActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span>NAV & Határidők</span>
              {urgentDeadlineDays !== null && urgentDeadlineDays <= 14 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${navMenuOpen ? 'rotate-180 text-cyan-400' : 'text-slate-400'}`} />
            </button>

            {navMenuOpen && (
              <div className="absolute left-0 mt-1.5 w-60 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    setActiveTab('calendar');
                    setNavMenuOpen(false);
                  }}
                  className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center gap-2.5 transition-colors ${
                    activeTab === 'calendar' ? 'bg-cyan-500/15 text-cyan-300 font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <div className="font-semibold flex items-center gap-1.5">
                      <span>NAV Határidő Naptár</span>
                      {urgentDeadlineDays !== null && urgentDeadlineDays <= 14 && (
                        <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800/40">
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
                  className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center gap-2.5 transition-colors border-t border-slate-800/60 ${
                    activeTab === 'onya' ? 'bg-cyan-500/15 text-cyan-300 font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
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
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-slate-400" />
            <span>Kalkulátor & Órabér</span>
          </button>

        </nav>

        {/* Right side compact actions with Submenu */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Year selector segmented toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            {[2025, 2026, 2027].map(yr => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
                  selectedYear === yr
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>

          {/* Primary CTA: Add Revenue */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-cyan-950 active:scale-95"
            title="Új Wolt vagy egyéb vállalkozói számla rögzítése"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">+ Új Bevétel</span>
            <span className="sm:hidden">+</span>
          </button>

          {/* Data & Tools Dropdown Submenu */}
          <div className="relative" ref={dataMenuRef}>
            <button
              onClick={() => setDataMenuOpen(!dataMenuOpen)}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
                dataMenuOpen
                  ? 'bg-slate-800 text-white border-slate-700'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800/80 hover:text-white'
              }`}
              title="Adatkezelés & Műveletek (Mintaadatok, törlés, mentés)"
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Adatkezelés</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dataMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {dataMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-800/60">
                  Mintaadatok & Törlés
                </div>

                <button
                  onClick={() => {
                    onResetSampleData();
                    setDataMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs flex items-center gap-2.5 text-cyan-300 hover:bg-slate-800 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <div className="font-semibold">Mintaadatok betöltése</div>
                    <div className="text-[11px] text-slate-400">Wolt + egyéb számlák ({selectedYear})</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onClearAllData();
                    setDataMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs flex items-center gap-2.5 text-red-300 hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400 shrink-0" />
                  <div>
                    <div className="font-semibold">Összes adat törlése</div>
                    <div className="text-[11px] text-slate-400">Tiszta lap indítása</div>
                  </div>
                </button>

                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-y border-slate-800/60 mt-1">
                  Mentés & Fájl Export
                </div>

                <button
                  onClick={() => {
                    onExportCSV();
                    setDataMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs flex items-center gap-2.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-semibold">Excel / CSV letöltése</div>
                    <div className="text-[11px] text-slate-400">Könyvelőnek továbbítható</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onExportBackup();
                    setDataMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs flex items-center gap-2.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <Download className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <div className="font-semibold">Biztonsági mentés (JSON)</div>
                    <div className="text-[11px] text-slate-400">Minden adat lementése</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setDataMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs flex items-center gap-2.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <Upload className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <div className="font-semibold">Mentés visszatöltése</div>
                    <div className="text-[11px] text-slate-400">JSON fájl beolvasása</div>
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

      {/* Mobile navigation tab bar - Clean and structured without ugly sliders */}
      <div className="lg:hidden grid grid-cols-5 border-t border-slate-800/80 bg-slate-950 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2 text-center font-medium transition-colors ${
            activeTab === 'overview' ? 'text-cyan-400 border-b-2 border-cyan-400 font-bold bg-slate-900/60' : 'text-slate-400 hover:text-white'
          }`}
        >
          Áttekintés
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`py-2 text-center font-medium transition-colors ${
            activeTab === 'ledger' ? 'text-cyan-400 border-b-2 border-cyan-400 font-bold bg-slate-900/60' : 'text-slate-400 hover:text-white'
          }`}
        >
          Bevételek
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`py-2 text-center font-medium transition-colors relative ${
            activeTab === 'calendar' ? 'text-cyan-400 border-b-2 border-cyan-400 font-bold bg-slate-900/60' : 'text-slate-400 hover:text-white'
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
            activeTab === 'onya' ? 'text-cyan-400 border-b-2 border-cyan-400 font-bold bg-slate-900/60' : 'text-slate-400 hover:text-white'
          }`}
        >
          ONYA '58
        </button>
        <button
          onClick={() => setActiveTab('calculator')}
          className={`py-2 text-center font-medium transition-colors ${
            activeTab === 'calculator' ? 'text-cyan-400 border-b-2 border-cyan-400 font-bold bg-slate-900/60' : 'text-slate-400 hover:text-white'
          }`}
        >
          Kalkulátor
        </button>
      </div>
    </header>
  );
};
