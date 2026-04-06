type FeedbackPanelProps = {
  score: number;
  conciseFeedback: string;
  strengths: string[];
  improvements: string[];
  followUpQuestion: string;
  onContinue: () => void;
  nextQuestionNumber: number;
  disabled?: boolean;
};

export function FeedbackPanel({
  score,
  conciseFeedback,
  strengths,
  improvements,
  followUpQuestion,
  onContinue,
  nextQuestionNumber,
  disabled = false,
}: FeedbackPanelProps) {
  return (
    <div className="mt-8 rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(241,245,249,0.92))] p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
            AI coaching feedback
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-950">
            Coaching summary for this response
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Review the evaluation before moving on so the next answer builds on
            the coaching you just received.
          </p>
        </div>
        <div className="rounded-3xl bg-slate-950 px-5 py-4 text-white shadow-lg shadow-slate-950/20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
            Score
          </p>
          <p className="mt-2 text-4xl font-semibold">{score}/10</p>
        </div>
      </div>

      <p className="mt-6 max-w-3xl text-base leading-7 text-slate-700">
        {conciseFeedback}
      </p>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-5">
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Strengths
          </h4>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
            {strengths.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-emerald-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-amber-200 bg-amber-50/80 p-5">
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
            Improvements
          </h4>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
            {improvements.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-amber-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-sky-200 bg-sky-50/80 p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
          AI-generated follow-up
        </p>
        <p className="mt-3 text-lg leading-8 text-slate-900">{followUpQuestion}</p>
      </div>

      <div className="mt-8 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-slate-500">
          Continue when you are ready to tackle question {nextQuestionNumber}.
        </p>
        <button
          type="button"
          onClick={onContinue}
          disabled={disabled}
          className="btn-primary"
        >
          Continue to Next Question
        </button>
      </div>
    </div>
  );
}
