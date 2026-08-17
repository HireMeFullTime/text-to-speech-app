'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { TTSRequestPayload } from '@/types/api';
import type { UseTextToSpeechResult } from '@/types/tts';

function getErrorMessage(data: unknown): string {
  if (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    typeof data.error === 'string'
  ) {
    return data.error;
  }

  return 'Unable to generate audio. Please try again.';
}

export function useTextToSpeech(): UseTextToSpeechResult {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const audioUrlRef = useRef<string | null>(null);

  const revokeAudioUrl = useCallback(() => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  useEffect(() => revokeAudioUrl, [revokeAudioUrl]);

  const generateAudio = useCallback(
    async ({ text, voiceId }: TTSRequestPayload) => {
      setIsLoading(true);
      setError(null);
      revokeAudioUrl();
      setAudioUrl(null);

      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text, voiceId }),
        });

        if (!response.ok) {
          const errorData: unknown = await response.json().catch(() => null);
          setError(getErrorMessage(errorData));
          return;
        }

        const audioBlob = await response.blob();
        const nextAudioUrl = URL.createObjectURL(audioBlob);

        revokeAudioUrl();
        audioUrlRef.current = nextAudioUrl;
        setAudioUrl(nextAudioUrl);
      } catch {
        setError('Unable to generate audio. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [revokeAudioUrl]
  );

  return { audioUrl, error, isLoading, generateAudio };
}
