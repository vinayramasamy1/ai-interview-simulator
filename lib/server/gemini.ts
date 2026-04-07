import "server-only";

import { GoogleGenAI } from "@google/genai";

export type InterviewQuestionInput = {
  interviewType: string;
  targetRole: string;
  experienceLevel: string;
  jobDescription?: string;
  resumeText?: string;
};

export type AnswerEvaluationInput = {
  currentQuestion: string;
  userAnswer: string;
  interviewType: string;
  targetRole: string;
  experienceLevel: string;
};

export type AnswerEvaluation = {
  score: number;
  strengths: string[];
  improvements: string[];
  conciseFeedback: string;
  followUpQuestion: string;
};

const geminiApiKey = process.env.GEMINI_API_KEY;

function getGeminiClient() {
  if (!geminiApiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable.");
  }

  return new GoogleGenAI({ apiKey: geminiApiKey });
}

function buildInterviewPrompt({
  interviewType,
  targetRole,
  experienceLevel,
  jobDescription,
  resumeText,
}: InterviewQuestionInput) {
  const trimmedJobDescription = jobDescription?.trim();
  const trimmedResumeText = resumeText?.trim();
  const hasResumeContext =
    interviewType === "Resume-Based" &&
    Boolean(trimmedResumeText && trimmedResumeText.length > 0);

  return `
You are an expert interviewer creating a single realistic mock interview question.

Interview details:
- Interview type: ${interviewType}
- Target role: ${targetRole}
- Experience level: ${experienceLevel}
- Job description: ${
    trimmedJobDescription && trimmedJobDescription.length > 0
      ? trimmedJobDescription
      : "Not provided"
  }
- Resume context: ${
    hasResumeContext ? trimmedResumeText : "Not provided"
  }

Instructions:
- Write exactly one interview question.
- Make it feel tailored to the target role and experience level.
- Match the tone and style of the selected interview type.
- If the interview type is Resume-Based, ground the question in specific projects, skills, responsibilities, or experience from the resume context when relevant.
- For Resume-Based interviews, sound like a professional interviewer who has reviewed the candidate's resume and wants to dig deeper into real past work.
- Keep it concise, natural, and professional.
- Do not include bullet points, explanations, labels, or multiple questions.
- Return only the question text.
`.trim();
}

function normalizeQuestion(rawText: string) {
  return rawText.replace(/\s+/g, " ").trim();
}

function buildAnswerEvaluationPrompt({
  currentQuestion,
  userAnswer,
  interviewType,
  targetRole,
  experienceLevel,
}: AnswerEvaluationInput) {
  return `
You are an experienced interview coach evaluating a candidate's interview response.

Interview context:
- Interview type: ${interviewType}
- Target role: ${targetRole}
- Experience level: ${experienceLevel}

Question:
${currentQuestion}

Candidate answer:
${userAnswer}

Evaluation instructions:
- Score the answer from 1 to 10.
- Identify 2 to 4 concrete strengths grounded in the actual answer.
- Identify 2 to 4 concrete improvements grounded in what is missing, vague, weak, or underdeveloped.
- Write conciseFeedback as a short paragraph that references specifics from the answer.
- Write one realistic follow-up question that an interviewer would naturally ask next.
- Avoid generic advice unless it clearly applies to the actual response.
- Do not praise or criticize without evidence from the candidate's answer.
- Return only valid JSON matching the requested schema.
`.trim();
}

function parseJsonResponse<T>(rawText: string) {
  try {
    return JSON.parse(rawText) as T;
  } catch {
    throw new Error("Gemini returned malformed JSON.");
  }
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function normalizeStringArray(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean);
}

function validateAnswerEvaluation(
  value: unknown,
): asserts value is AnswerEvaluation {
  if (!value || typeof value !== "object") {
    throw new Error("Gemini returned an invalid evaluation payload.");
  }

  const candidate = value as Partial<AnswerEvaluation>;

  if (typeof candidate.score !== "number" || !Number.isFinite(candidate.score)) {
    throw new Error("Gemini returned an invalid score.");
  }

  if (!isStringArray(candidate.strengths)) {
    throw new Error("Gemini returned invalid strengths.");
  }

  if (!isStringArray(candidate.improvements)) {
    throw new Error("Gemini returned invalid improvements.");
  }

  if (typeof candidate.conciseFeedback !== "string") {
    throw new Error("Gemini returned invalid concise feedback.");
  }

  if (typeof candidate.followUpQuestion !== "string") {
    throw new Error("Gemini returned an invalid follow-up question.");
  }
}

export async function generateInterviewQuestion(
  input: InterviewQuestionInput,
) {
  const client = getGeminiClient();
  const prompt = buildInterviewPrompt(input);

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const question = normalizeQuestion(response.text ?? "");

  if (!question) {
    throw new Error("Gemini returned an empty question.");
  }

  return question;
}

export async function evaluateInterviewAnswer(
  input: AnswerEvaluationInput,
): Promise<AnswerEvaluation> {
  const client = getGeminiClient();
  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: buildAnswerEvaluationPrompt(input),
    config: {
      temperature: 0.3,
      responseMimeType: "application/json",
      responseJsonSchema: {
        type: "object",
        additionalProperties: false,
        required: [
          "score",
          "strengths",
          "improvements",
          "conciseFeedback",
          "followUpQuestion",
        ],
        properties: {
          score: {
            type: "integer",
            minimum: 1,
            maximum: 10,
          },
          strengths: {
            type: "array",
            minItems: 1,
            maxItems: 4,
            items: {
              type: "string",
            },
          },
          improvements: {
            type: "array",
            minItems: 1,
            maxItems: 4,
            items: {
              type: "string",
            },
          },
          conciseFeedback: {
            type: "string",
          },
          followUpQuestion: {
            type: "string",
          },
        },
      },
    },
  });

  const parsed = parseJsonResponse<AnswerEvaluation>(response.text ?? "");
  validateAnswerEvaluation(parsed);

  return {
    score: Math.max(1, Math.min(10, Math.round(parsed.score))),
    strengths: normalizeStringArray(parsed.strengths),
    improvements: normalizeStringArray(parsed.improvements),
    conciseFeedback: parsed.conciseFeedback.trim(),
    followUpQuestion: parsed.followUpQuestion.trim(),
  };
}
