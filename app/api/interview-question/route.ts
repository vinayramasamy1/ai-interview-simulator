import { NextResponse } from "next/server";
import {
  generateInterviewQuestion,
  type InterviewQuestionInput,
} from "@/lib/server/gemini";

type RequestBody = Partial<InterviewQuestionInput>;

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
  } = body;

  if (
    !isNonEmptyString(interviewType) ||
    !isNonEmptyString(targetRole) ||
    !isNonEmptyString(experienceLevel)
  ) {
    return null;
  }

  const normalizedJobDescription =
    typeof jobDescription === "string" ? jobDescription.trim() : undefined;
  const normalizedResumeText =
    typeof resumeText === "string" ? resumeText.trim() : undefined;

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
    const question = await generateInterviewQuestion(normalizedBody);

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
