import { VISITS, type Visit } from '../data/vaccines';
import { addSpan, diffDays } from './age';

export type VisitStatus = 'done' | 'overdue' | 'due' | 'soon' | 'upcoming';

export interface ScheduledVisit extends Visit {
  start: Date;
  end: Date;
  status: VisitStatus;
  doneCount: number;
}

const SOON_DAYS = 14;

export function buildSchedule(dob: Date, done: Record<string, boolean>, now: Date): ScheduledVisit[] {
  return VISITS.map((visit) => {
    const start = addSpan(dob, visit.at);
    const end = addSpan(dob, visit.until);
    const doneCount = visit.vaccines.filter((v) => done[v.id]).length;

    let status: VisitStatus;
    if (doneCount === visit.vaccines.length) status = 'done';
    else if (now.getTime() > end.getTime()) status = 'overdue';
    else if (now.getTime() >= start.getTime()) status = 'due';
    else if (diffDays(now, start) <= SOON_DAYS) status = 'soon';
    else status = 'upcoming';

    return { ...visit, start, end, status, doneCount };
  });
}
