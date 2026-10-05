import { ArrowRight, ContactRound, Layers3, PhoneCall, Plus } from "lucide-react";
import Link from "next/link";
import { Avatar, Donut, Hero, Ring } from "@/components/premium";
import { ReportButton } from "@/components/ReportButton";
import { ButtonLink, Card, EmptyState, PageHeader, StatusBadge, toneFor } from "@/components/ui";
import { getCalls, getContacts, getLists } from "@/lib/api";
import { date, dateTime, humanize, number, percent } from "@/lib/format";

export const metadata = { title: "Dashboard · Agent Gray" };

export default async function DashboardPage() {
  const [lists, { calls, total: callTotal }, { totals }] = await Promise.all([getLists(), getCalls(), getContacts()]);
  const liveCalls = calls.filter((call) => call.telephony_provider && call.telephony_provider !== "simulated").slice(0, 7);
  const liveLists = lists.filter((list) => list.run_mode === "live").slice(0, 4);
  const running = lists.filter((list) => list.status === "running");
  const scheduled = lists.filter((list) => list.status === "scheduled").length;
  const active = running[0];

  const results = lists.reduce((sum, list) => ({
    verified: sum.verified + list.verified_count,
    noEngagement: sum.noEngagement + list.no_engagement_count,
    wrongPerson: sum.wrongPerson + list.wrong_person_count,
    failures: sum.failures + list.failure_count,
  }), { verified: 0, noEngagement: 0, wrongPerson: 0, failures: 0 });
  const processed = results.verified + results.noEngagement + results.wrongPerson + results.failures;
  const segments = [
    { label: "Verified", value: results.verified, color: "var(--good)" },
    { label: "No engagement", value: results.noEngagement, color: "var(--warn)" },
    { label: "Wrong person", value: results.wrongPerson, color: "var(--bad)" },
    { label: "Failures", value: results.failures, color: "var(--subtle)" },
  ];
  const heroStats = [
    { label: "Contacts", value: totals.all, icon: ContactRound, foot: `${number(totals.newContacts)} new · ${number(totals.processed)} processed` },
    { label: "Lists", value: lists.length, icon: Layers3, foot: `${running.length} running · ${scheduled} scheduled` },
    { label: "Call attempts", value: callTotal, icon: PhoneCall, foot: `${number(processed)} processed contacts` },
  ];

  return <>
    <PageHeader title="Dashboard" description="See what is running and what needs your attention." actions={<>
      <ReportButton lists={lists} />
      <ButtonLink href="/lists/new"><Plus size={16} aria-hidden="true" /> New list</ButtonLink>
    </>} />

    {/* Hero strip: three counts, plus the list that is running now. */}
    <Hero className="rise grid lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="grid gap-6 p-6 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-white/10 sm:p-7">
        {heroStats.map(({ label, value, icon: Icon, foot }) => <div key={label} className="sm:px-6 sm:first:pl-0">
          <span className="flex items-center gap-2 text-sm text-white/75"><Icon size={16} aria-hidden="true" />{label}</span>
          <strong className="mt-3 block text-[42px] font-semibold leading-none tracking-tight tabular-nums">{number(value)}</strong>
          <span className="mt-2 block text-[13px] text-white/65">{foot}</span>
        </div>)}
      </div>
      {active && <Link href={`/lists/${active.id}`} className="group flex items-center gap-4 border-t border-white/10 bg-black/15 p-6 transition hover:bg-black/25 lg:border-l lg:border-t-0">
        <span className="relative grid place-items-center">
          <svg width="84" height="84" className="-rotate-90" aria-hidden="true"><circle cx="42" cy="42" r="36" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="7" /><circle cx="42" cy="42" r="36" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${(active.progress_percent / 100) * 226} 226`} /></svg>
          <strong className="absolute text-lg tabular-nums">{active.progress_percent}%</strong>
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-xs text-white/70"><span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-[#7be0b6] opacity-60" /><span className="relative inline-flex size-2 rounded-full bg-[#7be0b6]" /></span>{humanize(active.status)}</span>
          <span className="mt-1 block truncate font-semibold">{active.name}</span>
          <span className="mt-0.5 block text-[13px] text-white/70">{number(active.processed_count)} of {number(active.contact_count)} processed</span>
        </span>
        <ArrowRight size={18} className="text-white/70 transition group-hover:translate-x-0.5 group-hover:text-white" aria-hidden="true" />
      </Link>}
    </Hero>

    <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <Card className="rise overflow-hidden [animation-delay:80ms]">
        <div className="flex items-center justify-between px-5 pb-1 pt-5"><h2 className="text-[15px] font-medium text-navy">Recent calls</h2></div>
        {liveCalls.length === 0 ? <EmptyState title="No calls yet" description="Live calls will appear here after a list creates call attempts." action={<ButtonLink size="sm" href="/lists/new">Create a list</ButtonLink>} /> : <ul className="px-2.5 pb-2.5">
          {liveCalls.map((call) => <li key={call.id} className="flex items-center gap-3 rounded-lg px-2.5 py-2.5 transition hover:bg-white/[0.03]">
            <Avatar name={call.contact_name} tone={toneFor(call.call_status)} />
            <div className="min-w-0 flex-1">
              <strong className="block truncate text-sm font-medium text-navy">{call.contact_name || "Unknown contact"}</strong>
              <span className="block truncate text-xs text-muted">{call.phone_e164 || "Phone unavailable"} · {call.final_disposition ? humanize(call.final_disposition) : "—"}</span>
            </div>
            <span className="hidden text-xs tabular-nums text-muted md:block">{dateTime(call.updated_at)}</span>
            <StatusBadge value={call.call_status} />
          </li>)}
        </ul>}
      </Card>

      <div className="grid content-start gap-5">
        <Card className="rise p-5 [animation-delay:140ms]">
          <h2 className="text-[15px] font-medium text-navy">Results</h2>
          <div className="mt-4 flex items-center gap-5">
            <Donut size={128} stroke={12} segments={segments} center={<strong className="block text-2xl font-semibold tabular-nums text-navy">{percent(results.verified, processed)}%</strong>} caption="Verified" />
            <ul className="grid flex-1 gap-2.5 text-[13px]">
              {segments.map((segment) => <li key={segment.label} className="flex items-center gap-2.5">
                <span className="size-2 rounded-full" style={{ background: segment.color }} aria-hidden="true" />
                <span className="flex-1 text-muted">{segment.label}</span>
                <strong className="font-medium tabular-nums text-navy">{number(segment.value)}</strong>
              </li>)}
            </ul>
          </div>
        </Card>

        <Card className="rise overflow-hidden [animation-delay:200ms]">
          <div className="flex items-center justify-between px-5 pb-1 pt-5">
            <h2 className="text-[15px] font-medium text-navy">Recent lists</h2>
            <Link href="/lists" className="text-[13px] font-medium text-brand-ink hover:underline">View lists</Link>
          </div>
          {liveLists.length === 0 ? <EmptyState title="No live lists yet" description="Live lists will appear here after you create one." /> : <ul className="px-2.5 pb-2.5">
            {liveLists.map((list) => <li key={list.id}>
              <Link href={`/lists/${list.id}`} className="flex items-center gap-3 rounded-lg px-2.5 py-2.5 transition hover:bg-white/[0.03]">
                <Ring value={list.progress_percent} size={38} />
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-sm font-medium text-navy">{list.name || `List #${list.id}`}</strong>
                  <span className="text-xs text-muted">{number(list.contact_count)} contacts · Created {date(list.created_at)}</span>
                </div>
                <StatusBadge value={list.status} />
              </Link>
            </li>)}
          </ul>}
        </Card>
      </div>
    </div>
  </>;
}
