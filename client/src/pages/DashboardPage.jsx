import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity, Server, Database, Layers, RefreshCw, Plus,
  CheckCircle2, AlertCircle, FolderKanban, ArrowRight,
  Sparkles, FileSpreadsheet, Clock, ChevronRight, BarChart3,
  Cpu, Shield, Terminal
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import { fetchHealthStatus } from '../services/healthService';
import { projectService } from '../services/projectService';
import { useAuth } from '../hooks/useAuth';

const STATUS_BADGES = {
  'Draft': 'bg-slate-800 text-slate-400 border-slate-700',
  'Requirements Collected': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'Analysis Complete': 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  'Architecture Generated': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [healthData, setHealthData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [health, projectsRes] = await Promise.allSettled([
        fetchHealthStatus(),
        projectService.getProjects(),
      ]);

      if (health.status === 'fulfilled') {
        setHealthData(health.value);
      } else {
        setError(health.reason?.message || 'Failed to reach API server');
      }

      if (projectsRes.status === 'fulfilled' && projectsRes.value?.projects) {
        setProjects(projectsRes.value.projects);
      }
    } catch (err) {
      setError(err.message || 'Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const totalProjects = projects.length;
  const completedProjects = projects.filter((p) => p.status === 'Architecture Generated').length;

  return (
    <div className="space-y-8 max-w-7xl">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#35D0BA] px-2 py-0.5 rounded bg-[#35D0BA]/10 border border-[#35D0BA]/20">
              Engineering Workstation
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Architecture Workspace</h1>
          <p className="text-xs text-slate-400 mt-1">
            Welcome back, <span className="text-slate-200 font-medium">{user?.name || 'Engineer'}</span>. Monitor telemetry, evaluate tech stacks, and generate system blueprints.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadDashboardData} isLoading={loading}>
            Refresh
          </Button>
          <Link to="/create-project">
            <Button variant="primary" size="sm" icon={Plus}>
              New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Workstation KPI Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Projects</span>
            <FolderKanban className="w-4 h-4 text-[#35D0BA]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">{totalProjects}</span>
            <span className="text-xs text-slate-500">projects</span>
          </div>
          <p className="text-[11px] text-slate-400">Total architectures in workspace</p>
        </div>

        {/* Metric 2 */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Completed Stacks</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">{completedProjects}</span>
            <span className="text-xs text-slate-500">of {totalProjects}</span>
          </div>
          <p className="text-[11px] text-slate-400">Architectures fully generated</p>
        </div>

        {/* Metric 3 */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Tech Catalog</span>
            <Database className="w-4 h-4 text-[#6FA8C9]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">20</span>
            <span className="text-xs text-slate-500">technologies</span>
          </div>
          <p className="text-[11px] text-slate-400">10 benchmarked categories</p>
        </div>

        {/* Metric 4 */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">API Health</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold font-mono text-emerald-400">
              {healthData?.status ? '99.9% Uptime' : 'Offline'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">MongoDB + Express live</p>
        </div>
      </div>

      {/* ── Active Architecture Projects ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#35D0BA]" />
            <h2 className="text-base font-semibold text-slate-200">Recent Architecture Projects</h2>
          </div>
          {projects.length > 0 && (
            <Link to="/projects" className="text-xs text-[#35D0BA] hover:text-[#36BFC7] font-medium flex items-center gap-1">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs animate-pulse bg-slate-900/40 border border-slate-800 rounded-xl">
            Loading architecture projects...
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#35D0BA]/10 border border-[#35D0BA]/20 flex items-center justify-center text-[#35D0BA]">
                <FolderKanban className="w-6 h-6" />
              </div>
              <div className="max-w-md">
                <h3 className="text-sm font-semibold text-slate-200">No Projects in Workspace Yet</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Start an 8-stage architecture analysis to gather requirements, calculate MCDA technology scores, generate HLD/LLD blueprints, and export master reports.
                </p>
              </div>
              <Link to="/create-project">
                <Button variant="primary" size="sm" icon={Plus}>
                  Create First Project
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.slice(0, 4).map((proj) => (
              <div
                key={proj._id}
                onClick={() => navigate(`/projects/${proj._id}`)}
                className="p-5 bg-slate-900/90 border border-slate-800 hover:border-[#35D0BA]/40 rounded-xl transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${STATUS_BADGES[proj.status] || STATUS_BADGES['Draft']}`}>
                      {proj.status}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {proj.applicationType || 'Web App'}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100 group-hover:text-[#35D0BA] transition-colors line-clamp-1">
                    {proj.projectName}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                    {proj.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {new Date(proj.createdAt).toLocaleDateString()}
                    </span>
                    {proj.expectedTraffic && (
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {proj.expectedTraffic} Traffic
                      </span>
                    )}
                  </div>
                  <span className="text-[#35D0BA] text-xs font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Enter <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── System Telemetry & Quick Access ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Backend API Health Status Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#35D0BA]/10 border border-[#35D0BA]/20 flex items-center justify-center text-[#35D0BA]">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm">Server Telemetry & Infrastructure</CardTitle>
                  <CardDescription className="text-xs">Express REST Cluster & MongoDB Connection Status</CardDescription>
                </div>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border ${
                  loading
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : healthData
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}
              >
                {loading ? 'Testing...' : healthData ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          </CardHeader>

          <CardContent>
            {error ? (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                <p className="font-semibold">{error}</p>
                <p className="text-slate-400 mt-1">Make sure backend is running on port 5000 (`node server.js`).</p>
              </div>
            ) : healthData ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Status</span>
                  <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {healthData.status || 'OK'}
                  </p>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">MongoDB</span>
                  <p className="text-xs font-semibold text-slate-200 flex items-center gap-1 font-mono">
                    <Database className="w-3.5 h-3.5 text-[#35D0BA]" />
                    {healthData.database?.status || 'Connected'}
                  </p>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Environment</span>
                  <p className="text-xs font-mono text-slate-200">{healthData.environment || 'production'}</p>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Uptime</span>
                  <p className="text-xs font-mono text-slate-200 truncate">{healthData.uptime || 'Active'}</p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Quick Workstation Shortcuts */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Quick Actions</CardTitle>
            <CardDescription className="text-xs">Direct navigation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              to="/technologies"
              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-800 hover:border-[#35D0BA]/30 bg-slate-950/40 hover:bg-slate-900 transition-colors text-xs text-slate-300"
            >
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#35D0BA]" />
                <span>Technology Knowledge Base</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </Link>

            <Link
              to="/reports"
              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-800 hover:border-[#35D0BA]/30 bg-slate-950/40 hover:bg-slate-900 transition-colors text-xs text-slate-300"
            >
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Architecture Reports Hub</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </Link>

            <Link
              to="/create-project"
              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-800 hover:border-[#35D0BA]/30 bg-slate-950/40 hover:bg-slate-900 transition-colors text-xs text-slate-300"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-sky-400" />
                <span>New Architecture Wizard</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
