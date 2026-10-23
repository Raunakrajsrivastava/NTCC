import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Cpu, Sparkles, AlertCircle, CheckCircle2,
  FolderPlus, ArrowLeft
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { projectService } from '../services/projectService.js';

const APPLICATION_TYPES = ['Web App', 'Mobile App', 'API Service', 'Microservices', 'Monolith', 'Desktop App', 'Other'];
const BUDGETS = ['', '< $5k', '$5k–$25k', '$25k–$100k', '$100k+'];
const TRAFFIC_LEVELS = ['', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const selectClass = 'w-full bg-slate-950/70 text-slate-100 text-sm rounded-lg border border-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#35D0BA]/20 focus:border-[#35D0BA]';
const labelClass = 'text-xs font-medium text-slate-300 block mb-1.5';

const CreateProjectPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const preselectedType = new URLSearchParams(location.search).get('type') || 'Web App';
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    applicationType: APPLICATION_TYPES.includes(preselectedType) ? preselectedType : 'Web App',
    budget: '',
    expectedUsers: '',
    expectedTraffic: '',
    priority: 'Medium',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.projectName.trim()) { setError('Project name is required.'); return; }
    if (formData.projectName.trim().length < 3) { setError('Project name must be at least 3 characters.'); return; }

    setIsLoading(true);
    setError('');
    try {
      const payload = {
        ...formData,
        expectedUsers: formData.expectedUsers ? Number(formData.expectedUsers) : undefined,
      };
      const data = await projectService.createProject(payload);
      setSuccess(true);
      setTimeout(() => navigate(`/projects/${data.project.projectId}`), 1200);
    } catch (err) {
      setError(err.message || 'Failed to create project.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/projects')}>
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FolderPlus className="w-6 h-6 text-[#35D0BA]" />
            New Project
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Define your project details. You'll collect detailed requirements next.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-300 font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-xs text-emerald-300 font-medium">Project created! Redirecting…</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
          <CardDescription>Basic information about your software architecture project</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Project Name"
              name="projectName"
              placeholder="e.g. Realtime Fintech Platform"
              value={formData.projectName}
              onChange={handleChange}
              required
              disabled={isLoading}
              helperText="Give your project a descriptive name (min. 3 characters)."
              id="project-name"
            />

            <div>
              <label className={labelClass}>Description</label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Brief description of what this system does…"
                className="w-full bg-slate-950/70 text-slate-100 text-sm rounded-lg border border-slate-800 p-3 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#35D0BA]/20 focus:border-[#35D0BA] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Application Type</label>
                <select name="applicationType" value={formData.applicationType} onChange={handleChange} disabled={isLoading} className={selectClass}>
                  {APPLICATION_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Priority</label>
                <select name="priority" value={formData.priority} onChange={handleChange} disabled={isLoading} className={selectClass}>
                  {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Budget Range</label>
                <select name="budget" value={formData.budget} onChange={handleChange} disabled={isLoading} className={selectClass}>
                  {BUDGETS.map((b) => <option key={b} value={b}>{b || '— Select budget —'}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Expected Traffic Level</label>
                <select name="expectedTraffic" value={formData.expectedTraffic} onChange={handleChange} disabled={isLoading} className={selectClass}>
                  {TRAFFIC_LEVELS.map((t) => <option key={t} value={t}>{t || '— Select traffic —'}</option>)}
                </select>
              </div>
            </div>

            <Input
              label="Expected Users (approx.)"
              name="expectedUsers"
              type="number"
              placeholder="e.g. 50000"
              value={formData.expectedUsers}
              onChange={handleChange}
              disabled={isLoading}
              helperText="Estimated total user base."
              id="expected-users"
            />

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
              <Button variant="outline" onClick={() => navigate('/projects')} disabled={isLoading}>Cancel</Button>
              <Button type="submit" variant="primary" icon={Sparkles} isLoading={isLoading} disabled={isLoading} id="create-project-submit">
                {isLoading ? 'Creating…' : 'Create Project'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateProjectPage;
