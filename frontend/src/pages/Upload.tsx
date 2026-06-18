import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadInterview } from "../api/interviews";
import { uploadResume } from "../api/analytics";
import { UploadDropzone } from "../components/interview/UploadDropzone";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";

export function UploadPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [interviewFile, setInterviewFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!interviewFile) {
      setError("Please select an interview recording.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const interview = await uploadInterview(title, interviewFile);
      if (resumeFile) {
        await uploadResume(resumeFile);
      }
      setMessage("Upload successful. Processing has started.");
      navigate(`/interviews/${interview.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Upload interview</h1>
        <p className="mt-1 text-sm text-slate-600">
          Upload an audio or video recording. Optionally attach your resume PDF for future coaching context.
        </p>
      </div>

      <Card title="Interview recording">
        <div className="space-y-4">
          <Input
            label="Interview title"
            placeholder="Behavioral interview – product manager"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <UploadDropzone
            accept="audio/*,video/*,.mp3,.wav,.m4a,.mp4,.webm,.mov"
            label="Drop mp3, wav, mp4, or other audio/video files"
            onFileSelected={setInterviewFile}
          />
          {interviewFile ? (
            <p className="text-sm text-slate-600">Selected: {interviewFile.name}</p>
          ) : null}
        </div>
      </Card>

      <Card title="Resume (optional)">
        <UploadDropzone accept=".pdf,application/pdf" label="Upload resume PDF" onFileSelected={setResumeFile} />
        {resumeFile ? <p className="mt-3 text-sm text-slate-600">Selected: {resumeFile.name}</p> : null}
      </Card>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

      <Button onClick={handleSubmit} disabled={submitting || !interviewFile}>
        {submitting ? "Uploading..." : "Upload and analyze"}
      </Button>
    </div>
  );
}
