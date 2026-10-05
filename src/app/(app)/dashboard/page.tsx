import clsx from "clsx";
import { ArrowUpRight, ContactRound, Layers3, PhoneCall, Plus } from "lucide-react";
import Link from "next/link";
import { ReportButton } from "@/components/ReportButton";
import { ButtonLink, Card, EmptyState, PageHeader, StatusBadge, stripeTone, toneFor, td, th } from "@/components/ui";
import { getCalls, getContacts, getLists } from "@/lib/api";
import { date, dateTime, humanize, number } from "@/lib/format";

export const metadata = { title: "Dashboard · Agent Gray" };

export default async function DashboardPage() {
  const [lists, { calls, total: callTotal }, { totals }] = await Promise.all([getLists(), getCalls(), getContacts()]);
  const liveCalls = calls.filter((call) => call.telephony_provider && call.telephony_provider !== "simulated").slice(0, 7);
  const liveLists = lists.filter((list) => list.run_mode === "live").slice(0, 5);
  const statusCounts = Object.entries(liveCalls.reduce<Record<string, number>>((counts, call) => ({ ...counts, [call.call_status]: (counts[call.call_status] ?? 0) + 1 }), {}));
  const running = lists.filter((list) => list.status === "running").length;
  const scheduled = lists.filter((list) => list.status === "scheduled").length;

  const metrics = [
    { label: "Contacts", value: totals.all, icon: ContactRound, foot: <span><span className="text-ink">{number(totals.newContacts)}</span> new · <span className="text-ink">{number(totals.processed)}</span> processed</span> },
    { label: "Lists", value: lists.length, icon: Layers3, href: "/lists", foot: <span><span className="text-ink">{running}</span> running · <span className="text-ink">{scheduled}</span> scheduled</span> },
    {
      label: "Call attempts", value: callTotal, icon: PhoneCall, foot: <span className="flex h-1.5 w-full max-w-56 gap-0.5 overflow-hidden rounded-full" aria-label={statusCounts.map(([status, count]) => `${humanize(status)} ${count}`).join(", ")}>
        {statusCounts.map(([status, count]) => <span key={status} className={stripeTone[toneFor(status)]} style={{ flex: count }} />)}
      </span>,
    },
  ];

  return <>
    <PageHeader title="Dashboard" description="See what is running and what needs your attention." actions={<>
      <ReportButton lists={lists} />
      <ButtonLink href="/lists/new"><Plus size={16} aria-hidden="true" /> New list</ButtonLink>
    </>} />

    {/* One strip, three cells. */}
    <Card className="grid divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {metrics.map(({ label, value, icon: Icon, href, foot }) => <div key={label} className="relative p-4 sm:p-5">
        <div className="flex items-center gap-2 text-[13px] text-muted"><Icon size={15} aria-hidden="true" />{label}</div>
        <strong className="mt-2 block text-[32px] font-semibold leading-none tabular-nums tracking-tight text-navy">{number(value)}</strong>
        <div className="mt-3 flex min-h-5 items-center text-[13px] text-muted">{foot}</div>
        {href && <Link href={href} className="absolute right-4 top-4 grid size-7 place-items-center rounded border border-line text-muted hover:border-brand-500 hover:text-brand-ink" aria-label={`View ${label.toLowerCase()}`}><ArrowUpRight size={14} aria-hidden="true" /></Link>}
      </div>)}
    </Card>

    <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <h2 className="text-sm font-semibold text-navy">Recent calls</h2>
          <ul className="hidden items-center gap-3 text-xs text-muted sm:flex">
            {statusCounts.map(([status, count]) => <li key={status} className="flex items-center gap-1.5"><span className={clsx("size-1.5 rounded-full", stripeTone[toneFor(status)])} aria-hidden="true" />{humanize(status)} <span className="tabular-nums text-ink">{count}</span></li>)}
          </ul>
        </div>
        {liveCalls.length === 0 ? <EmptyState title="No calls yet" description="Live calls will appear here after a list creates call attempts." action={<ButtonLink size="sm" href="/lists/new">Create a list</ButtonLink>} /> : <>
          <ul className="divide-y divide-line sm:hidden">
            {liveCalls.map((call) => <li key={call.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0"><strong className="block truncate text-sm font-medium text-navy">{call.contact_name || "Unknown contact"}</strong><span className="text-xs text-muted">{call.final_disposition ? humanize(call.final_disposition) : "—"} · {dateTime(call.updated_at)}</span></div>
              <StatusBadge value={call.call_status} />
            </li>)}
          </ul>
          <div className="relative hidden overflow-x-auto sm:block">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-line bg-surface-2"><th className={th}>Contact</th><th className={th}>Status</th><th className={th}>Outcome</th><th className={`${th} text-right`}>Updated</th></tr></thead>
              <tbody>{liveCalls.map((call) => <tr key={call.id} className="border-b border-line last:border-0 hover:bg-nav-hover">
                <td className={td}><span className="block whitespace-nowrap font-medium text-navy">{call.contact_name || "Unknown contact"}</span><span className="text-xs text-muted">{call.phone_e164 || "Phone unavailable"}</span></td>
                <td className={td}><StatusBadge value={call.call_status} /></td>
                <td className={`${td} text-ink`}>{call.final_disposition ? humanize(call.final_disposition) : "—"}</td>
                <td className={`${td} whitespace-nowrap text-right text-xs text-muted`}>{dateTime(call.updated_at)}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </>}
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <h2 className="text-sm font-semibold text-navy">Recent lists</h2>
          <Link href="/lists" className="text-[13px] font-medium text-brand-ink hover:underline">View lists</Link>
        </div>
        {liveLists.length === 0 ? <EmptyState title="No live lists yet" description="Live lists will appear here after you create one." /> : <ul className="divide-y divide-line">
          {liveLists.map((list) => <li key={list.id}>
            <Link href={`/lists/${list.id}`} className="relative flex items-center gap-3 py-3 pl-5 pr-4 transition hover:bg-nav-hover">
              <div className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-navy">{list.name || `List #${list.id}`}</span>
                <span className="text-xs text-muted">{number(list.contact_count)} contacts · Created {date(list.created_at)}</span>
              </div>
              <div className="text-right">
                <StatusBadge value={list.status} />
                <span className="mt-1 block text-xs tabular-nums text-muted">{list.progress_percent}%</span>
              </div>
            </Link>
          </li>)}
        </ul>}
      </Card>
    </div>
  </>;
}
