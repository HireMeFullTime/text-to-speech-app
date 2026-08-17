<!-- BEGIN:nextjs-agent-rules -->

# AGENTS.md

This file is read automatically by AI coding agents (Claude Code, Cursor, Copilot Agent, etc.) at the start of work on this repo. It contains persistent project context and rules the agent should follow throughout the whole task, not just in one step.

## About the project

A simple web app: the user pastes text, the app generates audio from it via the ElevenLabs Text-to-Speech API, and the user can listen to the result and download it as an mp3 file.

Purpose: a portfolio/demo project showing integration with an external AI API — not a commercial product. Priority is clean, understandable code, not feature count.

## Stack

- Next.js 14+ (App Router)
- TypeScript (strict, no `any`)
- Tailwind CSS
- Zod — schema validation for API input
- ESLint (included by default with `create-next-app`) + Prettier for formatting, with `eslint-config-prettier` so the two don't conflict
- ElevenLabs API (model `eleven_multilingual_v2` — supports Polish)

## Commands

- `npm run dev` — dev server
- `npm run lint` — lint
- `npm run format` — Prettier, formats all files

Do not run a local production build as part of the workflow — the hosting provider (Vercel) builds the project on deploy. Local `npm run dev` + `npm run lint` are enough to verify changes during development.

## Structure

```
app/            pages (App Router)
app/api/        route handlers (backend)
components/     React components
lib/            hooks and helper functions (no types here)
types/          shared TypeScript types and interfaces
```

## Git / branches

- No work directly on `main`.
- One branch per stage from the work plan below, named `feat/stage-name` (e.g. `feat/api-route`, `feat/ui-form`, `feat/audio-download`).
- Merge to `main` once a stage works and lint passes.
- Small, descriptive commits, one logical change each — not one giant commit per branch.

## Route Handler, not Server Action

This endpoint must return a binary stream (`audio/mpeg`) with a specific `Content-Type`. Server Actions (`'use server'`) are designed for returning serializable data to a component (typically for form mutations) and are not a good fit for returning a raw audio blob. So the TTS endpoint must be implemented as a **Route Handler** (`app/api/tts/route.ts`) — a plain HTTP endpoint with full control over the `Response` — not a Server Action.

## Rules the agent must follow

- **The API key (`ELEVENLABS_API_KEY`) must never reach the frontend.** Every call to ElevenLabs happens only inside the server-side route handler (`app/api/tts/route.ts`).
- Read the API key only from `process.env`, never hardcoded. `.env.local` must be in `.gitignore`.
- All component props, API responses, and input data are typed in `types/` (not in `lib/`) — zero `any`.
- Validate request input on the server with **Zod** (not just manual `if` checks): define a schema for the request body (text required, max 5000 characters) in the route handler, and return a 400 with a readable error message when validation fails. Don't trust client-side validation alone.
- Errors from the ElevenLabs API (e.g. 429 on rate limit, invalid key) must be caught and returned as a readable JSON error, not a generic 500.
- No `console.log` left in code that gets committed.
- Commit after each completed, working stage — not one big commit at the end.
- If anything in the plan below is unclear or conflicts with these rules, the agent should ask instead of guessing.

## Work plan (stages)

Work through these in order, one branch/commit per stage:

1. **Setup** — Next.js + TS + Tailwind, folder structure (`app/`, `app/api/`, `components/`, `lib/`, `types/`), `.env.local.example` with placeholder `ELEVENLABS_API_KEY=your_key_here`, install `zod`. Install `prettier` + `eslint-config-prettier`, add a `.prettierrc` and a `format` script. Add `.vscode/settings.json` with `editor.formatOnSave: true`, Prettier as the default formatter, and ESLint auto-fix on save, so the setup works out of the box for anyone opening the repo in VSCode.
2. **API route** — `app/api/tts/route.ts` (POST): validate `{ text: string, voiceId?: string }` with a Zod schema, call ElevenLabs `text-to-speech/{voice_id}` with the `xi-api-key` header, return an `audio/mpeg` stream. Error handling per the rules above.
3. **UI** — home page: textarea with a character counter, generate button with a loading state, `<audio controls>` player on success, readable error message. API call logic lives in a separate hook `lib/useTextToSpeech.ts`, not inline in the component. Basic accessibility: `label`, `aria-live` for status/error.
4. **Audio and download** — `URL.createObjectURL` for the returned blob, a download button as `tts-output.mp3`, `URL.revokeObjectURL` on unmount/new audio (no memory leaks).
5. **Voice selection (optional)** — a select with 3-4 hardcoded ElevenLabs voices, remember the choice in `localStorage`.
6. **Cleanup** — README with project description, API key setup, stack, a short architecture note (why the call is server-side), and a "Possible extensions" section. Review for types and leftover `console.log`.
7. **Deploy** — push to Vercel, add env var `ELEVENLABS_API_KEY` in Vercel (Settings → Environment Variables), verify the deployed build succeeds there.

Stage 5 can be skipped if closing the project quickly matters more.
<!-- END:nextjs-agent-rules -->
