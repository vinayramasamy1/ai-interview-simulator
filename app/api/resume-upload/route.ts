import { NextResponse } from "next/server";
import { extractResumeTextFromPdf } from "@/lib/server/resume-parser";

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Resume upload must use multipart form data." },
      { status: 400 },
    );
  }

  const file = formData.get("resume");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Please choose a PDF resume to upload." },
      { status: 400 },
    );
  }

  try {
    const resume = await extractResumeTextFromPdf(file);

    return NextResponse.json({
      fileName: resume.fileName,
      resumeText: resume.text,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to read the uploaded resume.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
