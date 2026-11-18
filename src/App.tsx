import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ProgressProvider } from './progress/ProgressContext';
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
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/modules" element={<ModulesPage />} />
              <Route path="/modules/:id" element={<ModulePage />} />
              <Route path="/modules/:id/:unit" element={<ModulePage />} />
              <Route path="/program" element={<ProgramPage />} />
              <Route path="/checklists" element={<ChecklistsPage />} />
              <Route path="/plan" element={<PlanPage />} />
              <Route path="/interview" element={<InterviewPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </ProgressProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}
