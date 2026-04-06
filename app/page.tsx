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
    <div className="page-frame flex w-full flex-col py-14 sm:py-16 lg:py-20">
      <PageHero
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
      />

      <section className="ui-card rounded-[2.25rem] px-6 py-6 sm:px-8">
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

      <section
        id="features"
        className="mt-20 grid gap-6 md:grid-cols-3"
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
