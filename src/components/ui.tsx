import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

export function buttonClass(variant: Variant = "primary", extra = "") {
  const styles: Record<Variant, string> = {
    primary: "bg-adtp text-white hover:bg-adtp-deep",
    secondary: "bg-coal text-white hover:bg-burgundy",
    ghost: "border border-line bg-white text-ink hover:border-adtp hover:text-adtp",
    danger: "border border-adtp bg-white text-adtp hover:bg-adtp hover:text-white",
  };
  return `inline-flex min-h-11 touch-manipulation items-center justify-center gap-2 rounded-lg px-4 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${extra}`;
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={buttonClass(variant, className)} {...props} />;
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
      {error ? (
        <p className="mt-1 text-sm font-semibold text-adtp" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const controlClass =
  "min-h-12 w-full rounded-lg border border-line bg-white px-3 text-base text-ink outline-none focus:border-adtp";
