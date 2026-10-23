import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  GitCompare, ArrowLeft, RefreshCw, CheckCircle2, AlertCircle,
  Trophy, ShieldAlert, Zap, Layers, ThumbsUp, ThumbsDown, ArrowRightLeft, Info
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import { LoadingPage } from '../components/common/Loading';
import WorkflowNav from '../components/common/WorkflowNav';
import { comparisonService } from '../services/comparisonService.js';
import { projectService } from '../services/projectService.js';

// SVG Radar Chart / Bar Visualizer for Criteria
const CriteriaBar = ({ label, score, max = 10, isWinner }) => {
  const pct = Math.round((score / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className={`font-medium ${isWinner ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}>
          {label} {isWinner && '👑'}
        </span>
        <span className="font-mono text-slate-300">{score}/10</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isWinner
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
              : 'bg-gradient-to-r from-[#28A899] to-[#35D0BA]'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const ComparisonPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState('');
  const [availablePresets, setAvailablePresets] = useState([]);
  const [selectedPresets, setSelectedPresets] = useState(['mern', 'spring_pg', 'django_pg']);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [projRes, compRes] = await Promise.all([
        projectService.getProjectById(id),
        comparisonService.get(id),
      ]);
      setProjectName(projRes.project.projectName);
      setAvailablePresets(compRes.availablePresets || []);
      if (compRes.comparison) {
        setData(compRes.comparison);
        setSelectedPresets(compRes.comparison.presetIds || ['mern', 'spring_pg', 'django_pg']);
      }
    } catch (err) {
      setError(err.message || 'Failed to load comparison options.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const togglePreset = (presetId) => {
    setSelectedPresets((prev) => {
      if (prev.includes(presetId)) {
        if (prev.length <= 2) return prev; // Keep at least 2
        return prev.filter((p) => p !== presetId);
      } else {
        if (prev.length >= 4) return prev; // Limit to 4 for clean layout
        return [...prev, presetId];
      }
    });
  };

  const handleCompare = async () => {
    if (selectedPresets.length < 2) {
      setError('Please select at least 2 architecture presets.');
      return;
    }
    setComparing(true);
    setError('');
    try {
      const res = await comparisonService.compare(id, selectedPresets);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to run comparison.');
    } finally {
      setComparing(false);
    }
  };

  if (loading) return <LoadingPage message="Loading architecture presets…" />;

  return (
    <div className="space-y-6 max-w-5xl py-2">
      <WorkflowNav
        projectId={id}
        projectName={projectName}
        activeStage={3}
        completedStages={{ 1: true, 2: true, 3: Boolean(data) }}
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate(`/projects/${id}`)}>Back</Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <GitCompare className="w-6 h-6 text-[#35D0BA]" />
              Architecture Scoring & Comparison
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">{projectName}</p>
          </div>
        </div>
        <Button
          variant="primary"
          icon={RefreshCw}
          isLoading={comparing}
          onClick={handleCompare}
          disabled={selectedPresets.length < 2}
        >
          {comparing ? 'Evaluating…' : 'Run Comparison'}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}

      {/* Preset Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Architecture Presets to Compare</CardTitle>
          <CardDescription>Choose between 2 and 4 full-stack combinations to evaluate side-by-side.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {availablePresets.map((preset) => {
              const isSelected = selectedPresets.includes(preset.id);
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => togglePreset(preset.id)}
                  className={`p-3.5 rounded-lg border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#35D0BA]/10 border-[#35D0BA]/35 text-slate-100'
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-slate-100">{preset.name}</span>
                      <span className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-[#35D0BA] border-[#35D0BA]' : 'border-slate-700'}`}>
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-[#0B0D0F]" />}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{preset.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {preset.tags.map((tag) => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer Alert */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200/90 leading-relaxed">
          <span className="font-semibold text-amber-300">Core Architecture Principle:</span> The highest overall score is <span className="underline">not</span> universally correct for every project. The optimal choice depends on your specific constraints, team experience, and non-functional requirements.
        </div>
      </div>

      {/* Comparison Results */}
      {data && (
        <div className="space-y-6">
          {/* Winner Banner */}
          <div className="p-5 bg-slate-900 border border-[#35D0BA]/35 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#35D0BA] uppercase tracking-wider">Requirement Match Winner</p>
                <h3 className="text-lg font-bold text-white">{data.winner.name}</h3>
                <p className="text-xs text-slate-400">Score: {data.winner.overall} / 10 (Weighted by project requirements)</p>
              </div>
            </div>
            <div className="text-xs text-slate-400 text-right font-mono">
              Evaluated {data.results.length} preset architectures
            </div>
          </div>

          {/* Side-by-Side Cards */}
          <div className={`grid grid-cols-1 md:grid-cols-${Math.min(data.results.length, 3)} gap-4`}>
            {data.results.map((res) => {
              const isWinner = res.presetId === data.winner.presetId;
              return (
                <Card
                  key={res.presetId}
                  className={`flex flex-col justify-between ${
                    isWinner ? 'border-[#35D0BA]/40 bg-slate-900/90' : 'bg-slate-900/70'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="pb-3 border-b border-slate-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-slate-100">{res.name}</span>
                        {isWinner && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            🏆 Top Match
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{res.description}</p>
                      <div className="mt-3 flex justify-between items-baseline">
                        <span className="text-xs text-slate-500">Weighted Score</span>
                        <span className={`text-2xl font-black font-mono ${isWinner ? 'text-[#35D0BA]' : 'text-slate-300'}`}>
                          {res.overall} <span className="text-xs text-slate-500 font-normal">/ 10</span>
                        </span>
                      </div>
                    </div>

                    {/* Criteria Scores */}
                    <div className="space-y-2.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Evaluation Criteria</p>
                      {data.criteria.map((c) => (
                        <CriteriaBar
                          key={c}
                          label={c}
                          score={res.criteria[c]}
                          isWinner={data.criteriaWinners[c] === res.presetId}
                        />
                      ))}
                    </div>

                    {/* Highlights */}
                    <div className="pt-3 border-t border-slate-800 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Strongest:</span>
                        <span className="text-emerald-400 font-medium">{res.strongest}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Weakest:</span>
                        <span className="text-amber-400 font-medium">{res.weakest}</span>
                      </div>
                    </div>

                    {/* Advantages */}
                    {res.advantages?.length > 0 && (
                      <div className="pt-3 border-t border-slate-800">
                        <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" /> Advantages
                        </p>
                        <ul className="space-y-1">
                          {res.advantages.map((adv, i) => (
                            <li key={i} className="text-xs text-slate-300">• {adv}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Disadvantages */}
                    {res.disadvantages?.length > 0 && (
                      <div className="pt-3 border-t border-slate-800">
                        <p className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <ThumbsDown className="w-3 h-3" /> Disadvantages
                        </p>
                        <ul className="space-y-1">
                          {res.disadvantages.map((dis, i) => (
                            <li key={i} className="text-xs text-slate-300">• {dis}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Trade-offs */}
                    {res.tradeoffs?.length > 0 && (
                      <div className="pt-3 border-t border-slate-800">
                        <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <ArrowRightLeft className="w-3 h-3" /> Trade-offs
                        </p>
                        <ul className="space-y-1">
                          {res.tradeoffs.map((t, i) => (
                            <li key={i} className="text-xs text-slate-300">• {t}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonPage;
