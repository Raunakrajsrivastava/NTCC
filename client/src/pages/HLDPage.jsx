import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layers, ArrowLeft, RefreshCw, AlertCircle, Server, Database, Shield, Zap, Globe, HardDrive } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import { LoadingPage } from '../components/common/Loading';
import WorkflowNav from '../components/common/WorkflowNav';
import { designService } from '../services/designService.js';
import { projectService } from '../services/projectService.js';

const HLDPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState('');
  const [hld, setHld] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [projRes, hldRes] = await Promise.all([
        projectService.getProjectById(id),
        designService.getHLD(id),
      ]);
      setProjectName(projRes.project.projectName);
      if (hldRes.hld) {
        setHld(hldRes.hld);
      }
    } catch (err) {
      setError(err.message || 'Failed to load HLD data.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const res = await designService.generateHLD(id);
      setHld(res.hld);
    } catch (err) {
      setError(err.message || 'Failed to generate HLD.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <LoadingPage message="Loading High-Level Design..." />;

  return (
    <div className="space-y-6 max-w-4xl py-2">
      <WorkflowNav
        projectId={id}
        projectName={projectName}
        activeStage={5}
        completedStages={{ 1: true, 2: true, 3: true, 4: true, 5: Boolean(hld) }}
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate(`/projects/${id}`)}>Back</Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-6 h-6 text-[#35D0BA]" />
              High-Level Design (HLD)
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
          {generating ? 'Generating HLD…' : hld ? 'Regenerate HLD' : 'Generate HLD'}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}

      {!hld && !error && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
          <div className="w-16 h-16 rounded-xl bg-[#35D0BA]/10 border border-[#35D0BA]/20 flex items-center justify-center text-[#35D0BA]">
            <Layers className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-slate-200 font-semibold">No HLD Generated Yet</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              Generate a structured 9-tier High-Level Design covering client, frontend, gateway, services, database, caching, storage, and deployment.
            </p>
          </div>
          <Button variant="primary" icon={Layers} onClick={handleGenerate} isLoading={generating}>
            Generate High-Level Design
          </Button>
        </div>
      )}

      {hld && (
        <div className="space-y-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">System Overview & Pattern</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                  <span className="text-slate-500 block uppercase tracking-wider text-[10px]">Architectural Pattern</span>
                  <span className="font-semibold text-[#35D0BA] text-sm">{hld.overview?.architecturalPattern}</span>
                </div>
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                  <span className="text-slate-500 block uppercase tracking-wider text-[10px]">Target Scale</span>
                  <span className="font-semibold text-slate-200 text-sm">{hld.overview?.targetScale}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tiers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client Tier */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#35D0BA]" /> Client Tier
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-slate-300">
                <p><strong className="text-slate-400">Protocol:</strong> {hld.clientTier?.communicationProtocol}</p>
                <div>
                  <strong className="text-slate-400 block mb-1">Supported Clients:</strong>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {hld.clientTier?.supportedClients?.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Frontend Tier */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" /> Frontend Tier
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-slate-300">
                <p><strong className="text-slate-400">Technology:</strong> {hld.frontendTier?.technology}</p>
                <p><strong className="text-slate-400">Strategy:</strong> {hld.frontendTier?.renderingStrategy}</p>
                <p><strong className="text-slate-400">State:</strong> {hld.frontendTier?.stateManagement}</p>
                <p><strong className="text-slate-400">CDN:</strong> {hld.frontendTier?.cdnDistribution}</p>
              </CardContent>
            </Card>

            {/* Backend Tier */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Server className="w-4 h-4 text-sky-400" /> Backend Tier
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-slate-300">
                <p><strong className="text-slate-400">Technology:</strong> {hld.backendTier?.technology}</p>
                <p><strong className="text-slate-400">Concurrency:</strong> {hld.backendTier?.concurrencyModel}</p>
                <div>
                  <strong className="text-slate-400 block mb-1">Key Modules:</strong>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {hld.backendTier?.keyModules?.map((m, i) => <li key={i}>{m}</li>)}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Database Layer */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#35D0BA]" /> Database Tier
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-slate-300">
                <p><strong className="text-slate-400">Technology:</strong> {hld.databaseLayer?.technology}</p>
                <p><strong className="text-slate-400">Type:</strong> {hld.databaseLayer?.databaseType}</p>
                <p><strong className="text-slate-400">Replication:</strong> {hld.databaseLayer?.replicationStrategy}</p>
                <p><strong className="text-slate-400">Backups:</strong> {hld.databaseLayer?.backupPolicy}</p>
              </CardContent>
            </Card>

            {/* Caching & Storage */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" /> Cache & Storage Tiers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-slate-300">
                <p><strong className="text-slate-400">Cache Tech:</strong> {hld.cachingLayer?.technology}</p>
                <p><strong className="text-slate-400">Storage Tech:</strong> {hld.storageLayer?.technology}</p>
              </CardContent>
            </Card>

            {/* Deployment & DevOps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-rose-400" /> Deployment & DevOps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-slate-300">
                <p><strong className="text-slate-400">Cloud Provider:</strong> {hld.deploymentArchitecture?.cloudProvider}</p>
                <p><strong className="text-slate-400">Containers:</strong> {hld.deploymentArchitecture?.containerization}</p>
                <p><strong className="text-slate-400">CI/CD:</strong> {hld.deploymentArchitecture?.ciCdPipeline}</p>
                <p><strong className="text-slate-400">Monitoring:</strong> {hld.deploymentArchitecture?.monitoring}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default HLDPage;
