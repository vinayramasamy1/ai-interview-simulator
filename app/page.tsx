import Link from "next/link";
import { FeatureCard } from "@/components/home/feature-card";
import { PageHero } from "@/components/shared/page-hero";

const features = [
  {
    title: "Adaptive Questions",
    description:
      "Practice with interview prompts that evolve based on your answers and experience level.",
  },
  {
    title: "Instant Feedback",
    description:
      "Get clear AI feedback on clarity, structure, confidence, and technical depth right away.",
  },
  {
    title: "Final Performance Report",
    description:
      "Finish each session with a concise summary of strengths, weak spots, and next steps.",
  },
];

export default function Home() {
  return (
    <div className="page-frame flex w-full flex-col pt-14 pb-14 sm:pt-16 sm:pb-16 lg:pt-20 lg:pb-20">
      <PageHero
        variant="home"
        badge="Practice smarter with AI-guided mock interviews"
        title="AI Interview Simulator"
        description="Practice behavioral and technical interviews with AI-generated questions, real-time coaching, and actionable feedback after every session."
        actions={
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/setup"
              className="btn-primary"
            >
              Start Practicing
            </Link>
            <Link
              href="#features"
              className="btn-secondary"
            >
              Explore Features
            </Link>
          </div>
        }
        supportPanel={
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[1.8rem] border border-white/70 bg-white/85 p-5 text-left shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Why it stands out
              </p>
              <p className="mt-3 text-base leading-7 text-slate-700">
                A focused mock interview experience designed to feel like a
                modern AI productivity tool, not a generic chatbot.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[1.8rem] border border-white/70 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                <p className="text-3xl font-semibold tracking-tight text-slate-950">
                  5
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  guided questions per session
                </p>
              </div>
              <div className="rounded-[1.8rem] border border-white/70 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                <p className="text-3xl font-semibold tracking-tight text-slate-950">
                  1 report
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  with coaching-ready takeaways
                </p>
              </div>
            </div>
          </div>
        }
      />

      <section className="mt-8 border-t border-white/65 px-2 pt-8 sm:mt-10 sm:px-4 sm:pt-10 lg:mt-12">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Built for modern prep
            </p>
            <p className="mt-3 text-base leading-7 text-slate-600">
              A focused AI interview workspace with realistic prompts, coaching,
              and session reporting.
            </p>
          </div>
          <div>
            <p className="text-3xl font-semibold tracking-tight text-slate-950">
              5-question session
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Structured interview flow designed for repeatable practice.
            </p>
          </div>
          <div>
            <p className="text-3xl font-semibold tracking-tight text-slate-950">
              Instant coaching
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Actionable strengths, improvement areas, and follow-up prompts.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-14 flex flex-col gap-3 text-center sm:mt-16">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
          Core features
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Everything you need for a strong practice loop
        </h2>
        <p className="mx-auto max-w-2xl text-base leading-7 text-slate-600">
          Start with targeted setup, practice in a focused session, then review
          strengths and improvement themes in one polished report.
        </p>
      </section>

      <section
        id="features"
        className="mt-10 grid gap-6 md:grid-cols-3"
        aria-label="Core features"
      >
        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </section>
    </div>
  );
}
