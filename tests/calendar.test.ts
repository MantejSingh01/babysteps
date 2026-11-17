import { describe, expect, it } from 'vitest';
import { buildIcs } from '../src/lib/calendar';
import { parseISODate } from '../src/lib/age';
import { buildSchedule } from '../src/lib/schedule';

describe('buildIcs', () => {
  const visits = buildSchedule(parseISODate('2026-04-07'), {}, parseISODate('2026-11-17')).filter(
    (v) => v.id === '9m' || v.id === '15m',
  );
  const ics = buildIcs('Aarav', visits);

  it('creates one all-day event per visit', () => {
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(ics).toContain('DTSTART;VALUE=DATE:20270107');
    expect(ics).toContain('DTEND;VALUE=DATE:20270108');
  });

  it('escapes commas and line breaks in descriptions', () => {
    expect(ics).toContain('Measles\\, mumps\\, rubella');
    expect(ics).not.toMatch(/DESCRIPTION:[^\r]*\n•/);
  });

  it('uses CRLF line endings as the format requires', () => {
    expect(ics.split('\r\n')[0]).toBe('BEGIN:VCALENDAR');
    expect(ics.endsWith('END:VCALENDAR')).toBe(true);
  });
});
