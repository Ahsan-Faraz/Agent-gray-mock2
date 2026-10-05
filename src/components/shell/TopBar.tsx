"use client";

import clsx from "clsx";
import { ChevronDown, ChevronRight, Coins, CreditCard, LifeBuoy, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/ui";
import { initials, number } from "@/lib/format";
import type { User } from "@/lib/types";

const MENU_ITEMS = [
  { href: "/profile/settings", label: "Settings", icon: Settings },
  { href: "/profile/billing", label: "Billing", icon: CreditCard },
  { href: "/help", label: "Help", icon: LifeBuoy },
];

// Page trail shown in the top bar: [label, href?] pairs.
function crumbs(pathname: string): Array<[string, string?]> {
  if (pathname === "/lists/new") return [["Lists", "/lists"], ["Create list"]];
  if (pathname.startsWith("/lists/")) return [["Lists", "/lists"], ["List details"]];
  if (pathname.startsWith("/lists")) return [["Lists"]];
  if (pathname.startsWith("/integrations")) return [["Integrations"]];
  if (pathname.startsWith("/profile/settings")) return [["Settings"]];
  if (pathname.startsWith("/profile/billing")) return [["Billing"]];
  if (pathname.startsWith("/help")) return [["Help"]];
  return [["Dashboard"]];
}

function ProfileMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) { setLastPath(pathname); setOpen(false); }

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => { if (!ref.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", escape); };
  }, [open]);

  return <div className="relative" ref={ref}>
    <button onClick={() => setOpen((value) => !value)} className="flex items-center gap-2 rounded-md border border-line-strong bg-surface-2 py-1 pl-1 pr-2 transition hover:border-input" aria-haspopup="menu" aria-expanded={open} aria-label="Account menu">
      <span className="grid size-7 place-items-center rounded bg-brand-600 text-xs font-semibold text-white">{initials(user.name)}</span>
      <span className="hidden max-w-32 truncate text-[13px] font-medium lg:block">{user.name}</span>
      <ChevronDown size={14} className={clsx("text-muted transition", open && "rotate-180")} aria-hidden="true" />
    </button>
    {open && <div role="menu" className="absolute right-0 top-11 z-50 w-[min(17rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-line-strong bg-surface-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      <div className="border-b border-line px-4 py-3">
        <strong className="block truncate text-sm text-navy">{user.name}</strong>
        <span className="block truncate text-[13px] text-muted">{user.email}</span>
        <span className="mt-1 block text-xs text-muted">{user.organization}</span>
      </div>
      <div className="p-1">
        {MENU_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return <Link key={href} role="menuitem" href={href} className={clsx("flex items-center gap-3 rounded-md px-3 py-2 text-sm", active ? "bg-brand-50 text-brand-ink" : "text-ink hover:bg-nav-hover")}>
            <Icon size={16} className={active ? "" : "text-muted"} aria-hidden="true" />{label}
          </Link>;
        })}
      </div>
      <div className="border-t border-line p-1">
        <Link role="menuitem" href="/login" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-bad-ink hover:bg-bad-soft">
          <LogOut size={16} aria-hidden="true" />Sign out
        </Link>
      </div>
    </div>}
  </div>;
}

export function TopBar({ user, credits }: { user: User; credits: number }) {
  const pathname = usePathname();
  const trail = crumbs(pathname);
  return <header className="sticky top-0 z-40 border-b border-line bg-canvas">
    <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
      <Link href="/dashboard" className="rounded-md md:hidden" aria-label="Agent Gray home"><LogoMark size={28} /></Link>
      <nav aria-label="Breadcrumb" className="min-w-0">
        <ol className="flex items-center gap-1.5 text-sm">
          <li className="hidden text-muted sm:block">Workspace</li>
          {trail.map(([label, href], index) => <li key={label} className="flex min-w-0 items-center gap-1.5">
            <ChevronRight size={14} className={clsx("text-subtle", index === 0 && "hidden sm:block")} aria-hidden="true" />
            {href ? <Link href={href} className="text-muted hover:text-ink">{label}</Link> : <span className="truncate font-medium text-navy" aria-current="page">{label}</span>}
          </li>)}
        </ol>
      </nav>
      <div className="ml-auto flex items-center gap-2">
        <Link href="/profile/billing" className="flex h-9 items-center gap-1.5 rounded-md border border-line-strong bg-surface-2 px-2.5 text-[13px] text-muted transition hover:border-input md:hidden" aria-label="View credits and billing">
          <Coins size={15} className="text-brand-ink" aria-hidden="true" /><strong className="tabular-nums text-ink">{number(credits)}</strong>
        </Link>
        <ProfileMenu user={user} />
      </div>
    </div>
  </header>;
}
