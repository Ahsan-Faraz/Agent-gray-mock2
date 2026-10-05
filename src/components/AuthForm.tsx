"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, Field, inputClass } from "@/components/ui";

type Mode = "login" | "signup";

function PasswordInput({ id, autoComplete, minLength, maxLength }: { id: string; autoComplete: string; minLength?: number; maxLength?: number }) {
  const [visible, setVisible] = useState(false);
  return <div className="relative">
    <input id={id} className={`${inputClass} pr-11`} type={visible ? "text" : "password"} autoComplete={autoComplete} minLength={minLength} maxLength={maxLength} required />
    <button type="button" onClick={() => setVisible((current) => !current)} className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted hover:bg-nav-hover hover:text-ink" aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible}>
      {visible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
    </button>
  </div>;
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Mock: no backend call, just continue the flow.
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    window.setTimeout(() => router.push(mode === "login" ? "/dashboard" : "/login"), 500);
  };

  if (mode === "login") return <section className="w-full" aria-labelledby="login-heading">
    <h2 id="login-heading" className="text-lg font-semibold text-navy">Welcome back</h2>
    <p className="mt-1 text-sm text-muted">Sign in to continue to your Agent Gray workspace.</p>
    <form className="mt-7 grid gap-4" onSubmit={submit}>
      <Field label="Work email"><input id="login-email" className={inputClass} type="email" autoComplete="username" required autoFocus /></Field>
      <div className="grid gap-1.5 text-sm"><label htmlFor="login-password" className="font-semibold">Password</label><PasswordInput id="login-password" autoComplete="current-password" /></div>
      <label className="flex items-center gap-2 text-sm text-muted"><input type="checkbox" defaultChecked className="size-4 accent-brand-600" /> Remember me</label>
      <Button type="submit" disabled={loading} className="mt-1 h-11 w-full">{loading ? "Signing in…" : "Sign in"}</Button>
    </form>
    <p className="mt-6 text-center text-sm text-muted">New to Agent Gray? <Link href="/signup" className="font-semibold text-brand-ink hover:underline">Create account</Link></p>
  </section>;

  return <section className="w-full" aria-labelledby="signup-heading">
    <h2 id="signup-heading" className="text-lg font-semibold text-navy">Create account</h2>
    <p className="mt-1 text-sm text-muted">Create your Agent Gray workspace to manage contacts and verification lists.</p>
    <form className="mt-7 grid gap-4" onSubmit={submit}>
      <Field label="Username"><input id="signup-name" className={inputClass} autoComplete="username" maxLength={100} required autoFocus /></Field>
      <Field label="Work email"><input id="signup-email" className={inputClass} type="email" autoComplete="email" maxLength={255} required /></Field>
      <div className="grid gap-1.5 text-sm"><label htmlFor="signup-password" className="font-semibold">Password</label><PasswordInput id="signup-password" autoComplete="new-password" minLength={8} maxLength={72} /></div>
      <Button type="submit" disabled={loading} className="mt-1 h-11 w-full">{loading ? "Creating account…" : "Create account"}</Button>
    </form>
    <p className="mt-6 text-center text-sm text-muted">Already have an account? <Link href="/login" className="font-semibold text-brand-ink hover:underline">Sign in</Link></p>
  </section>;
}
