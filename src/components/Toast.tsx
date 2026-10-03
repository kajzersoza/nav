import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md text-xs font-semibold animate-in slide-in-from-bottom-2 fade-in duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-950 border-emerald-300 dark:bg-emerald-950/90 dark:text-emerald-200 dark:border-emerald-800/80 shadow-emerald-950/10'
              : toast.type === 'error'
              ? 'bg-red-50 text-red-950 border-red-300 dark:bg-red-950/90 dark:text-red-200 dark:border-red-800/80 shadow-red-950/10'
              : 'bg-cyan-50 text-cyan-950 border-cyan-300 dark:bg-cyan-950/90 dark:text-cyan-200 dark:border-cyan-800/80 shadow-cyan-950/10'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />}
            <span>{toast.message}</span>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors shrink-0 text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
