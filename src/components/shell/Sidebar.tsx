"use client";

import clsx from "clsx";
import { ChevronsLeft, ChevronsRight, Coins, LayoutDashboard, LifeBuoy, ListChecks, Plug, Plus, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { Logo, LogoMark } from "@/components/ui";
import { number } from "@/lib/format";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/lists", label: "Lists", icon: ListChecks },
  { href: "/integrations", label: "Integrations", icon: Plug },
];

const WIDE = "248px";
const NARROW = "76px";

// Collapsed state lives in localStorage so it survives navigation and reloads.
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
function readCollapsed() {
  try { return localStorage.getItem("sidebar") === "collapsed"; } catch { return false; }
}

// Wide labeled sidebar that can collapse to icons. The width is published as
// --sidebar-w so the page content shifts with it.
export function Sidebar({ credits, totalCredits, running }: { credits: number; totalCredits: number; running: number }) {
  const pathname = usePathname();
  const collapsed = useSyncExternalStore(subscribe, readCollapsed, () => false);
  const setCollapsed = (next: boolean) => {
    try { localStorage.setItem("sidebar", next ? "collapsed" : "open"); } catch {}
    listeners.forEach((listener) => listener());
  };
  useEffect(() => {
    document.documentElement.style.setProperty("--sidebar-w", collapsed ? NARROW : WIDE);
  }, [collapsed]);

  const item = (href: string, label: string, Icon: typeof Plug, badge?: number) => {
    const active = pathname.startsWith(href);
    return <Link key={href} href={href} aria-current={active ? "page" : undefined} title={collapsed ? label : undefined} className={clsx("group flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors", active ? "bg-brand-600 text-white" : "text-nav hover:bg-nav-hover hover:text-navy", collapsed && "justify-center px-0")}>
      <Icon size={18} aria-hidden="true" className="shrink-0" />
      {!collapsed && <span className="flex-1">{label}</span>}
      {!collapsed && badge ? <span className={clsx("rounded px-1.5 text-[11px] font-semibold tabular-nums", active ? "bg-white/20 text-white" : "bg-brand-50 text-brand-ink")}>{badge}</span> : null}
    </Link>;
  };

  return <aside className="fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-line bg-sidebar transition-[width] duration-200 md:flex" style={{ width: collapsed ? NARROW : WIDE }} aria-label="Sidebar">
    <div className={clsx("flex h-14 items-center border-b border-line px-4", collapsed ? "justify-center px-0" : "gap-2.5")}>
      <Link href="/dashboard" className="flex items-center gap-2.5 rounded-md" aria-label="Agent Gray home"><LogoMark size={34} />{!collapsed && <Logo />}</Link>
    </div>

    <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
      <Link href="/lists/new" title={collapsed ? "New list" : undefined} className={clsx("mb-3 flex h-10 items-center justify-center gap-2 rounded-md border border-dashed border-brand-500 text-sm font-medium text-brand-ink transition hover:bg-brand-50")}>
        <Plus size={17} aria-hidden="true" />{!collapsed && "New list"}
      </Link>
      <nav className="grid gap-1" aria-label="Main">
        {NAV_ITEMS.map(({ href, label, icon }) => item(href, label, icon, href === "/lists" ? running : undefined))}
      </nav>

      <div className="mt-auto grid gap-2 pt-4">
        {!collapsed ? <Link href="/profile/billing" className="rounded-lg border border-line bg-surface p-3 transition hover:border-line-strong" aria-label="View credits and billing">
          <span className="flex items-center justify-between text-xs text-muted"><span className="flex items-center gap-1.5"><Coins size={14} aria-hidden="true" /> Credits</span><span className="text-brand-ink">Billing</span></span>
          <strong className="mt-1 block text-lg font-semibold tabular-nums text-navy">{number(credits)}</strong>
          <span className="mt-2 block h-1 overflow-hidden rounded-full bg-line"><span className="block h-full rounded-full bg-brand-500" style={{ width: `${Math.round((credits / Math.max(totalCredits, 1)) * 100)}%` }} /></span>
        </Link> : <Link href="/profile/billing" title={`${number(credits)} credits`} className="grid h-10 place-items-center rounded-md text-nav hover:bg-nav-hover" aria-label="View credits and billing"><Coins size={18} aria-hidden="true" /></Link>}
        {item("/help", "Help", LifeBuoy)}
        <button onClick={() => setCollapsed(!collapsed)} className={clsx("flex h-9 items-center gap-3 rounded-md px-3 text-[13px] text-muted hover:bg-nav-hover hover:text-ink", collapsed && "justify-center px-0")} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {collapsed ? <ChevronsRight size={17} aria-hidden="true" /> : <><ChevronsLeft size={17} aria-hidden="true" /> Collapse</>}
        </button>
      </div>
    </div>
  </aside>;
}

// Phones: navigation moves to a bottom bar.
export function BottomNav() {
  const pathname = usePathname();
  const items = [...NAV_ITEMS, { href: "/profile/settings", label: "Account", icon: UserRound }];
  return <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-sidebar pb-[env(safe-area-inset-bottom)] md:hidden" aria-label="Main">
    <div className="mx-auto grid max-w-md grid-cols-4">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href) || (href === "/profile/settings" && (pathname.startsWith("/profile") || pathname.startsWith("/help")));
        return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={clsx("relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium", active ? "text-white" : "text-nav")}>
          {active && <span className="absolute inset-x-6 top-0 h-0.5 rounded-b bg-brand-500" aria-hidden="true" />}
          <Icon size={19} aria-hidden="true" />{label}
        </Link>;
      })}
    </div>
  </nav>;
}
