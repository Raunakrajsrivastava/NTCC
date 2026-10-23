import React, { useState } from 'react';
import { Layers, Server, Database, Lock, Cloud, ShieldCheck, Zap, GitBranch, FileCode, Sparkles} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';

const ArchitecturePage = () => {const [activeTab, setActiveTab] = useState('Overview');

  const categories = [
    { name: 'Overview', icon: Layers },
    { name: 'Frontend', icon: Server },
    { name: 'Backend', icon: Zap },
    { name: 'Database', icon: Database },
    { name: 'Auth', icon: Lock },
    { name: 'Deployment', icon: Cloud },
    { name: 'Security', icon: ShieldCheck },
    { name: 'Scalability', icon: Sparkles },
    { name: 'HLD & LLD', icon: GitBranch },
    { name: 'API Design', icon: FileCode },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Layers className="w-6 h-6 text-[#35D0BA]" />
          <span>Software Architecture Blueprint</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Explainable AI recommendations across 12 full-stack architectural dimensions.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 border-b border-slate-800 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeTab === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => setActiveTab(cat.name)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#28A899] to-[#35D0BA] text-[#0B0D0F] font-semibold shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Showcase Card */}
      <Card>
        <CardHeader>
          <CardTitle>{activeTab} Recommendation Module</CardTitle>
          <CardDescription>AI architecture generation pipeline placeholder for Module 2 & 3</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center bg-slate-950/60 border border-dashed border-slate-800 rounded-xl space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#35D0BA]/10 border border-[#35D0BA]/20 text-[#35D0BA] flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-200">
              {activeTab} Recommendations & Tradeoff Analysis
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              In subsequent modules, this section will render detailed AI-generated recommendations, HLD/LLD diagrams, API contracts, schema structures, and cost/performance tradeoffs.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ArchitecturePage;
