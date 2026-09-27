import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  UploadCloud,
  Play,
  ChevronDown,
  Loader2,
  Menu,
  X,
  Plus,
  ShieldCheck,
  FolderOpen,
  Activity
} from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import { useAuth } from '../../context/AuthContext';
import UploadModal from '../modals/UploadModal';
import AnalysisModal from '../modals/AnalysisModal';
import CreateCaseModal from '../modals/CreateCaseModal';

export default function Header({ onMenuToggle, mobileNavOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    cases,
    currentCaseId,
    currentCase,
    caseStats,
    selectCase,
    runAnalysis,
    isAnalyzing,
    analysisResult,
    triggerRefresh
  } = useInvestigation();
  const { user } = useAuth();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCaseChange = (e) => {
    const selected = e.target.value;
    if (selected === '__NEW__') {
      setIsNewCaseOpen(true);
      return;
    }
    selectCase(selected);
    const pathParts = location.pathname.split('/');
    const subview = pathParts[3] || 'risk';
    navigate(`/cases/${encodeURIComponent(selected)}/${subview}`);
  };

  const handleTriggerAnalysis = async () => {
    if (!currentCaseId || isAnalyzing) return;
    setAnalysisError(null);
    setIsAnalysisModalOpen(true);
    try {
      await runAnalysis(currentCaseId);
    } catch (err) {
      setAnalysisError(err.message || 'Analysis pipeline failed');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim() || !currentCaseId) return;
    navigate(`/cases/${encodeURIComponent(currentCaseId)}/entities?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  // Derive readable breadcrumb from route
  const getBreadcrumb = () => {
    const p = location.pathname;
    if (p.startsWith('/dashboard')) return 'System Dashboard';
    if (p === '/cases') return 'Investigations Registry';
    if (p.includes('/risk')) return 'Risk Analysis';
    if (p.includes('/evidence')) return 'Evidence Files';
    if (p.includes('/entities')) return 'Extracted Entities';
    if (p.includes('/relationships')) return 'Relationships & Links';
    if (p.includes('/graph')) return 'Investigation Graph';
    if (p.includes('/timeline')) return 'Event Timeline';
    if (p.includes('/integrity')) return 'Chain of Custody';
    if (p.includes('/report')) return 'Forensic Report';
    return 'Investigation';
  };

  return (
    <>
      <header className="h-16 border-b border-slate-200/90 bg-white sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        {/* Left Section: Mobile trigger & Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={onMenuToggle}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 lg:hidden shrink-0"
            aria-label="Open navigation menu"
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:inline">
              SanketAI
            </span>
            <span className="text-slate-300 hidden sm:inline">/</span>
            <span className="text-xs font-bold text-slate-900 truncate">
              {getBreadcrumb()}
            </span>
            {currentCaseId && (
              <span className="hidden md:inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60 truncate">
                <FolderOpen className="w-3 h-3 shrink-0" />
                {currentCaseId}
              </span>
            )}
          </div>
        </div>

        {/* Center / Right Section */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Active Case Selector */}
          <div className="relative hidden md:block">
            <select
              value={currentCaseId || ''}
              onChange={handleCaseChange}
              className="appearance-none truncate rounded-lg border border-slate-200 bg-slate-50/80 py-1.5 pl-3 pr-8 text-xs font-mono font-semibold text-slate-800 hover:bg-slate-100/70 focus:border-blue-500 focus:bg-white focus:outline-none max-w-[200px] lg:max-w-[240px] cursor-pointer shadow-sm transition-colors"
            >
              <option value="" disabled>-- Select Active Case --</option>
              {cases.map((c) => (
                <option key={c.id} value={c.case_number}>
                  {c.case_number} — {c.title}
                </option>
              ))}
              <option value="__NEW__">+ New Investigation Case</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Quick Entity Search (visible if in case) */}
          {currentCaseId && (
            <form onSubmit={handleSearchSubmit} className="relative hidden xl:block w-48 lg:w-56">
              <input
                type="text"
                placeholder="Search entities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50/80 py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none shadow-sm transition-colors"
              />
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </form>
          )}

          {/* Upload Button */}
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            disabled={!currentCaseId}
            title={!currentCaseId ? 'Select or create a case first' : 'Upload forensic files'}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <UploadCloud className="h-4 w-4 text-blue-600" />
            <span className="hidden sm:inline">Upload</span>
          </button>

          {/* Run Analysis Button */}
          <button
            type="button"
            onClick={handleTriggerAnalysis}
            disabled={!currentCaseId || isAnalyzing || !(caseStats?.files_count > 0)}
            title={
              !currentCaseId
                ? 'Select or create a case first'
                : !(caseStats?.files_count > 0)
                  ? 'Upload evidence files before running analysis'
                  : 'Execute full forensic correlation & pattern analysis'
            }
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Correlating...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Run Analysis</span>
              </>
            )}
          </button>

          {/* Engine Status Pulse */}
          <div className="hidden 2xl:flex items-center gap-1.5 pl-2 border-l border-slate-200 text-[11px] text-slate-500 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Engine Ready</span>
          </div>
        </div>
      </header>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        caseId={currentCaseId}
        onUploadSuccess={() => {
          triggerRefresh();
        }}
      />

      <AnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        isAnalyzing={isAnalyzing}
        result={analysisResult}
        error={analysisError}
        caseId={currentCaseId}
      />

      <CreateCaseModal
        isOpen={isNewCaseOpen}
        onClose={() => setIsNewCaseOpen(false)}
        onCreated={(newCase) => {
          triggerRefresh();
          selectCase(newCase.case_number);
          navigate(`/cases/${encodeURIComponent(newCase.case_number)}/risk`);
        }}
      />
    </>
  );
}
