import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Search,
  Calendar,
  ChevronRight,
  Trash2,
  AlertCircle,
  FolderOpen,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  Clock
} from 'lucide-react';
import { useInvestigation } from '../context/InvestigationContext';
import { caseService } from '../services/caseService';
import CreateCaseModal from '../components/modals/CreateCaseModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import PageHeader from '../components/common/PageHeader';
import { formatDate } from '../utils/formatters';

export default function CasesPage() {
  const navigate = useNavigate();
  const { cases, loadCases, loadingCases, caseError, selectCase, currentCaseId } = useInvestigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date_desc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Filter & Sort
  const processedCases = useMemo(() => {
    return cases
      .filter((c) => {
        const q = searchTerm.toLowerCase();
        const matchesQuery =
          c.case_number.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q));

        if (!matchesQuery) return false;
        if (statusFilter === 'ALL') return true;
        return String(c.status).toUpperCase() === statusFilter;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') {
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        }
        if (sortBy === 'date_asc') {
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        }
        if (sortBy === 'id_asc') {
          return a.case_number.localeCompare(b.case_number);
        }
        if (sortBy === 'id_desc') {
          return b.case_number.localeCompare(a.case_number);
        }
        return 0;
      });
  }, [cases, searchTerm, statusFilter, sortBy]);

  const handleSelectCase = (caseNumber) => {
    selectCase(caseNumber);
    navigate(`/cases/${encodeURIComponent(caseNumber)}/risk`);
  };

  const handleDeleteCase = async (e, caseNumber) => {
    e.stopPropagation();
    if (
      !window.confirm(
        `Are you sure you want to permanently delete case ${caseNumber} and all its evidence and forensic findings? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setDeletingId(caseNumber);
      await caseService.deleteCase(caseNumber);
      await loadCases();
    } catch (err) {
      alert(`Failed to delete case: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const s = String(status || 'ACTIVE').toUpperCase();
    if (s === 'ACTIVE') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (s === 'ANALYZED') {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (s === 'CLOSED') {
      return 'bg-slate-100 text-slate-700 border-slate-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Investigations Registry"
        subtitle="Forensic cases, evidentiary dockets, and active multi-vector criminal inquiries."
        badge={`${cases.length} Total`}
        badgeType="info"
        actions={
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            New Investigation
          </button>
        }
      />

      {/* Filter and Control Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by case number, title, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Right Controls: Sort & Layout Toggle */}
          <div className="flex items-center gap-2.5 self-end md:self-auto flex-wrap">
            {/* Status Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {['ALL', 'ACTIVE', 'ANALYZED', 'CLOSED'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg transition-all text-[11px] ${
                    statusFilter === st
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Sort Select */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-1.5 pl-3 pr-7 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="id_asc">Case ID (A-Z)</option>
                <option value="id_desc">Case ID (Z-A)</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Table view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loadingCases ? (
        <LoadingSpinner text="Retrieving forensic case registry..." />
      ) : caseError ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Error Accessing SQLite Vault</p>
            <p className="mt-0.5">{caseError}</p>
          </div>
        </div>
      ) : processedCases.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={searchTerm ? 'No Matching Cases' : 'No Investigations Registered'}
          description={
            searchTerm
              ? `No case matching query "${searchTerm}" was found.`
              : 'Start by creating your first forensic case docket to begin evidence intake and intelligence correlation.'
          }
          actionLabel="Create Investigation"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : viewMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {processedCases.map((c) => {
            const isSelected = c.case_number === currentCaseId;
            return (
              <div
                key={c.id}
                onClick={() => handleSelectCase(c.case_number)}
                className={`bg-white border rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/10'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60">
                      {c.case_number}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                        c.status
                      )}`}
                    >
                      {c.status || 'ACTIVE'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1.5">
                    {c.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                    {c.description || 'No description recorded for this investigation docket.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(c.created_at)}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleDeleteCase(e, c.case_number)}
                      disabled={deletingId === c.case_number}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete case file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table Layout */
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Case ID</th>
                  <th className="py-3.5 px-4">Investigation Title</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processedCases.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => handleSelectCase(c.case_number)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      {c.case_number}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                      {c.title}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadge(
                          c.status
                        )}`}
                      >
                        {c.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {formatDate(c.created_at)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => handleDeleteCase(e, c.case_number)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors inline-flex"
                        title="Delete case"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
