import { Card, Checkbox, Progress, Result, Space, Spin, Typography } from 'antd';
import { useMemo } from 'react';
import { chapterMeta } from '../data/content';
import { parseChecklists } from '../data/derive';
import { useChapters } from '../data/useChapters';
import { countDone } from '../progress/stats';
import { useProgress } from '../progress/ProgressContext';
import { useProgram } from '../ProgramContext';
import { BlockList } from '../components/BlockList';

export function ChecklistsPage() {
  const { def, ns } = useProgram();
  const { chapters, error } = useChapters([def.checklistChapter]);
  const { state, isDone, toggle } = useProgress();

  const parsed = useMemo(
    () => (chapters ? parseChecklists(chapters[0].blocks) : null),
    [chapters],
  );

  const done = countDone(state.checklist, ns);
  const total =
    chapterMeta(def.checklistChapter)?.checklistItems ??
    parsed?.sections.reduce((s, sec) => s + sec.items.length, 0) ??
    0;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Space orientation="vertical" size={16} style={{ width: '100%' }}>
      <div className="page-head">
        <Typography.Title level={3} style={{ marginBottom: 4 }}>
          Контрольные точки и чеклисты
        </Typography.Title>
        <Typography.Text type="secondary">
          Пройдите чек-лист после соответствующего модуля. Ответ «нет» = вернуться в тему.
        </Typography.Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <Progress percent={pct} status={pct === 100 ? 'success' : 'active'} style={{ flex: 1, maxWidth: 420 }} />
          <Typography.Text type="secondary">
            {done} / {total}
          </Typography.Text>
        </div>
      </div>

      {error && <Result status="error" title="Не удалось загрузить чеклисты" subTitle={error} />}
      {!parsed && !error && (
        <div className="loading-center">
          <Spin size="large" description="Загрузка чек-листов…" />
        </div>
      )}

      {parsed && (
        <Card
          className="chapter-block"
          title={chapterMeta(def.checklistChapter)?.title ?? 'Контрольные точки и чеклисты'}
        >
          <BlockList blocks={parsed.intro} />
          {parsed.sections.map((section) => {
            const sectionDone = section.items.filter((_, i) =>
              isDone('checklist', `${ns}cl:${section.id}:${i}`),
            ).length;
            return (
              <div key={section.id} style={{ marginTop: 20 }}>
                <div className="qa-category-head" style={{ marginBottom: 4 }}>
                  <Typography.Title level={5} style={{ margin: 0 }}>
                    {section.title}
                  </Typography.Title>
                  <Typography.Text type={sectionDone === section.items.length ? 'success' : 'secondary'}>
                    {sectionDone} / {section.items.length}
                  </Typography.Text>
                </div>
                {section.items.map((item, i) => {
                  const key = `${ns}cl:${section.id}:${i}`;
                  const checked = isDone('checklist', key);
                  return (
                    <div key={key} className={checked ? 'check-row checked' : 'check-row'}>
                      <Checkbox checked={checked} onChange={() => toggle('checklist', key)} />
                      <span className="check-n">{item.n}</span>
                      <span className="check-text">{item.text}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </Card>
      )}
    </Space>
  );
}
