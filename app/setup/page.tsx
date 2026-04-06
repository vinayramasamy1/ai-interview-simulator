import { InterviewSetupForm } from "@/components/setup/interview-setup-form";
import { PageHero } from "@/components/shared/page-hero";
import { SurfaceCard } from "@/components/shared/surface-card";

const setupTips = [
  "Behavioral sessions for storytelling and communication practice",
  "Technical or system design sessions for deeper problem solving",
  "Resume-based prompts tailored to your target role and background",
];

export default function SetupPage() {
  return (
    <div className="page-frame flex w-full flex-col py-14 sm:py-16 lg:py-20">
      <PageHero
        variant="setup"
        align="left"
        badge="Interview setup"
        title="Prepare your next practice session"
        description="Choose the interview style, define your target role, and tailor the session before you begin."
        supportPanel={
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.75rem] border border-sky-100 bg-white/82 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                Plan
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Choose the interview format and target role.
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-sky-100 bg-white/82 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                Tailor
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Add experience level and optional job context.
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-sky-100 bg-white/82 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                Launch
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Move directly into a focused interview workspace.
              </p>
            </div>
          </div>
        }
      />

      <section className="mt-12 grid gap-6 lg:grid-cols-[1.4fr_0.9fr] lg:items-start">
        <InterviewSetupForm />

        <div className="space-y-6">
          <SurfaceCard title="What you can configure">
            <ul className="space-y-4 text-slate-600">
              {setupTips.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-sky-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </SurfaceCard>

          <SurfaceCard title="MVP note">
            <p className="helper-text">
              The form currently keeps all setup data in local component state.
              We are not connecting any API or persistence layer yet.
            </p>
          </SurfaceCard>
        </div>
      </section>
    </div>
  );
}
