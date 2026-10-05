"use client";

import clsx from "clsx";
import { CheckCircle2, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type Toast = { id: number; message: string; tone: "success" | "info" };
const ToastContext = createContext<(message: string, tone?: Toast["tone"]) => void>(() => {});

// Lightweight confirmations ("Saved", "List started") in the bottom corner.
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dismiss = useCallback((id: number) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);
  const show = useCallback((message: string, tone: Toast["tone"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current.slice(-2), { id, message, tone }]);
    window.setTimeout(() => dismiss(id), 3800);
  }, [dismiss]);

  return <ToastContext.Provider value={show}>
    {children}
    <div className="pointer-events-none fixed inset-x-4 bottom-24 z-[60] flex flex-col items-center gap-2 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:items-end" role="status" aria-live="polite">
      {toasts.map((toast) => <div key={toast.id} className="toast-in pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-sm shadow-[0_16px_40px_-12px_rgba(16,24,40,0.35)]">
        <span className={clsx("grid size-8 shrink-0 place-items-center rounded-full", toast.tone === "success" ? "bg-good-soft text-good-ink" : "bg-brand-50 text-brand-ink")}>
          {toast.tone === "success" ? <CheckCircle2 size={17} aria-hidden="true" /> : <Info size={17} aria-hidden="true" />}
        </span>
        <span className="flex-1 font-medium text-ink">{toast.message}</span>
        <button onClick={() => dismiss(toast.id)} className="grid size-7 place-items-center rounded-full text-muted hover:bg-nav-hover hover:text-ink" aria-label="Dismiss"><X size={15} /></button>
      </div>)}
    </div>
  </ToastContext.Provider>;
}

export function useToast() {
  return useContext(ToastContext);
}
