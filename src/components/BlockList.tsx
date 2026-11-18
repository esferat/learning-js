import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckOutlined, CopyOutlined } from '@ant-design/icons';
import type { Block, TextRun } from '../types';
import { highlightCode } from '../lib/highlight';
import { DIAGRAMS } from './diagrams';

function Run({ run }: { run: TextRun }) {
  if (!run.segs) return <>{run.text}</>;
  return (
    <>
      {run.segs.map((s, i) => {
        let node: ReactNode = s.t;
        if (s.c) node = <code className="doc-inline-code">{s.t}</code>;
        if (s.b) node = <strong>{node}</strong>;
        return <span key={i}>{node}</span>;
      })}
    </>
  );
}

function CodeBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => highlightCode(text), [text]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — ignore
    }
  };

  if (result.kind === 'note') {
    return <div className="doc-code-note">{text}</div>;
  }

  const lines = text.split('\n');

  return (
    <figure className="code-block">
      <figcaption className="code-head">
        <span className="code-dots" aria-hidden="true">
          <i className="code-dot dot-r" />
          <i className="code-dot dot-y" />
          <i className="code-dot dot-g" />
        </span>
        <span className="code-lang">{result.label}</span>
        <button
          type="button"
          className="code-copy"
          aria-label="Копировать код"
          title={copied ? 'Скопировано' : 'Копировать'}
          onClick={copy}
        >
          {copied ? <CheckOutlined /> : <CopyOutlined />}
        </button>
      </figcaption>
      <div className="code-body">
        <div className="code-gutter" aria-hidden="true">
          {lines.map((_, i) => (
            <span key={i}>{i + 1}</span>
          ))}
        </div>
        <pre className="code-pre">
          <code
            className={result.lang ? `hljs language-${result.lang}` : 'hljs'}
            dangerouslySetInnerHTML={{ __html: result.html }}
          />
        </pre>
      </div>
    </figure>
  );
}

function DocTable({ rows }: { rows: string[][] }) {
  const cols = rows.reduce((max, r) => Math.max(max, r.length), 0);
  const pad = (r: string[]) => Array.from({ length: cols }, (_, i) => r[i] ?? '');
  return (
    <div className="doc-table-wrap">
      <table className="doc-table">
        <thead>
          <tr>
            {pad(rows[0]).map((c, i) => (
              <th key={i}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(1).map((r, ri) => (
            <tr key={ri}>
              {pad(r).map((c, ci) => (
                <td key={ci}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Renders a list of document blocks as styled HTML. */
export function BlockList({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.t) {
          case 'h2':
            return (
              <h2 key={i} className="doc-h2">
                {b.text}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={i} className="doc-h3">
                {b.text}
              </h3>
            );
          case 'h4':
          case 'h5':
            return (
              <h4 key={i} className="doc-h4">
                {b.text}
              </h4>
            );
          case 'p':
            return (
              <p key={i} className={b.text.startsWith('Примечание:') ? 'doc-p doc-note' : 'doc-p'}>
                <Run run={b} />
              </p>
            );
          case 'ul':
            return (
              <ul key={i} className="doc-list">
                {b.items.map((item, ii) => (
                  <li key={ii}>
                    <Run run={item} />
                  </li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={i} className="doc-list">
                {b.items.map((item, ii) => (
                  <li key={ii}>
                    <Run run={item} />
                  </li>
                ))}
              </ol>
            );
          case 'code':
            return <CodeBlock key={i} text={b.text} />;
          case 'diagram': {
            const Diagram = DIAGRAMS[b.id];
            return Diagram ? <Diagram key={i} /> : null;
          }
          case 'table':
            return <DocTable key={i} rows={b.rows} />;
          default:
            return null;
        }
      })}
    </>
  );
}
