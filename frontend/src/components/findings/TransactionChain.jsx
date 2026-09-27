import React from 'react';
import { ArrowDown } from 'lucide-react';

function parseHops(summary) {
  if (!summary) return [];
  return summary
    .split(/\s*(?:➔|->|→|=>)\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export default function TransactionChain({ summary }) {
  const hops = parseHops(summary);
  if (hops.length < 2) {
    if (!summary) return null;
    return (
      <p className="text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200/80 rounded-lg p-2.5">
        {summary}
      </p>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 my-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
        Conduit Flow Chain · {hops.length - 1} hop{hops.length - 1 === 1 ? '' : 's'}
      </p>
      <ol className="space-y-0">
        {hops.map((hop, idx) => (
          <li key={`${hop}-${idx}`} className="flex flex-col items-start">
            <div className="border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono font-semibold text-slate-800 rounded-lg w-full shadow-xs">
              {hop}
            </div>
            {idx < hops.length - 1 && (
              <ArrowDown className="w-3.5 h-3.5 text-blue-500 my-1 ml-4" aria-hidden />
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
