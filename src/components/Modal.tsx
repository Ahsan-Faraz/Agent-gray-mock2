"use client";

import { X } from "lucide-react";
import { useEffect, useId, type ReactNode } from "react";

export function Modal({ open, onClose, title, description, children, footer, wide = false }: { open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", escape);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", escape); document.body.style.overflow = overflow; };
  }, [open, onClose]);
  if (!open) return null;

  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-overlay backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} className={`flex max-h-[92dvh] w-full flex-col rounded-t-xl border border-line-strong bg-surface shadow-[0_24px_60px_rgba(0,0,0,0.5)] sm:rounded-lg ${wide ? "sm:max-w-2xl" : "sm:max-w-lg"}`}>
      <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
        <div>
          <h2 id={`${id}-title`} className="text-lg font-bold text-navy">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
        </div>
        <button autoFocus onClick={onClose} className="grid size-8 shrink-0 place-items-center rounded-full border border-line text-muted hover:bg-nav-hover hover:text-ink" aria-label="Close dialog"><X size={17} /></button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">{children}</div>
      {footer && <footer className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-4 sm:px-6">{footer}</footer>}
    </section>
  </div>;
}
