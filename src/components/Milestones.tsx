import type { Stage } from '../data/milestones';

interface Props {
  name: string;
  current: Stage | null;
  next: Stage | null;
  done: Record<string, boolean>;
  onToggle: (id: string) => void;
}

export function Milestones({ name, current, next, done, onToggle }: Props) {
  // Babies under 2 months have no stage yet, so the first one is shown as what to look forward to.
  const stage = current ?? next;
  if (!stage) return null;
  const upcoming = current ? next : null;
  const tickedCount = stage.items.filter((item) => done[item.id]).length;

  return (
    <section className="milestones" aria-labelledby="ms-title">
      <div className="section-head">
        <h2 id="ms-title">{current ? `Milestones at ${stage.label}` : `Milestones by ${stage.label}`}</h2>
        <p className="tally">
          {tickedCount} of {stage.items.length} ticked
        </p>
      </div>
      <p className="section-note">Most children do these by {stage.label}. Tick each one as you see it.</p>

      <ul className="checklist">
        {stage.items.map((item) => (
          <li key={item.id}>
            <label className="tick">
              <input type="checkbox" checked={Boolean(done[item.id])} onChange={() => onToggle(item.id)} />
              <span>{item.text}</span>
            </label>
          </li>
        ))}
      </ul>

      {upcoming && (
        <>
          <h3>Coming up by {upcoming.label}</h3>
          <ul className="upcoming-list">
            {upcoming.items.slice(0, 3).map((item) => (
              <li key={item.id}>{item.text}</li>
            ))}
          </ul>
        </>
      )}

      <p className="fine-print">
        Every child grows at their own pace. If {name} isn’t doing most of these, bring it up at the next
        check-up. Asking early always helps.
      </p>
    </section>
  );
}
