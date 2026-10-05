import { BottomNav, Sidebar } from "@/components/shell/Sidebar";
import { TopBar } from "@/components/shell/TopBar";
import { ToastProvider } from "@/components/Toast";
import { getCreditBalance, getCurrentUser, getLists } from "@/lib/api";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const [user, balance, lists] = await Promise.all([getCurrentUser(), getCreditBalance(), getLists()]);
  const running = lists.filter((list) => list.status === "running").length;
  return <ToastProvider><div className="min-h-screen md:pl-[var(--sidebar-w,248px)] md:transition-[padding] md:duration-200">
    <a href="#main" className="sr-only z-50 rounded-md bg-brand-600 px-4 py-2 font-medium text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-3">Skip to content</a>
    <Sidebar credits={balance.available} totalCredits={balance.total_balance} running={running} />
    <TopBar user={user} credits={balance.available} />
    <main id="main" className="mx-auto w-full max-w-[1500px] px-4 pb-28 pt-6 sm:px-6 md:pb-10">{children}</main>
    <BottomNav />
  </div></ToastProvider>;
}
