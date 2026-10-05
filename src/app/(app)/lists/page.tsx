import { Plus } from "lucide-react";
import { ListsTable } from "@/components/ListsTable";
import { Button, ButtonLink, Card, EmptyState, PageHeader } from "@/components/ui";
import { getLists } from "@/lib/api";

export const metadata = { title: "Lists · Agent Gray" };

export default async function ListsPage() {
  const lists = await getLists();
  return <>
    <PageHeader eyebrow="Execution history" title="Lists" description="Create and monitor durable verification executions." actions={<ButtonLink href="/lists/new"><Plus size={16} aria-hidden="true" /> New list</ButtonLink>} />
    <Card className="overflow-hidden">
      {lists.length === 0
        ? <EmptyState title="No lists yet" description="Create a list from durable contacts to begin processing." action={<ButtonLink href="/lists/new">Create a list</ButtonLink>} />
        : <>
          <ListsTable lists={lists} />
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 text-[13px] text-muted sm:px-5">
            <span>1–{lists.length} of {lists.length}</span>
            <div className="flex gap-2"><Button size="sm" variant="ghost" disabled>Previous</Button><Button size="sm" variant="ghost" disabled>Next</Button></div>
          </div>
        </>}
    </Card>
  </>;
}
