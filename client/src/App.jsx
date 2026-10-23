import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TechnologiesPage from './pages/TechnologiesPage';

// Protected pages — M3
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import CreateProjectPage from './pages/CreateProjectPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import EditProjectPage from './pages/EditProjectPage';

// Protected pages — M4
import RequirementsPage from './pages/RequirementsPage';

// Protected pages — M6
import RecommendationsPage from './pages/RecommendationsPage';

// Protected pages — M7 & M8
import ComparisonPage from './pages/ComparisonPage';
import ExplanationPage from './pages/ExplanationPage';

// Protected pages — M9, M10, M11
import HLDPage from './pages/HLDPage';
import LLDPage from './pages/LLDPage';
import DiagramsPage from './pages/DiagramsPage';
import ReportViewPage from './pages/ReportViewPage';
import ReportsPage from './pages/ReportsPage';

// Dedicated Enterprise Architecture Engines
import ValidationPage from './pages/ValidationPage';
import ScenarioPage from './pages/ScenarioPage';
import CapacityCostPage from './pages/CapacityCostPage';
import TraceabilityPage from './pages/TraceabilityPage';

// Placeholder pages
import ArchitecturePage from './pages/ArchitecturePage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* ── Public routes ─────────────────────────────────────────── */}
              <Route index element={<LandingPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="technologies" element={<TechnologiesPage />} />

              {/* ── Protected routes ──────────────────────────────────────── */}
              <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

              {/* M3 — Project Management */}
              <Route path="projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
              <Route path="create-project" element={<ProtectedRoute><CreateProjectPage /></ProtectedRoute>} />
              <Route path="projects/:id" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
              <Route path="projects/:id/edit" element={<ProtectedRoute><EditProjectPage /></ProtectedRoute>} />

              {/* M4 — Requirements */}
              <Route path="projects/:id/requirements" element={<ProtectedRoute><RequirementsPage /></ProtectedRoute>} />

              {/* M6 — Recommendations */}
              <Route path="projects/:id/recommendations" element={<ProtectedRoute><RecommendationsPage /></ProtectedRoute>} />

              {/* M7 — Architecture Scoring & Comparison */}
              <Route path="projects/:id/compare" element={<ProtectedRoute><ComparisonPage /></ProtectedRoute>} />

              {/* M8 — AI Explanation */}
              <Route path="projects/:id/explain" element={<ProtectedRoute><ExplanationPage /></ProtectedRoute>} />

              {/* M9 — HLD & LLD */}
              <Route path="projects/:id/hld" element={<ProtectedRoute><HLDPage /></ProtectedRoute>} />
              <Route path="projects/:id/lld" element={<ProtectedRoute><LLDPage /></ProtectedRoute>} />

              {/* M10 — Diagrams */}
              <Route path="projects/:id/diagrams" element={<ProtectedRoute><DiagramsPage /></ProtectedRoute>} />

              {/* Dedicated Enterprise Decision Engines */}
              <Route path="projects/:id/validate" element={<ProtectedRoute><ValidationPage /></ProtectedRoute>} />
              <Route path="projects/:id/scenarios" element={<ProtectedRoute><ScenarioPage /></ProtectedRoute>} />
              <Route path="projects/:id/capacity-cost" element={<ProtectedRoute><CapacityCostPage /></ProtectedRoute>} />
              <Route path="projects/:id/traceability" element={<ProtectedRoute><TraceabilityPage /></ProtectedRoute>} />

              {/* M11 — Final Architecture Report */}
              <Route path="projects/:id/report" element={<ProtectedRoute><ReportViewPage /></ProtectedRoute>} />
              <Route path="reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />

              {/* Placeholder routes */}
              <Route path="architecture" element={<ProtectedRoute><ArchitecturePage /></ProtectedRoute>} />

              {/* 404 fallback */}
              <Route path="*" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
