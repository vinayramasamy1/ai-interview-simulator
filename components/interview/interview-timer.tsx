"use client";

import { useEffect, useState } from "react";

function formatElapsedTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

export function InterviewTimer() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="ui-card rounded-[1.75rem] px-5 py-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Timer
      </p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
        {formatElapsedTime(elapsedSeconds)}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Frontend-only timer for pacing your live answer.
      </p>
    </div>
  );
}
