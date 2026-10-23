import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Brain, ArrowLeft, RefreshCw, AlertCircle, Sparkles,
  ChevronDown, ChevronRight, Shield, Zap, TrendingUp, AlertTriangle,
  Lightbulb, CheckCircle2, Info
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import { LoadingPage } from '../components/common/Loading';
import WorkflowNav from '../components/common/WorkflowNav';
import { aiService } from '../services/aiService.js';
import { projectService } from '../services/projectService.js';

const AccordionItem = ({ icon: Icon, title, children, defaultOpen = false, isWarning = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`rounded-xl border transition-all duration-200 ${
      isWarning ? 'bg-amber-500/5 border-amber-500/20' : 'bg-slate-900/60 border-slate-800'
    }`}>
      <button
        type="button"
        className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isWarning ? 'bg-amber-500/10 text-amber-400' : 'bg-[#35D0BA]/10 text-[#35D0BA]'
          }`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm text-slate-100">{title}</span>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-800/60 text-sm text-slate-300 space-y-2 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
};

const ExplanationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [projRes, aiRes] = await Promise.all([
        projectService.getProjectById(id),
        aiService.get(id),
      ]);
      setProjectName(projRes.project.projectName);
      if (aiRes.explanation) {
        setData(aiRes.explanation);
      }
    } catch (err) {
      setError(err.message || 'Failed to load AI explanation.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const res = await aiService.explain(id);
      setData(res.explanation);
    } catch (err) {
      setError(err.message || 'Failed to generate AI explanation.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <LoadingPage message="Loading AI explanation..." />;

  return (
    <div className="space-y-6 max-w-4xl py-2">
      <WorkflowNav
        projectId={id}
        projectName={projectName}
        activeStage={4}
        completedStages={{ 1: true, 2: true, 3: true, 4: Boolean(data) }}
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate(`/projects/${id}`)}>Back</Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Brain className="w-6 h-6 text-[#35D0BA]" />
              AI Architecture Explanation
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">{projectName}</p>
          </div>
        </div>
        <Button
          variant="primary"
          icon={Sparkles}
          isLoading={generating}
          onClick={handleGenerate}
        >
          {generating ? 'Analyzing with AI…' : data ? 'Regenerate Report' : 'Generate AI Report'}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}

      {/* Notice about AI role */}
      <div className="p-4 bg-[#35D0BA]/10 border border-[#35D0BA]/20 rounded-xl flex items-start gap-3 text-xs text-slate-300">
        <Info className="w-4 h-4 text-[#35D0BA] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-[#35D0BA]">AI Safety & Transparency:</span> The AI acts purely as an <span className="underline">explainer</span> for the deterministic rule engine recommendations. It contextualizes decisions, highlights assumptions, and identifies risks without replacing human technical oversight.
        </div>
      </div>

      {/* Fallback Warning Banner if applicable */}
      {data?._isFallback && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3 text-xs text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-300">Offline Explanation Active:</span> {data._fallbackReason || 'AI service unavailable — generated from rule engine dataset.'}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!data && !error && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
          <div className="w-16 h-16 rounded-xl bg-[#35D0BA]/10 border border-[#35D0BA]/20 flex items-center justify-center text-[#35D0BA]">
            <Brain className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-slate-200 font-semibold">No AI Explanation Generated Yet</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              Generate an in-depth AI report explaining recommendation choices, risks, scalability factors, and security considerations.
            </p>
          </div>
          <Button variant="primary" icon={Sparkles} onClick={handleGenerate} isLoading={generating}>
            Generate AI Report
          </Button>
        </div>
      )}

      {/* 10-Section AI Explanation Accordion */}
      {data && (
        <div className="space-y-3">
          {/* Section 1 */}
          <AccordionItem icon={Brain} title="1. Architecture Summary" defaultOpen={true}>
            <p>{data.architectureSummary}</p>
          </AccordionItem>

          {/* Section 2 */}
          <AccordionItem icon={Zap} title="2. Technology Selection Explanation" defaultOpen={true}>
            <p>{data.technologyExplanation}</p>
          </AccordionItem>

          {/* Section 3 */}
          <AccordionItem icon={RefreshCw} title="3. Alternative Technologies & Rationale">
            <p>{data.alternativeExplanation}</p>
          </AccordionItem>

          {/* Section 4 */}
          <AccordionItem icon={CheckCircle2} title="4. Core Advantages">
            <ul className="space-y-1.5 list-disc pl-5">
              {data.advantages?.map((adv, i) => (
                <li key={i}>{adv}</li>
              ))}
            </ul>
          </AccordionItem>

          {/* Section 5 */}
          <AccordionItem icon={AlertCircle} title="5. Potential Disadvantages">
            <ul className="space-y-1.5 list-disc pl-5">
              {data.disadvantages?.map((dis, i) => (
                <li key={i}>{dis}</li>
              ))}
            </ul>
          </AccordionItem>

          {/* Section 6 */}
          <AccordionItem icon={RefreshCw} title="6. Architectural Trade-Offs">
            <ul className="space-y-1.5 list-disc pl-5">
              {data.tradeoffs?.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </AccordionItem>

          {/* Section 7 */}
          <AccordionItem icon={AlertTriangle} title="7. Key System Risks & Assumptions" isWarning={true}>
            <ul className="space-y-1.5 list-disc pl-5">
              {data.risks?.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </AccordionItem>

          {/* Section 8 */}
          <AccordionItem icon={TrendingUp} title="8. Scalability & Load Handling">
            <p>{data.scalabilityExplanation}</p>
          </AccordionItem>

          {/* Section 9 */}
          <AccordionItem icon={Shield} title="9. Security & Compliance Posture">
            <p>{data.securityExplanation}</p>
          </AccordionItem>

          {/* Section 10 */}
          <AccordionItem icon={Lightbulb} title="10. Suggested Next Steps & Improvements">
            <ul className="space-y-1.5 list-disc pl-5">
              {data.improvementSuggestions?.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </AccordionItem>

          {/* Metadata Footer */}
          <div className="pt-4 text-xs text-slate-500 flex justify-between items-center">
            <span>Powered by {data._model || 'Google Gemini'}</span>
            <span>Generated: {data.generatedAt ? new Date(data.generatedAt).toLocaleString() : 'Just now'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplanationPage;
