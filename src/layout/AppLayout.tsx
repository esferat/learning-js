import { useEffect, useState } from 'react';
import { Layout, Menu, Progress, Segmented, Typography } from 'antd';
import type { MenuProps } from 'antd';
import {
  BookOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  DashboardOutlined,
  FolderOpenOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { meta } from '../data/content';
import { PROGRAMS } from '../data/curriculum';
import { moduleTopics, overallProgress, doneHours } from '../progress/stats';
import { useProgress } from '../progress/ProgressContext';
import { useProgram } from '../ProgramContext';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

function findSelected(pathname: string, items: MenuProps['items']): string | undefined {
  const keys: string[] = [];
  const walk = (list: MenuProps['items']) => {
    for (const item of list ?? []) {
      if (!item || typeof item !== 'object') continue;
      const obj = item as { key?: unknown; children?: unknown };
      if (Array.isArray(obj.children)) walk(obj.children as MenuProps['items']);
      else if (typeof obj.key === 'string') keys.push(obj.key);
    }
  };
  walk(items);
  let best = '';
  for (const key of keys) {
    if ((pathname === key || pathname.startsWith(`${key}/`)) && key.length > best.length) best = key;
  }
  return best || undefined;
}

export function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { state } = useProgress();
  const { def, ns } = useProgram();
  const [userOpen, setUserOpen] = useState<string[]>([]);

  const overall = overallProgress(meta, state, def.modules, ns);
  const selected = findSelected(pathname, buildMenu(def, ns));

  // Ключи, открытые по маршруту (подменю «Модули» и активный модуль):
  // вычисляются из pathname на каждом рендере — переживает любые сбросы состояния.
  const modMatch = pathname.match(new RegExp(`^${def.path}/modules(?:/(\\d+))?`));
  const routeOpen: string[] = modMatch
    ? ['modules-sub', ...(modMatch[1] !== undefined ? [`${def.path}/modules/${modMatch[1]}`] : [])]
    : [];
  const openKeys = Array.from(new Set([...userOpen, ...routeOpen]));

  const switchTo = (value: string) => {
    const next = String(value);
    const rest = pathname.startsWith(def.path) ? pathname.slice(def.path.length) : '';
    navigate(next + rest);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <ScrollToTop />
      <Layout.Sider width={400} breakpoint="lg" collapsedWidth={64} className="app-sider">
        <Link to={def.path} className="app-logo">
          <span className="app-logo-icon">📘</span>
          <span className="app-logo-text">{def.short}</span>
        </Link>
        <div className="app-switch">
          <Segmented
            size="small"
            value={def.path}
            options={[
              { label: PROGRAMS.fs.switchLabel, value: PROGRAMS.fs.path },
              { label: PROGRAMS.java.switchLabel, value: PROGRAMS.java.path },
            ]}
            onChange={switchTo}
          />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selected ? [selected] : []}
          openKeys={openKeys}
          onOpenChange={(keys) => setUserOpen(keys)}
          items={buildMenu(def, ns)}
          onClick={({ key }) => {
            if (key.startsWith('/')) navigate(key);
          }}
        />
      </Layout.Sider>
      <Layout>
        <header className="app-header">
          <div className="app-header-title">
            <Typography.Text strong>{def.info.title}</Typography.Text>
            <Typography.Text type="secondary" className="app-header-sub">
              {def.info.revision} · {def.info.totalHours} ч · {def.info.totalWeeks} недель
            </Typography.Text>
          </div>
          <div className="app-header-progress">
            <Typography.Text type="secondary">
              Пройдено {doneHours(meta, state, def.modules, ns)} / {def.info.totalHours} ч
            </Typography.Text>
            <Progress percent={Math.round(overall * 100)} />
          </div>
        </header>
        <main className="app-content">
          <Outlet />
        </main>
      </Layout>
    </Layout>
  );
}

/** Меню одного направления: Дашборд, Модули (→ темы), О программе, чек-листы, план, интервью, ресурсы. */
function buildMenu(def: (typeof PROGRAMS)[string], ns: string): MenuProps['items'] {
  const p = def.path;
  return [
    { key: p, icon: <DashboardOutlined />, label: 'Дашборд' },
    {
      key: 'modules-sub',
      icon: <BookOutlined />,
      label: 'Модули',
      children: [
        { key: `${p}/modules`, label: 'Все модули' },
        ...def.modules.map((m) => ({
          key: `${p}/modules/${m.id}`,
          label: `${m.id + 1}. ${def.shortTitles[m.id] ?? m.title}`,
          children: moduleTopics(meta, m, ns).map((t) => ({
            key: `${p}/modules/${m.id}/${t.index}`,
            label: t.title,
            ellipsis: true,
          })),
        })),
      ],
    },
    { key: `${p}/program`, icon: <InfoCircleOutlined />, label: 'О программе' },
    { key: `${p}/checklists`, icon: <CheckSquareOutlined />, label: 'Чеклисты' },
    { key: `${p}/plan`, icon: <CalendarOutlined />, label: 'План по неделям' },
    { key: `${p}/interview`, icon: <QuestionCircleOutlined />, label: 'Интервью' },
    { key: `${p}/resources`, icon: <FolderOpenOutlined />, label: 'Ресурсы' },
  ];
}
