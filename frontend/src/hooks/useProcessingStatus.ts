import { useEffect, useRef, useState } from "react";
import { getProcessingStatus } from "../api/interviews";
import type { ProcessingStatus } from "../types/interview";

const BACKOFF_INTERVALS = [2000, 4000, 8000, 15000, 30000];

export function useProcessingStatus(interviewId: number, enabled: boolean) {
  const [status, setStatus] = useState<ProcessingStatus | null>(null);
  const attemptRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let timeoutId: number | undefined;

    const poll = async () => {
      try {
        const next = await getProcessingStatus(interviewId);
        if (cancelled) return;
        setStatus(next);

        if (next.status === "completed" || next.status === "failed") {
          return;
        }

        const delay = BACKOFF_INTERVALS[Math.min(attemptRef.current, BACKOFF_INTERVALS.length - 1)];
        attemptRef.current += 1;
        timeoutId = window.setTimeout(poll, delay);
      } catch {
        if (!cancelled) {
          timeoutId = window.setTimeout(poll, 5000);
        }
      }
    };

    void poll();

    return () => {
      cancelled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [interviewId, enabled]);

  return status;
}
