import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, ChevronRight,
  ClipboardList, Cpu, GitCompare, Brain, Layers, Code, Network, FileSpreadsheet,
  ShieldCheck, GitBranch, DollarSign, FileText
} from 'lucide-react';

const STAGES = [
  { id: 1, name: 'Requirements', path: 'requirements', icon: ClipboardList },
  { id: 2, name: 'Recommendations', path: 'recommendations', icon: Cpu },
  { id: 3, name: 'Comparison', path: 'compare', icon: GitCompare },
  { id: 4, name: 'AI Explainer', path: 'explain', icon: Brain },
  { id: 5, name: 'HLD', path: 'hld', icon: Layers },
  { id: 6, name: 'LLD', path: 'lld', icon: Code },
  { id: 7, name: 'Diagrams', path: 'diagrams', icon: Network },
  { id: 8, name: 'Final Report', path: 'report', icon: FileSpreadsheet },
];

const DECISION_TOOLS = [
  { name: 'Validation', path: 'validate', icon: ShieldCheck },
  { name: 'What-If Simulator', path: 'scenarios', icon: GitBranch },
  { name: 'Capacity & Cost', path: 'capacity-cost', icon: DollarSign },
  { name: 'Traceability & ADRs', path: 'traceability', icon: FileText },
];

/**
 * WorkflowNav
 * Professional engineering workstation stepper for the 8-stage architecture pipeline
 * with integrated access to dedicated decision engines.
 */
const WorkflowNav = ({ projectId, projectName, activeStage, completedStages = {} }) => {
  const location = useLocation();

  const isStageDone = (stageId, stagePath) => {
    if (completedStages[stagePath] !== undefined) return Boolean(completedStages[stagePath]);
    if (completedStages[stageId] !== undefined) return Boolean(completedStages[stageId]);
    return stageId < activeStage;
  };

  const completedCount = STAGES.filter((s) => isStageDone(s.id, s.path)).length;
  const progressPct = Math.round((completedCount / 8) * 100);

  return (
    <div className="w-full bg-slate-900/90 dark:bg-slate-950/80 border border-slate-800 rounded-xl p-3 mb-6 backdrop-blur-md shadow-sm print:hidden space-y-2.5">
      {/* Top Bar: Breadcrumb + Progress */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            to={`/projects/${projectId}`}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors py-1 px-2 rounded-lg hover:bg-slate-800/50"
            title="Back to Project Overview"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Overview</span>
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-xs font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-xs">
            {projectName || 'Architecture Project'}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#35D0BA]/10 text-[#35D0BA] border border-[#35D0BA]/20">
            Pipeline Active
          </span>
        </div>

        {/* Progress pill */}
        <div className="flex items-center gap-2.5">
          <div className="w-24 sm:w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#28A899] to-[#35D0BA] transition-all duration-500 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {completedCount}/8 Done
          </span>
        </div>
      </div>

      {/* Stage Stepper Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {STAGES.map((s, idx) => {
          const isActive = activeStage === s.id || location.pathname.endsWith(`/${s.path}`);
          const isDone = isStageDone(s.id, s.path);

          return (
            <React.Fragment key={s.id}>
              <Link
                to={`/projects/${projectId}/${s.path}`}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap shrink-0 border ${
                  isActive
                    ? 'bg-[#35D0BA]/15 text-[#35D0BA] border-[#35D0BA]/40 font-semibold shadow-sm'
                    : isDone
                    ? 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-slate-100'
                    : 'bg-slate-900/30 text-slate-500 border-slate-800/60 hover:text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                  isActive
                    ? 'bg-[#35D0BA] text-[#0B0D0F]'
                    : isDone
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  {isDone ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : s.id}
                </span>
                <span>{s.name}</span>
              </Link>

              {idx < STAGES.length - 1 && (
                <ChevronRight className="w-3 h-3 text-slate-700 shrink-0 hidden md:block" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Dedicated Decision Engines Quick Links */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60 overflow-x-auto text-xs">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider shrink-0">
          Decision Engines:
        </span>
        {DECISION_TOOLS.map((tool) => {
          const isCurrent = location.pathname.endsWith(`/${tool.path}`);
          const Icon = tool.icon;

          return (
            <Link
              key={tool.path}
              to={`/projects/${projectId}/${tool.path}`}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 ${
                isCurrent
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{tool.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowNav;
