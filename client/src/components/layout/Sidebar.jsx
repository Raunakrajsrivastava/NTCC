import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home, LayoutDashboard, FolderKanban, Database,
  PlusCircle, FileSpreadsheet, Sparkles,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';

const Sidebar = () => {
  const { isAuthenticated } = useAuth();

  const navItems = [
    { name: 'Home',         path: '/',            icon: Home,          public: true },
    { name: 'Dashboard',    path: '/dashboard',   icon: LayoutDashboard, public: false },
    { name: 'Projects',     path: '/projects',    icon: FolderKanban,  public: false },
    { name: 'Reports Hub',  path: '/reports',     icon: FileSpreadsheet, public: false },
    { name: 'Technologies', path: '/technologies',icon: Database,       public: true },
  ];

  const visibleItems = navItems.filter((i) => i.public || isAuthenticated);

  return (
    <aside className="w-56 shrink-0 min-h-[calc(100vh-3.5rem)] border-r border-slate-800 bg-slate-950/60 backdrop-blur-sm flex flex-col justify-between">
      <div className="p-3 space-y-5 pt-4">

        {/* Navigation */}
        <div>
          <p className="px-3 mb-2 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Navigation
          </p>
          <nav className="space-y-0.5">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 group ${
                      isActive
                        ? 'nav-active'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                        isActive ? 'text-[#35D0BA]' : 'text-slate-500 group-hover:text-slate-300'
                      }`} />
                      <span>{item.name}</span>
                      {isActive && (
                        <span className="ml-auto w-1 h-1 rounded-full bg-[#35D0BA]" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Quick Action */}
        {isAuthenticated && (
          <div>
            <p className="px-3 mb-2 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Quick Action
            </p>
            <NavLink
              to="/create-project"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#28A899] to-[#35D0BA] text-[#0B0D0F] font-semibold shadow-sm'
                    : 'bg-[#35D0BA]/10 text-[#35D0BA] border border-[#35D0BA]/25 hover:bg-[#35D0BA]/15 hover:border-[#35D0BA]/40'
                }`
              }
            >
              <PlusCircle className="w-3.5 h-3.5 shrink-0" />
              <span>New Project</span>
            </NavLink>
          </div>
        )}
      </div>

      {/* Footer Badge */}
      <div className="p-3 border-t border-slate-800">
        <div className="px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3 h-3 text-[#35D0BA]" />
            <span className="text-[10px] font-bold text-slate-200 tracking-wide">M1–M12 Complete</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-snug">
            AI Architecture Advisor
          </p>
          <div className="mt-2 h-1 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full w-[97%] rounded-full bg-gradient-to-r from-[#28A899] to-[#35D0BA]" />
          </div>
          <p className="text-[9px] text-slate-500 mt-1 text-right font-mono">97% Complete</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
