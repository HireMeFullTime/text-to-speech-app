import type { TTSRequestPayload } from './api';

export interface UseTextToSpeechResult {
  audioUrl: string | null;
  error: string | null;
  isLoading: boolean;
  generateAudio: (payload: TTSRequestPayload) => Promise<void>;
}
