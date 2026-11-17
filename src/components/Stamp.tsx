interface Props {
  seed: string;
  fresh?: boolean;
}

// Each stamp gets its own small tilt, derived from the visit id so it stays put between renders.
function tiltFor(seed: string): number {
  const sum = [...seed].reduce((total, char) => total + char.charCodeAt(0), 0);
  return (sum % 17) - 8;
}

export function Stamp({ seed, fresh = false }: Props) {
  return (
    <span className="stamp" style={{ transform: `rotate(${tiltFor(seed)}deg)` }}>
      <svg className={fresh ? 'stamp-mark is-fresh' : 'stamp-mark'} viewBox="0 0 48 48" role="img">
        <title>Given</title>
        <circle cx="24" cy="24" r="21" strokeWidth="2.5" />
        <circle cx="24" cy="24" r="16.5" strokeWidth="1" />
        <path d="M16 24.5l5.5 5.5L32.5 18" strokeWidth="3.5" />
      </svg>
    </span>
  );
}
