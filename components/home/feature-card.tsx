type FeatureCardProps = {
  title: string;
  description: string;
};

export function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <article className="ui-card rounded-[2rem] p-6 sm:p-7">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(14,165,233,0.16),rgba(99,102,241,0.16))]">
        <div className="h-5 w-5 rounded-full bg-slate-900/80" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
      <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>
    </article>
  );
}
