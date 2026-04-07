"use client";

import { useEffect, useRef, useState } from "react";
import {
  getSpeechRecognitionConstructor,
  type BrowserSpeechRecognition,
  type SpeechRecognitionErrorEventLike,
  type SpeechRecognitionEventLike,
  type SpeechRecognitionStatus,
} from "@/lib/speech-recognition";

type SpokenAnswerComposerProps = {
  disabled?: boolean;
  isSubmitting?: boolean;
  onSubmitAnswer: (answer: string) => Promise<void> | void;
};

function toErrorMessage(error: string) {
  switch (error) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone permission was denied. Allow microphone access to practice in spoken mode.";
    case "no-speech":
      return "No speech was detected. Try recording again and speak clearly into your microphone.";
    case "audio-capture":
      return "We could not access your microphone. Check your device input and browser permissions.";
    case "network":
      return "Speech transcription failed because the browser speech service was unavailable.";
    default:
      return "We could not transcribe your spoken answer. Please try again.";
  }
}

export function SpokenAnswerComposer({
  disabled = false,
  isSubmitting = false,
  onSubmitAnswer,
}: SpokenAnswerComposerProps) {
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const transcriptRef = useRef("");
  const interimTranscriptRef = useRef("");
  const [status, setStatus] = useState<SpeechRecognitionStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const SpeechRecognitionCtor = getSpeechRecognitionConstructor();
  const isUnavailable = !SpeechRecognitionCtor;
  const isLocked = disabled || isSubmitting;
  const canStartRecording =
    !isLocked && !isUnavailable && status !== "recording" && status !== "processing";
  const canStopRecording =
    !isLocked && !isUnavailable && status === "recording";
  const combinedTranscript = `${transcript} ${interimTranscript}`.trim();

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  function handleResult(event: SpeechRecognitionEventLike) {
    let finalizedTranscript = "";
    let nextInterimTranscript = "";

    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const result = event.results[index];
      const alternative = result[0]?.transcript?.trim();

      if (!alternative) {
        continue;
      }

      if (result.isFinal) {
        finalizedTranscript += ` ${alternative}`;
      } else {
        nextInterimTranscript += ` ${alternative}`;
      }
    }

    if (finalizedTranscript.trim()) {
      setTranscript((current) => {
        const nextTranscript = `${current} ${finalizedTranscript}`
          .replace(/\s+/g, " ")
          .trim();
        transcriptRef.current = nextTranscript;
        return nextTranscript;
      });
    }

    const normalizedInterimTranscript = nextInterimTranscript
      .replace(/\s+/g, " ")
      .trim();
    interimTranscriptRef.current = normalizedInterimTranscript;
    setInterimTranscript(normalizedInterimTranscript);
  }

  function handleRecognitionError(event: SpeechRecognitionErrorEventLike) {
    setStatus("error");
    transcriptRef.current = transcriptRef.current.trim();
    interimTranscriptRef.current = "";
    setInterimTranscript("");
    setError(toErrorMessage(event.error));
  }

  function startRecording() {
    if (!SpeechRecognitionCtor || !canStartRecording) {
      return;
    }

    setError(null);
    setTranscript("");
    setInterimTranscript("");
    transcriptRef.current = "";
    interimTranscriptRef.current = "";

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setStatus("recording");
    };

    recognition.onresult = handleResult;
    recognition.onerror = handleRecognitionError;
    recognition.onend = () => {
      recognitionRef.current = null;

      setStatus((current) => {
        if (current === "error") {
          return current;
        }

        const finalTranscript =
          `${transcriptRef.current} ${interimTranscriptRef.current}`.trim();

        if (!finalTranscript) {
          setError(
            "No speech was captured. Try again and speak for a bit longer before stopping.",
          );
          return "error";
        }

        transcriptRef.current = finalTranscript;
        setTranscript(finalTranscript);
        interimTranscriptRef.current = "";
        setInterimTranscript("");
        return "ready";
      });
    };

    recognitionRef.current = recognition;
    setStatus("processing");
    recognition.start();
  }

  function stopRecording() {
    if (!recognitionRef.current || !canStopRecording) {
      return;
    }

    setStatus("processing");
    recognitionRef.current.stop();
  }

  async function handleSubmit() {
    const normalizedTranscript = combinedTranscript.trim();

    if (!normalizedTranscript) {
      setError("Record a spoken answer before submitting.");
      return;
    }

    setError(null);
    await onSubmitAnswer(normalizedTranscript);
  }

  return (
    <div className="mt-8 border-t border-slate-200 pt-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">Spoken answer</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Practice live delivery by recording your answer, reviewing the transcript,
            then submitting it for coaching.
          </p>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
          Status: {status}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={startRecording}
          disabled={!canStartRecording}
          className="btn-primary"
        >
          Start Recording
        </button>
        <button
          type="button"
          onClick={stopRecording}
          disabled={!canStopRecording}
          className="btn-secondary"
        >
          Stop Recording
        </button>
      </div>

      {isUnavailable ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Spoken mode is not supported in this browser. Switch to Written mode or try a browser with speech recognition support.
        </div>
      ) : null}

      <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-slate-50/85 p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          Transcript
        </p>
        <p className="mt-3 min-h-28 text-base leading-7 text-slate-700">
          {combinedTranscript || "Your captured transcript will appear here after you speak."}
        </p>
      </div>

      {error ? (
        <p className="mt-3 text-sm text-rose-600">{error}</p>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          Spoken mode uses your browser microphone and speech recognition support to turn your answer into text before evaluation.
        </p>
      )}

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Submit the transcript to run the same evaluation flow used for written answers.
        </p>
        <button
          type="button"
          onClick={() => {
            void handleSubmit();
          }}
          disabled={isLocked || !combinedTranscript}
          className="btn-primary"
        >
          {isSubmitting ? "Evaluating..." : "Submit Transcript"}
        </button>
      </div>
    </div>
  );
}
