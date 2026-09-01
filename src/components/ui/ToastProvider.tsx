import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  id?: string;
  description?: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (title: string, descriptionOrOptions?: string | ToastOptions, type?: ToastType, options?: ToastOptions) => void;
  removeToast: (id: string) => void;
  toast: {
    success: (title: string, descriptionOrOptions?: string | ToastOptions, options?: ToastOptions) => void;
    error: (title: string, descriptionOrOptions?: string | ToastOptions, options?: ToastOptions) => void;
    info: (title: string, descriptionOrOptions?: string | ToastOptions, options?: ToastOptions) => void;
    warning: (title: string, descriptionOrOptions?: string | ToastOptions, options?: ToastOptions) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let globalAddToast: ((title: string, descriptionOrOptions?: string | ToastOptions, type?: ToastType, options?: ToastOptions) => void) | null = null;

export const toast = {
  success: (title: string, descriptionOrOptions?: string | ToastOptions, options?: ToastOptions) =>
    globalAddToast?.(title, descriptionOrOptions, 'success', options),
  error: (title: string, descriptionOrOptions?: string | ToastOptions, options?: ToastOptions) =>
    globalAddToast?.(title, descriptionOrOptions, 'error', options),
  info: (title: string, descriptionOrOptions?: string | ToastOptions, options?: ToastOptions) =>
    globalAddToast?.(title, descriptionOrOptions, 'info', options),
  warning: (title: string, descriptionOrOptions?: string | ToastOptions, options?: ToastOptions) =>
    globalAddToast?.(title, descriptionOrOptions, 'warning', options),
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (title: string, descriptionOrOptions?: string | ToastOptions, type: ToastType = 'info', options?: ToastOptions) => {
      let description: string | undefined;
      let customId: string | undefined;

      if (typeof descriptionOrOptions === 'object' && descriptionOrOptions !== null) {
        customId = descriptionOrOptions.id;
        description = descriptionOrOptions.description;
      } else if (typeof descriptionOrOptions === 'string') {
        description = descriptionOrOptions;
        if (options?.id) customId = options.id;
      } else if (options) {
        if (options.id) customId = options.id;
        if (options.description) description = options.description;
      }

      const id = customId || `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const newToast: ToastMessage = { id, title, description, type };

      setToasts((prev) => {
        const exists = prev.some((t) => t.id === id);
        if (exists) {
          return prev.map((t) => (t.id === id ? newToast : t));
        }
        return [...prev.slice(-4), newToast]; // Keep max 5 toasts
      });

      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  globalAddToast = addToast;

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        toast: {
          success: (t, d, o) => addToast(t, d, 'success', o),
          error: (t, d, o) => addToast(t, d, 'error', o),
          info: (t, d, o) => addToast(t, d, 'info', o),
          warning: (t, d, o) => addToast(t, d, 'warning', o),
        },
      }}
    >
      {children}

      {/* Toast Notification Container (Positioned Top Right to avoid covering bottom action buttons) */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((item) => {
          let bgStyle = 'bg-slate-900 text-white border-slate-800';
          let icon = <Info className="h-5 w-5 text-indigo-400 shrink-0" />;

          if (item.type === 'success') {
            bgStyle = 'bg-slate-900/95 text-white border-emerald-500/30 shadow-emerald-950/20';
            icon = <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />;
          } else if (item.type === 'error') {
            bgStyle = 'bg-slate-900/95 text-white border-rose-500/30 shadow-rose-950/20';
            icon = <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />;
          } else if (item.type === 'warning') {
            bgStyle = 'bg-slate-900/95 text-white border-amber-500/30 shadow-amber-950/20';
            icon = <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />;
          }

          return (
            <div
              key={item.id}
              className={`pointer-events-auto rounded-xl p-4 border backdrop-blur-md shadow-2xl flex items-start gap-3 transition-all transform translate-y-0 text-xs font-sans ${bgStyle}`}
            >
              {icon}
              <div className="flex-1 min-w-0 pr-1">
                <div className="font-bold text-white leading-tight">{item.title}</div>
                {item.description && (
                  <div className="text-[11px] text-slate-300 mt-1 leading-snug">{item.description}</div>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(item.id)}
                className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
