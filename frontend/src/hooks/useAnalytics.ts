import { useEffect, useState } from "react";
import { getAnalytics } from "../api/analytics";
import type { AnalyticsResult } from "../types/analytics";

export function useAnalytics(interviewId: number | null) {
  const [analytics, setAnalytics] = useState<AnalyticsResult | null>(null);
  const [loading, setLoading] = useState(Boolean(interviewId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!interviewId) {
      setAnalytics(null);
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;
    setLoading(true);
    getAnalytics(interviewId)
      .then((data) => {
        if (active) setAnalytics(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Failed to load analytics");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [interviewId]);

  return { analytics, loading, error };
}
