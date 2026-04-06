"use client";

import { useRouter } from "next/navigation";
import {
  clearInterviewSetup,
  saveInterviewSetupState,
} from "@/lib/interview-setup";
import { clearInterviewSession } from "@/lib/interview-session";

type StartNewSessionButtonProps = {
  className?: string;
  label?: string;
};

export function StartNewSessionButton({
  className = "btn-primary",
  label = "Start New Session",
}: StartNewSessionButtonProps) {
  const router = useRouter();

  function handleClick() {
    clearInterviewSession();
    clearInterviewSetup();
    saveInterviewSetupState({
      setup: null,
      status: "idle",
      updatedAt: new Date().toISOString(),
    });
    router.push("/setup");
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {label}
    </button>
  );
}
