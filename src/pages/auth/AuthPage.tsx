import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, ArrowLeft, Check, Eye, EyeOff, Loader2, Moon, Sun } from "lucide-react";
import { Logo } from "../../components/Logo";
import { OtpInput } from "../../components/OtpInput";
import { AuthVisual } from "./AuthVisual";
import { auth, isDemo } from "../../lib/auth/service";
import { DEMO_OTP, DEMO_PASSWORD } from "../../lib/auth/demo";
import { homeFor, useAuth } from "../../lib/auth/AuthContext";
import { ApiNotConfigured } from "../../lib/api";
import { useTheme } from "../../lib/theme";
import { useTitle } from "../../lib/useTitle";

type Mode = "login" | "register" | "forgot";
type Key = "firstName" | "lastName" | "username" | "email" | "password" | "otp";

interface Step {
  key: Key;
  title: (v: Values) => string;
  sub: (v: Values) => string;
  type?: string;
  auto?: string;
  placeholder?: string;
  cta: string;
}
type Values = Record<Key, string>;

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const userRe = /^[a-z0-9._]{3,20}$/;

const flows: Record<Mode, Step[]> = {
  login: [
    { key: "email", title: () => "Welcome back", sub: () => "Enter the email you signed up with.", type: "email", auto: "email", placeholder: "you@example.com", cta: "Continue" },
    { key: "password", title: () => "Enter your password", sub: (v) => v.email, type: "password", auto: "current-password", placeholder: "Your password", cta: "Log in" },
  ],
  register: [
    { key: "firstName", title: () => "What's your first name?", sub: () => "This is how you'll appear to other explorers.", auto: "given-name", placeholder: "First name", cta: "Continue" },
    { key: "lastName", title: (v) => `Nice to meet you, ${v.firstName}. And your last name?`, sub: () => "Only your first name shows by default.", auto: "family-name", placeholder: "Last name", cta: "Continue" },
    { key: "username", title: () => "Pick a username", sub: () => "Letters, numbers, dots and underscores. 3 to 20 characters.", auto: "username", placeholder: "username", cta: "Continue" },
    { key: "email", title: () => "What's your email?", sub: () => "We'll send a code here to confirm it's you.", type: "email", auto: "email", placeholder: "you@example.com", cta: "Continue" },
    { key: "password", title: () => "Create a password", sub: () => "At least 10 characters. A short phrase works well.", type: "password", auto: "new-password", placeholder: "New password", cta: "Send my code" },
    { key: "otp", title: () => "Check your email", sub: (v) => `Enter the 6-digit code we sent to ${v.email}.`, cta: "Verify and create account" },
  ],
  forgot: [
    { key: "email", title: () => "Forgot your password?", sub: () => "Enter your email and we'll send you a sign-in code.", type: "email", auto: "email", placeholder: "you@example.com", cta: "Send code" },
    { key: "otp", title: () => "Enter your code", sub: (v) => `We sent a 6-digit code to ${v.email}.`, cta: "Verify and sign in" },
  ],
};

function strength(p: string) {
  let s = 0;
  if (p.length >= 10) s++;
  if (p.length >= 14) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p) || /[^a-zA-Z0-9]/.test(p)) s++;
  return s;
}
const strengthLabel = ["Too short", "Weak", "Okay", "Strong", "Very strong"];

function GoogleButton({ label, onError, onUser }: { label: string; onError: (m: string) => void; onUser: () => void }) {
  const [busy, setBusy] = useState(false);
  const [params] = useSearchParams();
  const go = async () => {
    const url = auth.googleUrl(params.get("next") ?? "/home");
    if (url) return void (window.location.href = url);
    if (auth.googleDemo) {
      setBusy(true);
      try { await auth.googleDemo(); onUser(); } finally { setBusy(false); }
      return;
    }
    onError("Google sign-in isn't available yet because the Outsider API isn't connected.");
  };
  return (
    <button type="button" onClick={go} disabled={busy} className="flex w-full items-center justify-center gap-3 rounded-full border-2 border-line bg-bg px-6 py-3.5 font-bold transition-colors hover:border-ink/40 disabled:opacity-60">
      {busy ? <Loader2 className="size-5 animate-spin" /> : (
        <svg viewBox="0 0 48 48" className="size-5" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
      )}
      {label}
    </button>
  );
}

export default function AuthPage() {
  const { pathname } = useLocation();
  const mode: Mode = pathname.startsWith("/register") ? "register" : pathname.startsWith("/forgot") ? "forgot" : "login";
  return <AuthFlow key={mode} mode={mode} />;
}

