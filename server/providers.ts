import { GenerationInput, generationSchema } from '../shared/theme';
import { makeTheme, presets } from '../shared/presets';
export interface ProviderAdapter {
  generateTheme(input: GenerationInput, config: { key: string; model: string }): Promise<unknown>;
}
const system = `Generate exactly three distinct complete UI design-system themes. Return strict JSON only: {"themes":[theme,theme,theme]}. Each theme must match this example's exact keys and types: ${JSON.stringify(presets[0])}. Colors must be six-digit hex. Allowed fonts: Inter, Arial, Georgia, Verdana, Trebuchet MS, Courier New. Radius in rem or px. Shadows use the same format as example or none. Include independent light and dark semantic colors. Target WCAG 4.5:1 for text pairs. Follow user preferences including avoided colors. Provide meaningful explanations and accessibility notes. Do not add extra keys.`;
async function request(url: string, headers: Record<string, string>, body: unknown) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(90000),
  });
  if (!response.ok)
    throw new Error(
      `Provider returned HTTP ${response.status}. Check your API key, model ID and quota.`,
    );
  return response.json();
}
function parseJSON(value: unknown) {
  if (typeof value !== 'string') throw new Error('Provider returned no theme text.');
  try {
    return JSON.parse(value);
  } catch {
    throw new Error('Provider returned invalid JSON. Try a clearer prompt or a different model.');
  }
}
export const adapters: Record<GenerationInput['provider'], ProviderAdapter> = {
  openai: {
    async generateTheme(input, config) {
      const data = await request(
        'https://api.openai.com/v1/chat/completions',
        { Authorization: `Bearer ${config.key}` },
        {
          model: config.model,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: input.prompt },
          ],
          response_format: { type: 'json_object' },
        },
      );
      return parseJSON(data.choices?.[0]?.message?.content);
    },
  },
  glm: {
    async generateTheme(input, config) {
      const data = await request(
        'https://api.z.ai/api/paas/v4/chat/completions',
        { Authorization: `Bearer ${config.key}` },
        {
          model: config.model,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: input.prompt },
          ],
          response_format: { type: 'json_object' },
        },
      );
      return parseJSON(data.choices?.[0]?.message?.content);
    },
  },
  claude: {
    async generateTheme(input, config) {
      const data = await request(
        'https://api.anthropic.com/v1/messages',
        { 'x-api-key': config.key, 'anthropic-version': '2023-06-01' },
        {
          model: config.model,
          max_tokens: 6500,
          system,
          messages: [{ role: 'user', content: input.prompt }],
        },
      );
      return parseJSON(
        data.content
          ?.filter((b: { type: string }) => b.type === 'text')
          .map((b: { text: string }) => b.text)
          .join(''),
      );
    },
  },
};
export function mockGenerate(prompt: string) {
  const travel = /travel|honeymoon|holiday/i.test(prompt),
    finance = /finance|bank|dashboard/i.test(prompt),
    shop = /luxury|shop|commerce/i.test(prompt);
  const base = travel ? presets[1] : finance ? presets[4] : shop ? presets[2] : presets[0];
  const colors: Record<string, string> = {
    blue: '#2454a0',
    gold: '#e9c46a',
    green: '#19654a',
    purple: '#6544a0',
    red: '#a82c35',
    orange: '#a94f1c',
    teal: '#11645f',
    pink: '#aa346c',
  };
  const avoids = [...prompt.matchAll(/(?:avoid|no|without)\s+(\w+)/gi)].map((m) =>
    m[1].toLowerCase(),
  );
  const requested = Object.keys(colors).filter(
    (c) => new RegExp(`\\b${c}\\b`, 'i').test(prompt) && !avoids.includes(c),
  );
  const primary = requested.find((c) => c !== 'gold');
  let accent = base.light.accent;
  if (requested.includes('gold')) accent = colors.gold;
  return {
    themes: ['Balanced', 'Expressive', 'Quiet'].map((v, i) => {
      const t = makeTheme(
        `${base.name} · ${v}`,
        `${v} interpretation of your brief. Mock preview: add a server API key for full AI interpretation.`,
        primary ? colors[primary] : base.light.primary,
        accent,
        base.typography.heading,
      );
      t.radius = ['0.75rem', '1rem', '0.25rem'][i];
      if (i === 1) t.light.background = '#eef3f8';
      if (i === 2) t.light.secondary = '#f0f1f2';
      t.mood = [v.toLowerCase(), travel ? 'warm' : 'focused', 'trustworthy'];
      t.explanation = `A ${primary || 'grounded'} primary and ${requested.includes('gold') ? 'gold' : 'soft'} accent establish a practical hierarchy. This deterministic mock uses keyword matching rather than full language understanding.`;
      return t;
    }),
  };
}
export async function generateTheme(input: GenerationInput) {
  const config = {
    openai: { key: process.env.OPENAI_API_KEY, model: process.env.OPENAI_MODEL || 'gpt-4.1-mini' },
    claude: {
      key: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5',
    },
    glm: { key: process.env.GLM_API_KEY, model: process.env.GLM_MODEL || 'glm-4.7' },
  }[input.provider];
  const mock = !config.key;
  const output = mock
    ? mockGenerate(input.prompt)
    : await adapters[input.provider].generateTheme(input, {
        key: config.key!,
        model: input.model || config.model,
      });
  const validated = generationSchema.safeParse(output);
  if (!validated.success)
    throw new Error(
      'Provider returned a theme that does not match the schema. Try again or choose another model.',
    );
  return {
    ...validated.data,
    source: mock ? 'mock' : 'live',
    provider: input.provider,
    model: input.model || config.model,
  };
}
