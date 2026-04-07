import { InterviewSetupForm } from "@/components/setup/interview-setup-form";
import { PageHero } from "@/components/shared/page-hero";
import { SurfaceCard } from "@/components/shared/surface-card";

const setupTips = [
  "Behavioral sessions for storytelling and communication practice",
  "Technical or system design sessions for deeper problem solving",
  "Resume-based prompts tailored to your target role and background",
  "Written or spoken response modes depending on how you want to practice",
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
                Choose the interview format, target role, and response mode.
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-sky-100 bg-white/82 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                Tailor
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Add experience level, optional job context, or a resume PDF.
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
              Resume uploads are parsed server-side, then only the extracted
              resume text needed for question tailoring is stored in the local
              interview setup state.
            </p>
          </SurfaceCard>
        </div>
      </section>
    </div>
  );
}
