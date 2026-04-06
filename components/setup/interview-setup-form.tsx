"use client";

import { type ChangeEvent, type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { SurfaceCard } from "@/components/shared/surface-card";
import {
  experienceLevels,
  interviewTypes,
  saveInterviewSetup,
  type ExperienceLevel,
  type InterviewSetupData,
  type InterviewType,
} from "@/lib/interview-setup";

type SetupFormData = Omit<
  InterviewSetupData,
  "interviewType" | "experienceLevel"
> & {
  interviewType: InterviewType | "";
  experienceLevel: ExperienceLevel | "";
};

type SetupFormErrors = Partial<Record<keyof SetupFormData, string>>;

const initialFormData: SetupFormData = {
  interviewType: "",
  targetRole: "",
  experienceLevel: "",
  jobDescription: "",
};

function hasValidSelections(
  values: SetupFormData,
): values is InterviewSetupData {
  return values.interviewType !== "" && values.experienceLevel !== "";
}

export function InterviewSetupForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<SetupFormData>(initialFormData);
  const [errors, setErrors] = useState<SetupFormErrors>({});
  const [submittedSetup, setSubmittedSetup] = useState<InterviewSetupData | null>(
    null,
  );

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => {
      if (!current[name as keyof SetupFormData]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[name as keyof SetupFormData];
      return nextErrors;
    });
  }

  function validate(values: SetupFormData) {
    const nextErrors: SetupFormErrors = {};

    if (!values.interviewType) {
      nextErrors.interviewType = "Choose an interview type.";
    }

    if (!values.targetRole.trim()) {
      nextErrors.targetRole = "Enter the role you want to practice for.";
    }

    if (!values.experienceLevel) {
      nextErrors.experienceLevel = "Select your experience level.";
    }

    return nextErrors;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
      }));
      return;
    }

    const normalizedData: InterviewSetupData = {
      ...formData,
      targetRole: formData.targetRole.trim(),
      jobDescription: formData.jobDescription.trim(),
    };

    setErrors({});
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

        <div className="flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="helper-text">
            Required fields: interview type, target role, and experience level.
          </p>
          <button
            type="submit"
            className="btn-primary"
          >
            Start Interview
          </button>
        </div>

        {submittedSetup ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Setup saved locally for this session: {submittedSetup.interviewType}{" "}
            interview for a {submittedSetup.experienceLevel.toLowerCase()}{" "}
            {submittedSetup.targetRole}.
          </div>
        ) : null}
      </form>
    </SurfaceCard>
  );
}
