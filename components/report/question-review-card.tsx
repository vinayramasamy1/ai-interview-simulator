import type { InterviewHistoryEntry } from "@/lib/interview-session";

type QuestionReviewCardProps = {
  item: InterviewHistoryEntry;
};

export function QuestionReviewCard({ item }: QuestionReviewCardProps) {
  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white/84 p-5 shadow-[0_16px_45px_rgba(15,23,42,0.05)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Question {item.questionNumber}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">
            {item.question}
          </h3>
        </div>
        <div className="rounded-2xl bg-slate-950 px-4 py-3 text-white">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-300">
            Score
          </p>
          <p className="mt-1 text-2xl font-semibold">{item.score}/10</p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Your answer
          </p>
          <p className="mt-3 text-base leading-7 text-slate-700">
            {item.userAnswer}
          </p>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Concise feedback
          </p>
          <p className="mt-3 text-base leading-7 text-slate-700">
            {item.conciseFeedback}
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Strengths
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              {item.strengths.map((strength) => (
                <li key={strength} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-emerald-500" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-amber-200 bg-amber-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
              Improvements
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              {item.improvements.map((improvement) => (
                <li key={improvement} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-amber-500" />
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </article>
  );
}
