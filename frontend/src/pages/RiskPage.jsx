import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ShieldAlert,
  Search,
  Filter,
  ArrowUpDown,
  FileCheck2,
  Users,
  Share2,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useInvestigation } from '../context/InvestigationContext.jsx';
import { caseService } from '../services/caseService.js';
import { relationshipService } from '../services/relationshipService.js';
import useAsyncResource from '../hooks/useAsyncResource.js';
import PageHeader from '../components/common/PageHeader.jsx';
import StatCard from '../components/common/StatCard.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import SeverityBadge from '../components/common/SeverityBadge.jsx';
import Pager from '../components/common/Pager.jsx';
import StatusBanner from '../components/common/StatusBanner.jsx';
import FindingsPanel from '../components/findings/FindingsPanel.jsx';
import EntityDossier from '../components/dossier/EntityDossier.jsx';
import { deriveInvestigationState } from '../utils/investigationState.js';

const PAGE_SIZE = 30;

export default function RiskPage() {
  const { caseId } = useParams();
  const {
    currentCase,
    caseStats,
    selectedEntity,
    setSelectedEntity,
    isAnalyzing,
    refreshKey,
  } = useInvestigation();

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);

  const risks = useAsyncResource(
    () => caseService.getCaseRisks(caseId),
    [caseId, refreshKey]
  );
  const anomalies = useAsyncResource(
    () => relationshipService.getAnomalies(caseId),
    [caseId, refreshKey]
  );

  const analyzed = String(currentCase?.status || '').toUpperCase() === 'ANALYZED';
  const state = deriveInvestigationState({
    currentCase,
    stats: caseStats,
    isAnalyzing,
    anomaliesCount: anomalies.data?.length,
  });

  const types = useMemo(() => {
    const set = new Set((risks.data || []).map((r) => r.type).filter(Boolean));
    return ['ALL', ...Array.from(set).sort()];
  }, [risks.data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (risks.data || [])
      .filter((row) => {
        if (typeFilter !== 'ALL' && row.type !== typeFilter) return false;
        if (
          severityFilter !== 'ALL' &&
          String(row.severity).toUpperCase() !== severityFilter
        )
          return false;
        if (!q) return true;
        return (
          String(row.id || '').toLowerCase().includes(q) ||
          String(row.type || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const diff = (a.score ?? 0) - (b.score ?? 0);
        return sortDir === 'asc' ? diff : -diff;
      });
  }, [risks.data, query, typeFilter, severityFilter, sortDir]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (risks.loading) return <LoadingSpinner text="Computing risk threat vectors..." />;
  if (risks.error) return <ErrorState message={risks.error} onRetry={risks.reload} />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Risk Overview & Suspicious Patterns"
        subtitle="Multi-factor evidentiary risk scoring and suspicious behavioral anomalies detected by the SanketAI engine."
        badge={`${risks.data?.length || 0} Entities Scored`}
        badgeType="info"
      />

      {/* Investigation Status Banner */}
      <StatusBanner state={state} />

      {/* Forensic Intelligence Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Raw Ingested Records"
          value={caseStats?.raw_records ?? 0}
          icon={FileCheck2}
          accent="blue"
          subtitle="Vault records parsed"
        />
        <StatCard
          title="Extracted Entities"
          value={caseStats?.entities_count ?? 0}
          icon={Users}
          accent="indigo"
          subtitle="Accounts, phones, IPs, VPAs"
        />
        <StatCard
          title="Correlated Relationships"
          value={caseStats?.relationships_count ?? 0}
          icon={Share2}
          accent="blue"
          subtitle="Cross-entity links"
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

      {/* Pattern Findings Panel */}
      <FindingsPanel
        analyzed={analyzed}
        findings={anomalies.data || []}
        loading={anomalies.loading}
      />

      {/* Risk Table Section */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className={`space-y-4 ${selectedEntity ? 'xl:col-span-8' : 'xl:col-span-12'}`}>
          {/* Controls Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Filter targets by ID or category..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              {/* Severity Quick Filters */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-end sm:self-auto">
                {['ALL', 'CRITICAL', 'HIGH', 'MED', 'LOW'].map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => {
                      setSeverityFilter(sev);
                      setPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                      severityFilter === sev
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* Entity Types Row */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                Category:
              </span>
              {types.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTypeFilter(t);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    typeFilter === t
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          {filtered.length === 0 ? (
            <EmptyState
              icon={ShieldAlert}
              title="No Risk Scores Found"
              description="Upload evidence files and run forensic analysis to calculate risk scores for extracted targets."
            />
          ) : (
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Entity Identifier</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Severity Tier</th>
                      <th className="py-3.5 px-4">Threat Level</th>
                      <th className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                          className="inline-flex items-center gap-1 hover:text-slate-900"
                        >
                          Score
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </button>
                      </th>
                      <th className="py-3.5 px-4 text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paged.map((row) => {
                      const isSelected = selectedEntity?.id === row.id;
                      const score = row.score ?? 0;
                      const scoreColor =
                        score >= 80
                          ? 'bg-red-500'
                          : score >= 50
                          ? 'bg-orange-500'
                          : score >= 25
                          ? 'bg-amber-500'
                          : 'bg-emerald-500';

                      return (
                        <tr
                          key={row.id}
                          onClick={() => setSelectedEntity(row)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900 truncate max-w-[220px]" title={row.id}>
                            {row.id}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {row.type}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <SeverityBadge severity={row.severity} />
                          </td>

                          <td className="py-3.5 px-4 w-40">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${scoreColor}`}
                                  style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                                />
                              </div>
                              <span className="text-[11px] font-mono text-slate-400 w-8 text-right">
                                {score}%
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                            {score}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 ml-auto group-hover:bg-blue-50 group-hover:text-blue-600">
                              <ChevronRight className="w-3.5 h-3.5" />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pager */}
              <div className="p-3 border-t border-slate-100 flex items-center justify-between">
                <Pager
                  page={page}
                  total={filtered.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setPage}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Entity Dossier Inspector */}
        {selectedEntity && (
          <aside className="xl:col-span-4 sticky top-24 self-start">
            <EntityDossier
              entity={selectedEntity}
              caseId={caseId}
              onClose={() => setSelectedEntity(null)}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
