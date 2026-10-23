import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet, ArrowLeft, RefreshCw, Printer, AlertCircle,
  ChevronRight, Save, CheckCircle2, Info, Shield, Zap, TrendingUp,
  AlertTriangle, Lightbulb, Database, Server, Globe, HardDrive,
  DollarSign, Star, Activity, Lock, Cpu, BarChart2, BookOpen,
  Layers, GitBranch, Network, Target, Package, Download
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import MermaidViewer from '../components/common/MermaidViewer';
import { LoadingPage } from '../components/common/Loading';
import WorkflowNav from '../components/common/WorkflowNav';
import { reportService } from '../services/reportService.js';
import { projectService } from '../services/projectService.js';

// ─── Toast Notification ──────────────────────────────────────────────────────
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-medium animate-fade-in transition-all duration-300 ${
      type === 'success'
        ? 'bg-emerald-900/90 border-emerald-500/40 text-emerald-200 shadow-emerald-900/40'
        : 'bg-rose-900/90 border-rose-500/40 text-rose-200 shadow-rose-900/40'
    }`}>
      {type === 'success'
        ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
      {message}
    </div>
  );
};

// ─── Reusable Sub-Components ─────────────────────────────────────────────────
const InfoGrid = ({ items }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {items.map(({ label, value, accent }) => (
      <div key={label} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
        <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-0.5">{label}</span>
        <span className={`text-sm font-semibold ${accent || 'text-slate-200'}`}>{value ?? '—'}</span>
      </div>
    ))}
  </div>
);

const FeatureBadge = ({ label, active }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
    active
      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
      : 'bg-slate-800/60 text-slate-500 border-slate-700/40'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-400' : 'bg-slate-600'}`} />
    {label}
  </span>
);

const ScoreBar = ({ score, max = 100, color = 'teal' }) => {
  const pct = Math.min(100, Math.round((Number(score) / max) * 100));
  const colorMap = { indigo: 'bg-[#35D0BA]', teal: 'bg-[#35D0BA]', emerald: 'bg-emerald-500', amber: 'bg-amber-500' };
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${colorMap[color] || colorMap.teal}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono text-slate-300 w-10 text-right">{score}</span>
    </div>
  );
};

const MethodBadge = ({ method }) => {
  const colors = {
    GET: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    POST: 'bg-[#35D0BA]/15 text-[#35D0BA] border-[#35D0BA]/30',
    PUT: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    PATCH: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    DELETE: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${colors[method] || colors.GET}`}>
      {method}
    </span>
  );
};

const AccessBadge = ({ access }) => (
  <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
    access === 'Public'
      ? 'bg-slate-700/40 text-slate-400 border-slate-700'
      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  }`}>
    {access}
  </span>
);

const BulletList = ({ items, icon: Icon, color = 'teal' }) => {
  if (!items?.length) return <p className="text-slate-500 text-xs">No items available.</p>;
  const colorMap = { indigo: 'text-[#35D0BA]', teal: 'text-[#35D0BA]', emerald: 'text-emerald-400', amber: 'text-amber-400', rose: 'text-rose-400' };
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
          {Icon
            ? <Icon className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${colorMap[color]}`} />
            : <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${colorMap[color].replace('text-', 'bg-')}`} />}
          <span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>
        </li>
      ))}
    </ul>
  );
};

const SectionDivider = ({ title }) => (
  <div className="flex items-center gap-3 my-4">
    <div className="flex-1 h-px bg-slate-800" />
    <span className="text-[10px] uppercase tracking-wider text-slate-600 font-semibold">{title}</span>
    <div className="flex-1 h-px bg-slate-800" />
  </div>
);

