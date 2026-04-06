import type { InterviewSetupData } from "@/lib/interview-setup";
import { isInterviewSetupData } from "@/lib/interview-setup";

export const totalInterviewQuestions = 5;
export const interviewSessionStorageKey = "ai-interview-simulator.session";

export type InterviewEvaluation = {
  score: number;
  strengths: string[];
  improvements: string[];
  conciseFeedback: string;
  followUpQuestion: string;
};

export type InterviewHistoryEntry = {
  questionNumber: number;
  question: string;
  userAnswer: string;
  score: number;
  strengths: string[];
  improvements: string[];
  conciseFeedback: string;
  followUpQuestion: string;
};

export type InterviewSessionData = {
  setup: InterviewSetupData;
  status: "active" | "completed";
  currentQuestionNumber: number;
  totalQuestions: number;
  currentQuestion: string | null;
  history: InterviewHistoryEntry[];
  completedAt?: string;
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function createHistoryEntry(params: {
  questionNumber: number;
  question: string;
  userAnswer: string;
  evaluation: InterviewEvaluation;
}): InterviewHistoryEntry {
  return {
    questionNumber: params.questionNumber,
    question: params.question,
    userAnswer: params.userAnswer,
    score: params.evaluation.score,
    strengths: params.evaluation.strengths,
    improvements: params.evaluation.improvements,
    conciseFeedback: params.evaluation.conciseFeedback,
    followUpQuestion: params.evaluation.followUpQuestion,
  };
}

export function saveInterviewSession(data: InterviewSessionData) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(interviewSessionStorageKey, JSON.stringify(data));
}

export function clearInterviewSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(interviewSessionStorageKey);
}

export function loadInterviewSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(interviewSessionStorageKey);

  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<InterviewSessionData>;

    if (
      !parsedValue ||
      typeof parsedValue !== "object" ||
      !isInterviewSetupData(parsedValue.setup) ||
      (parsedValue.status !== "active" && parsedValue.status !== "completed") ||
      typeof parsedValue.currentQuestionNumber !== "number" ||
      typeof parsedValue.totalQuestions !== "number" ||
      !Array.isArray(parsedValue.history)
    ) {
      return null;
    }

    const history = parsedValue.history.filter((item): item is InterviewHistoryEntry => {
      if (!item || typeof item !== "object") {
        return false;
      }

      const entry = item as Partial<InterviewHistoryEntry>;

      return (
        typeof entry.questionNumber === "number" &&
        typeof entry.question === "string" &&
        typeof entry.userAnswer === "string" &&
        typeof entry.score === "number" &&
        isStringArray(entry.strengths) &&
        isStringArray(entry.improvements) &&
        typeof entry.conciseFeedback === "string" &&
        typeof entry.followUpQuestion === "string"
      );
    });

    return {
      setup: parsedValue.setup,
      status: parsedValue.status,
      currentQuestionNumber: parsedValue.currentQuestionNumber,
      totalQuestions: parsedValue.totalQuestions,
      currentQuestion:
        typeof parsedValue.currentQuestion === "string"
          ? parsedValue.currentQuestion
          : null,
      history,
      completedAt:
        typeof parsedValue.completedAt === "string"
          ? parsedValue.completedAt
          : undefined,
    } satisfies InterviewSessionData;
  } catch {
    return null;
  }
}
