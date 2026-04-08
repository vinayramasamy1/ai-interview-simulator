import "server-only";

import { GoogleGenAI } from "@google/genai";

export type InterviewQuestionInput = {
  interviewType: string;
  targetRole: string;
  experienceLevel: string;
  jobDescription?: string;
  resumeText?: string;
  previousQuestion?: string;
  previousAnswer?: string;
  previousScore?: number;
  priorQuestions?: string[];
};

export type AnswerEvaluationInput = {
  currentQuestion: string;
  userAnswer: string;
  interviewType: string;
  targetRole: string;
  experienceLevel: string;
  jobDescription?: string;
  resumeText?: string;
  priorQuestions?: string[];
};

type AnswerEvaluationBase = {
  score: number;
  strengths: string[];
  improvements: string[];
  conciseFeedback: string;
};

export type AnswerEvaluation = AnswerEvaluationBase & {
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
  previousQuestion,
  previousAnswer,
  previousScore,
  priorQuestions,
}: InterviewQuestionInput) {
  const trimmedJobDescription = jobDescription?.trim();
  const trimmedResumeText = resumeText?.trim();
  const trimmedPreviousQuestion = previousQuestion?.trim();
  const trimmedPreviousAnswer = previousAnswer?.trim();
  const sanitizedPriorQuestions = priorQuestions
    ?.map((question) => question.trim())
    .filter(Boolean);
  const hasResumeContext =
    interviewType === "Resume-Based" &&
    Boolean(trimmedResumeText && trimmedResumeText.length > 0);
  const condensedResumeContext = hasResumeContext
    ? trimmedResumeText!.slice(0, 4000)
    : undefined;
  const hasAdaptiveContext =
    typeof previousScore === "number" &&
    Number.isFinite(previousScore) &&
    Boolean(trimmedPreviousQuestion && trimmedPreviousAnswer);

  const adaptiveDifficultyGuidance = hasAdaptiveContext
    ? previousScore <= 4
      ? "The candidate struggled on the previous answer. Make the next question simpler, more guided, and narrower in scope so it helps them recover while still testing the same general competency."
      : previousScore >= 8
        ? "The candidate handled the previous answer well. Make the next question meaningfully deeper by probing specifics, tradeoffs, constraints, edge cases, or technical judgment."
        : "The candidate showed partial strength on the previous answer. Make the next question moderately harder and use it to probe the areas that still need clearer evidence."
    : "Start with a realistic opening question that fits the selected interview style.";

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
    hasResumeContext ? condensedResumeContext : "Not provided"
  }
- Previous question: ${
    trimmedPreviousQuestion && trimmedPreviousQuestion.length > 0
      ? trimmedPreviousQuestion
      : "Not provided"
  }
- Previous answer: ${
    trimmedPreviousAnswer && trimmedPreviousAnswer.length > 0
      ? trimmedPreviousAnswer
      : "Not provided"
  }
- Previous score: ${
    hasAdaptiveContext ? previousScore : "Not provided"
  }
- Earlier questions in this session: ${
    sanitizedPriorQuestions && sanitizedPriorQuestions.length > 0
      ? sanitizedPriorQuestions.join(" | ")
      : "Not provided"
  }

Instructions:
- Write exactly one interview question.
- Make it feel tailored to the target role and experience level.
- Match the tone and style of the selected interview type.
- If the interview type is Resume-Based, ground the question in specific projects, skills, responsibilities, or experience from the resume context when relevant.
- For Resume-Based interviews, sound like a professional interviewer who has reviewed the candidate's resume and wants to dig deeper into real past work.
- For Resume-Based interviews, prefer concrete references to the candidate's background over generic role-based prompts.
- ${adaptiveDifficultyGuidance}
- If previous answer context is provided, reference the candidate's earlier answer naturally and challenge vague or incomplete claims.
- Ask for evidence, tradeoffs, concrete examples, or implementation details when the previous score suggests the candidate can handle more depth.
- Do not repeat or paraphrase a question that has already been asked in this session.
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
  jobDescription,
  resumeText,
}: AnswerEvaluationInput) {
  const trimmedJobDescription = jobDescription?.trim();
  const trimmedResumeText = resumeText?.trim();

  return `
You are an experienced interview coach evaluating a candidate's interview response.

Interview context:
- Interview type: ${interviewType}
- Target role: ${targetRole}
- Experience level: ${experienceLevel}
- Job description: ${
    trimmedJobDescription && trimmedJobDescription.length > 0
      ? trimmedJobDescription
      : "Not provided"
  }
- Resume context: ${
    trimmedResumeText && trimmedResumeText.length > 0
      ? trimmedResumeText
      : "Not provided"
  }

Question:
${currentQuestion}

Candidate answer:
${userAnswer}

Evaluation instructions:
- Score the answer from 1 to 10.
- Identify 2 to 4 concrete strengths grounded in the actual answer.
- Identify 2 to 4 concrete improvements grounded in what is missing, vague, weak, or underdeveloped.
- Write conciseFeedback as a short coaching paragraph that names the exact missing evidence, examples, tradeoffs, metrics, or reasoning gaps in the answer.
- For every improvement point, say what stronger content would have sounded like in this exact context. Use concrete coaching such as what details, examples, metrics, architecture choices, or tradeoff explanations should be added.
- Avoid vague advice like "be more specific" or "improve clarity" unless you immediately explain what specific information was missing.
- If the answer is vague, identify the vague claim and explain the sharper follow-up evidence the candidate should have provided.
- Do not generate the next question in this step.
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
): asserts value is AnswerEvaluationBase {
  if (!value || typeof value !== "object") {
    throw new Error("Gemini returned an invalid evaluation payload.");
  }

  const candidate = value as Partial<AnswerEvaluationBase>;

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
        },
      },
    },
  });

  const parsed = parseJsonResponse<AnswerEvaluationBase>(response.text ?? "");
  validateAnswerEvaluation(parsed);

  const score = Math.max(1, Math.min(10, Math.round(parsed.score)));
  const followUpQuestion = await generateInterviewQuestion({
    interviewType: input.interviewType,
    targetRole: input.targetRole,
    experienceLevel: input.experienceLevel,
    jobDescription: input.jobDescription,
    resumeText: input.resumeText,
    previousQuestion: input.currentQuestion,
    previousAnswer: input.userAnswer,
    previousScore: score,
    priorQuestions: input.priorQuestions,
  });

  return {
    score,
    strengths: normalizeStringArray(parsed.strengths),
    improvements: normalizeStringArray(parsed.improvements),
    conciseFeedback: parsed.conciseFeedback.trim(),
    followUpQuestion,
  };
}
