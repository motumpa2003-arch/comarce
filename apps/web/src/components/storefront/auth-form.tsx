"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, Eye, EyeOff, Loader2, Mail, ShieldCheck } from "lucide-react";
import { Button, Checkbox, Field, Input, Rule, cn, useToast } from "@obsidian/ui";

type Mode = "login" | "signup" | "forgot";

interface Errors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirm?: string;
  terms?: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Five checks, shown live so the rule is never a surprise at submit time. */
function passwordChecks(value: string) {
  return [
    { label: "At least 8 characters", ok: value.length >= 8 },
    { label: "One uppercase letter", ok: /[A-Z]/.test(value) },
    { label: "One lowercase letter", ok: /[a-z]/.test(value) },
    { label: "One number", ok: /\d/.test(value) },
    { label: "One symbol", ok: /[^A-Za-z0-9]/.test(value) },
  ];
}

/**
 * Sign-in, registration and password reset in one component.
 *
 * This demo has no auth backend, so nothing is transmitted and no session is
 * created — the form validates exactly as a real one would, then says plainly
 * what it did and did not do rather than pretending to log you in.
 */
export function AuthForm({ mode }: { mode: Mode }) {
  const [values, setValues] = React.useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    terms: false,
    remember: true,
  });
  const [errors, setErrors] = React.useState<Errors>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const set = (key: keyof typeof values) => (value: string | boolean) =>
    setValues((v) => ({ ...v, [key]: value }));

  const checks = passwordChecks(values.password);
  const strength = checks.filter((c) => c.ok).length;

  function validate(): Errors {
    const next: Errors = {};
    if (mode === "signup" && values.name.trim().length < 2) next.name = "Tell us what to call you.";
    if (!EMAIL.test(values.email.trim())) next.email = "That does not look like an email address.";
    if (mode === "signup" && values.phone.replace(/\D/g, "").length < 10) {
      next.phone = "We need a ten-digit number for delivery updates.";
    }
    if (mode !== "forgot") {
      if (!values.password) next.password = "Enter your password.";
      else if (mode === "signup" && strength < 4) next.password = "Meet at least four of the five rules below.";
    }
    if (mode === "signup" && values.confirm !== values.password) next.confirm = "The two passwords do not match.";
    if (mode === "signup" && !values.terms) next.terms = "Please accept the terms to continue.";
    return next;
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    setTouched({ name: true, email: true, phone: true, password: true, confirm: true, terms: true });
    if (Object.keys(found).length) {
      // Move focus to the first problem so a keyboard user is not hunting.
      const first = document.querySelector<HTMLElement>("[aria-invalid='true']");
      first?.focus();
      return;
    }

    setPending(true);
    await new Promise((resolve) => setTimeout(resolve, 650));
    setPending(false);

    if (mode === "forgot") {
      setSent(true);
      return;
    }

    toast({
      title: mode === "login" ? "Demo build — no session created" : "Demo build — no account created",
      description:
        "Authentication is not wired up here. The demo account is already signed in, so head to your account area.",
      tone: "accent",
      action: { label: "Open account", href: "/account" },
    });
    router.push("/account");
  }

  const invalid = (key: keyof Errors) => Boolean(touched[key] && errors[key]);

  if (mode === "forgot" && sent) {
    return (
      <div className="text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-success/12 text-success">
          <Mail className="h-5 w-5" />
        </span>
        <h2 className="mt-5 font-display display-case text-[24px] leading-tight text-ink">Check your inbox</h2>
        <p className="mx-auto mt-3 max-w-sm text-[13px] leading-relaxed text-ink-muted">
          If an account exists for <span className="text-ink">{values.email}</span> we have sent a reset link. It
          expires in thirty minutes and can only be used once.
        </p>
        <p className="mx-auto mt-4 max-w-sm text-[12px] leading-relaxed text-ink-muted">
          Nothing was actually sent — this build has no mail service. The message above is what a real reset would
          say, including not confirming whether the address is registered.
        </p>
        <Button variant="outline" size="sm" className="mt-7" onClick={() => setSent(false)}>
          Use a different address
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {mode === "signup" && (
        <Field label="Full name" required error={invalid("name") ? errors.name : undefined}>
          <Input
            value={values.name}
            autoComplete="name"
            aria-invalid={invalid("name")}
            onChange={(e) => set("name")(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            placeholder="Priya Sharma"
          />
        </Field>
      )}

      <Field label="Email" required error={invalid("email") ? errors.email : undefined}>
        <Input
          type="email"
          value={values.email}
          autoComplete="email"
          aria-invalid={invalid("email")}
          onChange={(e) => set("email")(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          placeholder="you@example.com"
        />
      </Field>

      {mode === "signup" && (
        <Field
          label="Mobile"
          required
          hint="Used for delivery updates only"
          error={invalid("phone") ? errors.phone : undefined}
        >
          <Input
            type="tel"
            value={values.phone}
            autoComplete="tel"
            aria-invalid={invalid("phone")}
            onChange={(e) => set("phone")(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            placeholder="+91 98765 43210"
          />
        </Field>
      )}

      {mode !== "forgot" && (
        <Field
          label="Password"
          required
          error={invalid("password") ? errors.password : undefined}
          action={
            mode === "login" ? (
              <Link href="/forgot-password" className="text-[11.5px] text-primary hover:underline">
                Forgot?
              </Link>
            ) : undefined
          }
        >
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={values.password}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              aria-invalid={invalid("password")}
              onChange={(e) => set("password")(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-0 top-0 grid h-full w-11 place-items-center text-ink-muted transition-colors hover:text-ink"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>
      )}

      {mode === "signup" && values.password.length > 0 && (
        <div>
          <div className="flex gap-1" aria-hidden>
            {checks.map((check, index) => (
              <span
                key={check.label}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  index < strength
                    ? strength <= 2
                      ? "bg-danger"
                      : strength <= 3
                        ? "bg-warning"
                        : "bg-success"
                    : "bg-line",
                )}
              />
            ))}
          </div>
          <ul className="mt-2.5 grid gap-1 sm:grid-cols-2">
            {checks.map((check) => (
              <li
                key={check.label}
                className={cn(
                  "flex items-center gap-1.5 text-[11.5px]",
                  check.ok ? "text-success" : "text-ink-muted",
                )}
              >
                <Check className={cn("h-3 w-3 shrink-0", !check.ok && "opacity-30")} />
                {check.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {mode === "signup" && (
        <Field error={invalid("confirm") ? errors.confirm : undefined}>
          <Input
            type={showPassword ? "text" : "password"}
            value={values.confirm}
            autoComplete="new-password"
            aria-label="Confirm password"
            aria-invalid={invalid("confirm")}
            onChange={(e) => set("confirm")(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
            placeholder="Confirm password"
          />
        </Field>
      )}

      {mode === "login" && (
        <Checkbox
          label="Keep me signed in on this device"
          checked={values.remember}
          onChange={(e) => set("remember")(e.target.checked)}
        />
      )}

      {mode === "signup" && (
        <div>
          <Checkbox
            label={
              <span>
                I accept the{" "}
                <Link href="/pages/terms" className="text-primary underline-offset-2 hover:underline">
                  terms
                </Link>{" "}
                and{" "}
                <Link href="/pages/privacy" className="text-primary underline-offset-2 hover:underline">
                  privacy policy
                </Link>
                .
              </span>
            }
            checked={values.terms}
            aria-invalid={invalid("terms")}
            onChange={(e) => set("terms")(e.target.checked)}
          />
          {invalid("terms") && <p className="mt-1.5 text-[11.5px] text-danger">{errors.terms}</p>}
        </div>
      )}

      <Button type="submit" fullWidth size="lg" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Working…
          </>
        ) : (
          <>
            {mode === "login" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>

      {mode !== "forgot" && (
        <>
          <div className="relative my-6">
            <Rule />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface px-3 text-[11px] uppercase tracking-[0.14em] text-ink-muted">
              or
            </span>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {["Continue with Google", "Continue with Apple"].map((label) => (
              <Button
                key={label}
                type="button"
                variant="outline"
                onClick={() =>
                  toast({
                    title: "Not connected in this build",
                    description: "Single sign-on needs an identity provider, which this demo does not ship with.",
                  })
                }
              >
                {label}
              </Button>
            ))}
          </div>
        </>
      )}

      <p className="flex items-start gap-2 pt-2 text-[11.5px] leading-relaxed text-ink-muted">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        This is a demo build with no authentication service. Nothing you type here is transmitted or stored, and no
        session is created.
      </p>
    </form>
  );
}
