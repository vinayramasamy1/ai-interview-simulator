import type { ReactNode } from "react";

type ReportStatCardProps = {
  label: string;
  value: string;
  detail: string;
  accent?: "neutral" | "success" | "warning";
  children?: ReactNode;
};

const accentStyles = {
  neutral: "from-white to-slate-50 border-slate-200",
  success: "from-emerald-50 to-white border-emerald-200",
  warning: "from-amber-50 to-white border-amber-200",
};

export function ReportStatCard({
  label,
  value,
  detail,
  accent = "neutral",
  children,
}: ReportStatCardProps) {
  return (
    <section
      className={`rounded-[2rem] border bg-gradient-to-br p-5 shadow-[0_18px_55px_rgba(15,23,42,0.06)] sm:p-6 ${accentStyles[accent]}`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
        {label}
      </p>
      <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{detail}</p>
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}
