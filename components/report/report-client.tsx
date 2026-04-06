"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { QuestionReviewCard } from "@/components/report/question-review-card";
import { ReportInsightList } from "@/components/report/report-insight-list";
import { ReportStatCard } from "@/components/report/report-stat-card";
import { SurfaceCard } from "@/components/shared/surface-card";
import {
  loadInterviewSession,
  totalInterviewQuestions,
  type InterviewHistoryEntry,
  type InterviewSessionData,
} from "@/lib/interview-session";

function averageScore(session: InterviewSessionData) {
  if (session.history.length === 0) {
    return 0;
  }

  const total = session.history.reduce((sum, item) => sum + item.score, 0);
  return total / session.history.length;
}

function pickTopThemes(
  items: string[],
  limit: number,
): string[] {
  const counts = new Map<string, number>();

  for (const item of items) {
    const normalized = item.trim();

    if (!normalized) {
      continue;
    }

    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([item]) => item);
}

function buildFinalSummary(session: InterviewSessionData, average: number) {
  const latestEntry = session.history[session.history.length - 1];
  const strongestAreas = pickTopThemes(
    session.history.flatMap((item) => item.strengths),
    3,
  );
  const improvementAreas = pickTopThemes(
    session.history.flatMap((item) => item.improvements),
    3,
  );

  const scoreBand =
    average >= 8
      ? "strong"
      : average >= 6
        ? "promising"
        : "developing";

  return `This session showed ${scoreBand} overall interview performance for a ${session.setup.experienceLevel.toLowerCase()} ${session.setup.targetRole}. Your clearest advantages were ${strongestAreas.length > 0 ? strongestAreas.join(", ") : "your ability to stay engaged with the prompts"}. The biggest gains will come from improving ${improvementAreas.length > 0 ? improvementAreas.join(", ") : "the consistency of your answer structure"}. ${latestEntry ? `Your final evaluated response especially highlighted this pattern: ${latestEntry.conciseFeedback}` : ""}`.trim();
}

export function ReportClient() {
  const [session, setSession] = useState<InterviewSessionData | null>(null);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setSession(loadInterviewSession());
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const reportSummary = useMemo(() => {
    if (!session) {
      return null;
    }

    const average = averageScore(session);
    const strongestAreas = pickTopThemes(
      session.history.flatMap((item) => item.strengths),
      4,
    );
    const biggestImprovementAreas = pickTopThemes(
      session.history.flatMap((item) => item.improvements),
      4,
    );
    const highestScoringQuestion = session.history.reduce<InterviewHistoryEntry | null>(
      (best, item) => {
        if (!best || item.score > best.score) {
          return item;
        }

        return best;
      },
      null,
    );

    return {
      averageScore: average.toFixed(1),
      strongestAreas,
      biggestImprovementAreas,
      highestScoringQuestion,
      finalSummary: buildFinalSummary(session, average),
    };
  }, [session]);

  if (!session || session.history.length === 0) {
    return (
      <section className="mt-16 rounded-[2.25rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(241,245,249,0.88))] p-8 shadow-[0_28px_90px_rgba(15,23,42,0.08)]">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              No report available
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              Complete a full interview session to unlock your coaching report
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Your final report appears after the interview flow saves a
              completed session. Once available, it will summarize your average
              score, strongest areas, biggest improvement areas, and each
              question breakdown.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Next step
            </p>
            <Link
              href="/setup"
              className="mt-5 inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Start a new interview
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-12 space-y-6 sm:mt-14">
      <section className="rounded-[2.25rem] border border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(239,246,255,0.88))] p-8 shadow-[0_28px_90px_rgba(15,23,42,0.08)]">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
              Final summary
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
              A polished view of your interview performance
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-700">
              {reportSummary?.finalSummary}
            </p>
          </div>

          <div className="rounded-[2rem] bg-slate-950 px-6 py-7 text-white shadow-[0_22px_70px_rgba(15,23,42,0.22)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
              Overall average
            </p>
            <p className="mt-3 text-5xl font-semibold tracking-tight">
              {reportSummary?.averageScore}
              <span className="text-2xl text-slate-300">/10</span>
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              Calculated across all completed question scores in this session.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <ReportStatCard
          label="Answered questions"
          value={`${session.history.length}/${totalInterviewQuestions}`}
          detail="The report reflects every scored question stored in this completed session."
        />
        <ReportStatCard
          label="Interview focus"
          value={session.setup.interviewType}
          detail={`${session.setup.experienceLevel} ${session.setup.targetRole}`}
          accent="success"
        />
        <ReportStatCard
          label="Best question"
          value={
            reportSummary?.highestScoringQuestion
              ? `Q${reportSummary.highestScoringQuestion.questionNumber}`
              : "N/A"
          }
          detail={
            reportSummary?.highestScoringQuestion
              ? `${reportSummary.highestScoringQuestion.score}/10 on your strongest evaluated answer`
              : "No scored question available."
          }
          accent="warning"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ReportInsightList
          title="Strongest areas"
          items={reportSummary?.strongestAreas ?? []}
          tone="strength"
          emptyLabel="Complete more evaluated answers to surface recurring strengths."
        />
        <ReportInsightList
          title="Biggest improvement areas"
          items={reportSummary?.biggestImprovementAreas ?? []}
          tone="improvement"
          emptyLabel="Complete more evaluated answers to surface recurring improvement themes."
        />
      </div>

      <SurfaceCard title="Per-question breakdown">
        <div className="space-y-5">
          {session.history.map((item) => (
            <QuestionReviewCard
              key={`${item.questionNumber}-${item.question}`}
              item={item}
            />
          ))}
        </div>
      </SurfaceCard>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <SurfaceCard title="Final summary section">
          <p className="text-base leading-8 text-slate-700">
            {reportSummary?.finalSummary}
          </p>
        </SurfaceCard>

        <SurfaceCard title="Session completion">
          <p className="text-lg font-semibold text-slate-950">
            {session.completedAt
              ? new Date(session.completedAt).toLocaleString()
              : "Session in progress"}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            This report is generated from the locally stored session history for
            the MVP, including scores, strengths, improvements, and concise
            feedback for each answered question.
          </p>
        </SurfaceCard>
      </section>
    </section>
  );
}
