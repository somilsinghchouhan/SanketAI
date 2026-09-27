import React, { useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Users,
  Search,
  Copy,
  Check,
  Phone,
  CreditCard,
  AtSign,
  Globe,
  Cpu,
  Network,
  Filter,
  ArrowRight,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { entityService } from '../services/entityService.js';
import { useInvestigation } from '../context/InvestigationContext.jsx';
import useAsyncResource from '../hooks/useAsyncResource.js';
import PageHeader from '../components/common/PageHeader.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import SeverityBadge from '../components/common/SeverityBadge.jsx';
import Pager from '../components/common/Pager.jsx';
import EntityDossier from '../components/dossier/EntityDossier.jsx';

const PAGE_SIZE = 30;
const KNOWN_TYPES = ['PHONE', 'ACCOUNT', 'UPI', 'IP', 'IMEI', 'IMSI', 'MAC'];

export default function EntitiesPage() {
  const { caseId } = useParams();
  const [params] = useSearchParams();
  const { selectedEntity, setSelectedEntity, refreshKey } = useInvestigation();
  const [query, setQuery] = useState(params.get('q') || '');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState(null);

  const { data, loading, error, reload } = useAsyncResource(
    () => entityService.getEntities(caseId),
    [caseId, refreshKey]
  );

  const types = useMemo(() => {
    const present = new Set((data || []).map((e) => e.type));
    return [
      'ALL',
      ...KNOWN_TYPES.filter((t) => present.has(t)),
      ...Array.from(present).filter((t) => !KNOWN_TYPES.includes(t)).sort(),
    ];
  }, [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data || [])
      .filter((row) => {
        if (typeFilter !== 'ALL' && row.type !== typeFilter) return false;
        if (!q) return true;
        return (
          String(row.id || '').toLowerCase().includes(q) ||
          String(row.identifier || '').toLowerCase().includes(q) ||
          String(row.type || '').toLowerCase().includes(q) ||
          String(row.institution || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [data, query, typeFilter]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleCopy = (e, text) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const getEntityIcon = (type) => {
    const t = String(type).toUpperCase();
    if (t === 'PHONE') return <Phone className="w-3.5 h-3.5" />;
    if (t === 'ACCOUNT') return <CreditCard className="w-3.5 h-3.5" />;
    if (t === 'UPI') return <AtSign className="w-3.5 h-3.5" />;
    if (t === 'IP') return <Globe className="w-3.5 h-3.5" />;
    if (t === 'IMEI' || t === 'IMSI') return <Cpu className="w-3.5 h-3.5" />;
    return <Network className="w-3.5 h-3.5" />;
  };

  const getEntityTypeBadgeStyle = (type) => {
    const t = String(type).toUpperCase();
    if (t === 'PHONE') return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (t === 'ACCOUNT') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (t === 'UPI') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (t === 'IP') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (t === 'IMEI' || t === 'IMSI') return 'bg-purple-50 text-purple-700 border-purple-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  if (loading) return <LoadingSpinner text="Analyzing and extracting entities..." />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Extracted Entities Directory"
        subtitle="Unique financial, cellular, and network identifiers parsed across evidence files with calibrated threat scores."
        badge={`${data?.length || 0} Entities`}
        badgeType="info"
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Entity Registry & Filters */}
        <div className={`space-y-4 ${selectedEntity ? 'xl:col-span-8' : 'xl:col-span-12'}`}>
          {/* Filter Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Filter by identifier, institution, or type..."
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
                Found <span className="font-bold text-slate-900">{filtered.length}</span> entities
              </div>
            </div>

            {/* Entity Type Filter Badges */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                Type:
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
              icon={Users}
              title="No Entities Match Query"
              description="Try adjusting your search terms or select 'ALL' entity types."
            />
          ) : (
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Entity Type</th>
                      <th className="py-3.5 px-4">Identifier / Value</th>
                      <th className="py-3.5 px-4">Institution / Provider</th>
                      <th className="py-3.5 px-4">Risk Severity</th>
                      <th className="py-3.5 px-4 text-right">Score</th>
                      <th className="py-3.5 px-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paged.map((row) => {
                      const isSelected = selectedEntity?.id === row.id;
                      return (
                        <tr
                          key={row.id}
                          onClick={() => setSelectedEntity(row)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border ${getEntityTypeBadgeStyle(
                                row.type
                              )}`}
                            >
                              {getEntityIcon(row.type)}
                              {row.type}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              <span className="truncate max-w-[220px]" title={row.id}>
                                {row.id}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleCopy(e, row.id)}
                                className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                                title="Copy identifier"
                              >
                                {copiedId === row.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-slate-600">
                            {row.institution || '—'}
                          </td>

                          <td className="py-3.5 px-4">
                            <SeverityBadge severity={row.severity} />
                          </td>

                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                            {row.score ?? 0}
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
