import React from 'react';

export default function SanketLogo({
  variant = 'full', // 'full' | 'icon'
  theme = 'dark',   // 'dark' (for dark navy headers/sidebars) | 'light' (for white canvas)
  size = 'md',      // 'sm' | 'md' | 'lg'
  className = '',
}) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const isDark = theme === 'dark';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Forensic Node Emblem */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size] || iconSizes.md}`}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
          <rect width="40" height="40" rx="9" fill={isDark ? '#0f172a' : '#1e293b'} />
          <circle cx="20" cy="20" r="14" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
          <polygon points="20,10 29,15 29,25 20,30 11,25 11,15" stroke="#38bdf8" strokeWidth="1.75" fill="#0f172a" fillOpacity="0.8" />
          <circle cx="20" cy="20" r="4.5" fill="#2563eb" />
          <circle cx="20" cy="20" r="2" fill="#ffffff" />
          <line x1="20" y1="10" x2="20" y2="15.5" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="29" y1="20" x2="24.5" y2="20" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="11" y1="20" x2="15.5" y2="20" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="20" y1="30" x2="20" y2="24.5" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {variant === 'full' && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1">
            <span className={`font-bold tracking-tight font-sans ${titleSizes[size] || titleSizes.md} ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Sanket<span className="text-blue-500 font-extrabold">AI</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-semibold border border-blue-500/20 uppercase tracking-widest">
              v1.0
            </span>
          </div>
          <span className={`text-[10px] font-medium tracking-wider uppercase mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Forensic Intelligence
          </span>
        </div>
      )}
    </div>
  );
}
