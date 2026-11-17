import { useState, type FormEvent } from 'react';
import { addSpan, toISODate, today } from '../lib/age';
import { buildSchedule } from '../lib/schedule';
import { childKeys, writeJson } from '../lib/storage';
import type { Child } from '../types';
import { VaccineTable } from './VaccineTable';

const MAX_AGE_YEARS = 12;

function validate(name: string, dob: string, now: Date): string | null {
  if (!name.trim()) return 'Add your child’s name so the card is theirs.';
  if (!dob) return 'Pick a date of birth to fill in the dates.';
  if (dob > toISODate(now)) return 'The date of birth is in the future. Check the year.';
  if (dob < toISODate(addSpan(now, { years: -MAX_AGE_YEARS }))) {
    return `BabySteps covers children up to ${MAX_AGE_YEARS} years old.`;
  }
  return null;
}

// The sample card shows a 10-week-old: two visits stamped, one due now, one coming up.
function sampleVisits(now: Date) {
  const dob = addSpan(now, { weeks: -10, days: -3 });
  const given = Object.fromEntries(
    ['bcg', 'opv0', 'hepb1', 'dtp1', 'ipv1', 'hib1', 'hepb2', 'rota1', 'pcv1'].map((id) => [id, true]),
  );
  return { visits: buildSchedule(dob, given, now).slice(0, 4), given };
}

// A demo child whose card is up to date, so the first thing a visitor sees is the normal case.
function createDemoChild(now: Date): Child {
  const dob = addSpan(now, { months: -7, days: -10 });
  const child: Child = { name: 'Aarav', dob: toISODate(dob) };
  const pastVisits = buildSchedule(dob, {}, now).filter((visit) => visit.status === 'overdue');
  const keys = childKeys(child);
  writeJson(
    keys.vaccines,
    Object.fromEntries(pastVisits.flatMap((v) => v.vaccines.map((x) => [x.id, true]))),
  );
  writeJson(keys.milestones, { 'm6-1': true, 'm6-2': true, 'm6-3': true });
  return child;
}

export function Onboarding({ onSave }: { onSave: (child: Child) => void }) {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [error, setError] = useState<string | null>(null);
  const now = today();
  const sample = sampleVisits(now);

  function submit(event: FormEvent) {
    event.preventDefault();
    const problem = validate(name, dob, now);
    setError(problem);
    if (!problem) onSave({ name: name.trim(), dob });
  }

  return (
    <div className="welcome">
      <div className="welcome-copy">
        <h1>Your child’s vaccination card, milestones and questions, in one place.</h1>
        <p className="lede">
          Enter a date of birth. BabySteps fills in the IAP vaccination schedule with real dates, shows the
          milestones to look for at this age, and answers questions for your child’s exact age.
        </p>

        <form className="welcome-form" onSubmit={submit} noValidate>
          <label className="field">
            <span>Child’s name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoComplete="off" />
          </label>
          <label className="field">
            <span>Date of birth</span>
            <input type="date" value={dob} max={toISODate(now)} onChange={(e) => setDob(e.target.value)} />
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="button" type="submit">
            Show my child’s card
          </button>
        </form>

        <p className="demo-line">
          Just looking?{' '}
          <button className="text-button" type="button" onClick={() => onSave(createDemoChild(today()))}>
            Open a demo for a 7-month-old
          </button>
        </p>
        <p className="fine-print">Nothing is uploaded. Your child’s details stay in this browser.</p>
      </div>

      <figure className="welcome-sample">
        <div className="vcard">
          <div className="vcard-head">
            <div>
              <p className="vcard-title">Vaccination card</p>
              <p>Sample for a 10-week-old</p>
            </div>
          </div>
          <VaccineTable visits={sample.visits} done={sample.given} caption="Sample vaccination card" />
        </div>
        <figcaption>A real card has a stamp for every dose. So does this one.</figcaption>
      </figure>
    </div>
  );
}
