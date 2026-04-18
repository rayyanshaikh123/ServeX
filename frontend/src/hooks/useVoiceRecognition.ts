/**
 * useVoiceRecognition
 *
 * Browser-native speech recognition hook that mirrors the behaviour of
 * VoiceModule/listener.py.  Uses the Web Speech API (SpeechRecognition /
 * webkitSpeechRecognition) which is natively supported in Chrome, Edge, and
 * most modern mobile browsers – no external library needed.
 *
 * Behaviour map vs Python VoiceListener
 * ─────────────────────────────────────
 *   listener.py                  → this hook
 *   ─────────────────────────────────────────
 *   callback(text)               → onResult(text)
 *   callback("__unrecognized__") → onResult("__unrecognized__")
 *   callback("__error__<msg>")   → onResult("__error__<msg>")
 *   set_enabled(true/false)      → toggle()  /  stop()
 *   is_capturing()               → isListening state
 *   Interim partial text         → onInterim(partialText)  (bonus: live preview)
 */

import { useCallback, useEffect, useRef, useState } from "react";

export type VoiceStatus = "idle" | "listening" | "processing" | "error" | "unsupported";

interface UseVoiceRecognitionOptions {
    /** Called with the final recognised text, "__unrecognized__", or "__error__<msg>". */
    onResult: (text: string) => void;
    /** Called during recognition with partial/interim text for live preview. */
    onInterim?: (partial: string) => void;
    /** BCP-47 language tag, default "en-IN" (works well for Indian English). */
    lang?: string;
}

interface UseVoiceRecognitionReturn {
    status: VoiceStatus;
    isListening: boolean;
    toggle: () => void;
    stop: () => void;
    isSupported: boolean;
}

// ── Web Speech API type declarations (not yet in all TS lib sets) ────────
declare global {
    interface SpeechRecognitionResultList {
        readonly length: number;
        item(index: number): SpeechRecognitionResult;
        [index: number]: SpeechRecognitionResult;
    }
    interface SpeechRecognitionResult {
        readonly isFinal: boolean;
        readonly length: number;
        item(index: number): SpeechRecognitionAlternative;
        [index: number]: SpeechRecognitionAlternative;
    }
    interface SpeechRecognitionAlternative {
        readonly transcript: string;
        readonly confidence: number;
    }
    interface SpeechRecognitionEvent extends Event {
        readonly resultIndex: number;
        readonly results: SpeechRecognitionResultList;
    }
    interface SpeechRecognitionErrorEvent extends Event {
        readonly error: string;
        readonly message: string;
    }
    interface SpeechRecognition extends EventTarget {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        maxAlternatives: number;
        start(): void;
        stop(): void;
        abort(): void;
        onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
        onend: ((this: SpeechRecognition, ev: Event) => void) | null;
        onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
        onspeechend: ((this: SpeechRecognition, ev: Event) => void) | null;
        onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
    }
    // eslint-disable-next-line no-var
    var SpeechRecognition: {
        prototype: SpeechRecognition;
        new(): SpeechRecognition;
    };
    // eslint-disable-next-line no-var
    var webkitSpeechRecognition: {
        prototype: SpeechRecognition;
        new(): SpeechRecognition;
    };
    interface Window {
        SpeechRecognition: typeof SpeechRecognition;
        webkitSpeechRecognition: typeof webkitSpeechRecognition;
    }
}

export function useVoiceRecognition({
    onResult,
    onInterim,
    lang = "en-IN",
}: UseVoiceRecognitionOptions): UseVoiceRecognitionReturn {
    const SpeechRecognitionAPI =
        typeof window !== "undefined"
            ? window.SpeechRecognition || window.webkitSpeechRecognition
            : null;

    const isSupported = Boolean(SpeechRecognitionAPI);

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const [status, setStatus] = useState<VoiceStatus>(
        isSupported ? "idle" : "unsupported"
    );

    // Keep callbacks stable in ref so we don't have to re-create the recognition instance
    const onResultRef = useRef(onResult);
    const onInterimRef = useRef(onInterim);
    useEffect(() => { onResultRef.current = onResult; }, [onResult]);
    useEffect(() => { onInterimRef.current = onInterim; }, [onInterim]);

    // Build the SpeechRecognition instance once
    useEffect(() => {
        if (!SpeechRecognitionAPI) return;

        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false;      // single utterance per activation (matches listener.py phrase_time_limit)
        recognition.interimResults = true;   // enables live-preview
        recognition.lang = lang;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setStatus("listening");
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let interim = "";
            let final = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    final += result[0].transcript;
                } else {
                    interim += result[0].transcript;
                }
            }

            if (interim && onInterimRef.current) {
                onInterimRef.current(interim);
            }

            if (final) {
                setStatus("processing");
                onResultRef.current(final.trim());
            }
        };

        recognition.onspeechend = () => {
            // Stop explicitly so the browser doesn't wait forever
            recognition.stop();
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            if (event.error === "no-speech") {
                // Maps to listener.py WaitTimeoutError — silently mark unrecognized
                onResultRef.current("__unrecognized__");
                setStatus("idle");
            } else if (event.error === "aborted") {
                // User cancelled — just reset
                setStatus("idle");
            } else {
                onResultRef.current(`__error__${event.error}`);
                setStatus("error");
                setTimeout(() => setStatus("idle"), 2000);
            }
        };

        recognition.onend = () => {
            // Reset to idle unless we moved to "processing" (result already dispatched)
            setStatus((prev) => (prev === "processing" ? "idle" : prev === "error" ? prev : "idle"));
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lang]);

    const stop = useCallback(() => {
        recognitionRef.current?.stop();
        setStatus("idle");
    }, []);

    const toggle = useCallback(() => {
        if (!recognitionRef.current) return;

        if (status === "listening") {
            recognitionRef.current.stop();
            setStatus("idle");
        } else {
            try {
                recognitionRef.current.start();
            } catch {
                // If already started, abort and restart
                recognitionRef.current.abort();
                setTimeout(() => {
                    try { recognitionRef.current?.start(); } catch { /* ignore */ }
                }, 150);
            }
        }
    }, [status]);

    return {
        status,
        isListening: status === "listening",
        toggle,
        stop,
        isSupported,
    };
}