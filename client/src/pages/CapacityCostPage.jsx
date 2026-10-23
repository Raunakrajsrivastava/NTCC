import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DollarSign, Activity, HardDrive, Cpu, Database, Cloud,
  Layers, ArrowLeft, RefreshCw, AlertTriangle, CheckCircle2,
  TrendingUp, BarChart2, Server
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import { LoadingPage } from '../components/common/Loading';
import WorkflowNav from '../components/common/WorkflowNav';
import { capacityCostService } from '../services/capacityCostService.js';
import { projectService } from '../services/projectService.js';

const CapacityCostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTier, setSelectedTier] = useState('expected');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [projData, capData] = await Promise.all([
        projectService.getProjectById(id),
        capacityCostService.get(id),
      ]);
      setProject(projData.project);
      setData(capData);
    } catch (err) {
      setError(err.message || 'Failed to calculate capacity and cost estimates.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <LoadingPage message="Modeling throughput capacity and cloud run-rate…" />;

  const metrics = data?.capacity?.metrics || {};
  const formulas = data?.capacity?.formulas || {};
  const scenarios = data?.costEstimate?.scenarios || {};
  const activeScenario = scenarios[selectedTier] || scenarios.expected || {};
  const breakdown = activeScenario.breakdown || {};

  return (
    <div className="space-y-6 max-w-5xl py-2">
      <WorkflowNav
        projectId={id}
        projectName={project?.projectName}
        activeStage={5}
        completedStages={{ 1: true, 2: true, 3: true, 4: true, 5: true }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate(`/projects/${id}`)}>
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-[#35D0BA]" />
              Capacity Planning & Infrastructure Cost Engine
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Deterministic sizing derived from Little's Law, peak burst multipliers, and reference cloud benchmarks
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadData}>
          Recalculate Estimates
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}

      {/* Key Capacity Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase mb-1">
            <Activity className="w-3.5 h-3.5 text-teal-400" /> Average QPS
          </div>
          <p className="text-2xl font-black font-mono text-slate-100">{metrics.avgQPS || 0}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{metrics.dailyRequests?.toLocaleString()} req/day</p>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> Peak Throughput
          </div>
          <p className="text-2xl font-black font-mono text-amber-400">{metrics.peakQPS || 0}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{metrics.peakMultiplier}x burst multiplier</p>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase mb-1">
            <Cpu className="w-3.5 h-3.5 text-teal-400" /> Concurrent Conns
          </div>
          <p className="text-2xl font-black font-mono text-slate-100">{metrics.concurrentInFlightRequests || 0}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Little's Law (L = λ × W)</p>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase mb-1">
            <Server className="w-3.5 h-3.5 text-emerald-400" /> Compute Instances
          </div>
          <p className="text-2xl font-black font-mono text-emerald-400">{metrics.recommendedComputeInstances || 2}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">High availability minimum</p>
        </Card>
      </div>

      {/* Sizing & Resource Footprint */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <HardDrive className="w-4 h-4 text-teal-400" /> Monthly Storage Growth
          </p>
          <p className="text-2xl font-mono font-bold text-slate-200">
            ~{metrics.monthlyStorageGrowthGB || 0} GB <span className="text-xs font-normal text-slate-500">/ mo</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Combines structured DB records with uploaded media assets and logs.
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Database className="w-4 h-4 text-amber-400" /> In-Memory Cache Sizing
          </p>
          <p className="text-2xl font-mono font-bold text-amber-300">
            {metrics.recommendedCacheRAM_GB || 2} GB <span className="text-xs font-normal text-slate-500">Redis RAM</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Sized to retain the 20% hot-data working set in memory.
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Cloud className="w-4 h-4 text-blue-400" /> Network Egress Bandwidth
          </p>
          <p className="text-2xl font-mono font-bold text-blue-300">
            ~{metrics.monthlyDataTransferGB || 0} GB <span className="text-xs font-normal text-slate-500">/ mo</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Outbound data transfer across APIs, web pages, and CDN caches.
          </p>
        </Card>
      </div>

      {/* Cost Estimator Workspace */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#35D0BA]" /> Projected Cloud Run-Rate (USD)
              </CardTitle>
              <CardDescription>
                Reference estimates based on 2026 AWS and managed cloud pricing models
              </CardDescription>
            </div>

            {/* Tier Switcher */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {['low', 'expected', 'high'].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`px-3 py-1 rounded text-xs font-medium capitalize transition-colors ${
                    selectedTier === tier
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Monthly & Annual Total Banner */}
          <div className="p-4 rounded-xl bg-teal-500/5 border border-teal-500/20 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider block">
                {activeScenario.tier || 'Expected Scenario'}
              </span>
              <p className="text-3xl font-black font-mono text-slate-100 mt-1">
                ${activeScenario.monthlyTotal?.toLocaleString()}{' '}
                <span className="text-xs font-normal text-slate-400">/ month</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Annualized Run-Rate</span>
              <p className="text-xl font-bold font-mono text-teal-400">
                ${activeScenario.annualTotal?.toLocaleString()} / yr
              </p>
            </div>
          </div>

          {/* Component Breakdown Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3 font-semibold">Infrastructure Component</th>
                  <th className="p-3 font-semibold text-right">Est. Monthly Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {Object.entries(breakdown).map(([key, item]) => (
                  <tr key={key} className="hover:bg-slate-900/40">
                    <td className="p-3 font-medium text-slate-200">{item.label}</td>
                    <td className="p-3 text-right font-mono font-bold text-teal-400">${item.cost} / mo</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Bottlenecks & Formula Documentation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-4 bg-slate-900/60">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Mathematical Sizing Formulas
          </p>
          <ul className="text-xs font-mono text-slate-400 space-y-1.5">
            {Object.entries(formulas).map(([k, f]) => (
              <li key={k} className="p-1.5 rounded bg-slate-950/70 border border-slate-800">
                <span className="text-teal-400">{k}:</span> {f}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4 bg-slate-900/60">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> High-Load Bottleneck Watchlist
          </p>
          <ul className="text-xs text-slate-400 space-y-2">
            {(data?.capacity?.bottleneckWatchlist || []).map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-400">•</span> {b}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default CapacityCostPage;
