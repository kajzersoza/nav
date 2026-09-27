import { TaxDeadline } from '../types/tax';

export function generateICalendar(deadlines: TaxDeadline[], year: number): string {
  const events = deadlines.map(d => {
    // Format YYYYMMDD
    const dateFormatted = d.date.replace(/-/g, '');
    const createdDate = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    return [
      'BEGIN:VEVENT',
      `UID:wolt-tax-${d.id}@ais-applet`,
      `DTSTAMP:${createdDate}`,
      `DTSTART;VALUE=DATE:${dateFormatted}`,
      `SUMMARY:NAV Határidő: ${d.title}`,
      `DESCRIPTION:${d.description.replace(/\n/g, ' ')}\\nTeendő: ${d.actionRequired.replace(/\n/g, ' ')}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-P3D',
      'ACTION:DISPLAY',
      `DESCRIPTION:Emlékeztető 3 nappal korábban: ${d.title}`,
      'END:VALARM',
      'END:VEVENT'
    ].join('\r\n');
  }).join('\r\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wolt Futar Ado Kezelo//HU',
    `X-WR-CALNAME:Wolt Futár NAV Határidők ${year}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    events,
    'END:VCALENDAR'
  ].join('\r\n');
}

export function downloadCalendarFile(deadlines: TaxDeadline[], year: number) {
  const icsContent = generateICalendar(deadlines, year);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `wolt_nav_hataridok_${year}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
