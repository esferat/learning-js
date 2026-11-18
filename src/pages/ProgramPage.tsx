import { Card, Result, Space, Spin, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { chapterMeta } from '../data/content';
import { useChapters } from '../data/useChapters';
import { UnitizedContent } from '../components/UnitizedContent';

/** Chapters 1–2: goal, entry requirements, format, effort and the project map. */
export function ProgramPage() {
  const { chapters, error } = useChapters([1, 2]);

  return (
    <Space orientation="vertical" size={16} style={{ width: '100%' }}>
      <div className="page-head">
        <Typography.Title level={3} style={{ marginBottom: 4 }}>
          О программе
        </Typography.Title>
        <Typography.Text type="secondary">
          Цель, входные требования, формат обучения, трудозатраты и карта проектов портфолио
        </Typography.Text>
      </div>

      {error && <Result status="error" title="Не удалось загрузить содержимое" subTitle={error} />}
      {!chapters && !error && (
        <div className="loading-center">
          <Spin size="large" description="Загрузка…" />
        </div>
      )}
      {chapters?.map((chapter) => {
        const cm = chapterMeta(chapter.num);
        return (
          <Card key={chapter.num} className="chapter-block" title={chapter.title}>
            <UnitizedContent
              chapterNum={chapter.num}
              blocks={chapter.blocks}
              units={cm?.units ?? []}
            />
          </Card>
        );
      })}

      <Card>
        <Typography.Text type="secondary">
          Дальше: <Link to="/plan">план по неделям</Link> · <Link to="/checklists">чеклисты</Link> ·{' '}
          <Link to="/interview">вопросы интервью</Link> · <Link to="/resources">ресурсы</Link>
        </Typography.Text>
      </Card>
    </Space>
  );
}
