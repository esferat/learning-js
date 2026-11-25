import { Card, Result, Space, Spin, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { chapterMeta } from '../data/content';
import { useChapters } from '../data/useChapters';
import { UnitizedContent } from '../components/UnitizedContent';
import { useProgram } from '../ProgramContext';

/** Введение и структура программы (главы «О программе» текущего направления). */
export function ProgramPage() {
  const { def, href } = useProgram();
  const { chapters, error } = useChapters(def.introChapters);

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
          Дальше: <Link to={href('/plan')}>план по неделям</Link> ·{' '}
          <Link to={href('/checklists')}>чеклисты</Link> ·{' '}
          <Link to={href('/interview')}>вопросы интервью</Link> ·{' '}
          <Link to={href('/resources')}>ресурсы</Link>
        </Typography.Text>
      </Card>
    </Space>
  );
}
