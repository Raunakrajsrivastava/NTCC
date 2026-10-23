import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FolderKanban, Edit3, Trash2, ClipboardList, Cpu, AlertCircle,
  Clock, Zap, BarChart3, Users, DollarSign, ChevronRight,
  CheckCircle2, Layers, Sparkles, GitCompare, Brain, Code, Network, FileSpreadsheet,
  ShieldCheck, GitBranch, FileText
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { LoadingPage } from '../components/common/Loading';
import { projectService } from '../services/projectService.js';

const STATUS_STYLES = {
  'Draft':                   'bg-slate-700/40 text-slate-400 border-slate-700',
  'Requirements Collected':  'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'Analysis Complete':       'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'Architecture Generated':  'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-800 last:border-0">
    <span className="flex items-center gap-2 text-xs text-slate-500">
      <Icon className="w-3.5 h-3.5" />{label}
    </span>
    <span className="text-xs font-medium text-slate-300">{value || '—'}</span>
  </div>
);

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await projectService.getProjectById(id);
        setProject(data.project);
      } catch (err) {
        setError(err.message || 'Project not found.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await projectService.deleteProject(id);
      navigate('/projects');
    } catch (err) {
      setError(err.message);
      setIsDeleting(false);
    }
  };

  if (loading) return <LoadingPage message="Loading project…" />;

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <AlertCircle className="w-10 h-10 text-rose-400" />
      <p className="text-slate-300 font-medium">{error}</p>
      <Button variant="outline" onClick={() => navigate('/projects')}>Back to Projects</Button>
    </div>
  );

  const norm = project?.requirements?.normalizedRequirements;
  const hasRecs = Boolean(project?.recommendations);
  const hasComp = Boolean(project?.comparison);
  const hasAi = Boolean(project?.aiExplanation);
  const hasHld = Boolean(project?.hld);
  const hasLld = Boolean(project?.lld);
  const hasDiagrams = Boolean(project?.diagrams);
  const hasReport = Boolean(project?.report);

  const completedStagesList = [
    Boolean(project?.requirements),
    hasRecs,
    hasComp,
    hasAi,
    hasHld,
    hasLld,
    hasDiagrams,
    hasReport,
  ];
  const completedCount = completedStagesList.filter(Boolean).length;
  const progressPct = Math.round((completedCount / 8) * 100);

  let nextAction = { label: 'Complete Requirements', path: `/projects/${id}/requirements` };
  if (!project.requirements) nextAction = { label: 'Start Requirements Wizard', path: `/projects/${id}/requirements` };
  else if (!hasRecs) nextAction = { label: 'Generate Recommendations', path: `/projects/${id}/recommendations` };
  else if (!hasComp) nextAction = { label: 'Compare Presets', path: `/projects/${id}/compare` };
  else if (!hasAi) nextAction = { label: 'Generate AI Explanation', path: `/projects/${id}/explain` };
  else if (!hasHld) nextAction = { label: 'Generate HLD Specs', path: `/projects/${id}/hld` };
  else if (!hasLld) nextAction = { label: 'Generate LLD Specs', path: `/projects/${id}/lld` };
  else if (!hasDiagrams) nextAction = { label: 'Generate Diagrams', path: `/projects/${id}/diagrams` };
  else if (!hasReport) nextAction = { label: 'Compile Final Report', path: `/projects/${id}/report` };
  else nextAction = { label: 'View Master Technical Report', path: `/projects/${id}/report` };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${STATUS_STYLES[project.status] || STATUS_STYLES['Draft']}`}>
              {project.status}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">{project.projectName}</h1>
          {project.description && <p className="text-sm text-slate-400 mt-1">{project.description}</p>}
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" icon={Edit3} onClick={() => navigate(`/projects/${id}/edit`)}>Edit</Button>
          <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setDeleteOpen(true)} className="hover:text-rose-400 hover:bg-rose-500/10">Delete</Button>
        </div>
      </div>

      {/* Workstation Pipeline Banner */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#35D0BA] block mb-0.5">
              8-Stage Engineering Pipeline
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-100">
                {completedCount === 8 ? 'Architecture Fully Synthesized' : `Stage ${completedCount + 1} of 8 In Progress`}
              </span>
              <span className="text-xs text-slate-500 font-mono">({progressPct}%)</span>
            </div>
          </div>
          <Link to={nextAction.path}>
            <Button variant="primary" size="sm" icon={ChevronRight}>
              {nextAction.label}
            </Button>
          </Link>
        </div>
        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
          <div
            className="h-full bg-gradient-to-r from-[#28A899] to-[#35D0BA] rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project info */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-base">Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            <InfoRow icon={Zap} label="Type" value={project.applicationType} />
            <InfoRow icon={BarChart3} label="Traffic" value={project.expectedTraffic} />
            <InfoRow icon={Users} label="Expected Users" value={project.expectedUsers?.toLocaleString()} />
            <InfoRow icon={DollarSign} label="Budget" value={project.budget} />
            <InfoRow icon={Layers} label="Priority" value={project.priority} />
            <InfoRow icon={Clock} label="Created" value={new Date(project.createdAt).toLocaleDateString()} />
          </CardContent>
        </Card>

        {/* Pipeline steps */}
        <div className="lg:col-span-2 space-y-4">
          {/* Step 1 — Requirements */}
          <Card hover={true}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${project.requirements ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-slate-800 border border-slate-700 text-slate-500'}`}>
                  {project.requirements ? <CheckCircle2 className="w-5 h-5" /> : <ClipboardList className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">1. Requirement Collection</h3>
                  <p className="text-xs text-slate-500">
                    {project.requirements ? 'Requirements collected & normalized' : 'Complete the 6-step requirement wizard'}
                  </p>
                </div>
              </div>
              <Link to={`/projects/${id}/requirements`}>
                <Button variant={project.requirements ? 'outline' : 'primary'} size="sm" icon={ChevronRight}>
                  {project.requirements ? 'Edit' : 'Start'}
                </Button>
              </Link>
            </div>
          </Card>

          {/* Step 2 — Recommendations */}
          <Card hover={true}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${hasRecs ? 'bg-[#35D0BA]/10 border border-[#35D0BA]/20 text-[#35D0BA]' : 'bg-slate-800 border border-slate-700 text-slate-500'}`}>
                  {hasRecs ? <Sparkles className="w-5 h-5" /> : <Cpu className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">2. Architecture Recommendations</h3>
                  <p className="text-xs text-slate-500">
                    {hasRecs ? `Overall stack score: ${project.recommendations.overallScore}/10` : 'Generate rule-based architecture recommendations'}
                  </p>
                </div>
              </div>
              <Link to={`/projects/${id}/recommendations`}>
                <Button variant={hasRecs ? 'outline' : 'primary'} size="sm" icon={hasRecs ? ChevronRight : Sparkles} disabled={!project.requirements}>
                  {hasRecs ? 'View' : 'Generate'}
                </Button>
              </Link>
            </div>
          </Card>

          {/* Step 3 — Architecture Comparison */}
          <Card hover={true}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${hasComp ? 'bg-[#6FA8C9]/10 border border-[#6FA8C9]/20 text-[#6FA8C9]' : 'bg-slate-800 border border-slate-700 text-slate-500'}`}>
                  <GitCompare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">3. Scoring & Preset Comparison</h3>
                  <p className="text-xs text-slate-500">
                    {hasComp ? `Top preset: ${project.comparison.winner?.name}` : 'Compare MERN, Spring, Django, Next.js side-by-side'}
                  </p>
                </div>
              </div>
              <Link to={`/projects/${id}/compare`}>
                <Button variant={hasComp ? 'outline' : 'primary'} size="sm" icon={ChevronRight} disabled={!project.requirements}>
                  {hasComp ? 'View' : 'Compare'}
                </Button>
              </Link>
            </div>
          </Card>

          {/* Step 4 — AI Explanation */}
          <Card hover={true}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${hasAi ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-slate-800 border border-slate-700 text-slate-500'}`}>
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">4. AI Architecture Explanation</h3>
                  <p className="text-xs text-slate-500">
                    {hasAi ? 'AI report generated (10 sections)' : 'Generate natural-language AI report (Gemini)'}
                  </p>
                </div>
              </div>
              <Link to={`/projects/${id}/explain`}>
                <Button variant={hasAi ? 'outline' : 'primary'} size="sm" icon={hasAi ? ChevronRight : Brain} disabled={!hasRecs}>
                  {hasAi ? 'View' : 'Explain'}
                </Button>
              </Link>
            </div>
          </Card>

          {/* Step 5 — HLD */}
          <Card hover={true}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${hasHld ? 'bg-sky-500/10 border border-sky-500/20 text-sky-400' : 'bg-slate-800 border border-slate-700 text-slate-500'}`}>
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">5. High-Level Design (HLD)</h3>
                  <p className="text-xs text-slate-500">
                    {hasHld ? '9-tier High-Level Design generated' : 'Generate structured system tiers & deployment topology'}
                  </p>
                </div>
              </div>
              <Link to={`/projects/${id}/hld`}>
                <Button variant={hasHld ? 'outline' : 'primary'} size="sm" icon={ChevronRight}>
                  {hasHld ? 'View' : 'Generate'}
                </Button>
              </Link>
            </div>
          </Card>

          {/* Step 6 — LLD */}
          <Card hover={true}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${hasLld ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' : 'bg-slate-800 border border-slate-700 text-slate-500'}`}>
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">6. Low-Level Design (LLD)</h3>
                  <p className="text-xs text-slate-500">
                    {hasLld ? 'API specs, entity schemas & controllers generated' : 'Generate low-level API endpoints, DB entities & flows'}
                  </p>
                </div>
              </div>
              <Link to={`/projects/${id}/lld`}>
                <Button variant={hasLld ? 'outline' : 'primary'} size="sm" icon={ChevronRight}>
                  {hasLld ? 'View' : 'Generate'}
                </Button>
              </Link>
            </div>
          </Card>

          {/* Step 7 — Diagrams */}
          <Card hover={true}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${hasDiagrams ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' : 'bg-slate-800 border border-slate-700 text-slate-500'}`}>
                  <Network className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">7. Dynamic Architecture Diagrams</h3>
                  <p className="text-xs text-slate-500">
                    {hasDiagrams ? '4 Mermaid diagrams generated (System, DFD, ER, Activity)' : 'Generate interactive System, DFD, ER & Activity diagrams'}
                  </p>
                </div>
              </div>
              <Link to={`/projects/${id}/diagrams`}>
                <Button variant={hasDiagrams ? 'outline' : 'primary'} size="sm" icon={ChevronRight}>
                  {hasDiagrams ? 'View' : 'Generate'}
                </Button>
              </Link>
            </div>
          </Card>

          {/* Step 8 — Final Architecture Report */}
          <Card hover={true} className="border-[#35D0BA]/35 bg-slate-900/90">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#35D0BA]/15 border border-[#35D0BA]/30 flex items-center justify-center text-[#35D0BA]">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">8. Complete Architecture Report (23 Sections)</h3>
                  <p className="text-xs text-slate-400">
                    {hasReport ? 'Master document generated with PDF export' : 'Synthesize all modules into a master architecture PDF report'}
                  </p>
                </div>
              </div>
              <Link to={`/projects/${id}/report`}>
                <Button variant="primary" size="sm" icon={FileSpreadsheet}>
                  {hasReport ? 'View Report' : 'Generate Report'}
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Dedicated Architecture Decision Support Engines */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#35D0BA]" />
              Enterprise Architecture Decision Support Engines
            </h2>
            <span className="text-xs text-slate-500 font-mono">Modules 7+</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card hover={true} className="border-teal-500/20 bg-slate-900/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">Architecture Validation</h3>
                    <p className="text-xs text-slate-500">Categories A–F deterministic rule verification</p>
                  </div>
                </div>
                <Link to={`/projects/${id}/validate`}>
                  <Button variant="outline" size="sm" icon={ChevronRight}>Open</Button>
                </Link>
              </div>
            </Card>

            <Card hover={true} className="border-teal-500/20 bg-slate-900/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <GitBranch className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">What-If Simulator</h3>
                    <p className="text-xs text-slate-500">Branching scenario testing & diffs</p>
                  </div>
                </div>
                <Link to={`/projects/${id}/scenarios`}>
                  <Button variant="outline" size="sm" icon={ChevronRight}>Simulate</Button>
                </Link>
              </div>
            </Card>

            <Card hover={true} className="border-teal-500/20 bg-slate-900/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">Capacity & Cost Planning</h3>
                    <p className="text-xs text-slate-500">Throughput, Little's Law, and 3-tier run-rate</p>
                  </div>
                </div>
                <Link to={`/projects/${id}/capacity-cost`}>
                  <Button variant="outline" size="sm" icon={ChevronRight}>View</Button>
                </Link>
              </div>
            </Card>

            <Card hover={true} className="border-teal-500/20 bg-slate-900/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">Traceability & ADRs</h3>
                    <p className="text-xs text-slate-500">FR/NFR matrix & Decision Records</p>
                  </div>
                </div>
                <Link to={`/projects/${id}/traceability`}>
                  <Button variant="outline" size="sm" icon={ChevronRight}>Manage</Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete modal */}
      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Project"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="danger" size="sm" isLoading={isDeleting} onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-slate-300">
          Permanently delete <span className="font-semibold text-white">"{project.projectName}"</span>?
          This will remove all requirements, recommendations, designs, diagrams, and reports.
        </p>
      </Modal>
    </div>
  );
};

export default ProjectDetailPage;
