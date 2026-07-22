# ResuCraft

ResuCraft is an AI-powered resume builder for creating polished, ATS-friendly resumes with industry-specific templates and Google Gemini content assistance.

![ResuCraft landing page](screenshots/landing-page.png)

The project was migrated from Vite to Next.js and now uses the Next App Router for the main pages:

- `/` - landing page
- `/templates` - template selector
- `/builder/[templateId]` - resume builder for a selected template

## Features

- AI resume summary generation with Google Gemini
- Configurable AI providers: Gemini, OpenAI-compatible APIs, OpenRouter, and Ollama local
- Built-in fallback writing for summaries and bullet improvements when an AI provider fails
- Resume tailoring from a pasted job description
- Bullet point improvement for stronger achievement statements
- AI skills enhancement
- ATS compatibility analysis
- Cover letter generation
- Resume scoring & grading (keyword-matching, no AI needed)
- Spell and grammar checker (fully offline)
- Multiple resume management (create, switch, rename, duplicate)
- Section-by-section AI rewrite with writing style selection
- Writing styles: Professional, Casual, Academic
- LinkedIn profile import to auto-fill resume data
- Five resume templates: Tech, Finance, Healthcare, Creative, and General
- Live resume preview while editing
- Profile photo upload
- Print/PDF export through the browser print flow
- CSV-based PDF export with download
- Responsive dark glass-style interface
- Auto-save with debounce

## Interface Preview

### Template Selector

![ResuCraft template selector](screenshots/template-selector.png)

### Resume Builder

![ResuCraft tech resume builder](screenshots/builder-tech.png)

### Template Examples

![ResuCraft healthcare resume template](screenshots/builder-healthcare.png)

![ResuCraft creative resume template](screenshots/builder-creative.png)

## Tech Stack

| Technology | Purpose |
| --- | --- |
| Next.js 16 | App framework and routing |
| React 19 | UI framework |
| Framer Motion | UI animation |
| Lucide React | Icons |
| Google Generative AI SDK | Gemini integration |
| Tailwind CSS 4 tooling | PostCSS/Tailwind setup |
| CSS | Custom app and resume template styling |
| ESLint | Code quality checks |

## Getting Started

### Prerequisites

- Node.js 20 or newer is recommended for the current Next.js version
- npm
- A Google Gemini API key for AI features

### Installation

```bash
git clone https://github.com/Bilaaladenuga/ResuCraft.git
cd ResuCraft/client
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

On Windows PowerShell, if `npm` is blocked by script execution policy, use `npm.cmd`:

```powershell
npm.cmd install
npm.cmd run dev
```

## AI Setup

1. Choose an AI provider in Settings.
2. Gemini is the default provider. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).
3. You can also configure an OpenAI-compatible endpoint, OpenRouter model, or Ollama local model.
4. Start the app and open the resume builder.
5. Click `Configure AI` or `Settings`.
6. Paste the provider details and save them.

Ollama local is labeled experimental because it requires a capable device and a local Ollama server.

If the selected provider fails because of quota, rate limits, or key issues, ResuCraft falls back to built-in resume-writing templates for summaries and bullet improvements.

Provider credentials are stored in the browser's local storage and are used directly by the client.

## Scripts

Run these from the `client` directory.

```bash
npm run dev
npm run build
npm run start
npm run lint
```

- `dev` starts the Next.js development server.
- `build` creates a production build.
- `start` serves the production build after `npm run build`.
- `lint` runs ESLint.

## Project Structure

```text
ResuCraft/
  README.md
  screenshots/
  client/
    src/
      app/
        page.tsx
        templates/page.tsx
        builder/[templateId]/page.tsx
        layout.tsx
        globals.css
      components/
        LandingPage.tsx
        TemplateSelector.tsx
        ResumeBuilder.tsx
        ResumeForm.tsx
        ResumePreview.tsx
        AIPanel.tsx
        SettingsModal.tsx
        ResumeManager.tsx
        SpellCheckModal.tsx
        ResumeScoreModal.tsx
        PDFExport.tsx
        LinkedInImportModal.tsx
      services/
        ai.ts
        storage.ts
        prompts.ts
        validation.ts
        spellcheckService.ts
        linkedinParser.ts
      styles/
        templates.css
      templates/
        TechTemplate.tsx
        FinanceTemplate.tsx
        HealthcareTemplate.tsx
        CreativeTemplate.tsx
        GeneralTemplate.tsx
        LegalTemplate.tsx
        EducationTemplate.tsx
        index.ts
      types/
        index.ts
        modules.d.ts
    public/
    package.json
    next.config.mjs
```

## Migration Notes

The active app is now `client/`, running on Next.js. The old Vite entry files were removed from the tracked client app and replaced with App Router pages.

`client-old/` may exist locally as a backup from the migration, but it is not part of the active application.

## Deployment

The app can be deployed as a standard Next.js project. For Vercel:

1. Import the GitHub repository.
2. Set the project root to `client`.
3. Use the default Next.js build settings.
4. Deploy.

Because the Gemini key is entered by the user in the browser, no server environment variable is required for the current AI flow.

## Author

Bilaal Adenuga
