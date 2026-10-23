import React, { useState, useEffect } from 'react';
import { Database, Search, ChevronDown, ChevronRight, Star, TrendingUp, Shield, DollarSign, Zap, BarChart3 } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import { LoadingSpinner } from '../components/common/Loading';
import { technologyService } from '../services/technologyService.js';

const CATEGORIES = ['All', 'Frontend', 'Backend', 'Database', 'Cache', 'Cloud', 'DevOps', 'Storage', 'Authentication', 'Messaging', 'Monitoring'];

const CAT_COLORS = {
  Frontend: 'bg-[#6FA8C9]/10 text-[#6FA8C9] border-[#6FA8C9]/20',
  Backend: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Database: 'bg-[#35D0BA]/10 text-[#35D0BA] border-[#35D0BA]/20',
  Cache: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Cloud: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  DevOps: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Storage: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  Authentication: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Messaging: 'bg-[#36BFC7]/10 text-[#36BFC7] border-[#36BFC7]/20',
  Monitoring: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const ScoreBar = ({ label, value, icon: Icon, color = 'teal' }) => {
  const pct = (value / 10) * 100;
  const gradients = {
    teal: 'from-[#28A899] to-[#35D0BA]',
    cyan: 'from-[#35D0BA] to-[#36BFC7]',
    emerald: 'from-emerald-500 to-teal-400',
    amber: 'from-amber-500 to-orange-400',
    rose: 'from-rose-500 to-pink-500',
    sky: 'from-[#6FA8C9] to-sky-400',
  };
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="flex items-center gap-1 text-slate-400">{Icon && <Icon className="w-3 h-3" />}{label}</span>
        <span className="text-slate-300 font-mono text-[10px]">{value}/10</span>
      </div>
      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${gradients[color] || gradients.teal} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const TechCard = ({ tech }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card hover={true} className="overflow-hidden">
      <div className="flex items-start justify-between gap-3 cursor-pointer" onClick={() => setExpanded((e) => !e)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${CAT_COLORS[tech.category] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
              {tech.category}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-amber-400">
              <Star className="w-3 h-3 fill-amber-400" />{tech.popularityScore}/10
            </span>
          </div>
          <h3 className="text-sm font-semibold text-slate-100">{tech.name}</h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{tech.description}</p>
        </div>
        <button className="text-slate-500 shrink-0 mt-1">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Score bars */}
      <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-2.5">
        <ScoreBar label="Scalability" value={tech.scalabilityScore} icon={TrendingUp} color="teal" />
        <ScoreBar label="Performance" value={tech.performanceScore} icon={Zap} color="emerald" />
        <ScoreBar label="Cost Efficiency" value={tech.costScore} icon={DollarSign} color="amber" />
        <ScoreBar label="Security" value={tech.securityScore} icon={Shield} color="rose" />
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-4 animate-fade-in">
          {tech.strengths?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2">Strengths</p>
              <ul className="space-y-1">{tech.strengths.map((s, i) => <li key={i} className="text-xs text-slate-400">• {s}</li>)}</ul>
            </div>
          )}
          {tech.weaknesses?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-2">Weaknesses</p>
              <ul className="space-y-1">{tech.weaknesses.map((w, i) => <li key={i} className="text-xs text-slate-400">• {w}</li>)}</ul>
            </div>
          )}
          {tech.useCases?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-[#35D0BA] uppercase tracking-wider mb-2">Use Cases</p>
              <div className="flex flex-wrap gap-1.5">
                {tech.useCases.map((u, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[#35D0BA]/10 text-[#35D0BA] border border-[#35D0BA]/20">{u}</span>
                ))}
              </div>
            </div>
          )}
          {tech.recommendedFor?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Recommended For</p>
              <ul className="space-y-1">{tech.recommendedFor.map((r, i) => <li key={i} className="text-xs text-slate-400">• {r}</li>)}</ul>
            </div>
          )}
          {tech.notRecommendedFor?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Not Recommended For</p>
              <ul className="space-y-1">{tech.notRecommendedFor.map((r, i) => <li key={i} className="text-xs text-slate-400">• {r}</li>)}</ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

const TechnologiesPage = () => {
  const [technologies, setTechnologies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const load = async (category, search) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (category !== 'All') params.category = category;
      if (search) params.search = search;
      const data = await technologyService.getTechnologies(params);
      setTechnologies(data.technologies || []);
    } catch (err) {
      setError(err.message || 'Failed to load technologies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(activeCategory, searchQuery); }, [activeCategory, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-[#35D0BA]" />Technology Knowledge Base
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {technologies.length} technologies across {CATEGORIES.length - 1} categories.
          </p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search technologies…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#35D0BA]/20 focus:border-[#35D0BA] w-52"
              id="tech-search"
            />
          </div>
          <Button type="submit" variant="outline" size="sm">Search</Button>
          {searchQuery && (
            <Button variant="ghost" size="sm" onClick={() => { setSearchInput(''); setSearchQuery(''); }}>Clear</Button>
          )}
        </form>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            id={`cat-${cat.toLowerCase()}`}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
              activeCategory === cat
                ? 'bg-gradient-to-r from-[#28A899] to-[#35D0BA] text-[#0B0D0F] font-semibold shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner text="Loading technologies…" />
        </div>
      )}

      {!loading && error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs sm:text-sm">{error}</div>
      )}

      {!loading && !error && technologies.length === 0 && (
        <div className="flex flex-col items-center py-16 space-y-3 text-center">
          <Database className="w-10 h-10 text-slate-600" />
          <p className="text-slate-400 font-medium">No technologies found</p>
          <p className="text-xs text-slate-600">
            {searchQuery ? 'Try a different search term.' : 'Run node seed/techSeeder.js to populate the knowledge base.'}
          </p>
        </div>
      )}

      {!loading && technologies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {technologies.map((tech) => <TechCard key={tech.techId || tech.name} tech={tech} />)}
        </div>
      )}
    </div>
  );
};

export default TechnologiesPage;
