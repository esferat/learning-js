import { Card, Progress, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table/interface';
import { useNavigate, Link } from 'react-router-dom';
import { meta } from '../data/content';
import type { ModuleInfo } from '../data/curriculum';
import { moduleProgress } from '../progress/stats';
import { useProgress } from '../progress/ProgressContext';
import { useProgram } from '../ProgramContext';

interface Row extends ModuleInfo {
  key: number;
  progress: number;
}

function status(pct: number): { color: string; label: string } {
  if (pct >= 100) return { color: 'success', label: 'Готово' };
  if (pct > 0) return { color: 'processing', label: 'В процессе' };
  return { color: 'default', label: 'Не начат' };
}

export function ModulesPage() {
  const { state } = useProgress();
  const { def, ns, href } = useProgram();
  const navigate = useNavigate();

  const rows: Row[] = def.modules.map((m) => ({
    ...m,
    key: m.id,
    progress: Math.round(moduleProgress(meta, m, state, ns) * 100),
  }));

  const columns: ColumnsType<Row> = [
    {
      title: '№',
      dataIndex: 'id',
      key: 'id',
      width: 50,
      render: (id: number) => <Typography.Text strong>{id + 1}</Typography.Text>,
    },
    {
      title: 'Модуль',
      key: 'title',
      render: (_, row) => (
        <div>
          <Link to={href(`/modules/${row.id}`)} onClick={(e) => e.stopPropagation()}>
            {row.title}
          </Link>
          <div className="muted" style={{ fontSize: 12 }}>
            {row.stack}
          </div>
        </div>
      ),
    },
    { title: 'Т, ч', dataIndex: ['hours', 'theory'], key: 'theory', width: 60 },
    { title: 'П, ч', dataIndex: ['hours', 'practice'], key: 'practice', width: 60 },
    { title: 'ТЗ, ч', dataIndex: ['hours', 'assignment'], key: 'assignment', width: 65 },
    {
      title: 'Итого, ч',
      dataIndex: ['hours', 'total'],
      key: 'total',
      width: 80,
      render: (v: number) => <Typography.Text strong>{v}</Typography.Text>,
    },
    {
      title: 'Прогресс',
      key: 'progress',
      width: 170,
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Progress percent={row.progress} style={{ flex: 1, minWidth: 90 }} />
        </div>
      ),
    },
    {
      title: 'Статус',
      key: 'status',
      width: 120,
      render: (_, row) => <Tag color={status(row.progress).color}>{status(row.progress).label}</Tag>,
    },
    {
      title: 'Дней (9 ч)',
      dataIndex: 'daysAt9',
      key: 'days',
      width: 95,
      render: (v: number) => <span className="muted">{String(v).replace('.', ',')}</span>,
    },
  ];

  return (
    <Card
      title="Модули программы"
      extra={
        <Typography.Text type="secondary">
          {def.modules.reduce((s, m) => s + m.hours.total, 0)} ч · {def.modules.length} модулей
        </Typography.Text>
      }
    >
      <Table<Row>
        columns={columns}
        dataSource={rows}
        pagination={false}
        scroll={{ x: 940 }}
        onRow={(row) => ({
          onClick: () => navigate(href(`/modules/${row.id}`)),
          style: { cursor: 'pointer' },
        })}
      />
    </Card>
  );
}
