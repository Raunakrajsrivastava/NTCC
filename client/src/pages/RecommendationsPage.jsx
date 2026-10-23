import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Sparkles, AlertCircle, ArrowLeft, RefreshCw, CheckCircle2,
  ChevronDown, ChevronRight, Star, Shield, Zap, DollarSign,
  BarChart3, TrendingUp, Layers, Info, ThumbsUp, ThumbsDown,
  ArrowRightLeft, Sliders, RotateCcw, AlertTriangle, Check
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import { LoadingPage } from '../components/common/Loading';
import WorkflowNav from '../components/common/WorkflowNav';
import { recommendationService } from '../services/recommendationService.js';
import { projectService } from '../services/projectService.js';

// ── Score bar ─────────────────────────────────────────────────────────────
const ScoreBar = ({ value, max = 10, color = 'teal' }) => {
  const pct = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  const colors = {
    teal: 'from-[#28A899] to-[#35D0BA]',
    emerald: 'from-emerald-500 to-teal-400',
    amber: 'from-amber-500 to-orange-400',
    rose: 'from-rose-500 to-pink-500',
  };
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${colors[color] || colors.teal} rounded-full transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-slate-400 w-10 text-right">{value}/10</span>
    </div>
  );
};

// ── Category icon map ──────────────────────────────────────────────────────
const CAT_ICONS = {
  Frontend: '🖥️', Backend: '⚙️', Database: '🗄️', Cache: '⚡',
  Cloud: '☁️', DevOps: '🐳', Storage: '📦', Authentication: '🔐',
  Messaging: '📨', Monitoring: '📊',
};

