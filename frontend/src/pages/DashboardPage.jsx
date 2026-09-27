import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  ShieldAlert,
  FileCheck2,
  Users,
  Share2,
  Activity,
  Plus,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  FolderOpen,
  Calendar,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useInvestigation } from '../context/InvestigationContext';
import { caseService } from '../services/caseService';
import StatCard from '../components/common/StatCard';
import PageHeader from '../components/common/PageHeader';
import CreateCaseModal from '../components/modals/CreateCaseModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { formatDate } from '../utils/formatters';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { cases, loadCases, loadingCases, selectCase, currentCaseId } = useInvestigation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [statsAgg, setStatsAgg] = useState({
    totalCases: 0,
    activeCases: 0,
    totalEvidence: 0,
    totalEntities: 0,
    totalRelationships: 0,
    totalHighRisk: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    async function aggregateDashboardStats() {
      if (!cases || cases.length === 0) {
        setStatsAgg({
          totalCases: 0,
          activeCases: 0,
          totalEvidence: 0,
          totalEntities: 0,
          totalRelationships: 0,
          totalHighRisk: 0,
        });
        return;
      }

      setLoadingStats(true);
      try {
        let evidenceCount = 0;
        let entitiesCount = 0;
        let relCount = 0;
        let highRiskCount = 0;

        // Query stats for the recent cases in parallel
        const statsPromises = cases.slice(0, 8).map((c) =>
          caseService.getCaseStats(c.case_number).catch(() => null)
        );
        const results = await Promise.all(statsPromises);

        results.forEach((s) => {
          if (s) {
            evidenceCount += s.files_count || 0;
            entitiesCount += s.entities_count || 0;
            relCount += s.relationships_count || 0;
            highRiskCount += s.high_risk_count || 0;
          }
        });

        const activeCount = cases.filter(
          (c) => String(c.status).toUpperCase() === 'ACTIVE'
        ).length;

        setStatsAgg({
          totalCases: cases.length,
          activeCases: activeCount,
          totalEvidence: evidenceCount,
          totalEntities: entitiesCount,
          totalRelationships: relCount,
          totalHighRisk: highRiskCount,
        });
      } catch (err) {
        console.error('Error calculating dashboard aggregate stats:', err);
      } finally {
        setLoadingStats(false);
      }
    }

    aggregateDashboardStats();
  }, [cases]);

  const handleOpenCase = (caseNumber) => {
    selectCase(caseNumber);
    navigate(`/cases/${encodeURIComponent(caseNumber)}/risk`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <PageHeader
        title="Investigation Overview"
        subtitle="Forensic telemetry, live case index, and evidentiary anomaly indicators."
        actions={
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            New Investigation
          </button>
        }
      />

      {/* Aggregate Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Cases"
          value={statsAgg.totalCases}
          icon={Briefcase}
          accent="blue"
          subtitle="Registered investigations"
        />
        <StatCard
          title="Active Cases"
          value={statsAgg.activeCases}
          icon={FolderOpen}
          accent="indigo"
          badge={statsAgg.activeCases > 0 ? 'Active' : null}
          badgeType="info"
          subtitle="Currently underway"
        />
        <StatCard
          title="Evidence Files"
          value={statsAgg.totalEvidence}
          icon={FileCheck2}
          accent="blue"
          subtitle="Ingested files"
        />
        <StatCard
          title="Entities Found"
          value={statsAgg.totalEntities}
          icon={Users}
          accent="indigo"
          subtitle="Accounts, IPs, phones"
        />
        <StatCard
          title="Relationships"
          value={statsAgg.totalRelationships}
          icon={Share2}
          accent="blue"
          subtitle="Topological correlations"
        />
        <StatCard
          title="High Risk Findings"
          value={statsAgg.totalHighRisk}
          icon={ShieldAlert}
          accent="rose"
          badge={statsAgg.totalHighRisk > 0 ? 'Review' : null}
          badgeType={statsAgg.totalHighRisk > 0 ? 'critical' : 'default'}
          subtitle="Anomalies detected"
        />
      </div>

      {/* Main Grid: Recent Cases & Forensic Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Cases Table */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Recent Investigations
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Active forensic dockets and evidentiary analysis workspaces
              </p>
            </div>
            {cases.length > 0 && (
              <button
                type="button"
                onClick={() => navigate('/cases')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                View all cases
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {loadingCases ? (
            <LoadingSpinner text="Loading recent investigations..." />
          ) : cases.length === 0 ? (
            <EmptyState
              title="No investigations registered yet"
              description="Create your first cyber-investigation case to begin uploading forensic records, extracting identities, and discovering fraudulent transfer rings."
              actionLabel="Create Investigation"
              onAction={() => setIsCreateOpen(true)}
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {cases.slice(0, 5).map((c) => {
                const isActive = c.case_number === currentCaseId;
                const statusColor =
                  String(c.status).toUpperCase() === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : String(c.status).toUpperCase() === 'ANALYZED'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200';

                return (
                  <div
                    key={c.id}
                    onClick={() => handleOpenCase(c.case_number)}
                    className="py-3.5 px-3 -mx-3 rounded-xl hover:bg-slate-50/80 transition-colors cursor-pointer flex items-center justify-between gap-4 group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50/80 px-2 py-0.5 rounded border border-blue-200/50">
                          {c.case_number}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColor}`}>
                          {c.status || 'ACTIVE'}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                            Current
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                        {c.title}
                      </h3>
                      {c.description && (
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {c.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-right">
                      <div className="hidden sm:block text-[11px] text-slate-400 font-mono">
                        {formatDate(c.created_at)}
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-slate-100/80 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Forensic Pipeline Status & Quick Tools */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Action Guide */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-900 tracking-tight mb-1">
              Forensic Workflow
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Step-by-step digital evidence intake & topological correlation
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div className="text-xs">
                  <div className="font-semibold text-slate-800">Intake Evidence</div>
                  <div className="text-slate-500 mt-0.5">
                    Upload bank statements, CDR, IPDR, or UPI transaction files (CSV, XLSX, JSON).
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div className="text-xs">
                  <div className="font-semibold text-slate-800">Extract & Correlate</div>
                  <div className="text-slate-500 mt-0.5">
                    Run the engine to extract identifiers and detect rapid forwarding, 3-hop mule chains, and shared IPs.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div className="text-xs">
                  <div className="font-semibold text-slate-800">Topological Graph & Report</div>
                  <div className="text-slate-500 mt-0.5">
                    Inspect the interactive ReactFlow network graph and compile court-admissible PDF dossiers.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Engine Integrity Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>SanketAI Cryptographic Engine</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              All ingested evidence is hashed with SHA-256 on arrival, guaranteeing non-repudiation and court-admissible digital chain-of-custody.
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-3">
              <span>Local Offline Vault</span>
              <span className="font-mono text-emerald-400 font-semibold">Active & Secure</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <CreateCaseModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(newCase) => {
          loadCases();
          selectCase(newCase.case_number);
          navigate(`/cases/${encodeURIComponent(newCase.case_number)}/risk`);
        }}
      />
    </div>
  );
}
