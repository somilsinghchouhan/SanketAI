import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Phone,
  CreditCard,
  AtSign,
  Globe,
  Cpu,
  Network,
  ShieldAlert
} from 'lucide-react';

function getCategoryConfig(type) {
  const t = String(type || '').toUpperCase();
  switch (t) {
    case 'PHONE':
      return {
        icon: Phone,
        border: 'border-indigo-400',
        badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        bar: 'bg-indigo-500',
      };
    case 'ACCOUNT':
      return {
        icon: CreditCard,
        border: 'border-blue-400',
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
        bar: 'bg-blue-500',
      };
    case 'UPI':
      return {
        icon: AtSign,
        border: 'border-emerald-400',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        bar: 'bg-emerald-500',
      };
    case 'IP':
      return {
        icon: Globe,
        border: 'border-cyan-400',
        badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        bar: 'bg-cyan-500',
      };
    case 'IMEI':
    case 'IMSI':
      return {
        icon: Cpu,
        border: 'border-purple-400',
        badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
        bar: 'bg-purple-500',
      };
    default:
      return {
        icon: Network,
        border: 'border-slate-300',
        badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
        bar: 'bg-slate-500',
      };
  }
}

function getSeverityBadge(severity) {
  const s = String(severity || '').toUpperCase();
  if (s === 'CRITICAL') {
    return 'bg-red-50 text-red-700 border-red-200';
  }
  if (s === 'HIGH') {
    return 'bg-orange-50 text-orange-700 border-orange-200';
  }
  if (s === 'MED' || s === 'MEDIUM') {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }
  return 'bg-emerald-50 text-emerald-700 border-emerald-200';
}

function EntityNode({ data, selected }) {
  const config = getCategoryConfig(data.type);
  const Icon = config.icon;
  const isHighRisk = data.risk > 50 || ['CRITICAL', 'HIGH'].includes(String(data.severity).toUpperCase());

  return (
    <div
      className={`min-w-[190px] max-w-[260px] bg-white rounded-xl border-2 transition-all duration-150 shadow-md ${
        selected
          ? 'border-blue-600 ring-4 ring-blue-500/20 shadow-lg scale-105'
          : isHighRisk
          ? `${config.border} hover:shadow-lg`
          : 'border-slate-200 hover:border-slate-300 hover:shadow-lg'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-500 !w-2.5 !h-2.5 !border-2 !border-white !rounded-full shadow-xs"
      />

      {/* Top Accent Strip */}
      <div className={`h-1.5 w-full rounded-t-lg ${config.bar}`} />

      <div className="p-3">
        {/* Type Header */}
        <div className="flex items-center justify-between gap-1.5 mb-1.5">
          <span
            className={`inline-flex items-center gap-1 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full border ${config.badgeBg}`}
          >
            <Icon className="w-3 h-3 shrink-0" />
            {data.type || 'ENTITY'}
          </span>

          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getSeverityBadge(
              data.severity
            )}`}
          >
            {data.severity || 'LOW'}
          </span>
        </div>

        {/* Identifier Value */}
        <div
          className="font-mono text-xs font-bold text-slate-900 truncate"
          title={data.label}
        >
          {data.label}
        </div>

        {/* Risk Score Footer */}
        <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 text-[10px] text-slate-500">
          <span>Threat Score</span>
          <span className="font-mono font-bold text-slate-900">
            {data.risk ?? 0}/100
          </span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-blue-500 !w-2.5 !h-2.5 !border-2 !border-white !rounded-full shadow-xs"
      />
    </div>
  );
}

export default memo(EntityNode);
