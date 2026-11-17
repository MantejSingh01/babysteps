import { useEffect, useState } from 'react';
import type { Child } from '../types';

// Checklists are stored per child, so switching children never mixes them up.
export function childKeys(child: Child) {
  const id = `${child.name}|${child.dob}`;
  return { vaccines: `babysteps.vax.${id}`, milestones: `babysteps.ms.${id}` };
}

// localStorage throws in some private modes and when full; the app should keep working in memory.
export function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => readJson(key, initial));
  useEffect(() => writeJson(key, value), [key, value]);
  return [value, setValue] as const;
}