// ─── Section-Specific Renderers ──────────────────────────────────────────────
const renderers = {
  // Section 1 — Project Overview
  1: ({ content: c }) => !c ? null : (
    <div className="space-y-4">
      <InfoGrid items={[
        { label: 'Project Name', value: c.projectName, accent: 'text-[#35D0BA]' },
        { label: 'Application Type', value: c.applicationType, accent: 'text-sky-300' },
        { label: 'Priority', value: c.priority },
        { label: 'Status', value: c.status },
      ]} />
      {c.description && (
        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">Description</span>
          <p className="text-sm text-slate-300 leading-relaxed">{c.description}</p>
        </div>
      )}
    </div>
  ),

  // Section 2 — Raw Requirements
  2: ({ content: c }) => !c ? null : (
    <div className="space-y-4">
      <InfoGrid items={[
        { label: 'Application Type', value: c.applicationType },
        { label: 'Target Users', value: c.targetUsers },
        { label: 'Expected Users', value: c.expectedUsers?.toLocaleString?.() ?? c.expectedUsers },
        { label: 'Daily Requests', value: c.dailyRequests?.toLocaleString?.() ?? c.dailyRequests },
        { label: 'Geographic Scope', value: c.geographicScope },
      ]} />
      {c.features && (
        <>
          <SectionDivider title="Feature Requirements" />
          <div className="flex flex-wrap gap-2">
            {Object.entries(c.features).map(([key, active]) => (
              <FeatureBadge key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())} active={active} />
            ))}
          </div>
        </>
      )}
    </div>
  ),

  // Section 3 — Normalized Requirements
  3: ({ content: c }) => !c ? <p className="text-slate-500 text-xs">No normalization data.</p> : (
    <div className="space-y-3">
      <InfoGrid items={
        Object.entries(c)
          .filter(([k]) => !k.startsWith('_') && typeof c[k] !== 'object')
          .map(([k, v]) => ({
            label: k.replace(/([A-Z])/g, ' $1').trim(),
            value: typeof v === 'boolean' ? (v ? '✓ Yes' : '✗ No') : String(v ?? '—'),
            accent: typeof v === 'boolean' ? (v ? 'text-emerald-300' : 'text-rose-300') : undefined,
          }))
      } />
    </div>
  ),

  // Section 4 — Recommended Tech Stack
  4: ({ content: c }) => {
    if (!Array.isArray(c) || !c.length) return <p className="text-slate-500 text-xs">No recommendations available.</p>;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {c.map((item) => (
          <div key={item.category} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl hover:border-[#35D0BA]/40 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-slate-500">{item.category}</span>
              <span className="text-[11px] font-mono text-[#35D0BA] bg-[#35D0BA]/10 px-2 py-0.5 rounded border border-[#35D0BA]/20">
                Score: {item.score}
              </span>
            </div>
            <p className="text-base font-bold text-slate-100 mb-1">{item.recommended || '—'}</p>
            {item.description && <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>}
          </div>
        ))}
      </div>
    );
  },

  // Section 5 — Scores & Weights
  5: ({ content: c }) => !c ? null : (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-xl bg-[#35D0BA]/10 border border-[#35D0BA]/30 flex flex-col items-center justify-center shrink-0">
          <span className="text-3xl font-black text-[#35D0BA]">{Math.round(Number(c.overallScore) || 0)}</span>
          <span className="text-[9px] uppercase text-slate-400 tracking-wider">Score</span>
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-400">Overall Architecture Score — composite weighted average across all technology category evaluations.</p>
        </div>
      </div>
      {c.appliedWeights && Object.keys(c.appliedWeights).length > 0 && (
        <>
          <SectionDivider title="Applied Scoring Weights" />
          <div className="space-y-2">
            {Object.entries(c.appliedWeights).map(([key, val]) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="text-slate-300 font-mono">{(Number(val) * 100).toFixed(0)}%</span>
                </div>
                <ScoreBar score={(Number(val) * 100).toFixed(1)} max={100} color="teal" />
              </div>
            ))}
          </div>
        </>
      )}
      {c.engineReasons?.length > 0 && (
        <>
          <SectionDivider title="Engine Decision Reasons" />
          <BulletList items={c.engineReasons} color="emerald" />
        </>
      )}
    </div>
  ),

  // Section 6 — AI Explanation
  6: ({ content: c }) => !c ? null : (
    <div className="space-y-4">
      {c.isFallback && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2 text-xs text-amber-300">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          Offline explanation — AI service was unavailable at report generation time.
        </div>
      )}
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-wider text-slate-500">Architecture Summary</p>
        <p className="text-sm text-slate-300 leading-relaxed">{c.summary || c.architectureSummary || 'Not available.'}</p>
      </div>
      {(c.technologyExplanation) && (
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Technology Selection Rationale</p>
          <p className="text-sm text-slate-300 leading-relaxed">{c.technologyExplanation}</p>
        </div>
      )}
    </div>
  ),

  // Section 7 — Alternatives
  7: ({ content: c }) => {
    if (!Array.isArray(c) || !c.length) return <p className="text-slate-500 text-xs">No alternatives data.</p>;
    return (
      <div className="space-y-3">
        {c.map((item) => (
          <div key={item.category} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300">{item.category}</span>
              <span className="text-xs text-[#35D0BA] font-medium">Recommended: {item.recommended || '—'}</span>
            </div>
            {item.alternatives?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {item.alternatives.map((alt, i) => (
                  <div key={i} className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs">
                    <span className="text-slate-300">{alt.name}</span>
                    <span className="text-slate-600 ml-2">Score: {alt.score}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  },

  // Section 8 — HLD
  8: ({ content: c }) => !c ? <p className="text-slate-500 text-xs">HLD not generated.</p> : (
    <div className="space-y-4">
      {c.overview && (
        <InfoGrid items={[
          { label: 'Architectural Pattern', value: c.overview.architecturalPattern, accent: 'text-[#35D0BA]' },
          { label: 'Target Scale', value: c.overview.targetScale },
        ]} />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { key: 'clientTier', label: 'Client Tier', icon: Globe, color: 'text-[#35D0BA]' },
          { key: 'frontendTier', label: 'Frontend Tier', icon: Zap, color: 'text-emerald-400' },
          { key: 'backendTier', label: 'Backend Tier', icon: Server, color: 'text-sky-400' },
          { key: 'databaseLayer', label: 'Database Layer', icon: Database, color: 'text-[#6FA8C9]' },
          { key: 'cachingLayer', label: 'Caching Layer', icon: Activity, color: 'text-amber-400' },
          { key: 'deploymentArchitecture', label: 'Deployment', icon: HardDrive, color: 'text-rose-400' },
        ].map(({ key, label, icon: Icon, color }) => c[key] && (
          <div key={key} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
            <div className={`flex items-center gap-2 mb-2 text-xs font-semibold ${color}`}>
              <Icon className="w-3.5 h-3.5" /> {label}
            </div>
            <div className="space-y-1">
              {Object.entries(c[key])
                .filter(([, v]) => typeof v === 'string')
                .map(([k, v]) => (
                  <p key={k} className="text-xs text-slate-400">
                    <span className="text-slate-500">{k.replace(/([A-Z])/g, ' $1').trim()}: </span>
                    <span className="text-slate-300">{v}</span>
                  </p>
                ))}
              {Object.entries(c[key])
                .filter(([, v]) => Array.isArray(v))
                .map(([k, v]) => (
                  <div key={k}>
                    <span className="text-[10px] text-slate-500">{k.replace(/([A-Z])/g, ' $1').trim()}: </span>
                    <span className="text-xs text-slate-300">{v.join(', ')}</span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  ),

  // Section 9 — LLD
  9: ({ content: c }) => !c ? <p className="text-slate-500 text-xs">LLD not generated.</p> : (
    <div className="space-y-4">
      {c.controllerInterfaces?.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Controller Interfaces</p>
          {c.controllerInterfaces.map((ctrl) => (
            <div key={ctrl.name} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-start gap-3">
              <Cpu className="w-4 h-4 text-[#35D0BA] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-200">{ctrl.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{ctrl.duties}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  ),

  // Sections 10–13 — Diagrams (handled by MermaidViewer in main render)
  10: null, 11: null, 12: null, 13: null,

  // Section 14 — Database Design
  14: ({ content: c }) => !c ? null : (
    <div className="space-y-4">
      <InfoGrid items={[{ label: 'Primary Database', value: c.primaryDatabase, accent: 'text-[#35D0BA]' }]} />
      {c.entities?.length > 0 && (
        <>
          <SectionDivider title="Entities" />
          <div className="space-y-4">
            {c.entities.map((entity) => (
              <div key={entity.name} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Database className="w-4 h-4 text-[#35D0BA]" />
                  <span className="text-sm font-semibold text-slate-200">{entity.name}</span>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{entity.tableName}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-slate-500 border-b border-slate-800">
                        <th className="pb-2 pr-4 font-medium">Field</th>
                        <th className="pb-2 pr-4 font-medium">Type</th>
                        <th className="pb-2 font-medium">Constraint</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {entity.attributes?.map((attr) => (
                        <tr key={attr.field}>
                          <td className="py-1.5 pr-4 font-mono text-[#35D0BA]">{attr.field}</td>
                          <td className="py-1.5 pr-4 text-amber-300">{attr.type}</td>
                          <td className="py-1.5 text-slate-400">{attr.constraint}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {c.relationships?.length > 0 && (
        <>
          <SectionDivider title="Relationships" />
          <div className="space-y-2">
            {c.relationships.map((rel, i) => (
              <div key={i} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-start gap-3">
                <GitBranch className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-slate-200">
                    {rel.source} → {rel.target}
                    <span className="ml-2 text-[10px] text-slate-500 font-mono">{rel.relationship}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{rel.description}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  ),

  // Section 15 — API Design
  15: ({ content: c }) => {
    if (!Array.isArray(c) || !c.length) return <p className="text-slate-500 text-xs">No API endpoints defined.</p>;
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-800">
              <th className="pb-3 pr-4 font-medium">Method</th>
              <th className="pb-3 pr-4 font-medium">Path</th>
              <th className="pb-3 pr-4 font-medium">Description</th>
              <th className="pb-3 font-medium">Access</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {c.map((ep, i) => (
              <tr key={i} className="hover:bg-slate-900/40 transition-colors">
                <td className="py-2 pr-4"><MethodBadge method={ep.method} /></td>
                <td className="py-2 pr-4 font-mono text-slate-300">{ep.path}</td>
                <td className="py-2 pr-4 text-slate-400">{ep.description}</td>
                <td className="py-2"><AccessBadge access={ep.access} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },

  // Section 16 — Authentication
  16: ({ content: c }) => !c ? null : (
    <div className="space-y-4">
      <div className="p-4 bg-[#35D0BA]/10 border border-[#35D0BA]/20 rounded-xl flex items-start gap-3">
        <Lock className="w-4 h-4 text-[#35D0BA] shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-[#35D0BA] mb-0.5">Authentication Strategy</p>
          <p className="text-xs text-slate-300">{c.strategy}</p>
        </div>
      </div>
      {c.flow?.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Authentication Flow</p>
          <div className="space-y-2">
            {c.flow.map((step, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                <span className="w-5 h-5 rounded-full bg-[#35D0BA]/20 border border-[#35D0BA]/30 text-[#35D0BA] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{step.replace(/^\d+\.\s*/, '')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  ),

  // Section 17 — Security
  17: ({ content: c }) => !c ? null : (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Shield className="w-5 h-5 text-emerald-400" />
        <div>
          <p className="text-xs text-slate-400">Security Level</p>
          <p className="text-base font-bold text-emerald-300">{c.securityLevel}</p>
        </div>
      </div>
      {c.measures?.length > 0 && (
        <>
          <SectionDivider title="Security Measures" />
          <ul className="space-y-2">
            {c.measures.map((m, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-300">{m}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  ),

  // Section 18 — Scalability
  18: ({ content: c }) => !c ? null : (
    <div className="space-y-4">
      <InfoGrid items={[
        { label: 'Traffic Level', value: c.trafficLevel, accent: 'text-sky-300' },
        { label: 'Scalability Required', value: c.scalabilityRequired ? '✓ Yes' : '✗ No', accent: c.scalabilityRequired ? 'text-emerald-300' : 'text-slate-400' },
        { label: 'Caching Strategy', value: c.cachingStrategy },
        { label: 'CDN Strategy', value: c.cdnStrategy },
      ]} />
    </div>
  ),

  // Section 19 — Deployment
  19: ({ content: c }) => !c || !Object.keys(c).length ? <p className="text-slate-500 text-xs">Deployment data unavailable.</p> : (
    <div className="space-y-4">
      <InfoGrid items={
        Object.entries(c)
          .filter(([, v]) => typeof v === 'string')
          .map(([k, v]) => ({ label: k.replace(/([A-Z])/g, ' $1').trim(), value: v }))
      } />
      {Object.entries(c).filter(([, v]) => Array.isArray(v)).map(([k, v]) => (
        <div key={k}>
          <SectionDivider title={k.replace(/([A-Z])/g, ' $1').trim()} />
          <BulletList items={v} icon={Package} color="teal" />
        </div>
      ))}
    </div>
  ),

  // Section 20 — Cost
  20: ({ content: c }) => !c ? null : (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <DollarSign className="w-8 h-8" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Budget Tier</p>
          <p className="text-lg font-bold text-emerald-300">{c.budgetTier}</p>
          <p className="text-sm text-slate-300">{c.estimatedMonthlyCloudCost}</p>
        </div>
      </div>
      {c.costSavingTips?.length > 0 && (
        <>
          <SectionDivider title="Cost Saving Tips" />
          <BulletList items={c.costSavingTips} icon={Lightbulb} color="amber" />
        </>
      )}
    </div>
  ),

  // Section 21 — Advantages
  21: ({ content: c }) => (
    <BulletList items={Array.isArray(c) ? c : []} icon={CheckCircle2} color="emerald" />
  ),

  // Section 22 — Limitations
  22: ({ content: c }) => (
    <BulletList items={Array.isArray(c) ? c : []} icon={AlertTriangle} color="amber" />
  ),

  // Section 23 — Future Improvements
  23: ({ content: c }) => (
    <BulletList items={Array.isArray(c) ? c : []} icon={Lightbulb} color="teal" />
  ),
};

// ─── Section Sidebar Nav ─────────────────────────────────────────────────────
const SECTION_ICONS = {
  1: Target, 2: BookOpen, 3: BarChart2, 4: Package, 5: Star,
  6: Cpu, 7: GitBranch, 8: Layers, 9: Network,
  10: Activity, 11: Activity, 12: Database, 13: Activity,
  14: Database, 15: Globe, 16: Lock, 17: Shield,
  18: TrendingUp, 19: HardDrive, 20: DollarSign,
  21: CheckCircle2, 22: AlertTriangle, 23: Lightbulb,
};

const DIAGRAM_SECTION_IDS = new Set([10, 11, 12, 13]);

// ─── Main Component ──────────────────────────────────────────────────────────
const ReportViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef(null);

  const [projectName, setProjectName] = useState('');
  const [report, setReport] = useState(null);
  const [activeSection, setActiveSection] = useState(1);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [projRes, repRes] = await Promise.all([
        projectService.getProjectById(id),
        reportService.get(id),
      ]);
      setProjectName(projRes.project.projectName);
      if (repRes.report) setReport(repRes.report);
    } catch (err) {
      setError(err.message || 'Failed to load report data.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleGenerate = async () => {
    if (report && !window.confirm('Regenerate will overwrite the existing report. Continue?')) return;
    setGenerating(true);
    setError('');
    try {
      const res = await reportService.generate(id);
      setReport(res.report);
      setActiveSection(1);
      showToast('Architecture report generated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to generate report.');
      showToast(err.message || 'Generation failed.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!report) return;
    setSaving(true);
    try {
      await reportService.save(id, report);
      showToast('Report saved successfully!');
    } catch (err) {
      showToast(err.message || 'Failed to save report.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => window.print();

  const handleExportMarkdown = async () => {
    try {
      const response = await reportService.exportMarkdown(id);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/markdown' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${projectName.replace(/[^a-zA-Z0-9_-]/g, '_')}_architecture_report.md`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('Markdown specification downloaded!');
    } catch (err) {
      showToast(err.message || 'Failed to export markdown.', 'error');
    }
  };

  const handleExportJson = async () => {
    try {
      const response = await reportService.exportJson(id);
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${projectName.replace(/[^a-zA-Z0-9_-]/g, '_')}_architecture_spec.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('JSON architecture specification downloaded!');
    } catch (err) {
      showToast(err.message || 'Failed to export JSON.', 'error');
    }
  };

  if (loading) return <LoadingPage message="Loading complete architecture report…" />;

  const sections = report?.sections ? Object.values(report.sections) : [];

  return (
    <>
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="space-y-6 max-w-7xl" ref={printRef}>
        {/* ── Print-only Cover Page ── */}
        <div className="hidden print:block print:mb-8 print:pb-8 print:border-b print:border-gray-300">
          <h1 className="text-3xl font-black text-black mb-2">Software Architecture Report</h1>
          <p className="text-xl text-gray-700 font-semibold mb-1">{projectName}</p>
          <p className="text-sm text-gray-500">Generated: {report?.meta?.generatedAt ? new Date(report.meta.generatedAt).toLocaleString() : new Date().toLocaleString()}</p>
          <p className="text-sm text-gray-500">Total Sections: {report?.meta?.totalSections || 23}</p>
          <p className="text-sm text-gray-500 mt-4">AI-Powered Software Architecture Advisor — NTCC Project</p>
        </div>

        {/* ── Screen Header ── */}
        <WorkflowNav
          projectId={id}
          projectName={projectName}
          activeStage={8}
          completedStages={{ 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: Boolean(report) }}
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate(`/projects/${id}`)}>Back</Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                <FileSpreadsheet className="w-6 h-6 text-[#35D0BA]" />
                Final Architecture Report
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">{projectName} — 23 Sections</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {report && (
              <>
                <Button variant="ghost" size="sm" icon={Save} isLoading={saving} onClick={handleSave}>
                  Save Report
                </Button>
                <Button variant="outline" size="sm" icon={Download} onClick={handleExportMarkdown}>
                  Export MD
                </Button>
                <Button variant="outline" size="sm" icon={Download} onClick={handleExportJson}>
                  Export JSON
                </Button>
                <Button variant="outline" size="sm" icon={Printer} onClick={handlePrint}>
                  Export PDF
                </Button>
              </>
            )}
            <Button variant="primary" size="sm" icon={RefreshCw} isLoading={generating} onClick={handleGenerate}>
              {generating ? 'Generating…' : report ? 'Regenerate' : 'Generate Report'}
            </Button>
          </div>
        </div>

        {/* ── Report Meta Banner ── */}
        {report?.meta && (
          <div className="flex items-center justify-between p-3 bg-[#35D0BA]/5 border border-[#35D0BA]/15 rounded-xl text-xs text-slate-400 print:hidden">
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-[#35D0BA]" />
              <span>Complete 23-section architecture document</span>
            </div>
            <span>Generated: {report.meta.generatedAt ? new Date(report.meta.generatedAt).toLocaleString() : '—'}</span>
          </div>
        )}

        {/* ── Error Banner ── */}
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 print:hidden">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-300">{error}</p>
          </div>
        )}

        {/* ── Empty State ── */}
        {!report && !error && (
          <div className="flex flex-col items-center justify-center py-20 space-y-5 text-center print:hidden">
            <div className="w-20 h-20 rounded-2xl bg-[#35D0BA]/10 border border-[#35D0BA]/20 flex items-center justify-center text-[#35D0BA]">
              <FileSpreadsheet className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-slate-200 font-semibold text-lg">No Report Generated Yet</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                Synthesize all 23 sections — requirements, scoring, AI explanation, HLD, LLD,
                diagrams, database design, API specs, security, deployment, and cost estimates
                into one complete master architecture document.
              </p>
            </div>
            <Button variant="primary" icon={FileSpreadsheet} onClick={handleGenerate} isLoading={generating}>
              Generate Complete Architecture Report
            </Button>
          </div>
        )}

        {/* ── Report Viewer ── */}
        {report && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Section Navigation */}
            <div className="lg:col-span-1 print:hidden">
              <div className="sticky top-4 space-y-1 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
                <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-3 mb-2">
                  Sections ({sections.length})
                </p>
                {sections.map((sec) => {
                  const Icon = SECTION_ICONS[sec.id] || BookOpen;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => setActiveSection(sec.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2.5 ${
                        activeSection === sec.id
                          ? 'bg-[#35D0BA]/15 text-[#35D0BA] border border-[#35D0BA]/30 font-semibold'
                          : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300 border border-transparent'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{sec.title}</span>
                      {activeSection === sec.id && <ChevronRight className="w-3 h-3 ml-auto shrink-0 text-[#35D0BA]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Report Content Area */}
            <div className="lg:col-span-3 space-y-6 print:w-full print:col-span-4">
              {sections.map((sec) => {
                const isVisible = activeSection === sec.id;
                const Renderer = renderers[sec.id];
                const isDiagram = DIAGRAM_SECTION_IDS.has(sec.id);

                return (
                  <div
                    key={sec.id}
                    className={`${isVisible ? 'block' : 'hidden print:block'} space-y-4 print:page-break-inside-avoid print:mb-8`}
                  >
                    {/* Section Header */}
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-800 print:border-gray-300">
                      {SECTION_ICONS[sec.id] && (() => {
                        const Icon = SECTION_ICONS[sec.id];
                        return <Icon className="w-5 h-5 text-[#35D0BA] print:hidden" />;
                      })()}
                      <h2 className="text-lg font-bold text-slate-100 print:text-black">{sec.title}</h2>
                    </div>

                    {/* Section Body */}
                    <Card className="print:border-none print:shadow-none print:p-0 print:bg-white">
                      <CardContent className="text-xs text-slate-300 print:text-black">
                        {isDiagram ? (
                          sec.content?.mermaidCode
                            ? <MermaidViewer chartCode={sec.content.mermaidCode} id={`rep_${sec.id}`} title={sec.title} />
                            : <p className="text-slate-500">Diagram unavailable — run the Diagrams module first.</p>
                        ) : Renderer ? (
                          <Renderer content={sec.content} />
                        ) : (
                          // Fallback: pretty JSON for unexpected sections
                          <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-slate-300 overflow-x-auto">
                            {JSON.stringify(sec.content, null, 2)}
                          </pre>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ReportViewPage;
