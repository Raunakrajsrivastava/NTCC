import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit3, AlertCircle, CheckCircle2, ArrowLeft, Save } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { LoadingPage } from '../components/common/Loading';
import { projectService } from '../services/projectService.js';

const APPLICATION_TYPES = ['Web App', 'Mobile App', 'API Service', 'Microservices', 'Monolith', 'Desktop App', 'Other'];
const BUDGETS = ['', '< $5k', '$5k–$25k', '$25k–$100k', '$100k+'];
const TRAFFIC_LEVELS = ['', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES = ['Draft', 'Requirements Collected', 'Analysis Complete', 'Architecture Generated'];

const selectClass = 'w-full bg-slate-950/70 text-slate-100 text-sm rounded-lg border border-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#35D0BA]/20 focus:border-[#35D0BA]';
const labelClass = 'text-xs font-medium text-slate-300 block mb-1.5';

const EditProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await projectService.getProjectById(id);
        const p = data.project;
        setFormData({
          projectName: p.projectName || '',
          description: p.description || '',
          applicationType: p.applicationType || 'Web App',
          budget: p.budget || '',
          expectedUsers: p.expectedUsers || '',
          expectedTraffic: p.expectedTraffic || '',
          priority: p.priority || 'Medium',
          status: p.status || 'Draft',
        });
      } catch (err) {
        setError(err.message || 'Failed to load project.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.projectName.trim()) { setError('Project name is required.'); return; }
    setIsSaving(true);
    setError('');
    try {
      await projectService.updateProject(id, {
        ...formData,
        expectedUsers: formData.expectedUsers ? Number(formData.expectedUsers) : undefined,
      });
      setSuccess(true);
      setTimeout(() => navigate(`/projects/${id}`), 1000);
    } catch (err) {
      setError(err.message || 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <LoadingPage message="Loading project…" />;
  if (!formData && error) return (
    <div className="flex flex-col items-center py-20 gap-4">
      <AlertCircle className="w-10 h-10 text-rose-400" />
      <p className="text-slate-300">{error}</p>
      <Button variant="outline" onClick={() => navigate('/projects')}>Back to Projects</Button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate(`/projects/${id}`)}>Back</Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Edit3 className="w-6 h-6 text-[#35D0BA]" />
            Edit Project
          </h1>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-300">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <p className="text-xs text-emerald-300 font-medium">Changes saved! Redirecting…</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Update your project information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Project Name" name="projectName" value={formData.projectName} onChange={handleChange} required disabled={isSaving} id="edit-project-name" />

            <div>
              <label className={labelClass}>Description</label>
              <textarea name="description" rows="3" value={formData.description} onChange={handleChange} disabled={isSaving}
                className="w-full bg-slate-950/70 text-slate-100 text-sm rounded-lg border border-slate-800 p-3 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#35D0BA]/20 focus:border-[#35D0BA] resize-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Application Type</label>
                <select name="applicationType" value={formData.applicationType} onChange={handleChange} disabled={isSaving} className={selectClass}>
                  {APPLICATION_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Priority</label>
                <select name="priority" value={formData.priority} onChange={handleChange} disabled={isSaving} className={selectClass}>
                  {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Budget Range</label>
                <select name="budget" value={formData.budget} onChange={handleChange} disabled={isSaving} className={selectClass}>
                  {BUDGETS.map((b) => <option key={b} value={b}>{b || '— Select —'}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Expected Traffic</label>
                <select name="expectedTraffic" value={formData.expectedTraffic} onChange={handleChange} disabled={isSaving} className={selectClass}>
                  {TRAFFIC_LEVELS.map((t) => <option key={t} value={t}>{t || '— Select —'}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select name="status" value={formData.status} onChange={handleChange} disabled={isSaving} className={selectClass}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <Input label="Expected Users" name="expectedUsers" type="number" value={formData.expectedUsers} onChange={handleChange} disabled={isSaving} id="edit-expected-users" />

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
              <Button variant="outline" onClick={() => navigate(`/projects/${id}`)} disabled={isSaving}>Cancel</Button>
              <Button type="submit" variant="primary" icon={Save} isLoading={isSaving} disabled={isSaving} id="save-project">
                {isSaving ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProjectPage;
