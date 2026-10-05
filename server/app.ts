import express from 'express';
import { z } from 'zod';
import { generationInput, themeSchema, contrastChecks } from '../shared/theme';
import { exportFormats, exportTheme } from '../shared/export';
import { generateTheme } from './providers';
export const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '64kb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
const visits = new Map<string, { count: number; reset: number }>();
app.post('/api/themes/generate', async (req, res) => {
  const input = generationInput.safeParse(req.body);
  if (!input.success) {
    res.status(400).json({
      error: 'Enter a prompt of 10–3000 characters and a valid provider/model.',
      issues: input.error.flatten(),
    });
    return;
  }
  const now = Date.now();
  for (const [key, value] of visits) if (value.reset < now) visits.delete(key);
  const ip = req.ip || 'local';
  const visit = visits.get(ip) || { count: 0, reset: now + 60000 };
  visits.set(ip, visit);
  if (++visit.count > 10) {
    res.status(429).json({ error: 'Too many generations. Please wait a minute.' });
    return;
  }
  try {
    res.json(await generateTheme(input.data));
  } catch (error) {
    res.status(502).json({
      error:
        error instanceof Error && error.name === 'TimeoutError'
          ? 'Provider timed out. Try again.'
          : error instanceof Error
            ? error.message
            : 'Theme generation failed.',
    });
  }
});
app.post('/api/themes/validate', (req, res) => {
  const result = themeSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      valid: false,
      error: 'Invalid theme configuration.',
      issues: result.error.flatten(),
    });
    return;
  }
  res.json({
    valid: true,
    accessibility: {
      light: contrastChecks(result.data.light),
      dark: contrastChecks(result.data.dark),
    },
  });
});
app.post('/api/themes/export', (req, res) => {
  const result = z
    .object({ theme: themeSchema, format: z.enum(exportFormats) })
    .strict()
    .safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Invalid theme or export format.' });
    return;
  }
  res.json({ content: exportTheme(result.data.theme, result.data.format) });
});
app.use(
  (error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    void _next;
    res.status(400).json({
      error:
        error instanceof SyntaxError
          ? 'Request body must be valid JSON.'
          : 'Request could not be processed.',
    });
  },
);
