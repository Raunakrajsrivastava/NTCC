import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ClipboardList, ArrowLeft, ArrowRight, CheckCircle2,
  Send, AlertCircle, Cpu, Users, Zap, Settings, DollarSign, Eye
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { LoadingPage, LoadingSpinner } from '../components/common/Loading';
import WorkflowNav from '../components/common/WorkflowNav';
import { requirementService } from '../services/requirementService.js';
import { projectService } from '../services/projectService.js';

// ── Shared select/toggle styles ─────────────────────────────────────────────
const sel = 'w-full bg-slate-950/70 text-slate-100 text-sm rounded-lg border border-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#35D0BA]/20 focus:border-[#35D0BA]';
const lbl = 'text-xs font-medium text-slate-300 block mb-1.5';

// ── Feature toggle ───────────────────────────────────────────────────────────
const Toggle = ({ label, name, value, onChange }) => (
  <button
    type="button"
    id={`toggle-${name}`}
    onClick={() => onChange({ target: { name, value: !value, type: 'toggle' } })}
    className={`flex items-center gap-3 p-3 rounded-lg border text-sm font-medium transition-all duration-150 cursor-pointer ${
      value
        ? 'bg-[#35D0BA]/10 border-[#35D0BA]/35 text-[#35D0BA]'
        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
    }`}
  >
    <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${value ? 'bg-[#35D0BA] border-[#35D0BA]' : 'border-slate-600'}`}>
      {value && <CheckCircle2 className="w-3 h-3 text-[#0B0D0F]" />}
    </span>
    {label}
  </button>
);

// ── Steps config ─────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Application', icon: Cpu },
  { id: 2, label: 'Users & Traffic', icon: Users },
  { id: 3, label: 'Features', icon: Zap },
  { id: 4, label: 'Technical', icon: Settings },
  { id: 5, label: 'Constraints', icon: DollarSign },
  { id: 6, label: 'Review', icon: Eye },
];

const INITIAL_FORM = {
  applicationType: 'Web App', projectDescription: '', targetUsers: '',
  expectedUsers: '', dailyRequests: '', trafficLevel: '', geographicScope: 'National',
  hasAuth: false, hasPayments: false, hasSearch: false, hasFileUploads: false,
  hasNotifications: false, hasRealtime: false, hasAdminPanel: false, hasAnalytics: false,
  performanceReq: 'Standard', availabilityReq: '99%', securityReq: 'Standard', scalabilityReq: 'Fixed',
  budget: '', teamSize: '', timeline: '',
};

const RequirementsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [projectName, setProjectName] = useState('');
  const [loadingProject, setLoadingProject] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [existingReqs, setExistingReqs] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [projData, reqData] = await Promise.all([
          projectService.getProjectById(id),
          requirementService.getRequirements(id),
        ]);
        setProjectName(projData.project.projectName);
        if (reqData.requirements) {
          const r = reqData.requirements;
          setForm((prev) => ({ ...prev, ...r }));
          setExistingReqs(r);
        }
      } catch (err) {
        setError(err.message || 'Failed to load project.');
      } finally {
        setLoadingProject(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'toggle' ? value : value }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        expectedUsers: form.expectedUsers ? Number(form.expectedUsers) : null,
        dailyRequests: form.dailyRequests ? Number(form.dailyRequests) : null,
        teamSize: form.teamSize ? Number(form.teamSize) : null,
      };
      if (existingReqs) {
        await requirementService.updateRequirements(id, payload);
      } else {
        await requirementService.saveRequirements(id, payload);
      }
      navigate(`/projects/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to save requirements.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingProject) return <LoadingPage message="Loading project requirements…" />;

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      <WorkflowNav
        projectId={id}
        projectName={projectName}
        activeStage={1}
        completedStages={{ 1: Boolean(existingReqs) }}
      />
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate(`/projects/${id}`)}>Back</Button>
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#35D0BA]" />
            Requirement Wizard
          </h1>
          <p className="text-xs text-slate-500">{projectName}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const active = s.id === step;
            const done = s.id < step;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => s.id < step && setStep(s.id)}
                className={`flex flex-col items-center gap-1 group ${s.id < step ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-150 ${
                  done ? 'bg-[#35D0BA] border-[#35D0BA] text-[#0B0D0F]' :
                  active ? 'bg-[#35D0BA]/10 border-[#35D0BA] text-[#35D0BA]' :
                  'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  {done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={`text-[10px] font-medium hidden sm:block ${active ? 'text-[#35D0BA]' : done ? 'text-slate-300' : 'text-slate-500'}`}>
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#28A899] to-[#35D0BA] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-slate-500 text-right">Step {step} of {STEPS.length}</p>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-300">{error}</p>
        </div>
      )}

      {/* Step content */}
      <Card>
        {/* Step 1 — Application */}
        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle>Step 1 — Application Information</CardTitle>
              <CardDescription>Tell us about your application's purpose and target audience.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className={lbl}>Application Type</label>
                  <select name="applicationType" value={form.applicationType} onChange={handleChange} className={sel}>
                    {['Web App','Mobile App','API Service','Microservices','Monolith','Desktop App','Other'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Project Description</label>
                  <textarea name="projectDescription" rows="3" value={form.projectDescription} onChange={handleChange}
                    placeholder="Describe what your application does and its primary purpose…"
                    className="w-full bg-slate-950/70 text-slate-100 text-sm rounded-lg border border-slate-800 p-3 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#35D0BA]/20 focus:border-[#35D0BA] resize-none" />
                </div>
                <div>
                  <label className={lbl}>Target Users</label>
                  <textarea name="targetUsers" rows="2" value={form.targetUsers} onChange={handleChange}
                    placeholder="Who will use this system? e.g. Enterprise B2B customers, general consumers, internal teams…"
                    className="w-full bg-slate-950/70 text-slate-100 text-sm rounded-lg border border-slate-800 p-3 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#35D0BA]/20 focus:border-[#35D0BA] resize-none" />
                </div>
              </div>
            </CardContent>
          </>
        )}

        {/* Step 2 — Users & Traffic */}
        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle>Step 2 — Users & Traffic</CardTitle>
              <CardDescription>Define your scale and geographic reach.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Expected Total Users" name="expectedUsers" type="number" placeholder="e.g. 100000" value={form.expectedUsers} onChange={handleChange} helperText="Estimated total registered users." id="req-users" />
                  <Input label="Daily Requests (approx.)" name="dailyRequests" type="number" placeholder="e.g. 1000000" value={form.dailyRequests} onChange={handleChange} helperText="Average API calls per day." id="req-requests" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Traffic Level</label>
                    <select name="trafficLevel" value={form.trafficLevel} onChange={handleChange} className={sel}>
                      <option value="">— Auto-derive —</option>
                      {['LOW','MEDIUM','HIGH','VERY_HIGH'].map(t => <option key={t}>{t}</option>)}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">Leave blank to auto-derive from user/request counts.</p>
                  </div>
                  <div>
                    <label className={lbl}>Geographic Scope</label>
                    <select name="geographicScope" value={form.geographicScope} onChange={handleChange} className={sel}>
                      {['Local','National','Global'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </>
        )}

        {/* Step 3 — Features */}
        {step === 3 && (
          <>
            <CardHeader>
              <CardTitle>Step 3 — Features</CardTitle>
              <CardDescription>Select the features your application will require.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: 'hasAuth', label: '🔐 Authentication & Authorization' },
                  { name: 'hasPayments', label: '💳 Payments & Billing' },
                  { name: 'hasSearch', label: '🔍 Full-Text Search' },
                  { name: 'hasFileUploads', label: '📁 File Uploads & Storage' },
                  { name: 'hasNotifications', label: '🔔 Push Notifications' },
                  { name: 'hasRealtime', label: '⚡ Real-Time Communication' },
                  { name: 'hasAdminPanel', label: '🛠 Admin Panel / CMS' },
                  { name: 'hasAnalytics', label: '📊 Analytics & Reporting' },
                ].map(({ name, label }) => (
                  <Toggle key={name} name={name} label={label} value={form[name]} onChange={handleChange} />
                ))}
              </div>
            </CardContent>
          </>
        )}

        {/* Step 4 — Technical Requirements */}
        {step === 4 && (
          <>
            <CardHeader>
              <CardTitle>Step 4 — Technical Requirements</CardTitle>
              <CardDescription>Define non-functional requirements and SLAs.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'performanceReq', label: 'Performance Requirement', opts: ['Standard','High Performance','Ultra Low Latency'] },
                  { name: 'availabilityReq', label: 'Availability / Uptime SLA', opts: ['99%','99.9%','99.99%','99.999%'] },
                  { name: 'securityReq', label: 'Security Level', opts: ['Standard','High','Critical'] },
                  { name: 'scalabilityReq', label: 'Scalability Approach', opts: ['Fixed','Horizontal','Auto-scaling'] },
                ].map(({ name, label, opts }) => (
                  <div key={name}>
                    <label className={lbl}>{label}</label>
                    <select name={name} value={form[name]} onChange={handleChange} className={sel}>
                      {opts.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </CardContent>
          </>
        )}

        {/* Step 5 — Budget & Constraints */}
        {step === 5 && (
          <>
            <CardHeader>
              <CardTitle>Step 5 — Budget & Constraints</CardTitle>
              <CardDescription>Define business constraints that affect technology selection.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className={lbl}>Infrastructure Budget</label>
                  <select name="budget" value={form.budget} onChange={handleChange} className={sel}>
                    <option value="">— Select range —</option>
                    {['< $5k','$5k–$25k','$25k–$100k','$100k+'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <Input label="Team Size" name="teamSize" type="number" placeholder="e.g. 5" value={form.teamSize} onChange={handleChange} helperText="Number of engineers who will build/maintain this system." id="req-team" />
                <div>
                  <label className={lbl}>Development Timeline</label>
                  <select name="timeline" value={form.timeline} onChange={handleChange} className={sel}>
                    <option value="">— Select timeline —</option>
                    {['< 1 month','1–3 months','3–6 months','6–12 months','12+ months'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </CardContent>
          </>
        )}

        {/* Step 6 — Review */}
        {step === 6 && (
          <>
            <CardHeader>
              <CardTitle>Step 6 — Review & Submit</CardTitle>
              <CardDescription>Confirm your requirements before the system normalizes and stores them.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                {[
                  { title: '🖥 Application', rows: [['Type', form.applicationType], ['Description', form.projectDescription || '—'], ['Target Users', form.targetUsers || '—']] },
                  { title: '📊 Scale', rows: [['Expected Users', form.expectedUsers || '—'], ['Daily Requests', form.dailyRequests || '—'], ['Traffic Level', form.trafficLevel || 'Auto-derive'], ['Geographic Scope', form.geographicScope]] },
                  { title: '⚙️ Technical', rows: [['Performance', form.performanceReq], ['Availability', form.availabilityReq], ['Security', form.securityReq], ['Scalability', form.scalabilityReq]] },
                  { title: '💼 Constraints', rows: [['Budget', form.budget || '—'], ['Team Size', form.teamSize || '—'], ['Timeline', form.timeline || '—']] },
                ].map(({ title, rows }) => (
                  <div key={title} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                    <p className="text-xs font-semibold text-slate-400 mb-3">{title}</p>
                    <div className="space-y-1.5">
                      {rows.map(([k, v]) => (
                        <div key={k} className="flex justify-between text-xs">
                          <span className="text-slate-500">{k}</span>
                          <span className="text-slate-300 font-medium">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Features summary */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-400 mb-3">🔧 Selected Features</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      ['hasAuth','Auth'], ['hasPayments','Payments'], ['hasSearch','Search'],
                      ['hasFileUploads','Files'], ['hasNotifications','Notifications'],
                      ['hasRealtime','Realtime'], ['hasAdminPanel','Admin'], ['hasAnalytics','Analytics']
                    ].filter(([k]) => form[k]).map(([k, label]) => (
                      <span key={k} className="text-[11px] px-2 py-0.5 rounded bg-[#35D0BA]/10 text-[#35D0BA] border border-[#35D0BA]/20">{label}</span>
                    ))}
                    {!Object.entries(form).filter(([k]) => k.startsWith('has')).some(([,v]) => v) && (
                      <span className="text-xs text-slate-500">No features selected</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" icon={ArrowLeft} onClick={() => setStep((s) => s - 1)} disabled={step === 1 || isSaving}>
          Previous
        </Button>

        {step < STEPS.length ? (
          <Button variant="primary" icon={ArrowRight} onClick={() => setStep((s) => s + 1)} id="req-next">
            Next
          </Button>
        ) : (
          <Button
            variant="primary"
            icon={isSaving ? undefined : Send}
            isLoading={isSaving}
            onClick={handleSubmit}
            disabled={isSaving}
            id="req-submit"
          >
            {isSaving ? 'Saving…' : existingReqs ? 'Update Requirements' : 'Save Requirements'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default RequirementsPage;
