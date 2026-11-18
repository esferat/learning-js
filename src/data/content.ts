import type { Block, Chapter, ChapterMeta, Meta } from '../types';
import metaJson from './meta.json';
import supplementJson from './supplement.json';
import { renumberBlocks, renumberText } from '../lib/renumber';

const raw = metaJson as unknown as Meta;

interface SupplementTopic {
  /** New topic: heading inserted at the end of the theory section (default level h3). */
  title?: string;
  level?: 'h2' | 'h3';
  /** Insert a new section before the h2 whose title starts with this prefix. */
  insertBefore?: string;
  /** Append blocks to the end of an existing topic (h3 prefix match). */
  appendTo?: string;
  blocks: Block[];
}
const supplement = supplementJson as unknown as Record<string, SupplementTopic[]>;

/**
 * The document numbers modules from 0; the app shows them from 1.
 * Titles and unit names are shifted here so menus, cards and the topic
 * select always match the rendered content (see src/lib/renumber.ts).
 */
export const meta: Meta = {
  ...raw,
  chapters: raw.chapters.map((c) => ({
    ...c,
    title: renumberText(c.title, c.num),
    units: c.units.map((u) => ({ ...u, t: renumberText(u.t, c.num) })),
  })),
};

/** Insertion point for supplements: right before the first h2 after the last h3
 *  (i.e. at the end of the theory section). Must match tools/build-meta.mjs. */
function supplementIndex(blocks: Block[]): number {
  let lastH3 = -1;
  for (let i = 0; i < blocks.length; i++) if (blocks[i].t === 'h3') lastH3 = i;
  if (lastH3 === -1) return blocks.length;
  for (let i = lastH3 + 1; i < blocks.length; i++) if (blocks[i].t === 'h2') return i;
  return blocks.length;
}

/** Merges hand-written additions (src/data/supplement.json) into a chapter.
 *  Chapter JSON itself stays byte-faithful to the .docx.
 *  Keep the merge logic in sync with tools/build-meta.mjs. */
export function mergeSupplement(chapter: Chapter): Chapter {
  const extra = supplement[String(chapter.num)];
  if (!extra || extra.length === 0) return chapter;
  let blocks = [...chapter.blocks];
  for (const entry of extra) {
    if (entry.appendTo) {
      const start = blocks.findIndex((b) => b.t === 'h3' && b.text.startsWith(entry.appendTo as string));
      if (start === -1) continue;
      let end = start + 1;
      while (end < blocks.length && blocks[end].t !== 'h3' && blocks[end].t !== 'h2') end++;
      blocks.splice(end, 0, ...entry.blocks);
      continue;
    }
    if (!entry.title && !entry.insertBefore) continue;
    const insertBefore = entry.insertBefore;
    if (insertBefore) {
      const at = blocks.findIndex((b) => b.t === 'h2' && b.text.startsWith(insertBefore));
      const parts: Block[] = entry.title
        ? [{ t: entry.level === 'h2' ? 'h2' : 'h3', text: entry.title }, ...entry.blocks]
        : [...entry.blocks];
      blocks.splice(at === -1 ? blocks.length : at, 0, ...parts);
      continue;
    }
    if (!entry.title) continue;
    blocks.splice(supplementIndex(blocks), 0, { t: 'h3', text: entry.title }, ...entry.blocks);
  }
  return { ...chapter, blocks };
}

/** Lazy loaders for chapter content (each chapter is its own chunk). */
const chapterFiles = import.meta.glob('./chapters/ch*.json');

export function chapterMeta(num: number): ChapterMeta | undefined {
  return meta.chapters.find((c) => c.num === num);
}

export async function loadChapter(num: number): Promise<Chapter> {
  const key = `./chapters/ch${String(num).padStart(2, '0')}.json`;
  const loader = chapterFiles[key];
  if (!loader) throw new Error(`Глава ${num} не найдена`);
  const mod = (await loader()) as { default: Chapter };
  const chapter = mergeSupplement(mod.default);
  return {
    ...chapter,
    title: renumberText(chapter.title, chapter.num),
    blocks: renumberBlocks(chapter.blocks, chapter.num),
  };
}
