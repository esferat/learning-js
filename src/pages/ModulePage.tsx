import { Alert, Button, Card, Progress, Result, Select, Space, Spin, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useMemo } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { chapterMeta, meta } from '../data/content';
import { useChapters } from '../data/useChapters';
import { moduleTopics } from '../progress/stats';
import { useProgress } from '../progress/ProgressContext';
import { useProgram } from '../ProgramContext';
import { SingleUnit } from '../components/UnitizedContent';

export function ModulePage() {
  const params = useParams();
  const navigate = useNavigate();
  const id = Number(params.id);
  const { def, ns, href } = useProgram();
  const module = Number.isInteger(id) ? def.modules.find((m) => m.id === id) : undefined;
  const { chapters, error } = useChapters(module ? module.chapterNums : []);
  const { state } = useProgress();

  const topics = useMemo(
    () => (module ? moduleTopics(meta, module, ns) : []),
    [module, ns],
  );

  // First topic that is not closed yet — the «continue where you left off» target.
  const activeIdx = topics.findIndex((t) => !state.units[t.key]);
  const fallback = activeIdx === -1 ? 0 : activeIdx;

  if (!module) {
    return (
      <Result
        status="404"
        title="Модуль не найден"
        extra={
          <Link to={href('/modules')}>
            <Button type="primary">К списку модулей</Button>
          </Link>
        }
      />
    );
  }
  if (topics.length === 0) {
    return <Result status="error" title="В модуле нет тем" />;
  }

  // /modules/:id → the active topic; invalid index → the active topic as well.
  const rawUnit = params.unit === undefined ? undefined : Number(params.unit);
  if (rawUnit === undefined || !Number.isInteger(rawUnit) || rawUnit < 0 || rawUnit >= topics.length) {
    return <Navigate replace to={href(`/modules/${id}/${fallback}`)} />;
  }

  const index = rawUnit;
  const topic = topics[index];
  const doneCount = topics.filter((t) => state.units[t.key]).length;
  const pct = Math.round((doneCount / topics.length) * 100);
  const chapter = chapters?.find((c) => c.num === topic.chapterNum);

  const options = module.chapterNums.map((num) => ({
    label: chapterMeta(num)?.title ?? `Глава ${num}`,
    options: topics
      .filter((t) => t.chapterNum === num)
      .map((t) => ({ value: t.index, label: t.title })),
  }));

  const goTo = (i: number) => navigate(href(`/modules/${id}/${i}`));

  return (
    <Space orientation="vertical" size={16} style={{ width: '100%' }}>
      <div className="page-head">
        <Link to={href('/modules')} className="muted">
          <ArrowLeftOutlined /> Модули
        </Link>
        <Typography.Title level={3} style={{ margin: '8px 0' }}>
          Модуль {module.id + 1}. {module.title}
        </Typography.Title>
        <Space size={4} wrap>
          <Tag color="blue">Теория {module.hours.theory} ч</Tag>
          <Tag color="green">Практика {module.hours.practice} ч</Tag>
          <Tag color="orange">ТЗ {module.hours.assignment} ч</Tag>
          <Tag>Итого {module.hours.total} ч</Tag>
          <Tag>≈{String(module.daysAt9).replace('.', ',')} дней при 9 ч/день</Tag>
        </Space>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <Progress percent={pct} style={{ flex: 1, maxWidth: 420 }} />
          <Typography.Text type="secondary">
            {doneCount} / {topics.length} тем
          </Typography.Text>
        </div>
        <Alert
          style={{ marginTop: 12 }}
          type="info"
          showIcon
          title="Сдать по итогу модуля"
          description={module.assignment}
        />
      </div>

      <div className="topic-nav">
        <Button icon={<ArrowLeftOutlined />} disabled={index === 0} onClick={() => goTo(index - 1)}>
          Назад
        </Button>
        <Select
          className="topic-select"
          value={index}
          options={options}
          showSearch
          optionFilterProp="label"
          onChange={(v) => goTo(v)}
          aria-label="Выбор темы"
        />
        <Button
          disabled={index === topics.length - 1}
          onClick={() => goTo(index + 1)}
        >
          Далее <ArrowRightOutlined />
        </Button>
        <span className="topic-pos">
          Тема {index + 1} из {topics.length}
        </span>
      </div>

      {error && <Result status="error" title="Не удалось загрузить содержимое" subTitle={error} />}
      {!chapters && !error && (
        <div className="loading-center">
          <Spin size="large" description="Загрузка темы…" />
        </div>
      )}
      {chapter && (
        <Card className="chapter-block" title={chapter.title}>
          <SingleUnit
            chapterNum={topic.chapterNum}
            blocks={chapter.blocks}
            units={chapterMeta(topic.chapterNum)?.units ?? []}
            index={topic.localIdx}
            showPreamble={index === 0}
          />
        </Card>
      )}

      <div className="topic-nav topic-nav-bottom">
        <Button icon={<ArrowLeftOutlined />} disabled={index === 0} onClick={() => goTo(index - 1)}>
          Предыдущая тема
        </Button>
        <Typography.Text type="secondary">
          {doneCount} из {topics.length} тем модуля закрыто
        </Typography.Text>
        <Button
          type="primary"
          disabled={index === topics.length - 1}
          onClick={() => goTo(index + 1)}
        >
          Следующая тема <ArrowRightOutlined />
        </Button>
      </div>
    </Space>
  );
}
