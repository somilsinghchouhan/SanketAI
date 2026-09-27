import React, { useEffect, useState } from 'react';
import { Outlet, useParams, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useInvestigation } from '../../context/InvestigationContext';

export default function Shell() {
  const { caseId } = useParams();
  const location = useLocation();
  const { selectCase, currentCaseId } = useInvestigation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (caseId && caseId !== currentCaseId) {
      selectCase(caseId);
    }
  }, [caseId, currentCaseId, selectCase]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  return (
    <div className="h-screen w-screen flex bg-slate-50 font-sans overflow-hidden">
      {/* Desktop Left Sidebar */}
      <div className="hidden lg:flex h-full shrink-0">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((prev) => !prev)}
        />
      </div>

      {/* Mobile Drawer Navigation */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-slate-200 bg-white shadow-2xl transition-transform duration-200 ease-out lg:hidden ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar mobile onNavigate={() => setMobileNavOpen(false)} />
      </div>

      {/* Mobile Backdrop */}
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Close mobile navigation"
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          onMenuToggle={() => setMobileNavOpen((prev) => !prev)}
          mobileNavOpen={mobileNavOpen}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 min-w-0 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
