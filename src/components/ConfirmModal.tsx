import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemDetails?: {
    label: string;
    value: string;
  }[];
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  itemDetails,
  confirmText = 'Törlés véglegesítése',
  cancelText = 'Mégse',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isDestructive ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
            }`}>
              {isDestructive ? <Trash2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3.5 text-xs text-slate-300">
          <p className="leading-relaxed">
            {message}
          </p>

          {itemDetails && itemDetails.length > 0 && (
            <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1.5 font-mono text-[11px]">
              {itemDetails.map((detail, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-slate-500">{detail.label}:</span>
                  <span className="font-semibold text-slate-200">{detail.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-slate-800 bg-slate-950/30">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm active:scale-95 ${
              isDestructive
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-950'
                : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-cyan-950'
            }`}
          >
            {isDestructive && <Trash2 className="w-3.5 h-3.5" />}
            <span>{confirmText}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
