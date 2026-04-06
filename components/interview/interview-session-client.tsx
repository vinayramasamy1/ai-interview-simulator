"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FeedbackPanel } from "@/components/interview/feedback-panel";
import { InterviewTimer } from "@/components/interview/interview-timer";
import { QuestionPanel } from "@/components/interview/question-panel";
import { SurfaceCard } from "@/components/shared/surface-card";
import {
  loadInterviewSetup,
  type InterviewSetupData,
} from "@/lib/interview-setup";
import {
  clearInterviewSession,
  createHistoryEntry,
  saveInterviewSession,
  totalInterviewQuestions,
  type InterviewEvaluation,
  type InterviewHistoryEntry,
} from "@/lib/interview-session";

type QuestionRequestState =
  | { status: "idle" | "loading"; question: null; error: null }
  | { status: "success"; question: string; error: null }
  | { status: "error"; question: null; error: string };

type EvaluationState =
  | { status: "idle"; result: null; error: null }
  | { status: "loading"; result: null; error: null }
  | { status: "success"; result: InterviewEvaluation; error: null }
  | { status: "error"; result: null; error: string };

const initialQuestionState: QuestionRequestState = {
  status: "idle",
  question: null,
  error: null,
};

const initialEvaluationState: EvaluationState = {
  status: "idle",
  result: null,
  error: null,
};

