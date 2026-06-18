import { useEffect, useState } from "react";
import { getInterview } from "../api/interviews";
import type { InterviewDetail } from "../types/interview";

export function useInterview(id: number) {
  const [interview, setInterview] = useState<InterviewDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getInterview(id)
      .then((data) => {
        if (active) setInterview(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Failed to load interview");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  return { interview, loading, error };
}
