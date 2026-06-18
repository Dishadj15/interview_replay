import type { WordTimestamp } from "../../types/analytics";

interface TranscriptViewerProps {
  text: string;
  wordTimestamps: WordTimestamp[];
  fillerWords: Record<string, number>;
}

export function TranscriptViewer({ text, wordTimestamps, fillerWords }: TranscriptViewerProps) {
  const fillerSet = new Set(Object.keys(fillerWords));

  if (wordTimestamps.length === 0) {
    return <p className="whitespace-pre-wrap leading-7 text-slate-700">{text}</p>;
  }

  return (
    <div className="max-h-96 overflow-y-auto rounded-xl bg-slate-50 p-4 leading-7 text-slate-700">
      {wordTimestamps.map((item, index) => {
        const normalized = item.word.toLowerCase().replace(/[.,!?]/g, "");
        const isFiller = fillerSet.has(normalized);
        return (
          <span
            key={`${item.word}-${index}`}
            className={isFiller ? "rounded bg-amber-200 px-1 font-medium text-amber-900" : undefined}
          >
            {item.word}{" "}
          </span>
        );
      })}
    </div>
  );
}
