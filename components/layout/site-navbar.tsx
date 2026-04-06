import Link from "next/link";
import { navigationLinks, siteName } from "@/lib/site";

export function SiteNavbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/72 backdrop-blur-2xl">
      <div className="page-frame flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 self-start text-base font-semibold tracking-tight text-slate-950"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a,#2563eb)] text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.28)]">
            AI
          </span>
          <span className="flex flex-col">
            <span>{siteName}</span>
            <span className="text-xs font-medium tracking-[0.18em] text-slate-400 uppercase">
              Interview Coaching
            </span>
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="w-full sm:w-auto">
          <ul className="flex flex-wrap items-center gap-2 sm:justify-end">
            {navigationLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-10 items-center rounded-full border border-transparent bg-white/40 px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:text-slate-950"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
