import "server-only";

import { PDFParse } from "pdf-parse";

const maxResumeFileSizeBytes = 5 * 1024 * 1024;
const maxResumeTextLength = 12000;

function normalizeResumeText(rawText: string) {
  return rawText.replace(/\s+/g, " ").trim().slice(0, maxResumeTextLength);
}

export function validateResumePdf(file: File) {
  const normalizedName = file.name.toLowerCase();
  const isPdfMimeType =
    file.type === "application/pdf" || normalizedName.endsWith(".pdf");

  if (!isPdfMimeType) {
    throw new Error("Please upload a PDF resume.");
  }

  if (file.size === 0) {
    throw new Error("The uploaded resume is empty.");
  }

  if (file.size > maxResumeFileSizeBytes) {
    throw new Error("Please upload a PDF resume smaller than 5 MB.");
  }
}

export async function extractResumeTextFromPdf(file: File) {
  validateResumePdf(file);

  const parser = new PDFParse({
    data: Buffer.from(await file.arrayBuffer()),
  });

  try {
    const result = await parser.getText();
    const text = normalizeResumeText(result.text ?? "");

    if (!text) {
      throw new Error("We could not extract readable text from that PDF.");
    }

    return {
      fileName: file.name,
      text,
    };
  } finally {
    await parser.destroy();
  }
}
