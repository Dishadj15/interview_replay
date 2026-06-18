import { useEffect, useState } from "react";
import { getUserProgress } from "../api/analytics";
import type { UserProgress } from "../types/analytics";

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUserProgress()
      .then(setProgress)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load progress"))
      .finally(() => setLoading(false));
  }, []);

  return { progress, loading, error };
}
