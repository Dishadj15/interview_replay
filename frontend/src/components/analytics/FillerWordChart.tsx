interface FillerWordChartProps {
  breakdown: Record<string, number>;
}

export function FillerWordChart({ breakdown }: FillerWordChartProps) {
  const entries = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map(([, count]) => count), 1);

  if (entries.length === 0) {
    return <p className="text-sm text-slate-500">No filler words detected.</p>;
  }

  return (
    <div className="space-y-3">
      {entries.map(([word, count]) => (
        <div key={word}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-medium capitalize text-slate-700">{word}</span>
            <span className="text-slate-500">{count}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-amber-500"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
