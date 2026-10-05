import clsx from "clsx";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { BRAND, humanize } from "@/lib/format";

// Mockup 2 kit: dark only, sharp 6–8px corners, hairline borders, dense rows.

type Variant = "primary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md";

const buttonBase = "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45";
const buttonVariant: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  outline: "border border-brand-500 text-brand-ink hover:bg-brand-50",
  ghost: "border border-line-strong bg-surface-2 text-ink hover:border-input hover:bg-nav-hover",
  danger: "border border-bad/50 text-bad-ink hover:bg-bad-soft",
};
const buttonSize: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-9 px-4 text-sm",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return clsx(buttonBase, buttonVariant[variant], buttonSize[size], className);
}

export function Button({ variant = "primary", size = "md", className, ...props }: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({ variant = "primary", size = "md", className, ...props }: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

export function Card({ className, ...props }: ComponentProps<"section">) {
  return <section className={clsx("rounded-lg border border-line bg-surface", className)} {...props} />;
}

export function CardHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
    <div>
      <h2 className="text-sm font-semibold text-navy">{title}</h2>
      {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
    </div>
    {action}
  </div>;
}

export function PageHeader({ title, eyebrow, description, actions }: { title: string; eyebrow?: string; description?: string; actions?: ReactNode }) {
  return <header className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-5">
    <div className="min-w-0">
      {eyebrow && <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-brand-ink">{eyebrow}</p>}
      <h1 className="text-[22px] font-semibold tracking-tight text-navy sm:text-2xl">{title}</h1>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </header>;
}

export function Logo({ className }: { className?: string }) {
  return <span className={clsx("text-[15px] tracking-tight text-navy", className)}>{BRAND.first} <strong className="font-bold">{BRAND.second}</strong></span>;
}

// The uploaded logo (public/logo.png) as a transparency mask (public/logo-mark.png),
// filled with a silver-to-blue gradient that matches the original metallic look.
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return <span
    role="img"
    aria-label={BRAND.name}
    className={clsx("inline-block shrink-0 bg-linear-to-br from-[#f5f7fb] via-[#c9d2e3] to-[#8fa8f7]", className)}
    style={{ width: size, height: size, mask: "url(/logo-mark.png) center / contain no-repeat", WebkitMask: "url(/logo-mark.png) center / contain no-repeat" }}
  />;
}

export function Brand({ size = 32, className, textClassName }: { size?: number; className?: string; textClassName?: string }) {
  return <span className={clsx("inline-flex items-center gap-2.5", className)}>
    <LogoMark size={size} />
    <Logo className={textClassName} />
  </span>;
}

const toneClass = {
  good: "border-good/30 bg-good-soft text-good-ink",
  warn: "border-warn/30 bg-warn-soft text-warn-ink",
  bad: "border-bad/30 bg-bad-soft text-bad-ink",
  brand: "border-brand-500/35 bg-brand-50 text-brand-ink",
  purple: "border-purple/35 bg-purple-soft text-purple-ink",
  neutral: "border-line-strong bg-neutral-soft text-neutral-ink",
} as const;
export type Tone = keyof typeof toneClass;

export const stripeTone: Record<Tone, string> = { good: "bg-good", warn: "bg-warn", bad: "bg-bad", brand: "bg-brand-500", purple: "bg-purple", neutral: "bg-subtle" };

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={clsx("inline-flex items-center gap-1.5 whitespace-nowrap rounded border px-2 py-0.5 text-xs font-medium", toneClass[tone])}>
    <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
    {children}
  </span>;
}

// Same status groups as the original's .status-* classes.
const TONES: Array<[Tone, string[]]> = [
  ["good", ["completed", "confirmed", "processed", "connected", "healthy", "verified", "paid", "p1 - likely answer"]],
  ["brand", ["running", "queued", "processing", "answered", "created", "waiting_for_numbers", "scheduled_starting", "checkout_pending", "pending"]],
  ["purple", ["scheduled", "voicemail", "gatekeeper", "p2 - likely voicemail"]],
  ["bad", ["failed", "wrong_person", "disconnected", "reconnect required", "busy"]],
  ["warn", ["cancelled", "needs_review", "review", "retrying", "needs attention", "no_engagement", "no-answer", "refunded", "p3 - likely unreachable"]],
];

export function toneFor(value: string | null | undefined): Tone {
  const key = (value || "unknown").toLowerCase();
  return TONES.find(([, values]) => values.includes(key))?.[0] ?? "neutral";
}

export function StatusBadge({ value, label }: { value: string | null | undefined; label?: string }) {
  return <Badge tone={toneFor(value)}>{label ?? humanize(value)}</Badge>;
}

export function Progress({ value, className }: { value: number; className?: string }) {
  const width = Math.max(0, Math.min(100, value));
  return <div className={clsx("h-1.5 overflow-hidden rounded-full bg-line", className)} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={width}>
    <div className="h-full rounded-full bg-brand-500" style={{ width: `${width}%` }} />
  </div>;
}

export function StatCard({ label, value, hint, icon }: { label: string; value: string; hint?: string; icon?: ReactNode }) {
  return <Card className="p-4">
    <div className="flex items-center justify-between text-[13px] text-muted">{label}{icon}</div>
    <strong className="mt-1 block text-2xl font-semibold tabular-nums text-navy">{value}</strong>
    {hint && <span className="mt-1 block text-[13px] text-muted">{hint}</span>}
  </Card>;
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <label className="grid gap-1.5 text-sm">
    <span className="font-medium">{label}</span>
    {children}
    {hint && <span className="text-[13px] text-muted">{hint}</span>}
  </label>;
}

export const inputClass = "h-10 w-full rounded-md border border-input bg-canvas px-3 text-sm text-ink outline-none transition placeholder:text-subtle focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 disabled:opacity-60";

export function EmptyState({ title, description, action, icon }: { title: string; description: string; action?: ReactNode; icon?: ReactNode }) {
  return <div className="grid place-items-center px-6 py-12 text-center">
    {icon && <span className="mb-3 grid size-11 place-items-center rounded-lg border border-line bg-surface-2 text-brand-ink">{icon}</span>}
    <h3 className="font-semibold text-navy">{title}</h3>
    <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>;
}

export const th = "px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.08em] text-muted";
export const td = "px-4 py-3 align-middle";
