import { describe, expect, it } from 'vitest';
import { stageFor } from '../src/data/milestones';
import { VISITS } from '../src/data/vaccines';
import { parseISODate, toISODate } from '../src/lib/age';
import { buildSchedule } from '../src/lib/schedule';

const dob = parseISODate('2026-04-07');
const now = parseISODate('2026-11-17'); // 7 months and 10 days old

function statusOf(visitId: string, given: Record<string, boolean> = {}, on = now) {
  return buildSchedule(dob, given, on).find((v) => v.id === visitId)?.status;
}

describe('buildSchedule', () => {
  it('dates every visit from the date of birth', () => {
    const byId = Object.fromEntries(buildSchedule(dob, {}, now).map((v) => [v.id, toISODate(v.start)]));
    expect(byId).toMatchObject({
      birth: '2026-04-07',
      '6w': '2026-05-19',
      '9m': '2027-01-07',
      '4y': '2030-04-07',
    });
  });

  it('marks past windows overdue, the open window due, and the rest upcoming', () => {
    expect(statusOf('14w')).toBe('overdue');
    expect(statusOf('7m')).toBe('due');
    expect(statusOf('9m')).toBe('upcoming');
  });

  it('calls a visit "soon" in the two weeks before it opens', () => {
    expect(statusOf('9m', {}, parseISODate('2026-12-24'))).toBe('soon');
    expect(statusOf('9m', {}, parseISODate('2026-12-23'))).toBe('upcoming');
  });

  it('only counts a visit as done when every vaccine in it is given', () => {
    expect(statusOf('6m', { flu1: true })).toBe('overdue');
    expect(statusOf('6m', { flu1: true, tcv: true })).toBe('done');
  });

  it('uses unique vaccine ids, since they are the keys of the saved checklist', () => {
    const ids = VISITS.flatMap((v) => v.vaccines.map((x) => x.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('stageFor', () => {
  it('has no current stage before 2 months and points at the first one', () => {
    expect(stageFor(1)).toMatchObject({ current: null, next: { months: 2 } });
  });

  it('picks the latest stage reached', () => {
    expect(stageFor(7)).toMatchObject({ current: { months: 6 }, next: { months: 9 } });
  });

  it('stops at 5 years', () => {
    expect(stageFor(80)).toMatchObject({ current: { months: 60 }, next: null });
  });
});
