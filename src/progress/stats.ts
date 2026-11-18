import type { Meta } from '../types';
import type { ModuleInfo } from '../data/curriculum';
import { MODULES, TOTAL_HOURS } from '../data/curriculum';
import type { ProgressState } from './ProgressContext';

export function unitKey(chapterNum: number, blockIndex: number): string {
  return `u:${chapterNum}:${blockIndex}`;
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

export function moduleTopics(meta: Meta, module: ModuleInfo): ModuleTopic[] {
  const topics: ModuleTopic[] = [];
  for (const num of module.chapterNums) {
    const chapter = meta.chapters.find((c) => c.num === num);
    if (!chapter) continue;
    chapter.units.forEach((unit, localIdx) => {
      topics.push({
        index: topics.length,
        key: unitKey(num, unit.i),
        chapterNum: num,
        localIdx,
        title: unit.t,
        chapterTitle: chapter.title,
      });
    });
  }
  return topics;
}

export function moduleUnits(meta: Meta, module: ModuleInfo) {
  return moduleTopics(meta, module).map((t) => t.key);
}

export function moduleProgress(meta: Meta, module: ModuleInfo, state: ProgressState): number {
  const keys = moduleUnits(meta, module);
  if (keys.length === 0) return 0;
  const done = keys.filter((k) => state.units[k]).length;
  return done / keys.length;
}

/** Overall progress in hours (each module weighted by its share of 672 h). */
export function overallProgress(meta: Meta, state: ProgressState): number {
  const done = MODULES.reduce((sum, m) => sum + m.hours.total * moduleProgress(meta, m, state), 0);
  return done / TOTAL_HOURS;
}

export function doneHours(meta: Meta, state: ProgressState): number {
  return Math.round(overallProgress(meta, state) * TOTAL_HOURS);
}

export function countDone(record: Record<string, boolean>): number {
  return Object.values(record).filter(Boolean).length;
}
