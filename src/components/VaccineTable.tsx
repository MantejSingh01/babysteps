import { useState } from 'react';
import { formatDate, relativeDay, toISODate } from '../lib/age';
import type { ScheduledVisit } from '../lib/schedule';
import { Stamp } from './Stamp';

interface Props {
  visits: ScheduledVisit[];
  done: Record<string, boolean>;
  // Without onToggle the table is a read-only sample (used on the welcome screen).
  onToggle?: (visit: ScheduledVisit, vaccineId: string) => void;
  freshVisitId?: string | null;
  caption: string;
}

function whenText(visit: ScheduledVisit): string {
  switch (visit.status) {
    case 'done':
      return '';
    case 'overdue':
      return 'Overdue';
    case 'due':
      return `Due until ${formatDate(visit.end)}`;
    default:
      return relativeDay(visit.start);
  }
}

export function VaccineTable({ visits, done, onToggle, freshVisitId, caption }: Props) {
  // Finished visits fold into one line, like a filled-in row on a paper card, until the parent opens one.
  const [openVisitId, setOpenVisitId] = useState<string | null>(null);

  return (
    <table className="vtable">
      <caption className="visually-hidden">{caption}</caption>
      <thead>
        <tr>
          <th scope="col">Age</th>
          <th scope="col">Vaccines</th>
          <th scope="col">Due</th>
          <th scope="col" className="given-col">
            Given
          </th>
        </tr>
      </thead>
      <tbody>
        {visits.map((visit) => {
          const folded = onToggle && visit.status === 'done' && openVisitId !== visit.id;
          return (
            <tr key={visit.id} className={`is-${visit.status}`}>
              <th scope="row">{visit.label}</th>
              <td className="shots-cell">
                {folded ? (
                  <p className="shots-folded">
                    {visit.vaccines.map((v) => v.name).join(', ')}{' '}
                    <button className="text-button" onClick={() => setOpenVisitId(visit.id)}>
                      Change
                    </button>
                  </p>
                ) : (
                  <ul className="shots">
                    {visit.vaccines.map((vaccine) => (
                      <li key={vaccine.id}>
                        {onToggle ? (
                          <label className="tick">
                            <input
                              type="checkbox"
                              checked={Boolean(done[vaccine.id])}
                              onChange={() => onToggle(visit, vaccine.id)}
                            />
                            <span>
                              {vaccine.name} <span className="shot-for">{vaccine.protects}</span>
                            </span>
                          </label>
                        ) : (
                          <span>{vaccine.name}</span>
                        )}
                        {vaccine.note && <span className="shot-note">{vaccine.note}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </td>
              <td className="due-cell">
                <time dateTime={toISODate(visit.start)}>{formatDate(visit.start)}</time>
                <span className="when">{whenText(visit)}</span>
              </td>
              <td className="given-cell">
                {visit.status === 'done' ? (
                  <Stamp seed={visit.id} fresh={visit.id === freshVisitId} />
                ) : (
                  visit.doneCount > 0 && (
                    <span className="partial">
                      {visit.doneCount} of {visit.vaccines.length}
                    </span>
                  )
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
