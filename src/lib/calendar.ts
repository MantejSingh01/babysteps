import type { ScheduledVisit } from './schedule';

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
const escapeText = (s: string) =>
  s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

// One all-day event per visit, with a reminder a day ahead. Text fields follow RFC 5545 escaping.
export function buildIcs(childName: string, visits: ScheduledVisit[]): string {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
  const events = visits.flatMap((visit) => {
    const next = new Date(visit.start);
    next.setDate(next.getDate() + 1);
    const names = visit.vaccines.map((v) => `• ${v.name} (${v.protects})`).join('\n');
    return [
      'BEGIN:VEVENT',
      `UID:${visit.id}-${ymd(visit.start)}-${encodeURIComponent(childName)}@babysteps`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${ymd(visit.start)}`,
      `DTEND;VALUE=DATE:${ymd(next)}`,
      `SUMMARY:${escapeText(`${childName}: ${visit.label} vaccines`)}`,
      `DESCRIPTION:${escapeText(`${names}\n\nConfirm timing with your pediatrician.`)}`,
      'BEGIN:VALARM',
      'TRIGGER:-P1D',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeText(`${childName}'s vaccines are due tomorrow`)}`,
      'END:VALARM',
      'END:VEVENT',
    ];
  });

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BabySteps//Vaccines//EN',
    'CALSCALE:GREGORIAN',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadFile(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
