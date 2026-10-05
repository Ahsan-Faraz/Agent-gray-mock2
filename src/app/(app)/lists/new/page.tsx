import { getContacts, getCreditBalance } from "@/lib/api";
import { NewListForm } from "./NewListForm";

export const metadata = { title: "Create list · Agent Gray" };

export default async function NewListPage() {
  const [balance, { contacts, totals }] = await Promise.all([getCreditBalance(), getContacts()]);
  return <NewListForm availableCredits={balance.available} contacts={contacts} totals={totals} />;
}
