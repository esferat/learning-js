import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ProgressProvider } from './progress/ProgressContext';
import { ProgramScope } from './ProgramContext';
import { AppLayout } from './layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ModulesPage } from './pages/ModulesPage';
import { ModulePage } from './pages/ModulePage';
import { ProgramPage } from './pages/ProgramPage';
import { ChecklistsPage } from './pages/ChecklistsPage';
import { PlanPage } from './pages/PlanPage';
import { InterviewPage } from './pages/InterviewPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { NotFoundPage } from './pages/NotFoundPage';

/** Старые URL без направления → полный курс (/fs). */
function Legacy({ from, to }: { from: string; to: string }) {
  const { pathname, search } = useLocation();
  return <Navigate to={`${to}${pathname.slice(from.length)}${search}`} replace />;
}

export default function App() {
  return (
    <ConfigProvider
      locale={ruRU}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
          fontSize: 14,
        },
      }}
    >
      <BrowserRouter>
        <ProgressProvider>
          <Routes>
            {/* --- legacy redirects (прежние маршруты → направление Fullstack) --- */}
            <Route path="/" element={<Navigate to="/fs" replace />} />
            <Route path="/modules/*" element={<Legacy from="/modules" to="/fs/modules" />} />
            <Route path="/program" element={<Legacy from="/program" to="/fs/program" />} />
            <Route path="/checklists" element={<Legacy from="/checklists" to="/fs/checklists" />} />
            <Route path="/plan" element={<Legacy from="/plan" to="/fs/plan" />} />
            <Route path="/interview" element={<Legacy from="/interview" to="/fs/interview" />} />
            <Route path="/resources" element={<Legacy from="/resources" to="/fs/resources" />} />

            {/* --- направления: /fs и /java --- */}
            <Route path="/:prog" element={<ProgramScope />}>
              <Route element={<AppLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="modules" element={<ModulesPage />} />
                <Route path="modules/:id" element={<ModulePage />} />
                <Route path="modules/:id/:unit" element={<ModulePage />} />
                <Route path="program" element={<ProgramPage />} />
                <Route path="checklists" element={<ChecklistsPage />} />
                <Route path="plan" element={<PlanPage />} />
                <Route path="interview" element={<InterviewPage />} />
                <Route path="resources" element={<ResourcesPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Route>
          </Routes>
        </ProgressProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}
