import { Card, Collapse, Checkbox, Input, Progress, Result, Space, Spin, Tabs, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { parseInterview } from '../data/derive';
import type { InterviewCategory, InterviewQuestion } from '../data/derive';
import { meta } from '../data/content';
import { useChapters } from '../data/useChapters';
import { countDone } from '../progress/stats';
import { useProgress } from '../progress/ProgressContext';
import { BlockList } from '../components/BlockList';

function QuestionItem({ question, category }: { question: InterviewQuestion; category?: string }) {
  const { isDone, toggle } = useProgress();
  const key = `q:${question.key}`;
  const checked = isDone('qa', key);

  return (
    <div className="qa-item qa-row">
      <Checkbox
        className="qa-mark"
        checked={checked}
        aria-label={`Вопрос ${question.key} выучен`}
        onChange={() => toggle('qa', key)}
      />
      <div className="qa-collapse">
        <Collapse
          items={[
            {
              key: question.key,
              label: (
                <span className="qa-label">
                  <span className="qa-num">В {question.key}.</span>
                  <span>
                    {category && (
                      <span className="muted" style={{ marginRight: 6 }}>
                        [{category}]
                      </span>
                    )}
                    {question.text}
                  </span>
                </span>
              ),
              children:
                question.answers.length > 0 ? (
                  <BlockList blocks={[{ t: 'ul', items: question.answers }]} />
                ) : (
                  <span className="muted">Конспект ответа не найден.</span>
                ),
            },
          ]}
        />
      </div>
    </div>
  );
}

function CategoryPanel({ category }: { category: InterviewCategory }) {
  const { state } = useProgress();
  const learned = category.questions.filter((q) => state.qa[`q:${q.key}`]).length;
  return (
    <div>
      <div className="qa-category-head">
        <Typography.Text type="secondary">
          {learned} / {category.questions.length} выучено
        </Typography.Text>
      </div>
      {category.questions.map((q) => (
        <QuestionItem key={q.key} question={q} />
      ))}
    </div>
  );
}

export function InterviewPage() {
  const { chapters, error } = useChapters([19]);
  const { state } = useProgress();
  const [query, setQuery] = useState('');

  const parsed = useMemo(() => (chapters ? parseInterview(chapters[0].blocks) : null), [chapters]);
  const learned = countDone(state.qa);
  const total = meta.totals.questions;
  const pct = total > 0 ? Math.round((learned / total) * 100) : 0;

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!parsed || !q) return null;
    const out: { category: string; question: InterviewQuestion }[] = [];
    for (const cat of parsed.categories) {
      for (const question of cat.questions) {
        const haystack = `${question.text} ${question.answers.map((a) => a.text).join(' ')}`.toLowerCase();
        if (haystack.includes(q)) out.push({ category: cat.title, question });
      }
    }
    return out;
  }, [parsed, q]);

  return (
    <Space orientation="vertical" size={16} style={{ width: '100%' }}>
      <div className="page-head">
        <Typography.Title level={3} style={{ marginBottom: 4 }}>
          Вопросы и ответы для интервью
        </Typography.Title>
        <Typography.Text type="secondary">
          Банк из {total} вопросов. Сначала ответьте вслух своими словами, затем сверьте с конспектом.
        </Typography.Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
          <Typography.Text type="secondary">
            {learned} / {total} выучено
          </Typography.Text>
          <Progress
            percent={pct}
            status={pct === 100 ? 'success' : 'active'}
            style={{ flex: 1, minWidth: 200, maxWidth: 360 }}
          />
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Поиск по вопросам и ответам…"
            style={{ maxWidth: 340 }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {error && <Result status="error" title="Не удалось загрузить вопросы" subTitle={error} />}
      {!parsed && !error && (
        <div className="loading-center">
          <Spin size="large" description="Загрузка вопросов…" />
        </div>
      )}

      {parsed && (
        <>
          <Card title="Как работать с банком вопросов">
            <BlockList blocks={parsed.intro} />
          </Card>

          {results ? (
            <Card
              title={`Результаты поиска: ${results.length}`}
              extra={
                <a
                  role="button"
                  tabIndex={0}
                  onClick={() => setQuery('')}
                  onKeyDown={(e) => e.key === 'Enter' && setQuery('')}
                >
                  сбросить
                </a>
              }
            >
              {results.length === 0 && (
                <Typography.Text type="secondary">Ничего не найдено.</Typography.Text>
              )}
              {results.map((r) => (
                <QuestionItem
                  key={r.question.key}
                  question={r.question}
                  category={r.category.replace(/^\d+\.\d+\.\s*/, '')}
                />
              ))}
            </Card>
          ) : (
            <Card>
              <Tabs
                items={parsed.categories.map((cat) => ({
                  key: cat.id,
                  label: `${cat.title.replace(/^\d+\.\d+\.\s*/, '')} (${
                    cat.questions.filter((x) => state.qa[`q:${x.key}`]).length
                  }/${cat.questions.length})`,
                  children: <CategoryPanel category={cat} />,
                }))}
              />
            </Card>
          )}
        </>
      )}
    </Space>
  );
}
