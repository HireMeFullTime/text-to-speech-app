import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { ApiErrorResponse } from '../../../types/api';

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

// test voice from ElevenLabs
const DEFAULT_VOICE_ID = '3JMeckmG8B7F6MuYAWyF';

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        error: 'Invalid JSON request body',
      } as ApiErrorResponse,
      { status: 400 }
    );
  }

  try {
    const parsed = ttsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: z.treeifyError(parsed.error),
        } as ApiErrorResponse,
        { status: 400 }
      );
    }

    const { text, voiceId } = parsed.data;
    const finalVoiceId = voiceId || DEFAULT_VOICE_ID;

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'Server configuration error: missing API key',
        } as ApiErrorResponse,
        { status: 500 }
      );
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
      return NextResponse.json(
        {
          error: 'ElevenLabs API Error',
          details: errorData || response.statusText,
        } as ApiErrorResponse,
        { status: response.status }
      );
    }

    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: 'Unable to generate speech. Please try again later.',
      } as ApiErrorResponse,
      { status: 500 }
    );
  }
}
