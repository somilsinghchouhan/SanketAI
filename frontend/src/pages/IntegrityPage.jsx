import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  FileCheck2,
  Calendar,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { evidenceService } from '../services/evidenceService.js';
import { integrityService } from '../services/integrityService.js';
import { useInvestigation } from '../context/InvestigationContext.jsx';
import useAsyncResource from '../hooks/useAsyncResource.js';
import PageHeader from '../components/common/PageHeader.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { formatDate, truncateHash } from '../utils/formatters.js';

function statusLabel(row, verifiedMap) {
  const result = verifiedMap[row.id];
  if (!result) {
    return {
      text: 'NOT VERIFIED',
      badge: 'bg-slate-100 text-slate-600 border-slate-200',
      icon: Lock,
    };
  }
  if (result.pending) {
    return {
      text: 'CALCULATING HASH...',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: RefreshCw,
      spin: true,
    };
  }
  if (result.match === true) {
    return {
      text: 'CRYPTOGRAPHICALLY VERIFIED',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: ShieldCheck,
    };
  }
  return {
    text: 'HASH MISMATCH (TAMPER DETECTED)',
    badge: 'bg-red-50 text-red-700 border-red-200',
    icon: AlertTriangle,
  };
}

export default function IntegrityPage() {
  const { caseId } = useParams();
  const { refreshKey } = useInvestigation();
  const evidence = useAsyncResource(() => evidenceService.getEvidence(caseId), [caseId, refreshKey]);
  const [verified, setVerified] = useState({});
  const [caseResult, setCaseResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [copiedHash, setCopiedHash] = useState(null);

  const runVerifyAll = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await integrityService.verifyCaseIntegrity(caseId);
      setCaseResult(result);
      const next = {};
      (result.verifications || []).forEach((v) => {
        next[v.evidence_id] = v;
      });
      setVerified(next);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const runVerifyOne = async (evidenceId) => {
    setVerified((prev) => ({ ...prev, [evidenceId]: { ...(prev[evidenceId] || {}), pending: true } }));
    try {
      const result = await integrityService.verifySingleEvidence(caseId, evidenceId);
      setVerified((prev) => ({ ...prev, [evidenceId]: result }));
    } catch (err) {
      setError(err.message);
      setVerified((prev) => {
        const copy = { ...prev };
        delete copy[evidenceId];
        return copy;
      });
    }
  };

  const handleCopy = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 1800);
  };

  if (evidence.loading) return <LoadingSpinner text="Accessing cryptographic vault..." />;
  if (evidence.error) return <ErrorState message={evidence.error} onRetry={evidence.reload} />;

  const files = evidence.data || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Chain of Custody & Cryptographic Integrity"
        subtitle="Verification engine validates on-disk files against the immutable SHA-256 hashes recorded at the time of evidence intake."
        badge={`${files.length} Evidence Records`}
        badgeType="info"
        actions={
          <button
            type="button"
            onClick={runVerifyAll}
            disabled={busy || files.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{busy ? 'Calculating SHA-256 Hashes...' : 'Verify All Case Hashes'}</span>
          </button>
        }
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Overview Status Banner if Verified */}
      {caseResult && (
        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Case Integrity Verification Complete
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {caseResult.verified_count || 0} of {caseResult.total_evidence || 0} files validated successfully against physical storage.
              </p>
            </div>
          </div>
          <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
            STATUS: INTEGRITY PRESERVED
          </span>
        </div>
      )}

      {files.length === 0 ? (
        <EmptyState
          icon={Lock}
          title="No Evidence Files Ingested"
          description="Upload evidence files to this case first. Cryptographic hashes will be computed automatically and listed here for non-repudiation checks."
        />
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Evidence File</th>
                  <th className="py-3.5 px-4">Recorded SHA-256 Hash</th>
                  <th className="py-3.5 px-4">Intake Timestamp</th>
                  <th className="py-3.5 px-4">Chain of Custody Status</th>
                  <th className="py-3.5 px-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {files.map((row) => {
                  const label = statusLabel(row, verified);
                  const Icon = label.icon;
                  const isPending = verified[row.id]?.pending;

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 shrink-0">
                            <FileCheck2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="truncate max-w-[220px]" title={row.filename}>
                              {row.filename}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              File ID: {row.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 max-w-fit">
                          <span title={row.sha256_hash}>
                            {truncateHash(row.sha256_hash, 10, 8)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(row.sha256_hash)}
                            className="p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors"
                            title="Copy complete SHA-256 hash"
                          >
                            {copiedHash === row.sha256_hash ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {formatDate(row.upload_timestamp)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${label.badge}`}>
                          <Icon className={`w-3.5 h-3.5 ${label.spin ? 'animate-spin' : ''}`} />
                          {label.text}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => runVerifyOne(row.id)}
                          disabled={busy || isPending}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isPending ? 'Verifying...' : 'Re-verify Hash'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
