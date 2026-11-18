import { Card, Checkbox, Progress, Result, Space, Spin, Typography } from 'antd';
import { useMemo } from 'react';
import { meta } from '../data/content';
import { isWeeksTable, parseWeeks } from '../data/derive';
import { useChapters } from '../data/useChapters';
import { countDone } from '../progress/stats';
import { useProgress } from '../progress/ProgressContext';
import { BlockList } from '../components/BlockList';
import type { Block } from '../types';

function WeeksTable({ blocks }: { blocks: Block[] }) {
  const { isDone, toggle } = useProgress();
  const weeks = useMemo(() => parseWeeks(blocks), [blocks]);

  return (
    <div className="doc-table-wrap">
      <table className="doc-table weeks-table">
        <thead>
          <tr>
            <th style={{ width: 110 }}>Неделя</th>
            <th>Фокус</th>
            <th>Результат недели</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((w) => {
            const key = `w:${w.n}`;
            const checked = isDone('weeks', key);
            return (
              <tr key={w.n} className={checked ? 'row-done' : undefined}>
                <td>
                  <span className="week-cell">
                    <Checkbox checked={checked} onChange={() => toggle('weeks', key)} />
                    <strong>{w.n}</strong>
                  </span>
                </td>
                <td>{w.focus}</td>
                <td>{w.result}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function PlanPage() {
  const { chapters, error } = useChapters([18]);
  const { state } = useProgress();

  const blocks = chapters?.[0]?.blocks ?? [];
  const done = countDone(state.weeks);
  const total = meta.totals.weeks;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Space orientation="vertical" size={16} style={{ width: '100%' }}>
      <div className="page-head">
        <Typography.Title level={3} style={{ marginBottom: 4 }}>
          Оценка трудозатрат и план по неделям
        </Typography.Title>
        <Typography.Text type="secondary">
          Режим 8–9 ч/день, 5–6 дней в неделю. Отмечайте недели по мере прохождения.
        </Typography.Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <Progress percent={pct} status={pct === 100 ? 'success' : 'active'} style={{ flex: 1, maxWidth: 420 }} />
          <Typography.Text type="secondary">
            {done} / {total} недель
          </Typography.Text>
        </div>
      </div>

      {error && <Result status="error" title="Не удалось загрузить план" subTitle={error} />}
      {!chapters && !error && (
        <div className="loading-center">
          <Spin size="large" description="Загрузка плана…" />
        </div>
      )}

      {chapters && (
        <Card className="chapter-block" title={chapters[0].title}>
          {blocks.map((b, i) =>
            isWeeksTable(b) ? (
              <WeeksTable key={i} blocks={[b]} />
            ) : (
              <BlockList key={i} blocks={[b]} />
            ),
          )}
        </Card>
      )}
    </Space>
  );
}
