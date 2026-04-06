import type { ReactNode } from "react";

type PageHeroProps = {
  badge: string;
  title: string;
  description: string;
  actions?: ReactNode;
  supportPanel?: ReactNode;
  align?: "center" | "left";
  variant?: "home" | "setup" | "interview" | "report";
};

const variantStyles = {
  home: {
    section:
      "min-h-[calc(68vh-8rem)] pt-4 pb-2 sm:min-h-[calc(64vh-7rem)] sm:pt-6 sm:pb-3 lg:min-h-[calc(60vh-7rem)] lg:pt-8 lg:pb-4",
    container:
      "max-w-5xl overflow-hidden rounded-[2.4rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(239,246,255,0.94),rgba(224,231,255,0.82))] px-6 py-9 ring-1 ring-sky-100/70 shadow-[0_18px_40px_rgba(15,23,42,0.05)] sm:px-8 sm:py-10 lg:px-10",
  },
  setup: {
    section: "min-h-[calc(70vh-8rem)] py-4",
    container:
      "max-w-5xl rounded-[2.2rem] border border-sky-100/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(240,249,255,0.9))] px-6 py-8 shadow-[0_24px_80px_rgba(14,165,233,0.08)] sm:px-8",
  },
  interview: {
    section: "min-h-[calc(62vh-8rem)] py-4",
    container:
      "max-w-5xl rounded-[2.2rem] border border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-8",
  },
  report: {
    section: "min-h-[calc(62vh-8rem)] py-4",
    container:
      "max-w-5xl rounded-[2.2rem] border border-indigo-100/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(238,242,255,0.92))] px-6 py-8 shadow-[0_24px_80px_rgba(99,102,241,0.08)] sm:px-8",
  },
};

export function PageHero({
  badge,
  title,
  description,
  actions,
  supportPanel,
  align = "center",
  variant = "home",
}: PageHeroProps) {
  const styles = variantStyles[variant];
  const alignment =
    align === "left"
      ? "items-start text-left"
      : "items-center text-center";

  return (
    <section className={`flex flex-col justify-center ${styles.section}`}>
      <div className={`mx-auto flex w-full flex-col ${styles.container}`}>
        <div className={`flex w-full flex-col ${alignment}`}>
          <span className="ui-badge mb-6">
            {badge}
          </span>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg lg:text-xl">
            {description}
          </p>
          {actions ? (
            <div
              className={`mt-10 flex flex-wrap gap-4 ${
                align === "left" ? "justify-start" : "justify-center"
              }`}
            >
              {actions}
            </div>
          ) : null}
        </div>
        {supportPanel ? <div className="mt-8">{supportPanel}</div> : null}
      </div>
    </section>
  );
}
