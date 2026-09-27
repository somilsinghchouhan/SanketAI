import React, { useEffect } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  Network,
  ShieldAlert,
  Clock,
  FileSpreadsheet,
  Lock,
  ChevronRight,
  Fingerprint
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SanketLogo from '../components/common/SanketLogo';

const capabilities = [
  {
    icon: FileCheck2,
    title: 'Evidence Ingestion & Parsing',
    description: 'Direct parsing of CDR, IPDR, UPI transfer logs, and bank statement spreadsheets with cryptographic SHA-256 integrity seal.'
  },
  {
    icon: Fingerprint,
    title: 'Multi-Factor Entity Extraction',
    description: 'Normalizes and categorizes bank accounts, phone numbers, UPI VPA addresses, egress IP addresses, and IMEI/MAC hardware IDs.'
  },
  {
    icon: Network,
    title: 'Topological Graph Correlation',
    description: 'Automated graph modeling reveals mule network topologies, indirect intermediaries, and infrastructure-sharing syndicates.'
  },
  {
    icon: ShieldAlert,
    title: 'Anomaly & Pattern Detection',
    description: 'Rule-driven pattern recognizers catch rapid fund forwarding (<5 min latency), 3-hop layering chains, and burst transactions.'
  },
  {
    icon: Clock,
    title: 'Chronological Timeline',
    description: 'Interactive evidentiary event stream reconstructing multi-device criminal timelines across communication and financial vectors.'
  },
  {
    icon: FileSpreadsheet,
    title: 'Court-Admissible Dossier Export',
    description: 'Compile verified evidence, risk matrices, and entity graphs into standard Section 65B-compliant judicial PDF reports.'
  }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  // If already authenticated, jump straight to the system dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <SanketLogo variant="full" theme="dark" size="md" />

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white transition-colors px-3 py-1.5"
            >
              Officer Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-500"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="landing-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M0 40 L40 40 M40 0 L40 40" stroke="#3b82f6" strokeWidth="0.5" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#landing-grid)" />
            </svg>
          </div>

          <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold text-blue-400 mb-6 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Offline-First Digital Forensic Platform</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl max-w-4xl mx-auto leading-tight">
              Transform Fragmented Digital Evidence into{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300">
                Actionable Investigation Intelligence
              </span>
            </h1>

            <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed text-slate-300">
              SanketAI unifies disparate evidentiary records, extracts verified identities, discovers concealed mule networks, and compiles court-admissible forensic dossiers.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all"
              >
                <span>Launch Investigation Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/register')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 transition-all"
              >
                <span>Register Officer Profile</span>
              </button>
            </div>
          </div>
        </section>

        {/* Core Capabilities Grid */}
        <section className="py-20 bg-slate-950 border-t border-slate-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
                Forensic Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-2">
                Engineered for Modern Cybercrime Investigation
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                Offline-capable evidentiary vault with zero dependencies on third-party cloud infrastructure.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {capabilities.map((c, idx) => {
                const Icon = c.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all hover:shadow-lg"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2 tracking-tight">
                      {c.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-slate-400">
                      {c.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">SanketAI</span>
            <span>·</span>
            <span>Digital Investigation & Evidence Intelligence</span>
          </div>
          <div>Local Forensic Vault Edition · 100% Offline Capable</div>
        </div>
      </footer>
    </div>
  );
}
