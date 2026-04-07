import { AnswerComposer } from "@/components/interview/answer-composer";
import { SpokenAnswerComposer } from "@/components/interview/spoken-answer-composer";
import type { ResponseMode } from "@/lib/interview-setup";

type QuestionPanelProps = {
  question: string;
  interviewType?: string;
  experienceLevel?: string;
  targetRole?: string;
  responseMode?: ResponseMode;
  isEvaluating?: boolean;
  answerLocked?: boolean;
  onSubmitAnswer: (answer: string) => Promise<void> | void;
};

export function QuestionPanel({
  question,
  interviewType,
  experienceLevel,
  targetRole,
  responseMode = "Written",
  isEvaluating = false,
  answerLocked = false,
  onSubmitAnswer,
}: QuestionPanelProps) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] px-5 py-6 shadow-[0_20px_60px_rgba(15,23,42,0.07)] sm:px-6 sm:py-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
        Current question
      </p>
      <p className="mt-4 text-xl leading-9 text-slate-950 sm:mt-6 sm:text-2xl sm:leading-10">
        {question}
      </p>
      <p className="mt-4 text-sm leading-6 text-slate-500">
        Answer as if you were in a live interview. Aim for clarity,
        structure, and relevant detail over length.
      </p>
      <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-500">
        <span className="ui-chip">{interviewType}</span>
        <span className="ui-chip">{experienceLevel}</span>
        <span className="ui-chip">{targetRole}</span>
        <span className="ui-chip">{responseMode} responses</span>
      </div>

      {responseMode === "Spoken" ? (
        <SpokenAnswerComposer
          disabled={answerLocked}
          isSubmitting={isEvaluating}
          onSubmitAnswer={onSubmitAnswer}
        />
      ) : (
        <AnswerComposer
          disabled={answerLocked}
          isSubmitting={isEvaluating}
          onSubmitAnswer={onSubmitAnswer}
          modeLabel="Written mode"
        />
      )}
    </div>
  );
}
