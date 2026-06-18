export interface PauseEvent {
  start_seconds: number;
  end_seconds: number;
  duration_seconds: number;
}

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

export interface AnalyticsResult {
  interview_id: number;
  filler_count: number;
  filler_word_breakdown: Record<string, number>;
  speaking_rate: number;
  pause_count: number;
  pauses: PauseEvent[];
  feedback: string;
  overall_score: number;
}

export interface TranscriptResponse {
  interview_id: number;
  full_text: string;
  word_timestamps: WordTimestamp[];
}

export interface TimelineEvent {
  type: string;
  start_seconds: number;
  end_seconds: number;
  label: string;
  severity?: string | null;
}

export interface TimelineResponse {
  interview_id: number;
  events: TimelineEvent[];
}

export interface ProgressPoint {
  interview_id: number;
  title: string;
  created_at: string;
  overall_score: number;
  speaking_rate: number;
  filler_count: number;
}

export interface UserProgress {
  total_interviews: number;
  completed_interviews: number;
  average_score: number;
  average_speaking_rate: number;
  average_filler_count: number;
  history: ProgressPoint[];
}
