import type { ReactNode } from "react";

type PageHeroProps = {
  badge: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PageHero({
  badge,
  title,
  description,
  actions,
}: PageHeroProps) {
  return (
    <section className="flex min-h-[calc(100vh-11rem)] flex-col justify-center py-6 sm:min-h-[calc(100vh-10rem)]">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        <span className="ui-badge mb-6">
          {badge}
        </span>
        <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg lg:text-xl">
          {description}
        </p>
        {actions ? <div className="mt-10 flex flex-wrap justify-center gap-4">{actions}</div> : null}
      </div>
    </section>
  );
}
