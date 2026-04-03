'use client';

import { CheckCircle2, Info, OctagonAlert, X } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from './button';
import { useToastStore, type ToastTone } from '../../src/store/useToastStore';

const toneStyles: Record<ToastTone, string> = {
  success: 'border-emerald-200 bg-white text-slate-900 dark:border-emerald-900/80 dark:bg-slate-950 dark:text-slate-100',
  error: 'border-rose-200 bg-white text-slate-900 dark:border-rose-900/80 dark:bg-slate-950 dark:text-slate-100',
  info: 'border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100',
};

const toneIcon: Record<ToastTone, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: OctagonAlert,
  info: Info,
};

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  useEffect(() => {
    if (toasts.length === 0) {
      return;
    }

    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        removeToast(toast.id);
      }, 3500),
    );

    return () => {
      for (const timer of timers) {
        window.clearTimeout(timer);
      }
    };
  }, [removeToast, toasts]);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[120] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
      {toasts.map((toast) => {
        const Icon = toneIcon[toast.tone];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border p-4 shadow-xl transition ${toneStyles[toast.tone]}`}
          >
            <div className="flex items-center gap-3">
              <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1 self-center">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{toast.description}</p> : null}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-50"
                onClick={() => removeToast(toast.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
