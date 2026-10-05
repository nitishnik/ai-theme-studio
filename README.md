# Chromatic AI Theme Studio

A local, full-stack workbench for generating, previewing, editing, checking, and exporting complete UI themes. It uses Next.js and TypeScript for the interface, Express for the API, shared Zod schemas for validation, and CSS variables for the live preview.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The Next.js app runs on port 3000 and the Express API runs on port 4000 by default. `npm run dev` starts both. If port 4000 is in use, change `API_PORT` in `.env` before starting both processes.

API keys are optional. Without a key for the selected provider, generation returns three deterministic mock variations so the app works locally. A configured key calls the live provider; provider failures are shown to the user instead of silently falling back.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `API_PORT` | Express port; defaults to `4000` |
| `OPENAI_API_KEY` | OpenAI API key |
| `OPENAI_MODEL` | Default OpenAI model; defaults to `gpt-4.1-mini` |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `ANTHROPIC_MODEL` | Default Claude model; defaults to `claude-sonnet-4-5` |
| `GLM_API_KEY` | GLM API key |
| `GLM_MODEL` | Default GLM model; defaults to `glm-4.7` |

Keys are read only by Express. The model ID can also be overridden in the interface. Do not put keys in `NEXT_PUBLIC_*` variables.

## Use

1. Select one of seven presets or enter a prompt and generate three variations.
2. Choose a preview template and switch between independent light and dark token sets.
3. Edit semantic colors, fonts, radius, and shadow style. Changes update the preview immediately.
4. Review the four text contrast checks, then copy or download CSS variables, a Tailwind config snippet, shadcn/ui variables, or JSON tokens.

The mock generator matches a small set of prompt keywords and does not understand arbitrary instructions. The live adapters request strict JSON and validate all generated themes before returning them. Invalid output produces an error instead of entering the editor.

## Project structure

| Path | Purpose |
| --- | --- |
| `app/` | Next.js entry page, metadata, and responsive styles |
| `components/ThemeStudio.tsx` | Studio controls, editor, export UI, and accessibility panel |
| `components/ThemePreview.tsx` | Four CSS-variable-driven preview templates |
| `shared/theme.ts` | Theme and generation schemas, CSS variables, contrast checks |
| `shared/presets.ts` | Seven validated predefined themes |
| `shared/export.ts` | CSS, Tailwind, shadcn/ui, and JSON exporters |
| `server/providers.ts` | OpenAI, Claude, GLM adapters and mock generator |
| `server/app.ts` | Generate, validate, export, and health API endpoints |
| `tests/` | Schema, contrast, and export checks |

## Checks and production build

```bash
npm run typecheck
npm test
npm run lint
npm run build
npm start
```

`npm start` serves the built Next.js app and Express API. The generation endpoint is limited to 10 requests per IP per minute. The app does not store prompts, themes, or API keys in a database.