// ── Tech card with transparent criterion breakdown ─────────────────────────
const TechCard = ({ tech, isTop = false, rank = 1 }) => {
  const [expanded, setExpanded] = useState(isTop);
  if (!tech) return null;

  const isDisqualified = !!tech.isDisqualified;

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-150 ${
        isDisqualified
          ? 'bg-rose-500/5 border-rose-500/30 opacity-75'
          : isTop
          ? 'bg-[#35D0BA]/5 border-[#35D0BA]/30 shadow-sm'
          : 'bg-slate-900/50 border-slate-800'
      }`}
    >
      <button
        type="button"
        className="w-full text-left cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
              isTop ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-slate-800 text-slate-400'
            }`}>
              #{tech.rank || rank}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <p className={`font-semibold text-sm ${isTop ? 'text-slate-100' : 'text-slate-300'}`}>
                  {tech.name}
                </p>
                {isTop && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 font-medium">
                    Top Recommendation
                  </span>
                )}
                {isDisqualified && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Disqualified by Constraint
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{tech.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-3 shrink-0">
            <div className="text-right">
              <p className="text-[10px] text-slate-500">Score</p>
              <p className={`text-base font-bold font-mono ${
                isDisqualified ? 'text-rose-400' : isTop ? 'text-[#35D0BA]' : 'text-slate-400'
              }`}>
                {typeof tech.score === 'number' ? tech.score.toFixed(1) : tech.score}
              </p>
            </div>
            {expanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
          </div>
        </div>
      </button>

      {/* Comparison Justification banner if alternative */}
      {!isTop && tech.comparisonJustification && (
        <div className="mt-2.5 px-3 py-1.5 bg-slate-800/40 border border-slate-700/50 rounded-lg text-xs text-slate-400 flex items-center gap-2">
          <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{tech.comparisonJustification}</span>
        </div>
      )}

      {/* Disqualification warning */}
      {isDisqualified && tech.disqualificationReason && (
        <div className="mt-2.5 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>{tech.disqualificationReason}</span>
        </div>
      )}

      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
          {/* Detailed Metric Breakdown */}
          {tech.criterionScores && (
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Scoring Breakdown by Dimension
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(tech.criterionScores).map(([key, score]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400 capitalize">{key}</span>
                      <span className="font-mono text-slate-300">{score}/10</span>
                    </div>
                    <ScoreBar value={score} max={10} color={score >= 8 ? 'emerald' : score >= 6 ? 'teal' : 'amber'} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {tech.reasons?.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Info className="w-3.5 h-3.5 text-[#35D0BA]" />Requirement Fit Rationale
              </p>
              <ul className="space-y-1.5">
                {tech.reasons.map((r, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 text-[#35D0BA] shrink-0 mt-0.5" />{r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tech.advantages?.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <ThumbsUp className="w-3.5 h-3.5" />Advantages
                </p>
                <ul className="space-y-1">
                  {tech.advantages.map((a, i) => <li key={i} className="text-xs text-slate-400">• {a}</li>)}
                </ul>
              </div>
            )}
            {tech.disadvantages?.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <ThumbsDown className="w-3.5 h-3.5" />Disadvantages & Limitations
                </p>
                <ul className="space-y-1">
                  {tech.disadvantages.map((d, i) => <li key={i} className="text-xs text-slate-400">• {d}</li>)}
                </ul>
              </div>
            )}
          </div>

          {tech.tradeoffs?.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <ArrowRightLeft className="w-3.5 h-3.5" />Architectural Trade-offs
              </p>
              <ul className="space-y-1">
                {tech.tradeoffs.map((t, i) => <li key={i} className="text-xs text-slate-400">• {t}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────
const RecommendationsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  // Interactive Weighting Controls
  const [showWeightPanel, setShowWeightPanel] = useState(false);
  const [customWeights, setCustomWeights] = useState({
    scalability: 25,
    performance: 20,
    cost: 15,
    complexity: 15,
    security: 15,
    popularity: 10,
  });

  const loadExisting = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [projData, recData] = await Promise.all([
        projectService.getProjectById(id),
        recommendationService.get(id),
      ]);
      setProjectName(projData.project.projectName);
      if (recData.recommendations) {
        setData(recData);
        if (recData.appliedWeights) {
          const applied = {};
          Object.entries(recData.appliedWeights).forEach(([k, v]) => {
            applied[k] = Math.round(v * 100);
          });
          setCustomWeights(applied);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load recommendations.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadExisting(); }, [loadExisting]);

  const handleGenerate = async (weightsToApply = null) => {
    setGenerating(true);
    setError('');
    try {
      const result = await recommendationService.generate(id, weightsToApply);
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to generate recommendations.');
    } finally {
      setGenerating(false);
    }
  };

  const handleApplyCustomWeights = () => {
    // Convert 0..100 integers to 0..1 floats
    const normalizedPayload = {};
    Object.entries(customWeights).forEach(([k, v]) => {
      normalizedPayload[k] = +(v / 100).toFixed(4);
    });
    handleGenerate(normalizedPayload);
  };

  const handleResetWeights = () => {
    const defaults = {
      scalability: 25,
      performance: 20,
      cost: 15,
      complexity: 15,
      security: 15,
      popularity: 10,
    };
    setCustomWeights(defaults);
    const normalizedPayload = {};
    Object.entries(defaults).forEach(([k, v]) => {
      normalizedPayload[k] = +(v / 100).toFixed(4);
    });
    handleGenerate(normalizedPayload);
  };

  const currentWeightTotal = Object.values(customWeights).reduce((a, b) => a + Number(b || 0), 0);

  if (loading) return <LoadingPage message="Loading recommendations…" />;

  const scoreColor = (s) => s >= 7.5 ? 'text-emerald-400' : s >= 5 ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className="space-y-6 max-w-5xl py-2">
      <WorkflowNav
        projectId={id}
        projectName={projectName}
        activeStage={2}
        completedStages={{ 1: true, 2: Boolean(data) }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate(`/projects/${id}`)}>
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#35D0BA]" />
              Architecture Recommendations
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">{projectName} · Explainable Rule Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {data && (
            <Button
              variant="outline"
              size="sm"
              icon={Sliders}
              onClick={() => setShowWeightPanel(!showWeightPanel)}
            >
              {showWeightPanel ? 'Hide Weights' : 'Adjust Weights'}
            </Button>
          )}

          <Button
            variant="primary"
            icon={RefreshCw}
            isLoading={generating}
            onClick={() => handleGenerate()}
            id="generate-btn"
          >
            {generating ? 'Calculating…' : data ? 'Regenerate' : 'Generate Recommendations'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}

      {/* Interactive Weight Adjustment Panel */}
      {showWeightPanel && (
        <Card className="border-teal-500/30 bg-slate-900/90">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm flex items-center gap-2 text-teal-300">
                  <Sliders className="w-4 h-4" /> Custom Scoring Weights Configuration
                </CardTitle>
                <CardDescription>
                  Tune architectural trade-off priorities. All weights are automatically normalized to 100%.
                </CardDescription>
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-1 rounded ${
                currentWeightTotal === 100 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
              }`}>
                Sum: {currentWeightTotal}%
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Object.keys(customWeights).map((key) => (
                <div key={key} className="space-y-1.5 p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="flex justify-between items-center text-xs">
                    <span className="capitalize font-medium text-slate-300">{key}</span>
                    <span className="font-mono text-teal-400">{customWeights[key]}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="5"
                    value={customWeights[key]}
                    onChange={(e) => setCustomWeights({ ...customWeights, [key]: Number(e.target.value) })}
                    className="w-full accent-teal-400 cursor-pointer"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-800">
              <Button variant="ghost" size="sm" icon={RotateCcw} onClick={handleResetWeights}>
                Reset Defaults
              </Button>
              <Button variant="primary" size="sm" icon={Check} onClick={handleApplyCustomWeights} isLoading={generating}>
                Apply & Recalculate Ranking
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!data && !error && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
          <div className="w-16 h-16 rounded-xl bg-[#35D0BA]/10 border border-[#35D0BA]/20 flex items-center justify-center text-[#35D0BA]">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-slate-200 font-semibold">No recommendations yet</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              Click "Generate Recommendations" to run the rule-based engine against your project requirements.
            </p>
          </div>
          <Button variant="primary" icon={Sparkles} onClick={() => handleGenerate()} isLoading={generating} id="generate-empty">
            Generate Recommendations
          </Button>
        </div>
      )}

      {data && (
        <>
          {/* Overall score card & Methodology */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="sm:col-span-1 text-center flex flex-col items-center justify-center py-6">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Overall Stack Score</p>
              <p className={`text-5xl font-black font-mono ${scoreColor(data.overallScore)}`}>
                {typeof data.overallScore === 'number' ? data.overallScore.toFixed(1) : data.overallScore}
              </p>
              <p className="text-xs text-slate-500 mt-1">out of 10</p>
              <div className="mt-3 w-full px-4">
                <ScoreBar
                  value={data.overallScore}
                  color={data.overallScore >= 7.5 ? 'emerald' : data.overallScore >= 5 ? 'amber' : 'rose'}
                />
              </div>
              {data.isCustomWeights && (
                <span className="mt-2 text-[10px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  Custom Weights Active
                </span>
              )}
            </Card>

            <Card className="sm:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#35D0BA]" />Engine Analysis & Decisions
                </CardTitle>
                <CardDescription>
                  {data.scoringFormula || 'Score = Σ(CriterionScore × Weight) + CompatibilityBonus'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {(data.engineReasons || []).map((r, i) => (
                    <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-[#35D0BA] shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Required layers */}
          {data.requiredLayers?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />Mandatory Architectural Layers
                </CardTitle>
                <CardDescription>Infrastructure components required by traffic and compliance constraints</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.requiredLayers.map((layer) => (
                    <div key={layer.layer} className="flex items-start gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-amber-300">{layer.layer}</p>
                        <p className="text-[11px] text-amber-400/80 font-mono">{layer.technology}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{layer.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations by category */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#35D0BA]" />Technology Recommendations & Alternatives
            </h2>

            {Object.entries(data.recommendations || {}).map(([category, catData]) => (
              <Card key={category}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{CAT_ICONS[category] || '🔧'}</span>
                      <CardTitle className="text-base">{category}</CardTitle>
                    </div>
                    {catData.allCandidatesCount && (
                      <span className="text-xs text-slate-500 font-mono">
                        {catData.allCandidatesCount} candidates evaluated
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {catData.recommended && (
                      <TechCard tech={catData.recommended} isTop={true} rank={1} />
                    )}
                    {catData.alternatives?.length > 0 && (
                      <>
                        <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold pt-1">
                          Evaluated Alternatives (Ranked)
                        </p>
                        {catData.alternatives.map((t, idx) => (
                          <TechCard key={t.name || idx} tech={t} isTop={false} rank={idx + 2} />
                        ))}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Applied weights visualizer */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-slate-400">Current Active Scoring Weights</CardTitle>
                <button
                  onClick={() => setShowWeightPanel(true)}
                  className="text-xs text-teal-400 hover:underline flex items-center gap-1"
                >
                  <Sliders className="w-3 h-3" /> Adjust Weights
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(data.appliedWeights || {}).map(([dim, weight]) => (
                  <div key={dim} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500 capitalize">{dim}</span>
                      <span className="text-slate-400 font-mono">{(weight * 100).toFixed(1)}%</span>
                    </div>
                    <ScoreBar value={weight * 10} max={10} color="teal" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-slate-600 text-right">
            Generated: {data.generatedAt ? new Date(data.generatedAt).toLocaleString() : '—'} · Engine v{data.engineVersion || '2.0-Explainable'}
          </p>
        </>
      )}
    </div>
  );
};

export default RecommendationsPage;
