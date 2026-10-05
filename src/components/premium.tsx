import clsx from "clsx";
import type { ReactNode } from "react";
import { initials } from "@/lib/format";

// Small visual building blocks shared by the dashboard, lists and billing.

export type Segment = { label: string; value: number; color: string };

// Results donut: one ring segment per outcome, with a big number in the middle.
export function Donut({ segments, size = 148, stroke = 14, center, caption }: { segments: Segment[]; size?: number; stroke?: number; center: ReactNode; caption?: ReactNode }) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const gap = segments.filter((segment) => segment.value > 0).length > 1 ? 3 : 0;
  const arcs = segments.map((segment, index) => ({
    ...segment,
    length: (segment.value / total) * circumference,
    start: segments.slice(0, index).reduce((sum, previous) => sum + (previous.value / total) * circumference, 0),
  }));
  return <div className="relative shrink-0" style={{ width: size, height: size }}>
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" role="img" aria-label={segments.map((segment) => `${segment.label} ${segment.value}`).join(", ")}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--line)" strokeWidth={stroke} />
      {arcs.filter((arc) => arc.value > 0).map((arc) => {
        const dash = Math.max(0, arc.length - gap);
        return <circle key={arc.label} cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={arc.color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${dash} ${circumference - dash}`} strokeDashoffset={-arc.start} className="transition-[stroke-dasharray] duration-700" />;
      })}
    </svg>
    <div className="absolute inset-0 grid place-items-center text-center">
      <div>{center}{caption && <div className="text-xs text-muted">{caption}</div>}</div>
    </div>
  </div>;
}

// Circular progress for lists.
export function Ring({ value, size = 40, stroke = 4, color = "var(--brand-500)", children }: { value: number; size?: number; stroke?: number; color?: string; children?: ReactNode }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, value));
  return <span className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
    <svg width={size} height={size} className="absolute inset-0 -rotate-90" aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--line)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={pct >= 100 ? "var(--good)" : color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${(pct / 100) * circumference} ${circumference}`} className="transition-[stroke-dasharray] duration-700" />
    </svg>
    <span className="relative text-[10px] font-bold tabular-nums">{children ?? `${Math.round(pct)}`}</span>
  </span>;
}

const avatarTone = {
  good: "bg-good-soft text-good-ink",
  warn: "bg-warn-soft text-warn-ink",
  bad: "bg-bad-soft text-bad-ink",
  brand: "bg-brand-50 text-brand-ink",
  purple: "bg-purple-soft text-purple-ink",
  neutral: "bg-neutral-soft text-neutral-ink",
} as const;

export function Avatar({ name, tone = "brand", size = 36 }: { name: string; tone?: keyof typeof avatarTone; size?: number }) {
  return <span className={clsx("grid shrink-0 place-items-center rounded-full text-xs font-bold ring-2 ring-surface", avatarTone[tone])} style={{ width: size, height: size }} aria-hidden="true">{initials(name || "?")}</span>;
}

// Brand gradient hero surface with soft decorative circles.
export function Hero({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={clsx("relative isolate overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-[#2f5be6] via-[#22409f] to-[#121d36] text-white shadow-[0_30px_60px_-24px_rgba(49,94,234,0.6)]", className)}>
    <span className="pointer-events-none absolute -right-16 -top-20 -z-10 size-64 rounded-full bg-white/10" aria-hidden="true" />
    <span className="pointer-events-none absolute -bottom-24 right-24 -z-10 size-52 rounded-full bg-white/[0.07]" aria-hidden="true" />
    <span className="pointer-events-none absolute -left-10 bottom-0 -z-10 h-24 w-72 rotate-12 bg-linear-to-r from-white/0 via-white/10 to-white/0 blur-2xl" aria-hidden="true" />
    {children}
  </section>;
}
