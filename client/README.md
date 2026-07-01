# ResumeForge AI Client

This is the Next.js client app for ResumeForge AI.

## Routes

- `/` - landing page
- `/templates` - template selector
- `/builder/[templateId]` - resume builder

Supported template IDs are `tech`, `finance`, `healthcare`, `creative`, and `general`.

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

On Windows PowerShell, use `npm.cmd` if `npm.ps1` is blocked:

```powershell
npm.cmd install
npm.cmd run dev
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Main Folders

```text
src/app/          Next.js App Router pages and global layout
src/components/   Builder, landing page, selector, forms, and AI panel
src/templates/    Resume template React components
src/styles/       Template-specific CSS
src/services/     AI provider routing and fallback writing
public/           Static assets
```

## AI Features

The app supports Gemini, OpenAI-compatible APIs, OpenRouter, and Ollama local. Gemini remains the default provider.

Users configure provider details from the settings modal. Keys and provider settings are saved in browser local storage and are not stored by a backend service.

If a provider fails, summaries and bullet improvements can fall back to deterministic resume-writing templates so the user still gets a usable result.
