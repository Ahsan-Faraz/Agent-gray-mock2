"use client";

import clsx from "clsx";
import { CreditCard, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Settings and Billing live in the profile menu now; these tabs switch between them.
const TABS = [
  { href: "/profile/settings", label: "Settings", icon: Settings },
  { href: "/profile/billing", label: "Billing", icon: CreditCard },
];

export function ProfileTabs() {
  const pathname = usePathname();
  return <nav className="mb-6 inline-flex gap-1 rounded-xl border border-line bg-surface p-1" aria-label="Account sections">
    {TABS.map(({ href, label, icon: Icon }) => {
      const active = pathname === href;
      return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={clsx("flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition", active ? "bg-brand-50 text-brand-ink" : "text-muted hover:bg-nav-hover hover:text-ink")}>
        <Icon size={16} aria-hidden="true" />{label}
      </Link>;
    })}
  </nav>;
}
