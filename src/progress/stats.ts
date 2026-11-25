import type { Meta } from '../types';
import type { ModuleInfo } from '../data/curriculum';

/** Ключ единицы прогресса: `${ns}u:{chapterNum}:{blockIndex}` (ns = 'fs:' | 'java:'). */
export function unitKey(ns: string, chapterNum: number, blockIndex: number): string {
  return `${ns}u:${chapterNum}:${blockIndex}`;
}

/** A single topic (progress unit) of a module, across all its chapters. */
export interface ModuleTopic {
  /** Position within the module (0-based). */
  index: number;
  key: string;
  chapterNum: number;
  /** Unit index inside its chapter. */
  localIdx: number;
  title: string;
  chapterTitle: string;
}

export function moduleTopics(meta: Meta, module: ModuleInfo, ns: string): ModuleTopic[] {
  const topics: ModuleTopic[] = [];
  for (const num of module.chapterNums) {
    const chapter = meta.chapters.find((c) => c.num === num);
    if (!chapter) continue;
    chapter.units.forEach((unit, localIdx) => {
      topics.push({
        index: topics.length,
        key: unitKey(ns, num, unit.i),
        chapterNum: num,
        localIdx,
        title: unit.t,
        chapterTitle: chapter.title,
      });
    });
  }
  return topics;
}

export function moduleUnits(meta: Meta, module: ModuleInfo, ns: string): string[] {
  return moduleTopics(meta, module, ns).map((t) => t.key);
}

export function moduleProgress(meta: Meta, module: ModuleInfo, state: { units: Record<string, boolean> }, ns: string): number {
  const keys = moduleUnits(meta, module, ns);
  if (keys.length === 0) return 0;
  const done = keys.filter((k) => state.units[k]).length;
  return done / keys.length;
}

/** Overall progress in hours for a program (modules weighted by their hours). */
export function overallProgress(
  meta: Meta,
  state: { units: Record<string, boolean> },
  modules: ModuleInfo[],
  ns: string,
): number {
  const total = modules.reduce((s, m) => s + m.hours.total, 0);
  if (total === 0) return 0;
  const done = modules.reduce(
    (s, m) => s + m.hours.total * moduleProgress(meta, m, state, ns),
    0,
  );
  return done / total;
}

export function doneHours(
  meta: Meta,
  state: { units: Record<string, boolean> },
  modules: ModuleInfo[],
  ns: string,
): number {
  const total = modules.reduce((s, m) => s + m.hours.total, 0);
  return Math.round(overallProgress(meta, state, modules, ns) * total);
}

/** Счётчик отмеченных ключей одного направления (все ключи уже содержат ns). */
export function countDone(record: Record<string, boolean>, ns: string): number {
  let n = 0;
  for (const key of Object.keys(record)) {
    if (record[key] && key.startsWith(ns)) n++;
  }
  return n;
}
