import type { Block, TextRun } from '../types';
import { MODULES, type ModuleInfo } from '../data/curriculum';

/**
 * The source document numbers modules from 0, the app displays them from 1.
 * The document also combines React and Next.js into one «Модуль 4» (112 ч),
 * while the app has two modules (48 ч + 64 ч). Shift rules:
 *
 *   doc 0…4  → +1   (JS 1, Node 2, TS 3, Паттерны 4, React 5)
 *   doc 5…10 → +2   (БД 7, Kafka 8, Эксплуатация 9, Итоговые 10, Интервью 11, AI 12)
 *   chapter 9 (Next.js) «Модуль 4» → 6
 *
 * Section numbers («раздел 18»), ТЗ («№5»), weeks and checklist indices are NOT touched —
 * only the word «модуль» followed by a number is shifted.
 */

export function shiftModuleNum(n: number, chapterNum?: number): number {
  if (chapterNum === 9 && n === 4) return n + 2;
  return n <= 4 ? n + 1 : n + 2;
}

const MODULE_RE = /([Мм]одул[а-яё]+)(\s+)(\d+)(?:\s*([–—-])\s*(\d+))?/g;

/** «Модуль 0» → «Модуль 1», «модули 5–10» → «модули 7–12» (см. таблицу выше). */
export function renumberText(text: string, chapterNum?: number): string {
  if (!text.includes('одул')) return text;
  return text.replace(MODULE_RE, (_m, word, sp, a, dash, second) => {
    const first = shiftModuleNum(Number(a), chapterNum);
    if (second === undefined) return `${word}${sp}${first}`;
    return `${word}${sp}${first}${dash}${shiftModuleNum(Number(second), chapterNum)}`;
  });
}

function renumberRun(run: TextRun, chapterNum?: number): TextRun {
  const text = renumberText(run.text, chapterNum);
  if (!run.segs) return text === run.text ? run : { ...run, text };
  if (text === run.text && run.segs.every((s) => renumberText(s.t, chapterNum) === s.t)) return run;
  return {
    ...run,
    text,
    segs: run.segs.map((s) => ({ ...s, t: renumberText(s.t, chapterNum) })),
  };
}

/* --- rows derived from the app's own module split (single source: curriculum) --- */

const moduleByChapter = (chapterNum: number): ModuleInfo =>
  MODULES.find((m) => m.chapterNums[0] === chapterNum) as ModuleInfo;

const fmtDays = (total: number, perDay: number): string =>
  (total / perDay).toFixed(1).replace('.', ',');

/** Структура программы: № | Модуль | Т | П | ТЗ | Итого | Дней при 9 ч. */
function structureRow(m: ModuleInfo): string[] {
  const h = m.hours;
  return [String(m.id + 1), m.title, String(h.theory), String(h.practice), String(h.assignment), String(h.total), fmtDays(h.total, 9)];
}

/** Трудозатраты (18.1): Модуль | Часов | Дней при 8/9/10 ч. */
function hoursRow(m: ModuleInfo): string[] {
  const short = m.title.split(':')[0];
  return [`${m.id + 1}. ${short}`, String(m.hours.total), fmtDays(m.hours.total, 8), fmtDays(m.hours.total, 9), fmtDays(m.hours.total, 10)];
}

/**
 * Module numbers also live in table columns:
 *  - header «№» + next header «Модуль» → plain digit cells;
 *  - any header «Модуль» → cells like «3. Паттерны» or «1».
 * The combined React+Next row is replaced by two rows; the «Fullstack-дашборд»
 * project row moves to module 6 (Next.js). Checklists («#» + «Проверка») stay as is.
 */
function renumberRows(rows: string[][]): string[][] {
  if (rows.length === 0) return rows;
  const header = rows[0];
  const isStructure = header[0]?.trim() === '№' && header[1]?.trim() === 'Модуль';
  const isHours = header[0]?.trim() === 'Модуль' && header[1]?.trim() === 'Часов';
  const isPortfolio = header[0]?.trim() === 'Проект' && header[1]?.trim() === 'Модуль';

  const digitCols = new Set<number>();
  const leadingNumCols = new Set<number>();
  header.forEach((h, i) => {
    const title = h.trim();
    if (title === 'Модуль') leadingNumCols.add(i);
    if ((title === '№' || title === '#') && header[i + 1]?.trim() === 'Модуль') digitCols.add(i);
  });

  const out: string[][] = [];
  for (let ri = 0; ri < rows.length; ri++) {
    const row = rows[ri];
    if (ri > 0 && isStructure && /^\d+$/.test(row[0]?.trim() ?? '') && /React и Next\.js/.test(row[1] ?? '')) {
      out.push(structureRow(moduleByChapter(8)), structureRow(moduleByChapter(9)));
      continue;
    }
    if (ri > 0 && isHours && /^4\.\s*React и Next\.js/.test(row[0] ?? '')) {
      out.push(hoursRow(moduleByChapter(8)), hoursRow(moduleByChapter(9)));
      continue;
    }
    if (ri > 0 && isPortfolio && /Fullstack-дашборд/.test(row[0] ?? '') && row[1]?.trim() === '4') {
      out.push(row.map((cell, ci) => (ci === 1 ? '6' : renumberText(cell))));
      continue;
    }
    out.push(
      row.map((cell, ci) => {
        let next = cell;
        if (ri > 0) {
          if (digitCols.has(ci) && /^\d+$/.test(cell.trim())) {
            next = String(shiftModuleNum(Number(cell.trim())));
          } else if (leadingNumCols.has(ci)) {
            const m = cell.match(/^(\d+)(?=\D|$)/);
            if (m) next = `${shiftModuleNum(Number(m[1]))}${cell.slice(m[0].length)}`;
          }
        }
        return renumberText(next);
      }),
    );
  }
  return out;
}

export function renumberBlocks(blocks: Block[], chapterNum?: number): Block[] {
  return blocks.map((b) => {
    switch (b.t) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'code':
        return { ...b, text: renumberText(b.text, chapterNum) };
      case 'p':
        return renumberRun(b, chapterNum) as Block;
      case 'ul':
      case 'ol':
        return { ...b, items: b.items.map((i) => renumberRun(i, chapterNum)) };
      case 'table':
        return { ...b, rows: renumberRows(b.rows) };
      default:
        return b;
    }
  });
}
