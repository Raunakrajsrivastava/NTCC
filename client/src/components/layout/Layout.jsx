import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
      {/* Aurora background blobs */}
      <div className="aurora" aria-hidden="true">
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
      </div>

      {/* Subtle grid overlay */}
      <div className="fixed inset-0 bg-grid pointer-events-none z-0 opacity-60" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-5 md:p-7 max-w-7xl mx-auto w-full overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
