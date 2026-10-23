import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  GitBranch, Play, Trash2, ArrowLeft, Plus, CheckCircle2,
  TrendingUp, TrendingDown, ArrowRightLeft, Layers, AlertCircle,
  Clock, DollarSign, Activity, Sparkles
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import { LoadingPage } from '../components/common/Loading';
import WorkflowNav from '../components/common/WorkflowNav';
import { scenarioService } from '../services/scenarioService.js';
import { projectService } from '../services/projectService.js';

const ScenarioPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New scenario form state
  const [scenarioName, setScenarioName] = useState('');
  const [description, setDescription] = useState('');
  const [overrides, setOverrides] = useState({
    expectedUsers: 100000,
    dailyRequests: 2000000,
    trafficLevel: 'HIGH',
    performanceReq: 'High Performance',
    availabilityReq: '99.99%',
    securityReq: 'High',
    scalabilityReq: 'Horizontal',
    budget: '$25k–$100k',
    hasRealtime: false,
    hasPayments: false,
    hasFileUploads: false,
    hasAnalytics: false,
    hasSearch: false,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [projData, scenData] = await Promise.all([
        projectService.getProjectById(id),
        scenarioService.get(id),
      ]);
      setProject(projData.project);
      setScenarios(scenData.scenarios || []);

      // Prepopulate form with baseline requirements
      const base = projData.project.requirements || {};
      setOverrides({
        expectedUsers: base.expectedUsers || 10000,
        dailyRequests: base.dailyRequests || 500000,
        trafficLevel: base.trafficLevel || 'MEDIUM',
        performanceReq: base.performanceReq || 'Standard',
        availabilityReq: base.availabilityReq || '99.9%',
        securityReq: base.securityReq || 'Standard',
        scalabilityReq: base.scalabilityReq || 'Horizontal',
        budget: base.budget || '$5k–$25k',
        hasRealtime: Boolean(base.hasRealtime),
        hasPayments: Boolean(base.hasPayments),
        hasFileUploads: Boolean(base.hasFileUploads),
        hasAnalytics: Boolean(base.hasAnalytics),
        hasSearch: Boolean(base.hasSearch),
      });
    } catch (err) {
      setError(err.message || 'Failed to load scenarios.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSimulateScenario = async (e) => {
    e.preventDefault();
    if (!scenarioName.trim()) {
      setError('Scenario name is required.');
      return;
    }

    setSimulating(true);
    setError('');
    try {
      const result = await scenarioService.create(id, {
        scenarioName: scenarioName.trim(),
        description: description.trim(),
        overrides,
      });
      setScenarios([result.scenario, ...scenarios]);
      setShowCreateModal(false);
      setScenarioName('');
      setDescription('');
    } catch (err) {
      setError(err.message || 'Failed to simulate scenario.');
    } finally {
      setSimulating(false);
    }
  };

  const handleDeleteScenario = async (scenarioId) => {
    if (!window.confirm('Are you sure you want to delete this scenario?')) return;
    try {
      await scenarioService.delete(id, scenarioId);
      setScenarios(scenarios.filter((s) => s.scenarioId !== scenarioId));
    } catch (err) {
      setError(err.message || 'Failed to delete scenario.');
    }
  };

  if (loading) return <LoadingPage message="Loading architecture simulator…" />;

  return (
    <div className="space-y-6 max-w-5xl py-2">
      <WorkflowNav
        projectId={id}
        projectName={project?.projectName}
        activeStage={3}
        completedStages={{ 1: true, 2: true, 3: true }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate(`/projects/${id}`)}>
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <GitBranch className="w-6 h-6 text-[#35D0BA]" />
              What-If Architecture Simulator
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate workload bursts, compliance shifts, and budget variations without mutating your baseline design
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setShowCreateModal(true)}
        >
          New What-If Scenario
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}

      {/* Modal / Form Drawer for New Scenario */}
      {showCreateModal && (
        <Card className="border-teal-500/30 bg-slate-900/95 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2 text-teal-300">
                  <Play className="w-4 h-4" /> Configure What-If Simulation
                </CardTitle>
                <CardDescription>
                  Modify requirements to observe deterministic technology stack changes and score deltas
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSimulateScenario} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Scenario Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10x Traffic Spike & Multi-Region SLA"
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Hypothesis / Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Testing infrastructure changes if userbase expands to 1M users"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              {/* Requirement Overrides Grid */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Requirement Variables to Test
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Expected Users</label>
                    <input
                      type="number"
                      value={overrides.expectedUsers}
                      onChange={(e) => setOverrides({ ...overrides, expectedUsers: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Daily Requests</label>
                    <input
                      type="number"
                      value={overrides.dailyRequests}
                      onChange={(e) => setOverrides({ ...overrides, dailyRequests: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Traffic Tier</label>
                    <select
                      value={overrides.trafficLevel}
                      onChange={(e) => setOverrides({ ...overrides, trafficLevel: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="VERY_HIGH">VERY_HIGH</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Latency SLA</label>
                    <select
                      value={overrides.performanceReq}
                      onChange={(e) => setOverrides({ ...overrides, performanceReq: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                    >
                      <option value="Standard">Standard (&lt; 250ms)</option>
                      <option value="High Performance">High Performance (&lt; 100ms)</option>
                      <option value="Ultra Low Latency">Ultra Low Latency (&lt; 25ms)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Availability Target</label>
                    <select
                      value={overrides.availabilityReq}
                      onChange={(e) => setOverrides({ ...overrides, availabilityReq: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                    >
                      <option value="99%">99.0%</option>
                      <option value="99.9%">99.9%</option>
                      <option value="99.99%">99.99%</option>
                      <option value="99.999%">99.999%</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Security Tier</label>
                    <select
                      value={overrides.securityReq}
                      onChange={(e) => setOverrides({ ...overrides, securityReq: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                    >
                      <option value="Standard">Standard</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical (PCI/HIPAA)</option>
                    </select>
                  </div>
                </div>

                {/* Feature toggles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overrides.hasRealtime}
                      onChange={(e) => setOverrides({ ...overrides, hasRealtime: e.target.checked })}
                      className="accent-teal-400"
                    />
                    Real-time (WebSockets)
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overrides.hasPayments}
                      onChange={(e) => setOverrides({ ...overrides, hasPayments: e.target.checked })}
                      className="accent-teal-400"
                    />
                    Payment Gateway (ACID)
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overrides.hasFileUploads}
                      onChange={(e) => setOverrides({ ...overrides, hasFileUploads: e.target.checked })}
                      className="accent-teal-400"
                    />
                    File Uploads (Object S3)
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overrides.hasAnalytics}
                      onChange={(e) => setOverrides({ ...overrides, hasAnalytics: e.target.checked })}
                      className="accent-teal-400"
                    />
                    Analytics Aggregations
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" icon={Play} isLoading={simulating} type="submit">
                  Execute Simulation
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Scenarios List */}
      <div className="space-y-4">
        {scenarios.length === 0 ? (
          <div className="text-center py-16 border border-slate-800 rounded-xl bg-slate-900/30">
            <GitBranch className="w-12 h-12 text-teal-400/40 mx-auto mb-3" />
            <h3 className="text-slate-200 font-semibold text-base">No what-if scenarios created yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Simulate what happens if traffic spikes 10x, if ultra-low latency is required, or if financial compliance mandates change your primary database.
            </p>
            <Button
              variant="outline"
              size="sm"
              icon={Plus}
              className="mt-4"
              onClick={() => setShowCreateModal(true)}
            >
              Create First Scenario
            </Button>
          </div>
        ) : (
          scenarios.map((scen) => {
            const comp = scen.comparisonToBaseline || {};
            const delta = comp.scoreDelta || 0;
            const techChanges = comp.techChanges || [];

            return (
              <Card key={scen.scenarioId} className="border-slate-800 hover:border-slate-700 transition-all">
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20 font-bold">
                        {scen.scenarioId}
                      </span>
                      <CardTitle className="text-base text-slate-100">{scen.scenarioName}</CardTitle>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
                        <span>Score: {scen.recommendations?.overallScore?.toFixed(1) || '—'}</span>
                        <span className={`flex items-center text-[11px] ${
                          delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-rose-400' : 'text-slate-400'
                        }`}>
                          {delta > 0 ? <TrendingUp className="w-3 h-3 ml-1" /> : delta < 0 ? <TrendingDown className="w-3 h-3 ml-1" /> : null}
                          {delta > 0 ? `+${delta}` : delta}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteScenario(scen.scenarioId)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors"
                        title="Delete scenario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {scen.description && (
                    <CardDescription className="text-slate-400 mt-1">{scen.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Changed Technologies */}
                  {techChanges.length > 0 ? (
                    <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800">
                      <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <ArrowRightLeft className="w-3.5 h-3.5" /> Technology Selection Shifts ({techChanges.length})
                      </p>
                      <div className="space-y-2">
                        {techChanges.map((tc, idx) => (
                          <div key={idx} className="flex flex-wrap items-center justify-between text-xs p-2 rounded bg-slate-900 border border-slate-800/80 gap-2">
                            <span className="font-semibold text-slate-300 w-24">{tc.category}:</span>
                            <div className="flex items-center gap-2 font-mono">
                              <span className="text-slate-400 line-through">{tc.baseline}</span>
                              <span className="text-slate-500">→</span>
                              <span className="text-teal-300 font-bold">{tc.simulated}</span>
                            </div>
                            <span className="text-[11px] text-slate-500">{tc.reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Baseline technology choices remained optimal under these simulated parameters.</span>
                    </div>
                  )}

                  {/* Impact narrative */}
                  {comp.impactNotes?.length > 0 && (
                    <ul className="text-xs text-slate-400 space-y-1">
                      {comp.impactNotes.map((note, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-teal-400">•</span> {note}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ScenarioPage;
