import React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  FileCheck2,
  ShieldAlert,
  Users,
  Share2,
  Network,
  Clock,
  ShieldCheck,
  FileSpreadsheet,
  ArrowRight,
  Play,
  Calendar,
  Layers,
  FolderOpen
} from 'lucide-react';
import { useInvestigation } from '../context/InvestigationContext.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import StatCard from '../components/common/StatCard.jsx';
import StatusBanner from '../components/common/StatusBanner.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { deriveInvestigationState } from '../utils/investigationState.js';
import { formatDate } from '../utils/formatters.js';

export default function CaseWorkspacePage() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { currentCase, caseStats, isAnalyzing, runAnalysis } = useInvestigation();

  const state = deriveInvestigationState({
    currentCase,
    stats: caseStats,
    isAnalyzing,
  });

  if (!currentCase) {
    return <LoadingSpinner text="Accessing case file from SanketAI vault..." />;
  }

  const go = (sub) => navigate(`/cases/${encodeURIComponent(caseId)}/${sub}`);

  const tabs = [
    { name: 'Overview', path: '', active: true },
    { name: 'Risk Analysis', path: 'risk' },
    { name: 'Evidence Files', path: 'evidence' },
    { name: 'Entities', path: 'entities' },
    { name: 'Relationships', path: 'relationships' },
    { name: 'Network Graph', path: 'graph' },
    { name: 'Timeline', path: 'timeline' },
    { name: 'Chain of Custody', path: 'integrity' },
    { name: 'Judicial Report', path: 'report' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <PageHeader
        title={currentCase.title}
        subtitle="Unified Case Workspace — All forensic metrics, entities, and graph topologies are loaded from the SanketAI engine."
        badge={currentCase.case_number}
        badgeType="info"
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => runAnalysis(caseId)}
              disabled={isAnalyzing || !(caseStats?.files_count > 0)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isAnalyzing ? 'Correlating...' : 'Run Forensic Correlation'}</span>
            </button>
            <button
              type="button"
              onClick={() => go('risk')}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              Open Risk Matrix →
            </button>
          </div>
        }
      />

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-slate-200">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => go(tab.path)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              tab.active
                ? 'bg-blue-50 text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Status Banner */}
      <StatusBanner state={state} />

      {/* Case Meta Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
            Case Number
          </div>
          <div className="font-mono font-bold text-sm text-slate-900 mt-1">
            {currentCase.case_number}
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
            Docket Status
          </div>
          <div className="font-semibold text-sm text-slate-900 mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{currentCase.status || 'ACTIVE'}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
            Date Opened
          </div>
          <div className="font-mono text-xs text-slate-700 mt-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatDate(currentCase.created_at)}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
            Last Modified
          </div>
          <div className="font-mono text-xs text-slate-700 mt-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatDate(currentCase.updated_at)}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      {currentCase.description && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-1.5">
            Case Narrative & Objectives
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {currentCase.description}
          </p>
        </div>
      )}

      {/* Forensic Intelligence Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Raw Ingested Records"
          value={caseStats?.raw_records ?? 0}
          icon={FileCheck2}
          accent="blue"
          subtitle="Transactions, communications & logs"
        />
        <StatCard
          title="Identified Entities"
          value={caseStats?.entities_count ?? 0}
          icon={Users}
          accent="indigo"
          subtitle="Bank accounts, phones, IPs, VPAs"
        />
        <StatCard
          title="Correlated Relationships"
          value={caseStats?.relationships_count ?? 0}
          icon={Share2}
          accent="blue"
          subtitle="Cross-evidence topological links"
        />
        <StatCard
          title="High Risk Suspects"
          value={caseStats?.high_risk_count ?? 0}
          icon={ShieldAlert}
          accent="rose"
          badge={caseStats?.top_suspect ? caseStats.top_suspect.id : null}
          badgeType={caseStats?.top_suspect ? 'critical' : 'default'}
          subtitle={
            caseStats?.top_suspect
              ? `Top target: Score ${caseStats.top_suspect.score}`
              : 'Zero critical suspects flagged'
          }
        />
      </div>

      {/* Quick Jump Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => go('evidence')}
          className="bg-white border border-slate-200/90 hover:border-blue-400 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            Evidence Files
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {caseStats?.files_count || 0} files ingested and hashed
          </p>
        </div>

        <div
          onClick={() => go('graph')}
          className="bg-white border border-slate-200/90 hover:border-indigo-400 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Network className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
            Network Graph
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Interactive ReactFlow topological visualization
          </p>
        </div>

        <div
          onClick={() => go('timeline')}
          className="bg-white border border-slate-200/90 hover:border-cyan-400 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 transition-colors" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">
            Event Timeline
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Chronological multi-device incident progression
          </p>
        </div>

        <div
          onClick={() => go('report')}
          className="bg-white border border-slate-200/90 hover:border-emerald-400 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
            Judicial Dossier
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Export certified Section 65B forensic PDF
          </p>
        </div>
      </div>
    </div>
  );
}
