import { NextResponse } from "next/server";
import {
  evaluateInterviewAnswer,
  type AnswerEvaluationInput,
} from "@/lib/server/gemini";

type RequestBody = Partial<AnswerEvaluationInput>;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateRequestBody(body: RequestBody) {
  const {
    currentQuestion,
    userAnswer,
    interviewType,
    targetRole,
    experienceLevel,
  } = body;

  if (!isNonEmptyString(currentQuestion)) {
    return "currentQuestion is required.";
  }

  if (!isNonEmptyString(userAnswer)) {
    return "userAnswer is required.";
  }

  if (!isNonEmptyString(interviewType)) {
    return "interviewType is required.";
  }

  if (!isNonEmptyString(targetRole)) {
    return "targetRole is required.";
  }

  if (!isNonEmptyString(experienceLevel)) {
    return "experienceLevel is required.";
  }

  return null;
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

  const validationError = validateRequestBody(body);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const evaluation = await evaluateInterviewAnswer({
      currentQuestion: body.currentQuestion.trim(),
      userAnswer: body.userAnswer.trim(),
      interviewType: body.interviewType.trim(),
      targetRole: body.targetRole.trim(),
      experienceLevel: body.experienceLevel.trim(),
    });

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
