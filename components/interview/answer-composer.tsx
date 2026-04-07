"use client";

import { type FormEvent, useState } from "react";

type AnswerComposerProps = {
  disabled?: boolean;
  isSubmitting?: boolean;
  onSubmitAnswer: (answer: string) => Promise<void> | void;
  modeLabel?: string;
};

export function AnswerComposer({
  disabled = false,
  isSubmitting = false,
  onSubmitAnswer,
  modeLabel = "Written mode",
}: AnswerComposerProps) {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);

  const characterCount = answer.length;
  const isLocked = disabled || isSubmitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedAnswer = answer.trim();

    if (!normalizedAnswer) {
      setError("Enter an answer before submitting.");
      return;
    }

    setError(null);
    await onSubmitAnswer(normalizedAnswer);
  }

  return (
    <form className="mt-8 border-t border-slate-200 pt-8" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-slate-950">Your answer</h3>
        <div className="flex flex-wrap items-center gap-3">
          <p className="rounded-full bg-sky-50 px-3 py-1 text-sm text-sky-800">
            {modeLabel}
          </p>
          <p className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-500">
          {characterCount} characters
          </p>
        </div>
      </div>

      <label htmlFor="answer" className="sr-only">
        Your interview answer
      </label>
      <textarea
        id="answer"
        name="answer"
        value={answer}
        onChange={(event) => {
          setAnswer(event.target.value);
          if (error) {
            setError(null);
          }
        }}
        disabled={isLocked}
        rows={9}
        placeholder="Write the answer you would give in the interview."
        className="field-control mt-4 min-h-56 rounded-[1.75rem] px-5 py-4 text-base leading-7"
      />

      {error ? (
        <p className="mt-3 text-sm text-rose-600">{error}</p>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          Keep your response specific, structured, and easy to follow.
        </p>
      )}

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Submit your answer to receive coaching, strengths, improvement areas,
          and the next follow-up question.
        </p>
        <button
          type="submit"
          disabled={isLocked}
          className="btn-primary"
        >
          {isSubmitting ? "Evaluating..." : "Submit Answer"}
        </button>
      </div>
    </form>
  );
}
