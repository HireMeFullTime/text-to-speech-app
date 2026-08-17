# Text to Speech App

A simple Next.js application that converts pasted text into speech with the ElevenLabs Text-to-Speech API. Users can listen to the generated audio in the browser and use the native audio controls to download it.

## Features

- Text input with a 5,000-character limit and live counter
- Audio generation with loading and error states
- Accessible status and error announcements
- Audio player with keyboard-accessible volume control
- Automatic cleanup of generated blob URLs
- Server-side request validation with Zod

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Add an ElevenLabs API key

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Then replace the placeholder in `.env.local` with your ElevenLabs API key:

```env
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

Never commit `.env.local`. It is already included in `.gitignore`.

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available commands

```bash
npm run dev
npm run lint
npm run format
```

## Tech stack

- Next.js with the App Router
- React and TypeScript
- Tailwind CSS
- Zod
- ElevenLabs Text-to-Speech API using `eleven_multilingual_v2`
- ESLint and Prettier

## Architecture

The browser sends text to the local `POST /api/tts` route handler. The route validates the request with Zod, reads `ELEVENLABS_API_KEY` from server-side environment variables, and then calls ElevenLabs. It returns the generated MP3 stream to the client.

The ElevenLabs request is intentionally server-side: placing the API key in client-side code would expose it to anyone using the application. The client hook only calls the local API route and turns the returned audio blob into an object URL for the player.

## AI-assisted development

This project was developed with AI coding assistance under developer supervision. The repository's `AGENTS.md` file provides persistent project instructions, including the technology stack, security rules, code organization, and staged work plan.

Task-specific prompts were used to guide individual changes. Each change was reviewed and verified with the development server, TypeScript checks, ESLint, and Prettier. Secrets such as `ELEVENLABS_API_KEY` are kept only in `.env.local` and are never included in the repository or shared with the client.

## Possible extensions

- Add a voice selector and persist the selected voice in `localStorage`
- Add a dedicated download button with a chosen filename
- Add a history of generated audio clips
- Add a light and dark theme toggle
- Add tests
- Add rate limiting or authentication to protect API usage
- Add Speech-to-Text (STT) to transcribe uploaded audio into text
