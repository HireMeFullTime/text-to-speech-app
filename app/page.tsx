'use client';

import { useTheme } from 'next-themes';
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
  const { resolvedTheme, setTheme } = useTheme();
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

  function toggleTheme() {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 py-12 text-zinc-900 transition-colors duration-200 dark:bg-zinc-950 dark:text-zinc-100">
      <section className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 transition-colors duration-200 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-700 sm:p-8">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold sm:text-3xl">Text to Speech</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 sm:text-base">
              Paste text and generate an audio recording with ElevenLabs.
            </p>
          </div>

          <button
            aria-checked={resolvedTheme === 'dark'}
            aria-label={
              resolvedTheme === 'dark'
                ? 'Switch to light mode'
                : 'Switch to dark mode'
            }
            className="group relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border border-zinc-300 bg-zinc-200 p-1 transition-colors duration-200 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-500 sm:h-8 sm:w-14"
            onClick={toggleTheme}
            role="switch"
            type="button"
          >
            <span className="sr-only">Toggle dark mode</span>
            <span
              className={`absolute left-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 dark:translate-x-5 dark:bg-zinc-950 sm:h-6 sm:w-6 sm:dark:translate-x-6 ${
                resolvedTheme === 'dark'
                  ? 'translate-x-5 sm:translate-x-6'
                  : 'translate-x-0'
              }`}
            />
            <span className="relative z-10 flex w-full items-center justify-between px-1 text-[9px] font-bold text-zinc-500 dark:text-zinc-400 sm:text-[10px]">
              <span aria-hidden="true">☀</span>
              <span aria-hidden="true">☾</span>
            </span>
          </button>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <div className="flex items-center justify-between gap-4">
              <label className="font-medium" htmlFor="text">
                Text to convert
              </label>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {text.length} / {MAX_TEXT_LENGTH}
              </span>
            </div>
            <textarea
              className="mt-2 min-h-48 w-full resize-y rounded-lg border border-zinc-300 bg-white p-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-700"
              id="text"
              maxLength={MAX_TEXT_LENGTH}
              onChange={(event) => setText(event.target.value)}
              placeholder="Enter text to convert to speech..."
              value={text}
            />
          </div>

          <button
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            disabled={isGenerateDisabled}
            type="submit"
          >
            {isLoading && (
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-zinc-900 dark:border-t-transparent"
              />
            )}
            {isLoading ? 'Generating audio...' : 'Generate audio'}
          </button>
        </form>

        <div aria-live="polite" className="mt-5" role="status">
          {isLoading && (
            <p className="text-zinc-600 dark:text-zinc-300">
              Generating audio…
            </p>
          )}
          {audioUrl && !isLoading && !error && (
            <p className="text-zinc-600 dark:text-zinc-300">
              Audio is ready to play.
            </p>
          )}
        </div>

        {error && (
          <p
            aria-live="assertive"
            className="mt-5 text-red-700 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}

        {audioUrl && (
          <div className="mt-5">
            <audio ref={audioRef} className="w-full" controls src={audioUrl}>
              Your browser does not support audio playback.
            </audio>
            <div className="mt-4">
              <label className="block font-medium" htmlFor="volume">
                Volume: {Math.round(volume * 100)}%
              </label>
              <input
                aria-valuetext={`${Math.round(volume * 100)}%`}
                className="mt-2 w-full cursor-pointer accent-zinc-900 dark:accent-zinc-100"
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
