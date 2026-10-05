"use client";

import clsx from "clsx";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, FileSpreadsheet, RefreshCw, Table2, Upload, Users, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type DragEvent, type ReactNode } from "react";
import { Button, ButtonLink, Card, PageHeader, buttonClass, inputClass, td, th } from "@/components/ui";
import { previewTimezones } from "@/lib/api";
import { date, number, sourceLabel } from "@/lib/format";
import type { ContactRow, TimezoneReviewContact } from "@/lib/types";

// Content follows the original "Create batch" page (batch -> list), split into three steps.
type SelectionMode = "new_only" | "selected" | "rerun_processed";
type Origin = "csv" | "contacts";

const MODES: Array<{ value: SelectionMode; icon: typeof Table2; title: string; body: string }> = [
  { value: "new_only", icon: Table2, title: "New only", body: "Contacts with no prior verification snapshot." },
  { value: "selected", icon: CheckCircle2, title: "Selected", body: "Choose exact durable Contacts below." },
  { value: "rerun_processed", icon: RefreshCw, title: "Rerun processed", body: "Re-execute contacts with prior results." },
];
const STEPS = ["Contacts", "Details", "Review"] as const;
const TIMEZONES = ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Phoenix", "Pacific/Honolulu", "America/Anchorage"];

function tomorrow() {
  const value = new Date();
  value.setDate(value.getDate() + 1);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

function isSunday(value: string) {
  return Boolean(value) && new Date(`${value}T00:00:00`).getDay() === 0;
}

function StepRail({ step, summary }: { step: number; summary: string[] }) {
  return <ol className="relative grid gap-0" aria-label="Steps">
    {STEPS.map((label, index) => {
      const done = index < step;
      const current = index === step;
      return <li key={label} className="relative flex gap-3 pb-6 last:pb-0" aria-current={current ? "step" : undefined}>
        {index < STEPS.length - 1 && <span className={clsx("absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-px", done ? "bg-brand-500" : "bg-line-strong")} aria-hidden="true" />}
        <span className={clsx("relative z-10 grid size-7 shrink-0 place-items-center rounded-full border text-xs", done ? "border-brand-500 bg-brand-600 text-white" : current ? "border-brand-500 bg-brand-50 text-brand-ink" : "border-line-strong bg-surface text-muted")}>
          {done ? <Check size={14} strokeWidth={3} aria-hidden="true" /> : index + 1}
        </span>
        <span className="pt-0.5">
          <span className={clsx("block text-sm font-medium", current ? "text-navy" : done ? "text-ink" : "text-muted")}>{label}</span>
          {summary[index] && <span className="block text-xs text-muted">{summary[index]}</span>}
        </span>
      </li>;
    })}
  </ol>;
}

function SchedulePolicy({ value }: { value: string }) {
  if (!value) return null;
  if (isSunday(value)) return <div className="rounded-md border border-bad/40 bg-bad-soft px-3.5 py-2.5 text-sm text-bad-ink" role="alert">
    <strong className="block font-medium">This date can&apos;t be scheduled</strong>
    <ul className="ml-4 list-disc"><li>Sundays are closed.</li></ul>
    <span>Choose another weekday.</span>
  </div>;
  return <div className="rounded-md border border-good/40 bg-good-soft px-3.5 py-2.5 text-sm text-good-ink" role="status">
    <strong className="block font-medium">Date available</strong>Weekday with no US federal or state holiday closure.
  </div>;
}

function StepCard({ title, description, children, footer }: { title: string; description?: string; children: ReactNode; footer: ReactNode }) {
  return <Card>
    <div className="border-b border-line px-5 py-4">
      <h2 className="font-semibold text-navy">{title}</h2>
      {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
    </div>
    <div className="p-5">{children}</div>
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-surface-2 px-5 py-3">{footer}</div>
  </Card>;
}

export function NewListForm({ availableCredits, contacts, totals }: { availableCredits: number; contacts: ContactRow[]; totals: { newContacts: number; processed: number } }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [origin, setOrigin] = useState<Origin>("csv");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [source, setSource] = useState("");
  const [mode, setMode] = useState<SelectionMode>("new_only");
  const [selected, setSelected] = useState<number[]>([]);
  const [scheduleDate, setScheduleDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [review, setReview] = useState<TimezoneReviewContact[]>([]);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [applyAll, setApplyAll] = useState("");

  const visibleContacts = contacts.filter((contact) => !source || contact.source === source);
  const counts = useMemo(() => {
    if (origin === "csv") return { newContacts: csvFile ? 248 : 0, rerun: 0 };
    if (mode === "selected") {
      const chosen = contacts.filter((contact) => selected.includes(contact.id));
      return { newContacts: chosen.filter((contact) => contact.processing_state === "never_processed").length, rerun: chosen.filter((contact) => contact.processing_state !== "never_processed").length };
    }
    return mode === "new_only" ? { newContacts: totals.newContacts, rerun: 0 } : { newContacts: 0, rerun: totals.processed };
  }, [origin, csvFile, mode, selected, contacts, totals]);
  const total = counts.newContacts + counts.rerun;
  const scheduleBlocked = isSunday(scheduleDate);
  const listName = origin === "csv" && csvFile ? csvFile.name.replace(/\.csv$/i, "") || "CSV list" : name.trim() || "Verification list";
  const contactsReady = origin === "csv" ? Boolean(csvFile) : mode !== "selected" || selected.length > 0;
  const pending = review.filter((contact) => contact.timezone_status !== "resolved");
  const shortfall = Math.max(0, total - availableCredits);

  const summary = [
    contactsReady ? (origin === "csv" ? csvFile?.name ?? "" : MODES.find((item) => item.value === mode)?.title ?? "") : "",
    step > 1 ? `${listName}${scheduleDate ? ` · ${date(scheduleDate)}` : ""}` : "",
    "",
  ];

  const goReview = () => { setSaving(true); window.setTimeout(() => { setReview(previewTimezones(total)); setSaving(false); setStep(2); }, 450); };
  const saveTimezone = (ids: number[], timezone: string) => setReview((current) => current.map((contact) => ids.includes(contact.id) ? { ...contact, timezone, timezone_label: timezone, timezone_status: "resolved" } : contact));
  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file && /\.csv$/i.test(file.name)) setCsvFile(file);
  };
  const timezoneInput = (contact: TimezoneReviewContact) => <input className={`${inputClass} h-9 min-w-44`} list="iana-timezones" value={drafts[contact.id] ?? ""} onChange={(event) => setDrafts((current) => ({ ...current, [contact.id]: event.target.value }))} placeholder="America/New_York" aria-label={`Timezone for ${contact.name}`} />;

  return <>
    <PageHeader eyebrow="New execution" title="Create list" description="Start from durable Contacts. Each list stores its own configuration and execution result." actions={<ButtonLink href="/lists" variant="ghost"><ArrowLeft size={15} aria-hidden="true" /> Back to lists</ButtonLink>} />
    <div className="grid items-start gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-20">
        <div className="hidden lg:block"><StepRail step={step} summary={summary} /></div>
        <p className="text-xs text-muted lg:hidden">Step {step + 1} of {STEPS.length} · <span className="text-navy">{STEPS[step]}</span></p>
        <div className="mt-6 hidden rounded-lg border border-line bg-surface p-4 lg:block">
          <dl className="grid gap-2 text-[13px]">
            <div className="flex justify-between gap-2"><dt className="text-muted">New contacts</dt><dd className="tabular-nums">{number(counts.newContacts)}</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-muted">Previously processed / re-run</dt><dd className="tabular-nums">{number(counts.rerun)}</dd></div>
          </dl>
        </div>
      </aside>

      <div className="min-w-0">
        {step === 0 && <StepCard title="Contacts" footer={<>
          <span className="text-[13px] text-muted">New contacts <span className="text-ink">{number(counts.newContacts)}</span> · Previously processed / re-run <span className="text-ink">{number(counts.rerun)}</span></span>
          <Button disabled={!contactsReady} onClick={() => setStep(1)}>Continue <ArrowRight size={15} aria-hidden="true" /></Button>
        </>}>
          <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Contacts">
            {([["csv", Upload, "Upload contacts CSV"], ["contacts", Users, "Durable Contacts"]] as const).map(([value, Icon, label]) => <label key={value} className={clsx("flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-sm font-medium transition", origin === value ? "border-brand-500 bg-brand-50 text-navy" : "border-line-strong text-muted hover:text-ink")}>
              <input type="radio" name="origin" className="size-4 accent-brand-600" checked={origin === value} onChange={() => setOrigin(value)} />
              <Icon size={17} aria-hidden="true" />{label}
            </label>)}
          </div>

          {origin === "csv" ? <div className="mt-5 grid gap-3">
            {csvFile ? <div className="flex items-center gap-3 rounded-md border border-good/40 bg-good-soft px-4 py-3">
              <FileSpreadsheet size={20} className="shrink-0 text-good-ink" aria-hidden="true" />
              <div className="min-w-0 flex-1"><strong className="block truncate text-sm font-medium text-navy">{csvFile.name}</strong><span className="text-xs text-muted">{(csvFile.size / 1024).toFixed(1)} KB</span></div>
              <button type="button" onClick={() => setCsvFile(null)} className="grid size-8 place-items-center rounded border border-line-strong text-muted hover:text-ink" aria-label="Remove file"><X size={15} /></button>
            </div> : <label htmlFor="list-csv" onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop} className={clsx("flex cursor-pointer items-center gap-4 rounded-md border border-dashed px-4 py-5 transition", dragging ? "border-brand-500 bg-brand-50" : "border-input hover:bg-nav-hover")}>
              <Upload size={22} className="shrink-0 text-brand-ink" aria-hidden="true" />
              <span className="flex-1 text-sm"><strong className="block font-medium text-navy">Upload contacts CSV</strong><span className="text-xs text-muted">.csv file</span></span>
              <span className={buttonClass("outline", "sm")}>Browse</span>
            </label>}
            <input id="list-csv" type="file" accept=".csv,text/csv" className="sr-only" onChange={(event) => setCsvFile(event.target.files?.[0] ?? null)} />
            <p className="text-[13px] leading-relaxed text-muted">Headers may use phone, contact, or number. First/last name becomes the full name; city and state become location. US (+1) is used when the phone has no country code. Existing phone numbers are included in the new list.</p>
            {csvFile && <p className="rounded-md border border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink">The CSV will be imported first, then a list will be created from all usable contacts in the import, including existing contacts. You will be redirected to that list when it is ready.</p>}
          </div> : <div className="mt-5 grid gap-4">
            <label className="grid gap-1.5 text-[13px] font-medium sm:max-w-64">Source
              <select className={inputClass} value={source} onChange={(event) => { setSource(event.target.value); setSelected([]); }}>
                <option value="">All durable Contacts</option><option value="gohighlevel">GoHighLevel contacts</option><option value="csv">CSV contacts</option><option value="manual">Manual contacts</option>
              </select>
            </label>
            <div>
              <span className="text-[13px] font-medium">Contact selection</span>
              <p className="text-xs text-muted">Selection is evaluated by the backend against durable Contacts. A contact may appear in multiple list executions.</p>
              <div className="mt-2 grid divide-y divide-line overflow-hidden rounded-md border border-line-strong" role="radiogroup" aria-label="Contact selection">
                {MODES.map(({ value, icon: Icon, title, body }) => <label key={value} className={clsx("flex cursor-pointer items-center gap-3 px-4 py-3 transition", mode === value ? "bg-brand-50" : "hover:bg-nav-hover")}>
                  <input type="radio" name="mode" className="size-4 accent-brand-600" checked={mode === value} onChange={() => { setMode(value); setSelected([]); }} />
                  <Icon size={17} className={mode === value ? "text-brand-ink" : "text-muted"} aria-hidden="true" />
                  <span><strong className="block text-sm font-medium text-navy">{title}</strong><span className="text-xs text-muted">{body}</span></span>
                </label>)}
              </div>
            </div>
            {mode === "selected" && <div className="grid max-h-72 overflow-y-auto rounded-md border border-line">
              {visibleContacts.map((contact) => <label key={contact.id} className={clsx("flex cursor-pointer items-center gap-3 border-b border-line px-3.5 py-2.5 last:border-0", selected.includes(contact.id) ? "bg-brand-50" : "hover:bg-nav-hover")}>
                <input type="checkbox" className="size-4 accent-brand-600" checked={selected.includes(contact.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, contact.id] : current.filter((id) => id !== contact.id))} />
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{contact.full_name || "Unnamed contact"}</span><span className="text-xs text-muted">{contact.source || "Contact"} · {contact.location || contact.mobile_phone_e164 || "Phone unavailable"}</span></span>
              </label>)}
              {!visibleContacts.length && <div className="px-3 py-8 text-center"><strong className="block text-sm font-medium">No contacts available</strong><span className="text-xs text-muted">Sync or import contacts before selecting them.</span></div>}
            </div>}
          </div>}
        </StepCard>}

        {step === 1 && <StepCard title="Details" footer={<>
          <Button variant="ghost" onClick={() => setStep(0)}><ArrowLeft size={15} aria-hidden="true" /> Back</Button>
          <Button disabled={scheduleBlocked || saving} onClick={goReview}>{saving ? (origin === "csv" ? "Importing and creating…" : "Creating…") : <>Continue <ArrowRight size={15} aria-hidden="true" /></>}</Button>
        </>}>
          <div className="grid gap-5">
            <label className="grid gap-1.5 text-[13px] font-medium">List name
              <input className={inputClass} value={origin === "csv" && csvFile ? listName : name} onChange={(event) => setName(event.target.value)} placeholder="Optional list name" disabled={origin === "csv" && Boolean(csvFile)} />
              <small className="text-xs font-normal text-muted">{origin === "csv" && csvFile ? "CSV list names are taken from the uploaded filename." : "Optional list name"}</small>
            </label>
            <label className="grid gap-1.5 text-[13px] font-medium">Description
              <textarea className={`${inputClass} h-20 py-2`} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Optional operational context" />
            </label>
            <div className="grid gap-1.5">
              <label htmlFor="schedule-date" className="text-[13px] font-medium">Schedule date (optional)</label>
              <input id="schedule-date" type="date" className={`${inputClass} sm:max-w-56`} min={tomorrow()} value={scheduleDate} onChange={(event) => setScheduleDate(event.target.value)} />
              <small className="text-xs text-muted">Pick a future weekday. Sundays, US federal holidays, and recognized state holidays are closed. Calls follow your workspace&apos;s receiver-local calling hours.</small>
              <SchedulePolicy value={scheduleDate} />
              {scheduleDate && !scheduleBlocked && <small className="text-xs text-muted">1,640 of 2,000 daily call slots remain for {date(scheduleDate)}.</small>}
              {scheduleDate && total > 0 && <small className="text-xs text-muted">The server reserves exactly one workspace credit per eligible contact when the list is created.</small>}
            </div>
            <p className="rounded-md border border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink">Live lists reserve one credit per eligible contact at creation. Simulated lists are free. <Link href="/profile/billing" className="font-medium text-brand-ink underline">View balance and buy credits</Link></p>
          </div>
        </StepCard>}

        {step === 2 && <StepCard title="Review your list" description="Each contact accepted for processing reserves one credit." footer={<>
          {shortfall > 0 ? <>
            <Button variant="ghost" onClick={() => setStep(0)}>Reduce contacts</Button>
            <ButtonLink href={`/profile/billing?credits=${shortfall}`}>Buy {number(shortfall)} credits</ButtonLink>
          </> : <>
            <Button variant="ghost" onClick={() => setStep(1)}><ArrowLeft size={15} aria-hidden="true" /> Back to selection</Button>
            <Button disabled={pending.length > 0 || saving || review.length === 0} onClick={() => { setSaving(true); window.setTimeout(() => router.push("/lists/108"), 450); }}>
              {saving ? "Saving…" : review.length === 0 ? "No eligible contacts" : scheduleDate ? "Schedule list" : "Create list"}
            </Button>
          </>}
        </>}>
          <div className="grid grid-cols-3 divide-x divide-line rounded-md border border-line text-center">
            {([["Contacts", total], ["Credits required", total], ["Available credits", availableCredits]] as const).map(([label, value]) => <div key={label} className="px-2 py-3.5">
              <span className="block text-xs text-muted">{label}</span><strong className="mt-1 block text-xl tabular-nums text-navy">{number(value)}</strong>
            </div>)}
          </div>
          <p className="mt-3 text-[13px] text-muted">Credits are reserved when you confirm. Your available balance is checked again at confirmation. Calls run between 09:00 and 20:00 in each receiver&apos;s timezone.</p>
          {shortfall > 0 && <p className="mt-3 rounded-md border border-bad/40 bg-bad-soft px-3.5 py-2.5 text-sm text-bad-ink" role="alert">You need {number(shortfall)} more credits.</p>}
          {pending.length > 0 && <div className="mt-4 rounded-md border border-warn/40 bg-warn-soft p-4">
            <strong className="font-medium text-warn-ink">Some timezones need your confirmation</strong>
            <p className="mt-1 text-[13px] text-ink">Choose a timezone for each row, apply one timezone to all, or remove a contact from this list. New contacts can also be removed from Contacts.</p>
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <label className="grid flex-1 gap-1.5 text-xs font-medium sm:max-w-xs">Apply one timezone to all<input className={`${inputClass} h-9`} list="iana-timezones" value={applyAll} onChange={(event) => setApplyAll(event.target.value)} placeholder="America/New_York" /></label>
              <Button size="sm" className="h-9" disabled={!applyAll.trim()} onClick={() => saveTimezone(pending.map((contact) => contact.id), applyAll.trim())}>Apply to all</Button>
            </div>
          </div>}

          <div className="mt-4 overflow-hidden rounded-md border border-line">
            <ul className="divide-y divide-line md:hidden">
              {review.map((contact) => {
                const needs = contact.timezone_status !== "resolved";
                return <li key={contact.id} className="grid gap-2 px-4 py-3">
                  <div className="flex justify-between gap-3"><strong className="text-sm font-medium text-navy">{contact.name || "Unnamed contact"}</strong>{!needs && <span className="text-xs text-muted">Ready</span>}</div>
                  <span className="text-xs text-muted">{contact.phone || "Not available"} · {contact.location || "No location provided"}</span>
                  {needs ? <>{timezoneInput(contact)}<small className="text-xs text-muted">{contact.timezone_message}{contact.timezone_candidates?.length ? ` Suggestions: ${contact.timezone_candidates.join(", ")}` : ""}</small>
                    <div className="flex gap-2"><Button size="sm" disabled={!drafts[contact.id]?.trim()} onClick={() => saveTimezone([contact.id], drafts[contact.id].trim())}>Save timezone</Button><Button size="sm" variant="ghost" onClick={() => setReview((current) => current.filter((item) => item.id !== contact.id))}>Remove from list</Button></div>
                  </> : <span className="text-xs">{contact.timezone}</span>}
                </li>;
              })}
            </ul>
            <div className="relative hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-line bg-surface-2"><th className={th}>Contact</th><th className={th}>Phone</th><th className={th}>Location</th><th className={th}>Timezone</th><th className={th}>Action</th></tr></thead>
                <tbody>{review.map((contact) => {
                  const needs = contact.timezone_status !== "resolved";
                  return <tr key={contact.id} className="border-b border-line align-top last:border-0">
                    <td className={td}><span className="block whitespace-nowrap font-medium text-navy">{contact.name || "Unnamed contact"}</span><span className="text-xs text-muted">{sourceLabel(contact.source)}{contact.is_new ? " · New" : ""}</span></td>
                    <td className={`${td} whitespace-nowrap text-xs`}>{contact.phone || "Not available"}</td>
                    <td className={td}>{contact.location || <span className="text-muted">No location provided</span>}</td>
                    <td className={td}>{needs ? <div className="grid gap-1">{timezoneInput(contact)}<small className="text-xs text-muted">{contact.timezone_message}{contact.timezone_candidates?.length ? ` Suggestions: ${contact.timezone_candidates.join(", ")}` : ""}</small></div> : <><span className="block text-xs text-navy">{contact.timezone}</span><span className="text-xs text-muted">{contact.timezone_label}</span></>}</td>
                    <td className={td}>{needs ? <div className="flex flex-wrap gap-2"><Button size="sm" disabled={!drafts[contact.id]?.trim()} onClick={() => saveTimezone([contact.id], drafts[contact.id].trim())}>Save timezone</Button><Button size="sm" variant="ghost" onClick={() => setReview((current) => current.filter((item) => item.id !== contact.id))}>Remove from list</Button></div> : <span className="text-muted">Ready</span>}</td>
                  </tr>;
                })}</tbody>
              </table>
            </div>
          </div>
          <datalist id="iana-timezones">{TIMEZONES.map((zone) => <option key={zone} value={zone} />)}</datalist>
        </StepCard>}
      </div>
    </div>
  </>;
}
