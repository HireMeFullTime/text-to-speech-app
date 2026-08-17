export interface TTSRequestPayload {
  text: string;
  voiceId?: string;
}

export interface ApiErrorResponse {
  error: string;
  details?: unknown;
}
