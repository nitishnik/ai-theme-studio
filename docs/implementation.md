# AI Theme Studio

A local developer workbench using Next.js and Express. Shared Zod schemas define all themes, providers, editor values and exports. Seven presets seed the UI. Preview CSS variables are scoped to the canvas, with separate light/dark maps. Generation accepts provider/model/prompt, uses server-only environment credentials, and returns exactly three validated themes. Missing credentials select a deterministic prompt-aware mock; configured provider errors remain visible errors. Four templates exercise semantic components. Export CSS, Tailwind, shadcn and JSON; check four WCAG contrast pairs. No persistence, login or deployment is required by this MVP.

Implementation sequence: schema/presets and tests; provider/API; preview/editor/export; responsive styles; typecheck, tests, lint and production build.
