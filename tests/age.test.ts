import { describe, expect, it } from 'vitest';
import { addSpan, ageParts, formatAge, parseISODate, relativeDay, toISODate } from '../src/lib/age';

const d = parseISODate;

describe('addSpan', () => {
  it('clamps to the last day of a shorter month', () => {
    expect(toISODate(addSpan(d('2026-01-31'), { months: 1 }))).toBe('2026-02-28');
    expect(toISODate(addSpan(d('2028-01-31'), { months: 1 }))).toBe('2028-02-29');
  });

  it('adds weeks after months, the way the IAP schedule counts', () => {
    expect(toISODate(addSpan(d('2026-03-10'), { weeks: 6 }))).toBe('2026-04-21');
    expect(toISODate(addSpan(d('2026-03-10'), { years: 4 }))).toBe('2030-03-10');
  });

  it('moves backwards for negative spans', () => {
    expect(toISODate(addSpan(d('2026-11-17'), { months: -7, days: -10 }))).toBe('2026-04-07');
  });
});

describe('ageParts', () => {
  it('does not count a month until the day is reached', () => {
    expect(ageParts(d('2026-01-20'), d('2026-03-19'))).toMatchObject({ months: 1, days: 27 });
    expect(ageParts(d('2026-01-20'), d('2026-03-20'))).toMatchObject({ months: 2, days: 0 });
  });

  it('handles a birthday on the 31st', () => {
    expect(ageParts(d('2026-01-31'), d('2026-02-28'))).toMatchObject({ months: 1, days: 0 });
  });
});

describe('formatAge', () => {
  const born = d('2026-01-01');
  it.each([
    ['2026-01-11', '10 days'],
    ['2026-02-08', '5 weeks and 3 days'],
    ['2026-02-12', '6 weeks'],
    ['2026-08-11', '7 months and 10 days'],
    ['2028-01-01', '2 years'],
    ['2029-04-15', '3 years and 3 months'],
  ])('on %s reads "%s"', (on, expected) => {
    expect(formatAge(born, d(on))).toBe(expected);
  });
});

describe('relativeDay', () => {
  const now = d('2026-11-17');
  it.each([
    ['2026-11-17', 'today'],
    ['2026-11-18', 'tomorrow'],
    ['2026-11-16', 'yesterday'],
    ['2026-11-26', 'in 9 days'],
    ['2027-01-07', 'in 51 days'],
    ['2027-05-17', 'in 6 months'],
    ['2026-07-14', '4 months ago'],
  ])('%s is "%s"', (date, expected) => {
    expect(relativeDay(d(date), now)).toBe(expected);
  });
});
