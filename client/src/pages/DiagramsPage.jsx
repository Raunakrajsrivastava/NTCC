import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Network, ArrowLeft, RefreshCw, AlertCircle, Database, Cpu, Activity, Workflow } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import MermaidViewer from '../components/common/MermaidViewer';
import { LoadingPage } from '../components/common/Loading';
import WorkflowNav from '../components/common/WorkflowNav';
import { diagramService } from '../services/diagramService.js';
import { projectService } from '../services/projectService.js';

const TABS = [
  { id: 'systemArchitecture', label: 'System Architecture', icon: Cpu, desc: 'High-level multi-tier component architecture' },
  { id: 'dataFlow', label: 'Data Flow (DFD)', icon: Network, desc: 'Level-1 data flow process & store interaction' },
  { id: 'entityRelationship', label: 'ER Diagram', icon: Database, desc: 'Database entities, attributes, and relationships' },
  { id: 'activity', label: 'Activity Diagram', icon: Workflow, desc: 'End-to-end user & system process workflow' },
];

const DiagramsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState('');
  const [diagrams, setDiagrams] = useState(null);
  const [activeTab, setActiveTab] = useState('systemArchitecture');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [projRes, diagRes] = await Promise.all([
        projectService.getProjectById(id),
        diagramService.get(id),
      ]);
      setProjectName(projRes.project.projectName);
      if (diagRes.diagrams) {
        setDiagrams(diagRes.diagrams);
      }
    } catch (err) {
      setError(err.message || 'Failed to load diagram data.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const res = await diagramService.generate(id);
      setDiagrams(res.diagrams);
    } catch (err) {
      setError(err.message || 'Failed to generate diagrams.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <LoadingPage message="Loading architecture diagrams..." />;

  const currentTab = TABS.find((t) => t.id === activeTab);
  const currentChartCode = diagrams ? diagrams[activeTab] : '';

  return (
    <div className="space-y-6 max-w-5xl py-2">
      <WorkflowNav
        projectId={id}
        projectName={projectName}
        activeStage={7}
        completedStages={{ 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: Boolean(diagrams) }}
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate(`/projects/${id}`)}>Back</Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Network className="w-6 h-6 text-[#35D0BA]" />
              Dynamic Architecture Diagrams
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">{projectName}</p>
          </div>
        </div>
        <Button
          variant="primary"
          icon={RefreshCw}
          isLoading={generating}
          onClick={handleGenerate}
        >
          {generating ? 'Generating Diagrams…' : diagrams ? 'Regenerate Diagrams' : 'Generate Diagrams'}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-3 rounded-lg border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'bg-[#35D0BA]/10 border-[#35D0BA]/35 text-slate-100 shadow-sm'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#35D0BA]' : 'text-slate-500'}`} />
                <span className="font-semibold text-xs text-slate-200">{tab.label}</span>
              </div>
              <p className="text-[10px] text-slate-500 line-clamp-1">{tab.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {!diagrams && !error && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
          <div className="w-16 h-16 rounded-xl bg-[#35D0BA]/10 border border-[#35D0BA]/20 flex items-center justify-center text-[#35D0BA]">
            <Network className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-slate-200 font-semibold">No Diagrams Generated Yet</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              Generate dynamic System Architecture, Data Flow (DFD), Entity Relationship (ER), and Activity diagrams rendered with Mermaid.js.
            </p>
          </div>
          <Button variant="primary" icon={Network} onClick={handleGenerate} isLoading={generating}>
            Generate Diagrams
          </Button>
        </div>
      )}

      {/* Diagram Viewer */}
      {diagrams && currentChartCode && (
        <MermaidViewer
          key={activeTab}
          chartCode={currentChartCode}
          id={activeTab}
          title={`${currentTab?.label} — ${projectName}`}
        />
      )}
    </div>
  );
};

export default DiagramsPage;
