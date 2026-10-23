import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileSpreadsheet, Plus, Calendar, ChevronRight, FileText, FolderKanban } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { SkeletonCard } from '../components/common/Loading';
import { projectService } from '../services/projectService.js';

const ReportsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await projectService.getProjects();
        setProjects(data.projects || []);
      } catch (err) {
        setError(err.message || 'Failed to load projects for reports.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-[#35D0BA]" />
            Architecture Reports Hub
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Access, view, and export full 23-section architecture specification documents for your projects.
          </p>
        </div>
        <Link to="/create-project">
          <Button variant="primary" size="sm" icon={Plus}>New Project</Button>
        </Link>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((n) => <SkeletonCard key={n} />)}
        </div>
      )}

      {!loading && error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm">{error}</div>
      )}

      {!loading && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 space-y-3 text-center">
          <FolderKanban className="w-12 h-12 text-slate-600" />
          <h3 className="text-slate-200 font-semibold">No Projects Created Yet</h3>
          <p className="text-sm text-slate-500 max-w-xs">
            Create a project and complete the pipeline steps to generate full architecture reports.
          </p>
          <Link to="/create-project">
            <Button variant="primary" icon={Plus}>Create Project</Button>
          </Link>
        </div>
      )}

      {!loading && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <Card key={project.projectId} hover={true} className="flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono text-[#35D0BA] bg-[#35D0BA]/10 px-2 py-0.5 rounded border border-[#35D0BA]/20">
                    {project.applicationType}
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-100">{project.projectName}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {project.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-800">
                <span className="text-xs text-slate-400 font-mono">
                  Status: <strong className="text-slate-300 font-sans">{project.status}</strong>
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  icon={FileText}
                  onClick={() => navigate(`/projects/${project.projectId}/report`)}
                >
                  View 23-Section Report
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
