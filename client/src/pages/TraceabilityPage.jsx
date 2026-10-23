import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText, CheckCircle2, AlertCircle, ArrowLeft, Plus,
  Shield, Layers, ChevronDown, ChevronRight, Clock,
  Check, ArrowRightLeft, Database, Code2
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import { LoadingPage } from '../components/common/Loading';
import WorkflowNav from '../components/common/WorkflowNav';
import { traceabilityService } from '../services/traceabilityService.js';
import { projectService } from '../services/projectService.js';

const STATUS_COLORS = {
  Accepted:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  Proposed:   'bg-amber-500/10 text-amber-400 border-amber-500/30',
  Superseded: 'bg-slate-800 text-slate-400 border-slate-700',
  Rejected:   'bg-rose-500/10 text-rose-400 border-rose-500/30',
};

const TraceabilityPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [data, setData] = useState(null);
  const [adrs, setAdrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix' | 'adrs'
  const [expandedAdr, setExpandedAdr] = useState(null);

  // New ADR form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContext, setNewContext] = useState('');
  const [newRationale, setNewRationale] = useState('');
  const [newStatus, setNewStatus] = useState('Accepted');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [projData, traceData] = await Promise.all([
        projectService.getProjectById(id),
        traceabilityService.get(id),
      ]);
      setProject(projData.project);
      setData(traceData.traceability);
      setAdrs(traceData.adrs || []);
    } catch (err) {
      setError(err.message || 'Failed to load traceability matrix.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateADR = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newRationale.trim()) return;

    setSaving(true);
    setError('');
    try {
      const result = await traceabilityService.createADR(id, {
        title: newTitle.trim(),
        context: newContext.trim(),
        decisionRationale: newRationale.trim(),
        status: newStatus,
      });
      setAdrs([...adrs, result.adr]);
      setShowAddModal(false);
      setNewTitle('');
      setNewContext('');
      setNewRationale('');
    } catch (err) {
      setError(err.message || 'Failed to create ADR.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingPage message="Mapping requirement traceability matrix and ADRs…" />;

  const matrix = data?.matrix || [];

  return (
    <div className="space-y-6 max-w-5xl py-2">
      <WorkflowNav
        projectId={id}
        projectName={project?.projectName}
        activeStage={6}
        completedStages={{ 1: true, 2: true, 3: true, 4: true, 5: true, 6: true }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate(`/projects/${id}`)}>
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#35D0BA]" />
              Requirement Traceability & Architecture Decisions
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Trace requirements (FR / NFR) directly to satisfying components, technologies, and recorded ADR decisions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'adrs' && (
            <Button variant="primary" icon={Plus} size="sm" onClick={() => setShowAddModal(true)}>
              Record Decision (ADR)
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}

      {/* Mode Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'matrix'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Traceability Matrix ({matrix.length})
        </button>
        <button
          onClick={() => setActiveTab('adrs')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'adrs'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" /> Architecture Decision Records ({adrs.length})
        </button>
      </div>

      {/* Tab 1: Traceability Matrix */}
      {activeTab === 'matrix' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#35D0BA]" /> Requirements Satisfaction Matrix
            </CardTitle>
            <CardDescription>
              Demonstrates that every functional and non-functional requirement is satisfied by concrete architecture choices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3 font-semibold">Req ID</th>
                    <th className="p-3 font-semibold">Requirement</th>
                    <th className="p-3 font-semibold">Type</th>
                    <th className="p-3 font-semibold">Satisfying Technologies</th>
                    <th className="p-3 font-semibold">Layer</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold">Verification Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {matrix.map((row) => (
                    <tr key={row.requirementId} className="hover:bg-slate-900/40">
                      <td className="p-3 font-mono font-bold text-teal-400">{row.requirementId}</td>
                      <td className="p-3 font-semibold text-slate-200">{row.title}</td>
                      <td className="p-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                          row.type === 'Functional' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-teal-300'
                        }`}>
                          {row.type}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-300">
                        {row.satisfyingTechnologies.join(', ')}
                      </td>
                      <td className="p-3 text-slate-400">{row.architecturalLayer}</td>
                      <td className="p-3">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                          {row.satisfactionStatus}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 text-[11px] max-w-xs">{row.verificationEvidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Architecture Decision Records (ADRs) */}
      {activeTab === 'adrs' && (
        <div className="space-y-4">
          {adrs.map((adr) => {
            const isExpanded = expandedAdr === adr.id;

            return (
              <Card key={adr.id} className="border-slate-800 hover:border-slate-700 transition-all">
                <button
                  type="button"
                  className="w-full text-left p-4 cursor-pointer"
                  onClick={() => setExpandedAdr(isExpanded ? null : adr.id)}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-teal-400 bg-teal-500/10 px-2 py-1 rounded border border-teal-500/20">
                        {adr.id}
                      </span>
                      <div>
                        <p className="font-semibold text-sm text-slate-100">{adr.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{adr.decisionRationale}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${
                        STATUS_COLORS[adr.status] || STATUS_COLORS.Accepted
                      }`}>
                        {adr.status}
                      </span>
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <CardContent className="pt-0 border-t border-slate-800 space-y-4 mt-2">
                    {adr.context && (
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Context</p>
                        <p className="text-xs text-slate-300">{adr.context}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-1">Decision Rationale</p>
                      <p className="text-xs text-slate-200 font-medium">{adr.decisionRationale}</p>
                    </div>

                    {adr.requirementReferences?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Referenced Requirements</p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {adr.requirementReferences.map((ref) => (
                            <span key={ref} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
                              {ref}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {adr.positiveConsequences?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">Positive Consequences</p>
                        <ul className="text-xs text-slate-400 space-y-1">
                          {adr.positiveConsequences.map((c, i) => <li key={i}>• {c}</li>)}
                        </ul>
                      </div>
                    )}

                    {adr.negativeConsequences?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">Negative Consequences & Trade-Offs</p>
                        <ul className="text-xs text-slate-400 space-y-1">
                          {adr.negativeConsequences.map((c, i) => <li key={i}>• {c}</li>)}
                        </ul>
                      </div>
                    )}

                    {adr.risksAndMitigations && (
                      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                        <span className="font-semibold text-amber-300">Risk & Mitigation: </span>
                        <span className="text-slate-300">{adr.risksAndMitigations}</span>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal to Add New ADR */}
      {showAddModal && (
        <Card className="border-teal-500/30 bg-slate-900/95 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-teal-300">Record Architecture Decision (ADR)</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>Cancel</Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateADR} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Decision Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Migration from Monolith to Event-Driven Microservices"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Context & Problem Statement</label>
                <textarea
                  rows="2"
                  placeholder="Describe the architectural challenge or context requiring a decision..."
                  value={newContext}
                  onChange={(e) => setNewContext(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Decision Rationale *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Explain why this decision was chosen over alternatives..."
                  value={newRationale}
                  onChange={(e) => setNewRationale(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Decision Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                >
                  <option value="Accepted">Accepted</option>
                  <option value="Proposed">Proposed</option>
                  <option value="Superseded">Superseded</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit" isLoading={saving}>Save ADR</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TraceabilityPage;
