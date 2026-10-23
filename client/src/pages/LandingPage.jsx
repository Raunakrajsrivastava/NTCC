import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Cpu, ShieldCheck, Zap, GitBranch, Database, Lock,
  Cloud, Server, ArrowRight, CheckCircle2, Brain,
  Layers, FileSpreadsheet, Activity, Monitor, Smartphone,
  Globe, Box, Boxes, ChevronRight, Clock, FolderOpen,
  Plus, BarChart3, AlertCircle,
} from 'lucide-react';
import Button from '../components/common/Button';
import { projectService } from '../services/projectService.js';

const capabilities = [
  { title: 'Frontend Architecture',    icon: Server,       desc: 'SPA, SSR, Micro-frontends & State Management advice tailored to your scale.', color: 'from-[#28A899] to-[#35D0BA]' },
  { title: 'Backend & API Design',     icon: Cpu,          desc: 'REST, GraphQL, gRPC, Microservices & Serverless decisions with trade-off analysis.', color: 'from-[#35D0BA] to-[#36BFC7]' },
  { title: 'Database & Caching',       icon: Database,     desc: 'SQL vs NoSQL, Sharding, Replication & Redis caching strategies.', color: 'from-[#36BFC7] to-[#6FA8C9]' },
  { title: 'Security & Auth',          icon: Lock,         desc: 'OAuth2, JWT, RBAC, Data Encryption & OWASP top-10 compliance checks.', color: 'from-[#6FA8C9] to-slate-400' },
  { title: 'Cloud & Deployment',       icon: Cloud,        desc: 'AWS, GCP, Azure, Kubernetes, CI/CD & Infrastructure as Code.', color: 'from-emerald-500 to-[#28A899]' },
  { title: 'HLD & LLD Diagrams',       icon: GitBranch,    desc: 'High & Low-Level Design with Mermaid diagrams, ER models & DFDs.', color: 'from-[#28A899] to-[#35D0BA]' },
];

const pipeline = [
  { step: '01', label: 'Requirements',   icon: FileSpreadsheet, desc: 'Define scale, features & constraints' },
  { step: '02', label: 'Analysis',        icon: Brain,           desc: 'AI normalizes & classifies needs' },
  { step: '03', label: 'Recommendations', icon: Zap,             desc: 'Rule engine scores tech stacks' },
  { step: '04', label: 'Architecture',    icon: Layers,          desc: 'HLD, LLD & full diagrams generated' },
  { step: '05', label: 'Report',          icon: Activity,        desc: 'Master architecture blueprint' },
];

const PROJECT_TYPES = [
  {
    id: 'Web App',
    label: 'Web App',
    icon: Monitor,
    desc: 'React, Vue, Angular — SPA or SSR',
    gradient: 'from-[#35D0BA]/15 to-[#36BFC7]/15',
    border: 'border-[#35D0BA]/35',
    iconColor: 'text-[#35D0BA]',
  },
  {
    id: 'Mobile App',
    label: 'Mobile App',
    icon: Smartphone,
    desc: 'React Native, Flutter, native iOS/Android',
    gradient: 'from-[#36BFC7]/15 to-[#6FA8C9]/15',
    border: 'border-[#36BFC7]/35',
    iconColor: 'text-[#36BFC7]',
  },
  {
    id: 'API Service',
    label: 'Backend / API',
    icon: Globe,
    desc: 'REST, GraphQL, gRPC microservice',
    gradient: 'from-[#6FA8C9]/15 to-slate-400/15',
    border: 'border-[#6FA8C9]/35',
    iconColor: 'text-[#6FA8C9]',
  },
  {
    id: 'Microservices',
    label: 'Microservices',
    icon: Boxes,
    desc: 'Event-driven distributed architecture',
    gradient: 'from-[#35D0BA]/15 to-emerald-500/15',
    border: 'border-[#35D0BA]/35',
    iconColor: 'text-[#35D0BA]',
  },
  {
    id: 'Monolith',
    label: 'Monolith',
    icon: Box,
    desc: 'Full-stack monolithic application',
    gradient: 'from-[#28A899]/15 to-[#35D0BA]/15',
    border: 'border-[#28A899]/35',
    iconColor: 'text-[#28A899]',
  },
  {
    id: 'Desktop App',
    label: 'Desktop App',
    icon: Server,
    desc: 'Electron, Tauri, or native desktop',
    gradient: 'from-emerald-500/15 to-[#35D0BA]/15',
    border: 'border-emerald-500/35',
    iconColor: 'text-emerald-400',
  },
];

