export type InterviewStatus = "pending" | "processing" | "completed" | "failed";

export interface InterviewSummary {
  id: number;
  title: string;
  status: InterviewStatus;
  original_filename: string;
  duration_seconds: number | null;
  progress_pct: number;
  created_at: string;
}

export interface InterviewDetail extends InterviewSummary {
  file_type: string;
  transcript: string | null;
  error_message: string | null;
}

export interface InterviewListResponse {
  items: InterviewSummary[];
  total: number;
  limit: number;
  offset: number;
}

export interface ProcessingStatus {
  status: InterviewStatus;
  progress_pct: number;
  eta_seconds: number | null;
  error_message?: string | null;
}
