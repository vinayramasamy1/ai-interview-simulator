export const interviewTypes = [
  "Behavioral",
  "Technical",
  "Resume-Based",
  "System Design",
] as const;

export const experienceLevels = [
  "Intern",
  "New Grad",
  "Mid-Level",
  "Senior",
] as const;

export const responseModes = ["Written", "Spoken"] as const;

export type InterviewType = (typeof interviewTypes)[number];
export type ExperienceLevel = (typeof experienceLevels)[number];
export type ResponseMode = (typeof responseModes)[number];

type InterviewSetupBase = {
  targetRole: string;
  experienceLevel: ExperienceLevel;
  responseMode: ResponseMode;
  jobDescription: string;
};

export type ResumeBasedInterviewSetupData = InterviewSetupBase & {
  interviewType: "Resume-Based";
  resumeFileName: string;
  resumeText: string;
};

export type StandardInterviewSetupData = InterviewSetupBase & {
  interviewType: Exclude<InterviewType, "Resume-Based">;
  resumeFileName?: undefined;
  resumeText?: undefined;
};

export type InterviewSetupData =
  | ResumeBasedInterviewSetupData
  | StandardInterviewSetupData;

export function isResumeBasedInterviewSetup(
  value: InterviewSetupData | null | undefined,
): value is ResumeBasedInterviewSetupData {
  return Boolean(value && value.interviewType === "Resume-Based");
}

type InterviewSetupDataCandidate = {
  interviewType?: unknown;
  targetRole?: unknown;
  experienceLevel?: unknown;
  responseMode?: unknown;
  jobDescription?: unknown;
  resumeFileName?: string;
  resumeText?: string;
};

export type InterviewSetupStatus = "idle" | "ready" | "active" | "completed";

export type InterviewSetupState = {
  setup: InterviewSetupData | null;
  status: InterviewSetupStatus;
  updatedAt?: string;
};

export const interviewSetupStorageKey = "ai-interview-simulator.setup";

export function isInterviewSetupData(value: unknown): value is InterviewSetupData {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<InterviewSetupDataCandidate>;

  if (
    typeof candidate.interviewType !== "string" ||
    !interviewTypes.includes(candidate.interviewType as InterviewType) ||
    typeof candidate.targetRole !== "string" ||
    candidate.targetRole.trim().length === 0 ||
    typeof candidate.experienceLevel !== "string" ||
    !experienceLevels.includes(candidate.experienceLevel as ExperienceLevel) ||
    typeof candidate.responseMode !== "string" ||
    !responseModes.includes(candidate.responseMode as ResponseMode) ||
    typeof candidate.jobDescription !== "string"
  ) {
    return false;
  }

  if (candidate.interviewType === "Resume-Based") {
    return (
      typeof candidate.resumeFileName === "string" &&
      candidate.resumeFileName.trim().length > 0 &&
      typeof candidate.resumeText === "string" &&
      candidate.resumeText.trim().length > 0
    );
  }

  return (
    candidate.resumeFileName === undefined &&
    candidate.resumeText === undefined
  );
}

export function areInterviewSetupsEqual(
  left: InterviewSetupData | null,
  right: InterviewSetupData | null,
) {
  if (!left || !right) {
    return false;
  }

  return (
    left.interviewType === right.interviewType &&
    left.targetRole === right.targetRole &&
    left.experienceLevel === right.experienceLevel &&
    left.responseMode === right.responseMode &&
    left.jobDescription === right.jobDescription &&
    left.resumeFileName === right.resumeFileName &&
    left.resumeText === right.resumeText
  );
}

export function saveInterviewSetupState(state: InterviewSetupState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(interviewSetupStorageKey, JSON.stringify(state));
}

export function saveInterviewSetup(
  data: InterviewSetupData,
  status: InterviewSetupStatus = "ready",
) {
  saveInterviewSetupState({
    setup: data,
    status,
    updatedAt: new Date().toISOString(),
  });
}

export function clearInterviewSetup() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(interviewSetupStorageKey);
}

export function loadInterviewSetupState(): InterviewSetupState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(interviewSetupStorageKey);

  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<InterviewSetupState>;

    if (!parsedValue || typeof parsedValue !== "object") {
      return null;
    }

    return {
      setup: isInterviewSetupData(parsedValue.setup) ? parsedValue.setup : null,
      status:
        parsedValue.status === "ready" ||
        parsedValue.status === "active" ||
        parsedValue.status === "completed" ||
        parsedValue.status === "idle"
          ? parsedValue.status
          : "idle",
      updatedAt:
        typeof parsedValue.updatedAt === "string"
          ? parsedValue.updatedAt
          : undefined,
    } satisfies InterviewSetupState;
  } catch {
    return null;
  }
}

export function loadInterviewSetup() {
  const state = loadInterviewSetupState();

  if (!state?.setup) {
    return null;
  }

  return state.setup;
}
