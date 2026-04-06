import { ReportClient } from "@/components/report/report-client";
import { StartNewSessionButton } from "@/components/shared/start-new-session-button";
import { PageHero } from "@/components/shared/page-hero";

export default function ReportPage() {
  return (
    <div className="page-frame flex w-full flex-col py-14 sm:py-16 lg:py-20">
      <PageHero
        variant="report"
        align="left"
        badge="Final report"
        title="Review your interview performance"
        description="Review the full session summary, revisit each response, and see where your interview performance was strongest."
        actions={
          <StartNewSessionButton className="btn-primary" label="Practice Again" />
        }
        supportPanel={
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.75rem] border border-indigo-100 bg-white/84 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">
                Analytics
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Review average score and highest-performing moments.
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-indigo-100 bg-white/84 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">
                Patterns
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                See recurring strengths and biggest improvement areas.
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-indigo-100 bg-white/84 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">
                Replay
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Inspect each answer with its coaching summary and score.
              </p>
            </div>
          </div>
        }
      />

      <ReportClient />
    </div>
  );
}
