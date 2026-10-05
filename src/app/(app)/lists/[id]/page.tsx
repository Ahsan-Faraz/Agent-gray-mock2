import { notFound } from "next/navigation";
import { getCreditBalance, getList } from "@/lib/api";
import { ListDetailClient } from "./ListDetailClient";

export async function generateMetadata({ params }: PageProps<"/lists/[id]">) {
  const data = await getList(Number((await params).id));
  return { title: `${data?.list.name ?? "List"} · Agent Gray` };
}

export default async function ListDetailPage({ params }: PageProps<"/lists/[id]">) {
  const { id } = await params;
  const [data, balance] = await Promise.all([getList(Number(id)), getCreditBalance()]);
  if (!data) notFound();
  return <ListDetailClient list={data.list} contacts={data.contacts} availableCredits={balance.available} />;
}
