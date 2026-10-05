import { getCreditBalance, getCurrentUser, getPurchases } from "@/lib/api";
import { ProfileTabs } from "../ProfileTabs";
import { BillingView } from "./BillingView";

export const metadata = { title: "Billing · Agent Gray" };

export default async function BillingPage({ searchParams }: PageProps<"/profile/billing">) {
  const [{ credits, buy }, balance, purchases, user] = await Promise.all([searchParams, getCreditBalance(), getPurchases(), getCurrentUser()]);
  const requested = typeof credits === "string" && /^\d+$/.test(credits) && Number(credits) > 0 ? credits : null;
  return <BillingView tabs={<ProfileTabs />} balance={balance} purchases={purchases} role={user.role} requestedQuantity={requested} openOnLoad={Boolean(requested) || buy === "1"} />;
}
