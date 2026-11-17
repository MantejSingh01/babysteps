import { Dashboard } from './components/Dashboard';
import { Logo } from './components/Logo';
import { Onboarding } from './components/Onboarding';
import { usePersistentState } from './lib/storage';
import type { Child } from './types';

export default function App() {
  const [child, setChild] = usePersistentState<Child | null>('babysteps.child', null);

  return (
    <div className="page">
      <header className="masthead">
        <span className="wordmark">
          <Logo />
          BabySteps
        </span>
        {child && (
          <button className="text-button" onClick={() => setChild(null)}>
            Change child
          </button>
        )}
      </header>

      <main>
        {child ? (
          <Dashboard key={`${child.name}|${child.dob}`} child={child} />
        ) : (
          <Onboarding onSave={setChild} />
        )}
      </main>

      <footer className="colophon">
        <p>
          BabySteps gives general information, not medical advice. Your pediatrician knows your child best. In
          an emergency, call 112.
        </p>
        <p>
          Vaccine schedule from the IAP ACVIP (2023). Milestones adapted from the CDC’s “Learn the Signs. Act
          Early.” (2022). Made by Mantej Singh.
        </p>
      </footer>
    </div>
  );
}
