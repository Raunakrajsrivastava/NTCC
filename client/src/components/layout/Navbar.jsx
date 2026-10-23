import React, { useState, useEffect, useRef } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Cpu, User, Plus, LogOut, ChevronDown, Moon, Sun, Zap } from 'lucide-react';
import { fetchHealthStatus } from '../../services/healthService';
import { useAuth } from '../../hooks/useAuth.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import Button from '../common/Button';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [healthStatus, setHealthStatus] = useState({ loading: true, online: false });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const check = async () => {
      try {
        await fetchHealthStatus();
        if (isMounted) setHealthStatus({ loading: false, online: true });
      } catch {
        if (isMounted) setHealthStatus({ loading: false, online: false });
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-xl">
      {/* Top accent line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#35D0BA]/40 to-transparent" />

      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        {/* ── Brand ── */}
        <div className="flex items-center gap-4">
          <RouterLink to="/" className="flex items-center gap-2.5 group">
            {/* Logo icon */}
            <div className="relative w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shadow-sm group-hover:border-[#35D0BA]/40 group-hover:shadow-sm group-hover:shadow-[#35D0BA]/10 transition-all duration-200">
              <Cpu className="w-4 h-4 text-[#35D0BA]" />
            </div>
            <div>
              <span className="text-sm font-semibold tracking-tight text-slate-100">
                Arch<span className="gradient-text font-bold">Advisor</span>
                <span className="text-slate-500 font-normal">.ai</span>
              </span>
            </div>
          </RouterLink>

          {/* API Status Pill */}
          <div className="hidden md:flex items-center pl-4 border-l border-slate-800">
            <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-medium border backdrop-blur-sm transition-all duration-300 ${
              healthStatus.loading
                ? 'bg-slate-900/60 text-slate-400 border-slate-800'
                : healthStatus.online
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
            }`}>
              <span className={`relative inline-flex w-1.5 h-1.5 rounded-full ${
                healthStatus.loading ? 'bg-slate-500 animate-ping' :
                healthStatus.online ? 'bg-emerald-400' : 'bg-rose-400'
              }`}>
                {healthStatus.online && <span className="pulse-dot absolute w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              </span>
              <span className="font-mono">
                API {healthStatus.loading ? '…' : healthStatus.online ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Right Controls ── */}
        <div className="flex items-center gap-2">

          {/* ── Theme Toggle ── */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-850 text-slate-400 hover:text-slate-200 transition-all duration-150 text-xs cursor-pointer"
          >
            {isDark
              ? <Sun className="w-3.5 h-3.5 text-amber-400" />
              : <Moon className="w-3.5 h-3.5 text-[#35D0BA]" />}
            <span className="hidden sm:inline font-medium">
              {isDark ? 'Light' : 'Dark'}
            </span>
          </button>

          {isAuthenticated ? (
            <>
              <RouterLink to="/create-project">
                <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#28A899] to-[#35D0BA] hover:from-[#35D0BA] hover:to-[#36BFC7] text-[#0B0D0F] transition-all duration-150 shadow-sm hover:shadow-md hover:shadow-[#35D0BA]/15 hover:-translate-y-0.5 cursor-pointer">
                  <Plus className="w-3.5 h-3.5" />
                  New Project
                </button>
              </RouterLink>

              {/* User Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  id="user-menu-btn"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2 pl-2 ml-1 border-l border-slate-800 cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-bold text-[#35D0BA] shadow-sm group-hover:border-[#35D0BA]/40 transition-all">
                    {initials}
                  </div>
                  <span className="hidden sm:block text-xs text-slate-300 max-w-[100px] truncate group-hover:text-white transition-colors">
                    {user?.name}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform duration-150 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl shadow-xl shadow-black/40 overflow-hidden z-50 animate-fade-in">
                    {/* Top teal bar */}
                    <div className="h-0.5 w-full bg-gradient-to-r from-[#28A899] to-[#35D0BA]" />
                    <div className="px-4 py-3 border-b border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-xs font-bold text-[#35D0BA]">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-1.5">
                      <button
                        id="logout-btn"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <RouterLink to="/login">
                <button className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 rounded-lg bg-transparent hover:bg-slate-900 transition-all duration-150 cursor-pointer flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Sign In
                </button>
              </RouterLink>
              <RouterLink to="/register" className="hidden sm:block">
                <button className="px-3 py-1.5 text-xs font-semibold text-[#0B0D0F] rounded-lg bg-gradient-to-r from-[#28A899] to-[#35D0BA] hover:from-[#35D0BA] hover:to-[#36BFC7] transition-all duration-150 shadow-sm hover:shadow-[#35D0BA]/20 cursor-pointer flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Get Started
                </button>
              </RouterLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
