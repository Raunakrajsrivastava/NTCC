import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, ShieldAlert, AlertTriangle, AlertCircle, Info,
  CheckCircle2, RefreshCw, ArrowLeft, Filter, Layers, Check, XCircle
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import { LoadingPage } from '../components/common/Loading';
import WorkflowNav from '../components/common/WorkflowNav';
import { validationService } from '../services/validationService.js';
import { projectService } from '../services/projectService.js';

const SEVERITY_COLORS = {
  CRITICAL: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  HIGH:     'bg-orange-500/10 text-orange-400 border-orange-500/30',
  MEDIUM:   'bg-amber-500/10 text-amber-400 border-amber-500/30',
  LOW:      'bg-blue-500/10 text-blue-400 border-blue-500/30',
  INFO:     'bg-slate-800 text-slate-400 border-slate-700',
};

const STATUS_BADGES = {
  FULLY_VALIDATED:     { label: 'Fully Validated', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  PASSED_WITH_WARNINGS:{ label: 'Passed with Warnings', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  ACTION_REQUIRED:     { label: 'Action Required', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  FAILED_CRITICAL:     { label: 'Critical Failures Detected', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
};

const ValidationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [activeSeverity, setActiveSeverity] = useState('ALL');

  const loadValidation = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [projData, valData] = await Promise.all([
        projectService.getProjectById(id),
        validationService.get(id),
      ]);
      setProject(projData.project);
      if (valData.validation) {
        setValidation(valData.validation);
      }
    } catch (err) {
      setError(err.message || 'Failed to load architecture validation.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadValidation();
  }, [loadValidation]);

  const handleRunValidation = async () => {
    setValidating(true);
    setError('');
    try {
      const result = await validationService.run(id);
      setValidation(result.validation);
    } catch (err) {
      setError(err.message || 'Failed to run architecture validation.');
    } finally {
      setValidating(false);
    }
  };

  if (loading) return <LoadingPage message="Running architecture validation engine…" />;

  const findings = validation?.findings || [];
  const categories = ['ALL', ...Array.from(new Set(findings.map((f) => f.category)))];

  const filteredFindings = findings.filter((f) => {
    const matchCat = activeCategory === 'ALL' || f.category === activeCategory;
    const matchSev = activeSeverity === 'ALL' || f.severity === activeSeverity;
    return matchCat && matchSev;
  });

  const summary = validation?.summary || { totalChecks: 0, passed: 0, warnings: 0, failed: 0 };
  const badgeInfo = STATUS_BADGES[validation?.validationStatus] || { label: 'Unknown', color: 'bg-slate-800 text-slate-400' };

  return (
    <div className="space-y-6 max-w-5xl py-2">
      <WorkflowNav
        projectId={id}
        projectName={project?.projectName}
        activeStage={8}
        completedStages={{ 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: Boolean(validation) }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate(`/projects/${id}`)}>
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-[#35D0BA]" />
              Architecture Validation Engine
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Deterministic verification across compatibility, consistency, security, and operational reliability
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          icon={RefreshCw}
          isLoading={validating}
          onClick={handleRunValidation}
        >
          {validating ? 'Verifying Architecture…' : 'Re-Run Validation'}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}

      {/* Summary Score Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Compliance Score</p>
          <p className="text-3xl font-black font-mono text-teal-400">{validation?.complianceScore ?? 100}%</p>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border mt-1 inline-block font-medium ${badgeInfo.color}`}>
            {badgeInfo.label}
          </span>
        </Card>

        <Card className="text-center p-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Passed Checks</p>
          <p className="text-3xl font-black font-mono text-emerald-400">{summary.passed}</p>
          <span className="text-xs text-slate-500 mt-1 block">Rules Verified</span>
        </Card>

        <Card className="text-center p-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Advisory Warnings</p>
          <p className="text-3xl font-black font-mono text-amber-400">{summary.warnings}</p>
          <span className="text-xs text-slate-500 mt-1 block">Requires Review</span>
        </Card>

        <Card className="text-center p-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Blocking Failures</p>
          <p className="text-3xl font-black font-mono text-rose-400">{summary.failed}</p>
          <span className="text-xs text-slate-500 mt-1 block">{summary.criticalCount || 0} Critical</span>
        </Card>
      </div>

      {/* Category Tabs & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Severity:
          </span>
          <select
            value={activeSeverity}
            onChange={(e) => setActiveSeverity(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 px-2 py-1 outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
            <option value="INFO">Info</option>
          </select>
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-3">
        {filteredFindings.length === 0 ? (
          <div className="text-center py-12 border border-slate-800 rounded-xl bg-slate-900/30">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <p className="text-slate-200 font-medium">No findings match the selected filters</p>
            <p className="text-xs text-slate-500 mt-1">All architecture rules in this category passed verification.</p>
          </div>
        ) : (
          filteredFindings.map((finding) => (
            <div
              key={finding.findingId}
              className={`border rounded-xl p-4 transition-all ${
                finding.status === 'FAIL'
                  ? 'bg-rose-500/5 border-rose-500/30'
                  : finding.status === 'WARN'
                  ? 'bg-amber-500/5 border-amber-500/20'
                  : 'bg-slate-900/40 border-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-300 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                    {finding.findingId}
                  </span>
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${SEVERITY_COLORS[finding.severity] || SEVERITY_COLORS.INFO}`}>
                    {finding.severity}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {finding.category}
                  </span>
                  {finding.isBlocking && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                      BLOCKING
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Component:</span>
                  <span className="text-xs font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                    {finding.affectedArtifact}
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-200 font-medium mb-1">
                {finding.description}
              </p>

              <p className="text-xs text-slate-500 mb-3 font-mono">
                Triggered Rule: {finding.triggeredRule}
              </p>

              <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800/80 text-xs">
                <p className="text-teal-300 font-semibold mb-1 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-teal-400" /> Recommended Remediation:
                </p>
                <p className="text-slate-300">{finding.remediation}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ValidationPage;
