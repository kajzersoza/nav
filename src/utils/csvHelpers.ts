import { WoltEntry } from '../types/tax';

export function exportEntriesToCSV(entries: WoltEntry[], year: number) {
  const filtered = entries.filter(e => e.year === year);
  const headers = [
    'Dátum',
    'Időszak',
    'Wolt Számlaszám',
    'Bruttó Bevétel (Ft)',
    'Borravaló (Ft)',
    'Címek száma',
    'Óraszám',
    'Járműköltség (Ft)',
    'Megjegyzés'
  ];

  const rows = filtered.map(e => [
    e.date,
    `"${e.periodLabel.replace(/"/g, '""')}"`,
    `"${(e.invoiceNumber || '').replace(/"/g, '""')}"`,
    e.grossIncome,
    e.tip || 0,
    e.deliveriesCount || 0,
    e.hoursWorked || 0,
    e.fuelAndVehicleCost || 0,
    `"${(e.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `wolt_bevetel_${year}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseCSVToEntries(csvText: string, defaultYear: number): WoltEntry[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length <= 1) return [];

  const delimiter = lines[0].includes(';') ? ';' : ',';
  const entries: WoltEntry[] = [];

  for (let i = 1; i < lines.length; i++) {
    const raw = lines[i];
    // Split keeping quoted strings together
    const parts = raw.split(delimiter).map(p => p.replace(/^"|"$/g, '').trim());
    if (parts.length >= 4) {
      const date = parts[0] || `${defaultYear}-01-01`;
      const periodLabel = parts[1] || 'Kétheti elszámolás';
      const invoiceNumber = parts[2] || '';
      const grossIncome = parseFloat(parts[3]) || 0;
      const tip = parseFloat(parts[4]) || 0;
      const deliveriesCount = parseInt(parts[5]) || 0;
      const hoursWorked = parseFloat(parts[6]) || 0;
      const fuelAndVehicleCost = parseFloat(parts[7]) || 0;
      const notes = parts[8] || '';

      const d = new Date(date);
      const year = isNaN(d.getFullYear()) ? defaultYear : d.getFullYear();
      const month = isNaN(d.getMonth()) ? 1 : d.getMonth() + 1;

      entries.push({
        id: `csv-${Date.now()}-${i}`,
        sourceType: 'WOLT',
        clientName: 'Wolt Magyarország Kft.',
        date,
        year,
        month,
        period: date.slice(-2) <= '15' ? 'FIRST_HALF' : 'SECOND_HALF',
        periodLabel,
        grossIncome,
        tip,
        deliveriesCount,
        hoursWorked,
        fuelAndVehicleCost,
        invoiceNumber,
        notes,
        createdAt: Date.now(),
      });
    }
  }

  return entries;
}
