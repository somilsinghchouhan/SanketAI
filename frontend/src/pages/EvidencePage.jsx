import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  FileCheck2,
  UploadCloud,
  Copy,
  Check,
  Trash2,
  Search,
  FileText,
  FileSpreadsheet,
  FileCode,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { evidenceService } from '../services/evidenceService.js';
import { useInvestigation } from '../context/InvestigationContext.jsx';
import useAsyncResource from '../hooks/useAsyncResource.js';
import PageHeader from '../components/common/PageHeader.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import UploadModal from '../components/modals/UploadModal.jsx';
import { formatBytes, formatDate, truncateHash } from '../utils/formatters.js';

export default function EvidencePage() {
  const { caseId } = useParams();
  const { refreshKey, triggerRefresh } = useInvestigation();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedHash, setCopiedHash] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const { data, loading, error, reload } = useAsyncResource(
    () => evidenceService.getEvidence(caseId),
    [caseId, refreshKey]
  );

  const filteredEvidence = useMemo(() => {
    if (!data) return [];
    const q = searchTerm.toLowerCase();
    return data.filter((item) => {
      return (
        item.filename?.toLowerCase().includes(q) ||
        item.original_filename?.toLowerCase().includes(q) ||
        item.file_type?.toLowerCase().includes(q) ||
        item.sha256_hash?.toLowerCase().includes(q)
      );
    });
  }, [data, searchTerm]);

  const handleCopyHash = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleDelete = async (evidenceId, filename) => {
    if (
      !window.confirm(
        `Are you sure you want to remove evidence file "${filename}"? All associated parsed records will be deleted from this case.`
      )
    ) {
      return;
    }

    try {
      setDeletingId(evidenceId);
      await evidenceService.deleteEvidence(caseId, evidenceId);
      triggerRefresh();
      reload();
    } catch (err) {
      alert(`Failed to delete evidence file: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const getFileIcon = (type) => {
    const t = String(type).toUpperCase();
    if (t === 'CSV') return <FileText className="w-4 h-4 text-emerald-600" />;
    if (t === 'EXCEL') return <FileSpreadsheet className="w-4 h-4 text-green-600" />;
    if (t === 'JSON') return <FileCode className="w-4 h-4 text-amber-600" />;
    return <FileCheck2 className="w-4 h-4 text-blue-600" />;
  };

  const getStatusBadge = (status) => {
    const s = String(status || '').toUpperCase();
    if (s === 'PARSED' || s === 'PROCESSED') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (s === 'ERROR') {
      return 'bg-red-50 text-red-700 border-red-200';
    }
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  if (loading) return <LoadingSpinner text="Querying case evidence register..." />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Evidence Vault & Files"
        subtitle="Forensic evidence files ingested into the SanketAI vault. Cryptographic SHA-256 hashes are calculated at rest upon intake."
        badge={`${data?.length || 0} Files Ingested`}
        badgeType="info"
        actions={
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            Upload Evidence
          </button>
        }
      />

      {/* Dropzone Quick Prompt */}
      {(!data || data.length === 0) ? (
        <EmptyState
          icon={FileCheck2}
          title="No Evidence Ingested Yet"
          description="Upload bank statements, CDR, IPDR, or UPI transaction files (CSV, XLSX, XLS, JSON) to start evidentiary extraction."
          actionLabel="Upload First File"
          onAction={() => setUploadOpen(true)}
        />
      ) : (
        <>
          {/* Filter Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search files by name, type, or SHA-256 hash..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-900">{filteredEvidence.length}</span> of {data.length} files
            </div>
          </div>

          {/* Evidence Table */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Filename</th>
                    <th className="py-3.5 px-4">Format</th>
                    <th className="py-3.5 px-4">File Size</th>
                    <th className="py-3.5 px-4">Ingestion Time</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Parsed Records</th>
                    <th className="py-3.5 px-4">SHA-256 Checksum</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEvidence.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-slate-100 shrink-0">
                            {getFileIcon(row.file_type)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 truncate max-w-[200px]" title={row.filename}>
                              {row.filename}
                            </div>
                            {row.original_filename && row.original_filename !== row.filename && (
                              <div className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
                                {row.original_filename}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {row.file_type}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-mono">
                        {formatBytes(row.file_size)}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-mono">
                        {formatDate(row.upload_timestamp)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(row.processing_status)}`}>
                          {row.processing_status || 'UPLOADED'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {row.record_count?.toLocaleString() || 0}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                          <span title={row.sha256_hash}>
                            {truncateHash(row.sha256_hash, 8, 6)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyHash(row.sha256_hash)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                            title="Copy full SHA-256 hash"
                          >
                            {copiedHash === row.sha256_hash ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(row.id, row.filename)}
                          disabled={deletingId === row.id}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex"
                          title="Delete evidence file"
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
        </>
      )}

      {/* Modal */}
      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        caseId={caseId}
        onUploadSuccess={() => {
          triggerRefresh();
          reload();
        }}
      />
    </div>
  );
}
