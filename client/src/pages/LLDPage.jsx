import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Code, ArrowLeft, RefreshCw, AlertCircle, Database, Lock, Server, Layers, Cpu } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import { LoadingPage } from '../components/common/Loading';
import WorkflowNav from '../components/common/WorkflowNav';
import { designService } from '../services/designService.js';
import { projectService } from '../services/projectService.js';

const METHOD_COLORS = {
  GET: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  POST: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  PUT: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  DELETE: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
};

const LLDPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState('');
  const [lld, setLld] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [projRes, lldRes] = await Promise.all([
        projectService.getProjectById(id),
        designService.getLLD(id),
      ]);
      setProjectName(projRes.project.projectName);
      if (lldRes.lld) {
        setLld(lldRes.lld);
      }
    } catch (err) {
      setError(err.message || 'Failed to load LLD data.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const res = await designService.generateLLD(id);
      setLld(res.lld);
    } catch (err) {
      setError(err.message || 'Failed to generate LLD.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <LoadingPage message="Loading Low-Level Design..." />;

  return (
    <div className="space-y-6 max-w-4xl py-2">
      <WorkflowNav
        projectId={id}
        projectName={projectName}
        activeStage={6}
        completedStages={{ 1: true, 2: true, 3: true, 4: true, 5: true, 6: Boolean(lld) }}
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate(`/projects/${id}`)}>Back</Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Code className="w-6 h-6 text-[#35D0BA]" />
              Low-Level Design (LLD)
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
          {generating ? 'Generating LLD…' : lld ? 'Regenerate LLD' : 'Generate LLD'}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}

      {!lld && !error && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
          <div className="w-16 h-16 rounded-xl bg-[#35D0BA]/10 border border-[#35D0BA]/20 flex items-center justify-center text-[#35D0BA]">
            <Code className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-slate-200 font-semibold">No LLD Generated Yet</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              Generate detailed API specifications, database entities, field constraints, relationships, authentication sequences, and controller interfaces.
            </p>
          </div>
          <Button variant="primary" icon={Code} onClick={handleGenerate} isLoading={generating}>
            Generate Low-Level Design
          </Button>
        </div>
      )}

      {lld && (
        <div className="space-y-6">
          {/* API Endpoints */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Server className="w-4 h-4 text-[#35D0BA]" /> API Endpoints Specification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lld.apiEndpoints?.map((ep, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-bold border ${METHOD_COLORS[ep.method] || 'bg-slate-800 text-slate-300'}`}>
                        {ep.method}
                      </span>
                      <span className="text-[#35D0BA]">{ep.path}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 font-sans">
                      <span className="hidden md:inline">{ep.description}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${ep.access === 'Public' ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-[#6FA8C9]/10 text-[#6FA8C9] border-[#6FA8C9]/25'}`}>
                        {ep.access}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Database Entities & Schemas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="w-4 h-4 text-[#35D0BA]" /> Database Entities & Attributes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lld.databaseEntities?.map((entity) => (
                <div key={entity.name} className="border border-slate-800 rounded-xl p-4 bg-slate-950/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-sm text-slate-200">{entity.name}</span>
                    <span className="text-xs font-mono text-slate-500">Table / Collection: {entity.tableName}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-slate-300">
                      <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="p-2">Attribute</th>
                          <th className="p-2">Data Type</th>
                          <th className="p-2">Constraint / Index</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {entity.attributes?.map((attr) => (
                          <tr key={attr.field}>
                            <td className="p-2 text-[#35D0BA]">{attr.field}</td>
                            <td className="p-2 text-emerald-300">{attr.type}</td>
                            <td className="p-2 text-slate-400 font-sans">{attr.constraint}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Authentication Sequence */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" /> Authentication & Token Flow Sequence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lld.authenticationSequence?.map((step, i) => (
                  <div key={i} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-300 font-mono">
                    {step}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LLDPage;
