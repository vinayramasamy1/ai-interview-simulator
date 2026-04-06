type ReportInsightListProps = {
  title: string;
  items: string[];
  tone: "strength" | "improvement";
  emptyLabel: string;
};

const toneStyles = {
  strength: {
    border: "border-emerald-200",
    background: "bg-emerald-50/80",
    heading: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  improvement: {
    border: "border-amber-200",
    background: "bg-amber-50/80",
    heading: "text-amber-700",
    dot: "bg-amber-500",
  },
};

export function ReportInsightList({
  title,
  items,
  tone,
  emptyLabel,
}: ReportInsightListProps) {
  const styles = toneStyles[tone];

  return (
    <section
      className={`rounded-[2rem] border p-6 ${styles.border} ${styles.background}`}
    >
      <h2
        className={`text-sm font-semibold uppercase tracking-[0.2em] ${styles.heading}`}
      >
        {title}
      </h2>
      {items.length > 0 ? (
        <ul className="mt-5 space-y-4 text-sm leading-6 text-slate-700">
          {items.map((item) => (
            <li key={item} className="flex gap-3">
              <span className={`mt-2 h-2 w-2 rounded-full ${styles.dot}`} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 text-sm leading-6 text-slate-500">{emptyLabel}</p>
      )}
    </section>
  );
}
