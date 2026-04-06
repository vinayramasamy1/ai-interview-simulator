import type { ReactNode } from "react";

type SurfaceCardProps = {
  title: string;
  children: ReactNode;
};

export function SurfaceCard({ title, children }: SurfaceCardProps) {
  return (
    <section className="ui-card rounded-[2rem] p-6 sm:p-7 lg:p-8">
      <h2 className="text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}
