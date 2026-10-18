import { FormEvent, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle, MailCheck } from "lucide-react";
import { Field } from "../components/Field";
import { post, ApiNotConfigured } from "../lib/api";
import { useTitle } from "../lib/useTitle";

type Errors = Record<string, string>;
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function useForm(path: string, validate: (f: FormData) => Errors) {
  const [errors, setErrors] = useState<Errors>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const errs = validate(fd);
    setErrors(errs);
    setBanner(null);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await post(path, Object.fromEntries(fd));
      setDone(true);
    } catch (err) {
      setBanner(err instanceof ApiNotConfigured
        ? "Accounts aren't available yet because the Roamly API isn't connected. Nothing was sent."
        : (err as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return { errors, banner, busy, done, submit };
}

function Banner({ text }: { text: string }) {
  return (
    <div role="alert" className="flex gap-3 rounded-xl border border-red-600/40 bg-red-600/10 p-4 text-sm">
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />{text}
    </div>
  );
}

const submitCls = "w-full rounded-full bg-accent px-6 py-3.5 font-bold text-accent-ink hover:opacity-90 disabled:opacity-60";

export function Login() {
  useTitle("Log in");
  const [params] = useSearchParams();
  const next = params.get("next");
  const f = useForm("/auth/login", (fd) => {
    const e: Errors = {};
    if (!emailRe.test(String(fd.get("email")))) e.email = "Enter a valid email address.";
    if (!String(fd.get("password"))) e.password = "Enter your password.";
    return e;
  });
  return (
    <div className="space-y-7">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold">Welcome back</h1>
        <p className="text-muted">Log in to check in, earn tokens and message businesses.</p>
      </div>
      <form onSubmit={f.submit} noValidate className="space-y-5">
        {f.banner && <Banner text={f.banner} />}
        <Field label="Email" name="email" type="email" autoComplete="email" error={f.errors.email} />
        <Field label="Password" name="password" type="password" autoComplete="current-password" error={f.errors.password} />
        <div className="text-right text-sm"><Link to="/forgot-password" className="font-semibold text-accent-text hover:underline">Forgot password?</Link></div>
        <button className={submitCls} disabled={f.busy}>{f.busy ? "Logging in…" : "Log in"}</button>
      </form>
      <p className="text-sm text-muted">New to Roamly? <Link to={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-accent-text hover:underline">Create an account</Link></p>
    </div>
  );
}

export function Register() {
  useTitle("Sign up");
  const [params] = useSearchParams();
  const isBiz = params.get("type") === "business";
  const next = params.get("next");
  const f = useForm("/auth/register", (fd) => {
    const e: Errors = {};
    if (String(fd.get("name")).trim().length < 2) e.name = "Enter your name.";
    if (!emailRe.test(String(fd.get("email")))) e.email = "Enter a valid email address.";
    if (String(fd.get("password")).length < 10) e.password = "Use at least 10 characters.";
    if (!fd.get("terms")) e.terms = "Accept the terms to continue.";
    return e;
  });
  return (
    <div className="space-y-7">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold">{isBiz ? "List your place on Roamly" : "Join Roamly"}</h1>
        <p className="text-muted">{isBiz ? "Create your owner account first. You'll add your business details and verification next." : "Save places, earn tokens and share what you find."}</p>
      </div>
      <div className="grid grid-cols-2 gap-1 rounded-full bg-surface p-1 text-center text-sm font-semibold" role="tablist" aria-label="Account type">
        <Link role="tab" aria-selected={!isBiz} to={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`} className={`rounded-full py-2 ${!isBiz ? "bg-bg shadow-sm" : "text-muted"}`}>Explorer</Link>
        <Link role="tab" aria-selected={isBiz} to="/register?type=business" className={`rounded-full py-2 ${isBiz ? "bg-bg shadow-sm" : "text-muted"}`}>Business</Link>
      </div>
      <form onSubmit={f.submit} noValidate className="space-y-5">
        {f.banner && <Banner text={f.banner} />}
        <input type="hidden" name="accountType" value={isBiz ? "business" : "explorer"} />
        <Field label="Full name" name="name" autoComplete="name" error={f.errors.name} />
        <Field label="Email" name="email" type="email" autoComplete="email" error={f.errors.email} />
        <Field label="Password" name="password" type="password" autoComplete="new-password" hint="At least 10 characters." error={f.errors.password} />
        <div className="space-y-1">
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" name="terms" className="mt-1 size-4 accent-[var(--c-accent)]" aria-invalid={!!f.errors.terms} />
            <span>I agree to the <Link to="/terms" className="font-semibold text-accent-text underline">Terms</Link>, <Link to="/privacy" className="font-semibold text-accent-text underline">Privacy Policy</Link> and <Link to="/token-terms" className="font-semibold text-accent-text underline">Token Terms</Link>.</span>
          </label>
          {f.errors.terms && <p className="text-sm font-medium text-red-600 dark:text-red-400">{f.errors.terms}</p>}
        </div>
        <button className={submitCls} disabled={f.busy}>{f.busy ? "Creating account…" : "Create account"}</button>
      </form>
      <p className="text-sm text-muted">Already have an account? <Link to={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-accent-text hover:underline">Log in</Link></p>
    </div>
  );
}

export function ForgotPassword() {
  useTitle("Reset password");
  const f = useForm("/auth/forgot-password", (fd) => (emailRe.test(String(fd.get("email"))) ? ({} as Errors) : { email: "Enter a valid email address." }));
  if (f.done)
    return (
      <div className="space-y-4">
        <MailCheck className="size-10 text-accent" aria-hidden="true" />
        <h1 className="text-4xl font-extrabold">Check your email</h1>
        <p className="text-muted">If an account exists for that address, we've sent a link to reset your password.</p>
        <Link to="/login" className="font-semibold text-accent-text hover:underline">Back to log in</Link>
      </div>
    );
  return (
    <div className="space-y-7">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold">Reset your password</h1>
        <p className="text-muted">Enter your email and we'll send you a reset link.</p>
      </div>
      <form onSubmit={f.submit} noValidate className="space-y-5">
        {f.banner && <Banner text={f.banner} />}
        <Field label="Email" name="email" type="email" autoComplete="email" error={f.errors.email} />
        <button className={submitCls} disabled={f.busy}>{f.busy ? "Sending…" : "Send reset link"}</button>
      </form>
      <Link to="/login" className="text-sm font-semibold text-accent-text hover:underline">Back to log in</Link>
    </div>
  );
}
