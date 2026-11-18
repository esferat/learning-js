/** Inline segment of a paragraph: plain text with optional bold/code marks. */
export interface Seg {
  t: string;
  b?: 1;
  c?: 1;
}

/** Text with optional inline marks (bold / inline code). */
export interface TextRun {
  text: string;
  segs?: Seg[];
}

/** A block of the extracted curriculum document. */
export type Block =
  | { t: 'h1' | 'h2' | 'h3' | 'h4' | 'h5'; text: string }
  | ({ t: 'p' } & TextRun)
  | { t: 'ul' | 'ol'; items: TextRun[] }
  | { t: 'code'; text: string }
  | { t: 'table'; rows: string[][] }
  /** Visual scheme registered in src/components/diagrams (supplements only). */
  | { t: 'diagram'; id: string };

export interface Chapter {
  num: number;
  title: string;
  blocks: Block[];
}

/** A progress unit: a heading block (h2, or h3 inside long h2 sections). */
export interface Unit {
  i: number;
  t: string;
}

export interface ChapterMeta {
  num: number;
  file: string;
  title: string;
  blocks: number;
  units: Unit[];
}

export interface Meta {
  chapters: ChapterMeta[];
  totals: {
    units: number;
    questions: number;
    checklistSections: number;
    checklistItems: number;
    weeks: number;
  };
}
