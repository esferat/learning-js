import { createContext, useContext } from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import type { ProgramDef } from './data/curriculum';
import { PROGRAMS } from './data/curriculum';

interface ProgramApi {
  def: ProgramDef;
  /** Префикс ключей прогресса в localStorage: 'fs:' или 'java:' (см. ProgressContext). */
  ns: string;
  /** Путь внутри направления: href('/modules/3') → '/fs/modules/3'. */
  href: (p: string) => string;
}

const ProgramContext = createContext<ProgramApi | null>(null);

/** Маршрут-обёртка: /:prog — сегмент направления (fs | java). */
export function ProgramScope() {
  const { prog } = useParams();
  const def = prog ? PROGRAMS[prog] : undefined;
  if (!def) return <Navigate to="/fs" replace />;
  const ns = `${def.id}:`;
  return (
    <ProgramContext.Provider value={{ def, ns, href: (p) => `${def.path}${p}` }}>
      <Outlet />
    </ProgramContext.Provider>
  );
}

export function useProgram(): ProgramApi {
  const ctx = useContext(ProgramContext);
  if (!ctx) throw new Error('useProgram must be used inside ProgramScope');
  return ctx;
}
