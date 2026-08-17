import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

import type { ApiErrorResponse } from '../../../types/api';

const ttsSchema = z.object({
  text: z
    .string({ message: 'Text is required' })
    .trim()
    .min(1, 'Text cannot be empty')
    .max(5000, 'Text exceeds maximum length of 5000 characters'),
  voiceId: z
    .string()
    .min(1, 'Voice ID cannot be empty')
    .max(64, 'Voice ID is too long')
    .regex(/^[A-Za-z0-9_-]+$/, 'Voice ID contains invalid characters')
    .optional(),
});

function errorResponse(error: string, status: number, details?: unknown) {
  const response: ApiErrorResponse =
    details === undefined ? { error } : { error, details };

  return NextResponse.json(response, { status });
}

function getElevenLabsErrorMessage(data: unknown, fallback: string): string {
  if (typeof data !== 'object' || data === null) {
    return fallback;
  }

  if (
    'detail' in data &&
    typeof data.detail === 'object' &&
    data.detail !== null
  ) {
    if ('message' in data.detail && typeof data.detail.message === 'string') {
      return data.detail.message;
    }
  }

  if ('message' in data && typeof data.message === 'string') {
    return data.message;
  }

  return fallback;
}

// Default ElevenLabs voice.
const DEFAULT_VOICE_ID = 'BLvmaUADnsV2R6TtX00O';

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return errorResponse('Invalid JSON request body', 400);
  }

  try {
    const parsed = ttsSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        'Validation error',
        400,
        z.treeifyError(parsed.error)
      );
    }

    const { text, voiceId } = parsed.data;
    const finalVoiceId = voiceId || DEFAULT_VOICE_ID;

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return errorResponse('Server configuration error: missing API key', 500);
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${finalVoiceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return errorResponse(
        getElevenLabsErrorMessage(errorData, response.statusText),
        response.status
      );
    }

    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch {
    return errorResponse(
      'Unable to generate speech. Please try again later.',
      500
    );
  }
}
