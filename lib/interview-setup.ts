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

export type InterviewType = (typeof interviewTypes)[number];
export type ExperienceLevel = (typeof experienceLevels)[number];

export type InterviewSetupData = {
  interviewType: InterviewType;
  targetRole: string;
  experienceLevel: ExperienceLevel;
  jobDescription: string;
};

export const interviewSetupStorageKey = "ai-interview-simulator.setup";

export function saveInterviewSetup(data: InterviewSetupData) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(interviewSetupStorageKey, JSON.stringify(data));
}

export function loadInterviewSetup() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(interviewSetupStorageKey);

  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<InterviewSetupData>;

    if (
      typeof parsedValue.interviewType !== "string" ||
      typeof parsedValue.targetRole !== "string" ||
      typeof parsedValue.experienceLevel !== "string" ||
      typeof parsedValue.jobDescription !== "string"
    ) {
      return null;
    }

    return {
      interviewType: parsedValue.interviewType as InterviewType,
      targetRole: parsedValue.targetRole,
      experienceLevel: parsedValue.experienceLevel as ExperienceLevel,
      jobDescription: parsedValue.jobDescription,
    } satisfies InterviewSetupData;
  } catch {
    return null;
  }
}
