import type { ReactNode } from "react";
import { SiteNavbar } from "@/components/layout/site-navbar";

type SiteShellProps = {
  children: ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="app-shell flex min-h-screen flex-col">
      <SiteNavbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
