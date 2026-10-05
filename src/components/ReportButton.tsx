"use client";

import { Download, FileDown } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/Modal";
import { Button, StatusBadge, inputClass } from "@/components/ui";
import { number } from "@/lib/format";
import type { ContactList } from "@/lib/types";

type DateBasis = "created_at" | "started_at";

// Same columns as CONTACT_COLUMNS in the original; all are selected by default.
const CSV_COLUMNS = ["Full Name", "Location", "Mobile Phone Number", "Priority / Classification", "Outcome Explanation", "Confidence", "CRM Links", "Status"];
const DEFAULT_CSV = new Set(CSV_COLUMNS);

function basisDate(list: ContactList, basis: DateBasis) {
  return (basis === "started_at" ? list.started_at : list.created_at)?.slice(0, 10) ?? "";
}

// "Generate report" from the original dashboard: pick lists (or a date range), then download.
export function ReportButton({ lists }: { lists: ContactList[] }) {
  const runs = lists.filter((list) => Boolean(list.started_at));
  const [open, setOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [basis, setBasis] = useState<DateBasis>("created_at");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [columns, setColumns] = useState<Set<string>>(new Set(DEFAULT_CSV));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const all = runs.length > 0 && selected.length === runs.length;
  const inRange = runs.filter((list) => { const value = basisDate(list, basis); return start && end && value >= start && value <= end; });
  const basisWord = basis === "started_at" ? "started" : "created";

  const reset = () => { setOpen(true); setSelected([]); setBasis("created_at"); setStart(""); setEnd(""); setMessage(""); setError(""); setColumns(new Set(DEFAULT_CSV)); };
  const selectRange = () => {
    if (start > end) return setError("The start date must be before or equal to the end date.");
    setError(""); setSelected(inRange.map((list) => list.id));
  };
  const download = (format: string) => setMessage(`${format} for ${selected.length} list${selected.length === 1 ? "" : "s"} is downloading (mock).`);

  return <>
    <Button variant="outline" onClick={reset}><FileDown size={16} aria-hidden="true" /> Generate report</Button>
    <Modal
      open={open && !csvOpen}
      onClose={() => setOpen(false)}
      wide
      title="Generate list report"
      description="Select one or more lists. The downloaded report combines results and usage-based cost for the selected executions."
      footer={<>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Close</Button>
        {["Report .md", "Report PDF", "Report DOCX"].map((format) => <Button key={format} variant="outline" size="sm" disabled={!selected.length} onClick={() => download(format)}><Download size={14} aria-hidden="true" />{format}</Button>)}
        <Button size="sm" disabled={!selected.length} onClick={() => setCsvOpen(true)}><Download size={14} aria-hidden="true" />Contacts CSV</Button>
      </>}
    >
      <div className="grid gap-3 rounded-xl border border-line bg-canvas p-4 sm:grid-cols-3">
        <label className="grid gap-1.5 text-[13px] font-semibold">Date basis<select className={`${inputClass} h-10`} value={basis} onChange={(event) => setBasis(event.target.value as DateBasis)}><option value="created_at">Created date</option><option value="started_at">Started date</option></select></label>
        <label className="grid gap-1.5 text-[13px] font-semibold">Start date<input className={`${inputClass} h-10`} type="date" value={start} onChange={(event) => setStart(event.target.value)} /></label>
        <label className="grid gap-1.5 text-[13px] font-semibold">End date<input className={`${inputClass} h-10`} type="date" value={end} onChange={(event) => setEnd(event.target.value)} /></label>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-3">
          <Button size="sm" variant="ghost" onClick={selectRange} disabled={!start || !end}>{start && end ? "Select lists in range" : "Choose date range"}</Button>
          <small className="text-[13px] text-muted">{start && end ? `${inRange.length} list(s) ${basisWord} between these dates` : "Choose an inclusive date range and choose whether it uses created or started dates."}</small>
        </div>
      </div>
      <div className="mb-2 mt-4 flex items-center justify-between text-sm">
        <strong>{selected.length} of {runs.length} selected</strong>
        <button className="rounded-md px-2 py-1 font-semibold text-brand-ink hover:bg-brand-50" onClick={() => setSelected(all ? [] : runs.map((list) => list.id))}>{all ? "Clear all" : "Select all"}</button>
      </div>
      <div className="grid gap-2">
        {runs.map((list) => <label key={list.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${selected.includes(list.id) ? "border-brand-500 bg-brand-50" : "border-line hover:bg-nav-hover"}`}>
          <input type="checkbox" className="size-4 shrink-0 accent-brand-600" checked={selected.includes(list.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, list.id] : current.filter((id) => id !== list.id))} />
          <span className="min-w-0 flex-1"><strong className="block truncate text-sm">{list.name || `List #${list.id}`}</strong><span className="text-xs text-muted">{number(list.contact_count)} contacts · {basisWord} {basisDate(list, basis) || "not available"}</span></span>
          <StatusBadge value={list.status} />
        </label>)}
      </div>
      {error && <p className="mt-3 rounded-xl bg-bad-soft px-4 py-2.5 text-sm text-bad-ink" role="alert">{error}</p>}
      {message && <p className="mt-3 rounded-xl bg-good-soft px-4 py-2.5 text-sm text-good-ink" role="status">{message}</p>}
    </Modal>

    <Modal
      open={csvOpen}
      onClose={() => setCsvOpen(false)}
      title="Choose CSV columns"
      description="Select the columns to include in the CSV for the selected lists."
      footer={<>
        <Button variant="ghost" size="sm" onClick={() => setCsvOpen(false)}>Cancel</Button>
        <Button size="sm" disabled={!columns.size} onClick={() => { setCsvOpen(false); download("Contacts CSV"); }}>Download CSV</Button>
      </>}
    >
      <div className="mb-2 flex items-center justify-between text-sm">
        <strong>{columns.size} of {CSV_COLUMNS.length} selected</strong>
        <button className="rounded-md px-2 py-1 font-semibold text-brand-ink hover:bg-brand-50" onClick={() => setColumns(columns.size === CSV_COLUMNS.length ? new Set() : new Set(CSV_COLUMNS))}>{columns.size === CSV_COLUMNS.length ? "Clear all" : "Select all"}</button>
      </div>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {CSV_COLUMNS.map((column) => <label key={column} className="flex items-center gap-2.5 rounded-lg border border-line px-3 py-2 text-sm hover:bg-nav-hover">
          <input type="checkbox" className="size-4 accent-brand-600" checked={columns.has(column)} onChange={() => setColumns((current) => { const next = new Set(current); if (next.has(column)) next.delete(column); else next.add(column); return next; })} />{column}
        </label>)}
      </div>
    </Modal>
  </>;
}
