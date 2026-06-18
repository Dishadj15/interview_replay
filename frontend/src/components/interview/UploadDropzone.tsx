import { useCallback, useState } from "react";

interface UploadDropzoneProps {
  accept: string;
  label: string;
  onFileSelected: (file: File) => void;
}

export function UploadDropzone({ accept, label, onFileSelected }: UploadDropzoneProps) {
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (file) onFileSelected(file);
    },
    [onFileSelected],
  );

  return (
    <label
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        handleFiles(event.dataTransfer.files);
      }}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
        dragging ? "border-brand-500 bg-brand-50" : "border-slate-300 bg-slate-50 hover:border-brand-400"
      }`}
    >
      <p className="text-sm font-medium text-slate-800">{label}</p>
      <p className="mt-2 text-xs text-slate-500">Drag and drop or click to browse</p>
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />
    </label>
  );
}
