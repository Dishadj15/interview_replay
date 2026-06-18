import { apiRequest } from "./client";
import type { AuthResponse } from "../types/user";
import type {
  InterviewDetail,
  InterviewListResponse,
  InterviewSummary,
  ProcessingStatus,
} from "../types/interview";

export async function signup(email: string, password: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/v1/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe() {
  return apiRequest<{ id: number; email: string }>("/api/v1/auth/me");
}

export async function listInterviews(params?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<InterviewListResponse> {
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.limit) search.set("limit", String(params.limit));
  if (params?.offset) search.set("offset", String(params.offset));
  const query = search.toString();
  return apiRequest<InterviewListResponse>(`/api/v1/interviews${query ? `?${query}` : ""}`);
}

export async function getInterview(id: number): Promise<InterviewDetail> {
  return apiRequest<InterviewDetail>(`/api/v1/interviews/${id}`);
}

export async function uploadInterview(title: string, file: File): Promise<InterviewSummary> {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("file", file);
  return apiRequest<InterviewSummary>("/api/v1/interviews", {
    method: "POST",
    body: formData,
  });
}

export async function deleteInterview(id: number): Promise<void> {
  return apiRequest<void>(`/api/v1/interviews/${id}`, { method: "DELETE" });
}

export async function getProcessingStatus(id: number): Promise<ProcessingStatus> {
  return apiRequest<ProcessingStatus>(`/api/v1/interviews/${id}/status`);
}

export async function reprocessInterview(id: number): Promise<ProcessingStatus> {
  return apiRequest<ProcessingStatus>(`/api/v1/interviews/${id}/process`, {
    method: "POST",
  });
}
