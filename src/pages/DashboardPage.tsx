import { Button, Card, Col, Popconfirm, Progress, Row, Space, Statistic, Tag, Typography } from 'antd';
import { FireOutlined, ReloadOutlined, RocketOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { chapterMeta, meta } from '../data/content';
import { countDone, doneHours, moduleProgress, moduleUnits, overallProgress } from '../progress/stats';
import { useProgress } from '../progress/ProgressContext';
import { useProgram } from '../ProgramContext';

export function DashboardPage() {
  const { def, ns, href } = useProgram();
  const { state, resetAll } = useProgress();
  const navigate = useNavigate();

  const overall = overallProgress(meta, state, def.modules, ns);
  const hours = doneHours(meta, state, def.modules, ns);
  const moduleKeys = def.modules.flatMap((m) => moduleUnits(meta, m, ns));
  const unitsDone = moduleKeys.filter((k) => state.units[k]).length;
  const qaDone = countDone(state.qa, ns);
  const checkDone = countDone(state.checklist, ns);
  const weeksDone = countDone(state.weeks, ns);

  const interviewTotal = chapterMeta(def.interviewChapter)?.questions ?? 0;
  const checklistTotal = chapterMeta(def.checklistChapter)?.checklistItems ?? 0;
  const weeksTotal = chapterMeta(def.planChapter)?.weeks ?? 0;

  const current =
    def.modules.find((m) => {
      const p = moduleProgress(meta, m, state, ns);
      return p > 0 && p < 1;
    }) ?? def.modules.find((m) => moduleProgress(meta, m, state, ns) < 1);

  const percent = Math.round(overall * 100);

  return (
    <Space orientation="vertical" size={16} style={{ width: '100%' }}>
      <Card>
        <div className="qa-category-head">
          <div>
            <Typography.Title level={4} style={{ marginBottom: 4 }}>
              {def.info.title}
            </Typography.Title>
            <Typography.Text type="secondary">{def.info.subtitle}</Typography.Text>
            <div style={{ marginTop: 8 }}>
              <Space size={4} wrap>
                <Tag color="blue">{def.info.totalHours} часов</Tag>
                <Tag color="geekblue">{def.info.totalWeeks} недель</Tag>
                <Tag>{def.info.intensity}</Tag>
                <Tag>{def.info.revision}</Tag>
              </Space>
            </div>
          </div>
          <Space wrap>
            {current && (
              <Button
                type="primary"
                icon={<RocketOutlined />}
                onClick={() => navigate(href(`/modules/${current.id}`))}
              >
                Продолжить: модуль {current.id + 1}
              </Button>
            )}
            <Button icon={<FireOutlined />} onClick={() => navigate(href('/interview'))}>
              Интервью-вопросы
            </Button>
          </Space>
        </div>
        <Progress percent={percent} status={percent === 100 ? 'success' : 'active'} />
      </Card>

      <div className="stat-grid">
        <Card>
          <Statistic title="Прогресс программы" value={percent} suffix="%" />
        </Card>
        <Card>
          <Statistic title="Часы" value={hours} suffix={`/ ${def.info.totalHours} ч`} />
        </Card>
        <Card>
          <Statistic title="Темы закрыто" value={unitsDone} suffix={`/ ${moduleKeys.length}`} />
        </Card>
        <Card>
          <Statistic title="Интервью выучено" value={qaDone} suffix={`/ ${interviewTotal}`} />
        </Card>
        <Card>
          <Statistic title="Чеклисты пройдены" value={checkDone} suffix={`/ ${checklistTotal}`} />
        </Card>
        <Card>
          <Statistic title="Недель плана" value={weeksDone} suffix={`/ ${weeksTotal}`} />
        </Card>
      </div>

      <Card
        title="Прогресс по модулям"
        extra={
          <Link to={href('/modules')}>все модули →</Link>
        }
      >
        {def.modules.map((m) => {
          const p = moduleProgress(meta, m, state, ns);
          const pct = Math.round(p * 100);
          return (
            <div key={m.id} className="module-row">
              <Link to={href(`/modules/${m.id}`)} className="module-row-title">
                Модуль {m.id + 1}. {m.title}
              </Link>
              <Progress percent={pct} status={pct === 100 ? 'success' : 'active'} />
              <span className="module-row-hours">{m.hours.total} ч</span>
            </div>
          );
        })}
      </Card>

      <Card title="Ориентиры">
        <Row gutter={[16, 12]}>
          <Col xs={24} md={8}>
            <Button block onClick={() => navigate(href('/plan'))}>
              План по неделям
            </Button>
          </Col>
          <Col xs={24} md={8}>
            <Button block onClick={() => navigate(href('/checklists'))}>
              Чеклисты самопроверки
            </Button>
          </Col>
          <Col xs={24} md={8}>
            <Button block onClick={() => navigate(href('/program'))}>
              О программе и входных требованиях
            </Button>
          </Col>
        </Row>
        <div style={{ marginTop: 16 }}>
          <Popconfirm
            title="Сбросить весь прогресс?"
            description="Отмеченные темы, чеклисты, недели и вопросы будут очищены."
            okText="Сбросить"
            cancelText="Отмена"
            onConfirm={resetAll}
          >
            <Button danger icon={<ReloadOutlined />}>
              Сбросить прогресс
            </Button>
          </Popconfirm>
        </div>
      </Card>
    </Space>
  );
}
