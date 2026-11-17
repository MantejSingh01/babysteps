import { useState } from 'react';
import { formatDate } from '../lib/age';
import type { ScheduledVisit } from '../lib/schedule';
import { VaccineTable } from './VaccineTable';

interface Props {
  name: string;
  dob: Date;
  visits: ScheduledVisit[];
  done: Record<string, boolean>;
  onToggle: (vaccineId: string) => void;
  onMarkOverdueGiven: () => void;
  onDownloadCalendar: () => void;
}

export function VaccineCard(props: Props) {
  const { name, dob, visits, done, onToggle, onMarkOverdueGiven, onDownloadCalendar } = props;
  // Only a visit completed by the parent's click gets the stamp animation, not the ones already on the card.
  const [freshVisitId, setFreshVisitId] = useState<string | null>(null);

  const overdueCount = visits.filter((v) => v.status === 'overdue').length;
  const hasUpcoming = visits.some((v) => v.status !== 'done' && v.status !== 'overdue');

  function toggle(visit: ScheduledVisit, vaccineId: string) {
    const completesVisit = !done[vaccineId] && visit.vaccines.every((v) => v.id === vaccineId || done[v.id]);
    setFreshVisitId(completesVisit ? visit.id : null);
    onToggle(vaccineId);
  }

  return (
    <section className="vcard" aria-labelledby="vcard-title">
      <header className="vcard-head">
        <div>
          <h2 id="vcard-title">Vaccination card</h2>
          <p>
            {name}, born {formatDate(dob)}. Schedule from the Indian Academy of Pediatrics.
          </p>
        </div>
        <button className="button-on-blue" onClick={onDownloadCalendar} disabled={!hasUpcoming}>
          Add to calendar
        </button>
      </header>

      {overdueCount >= 2 && (
        <div className="vcard-notice">
          <p>
            {overdueCount} past visits aren’t ticked yet. If {name} already had them, mark them all at once.
          </p>
          <button className="button-quiet" onClick={onMarkOverdueGiven}>
            Mark past visits as given
          </button>
        </div>
      )}

      <VaccineTable
        visits={visits}
        done={done}
        onToggle={toggle}
        freshVisitId={freshVisitId}
        caption={`Vaccination schedule for ${name}`}
      />
    </section>
  );
}
