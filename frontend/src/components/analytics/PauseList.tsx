import type { PauseEvent } from "../../types/analytics";
import { formatTimestamp } from "../../utils/formatters";

interface PauseListProps {
  pauses: PauseEvent[];
}

export function PauseList({ pauses }: PauseListProps) {
  if (pauses.length === 0) {
    return <p className="text-sm text-slate-500">No significant pauses detected.</p>;
  }

  return (
    <ul className="space-y-2">
      {pauses.map((pause, index) => (
        <li
          key={`${pause.start_seconds}-${index}`}
          className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <span className="font-medium text-slate-700">
            {formatTimestamp(pause.start_seconds)} – {formatTimestamp(pause.end_seconds)}
          </span>
          <span className="text-slate-500">{pause.duration_seconds.toFixed(1)}s</span>
        </li>
      ))}
    </ul>
  );
}
