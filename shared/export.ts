import { Theme, themeSchema, cssVariables, tokenKeys } from './theme';
export const exportFormats = [
  'CSS variables',
  'Tailwind config',
  'shadcn/ui',
  'JSON tokens',
] as const;
export type ExportFormat = (typeof exportFormats)[number];
const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
export function exportTheme(input: Theme, format: ExportFormat): string {
  const t = themeSchema.parse(input);
  if (format === 'JSON tokens') return JSON.stringify(t, null, 2);
  if (format === 'Tailwind config')
    return `// Load the CSS variables export alongside this config.\nexport default ${JSON.stringify({ darkMode: 'class', theme: { extend: { colors: Object.fromEntries(tokenKeys.map((k) => [k, `var(--${kebab(k)})`])), fontFamily: { heading: ['var(--font-heading)'], body: ['var(--font-body)'] }, borderRadius: { theme: 'var(--radius)' }, boxShadow: { soft: 'var(--shadow-soft)', medium: 'var(--shadow-medium)', strong: 'var(--shadow-strong)' } } } }, null, 2)};`;
  const block = (mode: 'light' | 'dark') => {
    const vars = cssVariables(t, mode);
    if (format === 'shadcn/ui') {
      for (const key of tokenKeys) {
        const mapped = key === 'cardForeground' ? 'card-foreground' : kebab(key);
        vars[`--${mapped}`] = t[mode][key];
      }
      Object.assign(vars, {
        '--popover': t[mode].card,
        '--popover-foreground': t[mode].cardForeground,
      });
    }
    return `${mode === 'light' ? ':root' : '.dark'} {\n${Object.entries(vars)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join('\n')}\n}`;
  };
  return (
    (format === 'shadcn/ui'
      ? '/* Tailwind v4 / current shadcn: colors are complete CSS values. */\n@theme inline {\n' +
        [
          ...tokenKeys.map((k) => `  --color-${kebab(k)}: var(--${kebab(k)});`),
          '  --color-popover: var(--popover);',
          '  --color-popover-foreground: var(--popover-foreground);',
          '  --radius-lg: var(--radius);',
        ].join('\n') +
        '\n}\n\n'
      : '') +
    block('light') +
    '\n\n' +
    block('dark')
  );
}
