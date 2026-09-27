import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Share2,
  Search,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
  Filter,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { relationshipService } from '../services/relationshipService.js';
import { useInvestigation } from '../context/InvestigationContext.jsx';
import useAsyncResource from '../hooks/useAsyncResource.js';
import PageHeader from '../components/common/PageHeader.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Pager from '../components/common/Pager.jsx';
import { formatDate } from '../utils/formatters.js';

const PAGE_SIZE = 30;

export default function RelationshipsPage() {
  const { caseId } = useParams();
  const { refreshKey } = useInvestigation();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [copiedText, setCopiedText] = useState(null);

  const { data, loading, error, reload } = useAsyncResource(
    () => relationshipService.getRelationships(caseId),
    [caseId, refreshKey]
  );

  const types = useMemo(() => {
    const set = new Set((data || []).map((r) => r.relationship_type).filter(Boolean));
    return ['ALL', ...Array.from(set).sort()];
  }, [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data || []).filter((row) => {
      if (typeFilter !== 'ALL' && row.relationship_type !== typeFilter) return false;
      if (!q) return true;
      return [row.source, row.target, row.reason, row.relationship_type]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [data, query, typeFilter]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1800);
  };

  const getRelBadgeStyle = (type) => {
    const t = String(type || '').toUpperCase();
    if (t.includes('SHARED_IP') || t.includes('IP')) {
      return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    }
    if (t.includes('SHARED_IMEI') || t.includes('IMEI')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    if (t.includes('TRANSACTION') || t.includes('TRANSFER')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (t.includes('CALL')) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  if (loading) return <LoadingSpinner text="Computing topological relationships..." />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Relationships & Topological Links"
        subtitle="Cross-entity evidentiary linkages identified across communication, shared hardware, IP infrastructure, and financial vectors."
        badge={`${data?.length || 0} Links`}
        badgeType="info"
      />

      {!data || data.length === 0 ? (
        <EmptyState
          icon={Share2}
          title="No Relationships Recorded"
          description="Upload evidence files and run the forensic correlation pipeline. Identified relationships will appear here automatically."
        />
      ) : (
        <>
          {/* Filter Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search by source, target, type, or reason..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Found <span className="font-bold text-slate-900">{filtered.length}</span> correlated links
              </div>
            </div>

            {/* Type Filters */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                Link Type:
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
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Source Entity</th>
                    <th className="py-3.5 px-4 text-center">Relationship Type</th>
                    <th className="py-3.5 px-4">Target Entity</th>
                    <th className="py-3.5 px-4">Evidentiary Justification / Reason</th>
                    <th className="py-3.5 px-4 text-right">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paged.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      {/* Source */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[200px]" title={row.source}>
                            {row.source}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(row.source)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                            title="Copy source identifier"
                          >
                            {copiedText === row.source ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Direction / Type */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-2xs whitespace-nowrap"
                          style={{
                            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                          }}
                        >
                          <span className={getRelBadgeStyle(row.relationship_type)}>
                            {row.relationship_type || 'CONNECTED_TO'}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                        </div>
                      </td>

                      {/* Target */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[200px]" title={row.target}>
                            {row.target}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(row.target)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                            title="Copy target identifier"
                          >
                            {copiedText === row.target ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs leading-relaxed">
                        {row.reason || 'Direct evidence transaction record match'}
                      </td>

                      {/* Confidence */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px]">
                          {Math.round((row.confidence ?? 1.0) * 100)}%
                        </span>
                      </td>
                    </tr>
                  ))}
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
        </>
      )}
    </div>
  );
}
