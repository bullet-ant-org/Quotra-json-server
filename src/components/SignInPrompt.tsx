import { Link, useLocation } from "react-router-dom";
import { Lock } from "lucide-react";

// Guest gate: actions that need an account route to sign in and come back.
export function SignInPrompt({ action, className = "" }: { action: string; className?: string }) {
  const { pathname } = useLocation();
  const next = encodeURIComponent(pathname);
  return (
    <div className={`flex flex-wrap items-center gap-3 rounded-xl bg-accent-soft p-4 text-sm ${className}`}>
      <Lock className="size-4 shrink-0 text-accent-text" aria-hidden="true" />
      <p className="flex-1 min-w-48">Create a free account to {action}.</p>
      <Link to={`/register?next=${next}`} className="rounded-full bg-accent px-4 py-2 font-bold text-accent-ink">Sign up</Link>
      <Link to={`/login?next=${next}`} className="font-semibold underline underline-offset-4">Log in</Link>
    </div>
  );
}
