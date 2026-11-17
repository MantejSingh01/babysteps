import { formatDate, relativeDay } from '../lib/age';
import type { ScheduledVisit } from '../lib/schedule';

interface Props {
  name: string;
  ageText: string;
  visits: ScheduledVisit[];
}

function vaccineNames(visit: ScheduledVisit): string {
  const names = visit.vaccines.map((v) => v.name);
  return names.length > 3 ? `${names.length} vaccines for the ${visit.label} visit` : names.join(', ');
}

function nextStep(name: string, visits: ScheduledVisit[]): string {
  const overdue = visits.filter((v) => v.status === 'overdue');
  if (overdue.length === 1)
    return `One visit on the card is overdue. If ${name} already had it, tick it off.`;
  if (overdue.length > 1) return `${overdue.length} visits on the card are overdue.`;

  const next = visits.find((v) => v.status !== 'done');
  if (!next) return 'Every vaccine on the schedule is done.';
  if (next.status === 'due') return `Due now: ${vaccineNames(next)}, until ${formatDate(next.end)}.`;
  return `Next up on ${formatDate(next.start)} (${relativeDay(next.start)}): ${vaccineNames(next)}.`;
}

export function Summary({ name, ageText, visits }: Props) {
  return (
    <section className="summary">
      <h1>
        {name} is {ageText} old.
      </h1>
      <p>{nextStep(name, visits)}</p>
    </section>
  );
}
