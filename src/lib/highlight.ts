import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import yaml from 'highlight.js/lib/languages/yaml';
import 'highlight.js/styles/github-dark.css';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('dockerfile', dockerfile);

export interface CodeHighlight {
  kind: 'note' | 'code';
  /** null → no highlighting (prompts, plain text). */
  lang: string | null;
  label: string;
  html: string;
}

const LABELS: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  json: 'JSON',
  bash: 'Shell',
  sql: 'SQL',
  yaml: 'YAML',
  markdown: 'Markdown',
  dockerfile: 'Dockerfile',
};

/** First-line markers of prompt examples from the AI modules. */
const PROMPT_RE =
  /^(Ты\s|Роль:|Задача:|Напиши\s|ПЛОХО\s|Контекст:|ЦЕЛЬ:|ВХОД:|ПРИНЦИПЫ|ШАГ\s|Требования|ПОРЯДОК|АЛГОРИТМ)/;

/** TypeScript-specific syntax that plain JavaScript never contains. */
const TS_MARKER_RE =
  /(:\s*(number|string|boolean|void|unknown|any|never|object|symbol|bigint|Promise|Record|Array|Partial|Readonly)\b|interface\s+\w|type\s+\w+\s*=|<T>|as const|\?\s*:|readonly\s+\w|@Injectable|@Module|@Controller|@Get|@Post)/;

const JS_HEAD_RE =
  /^(const |let |var |import |export |function |class |interface |type |enum |async |\/\/|\/\*|@[\w.]+|'use strict|\})/;

function escapeHtml(text: string): string {
  return text.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string);
}

function detectLanguage(code: string): string | null {
  const trimmed = code.trimStart();
  const firstLine = trimmed.split('\n')[0];

  if (/^#\s*syntax=docker\//.test(trimmed)) return 'dockerfile';
  if (PROMPT_RE.test(trimmed)) return null;
  if (/^(SELECT\b|EXPLAIN\b|--\s)/i.test(trimmed)) return 'sql';
  // YAML (optionally preceded by a comment line), e.g. agent permission config
  if (/^(#[^\n]*\n)?[\w.-]+:\n(\s+[\w.-]+:[^\n]*\n|\s+- [^\n]*\n)+/.test(trimmed)) return 'yaml';
  // Markdown: heading or frontmatter fence on the first line
  if (/^#{1,6} /.test(firstLine) || firstLine === '---') return 'markdown';
  if (JS_HEAD_RE.test(firstLine)) {
    return TS_MARKER_RE.test(code) ? 'typescript' : 'javascript';
  }

  const auto = hljs.highlightAuto(code, ['typescript', 'javascript', 'json', 'bash', 'yaml', 'markdown', 'sql']);
  return auto.relevance >= 4 ? (auto.language ?? null) : null;
}

/** Highlights a source block; prose notes and prompts stay unhighlighted. */
export function highlightCode(code: string): CodeHighlight {
  if (code.trimStart().startsWith('Примечание:')) {
    return { kind: 'note', lang: null, label: 'заметка', html: escapeHtml(code) };
  }

  const prompt = PROMPT_RE.test(code.trimStart());
  const lang = prompt ? null : detectLanguage(code);

  if (!lang) {
    return { kind: 'code', lang: null, label: prompt ? 'промпт' : 'текст', html: escapeHtml(code) };
  }

  try {
    const result = hljs.highlight(code, { language: lang, ignoreIllegals: true });
    return { kind: 'code', lang, label: LABELS[lang] ?? lang, html: result.value };
  } catch {
    return { kind: 'code', lang: null, label: 'текст', html: escapeHtml(code) };
  }
}
