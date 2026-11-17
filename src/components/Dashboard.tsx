import { stageFor } from '../data/milestones';
import { ageParts, formatAge, parseISODate, today } from '../lib/age';
import { buildIcs, downloadFile } from '../lib/calendar';
import { buildSchedule } from '../lib/schedule';
import { childKeys, usePersistentState } from '../lib/storage';
import type { Child } from '../types';
import { AskPanel } from './AskPanel';
import { Milestones } from './Milestones';
import { Summary } from './Summary';
import { VaccineCard } from './VaccineCard';

type Checklist = Record<string, boolean>;

export function Dashboard({ child }: { child: Child }) {
  const keys = childKeys(child);
  const [vaccinesGiven, setVaccinesGiven] = usePersistentState<Checklist>(keys.vaccines, {});
  const [milestonesSeen, setMilestonesSeen] = usePersistentState<Checklist>(keys.milestones, {});

  const now = today();
  const dob = parseISODate(child.dob);
  const ageText = formatAge(dob, now);
  const { months } = ageParts(dob, now);
  const visits = buildSchedule(dob, vaccinesGiven, now);
  const { current, next } = stageFor(months);

  const toggle = (setter: typeof setVaccinesGiven) => (id: string) =>
    setter((list) => ({ ...list, [id]: !list[id] }));

  function markOverdueGiven() {
    const overdueIds = visits
      .filter((visit) => visit.status === 'overdue')
      .flatMap((visit) => visit.vaccines.map((v) => v.id));
    setVaccinesGiven((list) => ({ ...list, ...Object.fromEntries(overdueIds.map((id) => [id, true])) }));
  }

  function downloadCalendar() {
    const upcoming = visits.filter((visit) => visit.status !== 'done' && visit.status !== 'overdue');
    downloadFile(`${child.name} vaccines.ics`, buildIcs(child.name, upcoming), 'text/calendar');
  }

  return (
    <div className="dashboard">
      <div className="dashboard-main">
        <Summary name={child.name} ageText={ageText} visits={visits} />
        <VaccineCard
          name={child.name}
          dob={dob}
          visits={visits}
          done={vaccinesGiven}
          onToggle={toggle(setVaccinesGiven)}
          onMarkOverdueGiven={markOverdueGiven}
          onDownloadCalendar={downloadCalendar}
        />
        <Milestones
          name={child.name}
          current={current}
          next={next}
          done={milestonesSeen}
          onToggle={toggle(setMilestonesSeen)}
        />
      </div>
      <AskPanel name={child.name} ageText={ageText} ageMonths={months} />
    </div>
  );
}
