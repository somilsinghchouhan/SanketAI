import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, ShieldCheck, Database } from 'lucide-react';
import { evidenceService } from '../../services/evidenceService';
import { formatBytes } from '../../utils/formatters';

const ALLOWED = ['.csv', '.xlsx', '.xls', '.json'];

function isAllowed(file) {
  const name = file.name.toLowerCase();
  return ALLOWED.some((ext) => name.endsWith(ext));
}

function mergeFiles(current, incoming) {
  const next = [...current];
  incoming.forEach((file) => {
    const exists = next.some((f) => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified);
    if (!exists) next.push(file);
  });
  return next;
}

export default function UploadModal({ isOpen, onClose, caseId, onUploadSuccess }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fileProgress, setFileProgress] = useState(0);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const addIncoming = (list) => {
    const incoming = Array.from(list || []);
    if (!incoming.length) return;
    const rejected = incoming.filter((f) => !isAllowed(f));
    const accepted = incoming.filter(isAllowed);
    setFiles((prev) => mergeFiles(prev, accepted));
    setError(
      rejected.length
        ? `Skipped unsupported file(s): ${rejected.map((f) => f.name).join(', ')}. Allowed formats: CSV, XLS, XLSX, JSON.`
        : null
    );
    setResults([]);
  };

  const handleFileChange = (e) => {
    addIncoming(e.target.files);
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    addIncoming(e.dataTransfer.files);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!files.length || !caseId) return;

    setUploading(true);
    setError(null);
    const uploaded = [...results];
    const already = new Set(uploaded.map((r) => r.original_filename));
    const failures = [];

    for (let i = 0; i < files.length; i += 1) {
      setCurrentIndex(i);
      if (already.has(files[i].name)) continue;
      setFileProgress(0);
      try {
        const result = await evidenceService.uploadEvidence(caseId, files[i], (progressEvent) => {
          if (progressEvent.total) {
            setFileProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
          }
        });
        uploaded.push(result);
        already.add(files[i].name);
        setResults([...uploaded]);
      } catch (err) {
        failures.push({ name: files[i].name, message: err.message || 'Upload failed' });
      }
    }

    setUploading(false);
    setFileProgress(100);

    if (uploaded.length && onUploadSuccess) {
      onUploadSuccess(uploaded);
    }

    if (failures.length) {
      setError(
        `${failures.length} file(s) failed: ${failures.map((f) => `${f.name} (${f.message})`).join('; ')}`
      );
    }
  };

  const handleClose = () => {
    if (uploading) return;
    setFiles([]);
    setError(null);
    setResults([]);
    setFileProgress(0);
    setCurrentIndex(0);
    onClose();
  };

  const allDone = results.length > 0 && !uploading && results.length === files.length && !error;
  const displayPct = uploading
    ? Math.round(((currentIndex + fileProgress / 100) / files.length) * 100)
    : results.length
      ? Math.round((results.length / files.length) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white">Ingest Digital Evidence</h2>
              <p className="text-[11px] text-slate-300">
                Target Vault: <span className="font-mono font-bold text-blue-300">{caseId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-40"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {allDone ? (
            <div className="p-5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-4">
              <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{results.length} evidence file{results.length === 1 ? '' : 's'} registered & hashed</span>
              </div>
              <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {results.map((item) => (
                  <li key={item.id} className="text-xs rounded-lg border border-emerald-200 bg-white p-3 space-y-1 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 truncate">{item.original_filename}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                        {item.record_count} records
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 break-all bg-slate-50 p-1.5 rounded border border-slate-100">
                      SHA-256: {item.sha256_hash}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Complete & Return to Vault
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpload} className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  files.length 
                    ? 'border-blue-500 bg-blue-50/40' 
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-50'
                } ${uploading ? 'pointer-events-none opacity-70' : ''}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".csv,.xlsx,.xls,.json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className={`w-12 h-12 rounded-xl mb-3 flex items-center justify-center ${
                  files.length ? 'bg-blue-100 text-blue-600' : 'bg-white text-slate-400 border border-slate-200 shadow-xs'
                }`}>
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800 text-center">
                  Drag and drop evidence files here, or click to browse
                </p>
                <p className="text-xs text-slate-500 mt-1 text-center max-w-sm">
                  Supported: CSV, XLSX, XLS, JSON — Bank ledgers, CDR records, IPDR sessions, and suspect device dumps
                </p>
              </div>

              {files.length > 0 && (
                <ul className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-48 overflow-y-auto bg-white shadow-xs">
                  {files.map((file, index) => {
                    const done = results.some((r) => r.original_filename === file.name);
                    const active = uploading && index === currentIndex;
                    return (
                      <li key={`${file.name}-${file.lastModified}`} className="flex items-center gap-3 px-4 py-2.5 text-xs hover:bg-slate-50/50 transition-colors">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-800 truncate">{file.name}</p>
                          <p className="font-mono text-[10px] text-slate-400">{formatBytes(file.size)}</p>
                        </div>
                        {done && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Ingested
                          </span>
                        )}
                        {active && (
                          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            {fileProgress}%
                          </span>
                        )}
                        {!uploading && (
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                            aria-label={`Remove ${file.name}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}

              {uploading && (
                <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span className="font-medium">
                      Uploading {currentIndex + 1} of {files.length}: <span className="font-bold text-slate-800">{files[currentIndex]?.name}</span>
                    </span>
                    <span className="font-mono font-bold text-blue-600">{displayPct}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-200 rounded-full" 
                      style={{ width: `${displayPct}%` }} 
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={uploading}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!files.length || uploading}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Ingesting {currentIndex + 1}/{files.length}…</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload & Hash {files.length ? `(${files.length})` : ''}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
