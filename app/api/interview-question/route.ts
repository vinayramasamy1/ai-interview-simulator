import { NextResponse } from "next/server";
import {
  generateInterviewQuestion,
  type InterviewQuestionInput,
} from "@/lib/server/gemini";

type RequestBody = Partial<InterviewQuestionInput> & {
  responseMode?: string;
};

function getFallbackInterviewQuestion(interviewType?: string) {
  switch (interviewType) {
    case "Resume-Based":
      return "Tell me about a project or experience on your resume that best prepared you for this role.";
    case "Behavioral":
      return "Tell me about a time you solved a difficult problem.";
    case "Technical":
      return "Tell me about a technical challenge you worked through.";
    case "System Design":
      return "Walk me through how you would design a scalable system for a common product.";
    default:
      return "Tell me about a project you worked on and a challenge you faced.";
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeRequestBody(body: RequestBody): InterviewQuestionInput | null {
  const {
    interviewType,
    targetRole,
    experienceLevel,
    jobDescription,
    resumeText,
    previousQuestion,
    previousAnswer,
    previousScore,
    priorQuestions,
  } = body;

  if (
    !isNonEmptyString(interviewType) ||
    !isNonEmptyString(targetRole) ||
    !isNonEmptyString(experienceLevel)
  ) {
    return null;
  }

  const normalizedJobDescription =
    typeof jobDescription === "string"
      ? jobDescription.trim().slice(0, 1000)
      : undefined;
  const normalizedResumeText =
    typeof resumeText === "string"
      ? resumeText.trim().slice(0, 2000)
      : undefined;
  const normalizedPreviousQuestion =
    typeof previousQuestion === "string" ? previousQuestion.trim() : undefined;
  const normalizedPreviousAnswer =
    typeof previousAnswer === "string" ? previousAnswer.trim() : undefined;
  const normalizedPreviousScore =
    typeof previousScore === "number" && Number.isFinite(previousScore)
      ? previousScore
      : undefined;
  const normalizedPriorQuestions = Array.isArray(priorQuestions)
    ? priorQuestions
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
        .slice(-3)
    : undefined;

  if (
    interviewType.trim() === "Resume-Based" &&
    !normalizedResumeText
  ) {
    return null;
  }

  return {
    interviewType: interviewType.trim(),
    targetRole: targetRole.trim(),
    experienceLevel: experienceLevel.trim(),
    jobDescription: normalizedJobDescription,
    resumeText: normalizedResumeText,
    previousQuestion: normalizedPreviousQuestion,
    previousAnswer: normalizedPreviousAnswer,
    previousScore: normalizedPreviousScore,
    priorQuestions: normalizedPriorQuestions,
  };
}

export async function POST(request: Request) {
  let body: RequestBody;

  try {
    body = (await request.json()) as RequestBody;
  } catch (error) {
    console.error("Interview question route received invalid JSON.", {
      error,
    });

    return NextResponse.json({
      question: getFallbackInterviewQuestion(),
    });
  }

  const normalizedBody = normalizeRequestBody(body);
  const fallbackQuestion = getFallbackInterviewQuestion(
    typeof body.interviewType === "string" ? body.interviewType.trim() : undefined,
  );

  if (!normalizedBody) {
    console.warn("Interview question route received invalid setup payload.", {
      body,
    });

    return NextResponse.json(
      {
        error:
          body.interviewType === "Resume-Based"
            ? "Resume-Based interviews require parsed resume text."
            : "Missing required fields.",
      },
      { status: 400 },
    );
  }

  console.info("Interview question route normalized request.", {
    interviewType: normalizedBody.interviewType,
    targetRole: normalizedBody.targetRole,
    experienceLevel: normalizedBody.experienceLevel,
    responseMode:
      typeof body.responseMode === "string" ? body.responseMode.trim() : undefined,
    hasResumeText: Boolean(normalizedBody.resumeText),
    resumeTextLength: normalizedBody.resumeText?.length ?? 0,
    jobDescriptionLength: normalizedBody.jobDescription?.length ?? 0,
    priorQuestionsCount: normalizedBody.priorQuestions?.length ?? 0,
  });

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Missing GEMINI_API_KEY environment variable.");
    }

    const question = await generateInterviewQuestion(normalizedBody);

    return NextResponse.json({
      question: question || fallbackQuestion,
    });
  } catch (error) {
    console.error("Interview question generation failed.", {
      error,
      fallbackQuestion,
      requestSummary: {
        interviewType: normalizedBody.interviewType,
        targetRole: normalizedBody.targetRole,
        experienceLevel: normalizedBody.experienceLevel,
        hasResumeText: Boolean(normalizedBody.resumeText),
        resumeTextLength: normalizedBody.resumeText?.length ?? 0,
        jobDescriptionLength: normalizedBody.jobDescription?.length ?? 0,
        priorQuestionsCount: normalizedBody.priorQuestions?.length ?? 0,
      },
    });

    return NextResponse.json(
      { question: fallbackQuestion },
    );
  }
}
