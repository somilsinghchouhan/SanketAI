import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Clock,
  Search,
  Filter,
  ArrowRight,
  CreditCard,
  Phone,
  FileCheck2,
  Calendar,
  Layers,
  LayoutList,
  Columns
} from 'lucide-react';
import { timelineService } from '../services/timelineService.js';
import { useInvestigation } from '../context/InvestigationContext.jsx';
import useAsyncResource from '../hooks/useAsyncResource.js';
import PageHeader from '../components/common/PageHeader.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Pager from '../components/common/Pager.jsx';
import { formatCurrency, formatDate } from '../utils/formatters.js';

const PAGE_SIZE = 40;

export default function TimelinePage() {
  const { caseId } = useParams();
  const { refreshKey } = useInvestigation();
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [viewLayout, setViewLayout] = useState('timeline'); // 'timeline' | 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data, loading, error, reload } = useAsyncResource(
    () => timelineService.getTimeline(caseId),
    [caseId, refreshKey]
  );

  const types = useMemo(() => {
    const set = new Set((data || []).map((e) => e.event_type).filter(Boolean));
    return ['ALL', ...Array.from(set).sort()];
  }, [data]);

  const events = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = (data || []).filter((e) => {
      if (typeFilter !== 'ALL' && e.event_type !== typeFilter) return false;
      if (!q) return true;
      return (
        String(e.description || '').toLowerCase().includes(q) ||
        String(e.source_entity || '').toLowerCase().includes(q) ||
        String(e.target_entity || '').toLowerCase().includes(q) ||
        String(e.event_type || '').toLowerCase().includes(q)
      );
    });
    return [...list].sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)));
  }, [data, typeFilter, searchQuery]);

  const paged = events.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getEventBadge = (type) => {
    const t = String(type || '').toUpperCase();
    if (t.includes('TRANSACTION') || t.includes('TRANSFER')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (t.includes('CALL')) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
    if (t.includes('SESSION') || t.includes('IP')) {
      return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    }
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  if (loading) return <LoadingSpinner text="Ordering forensic timeline stream..." />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Chronological Forensic Timeline"
        subtitle="Unified temporal sequence reconstructing cross-device transactions, communication sessions, and evidence events."
        badge={`${events.length} Events`}
        badgeType="info"
      />

      {!data || data.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No Chronological Events Available"
          description="Upload evidence files and run forensic analysis to generate the temporal event timeline."
        />
      ) : (
        <>
          {/* Controls Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search events by entity, description, or keyword..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              {/* View Switcher */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setViewLayout('timeline')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      viewLayout === 'timeline'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Columns className="w-3.5 h-3.5" />
                    <span>Vertical Flow</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewLayout('table')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      viewLayout === 'table'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <LayoutList className="w-3.5 h-3.5" />
                    <span>Table</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Type Filters */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                Event Type:
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
                  {t === 'ALL' ? 'All Types' : t}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline View */}
          {viewLayout === 'timeline' ? (
            <div className="relative pl-6 sm:pl-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-200 space-y-6">
              {paged.map((ev, idx) => (
                <div key={idx} className="relative group">
                  {/* Timeline Node Dot */}
                  <div className="absolute -left-6 sm:-left-8 top-3.5 w-6 h-6 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-blue-600 group-hover:scale-125 transition-transform" />
                  </div>

                  {/* Event Card */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border ${getEventBadge(ev.event_type)}`}>
                          {ev.event_type || 'EVENT'}
                        </span>
                        {ev.amount != null && (
                          <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {formatCurrency(ev.amount)}
                          </span>
                        )}
                      </div>

                      <div className="font-mono text-xs text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(ev.timestamp)}</span>
                      </div>
                    </div>

                    {/* Entities Flow */}
                    {(ev.source_entity || ev.target_entity) && (
                      <div className="flex items-center gap-2 font-mono text-xs text-slate-700 mb-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex-wrap">
                        <span className="font-bold text-slate-900">{ev.source_entity || 'Unknown'}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="font-bold text-slate-900">{ev.target_entity || 'Unknown'}</span>
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {ev.description}
                    </p>

                    {/* Evidence Ref Footer */}
                    {ev.evidence_ref && (
                      <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>Source Evidence: <span className="font-mono text-slate-600 font-semibold">{ev.evidence_ref}</span></span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Pager */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
                <Pager
                  page={page}
                  total={events.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setPage}
                />
              </div>
            </div>
          ) : (
            /* Table View */
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Timestamp</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4">Source Entity</th>
                      <th className="py-3.5 px-4">Target Entity</th>
                      <th className="py-3.5 px-4">Narrative</th>
                      <th className="py-3.5 px-4 text-right">Amount</th>
                      <th className="py-3.5 px-4">Evidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paged.map((ev, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono whitespace-nowrap text-slate-600">
                          {formatDate(ev.timestamp)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border ${getEventBadge(ev.event_type)}`}>
                            {ev.event_type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 truncate max-w-[150px]">
                          {ev.source_entity || '—'}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 truncate max-w-[150px]">
                          {ev.target_entity || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs leading-relaxed">
                          {ev.description}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-right text-slate-900">
                          {ev.amount != null ? formatCurrency(ev.amount) : '—'}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                          {ev.evidence_ref || '—'}
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
                  total={events.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setPage}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
