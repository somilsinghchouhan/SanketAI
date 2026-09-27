import React from 'react';
import { ShieldAlert, AlertTriangle, Layers, Clock, FileCheck } from 'lucide-react';
import SeverityBadge from '../common/SeverityBadge.jsx';
import TransactionChain from './TransactionChain.jsx';

export default function FindingsPanel({ analyzed, findings, loading }) {
  if (loading) return null;

  if (!analyzed) {
    return (
      <div className="border border-slate-200/80 bg-white p-6 mb-4 rounded-xl shadow-xs">
        <h2 className="text-base font-bold text-slate-800 mb-1">Investigation Findings & Heuristics</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          <span className="font-semibold text-slate-700">Not analyzed yet.</span> Run the forensic pipeline to
          detect rapid mule forwarding, shared hardware devices, fan-in pooling, and multi-hop transactional conduits.
        </p>
      </div>
    );
  }

  if (!findings || findings.length === 0) {
    return (
      <div className="border border-slate-200/80 bg-white p-6 mb-4 rounded-xl shadow-xs">
        <h2 className="text-base font-bold text-slate-800 mb-1">Investigation Findings & Heuristics</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          <span className="font-semibold text-emerald-700">Analysis complete · Zero suspicious patterns detected.</span> The
          correlation engine recorded no high-velocity or conduit anomalies in the current case evidence vault.
        </p>
      </div>
    );
  }

  return (
    <section className="mb-6 space-y-3">
      <div className="flex items-center justify-between gap-3 mb-2">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>Identified Behavioral Patterns</span>
        </h2>
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
          {findings.length} findings
        </span>
      </div>
      <div className="space-y-3">
        {findings.map((item) => (
          <article
            key={item.id}
            className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs hover:border-slate-300 transition-colors"
          >
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                </div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  {item.pattern_type}
                </p>
              </div>
              <SeverityBadge severity={item.severity} />
            </div>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">{item.explanation || item.flow_summary}</p>
            <TransactionChain summary={item.flow_summary} />
            <dl className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="rounded-lg border border-slate-200/70 bg-slate-50 p-2.5">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Interval / Latency</dt>
                <dd className="mt-0.5 font-medium text-slate-800">{item.latency_info || '—'}</dd>
              </div>
              <div className="rounded-lg border border-slate-200/70 bg-slate-50 p-2.5">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Source Evidence</dt>
                <dd className="mt-0.5 font-medium text-slate-800 break-words">{item.source_ref || '—'}</dd>
              </div>
              <div className="rounded-lg border border-slate-200/70 bg-slate-50 p-2.5">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pattern Archetype</dt>
                <dd className="mt-0.5 font-medium text-slate-800">{item.pattern_type}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
