import "server-only";

import { getDocument, VerbosityLevel } from "pdfjs-dist/legacy/build/pdf.mjs";

const maxResumeFileSizeBytes = 5 * 1024 * 1024;
const maxResumeTextLength = 12000;

export class ResumeParserError extends Error {
  constructor(
    message: string,
    readonly code:
      | "INVALID_FILE_TYPE"
      | "EMPTY_FILE"
      | "FILE_TOO_LARGE"
      | "NO_TEXT"
      | "PARSING_FAILURE",
  ) {
    super(message);
    this.name = "ResumeParserError";
  }
}

function normalizeResumeText(rawText: string) {
  return rawText.replace(/\s+/g, " ").trim().slice(0, maxResumeTextLength);
}

async function hasPdfSignature(file: File) {
  const headerBuffer = await file.slice(0, 5).arrayBuffer();
  const headerBytes = new Uint8Array(headerBuffer);

  return String.fromCharCode(...headerBytes) === "%PDF-";
}

export async function validateResumePdf(file: File) {
  const normalizedName = file.name.toLowerCase();
  const hasPdfMimeType = file.type.toLowerCase().includes("pdf");
  const hasPdfFileName = normalizedName.endsWith(".pdf");
  const hasKnownPdfSignature = await hasPdfSignature(file);

  console.info("Resume PDF validation result.", {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    hasPdfMimeType,
    hasPdfFileName,
    hasKnownPdfSignature,
  });

  if (!hasPdfMimeType && !hasPdfFileName && !hasKnownPdfSignature) {
    throw new ResumeParserError(
      "Only PDF resumes are supported.",
      "INVALID_FILE_TYPE",
    );
  }

  if (file.size === 0) {
    throw new ResumeParserError("The uploaded resume is empty.", "EMPTY_FILE");
  }

  if (file.size > maxResumeFileSizeBytes) {
    throw new ResumeParserError(
      "Please upload a PDF resume smaller than 5 MB.",
      "FILE_TOO_LARGE",
    );
  }
}

export async function extractResumeTextFromPdf(file: File) {
  await validateResumePdf(file);
  const pdfData = new Uint8Array(await file.arrayBuffer());
  const loadingTask = getDocument({
    data: pdfData,
    verbosity: VerbosityLevel.ERRORS,
    useWorkerFetch: false,
    isEvalSupported: false,
    disableFontFace: true,
  });
  let document = null;

  try {
    console.info("Resume parser starting.", {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      byteLength: pdfData.byteLength,
    });

    document = await loadingTask.promise;

    const pageTextParts: string[] = [];

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);

      try {
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ")
          .trim();

        if (pageText) {
          pageTextParts.push(pageText);
        }
      } finally {
        page.cleanup();
      }
    }

    const text = normalizeResumeText(pageTextParts.join("\n"));

    if (!text) {
      throw new ResumeParserError(
        "Could not extract text from this PDF. Please try a text-based PDF resume.",
        "NO_TEXT",
      );
    }

    return {
      fileName: file.name,
      text,
    };
  } catch (error) {
    console.error("Resume parser failed.", {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      reason: error instanceof Error ? error.message : "Unknown parser error",
    });

    if (error instanceof ResumeParserError) {
      throw error;
    }

    throw new ResumeParserError(
      "Resume parsing failed.",
      "PARSING_FAILURE",
    );
  } finally {
    await loadingTask.destroy();

    if (document) {
      await document.destroy();
    }
  }
}
