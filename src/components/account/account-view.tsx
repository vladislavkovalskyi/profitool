"use client";

import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { useI18n } from "@/i18n/context";
import { href } from "@/lib/shop";
import { IconAlert, IconCheck } from "@/components/ui/icons";

type Tab = "login" | "register";

/**
 * Экран входа и регистрации по макету. Учётных записей на сервере пока нет:
 * формы проверяют ввод и честно сообщают, что кабинет не работает.
 */
export function AccountView() {
  const { dict } = useI18n();
  const [tab, setTab] = useState<Tab>("login");

  return (
    <div>
      <div className="flex gap-2 lg:hidden" role="tablist" aria-label={dict.account.title}>
        {(["login", "register"] as const).map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            id={`tab-${item}`}
            aria-selected={tab === item}
            aria-controls={`panel-${item}`}
            onClick={() => setTab(item)}
            className="chip !h-11 !px-5"
            data-on={tab === item}
          >
            {item === "login" ? dict.account.login : dict.account.register}
          </button>
        ))}
      </div>

      <div className="mt-6 grid max-w-[1000px] gap-6 lg:mt-0 lg:grid-cols-2">
        <div
          id="panel-login"
          role="tabpanel"
          aria-labelledby="tab-login"
          className={tab === "login" ? "" : "hidden lg:block"}
        >
          <LoginForm />
        </div>
        <div
          id="panel-register"
          role="tabpanel"
          aria-labelledby="tab-register"
          className={tab === "register" ? "" : "hidden lg:block"}
        >
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}

function Panel({ title, accent, children }: { title: string; accent?: boolean; children: React.ReactNode }) {
  return (
    <section
      className={`rounded-[32px] border p-6 sm:p-8 ${accent ? "border-signal" : "border-[var(--hair-strong)]"}`}
    >
      <h2 className="t-h2 text-bone">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[15px] text-bone-dim">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {error ? (
        <p role="alert" className="mt-1.5 text-sm text-warn">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Notice() {
  const { locale, dict } = useI18n();
  return (
    <div role="status" className="mt-5 flex items-start gap-3 rounded-[20px] border border-signal p-4">
      <IconAlert className="mt-0.5 h-5 w-5 shrink-0 text-signal-text" />
      <div>
        <p className="text-[15px] leading-normal text-bone">{dict.account.unavailable}</p>
        <Link href={href(locale, "/catalog")} className="mt-2 inline-block text-[15px] text-signal-text hover:underline">
          {dict.account.toCatalog}
        </Link>
      </div>
    </div>
  );
}

function LoginForm() {
  const { dict } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [done, setDone] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (!z.string().email().safeParse(email.trim()).success) next.email = dict.account.errEmail;
    if (!password) next.password = dict.account.errLoginPassword;
    setErrors(next);
    setDone(Object.keys(next).length === 0);
  };

  return (
    <Panel title={dict.account.login}>
      <form onSubmit={submit} noValidate className="grid gap-5">
        <Field id="login-email" label={dict.account.email} error={errors.email}>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={!!errors.email}
            className="field"
          />
        </Field>
        <Field id="login-password" label={dict.account.password} error={errors.password}>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={!!errors.password}
            className="field"
          />
        </Field>
        <p className="text-[15px] text-bone-dim">{dict.account.forgot}</p>
        <button type="submit" className="signal-btn w-full">
          {dict.account.submitLogin}
        </button>
      </form>
      {done ? <Notice /> : null}
    </Panel>
  );
}

function RegisterForm() {
  const { dict } = useI18n();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [done, setDone] = useState(false);

  const rules = [
    { ok: password.length >= 8, label: dict.account.ruleLength },
    { ok: /\d/.test(password), label: dict.account.ruleDigit },
    { ok: /\p{Lu}/u.test(password), label: dict.account.ruleUpper },
  ];
  const score = rules.filter((rule) => rule.ok).length;
  const strength =
    score === 3
      ? dict.account.strengthStrong
      : score === 2
        ? dict.account.strengthMedium
        : dict.account.strengthWeak;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (!z.string().email().safeParse(email.trim()).success) next.email = dict.account.errEmail;
    if (score < 3) next.password = dict.account.errPassword;
    setErrors(next);
    setDone(Object.keys(next).length === 0);
  };

  return (
    <Panel title={dict.account.register} accent>
      <form onSubmit={submit} noValidate className="grid gap-5">
        <Field id="reg-email" label={`${dict.account.email} *`} error={errors.email}>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={!!errors.email}
            className="field"
          />
        </Field>
        <Field id="reg-phone" label={dict.account.phone}>
          <input
            id="reg-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+380"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="field"
          />
        </Field>
        <Field id="reg-password" label={`${dict.account.password} *`} error={errors.password}>
          <input
            id="reg-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={!!errors.password}
            aria-describedby="password-rules"
            className="field"
          />
        </Field>

        <div id="password-rules" className="-mt-1">
          <div className="flex items-center gap-4">
            <div className="flex flex-1 gap-1.5" aria-hidden>
              {[1, 2, 3].map((step) => (
                <span
                  key={step}
                  className={`h-1 flex-1 rounded-full ${step <= score ? "bg-signal" : "bg-ink-600"}`}
                />
              ))}
            </div>
            <span className="text-sm text-bone-dim" aria-live="polite">
              {password ? strength : ""}
            </span>
          </div>
          <ul className="mt-3 grid gap-1.5">
            {rules.map((rule) => (
              <li key={rule.label} className={`flex items-center gap-2.5 text-[15px] ${rule.ok ? "text-bone" : "text-bone-dim"}`}>
                {rule.ok ? (
                  <IconCheck className="h-4 w-4 text-signal-text" />
                ) : (
                  <span className="ml-0.5 mr-0.5 h-3 w-3 rounded-full border border-bone-dim" aria-hidden />
                )}
                {rule.label}
              </li>
            ))}
          </ul>
        </div>

        <button type="submit" className="signal-btn w-full">
          {dict.account.submitRegister}
        </button>
        <p className="text-sm leading-normal text-bone-dim">{dict.account.consent}</p>
      </form>
      {done ? <Notice /> : null}
    </Panel>
  );
}
