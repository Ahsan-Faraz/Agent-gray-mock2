import { ButtonLink, LogoMark } from "@/components/ui";

export const metadata = { title: "Page not found · Agent Gray" };

export default function NotFound() {
  return <main className="grid-backdrop grid min-h-dvh place-items-center px-5 text-center">
    <div>
      <LogoMark size={72} className="mx-auto" />
      <p className="mt-6 text-sm font-semibold text-brand-ink">404</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-navy">We couldn&apos;t find that page</h1>
      <p className="mt-2 text-muted">The link may be old, or the list may have been removed.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <ButtonLink href="/dashboard">Go to dashboard</ButtonLink>
        <ButtonLink href="/lists" variant="ghost">View lists</ButtonLink>
      </div>
    </div>
  </main>;
}
