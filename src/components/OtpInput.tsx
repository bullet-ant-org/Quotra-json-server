import { useRef } from "react";

export function OtpInput({ value, onChange, onComplete, invalid }: { value: string; onChange: (v: string) => void; onComplete: (v: string) => void; invalid?: boolean }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  const set = (next: string) => {
    const clean = next.replace(/\D/g, "").slice(0, 6);
    onChange(clean);
    refs.current[Math.min(clean.length, 5)]?.focus();
    if (clean.length === 6) onComplete(clean);
  };

  return (
    <div className="flex justify-between gap-2" role="group" aria-label="6-digit code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          value={d}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={invalid}
          autoFocus={i === 0}
          maxLength={6}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "");
            if (v.length > 1) return set(v); // paste or autofill
            set(value.slice(0, i) + v + value.slice(i + 1));
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !d && i > 0) {
              e.preventDefault();
              onChange(value.slice(0, i - 1));
              refs.current[i - 1]?.focus();
            }
          }}
          className={`aspect-square w-full min-w-0 rounded-2xl border-2 bg-surface text-center font-display text-2xl font-bold outline-none transition-colors focus:border-accent focus:bg-bg sm:text-3xl ${invalid ? "border-red-600" : d ? "border-ink/30" : "border-transparent"}`}
        />
      ))}
    </div>
  );
}
