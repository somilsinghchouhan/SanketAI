import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ShieldAlert, Share2, Clock, FileCheck, X, ArrowRight, ExternalLink, Hash, Copy, Check } from 'lucide-react';
import SeverityBadge from '../common/SeverityBadge';
import { truncateHash } from '../../utils/formatters';

export default function EntityDossier({ entity, onClose, caseId }) {
  const navigate = useNavigate();
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!entity) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[420px] shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-3 shadow-xs">
          <Shield className="w-7 h-7" />
        </div>
        <h4 className="text-base font-bold text-slate-800">No Target Selected</h4>
        <p className="text-xs text-slate-500 max-w-xs mt-2 leading-relaxed">
          Select any entity from the risk assessment table, network graph, or identity directory to inspect its forensic dossier.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
      {/* Dossier Header */}
      <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-white/10 text-slate-200 border border-white/10">
                {entity.type}
              </span>
              <SeverityBadge severity={entity.severity} />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white truncate font-mono" title={entity.id}>
                {entity.id}
              </h3>
              <button
                type="button"
                onClick={() => copyToClipboard(entity.id)}
                className="text-slate-400 hover:text-white p-1 transition-colors"
                title="Copy Identifier"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            {entity.institution && (
              <p className="text-xs text-slate-300 truncate mt-0.5">{entity.institution}</p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Risk Score</div>
              <div className={`text-2xl font-bold font-mono tracking-tight ${
                entity.score >= 80 ? 'text-rose-400' :
                entity.score >= 60 ? 'text-amber-400' :
                entity.score >= 40 ? 'text-yellow-400' : 'text-emerald-400'
              }`}>
                {entity.score}<span className="text-xs text-slate-400 font-normal">/100</span>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Quick Actions */}
      <div className="grid grid-cols-3 border-b border-slate-200/80 bg-slate-50/80 divide-x divide-slate-200/80 text-xs font-semibold">
        <button
          onClick={() => navigate(`/cases/${caseId}/graph`)}
          className="py-2.5 px-3 text-slate-600 hover:text-blue-600 hover:bg-white flex items-center justify-center gap-1.5 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Graph</span>
        </button>
        <button
          onClick={() => navigate(`/cases/${caseId}/timeline`)}
          className="py-2.5 px-3 text-slate-600 hover:text-blue-600 hover:bg-white flex items-center justify-center gap-1.5 transition-colors"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Timeline</span>
        </button>
        <button
          onClick={() => navigate(`/cases/${caseId}/evidence`)}
          className="py-2.5 px-3 text-slate-600 hover:text-blue-600 hover:bg-white flex items-center justify-center gap-1.5 transition-colors"
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Evidence</span>
        </button>
      </div>

      {/* Dossier Content */}
      <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs">
        {/* Telemetry Metadata */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Observation Activity Window
          </h4>
          <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">First Seen</span>
              <span className="font-mono text-slate-800 font-semibold">{entity.firstSeen || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Last Active</span>
              <span className="font-mono text-slate-800 font-semibold">{entity.lastActive || '—'}</span>
            </div>
          </div>
        </div>

        {/* Risk Breakdown / Weights */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
            <span>Risk Factor Breakdown</span>
            <span className="font-mono text-slate-500 font-semibold">{entity.factors?.length || 0} Flags</span>
          </h4>
          {entity.weights && entity.weights.length > 0 ? (
            <div className="space-y-1.5">
              {entity.weights.map((w, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/70 rounded-lg">
                  <span className="text-slate-800 font-medium">{w.label}</span>
                  <span className="font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[11px]">
                    {w.pts}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-lg text-slate-400">
              No elevated risk factors detected for this entity.
            </div>
          )}
        </div>

        {/* Connected Entities / Topology */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
            <span>Correlated Relational Links</span>
            <span className="font-mono text-slate-500 font-semibold">{entity.nodes || 0} Nodes</span>
          </h4>
          {entity.topology && entity.topology.length > 0 ? (
            <div className="space-y-1.5">
              {entity.topology.map((top, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/70 rounded-lg">
                  <div className="min-w-0 pr-2">
                    <span className="font-mono font-semibold text-slate-800 block truncate">{top.val}</span>
                    <span className="text-[10px] text-slate-400">{top.label}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                    LINKED
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-lg text-slate-400">
              No correlated links registered.
            </div>
          )}
        </div>

        {/* Source Evidence References with SHA-256 */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Evidentiary Provenance
          </h4>
          {entity.sources && entity.sources.length > 0 ? (
            <div className="space-y-2">
              {entity.sources.map((src, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200/70 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 truncate">{src.file}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-white text-slate-700 border border-slate-200 rounded font-semibold">
                      {src.match || 'REFERENCED'}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 break-all bg-white p-1.5 rounded border border-slate-200/60">
                    SHA-256: {src.hash}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-lg text-slate-400">
              No evidence references available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
