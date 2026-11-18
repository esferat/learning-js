import type { Block, TextRun } from '../types';

/** Interview question parsed from «В N.M. …» paragraphs of chapter 19. */
export interface InterviewQuestion {
  /** Stable key, e.g. "1.1". */
  key: string;
  text: string;
  answers: TextRun[];
}

export interface InterviewCategory {
  id: string;
  title: string;
  questions: InterviewQuestion[];
}

export interface ParsedInterview {
  /** Text before the first heading (intro + summary table). */
  intro: Block[];
  categories: InterviewCategory[];
}

export function parseInterview(blocks: Block[]): ParsedInterview {
  const intro: Block[] = [];
  const categories: InterviewCategory[] = [];
  let current: InterviewCategory | null = null;
  let question: InterviewQuestion | null = null;

  for (const b of blocks) {
    if (b.t === 'h2') {
      const id = b.text.match(/^(\d+\.\d+)/)?.[1] ?? String(categories.length);
      current = { id, title: b.text, questions: [] };
      categories.push(current);
      question = null;
      continue;
    }
    if (!current) {
      intro.push(b);
      continue;
    }
    if (b.t === 'p') {
      const m = b.text.match(/^В\s+(\d+\.\d+)\.\s*(.*)$/);
      if (m) {
        question = { key: m[1], text: m[2], answers: [] };
        current.questions.push(question);
      } else {
        question = null;
      }
      continue;
    }
    if (b.t === 'ul' && question) {
      question.answers.push(...b.items);
    }
  }
  return { intro, categories };
}

export interface ChecklistItem {
  n: string;
  text: string;
}

export interface ChecklistSection {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface ParsedChecklists {
  intro: Block[];
  sections: ChecklistSection[];
}

/** Chapter 17: sections with tables «# / Проверка / Да-Нет». */
export function parseChecklists(blocks: Block[]): ParsedChecklists {
  const intro: Block[] = [];
  const sections: ChecklistSection[] = [];
  let current: ChecklistSection | null = null;

  for (const b of blocks) {
    if (b.t === 'h2') {
      current = { id: String(sections.length), title: b.text, items: [] };
      sections.push(current);
      continue;
    }
    if (b.t === 'table' && b.rows[0]?.some((c) => c.includes('Да/Нет'))) {
      const target = current ?? { id: String(sections.length), title: '', items: [] };
      if (!current) sections.push(target);
      for (const row of b.rows.slice(1)) {
        target.items.push({ n: row[0] ?? '', text: row[1] ?? '' });
      }
      continue;
    }
    if (!current) intro.push(b);
  }
  return { intro, sections };
}

export interface Week {
  n: number;
  focus: string;
  result: string;
}

/** Chapter 18: the table «Неделя / Фокус / Результат недели». */
export function parseWeeks(blocks: Block[]): Week[] {
  for (const b of blocks) {
    if (b.t === 'table' && b.rows[0]?.[0] === 'Неделя') {
      return b.rows.slice(1).map((row) => ({
        n: Number(row[0]),
        focus: row[1] ?? '',
        result: row[2] ?? '',
      }));
    }
  }
  return [];
}

export function isWeeksTable(block: Block): boolean {
  return block.t === 'table' && block.rows[0]?.[0] === 'Неделя';
}
