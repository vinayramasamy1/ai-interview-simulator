import Link from "next/link";
import { InterviewSessionClient } from "@/components/interview/interview-session-client";
import { PageHero } from "@/components/shared/page-hero";

export default function InterviewPage() {
  return (
    <div className="page-frame flex w-full flex-col py-14 sm:py-16 lg:py-20">
      <PageHero
        badge="Interview session"
        title="Run a focused mock interview"
        description="Your setup is loaded automatically and the first Gemini-powered interview question is generated as soon as the session begins."
        actions={
          <Link
            href="/report"
            className="btn-secondary"
          >
            View Final Report
          </Link>
        }
      />

      <InterviewSessionClient />
    </div>
  );
}
