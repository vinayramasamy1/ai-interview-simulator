import { NextResponse } from "next/server";
import {
  generateInterviewQuestion,
  type InterviewQuestionInput,
} from "@/lib/server/gemini";

type RequestBody = Partial<InterviewQuestionInput>;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateRequestBody(body: RequestBody) {
  const { interviewType, targetRole, experienceLevel, jobDescription } = body;

  if (!isNonEmptyString(interviewType)) {
    return "interviewType is required.";
  }

  if (!isNonEmptyString(targetRole)) {
    return "targetRole is required.";
  }

  if (!isNonEmptyString(experienceLevel)) {
    return "experienceLevel is required.";
  }

  if (
    jobDescription !== undefined &&
    jobDescription !== null &&
    typeof jobDescription !== "string"
  ) {
    return "jobDescription must be a string when provided.";
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
    const question = await generateInterviewQuestion({
      interviewType: body.interviewType.trim(),
      targetRole: body.targetRole.trim(),
      experienceLevel: body.experienceLevel.trim(),
      jobDescription: body.jobDescription?.trim(),
    });

    return NextResponse.json({ question });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate question.";

    if (message.includes("GEMINI_API_KEY")) {
      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Failed to generate interview question." },
      { status: 502 },
    );
  }
}
