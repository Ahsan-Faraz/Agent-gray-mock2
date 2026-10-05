"use client";

import { Lock } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { Modal } from "@/components/Modal";
import { Hero } from "@/components/premium";
import { Badge, Button, Card, PageHeader, inputClass, td, th, type Tone } from "@/components/ui";
import { date, number } from "@/lib/format";
import type { CreditBalance, CreditPurchase, MemberRole } from "@/lib/types";

// Content follows the original CreditsPage. Checkout is mock-only.
const STATUS: Record<CreditPurchase["status"], [string, Tone]> = {
  paid: ["Paid", "good"],
  checkout_pending: ["Pending", "brand"],
  failed: ["Failed", "bad"],
  expired: ["Expired", "neutral"],
  refunded: ["Refunded", "warn"],
};

function parseCredits(input: string) {
  if (!/^\d+$/.test(input)) return null;
  const credits = Number(input);
  return Number.isSafeInteger(credits) && credits > 0 ? credits : null;
}

export function BillingView({ tabs, balance, purchases, role, requestedQuantity, openOnLoad }: { tabs: ReactNode; balance: CreditBalance; purchases: CreditPurchase[]; role: MemberRole; requestedQuantity: string | null; openOnLoad: boolean }) {
  const canBuy = role === "owner" || role === "admin";
  const [open, setOpen] = useState(openOnLoad && canBuy);
  const [quantity, setQuantity] = useState(requestedQuantity ?? "500");
  const [message, setMessage] = useState("");
  const credits = parseCredits(quantity);
  const metrics: Array<[string, number]> = [["Available", balance.available], ["Reserved", balance.reserved_credits], ["Total usable balance", balance.total_balance]];

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (credits !== null) setMessage("Secure checkout opens here once the backend is connected.");
  };

  return <>
    <PageHeader eyebrow="Workspace administration" title="Billing" actions={canBuy ? <Button onClick={() => { setMessage(""); setOpen(true); }}>Buy credits</Button> : undefined} />
    {tabs}

    <div className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        {/* Balance shown as a credit card. */}
        <Hero className="aspect-[1.6/1] max-h-64 p-6 sm:p-7">
          <div className="flex h-full flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium text-white/80">Credits</span>
              <span className="inline-block size-9 bg-linear-to-br from-white to-white/70" style={{ mask: "url(/logo-mark.png) center / contain no-repeat", WebkitMask: "url(/logo-mark.png) center / contain no-repeat" }} aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs text-white/70">Available</span>
              <strong className="block text-[44px] font-bold leading-none tracking-tight tabular-nums">{balance.available.toLocaleString()}</strong>
            </div>
            <div className="flex items-end justify-between text-xs text-white/75">
              <span>Agent Gray</span>
              <span className="tabular-nums">{balance.reserved_credits.toLocaleString()} reserved</span>
            </div>
          </div>
        </Hero>
        <Card className="grid content-center gap-5 p-6">
          <dl className="grid grid-cols-3 gap-4">
            {metrics.map(([label, value]) => <div key={label}>
              <dt className="text-[13px] text-muted">{label}</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-navy">{value.toLocaleString()}</dd>
            </div>)}
          </dl>
          <div>
            <div className="flex h-2.5 overflow-hidden rounded-full bg-line">
              <span className="bg-linear-to-r from-[#6b8ff6] to-brand-600" style={{ width: `${Math.round((balance.available / Math.max(balance.total_balance, 1)) * 100)}%` }} />
              <span className="bg-warn/70" style={{ width: `${Math.round((balance.reserved_credits / Math.max(balance.total_balance, 1)) * 100)}%` }} />
            </div>
            <div className="mt-2 flex gap-4 text-xs text-muted"><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-brand-500" />Available</span><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-warn" />Reserved</span></div>
          </div>
          <p className="text-[13px] text-muted">$1 = 1 credit. Processing one contact uses one credit.</p>
        </Card>
      </div>
      {!canBuy && <p className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-muted">Ask a workspace owner or administrator to buy credits.</p>}

      <Card className="overflow-hidden">
        <div className="border-b border-line px-5 py-4"><h2 className="font-bold text-navy">Purchase history</h2></div>
        {purchases.length ? <div className="relative overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead><tr className="border-b border-line"><th className={th}>Date</th><th className={th}>Credits</th><th className={th}>Amount</th><th className={th}>Status</th></tr></thead>
            <tbody>{purchases.map((purchase) => {
              const [label, tone] = STATUS[purchase.status];
              return <tr key={purchase.id} className="border-b border-line last:border-0">
                <td className={`${td} whitespace-nowrap`}>{date(purchase.created_at)}</td>
                <td className={`${td} font-semibold tabular-nums`}>{number(purchase.credits)}</td>
                <td className={`${td} tabular-nums`}>${(purchase.amount_cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                <td className={td}><Badge tone={tone}>{label}</Badge></td>
              </tr>;
            })}</tbody>
          </table>
        </div> : <p className="px-5 py-10 text-center text-sm text-muted">No credit purchases yet.</p>}
      </Card>
    </div>

    <Modal open={open} onClose={() => setOpen(false)} title="Buy credits">
      <form className="grid gap-4" onSubmit={submit}>
        <label className="grid gap-1.5 text-sm font-semibold">Credits
          <input className={inputClass} type="number" min="1" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} required />
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[100, 500, 1000].map((amount) => <Button key={amount} type="button" variant={credits === amount ? "primary" : "ghost"} onClick={() => setQuantity(String(amount))}>{amount.toLocaleString()}</Button>)}
        </div>
        <p className="text-[13px] text-muted">$1 = 1 credit. Processing one contact uses one credit.</p>
        {credits !== null
          ? <div className="flex items-center justify-between rounded-xl border border-line bg-canvas px-4 py-3"><span className="text-sm text-muted">Total</span><strong className="text-2xl tabular-nums text-navy">${credits.toLocaleString("en-US")}.00</strong></div>
          : <p className="text-sm text-bad-ink" role="alert">Enter a positive whole number of credits.</p>}
        {message && <p className="rounded-xl bg-brand-50 px-4 py-2.5 text-[13px] text-brand-ink" role="status">{message}</p>}
        <Button type="submit" disabled={credits === null} className="h-11 w-full">Continue to payment</Button>
        <p className="flex items-center justify-center gap-1.5 text-xs text-muted"><Lock size={12} aria-hidden="true" /> Secure checkout</p>
      </form>
    </Modal>
  </>;
}
