# ResumeForge AI

ResumeForge AI is an AI-powered resume builder for creating polished, ATS-friendly resumes with industry-specific templates and Google Gemini content assistance.

The project was migrated from Vite to Next.js and now uses the Next App Router for the main pages:

- `/` - landing page
- `/templates` - template selector
- `/builder/[templateId]` - resume builder for a selected template

## Features

- AI resume summary generation with Google Gemini
- Resume tailoring from a pasted job description
- Bullet point improvement for stronger achievement statements
- AI skills enhancement
- ATS compatibility analysis
- Cover letter generation
- Five resume templates: Tech, Finance, Healthcare, Creative, and General
- Live resume preview while editing
- Profile photo upload
- Print/PDF export through the browser print flow
- Responsive dark glass-style interface

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
git clone https://github.com/Bilaaladenuga/ResumeForge-AI.git
cd ResumeForge-AI/client
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

1. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).
2. Start the app and open the resume builder.
3. Click `Configure AI` or `Settings`.
4. Paste the API key and save it.

The API key is stored in the browser's local storage and is used directly by the client when calling Gemini.

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
ResumeForge-AI/
  README.md
  screenshots/
  client/
    src/
      app/
        page.jsx
        templates/page.jsx
        builder/[templateId]/page.jsx
        layout.jsx
        globals.css
      components/
        LandingPage.jsx
        TemplateSelector.jsx
        ResumeBuilder.jsx
        ResumeForm.jsx
        ResumePreview.jsx
        AIPanel.jsx
        SettingsModal.jsx
      services/
        ai.js
      styles/
        templates.css
      templates/
        TechTemplate.jsx
        FinanceTemplate.jsx
        HealthcareTemplate.jsx
        CreativeTemplate.jsx
        GeneralTemplate.jsx
        index.js
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
