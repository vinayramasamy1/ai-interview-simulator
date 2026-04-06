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
        badge="Interview setup"
        title="Prepare your next practice session"
        description="Choose the interview style, define your target role, and tailor the session before you begin."
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
