import type { TimelineEvent } from "../../types/analytics";
import { formatTimestamp } from "../../utils/formatters";

interface InterviewTimelineProps {
  events: TimelineEvent[];
}

const colors: Record<string, string> = {
  filler: "bg-amber-400",
  pause: "bg-blue-400",
};

export function InterviewTimeline({ events }: InterviewTimelineProps) {
  if (events.length === 0) {
    return <p className="text-sm text-slate-500">No timeline events available.</p>;
  }

  const maxTime = Math.max(...events.map((event) => event.end_seconds), 1);

  return (
    <div className="space-y-3">
      {events.slice(0, 20).map((event, index) => (
        <div key={`${event.type}-${event.start_seconds}-${index}`} className="grid grid-cols-[80px_1fr_120px] items-center gap-3">
          <span className="text-xs text-slate-500">{formatTimestamp(event.start_seconds)}</span>
          <div className="relative h-3 rounded-full bg-slate-100">
            <div
              className={`absolute top-0 h-3 rounded-full ${colors[event.type] ?? "bg-slate-400"}`}
              style={{
                left: `${(event.start_seconds / maxTime) * 100}%`,
                width: `${Math.max(((event.end_seconds - event.start_seconds) / maxTime) * 100, 2)}%`,
              }}
            />
          </div>
          <span className="truncate text-xs capitalize text-slate-600">{event.label}</span>
        </div>
      ))}
    </div>
  );
}
