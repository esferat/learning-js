import { useEffect, useState } from 'react';
import { Layout, Menu, Progress, Typography } from 'antd';
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
import { MODULES, MODULE_SHORT, PROGRAM } from '../data/curriculum';
import { moduleTopics, overallProgress, doneHours } from '../progress/stats';
import { useProgress } from '../progress/ProgressContext';

const MODULE_SUB = 'modules-sub';

const MENU: MenuProps['items'] = [
  { key: '/', icon: <DashboardOutlined />, label: 'Дашборд' },
  {
    key: MODULE_SUB,
    icon: <BookOutlined />,
    label: 'Модули',
    children: [
      { key: '/modules', label: 'Все модули' },
      // Третий уровень — темы модуля в нумерации документа (3.1, 3.2.1, …)
      ...MODULES.map((m) => ({
        key: `mod-${m.id}`,
        label: `${m.id + 1}. ${MODULE_SHORT[m.id] ?? m.title}`,
        children: moduleTopics(meta, m).map((t) => ({
          key: `/modules/${m.id}/${t.index}`,
          label: t.title,
          ellipsis: true,
        })),
      })),
    ],
  },
  { key: '/program', icon: <InfoCircleOutlined />, label: 'О программе' },
  { key: '/checklists', icon: <CheckSquareOutlined />, label: 'Чеклисты' },
  { key: '/plan', icon: <CalendarOutlined />, label: 'План по неделям' },
  { key: '/interview', icon: <QuestionCircleOutlined />, label: 'Интервью' },
  { key: '/resources', icon: <FolderOpenOutlined />, label: 'Ресурсы' },
];

/** Route keys of leaf items (submenu parents are not routes themselves). */
function routeKeys(items: MenuProps['items']): string[] {
  const keys: string[] = [];
  for (const item of items ?? []) {
    if (!item || typeof item !== 'object') continue;
    const obj = item as { key?: unknown; children?: unknown };
    if (Array.isArray(obj.children)) {
      keys.push(...routeKeys(obj.children as MenuProps['items']));
    } else if (typeof obj.key === 'string') {
      keys.push(obj.key);
    }
  }
  return keys;
}

function findSelected(pathname: string): string | undefined {
  let best = '';
  for (const key of routeKeys(MENU)) {
    const matches = key === '/' ? pathname === '/' : pathname === key || pathname.startsWith(`${key}/`);
    if (matches && key.length > best.length) best = key;
  }
  return best || undefined;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

export function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { state } = useProgress();
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const overall = overallProgress(meta, state);
  const selected = findSelected(pathname);

  // keep the modules submenu (and the active module's topics) open while browsing
  useEffect(() => {
    const m = pathname.match(/^\/modules(?:\/(\d+))?/);
    if (!m) return;
    setOpenKeys((prev) => {
      const add: string[] = [MODULE_SUB];
      if (m[1] !== undefined) add.push(`mod-${m[1]}`);
      return Array.from(new Set([...prev, ...add]));
    });
  }, [pathname]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <ScrollToTop />
      <SiderImpl
        selected={selected}
        openKeys={openKeys}
        onOpenChange={setOpenKeys}
        onNavigate={navigate}
      />
      <Layout>
        <header className="app-header">
          <div className="app-header-title">
            <Typography.Text strong>{PROGRAM.title}</Typography.Text>
            <Typography.Text type="secondary" className="app-header-sub">
              {PROGRAM.revision} · {PROGRAM.totalHours} ч · {PROGRAM.totalWeeks} недель
            </Typography.Text>
          </div>
          <div className="app-header-progress">
            <Typography.Text type="secondary">
              Пройдено {doneHours(meta, state)} / {PROGRAM.totalHours} ч
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

function SiderImpl({
  selected,
  openKeys,
  onOpenChange,
  onNavigate,
}: {
  selected: string | undefined;
  openKeys: string[];
  onOpenChange: (keys: string[]) => void;
  onNavigate: (path: string) => void;
}) {
  const { Sider } = Layout;
  return (
    <Sider width={400} breakpoint="lg" collapsedWidth={64} className="app-sider">
      <Link to="/" className="app-logo">
        <span className="app-logo-icon">📘</span>
        <span className="app-logo-text">Fullstack Middle+/Senior</span>
      </Link>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={selected ? [selected] : []}
        openKeys={openKeys}
        onOpenChange={onOpenChange}
        items={MENU}
        onClick={({ key }) => {
          if (key.startsWith('/')) onNavigate(key);
        }}
      />
    </Sider>
  );
}
