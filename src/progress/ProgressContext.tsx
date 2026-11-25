import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type ProgressGroup = 'units' | 'checklist' | 'weeks' | 'qa';

export interface ProgressState {
  /** Progress units of chapters: key `u:{chapterNum}:{blockIndex}`. */
  units: Record<string, boolean>;
  /** Checklist items: key `cl:{sectionIdx}:{itemIdx}`. */
  checklist: Record<string, boolean>;
  /** Weeks of the plan: key `w:{weekNumber}`. */
  weeks: Record<string, boolean>;
  /** Interview questions marked as learned: key `q:{questionKey}`. */
  qa: Record<string, boolean>;
}

const STORAGE_KEY = 'learning-js:progress:v1';

const EMPTY: ProgressState = { units: {}, checklist: {}, weeks: {}, qa: {} };

/** Пространства имён направлений. Старые ключи без префикса мигрируются в 'fs:'. */
const NAMESPACES = ['fs:', 'java:'];

function withNamespace(record: Record<string, boolean>): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(record)) {
    const ns = NAMESPACES.some((p) => key.startsWith(p)) ? key : `fs:${key}`;
    out[ns] = value;
  }
  return out;
}

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      units: withNamespace(parsed.units ?? {}),
      checklist: withNamespace(parsed.checklist ?? {}),
      weeks: withNamespace(parsed.weeks ?? {}),
      qa: withNamespace(parsed.qa ?? {}),
    };
  } catch {
    return EMPTY;
  }
}

interface ProgressApi {
  state: ProgressState;
  isDone: (group: ProgressGroup, key: string) => boolean;
  toggle: (group: ProgressGroup, key: string) => void;
  set: (group: ProgressGroup, key: string, value: boolean) => void;
  resetAll: () => void;
}

const ProgressContext = createContext<ProgressApi | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage unavailable — progress simply won't persist
    }
  }, [state]);

  const set = useCallback((group: ProgressGroup, key: string, value: boolean) => {
    setState((prev) => {
      if (prev[group][key] === value) return prev;
      return { ...prev, [group]: { ...prev[group], [key]: value } };
    });
  }, []);

  const toggle = useCallback((group: ProgressGroup, key: string) => {
    setState((prev) => ({ ...prev, [group]: { ...prev[group], [key]: !prev[group][key] } }));
  }, []);

  const resetAll = useCallback(() => setState(EMPTY), []);

  const value = useMemo<ProgressApi>(
    () => ({
      state,
      isDone: (group, key) => Boolean(state[group][key]),
      toggle,
      set,
      resetAll,
    }),
    [state, toggle, set, resetAll],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressApi {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider');
  return ctx;
}
