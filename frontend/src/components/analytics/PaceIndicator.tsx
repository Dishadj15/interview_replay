import { formatWPM } from "../../utils/formatters";

interface PaceIndicatorProps {
  speakingRate: number;
}

export function PaceIndicator({ speakingRate }: PaceIndicatorProps) {
  const { label, tone } = formatWPM(speakingRate);
  const toneClasses = {
    slow: "text-amber-700 bg-amber-50 border-amber-200",
    ideal: "text-emerald-700 bg-emerald-50 border-emerald-200",
    fast: "text-red-700 bg-red-50 border-red-200",
  }[tone];

  return (
    <div className={`rounded-2xl border p-5 ${toneClasses}`}>
      <p className="text-sm font-medium">Speaking pace</p>
      <p className="mt-2 text-4xl font-bold">{speakingRate.toFixed(1)}</p>
      <p className="text-sm">words per minute · {label}</p>
      <p className="mt-3 text-xs opacity-80">Ideal interview range: 130–160 WPM</p>
    </div>
  );
}
