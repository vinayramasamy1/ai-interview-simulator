import { NextResponse } from "next/server";
import {
  evaluateInterviewAnswer,
  type AnswerEvaluationInput,
} from "@/lib/server/gemini";

type RequestBody = Partial<AnswerEvaluationInput>;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeRequestBody(body: RequestBody): AnswerEvaluationInput | null {
  const {
    currentQuestion,
    userAnswer,
    interviewType,
    targetRole,
    experienceLevel,
    jobDescription,
    resumeText,
    priorQuestions,
  } = body;

  if (
    !isNonEmptyString(currentQuestion) ||
    !isNonEmptyString(userAnswer) ||
    !isNonEmptyString(interviewType) ||
    !isNonEmptyString(targetRole) ||
    !isNonEmptyString(experienceLevel)
  ) {
    return null;
  }

  return {
    currentQuestion: currentQuestion.trim(),
    userAnswer: userAnswer.trim(),
    interviewType: interviewType.trim(),
    targetRole: targetRole.trim(),
    experienceLevel: experienceLevel.trim(),
    jobDescription:
      typeof jobDescription === "string" ? jobDescription.trim() : undefined,
    resumeText:
      typeof resumeText === "string" ? resumeText.trim() : undefined,
    priorQuestions: Array.isArray(priorQuestions)
      ? priorQuestions
          .filter((value): value is string => typeof value === "string")
          .map((value) => value.trim())
          .filter(Boolean)
      : undefined,
  };
}

export async function POST(request: Request) {
  let body: RequestBody;

  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const normalizedBody = normalizeRequestBody(body);

  if (!normalizedBody) {
    return Response.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  try {
    const evaluation = await evaluateInterviewAnswer(normalizedBody);

    return NextResponse.json(evaluation);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to evaluate answer.";

    if (message.includes("GEMINI_API_KEY")) {
      return NextResponse.json({ error: message }, { status: 500 });
    }

    if (message.includes("malformed JSON") || message.includes("invalid")) {
      return NextResponse.json(
        { error: "Gemini returned malformed evaluation output." },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { error: "Failed to evaluate interview answer." },
      { status: 502 },
    );
  }
}
