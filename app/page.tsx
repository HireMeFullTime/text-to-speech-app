'use client';

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type SubmitEvent,
} from 'react';
import { useTextToSpeech } from '@/lib/useTextToSpeech';

const MAX_TEXT_LENGTH = 5000;

export default function Home() {
  const [text, setText] = useState('');
  const [volume, setVolume] = useState(1);
  const { audioUrl, error, isLoading, generateAudio } = useTextToSpeech();
  const audioRef = useRef<HTMLAudioElement>(null);
  const isGenerateDisabled = text.trim().length === 0 || isLoading;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [audioUrl, volume]);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isGenerateDisabled) {
      return;
    }

    await generateAudio({ text });
  }

  function handleVolumeChange(event: ChangeEvent<HTMLInputElement>) {
    setVolume(Number(event.target.value));
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 py-12 text-zinc-900">
      <section className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold">Text to Speech</h1>
        <p className="mt-2 text-zinc-600">
          Wklej tekst i wygeneruj nagranie audio za pomocą ElevenLabs.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <div className="flex items-center justify-between gap-4">
              <label className="font-medium" htmlFor="text">
                Tekst do konwersji
              </label>
              <span className="text-sm text-zinc-500">
                {text.length} / {MAX_TEXT_LENGTH}
              </span>
            </div>
            <textarea
              className="mt-2 min-h-48 w-full resize-y rounded-lg border border-zinc-300 p-3 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-300"
              id="text"
              maxLength={MAX_TEXT_LENGTH}
              onChange={(event) => setText(event.target.value)}
              placeholder="Wpisz tekst, który chcesz zamienić na mowę..."
              value={text}
            />
          </div>

          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
            disabled={isGenerateDisabled}
            type="submit"
          >
            {isLoading && (
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
              />
            )}
            {isLoading ? 'Generowanie audio...' : 'Generuj audio'}
          </button>
        </form>

        <div aria-live="polite" className="mt-5" role="status">
          {isLoading && <p>Generowanie audio…</p>}
          {audioUrl && !isLoading && !error && (
            <p>Audio jest gotowe do odtworzenia.</p>
          )}
        </div>

        {error && (
          <p aria-live="assertive" className="mt-5 text-red-700" role="alert">
            {error}
          </p>
        )}

        {audioUrl && (
          <div className="mt-5">
            <audio ref={audioRef} className="w-full" controls src={audioUrl}>
              Twoja przeglądarka nie obsługuje odtwarzania audio.
            </audio>
            <div className="mt-4">
              <label className="block font-medium" htmlFor="volume">
                Głośność: {Math.round(volume * 100)}%
              </label>
              <input
                aria-valuetext={`${Math.round(volume * 100)}%`}
                className="mt-2 w-full"
                id="volume"
                max="1"
                min="0"
                onChange={handleVolumeChange}
                step="0.05"
                type="range"
                value={volume}
              />
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
