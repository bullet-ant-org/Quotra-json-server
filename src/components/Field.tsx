import { forwardRef, type InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Field = forwardRef<HTMLInputElement, Props>(function Field({ label, error, hint, id, ...rest }, ref) {
  const fid = id ?? rest.name;
  return (
    <div className="space-y-1.5">
      <label htmlFor={fid} className="text-sm font-semibold">{label}</label>
      <input
        ref={ref}
        id={fid}
        aria-invalid={!!error}
        aria-describedby={error ? `${fid}-e` : hint ? `${fid}-h` : undefined}
        className={`w-full rounded-xl border bg-bg px-4 py-3 outline-none focus:border-accent ${error ? "border-red-600" : "border-line"}`}
        {...rest}
      />
      {hint && !error && <p id={`${fid}-h`} className="text-xs text-muted">{hint}</p>}
      {error && <p id={`${fid}-e`} className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
});
