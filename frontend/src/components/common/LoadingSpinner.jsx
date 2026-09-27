import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({
  text = 'Accessing SanketAI forensic engine...',
  size = 'md',
  className = '',
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  }[size] || 'w-7 h-7';

  return (
    <div className={`flex flex-col items-center justify-center py-14 px-4 text-center ${className}`}>
      <div className="relative flex items-center justify-center mb-3">
        <Loader2 className={`${sizeClasses} text-blue-600 animate-spin`} />
      </div>
      {text && (
        <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
          {text}
        </p>
      )}
    </div>
  );
}
