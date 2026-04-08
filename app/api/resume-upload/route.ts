import { NextResponse } from "next/server";
import {
  extractResumeTextFromPdf,
  ResumeParserError,
  validateResumePdf,
} from "@/lib/server/resume-parser";

export const runtime = "nodejs";

type ResumeUploadSuccessResponse = {
  success: true;
  fileName: string;
  resumeText: string;
};

type ResumeUploadErrorCode =
  | "INVALID_CONTENT_TYPE"
  | "MISSING_FILE"
  | "INVALID_FILE_TYPE"
  | "EMPTY_FILE"
  | "FILE_TOO_LARGE"
  | "PARSING_FAILURE"
  | "SERVER_ERROR";

type ResumeUploadErrorResponse = {
  success: false;
  code: ResumeUploadErrorCode;
  error: string;
};

function jsonResponse(
  body: ResumeUploadSuccessResponse | ResumeUploadErrorResponse,
  status = 200,
) {
  return NextResponse.json(body, { status });
}

function errorResponse(
  code: ResumeUploadErrorCode,
  error: string,
  status: number,
) {
  return jsonResponse(
    {
      success: false,
      code,
      error,
    },
    status,
  );
}

export async function POST(request: Request) {
  const requestContentType = request.headers.get("content-type") ?? "";

  if (!requestContentType.includes("multipart/form-data")) {
    console.warn("Resume upload rejected due to invalid content type.", {
      contentType: requestContentType,
    });

    return errorResponse(
      "INVALID_CONTENT_TYPE",
      "Upload failed. Please try again.",
      400,
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch (error) {
    console.error("Resume upload form data parsing failed.", {
      error,
      contentType: requestContentType,
    });

    return errorResponse(
      "SERVER_ERROR",
      "Upload failed. Please try again.",
      500,
    );
  }

  const file = formData.get("resume");

  console.info("Resume upload received form data.", {
    hasFile: file instanceof File,
    fileName: file instanceof File ? file.name : null,
    fileType: file instanceof File ? file.type : null,
    fileSize: file instanceof File ? file.size : null,
  });

  if (!(file instanceof File)) {
    console.warn("Resume upload missing file.", {
      receivedValueType: typeof file,
    });

    return errorResponse(
      "MISSING_FILE",
      "Please choose a PDF resume to upload.",
      400,
    );
  }

  try {
    await validateResumePdf(file);
    console.info("Resume upload parser starting.", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    const resume = await extractResumeTextFromPdf(file);

    console.info("Resume upload succeeded.", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    return jsonResponse({
      success: true,
      fileName: resume.fileName,
      resumeText: resume.text,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed. Please try again.";

    if (error instanceof ResumeParserError) {
      if (error.code === "INVALID_FILE_TYPE") {
        console.warn("Resume upload rejected due to invalid file type.", {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          rejectedBy: "validateResumePdf",
        });

        return errorResponse(
          "INVALID_FILE_TYPE",
          "Only PDF resumes are supported.",
          400,
        );
      }

      if (error.code === "EMPTY_FILE") {
        console.warn("Resume upload rejected because the file was empty.", {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          rejectedBy: "validateResumePdf",
        });

        return errorResponse("EMPTY_FILE", message, 400);
      }

      if (error.code === "FILE_TOO_LARGE") {
        console.warn("Resume upload rejected because the file was too large.", {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          rejectedBy: "validateResumePdf",
        });

        return errorResponse("FILE_TOO_LARGE", message, 400);
      }

      if (error.code === "NO_TEXT") {
        console.warn("Resume upload had no extractable text.", {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          rejectedBy: "extractResumeTextFromPdf",
        });

        return errorResponse("PARSING_FAILURE", message, 400);
      }

      console.warn("Resume upload parsing failed.", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        reason: message,
        rejectedBy: "extractResumeTextFromPdf",
      });

      return errorResponse(
        "PARSING_FAILURE",
        message,
        400,
      );
    }

    console.error("Unexpected resume upload failure.", {
      error,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    return errorResponse(
      "SERVER_ERROR",
      "Upload failed. Please try again.",
      500,
    );
  }
}
