import { useCallback, useEffect, useState } from "react";
import { listInterviews } from "../api/interviews";
import type { InterviewSummary } from "../types/interview";

export function useInterviews(status?: string) {
  const [items, setItems] = useState<InterviewSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listInterviews({ status, limit: 50 });
      setItems(response.items);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load interviews");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { items, total, loading, error, refresh };
}
