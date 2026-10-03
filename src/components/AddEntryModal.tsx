import React, { useState, useEffect } from 'react';
import { WoltEntry } from '../types/tax';
import { X, Check, Bike, Briefcase } from 'lucide-react';

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<WoltEntry, 'id' | 'createdAt'>, editId?: string) => void;
  initialEntry?: WoltEntry | null;
  defaultYear?: number;
}

export const AddEntryModal: React.FC<AddEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEntry,
  defaultYear = 2026,
}) => {
  const [sourceType, setSourceType] = useState<'WOLT' | 'OTHER'>('WOLT');
  const [clientName, setClientName] = useState('Wolt Magyarország Kft.');
  const [date, setDate] = useState('');
  const [periodType, setPeriodType] = useState<'FIRST_HALF' | 'SECOND_HALF' | 'FULL_MONTH' | 'CUSTOM'>('FIRST_HALF');
  const [grossIncome, setGrossIncome] = useState('');
  const [tip, setTip] = useState('');
  const [deliveriesCount, setDeliveriesCount] = useState('');
  const [hoursWorked, setHoursWorked] = useState('');
  const [fuelAndVehicleCost, setFuelAndVehicleCost] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    if (initialEntry) {
      setSourceType(initialEntry.sourceType || 'WOLT');
      setClientName(initialEntry.clientName || (initialEntry.sourceType === 'OTHER' ? '' : 'Wolt Magyarország Kft.'));
      setDate(initialEntry.date);
      setPeriodType(initialEntry.period);
      setGrossIncome(String(initialEntry.grossIncome));
      setTip(initialEntry.tip ? String(initialEntry.tip) : '');
      setDeliveriesCount(initialEntry.deliveriesCount ? String(initialEntry.deliveriesCount) : '');
      setHoursWorked(initialEntry.hoursWorked ? String(initialEntry.hoursWorked) : '');
      setFuelAndVehicleCost(initialEntry.fuelAndVehicleCost ? String(initialEntry.fuelAndVehicleCost) : '');
      setInvoiceNumber(initialEntry.invoiceNumber || '');
      setNotes(initialEntry.notes || '');
    } else {
      // Default to today in YYYY-MM-DD
      const now = new Date();
      const yr = defaultYear || now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      setDate(`${yr}-${mm}-${dd}`);
      setSourceType('WOLT');
      setClientName('Wolt Magyarország Kft.');
      setPeriodType(now.getDate() <= 15 ? 'FIRST_HALF' : 'SECOND_HALF');
      setGrossIncome('');
      setTip('');
      setDeliveriesCount('');
      setHoursWorked('');
      setFuelAndVehicleCost('');
      setInvoiceNumber('');
      setNotes('');
    }
  }, [initialEntry, defaultYear, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsedGross = parseFloat(grossIncome) || 0;
    if (parsedGross <= 0) {
      setError('Kérlek adj meg egy 0-nál nagyobb bruttó bevétel összeget!');
      return;
    }

    const entryDate = new Date(date);
    const yr = entryDate.getFullYear() || defaultYear;
    const mo = entryDate.getMonth() + 1;

    const monthNames = [
      'Január', 'Február', 'Március', 'Április', 'Május', 'Június',
      'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'
    ];
    const monthName = monthNames[mo - 1];

    let periodLabel = `${yr}. ${monthName}`;
    if (sourceType === 'WOLT') {
      if (periodType === 'FIRST_HALF') {
        periodLabel = `${yr}. ${monthName} (1–15.)`;
      } else if (periodType === 'SECOND_HALF') {
        periodLabel = `${yr}. ${monthName} (16–hó vége)`;
      } else {
        periodLabel = `${yr}. ${monthName} (Teljes hónap)`;
      }
    } else {
      periodLabel = `${yr}. ${monthName} (${clientName || 'Egyéb számla'})`;
    }

    onSave({
      year: yr,
      month: mo,
      period: periodType,
      sourceType,
      clientName: clientName.trim() || (sourceType === 'WOLT' ? 'Wolt Magyarország Kft.' : 'Egyéb Ügyfél'),
      date,
      periodLabel,
      grossIncome: parsedGross,
      tip: parseFloat(tip) || 0,
      deliveriesCount: parseInt(deliveriesCount, 10) || 0,
      hoursWorked: parseFloat(hoursWorked) || 0,
      fuelAndVehicleCost: parseFloat(fuelAndVehicleCost) || 0,
      invoiceNumber: invoiceNumber.trim() || (sourceType === 'WOLT' ? `WOLT-${yr}-${String(mo).padStart(2, '0')}-${periodType === 'FIRST_HALF' ? '01' : '02'}` : `SZAMLA-${yr}-${String(mo).padStart(2, '0')}`),
      notes: notes.trim(),
    }, initialEntry?.id);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {initialEntry ? 'Bevétel Módosítása' : 'Új Kifizetés / Bevétel Rögzítése'}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Wolt elszámolás vagy egyéb vállalkozói számla adatai
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800/80 rounded-xl text-red-700 dark:text-red-200 text-xs flex items-center justify-between animate-in fade-in">
              <span>{error}</span>
              <button type="button" onClick={() => setError(null)} className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Revenue Source Selector */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Bevétel Típusa</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSourceType('WOLT');
                  if (!clientName || clientName.includes('Egyéb')) setClientName('Wolt Magyarország Kft.');
                }}
                className={`py-2 px-3 text-center rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  sourceType === 'WOLT'
                    ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/60 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Wolt Futár Bevétel</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSourceType('OTHER');
                  if (clientName === 'Wolt Magyarország Kft.') setClientName('');
                }}
                className={`py-2 px-3 text-center rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  sourceType === 'OTHER'
                    ? 'bg-purple-50 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-500/60 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Egyéb Vállalkozói Bevétel</span>
              </button>
            </div>
          </div>

          {/* Client / Partner Name if OTHER */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              {sourceType === 'WOLT' ? 'Partner / Megbízó' : 'Ügyfél / Megbízó Neve (Egyéb bevétel)'}
            </label>
            <input
              type="text"
              placeholder={sourceType === 'WOLT' ? 'Wolt Magyarország Kft.' : 'pl. Megbízó Kft., Magánszemély, egyéb cég'}
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 text-xs shadow-xs"
            />
          </div>

          {/* Period selector tabs (for Wolt) */}
          {sourceType === 'WOLT' ? (
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Wolt Elszámolási Ciklus</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPeriodType('FIRST_HALF')}
                  className={`py-2 px-2 text-center rounded-lg border font-semibold transition-colors ${
                    periodType === 'FIRST_HALF'
                      ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/50 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  1–15. időszak
                </button>
                <button
                  type="button"
                  onClick={() => setPeriodType('SECOND_HALF')}
                  className={`py-2 px-2 text-center rounded-lg border font-semibold transition-colors ${
                    periodType === 'SECOND_HALF'
                      ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/50 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  16–hó vége
                </button>
                <button
                  type="button"
                  onClick={() => setPeriodType('FULL_MONTH')}
                  className={`py-2 px-2 text-center rounded-lg border font-semibold transition-colors ${
                    periodType === 'FULL_MONTH'
                      ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/50 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Teljes hónap
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Időszak jellege</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPeriodType('CUSTOM')}
                  className={`py-2 px-2 text-center rounded-lg border font-semibold transition-colors ${
                    periodType === 'CUSTOM'
                      ? 'bg-purple-50 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-500/50 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Eseti számla / kifizetés
                </button>
                <button
                  type="button"
                  onClick={() => setPeriodType('FULL_MONTH')}
                  className={`py-2 px-2 text-center rounded-lg border font-semibold transition-colors ${
                    periodType === 'FULL_MONTH'
                      ? 'bg-purple-50 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-500/50 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Havi átalánydíj
                </button>
              </div>
            </div>
          )}

          {/* Date and Invoice number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Kifizetés / Számla Dátuma</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 font-mono text-xs shadow-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Wolt Számlaszám (opcionális)</label>
              <input
                type="text"
                placeholder="pl. WOLT-2026-09-01"
                value={invoiceNumber}
                onChange={e => setInvoiceNumber(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono text-xs shadow-xs"
              />
            </div>
          </div>

          {/* Gross revenue & Tips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Bruttó Bevétel (Ft) <span className="text-cyan-600 dark:text-cyan-400">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="100"
                placeholder="pl. 165000"
                value={grossIncome}
                onChange={e => setGrossIncome(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none focus:border-cyan-500 shadow-xs"
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">Wolt önszámla szerinti összeg</span>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Borravaló (Ft)</label>
              <input
                type="number"
                min="0"
                step="50"
                placeholder="pl. 14200"
                value={tip}
                onChange={e => setTip(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-sm focus:outline-none focus:border-cyan-500 shadow-xs"
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">Applikációban kapott borravaló</span>
            </div>
          </div>

          {/* Deliveries & Hours Worked & Vehicle Costs */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Címek száma</label>
              <input
                type="number"
                min="0"
                placeholder="pl. 160"
                value={deliveriesCount}
                onChange={e => setDeliveriesCount(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Futár óraszám</label>
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="pl. 50"
                value={hoursWorked}
                onChange={e => setHoursWorked(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Üzemanyag/szerviz</label>
              <input
                type="number"
                min="0"
                placeholder="pl. 20000"
                value={fuelAndVehicleCost}
                onChange={e => setFuelAndVehicleCost(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500 shadow-xs"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Megjegyzés (időjárás, bónusz, stb.)</label>
            <input
              type="text"
              placeholder="pl. Hétvégi hideg bónusz, ebédidős műszakok"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 text-xs shadow-xs"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Mégse
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-slate-950 bg-cyan-400 hover:bg-cyan-300 font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>{initialEntry ? 'Módosítások mentése' : 'Kifizetés mentése'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
