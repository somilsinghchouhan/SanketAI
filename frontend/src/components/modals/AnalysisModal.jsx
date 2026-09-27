import React from 'react';
import { X, Play, CheckCircle2, AlertCircle, Loader2, Clock, FileText, Users, Share2, ShieldAlert, Cpu, Sparkles } from 'lucide-react';

export default function AnalysisModal({ isOpen, onClose, isAnalyzing, result, error, caseId }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white">Forensic Intelligence Pipeline</h2>
              <p className="text-[11px] text-slate-300">
                Target Case: <span className="font-mono font-bold text-blue-300">{caseId}</span>
              </p>
            </div>
          </div>
          {!isAnalyzing && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
                <Sparkles className="w-6 h-6 text-blue-600 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Executing Analytical Correlation Engines</h3>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                  Parsing evidence files, extracting cross-silo identities, mapping transaction conduits, and computing heuristic threat scores...
                </p>
              </div>
              <div className="w-full max-w-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 font-mono text-left space-y-1.5 shadow-xs">
                <div className="text-blue-600 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                  Running rule-based correlation engines...
                </div>
                <div className="text-slate-400 text-[10px]">
                  Evaluating mule velocity, 3-hop hops & fan-in anomalies
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Analysis Pipeline Error</p>
                  <p className="mt-1 leading-relaxed">{error}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {!isAnalyzing && result && (
            <div className="space-y-5">
              <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Forensic analysis pipeline completed and data synchronized.</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mb-1">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    Files
                  </div>
                  <div className="text-xl font-bold font-mono text-slate-900">
                    {result.files_processed}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mb-1">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    Records
                  </div>
                  <div className="text-xl font-bold font-mono text-slate-900">
                    {result.records_processed}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mb-1">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    Entities
                  </div>
                  <div className="text-xl font-bold font-mono text-slate-900">
                    {result.entities_identified}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mb-1">
                    <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                    Links
                  </div>
                  <div className="text-xl font-bold font-mono text-slate-900">
                    {result.relationships_identified}
                  </div>
                </div>

                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <div className="flex items-center gap-1.5 text-[11px] text-rose-700 font-medium mb-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    High Risk
                  </div>
                  <div className="text-xl font-bold font-mono text-rose-700">
                    {result.high_risk_entities}
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-medium mb-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    Anomalies
                  </div>
                  <div className="text-xl font-bold font-mono text-amber-700">
                    {result.anomalies_detected}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Execution Time: <span className="font-mono font-bold text-slate-800">{result.processing_time_seconds}s</span></span>
                </div>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  View Updated Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
