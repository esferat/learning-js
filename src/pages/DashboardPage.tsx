import { Button, Card, Col, Popconfirm, Progress, Row, Space, Statistic, Tag, Typography } from 'antd';
import { FireOutlined, ReloadOutlined, RocketOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { meta } from '../data/content';
import { MODULES, PROGRAM, TOTAL_HOURS } from '../data/curriculum';
import { countDone, doneHours, moduleProgress, moduleUnits, overallProgress } from '../progress/stats';
import { useProgress } from '../progress/ProgressContext';

export function DashboardPage() {
  const { state, resetAll } = useProgress();
  const navigate = useNavigate();

  const overall = overallProgress(meta, state);
  const hours = doneHours(meta, state);
  const moduleKeys = MODULES.flatMap((m) => moduleUnits(meta, m));
  const unitsDone = moduleKeys.filter((k) => state.units[k]).length;
  const qaDone = countDone(state.qa);
  const checkDone = countDone(state.checklist);
  const weeksDone = countDone(state.weeks);

  const current =
    MODULES.find((m) => {
      const p = moduleProgress(meta, m, state);
      return p > 0 && p < 1;
    }) ?? MODULES.find((m) => moduleProgress(meta, m, state) < 1);

  const percent = Math.round(overall * 100);

  return (
    <Space orientation="vertical" size={16} style={{ width: '100%' }}>
      <Card>
        <div className="qa-category-head">
          <div>
            <Typography.Title level={4} style={{ marginBottom: 4 }}>
              {PROGRAM.title}
            </Typography.Title>
            <Typography.Text type="secondary">{PROGRAM.subtitle}</Typography.Text>
            <div style={{ marginTop: 8 }}>
              <Space size={4} wrap>
                <Tag color="blue">{PROGRAM.totalHours} часов</Tag>
                <Tag color="geekblue">{PROGRAM.totalWeeks} недель</Tag>
                <Tag>{PROGRAM.intensity}</Tag>
                <Tag>{PROGRAM.revision}</Tag>
              </Space>
            </div>
          </div>
          <Space wrap>
            {current && (
              <Button
                type="primary"
                icon={<RocketOutlined />}
                onClick={() => navigate(`/modules/${current.id}`)}
              >
                Продолжить: модуль {current.id + 1}
              </Button>
            )}
            <Button icon={<FireOutlined />} onClick={() => navigate('/interview')}>
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
          <Statistic title="Часы" value={hours} suffix={`/ ${TOTAL_HOURS} ч`} />
        </Card>
        <Card>
          <Statistic title="Темы закрыто" value={unitsDone} suffix={`/ ${moduleKeys.length}`} />
        </Card>
        <Card>
          <Statistic title="Интервью выучено" value={qaDone} suffix={`/ ${meta.totals.questions}`} />
        </Card>
        <Card>
          <Statistic
            title="Чеклисты пройдены"
            value={checkDone}
            suffix={`/ ${meta.totals.checklistItems}`}
          />
        </Card>
        <Card>
          <Statistic title="Недель плана" value={weeksDone} suffix={`/ ${meta.totals.weeks}`} />
        </Card>
      </div>

      <Card
        title="Прогресс по модулям"
        extra={
          <Link to="/modules">
            все модули →
          </Link>
        }
      >
        {MODULES.map((m) => {
          const p = moduleProgress(meta, m, state);
          const pct = Math.round(p * 100);
          return (
            <div key={m.id} className="module-row">
              <Link to={`/modules/${m.id}`} className="module-row-title">
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
            <Button block onClick={() => navigate('/plan')}>
              План на 18 недель
            </Button>
          </Col>
          <Col xs={24} md={8}>
            <Button block onClick={() => navigate('/checklists')}>
              Чеклисты самопроверки
            </Button>
          </Col>
          <Col xs={24} md={8}>
            <Button block onClick={() => navigate('/program')}>
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