const STATUS_STYLES = {
  'Draft':                   'bg-slate-800/60 text-slate-400 border-slate-700',
  'Requirements Collected':  'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'Analysis Complete':       'bg-[#6FA8C9]/10 text-[#6FA8C9] border-[#6FA8C9]/30',
  'Architecture Generated':  'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
};

const PRIORITY_DOT = { Low: 'bg-slate-400', Medium: 'bg-amber-400', High: 'bg-orange-400', Critical: 'bg-rose-500' };

const TypingText = ({ words }) => {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[idx];
    let timeout;
    if (!deleting && displayed.length < word.length) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80);
    } else if (!deleting && displayed.length === word.length) {
      timeout = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setIdx((i) => (i + 1) % words.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, idx, words]);

  return (
    <span className="gradient-text font-bold">
      {displayed}
      <span className="inline-block w-0.5 h-[0.9em] bg-[#35D0BA] ml-1 animate-pulse align-middle" />
    </span>
  );
};

/* ── Recent Projects strip ─────────────────────────────────────── */
const RecentProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    projectService.getProjects()
      .then((data) => setProjects((data.projects || []).slice(0, 4)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (error) {
    return (
      <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
        <p className="text-xs text-rose-300">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="h-24 rounded-lg bg-slate-900/60 border border-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 rounded-xl border border-dashed border-slate-800 bg-slate-900/30">
        <FolderOpen className="w-8 h-8 text-slate-600" />
        <p className="text-xs sm:text-sm text-slate-500">No projects yet — create one below.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {projects.map((project, i) => (
        <div
          key={project.projectId}
          onClick={() => navigate(`/projects/${project.projectId}`)}
          className="group relative p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm hover:border-[#35D0BA]/40 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer animate-fade-in-up"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          {/* Status pill */}
          <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${STATUS_STYLES[project.status] || STATUS_STYLES['Draft']}`}>
            {project.status}
          </span>

          <h4 className="text-sm font-semibold text-slate-100 mt-2 truncate">{project.projectName}</h4>

          <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#35D0BA]" />{project.applicationType || 'Web App'}
            </span>
            <span className="flex items-center gap-1 ml-auto">
              <Clock className="w-3 h-3" />{formatDate(project.createdAt)}
            </span>
          </div>

          <div className="absolute top-3 right-3 flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[project.priority] || 'bg-slate-400'}`} />
          </div>

          {/* Hover arrow */}
          <ChevronRight className="absolute bottom-3 right-3 w-3.5 h-3.5 text-slate-600 group-hover:text-[#35D0BA] transition-colors" />
        </div>
      ))}
    </div>
  );
};

/* ── New Project type selector ─────────────────────────────────── */
const NewProjectSection = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const handleStart = () => {
    if (!selected) return;
    navigate(`/create-project?type=${encodeURIComponent(selected)}`);
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-6 space-y-5">
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#35D0BA]" />
            Start a New Project
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Pick a project type to pre-fill architecture defaults</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={ArrowRight}
          onClick={handleStart}
          disabled={!selected}
          id="new-project-start-btn"
        >
          {selected ? `Create ${selected}` : 'Select a type'}
        </Button>
      </div>

      <div className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {PROJECT_TYPES.map((type, i) => {
          const Icon = type.icon;
          const isSelected = selected === type.id;
          return (
            <button
              key={type.id}
              id={`project-type-${type.id.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setSelected(isSelected ? null : type.id)}
              className={`relative group flex flex-col items-center gap-2 p-3.5 rounded-lg border text-center transition-all duration-150 animate-fade-in-up
                ${isSelected
                  ? `bg-slate-850 ${type.border} shadow-sm border-[#35D0BA]`
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:-translate-y-0.5'
                }`}
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150
                ${isSelected ? 'bg-[#35D0BA]/15 border border-[#35D0BA]/30' : 'bg-slate-800/80 border border-slate-700/60 group-hover:border-slate-600'}`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? type.iconColor : 'text-slate-400 group-hover:text-slate-300'}`} />
              </div>
              <div>
                <p className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>{type.label}</p>
                <p className={`text-[9px] mt-0.5 leading-tight ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>{type.desc}</p>
              </div>
              {isSelected && (
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#35D0BA]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ── Main Landing Page ─────────────────────────────────────────── */
const LandingPage = () => {
  return (
    <div className="space-y-16 py-4 animate-fade-in-up">

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-6">
        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.15] text-white">
          Design Software Systems<br />
          with{' '}
          <TypingText words={['Precision', 'Confidence', 'Intelligence', 'Clarity']} />
        </h1>

        <p className="text-slate-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Input your requirements, budget, and scale targets. Get AI-explained
          tech stack recommendations, HLD/LLD designs, Mermaid diagrams,
          and a complete architecture blueprint.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/create-project">
            <button className="group flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-[#0B0D0F] bg-gradient-to-r from-[#28A899] to-[#35D0BA] hover:from-[#35D0BA] hover:to-[#36BFC7] shadow-sm hover:shadow-md hover:shadow-[#35D0BA]/20 hover:-translate-y-0.5 transition-all duration-150">
              Start Building
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </Link>
          <Link to="/dashboard">
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white hover:bg-slate-900 transition-all duration-150 backdrop-blur-sm">
              View Dashboard
            </button>
          </Link>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-5 pt-3 text-xs text-slate-500">
          {['MERN Stack', 'Google Gemini AI', 'JWT Auth', 'HLD & LLD', 'Mermaid Diagrams'].map((tag) => (
            <span key={tag} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#35D0BA]" />
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── New Project section ──────────────────────────────────────────── */}
      <NewProjectSection />

      {/* ── Recent Projects ──────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#35D0BA]" />
              Recent Projects
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Your latest architecture projects</p>
          </div>
          <Link to="/projects">
            <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#35D0BA] transition-colors">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
        <RecentProjects />
      </section>

      {/* ── Pipeline Steps ──────────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="text-center space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-bold text-white">5-Step Architecture Pipeline</h2>
          <p className="text-xs sm:text-sm text-slate-500">From raw requirements to production-ready blueprints</p>
        </div>

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Connecting line */}
          <div className="hidden sm:block absolute top-7 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-slate-800 to-transparent z-0" />

          {pipeline.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className="relative z-10 flex flex-col items-center text-center gap-2.5 flex-1 animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center backdrop-blur-sm hover:border-[#35D0BA]/40 hover:-translate-y-0.5 transition-all duration-150 group">
                  <Icon className="w-5 h-5 text-[#35D0BA] transition-colors" />
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold text-slate-500 tracking-widest block">{step.step}</span>
                  <p className="text-xs font-semibold text-slate-200">{step.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 max-w-[110px]">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Capabilities Grid ──────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="text-center space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Architecture Domains Covered</h2>
          <p className="text-xs sm:text-sm text-slate-500">Comprehensive evaluation across every engineering layer</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {capabilities.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="group relative p-5 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm hover:border-slate-700 hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                {/* Gradient icon */}
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${item.color} flex items-center justify-center text-[#0B0D0F] font-bold mb-3 shadow-sm group-hover:scale-105 transition-transform duration-150`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-slate-100 mb-1">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────────────── */}
      <section>
        <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/90 p-7">
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#35D0BA]" />
                <h3 className="text-base sm:text-lg font-bold text-white">Ready to architect your system?</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md">
                Full-stack MERN application with Google Gemini AI, JWT auth, Mermaid diagrams, and detailed architecture reports.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link to="/register">
                <button className="px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-[#0B0D0F] bg-gradient-to-r from-[#28A899] to-[#35D0BA] hover:from-[#35D0BA] hover:to-[#36BFC7] shadow-sm hover:shadow-[#35D0BA]/20 hover:-translate-y-0.5 transition-all duration-150 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Get Started Free
                </button>
              </Link>
              <Link to="/technologies">
                <button className="px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white transition-all duration-150">
                  Tech Explorer
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
