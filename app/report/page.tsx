import Link from "next/link";
import { ReportClient } from "@/components/report/report-client";
import { PageHero } from "@/components/shared/page-hero";

export default function ReportPage() {
  return (
    <div className="page-frame flex w-full flex-col py-14 sm:py-16 lg:py-20">
      <PageHero
        badge="Final report"
        title="Review your interview performance"
        description="Review the full session summary, revisit each response, and see where your interview performance was strongest."
        actions={
          <Link
            href="/setup"
            className="btn-primary"
          >
            Practice Again
          </Link>
        }
      />

      <ReportClient />
    </div>
  );
}