function AuthFlow({ mode }: { mode: Mode }) {
  useTitle(mode === "login" ? "Log in" : mode === "register" ? "Sign up" : "Reset password");
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next");
  const qs = next ? `?next=${encodeURIComponent(next)}` : "";
  const { setUser } = useAuth();
  const { theme, toggle } = useTheme();

  const steps = flows[mode];
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [v, setV] = useState<Values>({ firstName: "", lastName: "", username: "", email: params.get("email") ?? "", password: "", otp: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const step = steps[i];

  useEffect(() => {
    if (!cooldown) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const finish = async () => {
    const u = await auth.me();
    setUser(u);
    nav(next && u?.role === "user" ? next : homeFor(u?.role), { replace: true });
  };

  const fail = (err: unknown) =>
    setError(err instanceof ApiNotConfigured ? "Accounts aren't available yet because the Outsider API isn't connected. Nothing was sent." : (err as Error).message);

  const validate = (): string | null => {
    const val = v[step.key].trim();
    switch (step.key) {
      case "firstName": case "lastName": return val.length < 1 ? "Enter your name to continue." : val.length > 40 ? "Keep it under 40 characters." : null;
      case "username": return userRe.test(val) ? null : "Use 3 to 20 lowercase letters, numbers, dots or underscores.";
      case "email": return emailRe.test(val) ? null : "Enter a valid email address.";
      case "password": return mode === "register" ? (v.password.length < 10 ? "Use at least 10 characters." : null) : (v.password ? null : "Enter your password.");
      case "otp": return v.otp.length === 6 ? null : "Enter all 6 digits.";
    }
  };

  const advance = () => { setDir(1); setI((n) => n + 1); };

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    const msg = validate();
    setError(msg);
    if (msg || busy) return;
    setBusy(true);
    try {
      if (mode === "login" && step.key === "email") advance();
      else if (mode === "login" && step.key === "password") { await auth.login(v.email.trim(), v.password); await finish(); }
      else if (mode === "register" && step.key === "username") {
        if (!(await auth.usernameAvailable(v.username))) setError(`@${v.username} is taken. Try another.`);
        else advance();
      } else if (mode === "register" && step.key === "password") {
        await auth.requestSignupOtp({ firstName: v.firstName.trim(), lastName: v.lastName.trim(), username: v.username, email: v.email.trim(), password: v.password });
        setCooldown(30); advance();
      } else if (mode === "register" && step.key === "otp") { await auth.verifySignupOtp(v.email.trim(), v.otp); await finish(); }
      else if (mode === "forgot" && step.key === "email") { await auth.requestPasswordOtp(v.email.trim()); setCooldown(30); advance(); }
      else if (mode === "forgot" && step.key === "otp") { await auth.verifyPasswordOtp(v.email.trim(), v.otp); await finish(); }
      else advance();
    } catch (err) {
      fail(err);
      if (step.key === "otp") setV((s) => ({ ...s, otp: "" }));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setError(null);
    try {
      if (mode === "register") await auth.requestSignupOtp({ firstName: v.firstName, lastName: v.lastName, username: v.username, email: v.email, password: v.password });
      else await auth.requestPasswordOtp(v.email);
      setCooldown(30);
    } catch (err) { fail(err); }
  };

  const back = () => { setError(null); setDir(-1); setI((n) => n - 1); };
  const pw = useMemo(() => strength(v.password), [v.password]);

  return (
    <div className="min-h-dvh bg-bg lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/* Phone: orange band on top. Desktop: right-hand panel. */}
      <div className="relative lg:order-2">
        <AuthVisual mode={mode} />
      </div>

      <div className="relative z-10 -mt-8 flex min-h-[calc(100dvh-13rem)] flex-col rounded-t-[2rem] bg-bg px-5 pb-8 pt-6 sm:px-10 lg:mt-0 lg:min-h-dvh lg:rounded-none lg:pt-8">
        <div className="hidden items-center justify-between lg:flex">
          <Link to="/" aria-label="Outsider home"><Logo /></Link>
          <button type="button" onClick={toggle} className="grid size-10 place-items-center rounded-full hover:bg-surface" aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
            {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col lg:justify-center lg:py-10">
          {isDemo && (
            <p className="mb-5 rounded-xl bg-accent-soft px-4 py-2.5 text-xs font-medium text-accent-text">
              Demo: log in as <strong>user@gmail.com</strong>, <strong>brand@gmail.com</strong> or <strong>admin@gmail.com</strong> with password <strong>{DEMO_PASSWORD}</strong>. Sign-up code is <strong>{DEMO_OTP}</strong>.
            </p>
          )}

          <div className="flex items-center gap-3">
            <button type="button" onClick={i > 0 ? back : () => nav(-1)} className="grid size-10 shrink-0 place-items-center rounded-full bg-surface hover:bg-surface-2" aria-label={i > 0 ? "Previous step" : "Go back"}>
              <ArrowLeft className="size-5" />
            </button>
            <div className="flex flex-1 gap-1.5" aria-hidden="true">
              {steps.map((s, n) => (
                <span key={s.key + n} className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                  <motion.span className="block h-full rounded-full bg-accent" initial={false} animate={{ width: n <= i ? "100%" : "0%" }} transition={{ type: "spring", stiffness: 200, damping: 30 }} />
                </span>
              ))}
            </div>
            <span className="text-xs font-semibold text-muted">Step {i + 1} of {steps.length}</span>
          </div>

          <form onSubmit={submit} noValidate className="mt-8 flex flex-1 flex-col lg:flex-none">
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.div
                key={step.key + i}
                custom={dir}
                initial={{ x: dir * 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: dir * -40, opacity: 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 34 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h1 className="text-[2rem] font-extrabold leading-[1.05] sm:text-4xl">{step.title(v)}</h1>
                  <p className="break-words text-muted">{step.sub(v)}</p>
                </div>

                {i === 0 && mode !== "forgot" && (
                  <>
                    <GoogleButton label={mode === "login" ? "Continue with Google" : "Sign up with Google"} onError={setError} onUser={finish} />
                    <div className="flex items-center gap-3 text-xs font-semibold text-muted"><span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" /></div>
                  </>
                )}

                {step.key === "otp" ? (
                  <div className="space-y-4">
                    <OtpInput value={v.otp} invalid={!!error} onChange={(otp) => setV((s) => ({ ...s, otp }))} onComplete={() => setTimeout(() => submit(), 0)} />
                    <p className="text-sm text-muted">
                      Didn't get it?{" "}
                      {cooldown ? <span>Resend in {cooldown}s</span> : <button type="button" onClick={resend} className="font-semibold text-accent-text underline underline-offset-4">Send a new code</button>}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label htmlFor={step.key} className="sr-only">{step.placeholder}</label>
                    <div className="relative">
                      {step.key === "username" && <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted">@</span>}
                      <input
                        id={step.key}
                        autoFocus
                        type={step.type === "password" ? (showPw ? "text" : "password") : step.type ?? "text"}
                        autoComplete={step.auto}
                        autoCapitalize={step.key === "firstName" || step.key === "lastName" ? "words" : "none"}
                        placeholder={step.placeholder}
                        value={v[step.key]}
                        aria-invalid={!!error}
                        aria-describedby={error ? "auth-err" : undefined}
                        onChange={(e) => { const val = step.key === "username" ? e.target.value.toLowerCase().replace(/\s/g, "") : e.target.value; setV((s) => ({ ...s, [step.key]: val })); setError(null); }}
                        className={`w-full rounded-2xl border-2 bg-surface py-4 text-lg font-medium outline-none transition-colors placeholder:text-muted/70 focus:border-accent focus:bg-bg ${step.key === "username" ? "pl-10 pr-5" : "px-5"} ${step.type === "password" ? "pr-14" : ""} ${error ? "border-red-600" : "border-transparent"}`}
                      />
                      {step.type === "password" && (
                        <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-surface-2" aria-label={showPw ? "Hide password" : "Show password"}>
                          {showPw ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                        </button>
                      )}
                    </div>
                    {mode === "register" && step.key === "password" && v.password && (
                      <div aria-live="polite">
                        <div className="flex gap-1">{[0, 1, 2, 3].map((n) => <span key={n} className={`h-1.5 flex-1 rounded-full ${n < pw ? "bg-accent" : "bg-surface-2"}`} />)}</div>
                        <p className="mt-1.5 text-xs font-semibold text-muted">{strengthLabel[pw]}</p>
                      </div>
                    )}
                    {mode === "login" && step.key === "password" && (
                      <Link to={`/forgot-password?email=${encodeURIComponent(v.email)}${next ? `&next=${encodeURIComponent(next)}` : ""}`} className="inline-block text-sm font-semibold text-accent-text hover:underline">Forgot password?</Link>
                    )}
                  </div>
                )}

                {error && (
                  <p id="auth-err" role="alert" className="flex gap-2 text-sm font-medium text-red-600 dark:text-red-400">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{error}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-auto space-y-5 pt-8 lg:mt-0">
              <button className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 text-lg font-bold text-accent-ink transition active:scale-[0.98] disabled:opacity-60" disabled={busy}>
                {busy ? <Loader2 className="size-5 animate-spin" aria-label="Working" /> : <>{step.key === "otp" && <Check className="size-5" aria-hidden="true" />}{step.cta}</>}
              </button>

              {mode === "register" && i === 0 && (
                <p className="text-center text-xs text-muted">By continuing you agree to the <Link to="/terms" className="underline">Terms</Link>, <Link to="/privacy" className="underline">Privacy Policy</Link> and <Link to="/token-terms" className="underline">Token Terms</Link>.</p>
              )}

              <p className="text-center text-sm text-muted">
                {mode === "login" && <>New to Outsider? <Link to={`/register${qs}`} replace className="font-bold text-accent-text hover:underline">Create an account</Link></>}
                {mode === "register" && <>Already have an account? <Link to={`/login${qs}`} replace className="font-bold text-accent-text hover:underline">Log in</Link></>}
                {mode === "forgot" && <>Remembered it? <Link to={`/login${qs}`} replace className="font-bold text-accent-text hover:underline">Back to log in</Link></>}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
