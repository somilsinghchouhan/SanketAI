import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  FileSpreadsheet, 
  Download, 
  Loader2, 
  ShieldCheck, 
  CheckCircle2, 
  FileText, 
  Users, 
  Share2, 
  Clock, 
  Lock, 
  AlertTriangle,
  Award,
  Sparkles
} from 'lucide-react';
import { reportService } from '../services/reportService.js';
import PageHeader from '../components/common/PageHeader.jsx';
import { useInvestigation } from '../context/InvestigationContext.jsx';

export default function ReportPage() {
  const { caseId } = useParams();
  const { currentCase } = useInvestigation();
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const download = async () => {
    setError(null);
    setStatus('working');
    try {
      const blob = await reportService.downloadReport(caseId);
      if (blob.type && blob.type.includes('json')) {
        const text = await blob.text();
        let message = 'Unable to download the judicial forensic report.';
        try {
          const parsed = JSON.parse(text);
          message = parsed.detail || message;
        } catch {
          /* keep default */
        }
        throw new Error(message);
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SanketAI_${caseId}_Forensic_Dossier.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus('done');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  const dossierSections = [
    {
      title: 'Executive Case Brief',
      desc: 'Case identification, investigator metadata, registration timestamps, and summary disposition.',
      icon: FileText
    },
    {
      title: 'Cryptographic Chain of Custody',
      desc: 'Complete inventory of ingested files with SHA-256 integrity hashes, byte counts, and ingestion logs.',
      icon: Lock
    },
    {
      title: 'Extracted Entity Intelligence',
      desc: 'Catalog of cross-correlated phone numbers, bank accounts, UPI IDs, IP addresses, and IMEI identities.',
      icon: Users
    },
    {
      title: 'Relational Graph & Link Analysis',
      desc: 'Directed communication and transactional topology mapping inter-entity connections.',
      icon: Share2
    },
    {
      title: 'Threat & Pattern Findings',
      desc: 'Risk scoring breakdown, multi-hop mule conduits, fan-in pooling bursts, and rapid forwarding anomalies.',
      icon: AlertTriangle
    },
    {
      title: 'Chronological Timeline',
      desc: 'Consolidated timestamped event chronology across all heterogeneous digital evidence sources.',
      icon: Clock
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Judicial Forensic Report"
        subtitle="Compile and export a court-admissible forensic dossier with cryptographic verification tokens and intelligence summaries."
        caseId={caseId}
      />

      {/* Main Dossier Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    PDF Document
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Section 65B Ready
                  </span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white mt-1">
                  Comprehensive Case Intelligence Dossier
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Target Case Vault: <span className="font-mono font-bold text-white">{caseId}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={download}
              disabled={status === 'working'}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {status === 'working' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Compiling Dossier…</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Forensic PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback Alerts */}
        <div className="px-6 pt-5">
          {status === 'working' && (
            <div className="flex items-center gap-3 p-4 bg-blue-50/80 border border-blue-200 rounded-lg text-xs text-blue-800">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
              <div>
                <p className="font-semibold">FastAPI Engine Compiling PDF…</p>
                <p className="text-blue-700 mt-0.5">
                  Synthesizing case telemetry, calculating cryptographic hashes, and generating structured tables into ReportLab format.
                </p>
              </div>
            </div>
          )}

          {status === 'done' && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold">Dossier Generated & Download Initiated</p>
                <p className="text-emerald-700 mt-0.5">
                  The forensic report file <span className="font-mono font-bold">SanketAI_{caseId}_Forensic_Dossier.pdf</span> has been compiled and downloaded.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Generation Failed</p>
                <p className="text-rose-700 mt-0.5">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Content Body: Sections Included */}
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Sections Compiled into this Forensic Dossier
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {dossierSections.map((sec, idx) => {
                const IconComponent = sec.icon;
                return (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 shadow-xs">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900">{sec.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{sec.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legal / Compliance Banner */}
          <div className="p-4 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 flex items-start gap-3.5 text-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-white flex items-center gap-2">
                <span>Judicial Forensics & Chain-of-Custody Certification</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  STANDARD COMPLIANT
                </span>
              </h4>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                The generated dossier embeds immutable SHA-256 hash digests computed at ingestion time for every piece of digital evidence. Suitable for submission in judicial inquiries, FIR supplementary filings, and formal law enforcement case records.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
