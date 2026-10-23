import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FolderKanban, Plus, Calendar, ChevronRight, Trash2, Edit3,
  AlertCircle, FolderOpen, Clock, Zap, BarChart3
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { SkeletonCard } from '../components/common/Loading';
import { projectService } from '../services/projectService.js';

const STATUS_STYLES = {
  'Draft':                   'bg-slate-700/40 text-slate-400 border-slate-700',
  'Requirements Collected':  'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'Analysis Complete':       'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'Architecture Generated':  'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
};

const PRIORITY_DOT = { Low: 'bg-slate-400', Medium: 'bg-amber-400', High: 'bg-orange-400', Critical: 'bg-rose-500' };

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectService.getProjects();
      setProjects(data.projects || []);
    } catch (err) {
      setError(err.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProjects(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await projectService.deleteProject(deleteTarget.projectId);
      setProjects((prev) => prev.filter((p) => p.projectId !== deleteTarget.projectId));
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message || 'Failed to delete project.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-[#35D0BA]" />
            Architecture Projects
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your software architecture specifications and AI recommendations.
          </p>
        </div>
        <Link to="/create-project">
          <Button variant="primary" size="sm" icon={Plus}>New Project</Button>
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => <SkeletonCard key={n} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
          <div className="w-16 h-16 rounded-xl bg-[#35D0BA]/10 border border-[#35D0BA]/20 flex items-center justify-center text-[#35D0BA]">
            <FolderOpen className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-slate-200 font-semibold">No projects yet</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-xs">
              Create your first architecture project to start collecting requirements and generating recommendations.
            </p>
          </div>
          <Link to="/create-project">
            <Button variant="primary" icon={Plus}>Create First Project</Button>
          </Link>
        </div>
      )}

      {/* Project grid */}
      {!loading && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <Card key={project.projectId} hover={true} className="flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${STATUS_STYLES[project.status] || STATUS_STYLES['Draft']}`}>
                      {project.status}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-500">
                      <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[project.priority] || 'bg-slate-400'}`} />
                      {project.priority}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-100 truncate">{project.projectName}</h3>
                  {project.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{project.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-4">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />{project.applicationType || 'Web App'}
                </span>
                {project.expectedTraffic && (
                  <span className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />{project.expectedTraffic} traffic
                  </span>
                )}
                <span className="flex items-center gap-1 ml-auto">
                  <Clock className="w-3 h-3" />{formatDate(project.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800 mt-auto">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Edit3}
                    onClick={() => navigate(`/projects/${project.projectId}/edit`)}
                    title="Edit project"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => setDeleteTarget(project)}
                    title="Delete project"
                    className="hover:text-rose-400 hover:bg-rose-500/10"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  icon={ChevronRight}
                  onClick={() => navigate(`/projects/${project.projectId}`)}
                >
                  Open
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Project"
        description="This action cannot be undone."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" size="sm" isLoading={isDeleting} onClick={handleDelete}>
              Delete Project
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-300">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-white">"{deleteTarget?.projectName}"</span>?
          All requirements and recommendations will be permanently removed.
        </p>
      </Modal>
    </div>
  );
};

export default ProjectsPage;
