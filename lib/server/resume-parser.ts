import "server-only";

import { inspect } from "node:util";
import PDFParser from "pdf2json";

const maxResumeFileSizeBytes = 5 * 1024 * 1024;
const maxResumeTextLength = 12000;
export const resumePdfParserLibrary = "pdf2json";

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

async function extractResumeTextFromPdfBuffer(pdfBuffer: Buffer) {
  let parser: PDFParser | null = null;

  try {
    console.info("Resume parser buffer extraction starting.", {
      parserLibrary: resumePdfParserLibrary,
      inputType: "Buffer",
      byteLength: pdfBuffer.byteLength,
    });

    parser = new PDFParser(null, true);
    const activeParser = parser;

    console.info("Resume parser constructed successfully.", {
      parserLibrary: resumePdfParserLibrary,
      inputType: "Buffer",
    });

    const result = await new Promise<string>((resolve, reject) => {
      activeParser.on("pdfParser_dataReady", () => {
        try {
          resolve(activeParser.getRawTextContent());
        } catch (error) {
          reject(error);
        }
      });

      activeParser.on("pdfParser_dataError", (error) => {
        reject(error instanceof Error ? error : error.parserError);
      });

      activeParser.parseBuffer(pdfBuffer);
    });

    console.info("Resume parser getText completed.", {
      parserLibrary: resumePdfParserLibrary,
      inputType: "Buffer",
      extractedCharacters: result.length,
    });

    return normalizeResumeText(result);
  } catch (error) {
    console.error("Resume parser failed during construction or getText.", {
      parserLibrary: resumePdfParserLibrary,
      inputType: "Buffer",
      stage: parser === null ? "constructor" : "getText",
      message: error instanceof Error ? error.message : String(error),
      rawError: inspect(error, { depth: 6 }),
    });

    if (error instanceof ResumeParserError) {
      throw error;
    }

    throw new ResumeParserError(
      "Resume parsing failed.",
      "PARSING_FAILURE",
    );
  } finally {
    if (parser) {
      try {
        parser.destroy();
        console.info("Resume parser destroy completed.", {
          parserLibrary: resumePdfParserLibrary,
          inputType: "Buffer",
        });
      } catch (destroyError) {
        console.error("Resume parser destroy failed.", {
          parserLibrary: resumePdfParserLibrary,
          inputType: "Buffer",
          message:
            destroyError instanceof Error
              ? destroyError.message
              : String(destroyError),
          rawError: inspect(destroyError, { depth: 6 }),
        });
      }
    }
  }
}

export async function extractResumeTextFromPdf(file: File) {
  await validateResumePdf(file);
  const pdfBuffer = Buffer.from(await file.arrayBuffer());

  try {
    console.info("Resume parser starting.", {
      parserLibrary: resumePdfParserLibrary,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      byteLength: pdfBuffer.byteLength,
      inputType: "Buffer",
    });

    const text = await extractResumeTextFromPdfBuffer(pdfBuffer);

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
      parserLibrary: resumePdfParserLibrary,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      reason: error instanceof Error ? error.message : "Unknown parser error",
      rawError: inspect(error, { depth: 6 }),
    });

    if (error instanceof ResumeParserError) {
      throw error;
    }

    throw new ResumeParserError(
      "Resume parsing failed.",
      "PARSING_FAILURE",
    );
  }
}
