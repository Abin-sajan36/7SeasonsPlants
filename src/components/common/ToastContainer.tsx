import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-bottom-3 ${
              isSuccess
                ? 'bg-[#062919] text-white border-emerald-500/40'
                : isError
                ? 'bg-[#4C0519] text-white border-rose-500/40'
                : isWarning
                ? 'bg-[#451A03] text-white border-amber-500/40'
                : 'bg-[#0F172A] dark:bg-[#0a1f18] text-white border-emerald-500/20'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-[#A7F3D0]" />}
            </div>

            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold leading-tight">{toast.title}</h5>
              {toast.message && (
                <p className="text-[11px] text-[#D1FAE5]/80 mt-0.5 leading-snug">{toast.message}</p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#D1FAE5]/60 hover:text-white p-0.5 transition-colors shrink-0 cursor-pointer"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
