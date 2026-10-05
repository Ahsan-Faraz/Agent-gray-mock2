import { CheckCircle2 } from "lucide-react";
import { Card, PageHeader } from "@/components/ui";

export const metadata = { title: "Help · Agent Gray" };

const FLOW = [
  "Add contacts manually, import CSV, or sync a connected CRM from Integrations.",
  "Create a list from durable contacts.",
  "Start the list and monitor its persisted progress.",
  "Review calls, snapshots, and audit history.",
];

export default function HelpPage() {
  return <>
    <PageHeader eyebrow="Support" title="Help" description="Understand the server-backed Agent Gray workspace." />
    <Card className="max-w-2xl p-5 sm:p-6">
      <h2 className="font-bold text-navy">Workspace flow</h2>
      <ol className="mt-4 grid gap-3">
        {FLOW.map((step, index) => <li key={step} className="flex gap-3 rounded-xl border border-line px-4 py-3 text-sm">
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-ink">{index + 1}</span>
          <span className="flex-1">{step}</span>
          <CheckCircle2 size={17} className="shrink-0 text-good-ink" aria-hidden="true" />
        </li>)}
      </ol>
    </Card>
  </>;
}
