"use client";

import { type ChangeEvent, type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { SurfaceCard } from "@/components/shared/surface-card";
import {
  clearInterviewSetup,
  experienceLevels,
  interviewTypes,
  responseModes,
  saveInterviewSetupState,
  saveInterviewSetup,
  type ExperienceLevel,
  type InterviewSetupData,
  type InterviewType,
  type ResponseMode,
} from "@/lib/interview-setup";

type SetupFormData = {
  targetRole: string;
  jobDescription: string;
  resumeFileName: string;
  resumeText: string;
  interviewType: InterviewType | "";
  experienceLevel: ExperienceLevel | "";
  responseMode: ResponseMode | "";
};

type SetupFormErrors = Partial<Record<keyof SetupFormData, string>>;

type ResumeUploadApiSuccess = {
  success: true;
  fileName: string;
  resumeText: string;
};

type ResumeUploadApiError = {
  success: false;
  code?:
    | "INVALID_CONTENT_TYPE"
    | "MISSING_FILE"
    | "INVALID_FILE_TYPE"
    | "EMPTY_FILE"
    | "FILE_TOO_LARGE"
    | "NO_TEXT"
    | "PARSING_FAILURE"
    | "SERVER_ERROR";
  error?: string;
};

type ResumeUploadApiResponse = ResumeUploadApiSuccess | ResumeUploadApiError;

type ResumeUploadResult =
  | {
      ok: true;
      resumeFileName: string;
      resumeText: string;
    }
  | {
      ok: false;
      message: string;
    };

type ResumeUploadSuccessResult = Extract<ResumeUploadResult, { ok: true }>;
type ResumeTextSource = "none" | "upload" | "manual";
const manualResumeFallbackFileName = "Manual resume text";

const initialFormData: SetupFormData = {
  interviewType: "",
  targetRole: "",
  experienceLevel: "",
  responseMode: "",
  jobDescription: "",
  resumeFileName: "",
  resumeText: "",
};

function getResumeUploadErrorMessage(payload: ResumeUploadApiError | null) {
  switch (payload?.code) {
    case "INVALID_FILE_TYPE":
      return "Only PDF resumes are supported.";
    case "MISSING_FILE":
      return "Upload failed. Please choose a PDF resume.";
    case "EMPTY_FILE":
      return payload.error || "The uploaded resume is empty.";
    case "FILE_TOO_LARGE":
      return payload.error || "Please upload a PDF resume smaller than 5 MB.";
    case "NO_TEXT":
      return (
        payload.error ||
        "Could not extract text from this PDF. Please try a text-based PDF resume."
      );
    case "PARSING_FAILURE":
      return payload.error || "Resume parsing failed.";
    case "INVALID_CONTENT_TYPE":
    case "SERVER_ERROR":
    default:
      return payload?.error || "Upload failed. Please try again.";
  }
}

function hasValidSelections(
  values: SetupFormData,
): values is SetupFormData & {
  interviewType: InterviewType;
  experienceLevel: ExperienceLevel;
  responseMode: ResponseMode;
} {
  return (
    values.interviewType !== "" &&
    values.experienceLevel !== "" &&
    values.responseMode !== ""
  );
}

export function InterviewSetupForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<SetupFormData>(initialFormData);
  const [errors, setErrors] = useState<SetupFormErrors>({});
  const [submittedSetup, setSubmittedSetup] = useState<InterviewSetupData | null>(
    null,
  );
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUploadState, setResumeUploadState] = useState<
    "idle" | "uploading"
  >("idle");
  const [resumeTextSource, setResumeTextSource] =
    useState<ResumeTextSource>("none");

  const isResumeBased = formData.interviewType === "Resume-Based";

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
      ...(name === "interviewType" && value !== "Resume-Based"
        ? {
            resumeFileName: "",
            resumeText: "",
          }
        : {}),
    }));

    if (name === "interviewType" && value !== "Resume-Based") {
      setResumeFile(null);
      setResumeTextSource("none");
    }

    setErrors((current) => {
      if (
        !current[name as keyof SetupFormData] &&
        !(name === "interviewType" && current.resumeText)
      ) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[name as keyof SetupFormData];
      if (name === "interviewType") {
        delete nextErrors.resumeText;
      }
      return nextErrors;
    });
  }

  function handleResumeChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;

    setResumeFile(nextFile);
    setResumeTextSource("none");
    setFormData((current) => ({
      ...current,
      resumeFileName: nextFile?.name ?? "",
      resumeText: "",
    }));
    setErrors((current) => {
      if (!current.resumeText) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors.resumeText;
      return nextErrors;
    });
  }

  function handleManualResumeTextChange(
    event: ChangeEvent<HTMLTextAreaElement>,
  ) {
    const nextText = event.target.value;

    setResumeTextSource(nextText.trim().length > 0 ? "manual" : "none");
    setFormData((current) => ({
      ...current,
      resumeText: nextText,
    }));
    setErrors((current) => {
      if (!current.resumeText) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors.resumeText;
      return nextErrors;
    });
  }

  function validate(values: SetupFormData) {
    const nextErrors: SetupFormErrors = {};
    const normalizedResumeText = values.resumeText?.trim() ?? "";
    const normalizedResumeFileName = values.resumeFileName?.trim() ?? "";

    if (!values.interviewType) {
      nextErrors.interviewType = "Choose an interview type.";
    }

    if (!values.targetRole.trim()) {
      nextErrors.targetRole = "Enter the role you want to practice for.";
    }

    if (!values.experienceLevel) {
      nextErrors.experienceLevel = "Select your experience level.";
    }

    if (!values.responseMode) {
      nextErrors.responseMode = "Choose how you want to answer during the interview.";
    }

    if (
      values.interviewType === "Resume-Based" &&
      !normalizedResumeText &&
      !normalizedResumeFileName
    ) {
      nextErrors.resumeText = "Upload a PDF resume to start a Resume-Based interview.";
    }

    return nextErrors;
  }

  async function readResumeUploadResponse(
    response: Response,
  ): Promise<ResumeUploadApiResponse | null> {
    const contentType = response.headers.get("content-type") ?? "";

    if (!contentType.toLowerCase().includes("application/json")) {
      const bodyText = await response.text();

      console.error(
        "Resume upload returned a non-JSON response.",
        process.env.NODE_ENV === "development"
          ? {
              status: response.status,
              contentType,
              bodyPreview: bodyText.slice(0, 500),
            }
          : {
              status: response.status,
              contentType,
            },
      );

      return null;
    }

    try {
      return (await response.json()) as ResumeUploadApiResponse;
    } catch (error) {
      console.error("Resume upload returned invalid JSON.", {
        error,
        status: response.status,
        contentType,
      });

      return null;
    }
  }

  async function uploadResumeIfNeeded(): Promise<ResumeUploadResult> {
    const normalizedResumeFileName = formData.resumeFileName?.trim() ?? "";
    const normalizedResumeText = formData.resumeText?.trim() ?? "";

    if (!isResumeBased) {
      return {
        ok: true,
        resumeFileName: "",
        resumeText: "",
      };
    }

    if (resumeTextSource === "upload" && normalizedResumeText && normalizedResumeFileName) {
      return {
        ok: true,
        resumeFileName: normalizedResumeFileName,
        resumeText: normalizedResumeText,
      };
    }

    if (resumeTextSource === "manual" && normalizedResumeText) {
      return {
        ok: true,
        resumeFileName: normalizedResumeFileName || manualResumeFallbackFileName,
        resumeText: normalizedResumeText,
      };
    }

    if (!resumeFile) {
      return {
        ok: false,
        message:
          "Upload a PDF resume or paste resume text to start a Resume-Based interview.",
      };
    }

    const uploadData = new FormData();
    uploadData.append("resume", resumeFile);

    setResumeUploadState("uploading");

    try {
      const response = await fetch("/api/resume-upload", {
        method: "POST",
        body: uploadData,
      });

      const payload = await readResumeUploadResponse(response);

      if (!payload) {
        return {
          ok: false,
          message: "Upload failed. Please try again.",
        };
      }

      if (!response.ok || !payload.success) {
        return {
          ok: false,
          message: getResumeUploadErrorMessage(
            payload.success ? null : payload,
          ),
        };
      }

      if (!payload.resumeText?.trim() || !payload.fileName?.trim()) {
        console.error("Resume upload JSON response was missing expected fields.", {
          status: response.status,
          payload,
        });

        return {
          ok: false,
          message: "Resume parsing failed.",
        };
      }

      const uploadedResume: ResumeUploadSuccessResult = {
        ok: true,
        resumeFileName: payload.fileName.trim(),
        resumeText: payload.resumeText.trim(),
      };

      setResumeTextSource("upload");
      setErrors((current) => {
        if (!current.resumeText) {
          return current;
        }

        const nextErrors = { ...current };
        delete nextErrors.resumeText;
        return nextErrors;
      });
      setFormData((current) => ({
        ...current,
        resumeFileName: uploadedResume.resumeFileName,
        resumeText: uploadedResume.resumeText,
      }));

      return uploadedResume;
    } catch (error) {
      console.error("Resume upload request failed.", { error });

      return {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Upload failed. Please try again.",
      };
    } finally {
      setResumeUploadState("idle");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(formData);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (!hasValidSelections(formData)) {
      setErrors((current) => ({
        ...current,
        interviewType:
          formData.interviewType === ""
            ? "Choose an interview type."
            : current.interviewType,
        experienceLevel:
          formData.experienceLevel === ""
            ? "Select your experience level."
            : current.experienceLevel,
        responseMode:
          formData.responseMode === ""
            ? "Choose how you want to answer during the interview."
            : current.responseMode,
      }));
      return;
    }

    let uploadedResume = {
      resumeFileName: formData.resumeFileName?.trim() ?? "",
      resumeText: formData.resumeText?.trim() ?? "",
    };

    const uploadResult = await uploadResumeIfNeeded();

    if (!uploadResult.ok) {
      setErrors((current) => ({
        ...current,
        resumeText: uploadResult.message,
      }));
      return;
    }

    uploadedResume = {
      resumeFileName: uploadResult.resumeFileName,
      resumeText: uploadResult.resumeText,
    };

    const normalizedData: InterviewSetupData =
      formData.interviewType === "Resume-Based"
        ? {
            interviewType: "Resume-Based",
            targetRole: formData.targetRole.trim(),
            experienceLevel: formData.experienceLevel,
            responseMode: formData.responseMode,
            jobDescription: formData.jobDescription.trim(),
            resumeFileName: uploadedResume.resumeFileName,
            resumeText: uploadedResume.resumeText,
          }
        : {
            interviewType: formData.interviewType,
            targetRole: formData.targetRole.trim(),
            experienceLevel: formData.experienceLevel,
            responseMode: formData.responseMode,
            jobDescription: formData.jobDescription.trim(),
          };

    setErrors({});
    clearInterviewSetup();
    saveInterviewSetupState({
      setup: null,
      status: "idle",
      updatedAt: new Date().toISOString(),
    });
    saveInterviewSetup(normalizedData);
    setSubmittedSetup(normalizedData);
    router.push("/interview");
  }

  return (
    <SurfaceCard title="Session details">
      <form className="space-y-8" onSubmit={handleSubmit} noValidate>
        <div className="rounded-[1.75rem] border border-sky-100 bg-sky-50/70 px-5 py-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
            Setup guidance
          </p>
          <p className="mt-2 helper-text">
            Choose a focused role and level so the interview questions feel
            realistic from the first prompt.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="interviewType"
              className="field-label"
            >
              Interview Type
            </label>
            <select
              id="interviewType"
              name="interviewType"
              value={formData.interviewType}
              onChange={handleChange}
              aria-invalid={Boolean(errors.interviewType)}
              aria-describedby={
                errors.interviewType ? "interviewType-error" : undefined
              }
              className="field-control mt-2"
            >
              <option value="">Select interview type</option>
              {interviewTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.interviewType ? (
              <p id="interviewType-error" className="mt-2 text-sm text-rose-600">
                {errors.interviewType}
              </p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <fieldset>
              <legend className="field-label">Response Mode</legend>
              <p className="mt-2 helper-text">
                Choose how you want to practice each answer before the session starts.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {responseModes.map((mode) => {
                  const isSelected = formData.responseMode === mode;
                  const helperCopy =
                    mode === "Written"
                      ? "Best for practicing structure and clarity."
                      : "Best for practicing live interview delivery.";

                  return (
                    <label
                      key={mode}
                      className={`cursor-pointer rounded-[1.6rem] border p-5 transition ${
                        isSelected
                          ? "border-slate-950 bg-slate-950 text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)]"
                          : "border-slate-200 bg-white/86 text-slate-900 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="responseMode"
                        value={mode}
                        checked={isSelected}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-lg font-semibold tracking-tight">
                            {mode}
                          </p>
                          <p
                            className={`mt-2 text-sm leading-6 ${
                              isSelected ? "text-slate-200" : "text-slate-600"
                            }`}
                          >
                            {helperCopy}
                          </p>
                        </div>
                        <span
                          className={`mt-1 h-4 w-4 rounded-full border ${
                            isSelected
                              ? "border-white bg-white"
                              : "border-slate-300 bg-transparent"
                          }`}
                        />
                      </div>
                    </label>
                  );
                })}
              </div>
              {errors.responseMode ? (
                <p className="mt-3 text-sm text-rose-600">
                  {errors.responseMode}
                </p>
              ) : null}
            </fieldset>
          </div>

          <div>
            <label
              htmlFor="targetRole"
              className="field-label"
            >
              Target Role
            </label>
            <input
              id="targetRole"
              name="targetRole"
              type="text"
              value={formData.targetRole}
              onChange={handleChange}
              placeholder="e.g. Frontend Engineer"
              aria-invalid={Boolean(errors.targetRole)}
              aria-describedby={errors.targetRole ? "targetRole-error" : undefined}
              className="field-control mt-2"
            />
            {errors.targetRole ? (
              <p id="targetRole-error" className="mt-2 text-sm text-rose-600">
                {errors.targetRole}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="experienceLevel"
              className="field-label"
            >
              Experience Level
            </label>
            <select
              id="experienceLevel"
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
              aria-invalid={Boolean(errors.experienceLevel)}
              aria-describedby={
                errors.experienceLevel ? "experienceLevel-error" : undefined
              }
              className="field-control mt-2"
            >
              <option value="">Select experience level</option>
              {experienceLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
            {errors.experienceLevel ? (
              <p
                id="experienceLevel-error"
                className="mt-2 text-sm text-rose-600"
              >
                {errors.experienceLevel}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <label
            htmlFor="jobDescription"
            className="field-label"
          >
            Optional Job Description
          </label>
          <textarea
            id="jobDescription"
            name="jobDescription"
            value={formData.jobDescription}
            onChange={handleChange}
            rows={6}
            placeholder="Paste a job description to tailor your interview practice."
            className="field-control mt-2 min-h-40 rounded-[1.75rem]"
          />
          <p className="mt-3 helper-text">
            Adding a job description helps the AI mirror language, expectations,
            and priorities from the role you want.
          </p>
        </div>

        {isResumeBased ? (
          <div className="rounded-[1.9rem] border border-sky-100 bg-[linear-gradient(180deg,rgba(240,249,255,0.95),rgba(255,255,255,0.9))] p-5 shadow-[0_18px_45px_rgba(14,165,233,0.08)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
                  Resume context
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  Upload your PDF resume for a more personal interview
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Upload a PDF resume to tailor questions to your real projects,
                  skills, and experience.
                </p>
              </div>
              <span className="ui-chip bg-white/90 text-sky-800">
                PDF only
              </span>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-dashed border-sky-200 bg-white/80 p-5">
              <label
                htmlFor="resumeUpload"
                className="field-label"
              >
                Resume PDF
              </label>
              <input
                id="resumeUpload"
                name="resumeUpload"
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleResumeChange}
                aria-invalid={Boolean(errors.resumeText)}
                aria-describedby={errors.resumeText ? "resumeUpload-error" : undefined}
                className="mt-3 block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-slate-950 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
              />
              <p className="mt-3 helper-text">
                We extract text on the server and store only the resume context
                needed to personalize this interview.
              </p>
              {formData.resumeFileName ? (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  Selected resume: <span className="font-semibold">{formData.resumeFileName}</span>
                </div>
              ) : null}
              {isResumeBased && formData.resumeText.trim().length > 0 ? (
                resumeTextSource === "manual" ? (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Using pasted resume text. Resume-Based questions will still work, but PDF-driven personalization may be more limited.
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
                    Resume parsed successfully and ready for interview generation.
                  </div>
                )
              ) : null}
              <div className="mt-5">
                <label
                  htmlFor="resumeTextFallback"
                  className="field-label"
                >
                  Manual Resume Text Fallback
                </label>
                <textarea
                  id="resumeTextFallback"
                  name="resumeTextFallback"
                  value={resumeTextSource === "manual" ? formData.resumeText : ""}
                  onChange={handleManualResumeTextChange}
                  rows={8}
                  placeholder="If PDF parsing fails, paste the main text of your resume here."
                  className="field-control mt-3 min-h-40 rounded-[1.5rem]"
                />
                <p className="mt-3 helper-text">
                  Preferred: upload a PDF. Fallback: paste resume text here if parsing fails so Resume-Based mode stays usable.
                </p>
              </div>
              {errors.resumeText ? (
                <p id="resumeUpload-error" className="mt-3 text-sm text-rose-600">
                  {errors.resumeText}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="helper-text">
            Required fields: interview type, target role, experience level, response mode, and a PDF resume for Resume-Based sessions.
          </p>
          <button
            type="submit"
            className="btn-primary"
            disabled={resumeUploadState === "uploading"}
          >
            {resumeUploadState === "uploading" ? "Uploading Resume..." : "Start Interview"}
          </button>
        </div>

        {submittedSetup ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Setup saved locally for this session: {submittedSetup.interviewType}{" "}
            interview for a {submittedSetup.experienceLevel.toLowerCase()}{" "}
            {submittedSetup.targetRole}
            {submittedSetup.resumeFileName
              ? ` using ${submittedSetup.resumeFileName}.`
              : "."}
          </div>
        ) : null}
      </form>
    </SurfaceCard>
  );
}
