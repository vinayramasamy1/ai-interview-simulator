import Link from "next/link";
import { InterviewSessionClient } from "@/components/interview/interview-session-client";
import { StartNewSessionButton } from "@/components/shared/start-new-session-button";
import { PageHero } from "@/components/shared/page-hero";

export default function InterviewPage() {
  return (
    <div className="page-frame flex w-full flex-col py-14 sm:py-16 lg:py-20">
      <PageHero
        variant="interview"
        align="left"
        badge="Interview session"
        title="Run a focused mock interview"
        description="Step into the interview workspace, review your session details, and begin a Gemini-powered mock interview once your setup is configured."
        actions={
          <>
            <Link
              href="/report"
              className="btn-secondary"
            >
              View Final Report
            </Link>
            <StartNewSessionButton className="btn-primary" label="Start New Session" />
          </>
        }
        supportPanel={
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white/84 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Focus mode
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                One prompt, one answer, one coaching loop at a time.
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200 bg-white/84 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Live pacing
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Track progress and timing without leaving the workspace.
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200 bg-white/84 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Coaching next
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Follow-up questions adapt from your evaluated responses.
              </p>
            </div>
          </div>
        }
      />

      <InterviewSessionClient />
    </div>
  );
}