export function InterviewSessionClient() {
  const router = useRouter();
  const [setupData, setSetupData] = useState<InterviewSetupData | null>(null);
  const [questionState, setQuestionState] =
    useState<QuestionRequestState>(initialQuestionState);
  const [evaluationState, setEvaluationState] =
    useState<EvaluationState>(initialEvaluationState);
  const [history, setHistory] = useState<InterviewHistoryEntry[]>([]);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);

  useEffect(() => {
    const savedSetup = loadInterviewSetup();

    if (!savedSetup) {
      setQuestionState({
        status: "error",
        question: null,
        error: "No interview setup was found. Start a setup flow first.",
      });
      return;
    }

    setSetupData(savedSetup);
    clearInterviewSession();

    async function fetchQuestion() {
      setQuestionState({ status: "loading", question: null, error: null });

      try {
        const response = await fetch("/api/interview-question", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(savedSetup),
        });

        const payload = (await response.json()) as
          | { question?: string; error?: string }
          | undefined;

        if (!response.ok || !payload?.question) {
          throw new Error(
            payload?.error || "Unable to generate the first question.",
          );
        }

        setQuestionState({
          status: "success",
          question: payload.question,
          error: null,
        });
      } catch (error) {
        setQuestionState({
          status: "error",
          question: null,
          error:
            error instanceof Error
              ? error.message
              : "Unable to generate the first question.",
        });
      }
    }

    void fetchQuestion();
  }, []);

  const sessionStatusMessage =
    questionState.status === "loading"
      ? "Generating your first interview question now..."
      : questionState.status === "error"
        ? "We hit a problem loading the interview session."
        : questionState.status === "idle"
          ? "Preparing your interview session."
          : evaluationState.status === "loading"
            ? "Your answer is being evaluated with tailored coaching."
            : "Your current question is ready for a response.";

  return (
    <section className="mt-16 grid gap-6 lg:grid-cols-[0.95fr_1.35fr] lg:items-start">
      <div className="space-y-6">
        <InterviewTimer />

        <SurfaceCard title="Session setup">
          {setupData ? (
            <dl className="space-y-5 text-sm text-slate-600">
              <div>
                <dt className="font-semibold uppercase tracking-wide text-slate-500">
                  Interview Type
                </dt>
                <dd className="mt-1 text-base text-slate-900">
                  {setupData.interviewType}
                </dd>
              </div>
              <div>
                <dt className="font-semibold uppercase tracking-wide text-slate-500">
                  Target Role
                </dt>
                <dd className="mt-1 text-base text-slate-900">
                  {setupData.targetRole}
                </dd>
              </div>
              <div>
                <dt className="font-semibold uppercase tracking-wide text-slate-500">
                  Experience Level
                </dt>
                <dd className="mt-1 text-base text-slate-900">
                  {setupData.experienceLevel}
                </dd>
              </div>
              <div>
                <dt className="font-semibold uppercase tracking-wide text-slate-500">
                  Job Description
                </dt>
                <dd className="mt-1 text-base leading-7 text-slate-700">
                  {setupData.jobDescription || "No job description provided."}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-slate-600">
              Setup details will appear here after you start an interview.
            </p>
          )}
        </SurfaceCard>

        <SurfaceCard title="Session status">
          <p className="text-slate-600">{sessionStatusMessage}</p>
        </SurfaceCard>

        <SurfaceCard title="Interview history">
          {history.length > 0 ? (
            <div className="space-y-4">
              {history.map((item) => (
                <div
                  key={`${item.questionNumber}-${item.question}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Question {item.questionNumber}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-900">
                    {item.question}
                  </p>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                    {item.userAnswer}
                  </p>
                  <p className="mt-3 text-sm text-slate-500">
                    Score:{" "}
                    <span className="font-semibold text-slate-900">
                      {item.score}/10
                    </span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-600">
              Completed question summaries will appear here as the session
              progresses.
            </p>
          )}
        </SurfaceCard>
      </div>

      <SurfaceCard title="Current question">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Interview progress
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-950">
              Question {currentQuestionNumber} of {totalInterviewQuestions}
            </p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 sm:max-w-56">
            <div
              className="h-full rounded-full bg-slate-950"
              style={{
                width: `${(currentQuestionNumber / totalInterviewQuestions) * 100}%`,
              }}
            />
          </div>
        </div>

        {questionState.status === "loading" || questionState.status === "idle" ? (
          <div className="flex min-h-72 flex-col justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
              Loading
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-slate-950">
              Building your first tailored prompt
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              We are using your setup details to generate a realistic opening
              interview question.
            </p>
          </div>
        ) : null}

        {questionState.status === "success" ? (
          <>
            <QuestionPanel
              key={`${currentQuestionNumber}-${questionState.question}`}
              question={questionState.question}
              interviewType={setupData?.interviewType}
              experienceLevel={setupData?.experienceLevel}
              targetRole={setupData?.targetRole}
              isEvaluating={evaluationState.status === "loading"}
              answerLocked={evaluationState.status === "success"}
              onSubmitAnswer={async (answer) => {
                if (!setupData) {
                  return;
                }

                setEvaluationState({
                  status: "loading",
                  result: null,
                  error: null,
                });

                try {
                  const response = await fetch("/api/evaluate-answer", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      currentQuestion: questionState.question,
                      userAnswer: answer,
                      interviewType: setupData.interviewType,
                      targetRole: setupData.targetRole,
                      experienceLevel: setupData.experienceLevel,
                    }),
                  });

                  const payload = (await response.json()) as
                    | (InterviewEvaluation & { error?: string })
                    | { error?: string };

                  if (
                    !response.ok ||
                    !("score" in payload) ||
                    !Array.isArray(payload.strengths) ||
                    !Array.isArray(payload.improvements)
                  ) {
                    throw new Error(
                      "error" in payload && payload.error
                        ? payload.error
                        : "Unable to evaluate your answer right now.",
                    );
                  }

                  const result: InterviewEvaluation = {
                    score: payload.score,
                    strengths: payload.strengths,
                    improvements: payload.improvements,
                    conciseFeedback: payload.conciseFeedback,
                    followUpQuestion: payload.followUpQuestion,
                  };

                  setEvaluationState({
                    status: "success",
                    result,
                    error: null,
                  });

                  setHistory((current) => {
                    const nextHistory = [
                      ...current,
                      createHistoryEntry({
                        questionNumber: currentQuestionNumber,
                        question: questionState.question,
                        userAnswer: answer,
                        evaluation: result,
                      }),
                    ];

                    saveInterviewSession({
                      setup: setupData,
                      currentQuestionNumber,
                      totalQuestions: totalInterviewQuestions,
                      currentQuestion: questionState.question,
                      history: nextHistory,
                    });

                    return nextHistory;
                  });
                } catch (error) {
                  setEvaluationState({
                    status: "error",
                    result: null,
                    error:
                      error instanceof Error
                        ? error.message
                        : "Unable to evaluate your answer right now.",
                  });
                }
              }}
            />

            {evaluationState.status === "loading" ? (
              <div className="mt-8 rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(239,246,255,0.9))] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
                  Evaluating
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-950">
                  Building your coaching feedback
                </h3>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                  Gemini is reviewing the substance, clarity, and depth of your
                  response to generate specific coaching and the next follow-up
                  question.
                </p>
              </div>
            ) : null}

            {evaluationState.status === "error" ? (
              <div className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 px-6 py-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">
                  Evaluation error
                </p>
                <p className="mt-3 text-base leading-7 text-slate-700">
                  {evaluationState.error}
                </p>
              </div>
            ) : null}

            {evaluationState.status === "success" ? (
              <FeedbackPanel
                score={evaluationState.result.score}
                conciseFeedback={evaluationState.result.conciseFeedback}
                strengths={evaluationState.result.strengths}
                improvements={evaluationState.result.improvements}
                followUpQuestion={evaluationState.result.followUpQuestion}
                nextQuestionNumber={Math.min(
                  currentQuestionNumber + 1,
                  totalInterviewQuestions,
                )}
                onContinue={() => {
                  const isFinalQuestion =
                    currentQuestionNumber >= totalInterviewQuestions;

                  if (!setupData) {
                    return;
                  }

                  if (isFinalQuestion) {
                    saveInterviewSession({
                      setup: setupData,
                      currentQuestionNumber,
                      totalQuestions: totalInterviewQuestions,
                      currentQuestion: null,
                      history,
                      completedAt: new Date().toISOString(),
                    });
                    router.push("/report");
                    return;
                  }

                  const nextQuestionNumber = currentQuestionNumber + 1;
                  const nextQuestion = evaluationState.result.followUpQuestion;

                  setCurrentQuestionNumber(nextQuestionNumber);
                  setQuestionState({
                    status: "success",
                    question: nextQuestion,
                    error: null,
                  });
                  setEvaluationState(initialEvaluationState);
                  saveInterviewSession({
                    setup: setupData,
                    currentQuestionNumber: nextQuestionNumber,
                    totalQuestions: totalInterviewQuestions,
                    currentQuestion: nextQuestion,
                    history,
                  });
                }}
              />
            ) : null}
          </>
        ) : null}

        {questionState.status === "error" ? (
          <div className="min-h-72 rounded-3xl border border-rose-200 bg-rose-50 px-6 py-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">
              Error
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-slate-950">
              We could not start the interview
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-700">
              {questionState.error}
            </p>
            <Link
              href="/setup"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Return to setup
            </Link>
          </div>
        ) : null}
      </SurfaceCard>
    </section>
  );
}
