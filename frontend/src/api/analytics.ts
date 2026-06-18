import { apiRequest } from "./client";
import type {
  AnalyticsResult,
  TimelineResponse,
  TranscriptResponse,
  UserProgress,
} from "../types/analytics";
import type { Resume } from "../types/user";

export async function getAnalytics(interviewId: number): Promise<AnalyticsResult> {
  return apiRequest<AnalyticsResult>(`/api/v1/interviews/${interviewId}/analytics`);
}

export async function getTranscript(interviewId: number): Promise<TranscriptResponse> {
  return apiRequest<TranscriptResponse>(`/api/v1/interviews/${interviewId}/transcript`);
}

export async function getTimeline(interviewId: number): Promise<TimelineResponse> {
  return apiRequest<TimelineResponse>(`/api/v1/interviews/${interviewId}/timeline`);
}

export async function getUserProgress(): Promise<UserProgress> {
  return apiRequest<UserProgress>("/api/v1/users/me/progress");
}

export async function uploadResume(file: File): Promise<Resume> {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest<Resume>("/api/v1/resumes", {
    method: "POST",
    body: formData,
  });
}

export async function getResume(): Promise<Resume> {
  return apiRequest<Resume>("/api/v1/resumes");
}
