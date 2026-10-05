import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Progress, StatusBadge, stripeTone, toneFor, td, th } from "@/components/ui";
import { dateTime, number, sourceLabel } from "@/lib/format";
import type { ContactList } from "@/lib/types";

// Original "Batches" table: Name, Source, Created, Status, Contacts, New / rerun, Progress.
export function ListsTable({ lists }: { lists: ContactList[] }) {
  return <>
    <ul className="divide-y divide-line md:hidden">
      {lists.map((list) => <li key={list.id}>
        <Link href={`/lists/${list.id}`} className="relative block py-3.5 pl-5 pr-4 active:bg-nav-hover">
          <span className={clsx("absolute inset-y-2 left-0 w-[3px] rounded-r", stripeTone[toneFor(list.status)])} aria-hidden="true" />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <strong className="block truncate text-sm font-medium text-navy">{list.name || `List #${list.id}`}</strong>
              <span className="text-xs text-muted">{sourceLabel(list.source_type)} · {dateTime(list.created_at)}</span>
            </div>
            <StatusBadge value={list.status} />
          </div>
          <div className="mt-2.5 flex items-center gap-3"><Progress value={list.progress_percent} className="flex-1" /><span className="font-mono text-xs tabular-nums">{list.progress_percent}%</span></div>
          <div className="mt-1.5 flex justify-between text-xs text-muted">
            <span>{number(list.contact_count)} contacts</span>
            <span>New / rerun <span className="text-ink">{number(list.new_contact_count)}</span> / {number(list.rerun_contact_count)}</span>
          </div>
        </Link>
      </li>)}
    </ul>

    <div className="relative hidden overflow-x-auto md:block">
      <table className="w-full min-w-[860px] text-sm">
        <thead><tr className="border-b border-line bg-surface-2">
          <th className={`${th} pl-5`}>Name</th><th className={th}>Source</th><th className={th}>Created</th><th className={th}>Status</th><th className={`${th} text-right`}>Contacts</th><th className={`${th} text-right`}>New / rerun</th><th className={`${th} w-48`}>Progress</th><th className={th}><span className="sr-only">Open</span></th>
        </tr></thead>
        <tbody>
          {lists.map((list) => <tr key={list.id} className="group relative border-b border-line last:border-0 hover:bg-nav-hover">
            <td className={`${td} relative pl-5`}>
              <span className={clsx("absolute inset-y-2 left-0 w-[3px] rounded-r", stripeTone[toneFor(list.status)])} aria-hidden="true" />
              <Link href={`/lists/${list.id}`} className="block font-medium text-navy hover:text-brand-ink">{list.name || `List #${list.id}`}</Link>
              <span className="text-xs text-muted">{list.description || `List #${list.id}`}</span>
            </td>
            <td className={`${td} whitespace-nowrap text-ink`}>{sourceLabel(list.source_type)}</td>
            <td className={`${td} whitespace-nowrap font-mono text-xs text-muted`}>{dateTime(list.created_at)}</td>
            <td className={td}><StatusBadge value={list.status} /></td>
            <td className={`${td} text-right font-mono tabular-nums`}>{number(list.contact_count)}</td>
            <td className={`${td} text-right font-mono tabular-nums`}><span className="text-navy">{number(list.new_contact_count)}</span> <span className="text-muted">/ {number(list.rerun_contact_count)}</span></td>
            <td className={td}><div className="flex items-center gap-2.5"><Progress value={list.progress_percent} className="flex-1" /><span className="w-10 text-right font-mono text-xs tabular-nums">{list.progress_percent}%</span></div></td>
            <td className={`${td} text-right`}><Link href={`/lists/${list.id}`} aria-label={`Open ${list.name}`} className="inline-grid size-7 place-items-center rounded border border-line text-muted group-hover:border-brand-500 group-hover:text-brand-ink"><ChevronRight size={15} aria-hidden="true" /></Link></td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </>;
}
