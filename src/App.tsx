/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { WoltEntry, TaxConfig, TaxDeadline } from './types/tax';
import {
  DEFAULT_CONFIGS,
  calculateTaxes,
  generateTaxDeadlines,
  INITIAL_SAMPLE_ENTRIES_2026,
  getDaysRemaining,
} from './utils/taxCalculations';
import { exportEntriesToCSV, parseCSVToEntries } from './utils/csvHelpers';
import { Navbar } from './components/Navbar';
import { UrgentAlertBanner } from './components/UrgentAlertBanner';
import { TaxLimitMeter } from './components/TaxLimitMeter';
import { DeadlineCalendar } from './components/DeadlineCalendar';
import { IncomeLedger } from './components/IncomeLedger';
import { OnyaGuideView } from './components/OnyaGuideView';
import { CourierPerformance } from './components/CourierPerformance';
import { AddEntryModal } from './components/AddEntryModal';
import { ConfirmModal } from './components/ConfirmModal';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'ledger' | 'onya' | 'calculator'>('overview');
  const [revenueFilter, setRevenueFilter] = useState<'ALL' | 'WOLT' | 'OTHER'>('ALL');
  
  // Theme state: defaults to 'light' as requested!
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('wolt_app_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light'; // Light theme is the starting default!
  });

  useEffect(() => {
    localStorage.setItem('wolt_app_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Tax configs
  const [configs, setConfigs] = useState<Record<number, TaxConfig>>(() => {
    const saved = localStorage.getItem('wolt_tax_configs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_CONFIGS;
  });

  // Entries
  const [entries, setEntries] = useState<WoltEntry[]>(() => {
    const saved = localStorage.getItem('wolt_entries');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_SAMPLE_ENTRIES_2026;
  });

  // Deadlines per year
  const [deadlinesMap, setDeadlinesMap] = useState<Record<number, TaxDeadline[]>>(() => {
    const map: Record<number, TaxDeadline[]> = {};
    [2025, 2026, 2027].forEach(yr => {
      const saved = localStorage.getItem(`wolt_deadlines_${yr}`);
      if (saved) {
        try {
          map[yr] = JSON.parse(saved);
          return;
        } catch (e) {}
      }
      map[yr] = generateTaxDeadlines(yr);
    });
    return map;
  });

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WoltEntry | null>(null);

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // In-app confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  } | null>(null);

  // Check migration for 2026-10-01 start date
  useEffect(() => {
    const migrationKey = 'wolt_start_date_2026_10_01_v2';
    if (!localStorage.getItem(migrationKey)) {
      setConfigs(DEFAULT_CONFIGS);
      setDeadlinesMap({
        2025: generateTaxDeadlines(2025),
        2026: generateTaxDeadlines(2026),
        2027: generateTaxDeadlines(2027),
      });
      setEntries(prev => {
        const hasPreOctEntries = prev.some(e => e.year === 2026 && e.month < 10);
        if (hasPreOctEntries) {
          return INITIAL_SAMPLE_ENTRIES_2026;
        }
        return prev;
      });
      localStorage.setItem(migrationKey, 'true');
    }
  }, []);

  // Sync entries to localStorage
  useEffect(() => {
    localStorage.setItem('wolt_entries', JSON.stringify(entries));
  }, [entries]);

  // Sync deadlines to localStorage
  useEffect(() => {
    if (deadlinesMap[selectedYear]) {
      localStorage.setItem(`wolt_deadlines_${selectedYear}`, JSON.stringify(deadlinesMap[selectedYear]));
    }
  }, [deadlinesMap, selectedYear]);

  // Sync configs to localStorage
  useEffect(() => {
    localStorage.setItem('wolt_tax_configs', JSON.stringify(configs));
  }, [configs]);

  const activeConfig = configs[selectedYear] || DEFAULT_CONFIGS[selectedYear] || DEFAULT_CONFIGS[2026];
  const activeDeadlines = deadlinesMap[selectedYear] || generateTaxDeadlines(selectedYear);

  // Calculate taxes
  const taxSummary = useMemo(() => {
    return calculateTaxes(entries, activeConfig);
  }, [entries, activeConfig]);

  // Calculate nearest pending deadline
  const urgentDeadlineDays = useMemo(() => {
    const pending = activeDeadlines
      .filter(d => !d.completed)
      .map(d => getDaysRemaining(d.date))
      .sort((a, b) => a - b);
    return pending.length > 0 ? pending[0] : null;
  }, [activeDeadlines]);

  // Handlers
  const handleSaveEntry = (entryData: Omit<WoltEntry, 'id' | 'createdAt'>, editId?: string) => {
    if (editId) {
      setEntries(prev =>
        prev.map(e => (e.id === editId ? { ...e, ...entryData } : e))
      );
    } else {
      const newEntry: WoltEntry = {
        ...entryData,
        id: `wolt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        createdAt: Date.now(),
      };
      setEntries(prev => [newEntry, ...prev]);
    }
    setEditingEntry(null);
  };

  const handleEditClick = (entry: WoltEntry) => {
    setEditingEntry(entry);
    setIsAddModalOpen(true);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    addToast('Tétel sikeresen törölve a nyilvántartásból.', 'success');
  };

  const handleToggleDeadline = (id: string) => {
    setDeadlinesMap(prev => {
      const currentList = prev[selectedYear] || [];
      const updated = currentList.map(d =>
        d.id === id ? { ...d, completed: !d.completed, completedAt: !d.completed ? new Date().toISOString() : undefined } : d
      );
      return { ...prev, [selectedYear]: updated };
    });
  };

  const handleResetSampleData = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Mintaadatok Betöltése',
      message: 'Betöltöd a 2026-os Wolt futár és egyéb vállalkozói mintaadatokat? Ez felülírja a jelenlegi tételeket a tesztadatokkal.',
      confirmText: 'Mintaadatok betöltése',
      isDestructive: false,
      onConfirm: () => {
        setEntries(INITIAL_SAMPLE_ENTRIES_2026);
        setDeadlinesMap(prev => ({
          ...prev,
          [selectedYear]: generateTaxDeadlines(selectedYear)
        }));
        setConfirmDialog(null);
        addToast('Mintaadatok sikeresen betöltve.', 'success');
      }
    });
  };

  const handleClearAll = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Összes Adat Törlése',
      message: 'Biztosan törölni szeretnéd az összes rögzített kifizetést és számlát? Tiszta lappal indul a nyilvántartás.',
      confirmText: 'Minden adat törlése',
      isDestructive: true,
      onConfirm: () => {
        setEntries([]);
        setConfirmDialog(null);
        addToast('Minden rögzített adat törölve lett.', 'info');
      }
    });
  };

  const handleExportBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      entries,
      configs,
      deadlinesMap,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `wolt_ado_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('Biztonsági mentés fájl letöltve.', 'info');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.entries && Array.isArray(parsed.entries)) {
          setEntries(parsed.entries);
        }
        if (parsed.configs) {
          setConfigs(parsed.configs);
        }
        if (parsed.deadlinesMap) {
          setDeadlinesMap(parsed.deadlinesMap);
        }
        addToast('Biztonsági mentés sikeresen visszaállítva!', 'success');
      } catch (err) {
        addToast('Hiba a fájl beolvasása közben. Érvénytelen JSON formátum!', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportCSV = () => {
    exportEntriesToCSV(entries, selectedYear);
    addToast('Excel/CSV fájl letöltve a könyvelő számára.', 'info');
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const text = evt.target?.result as string;
        const imported = parseCSVToEntries(text, selectedYear);
        if (imported.length > 0) {
          setEntries(prev => [...imported, ...prev]);
          addToast(`${imported.length} tétel sikeresen importálva!`, 'success');
        } else {
          addToast('Nem sikerült érvényes tételeket találni a CSV fájlban.', 'error');
        }
      } catch (err) {
        addToast('Hiba a CSV feldolgozása közben!', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-150">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenAddModal={() => {
          setEditingEntry(null);
          setIsAddModalOpen(true);
        }}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onExportCSV={handleExportCSV}
        onResetSampleData={handleResetSampleData}
        onClearAllData={handleClearAll}
        urgentDeadlineDays={urgentDeadlineDays}
        entriesCount={entries.length}
        woltRevenue={taxSummary.woltGrossRevenue}
        otherRevenue={taxSummary.otherGrossRevenue}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Urgent Deadline Notification Banner */}
        <UrgentAlertBanner
          deadlines={activeDeadlines}
          onOpenCalendar={() => setActiveTab('calendar')}
          onOpenOnyaGuide={() => setActiveTab('onya')}
          isOverAllowance={taxSummary.isOverAllowance}
        />

        {/* Dynamic Tab Views */}
        {activeTab === 'overview' && (
          <TaxLimitMeter
            summary={taxSummary}
            config={activeConfig}
            revenueFilter={revenueFilter}
            setRevenueFilter={setRevenueFilter}
            onOpenAddModal={() => {
              setEditingEntry(null);
              setIsAddModalOpen(true);
            }}
            onOpenOnya={() => setActiveTab('onya')}
          />
        )}

        {activeTab === 'calendar' && (
          <DeadlineCalendar
            deadlines={activeDeadlines}
            onToggleDeadline={handleToggleDeadline}
            year={selectedYear}
            onOpenOnyaGuide={() => setActiveTab('onya')}
          />
        )}

        {activeTab === 'ledger' && (
          <IncomeLedger
            entries={entries}
            year={selectedYear}
            revenueFilter={revenueFilter}
            setRevenueFilter={setRevenueFilter}
            onAddClick={() => {
              setEditingEntry(null);
              setIsAddModalOpen(true);
            }}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteEntry}
            onResetSampleData={handleResetSampleData}
            onClearAll={handleClearAll}
            onExportCSV={handleExportCSV}
            onImportCSV={handleImportCSV}
          />
        )}

        {activeTab === 'onya' && (
          <OnyaGuideView
            summary={taxSummary}
            year={selectedYear}
          />
        )}

        {activeTab === 'calculator' && (
          <CourierPerformance
            summary={taxSummary}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-900 bg-white/80 dark:bg-slate-950 py-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-800 dark:text-slate-300">Wolt Futár Adóasszisztens</span>
            <span>·</span>
            <span>Mellékállású Átalányadózó Egyéni Vállalkozás (45% Költséghányad)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
            <span>Önszámlázási elszámolás</span>
            <span>·</span>
            <span>NAV ONYA 2558 / 2658</span>
            <span>·</span>
            <span>MKIK: Márc. 31 · HIPA: Máj. 31</span>
          </div>
        </div>
      </footer>

      {/* Add / Edit Entry Modal */}
      <AddEntryModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingEntry(null);
        }}
        onSave={handleSaveEntry}
        initialEntry={editingEntry}
        defaultYear={selectedYear}
      />

      {/* Global In-App Confirm Dialog */}
      {confirmDialog && (
        <ConfirmModal
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText={confirmDialog.confirmText}
          isDestructive={confirmDialog.isDestructive}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
