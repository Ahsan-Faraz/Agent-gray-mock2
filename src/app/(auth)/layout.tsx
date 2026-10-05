import { Fingerprint, History, ServerCog } from "lucide-react";
import Link from "next/link";
import { Logo, LogoMark } from "@/components/ui";

const proof = [
  { icon: ServerCog, title: "Durable", body: "Server-backed state" },
  { icon: History, title: "Traceable", body: "Evidence history" },
  { icon: Fingerprint, title: "Scoped", body: "Workspace access" },
];

// One centered panel: brand on the left, form on the right. Fits a laptop
// screen without scrolling; stacks on phones.
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-canvas p-4 sm:p-6">
    <div className="pointer-events-none absolute -left-40 -top-40 size-[520px] rounded-full bg-[#315eea]/15 blur-[120px]" aria-hidden="true" />
    <div className="pointer-events-none absolute -bottom-48 -right-40 size-[520px] rounded-full bg-[#7656c7]/10 blur-[120px]" aria-hidden="true" />

    <div className="relative grid w-full max-w-[960px] overflow-hidden rounded-xl border border-line-strong bg-surface shadow-[0_30px_80px_rgba(0,0,0,0.5)] md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <aside className="flex flex-col justify-between gap-8 border-b border-line bg-sidebar p-7 md:border-b-0 md:border-r md:p-9">
        <Link href="/login" className="flex items-center gap-3 self-start rounded-md" aria-label="Agent Gray home"><LogoMark size={44} /><Logo className="text-lg" /></Link>
        <div>
          <p className="text-[13px] text-muted">Contact verification workspace</p>
          <h1 className="mt-3 text-[28px] font-semibold leading-tight tracking-tight text-navy lg:text-[32px]">Know Who To Call <span className="block text-brand-200">Before You Call</span></h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">Manage contacts, verification lists, call evidence, and connected CRM synchronization from one workspace.</p>
        </div>
        <ul className="hidden gap-3 md:grid">
          {proof.map(({ icon: Icon, title, body }) => <li key={title} className="flex items-center gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-md border border-line bg-surface text-brand-ink"><Icon size={16} aria-hidden="true" /></span>
            <span className="text-sm"><strong className="font-medium text-navy">{title}</strong> <span className="text-muted">· {body}</span></span>
          </li>)}
        </ul>
      </aside>
      <main className="flex items-center p-6 sm:p-9">
        <div className="w-full">{children}</div>
      </main>
    </div>
  </div>;
}
