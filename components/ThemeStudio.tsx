'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Settings2,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  Copy,
  Check,
  Download,
  RotateCcw,
  ChevronDown,
  Palette,
  Code2,
  ShieldCheck,
  ArrowUpRight,
  Command,
  SlidersHorizontal,
  LoaderCircle,
} from 'lucide-react';
import {
  Theme,
  Mode,
  Tokens,
  themeSchema,
  generationSchema,
  contrastChecks,
  fontSchema,
} from '../shared/theme';
import { presets } from '../shared/presets';
import { exportTheme, exportFormats, ExportFormat } from '../shared/export';
import ThemePreview, { templates, Template } from './ThemePreview';
const editable = [
  'primary',
  'secondary',
  'accent',
  'background',
  'foreground',
  'card',
  'border',
] as const;
const providerNames = { openai: 'OpenAI / ChatGPT', claude: 'Claude', glm: 'GLM' };
export default function ThemeStudio() {
  const [theme, setTheme] = useState<Theme>(presets[0]);
  const [original, setOriginal] = useState<Theme>(presets[0]);
  const [mode, setMode] = useState<Mode>('light');
  const [prompt, setPrompt] = useState('');
  const [provider, setProvider] = useState<'openai' | 'claude' | 'glm'>('openai');
  const [model, setModel] = useState('');
  const [settings, setSettings] = useState(false);
  const [template, setTemplate] = useState<Template>('Landing page');
  const [variations, setVariations] = useState<Theme[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [source, setSource] = useState('');
  const [tab, setTab] = useState<'tokens' | 'export'>('tokens');
  const [format, setFormat] = useState<ExportFormat>('CSS variables');
  const [copied, setCopied] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [editorError, setEditorError] = useState('');
  const checks = contrastChecks(theme[mode]);
  const good = checks.filter((c) => c.status === 'Good').length;
  const output = exportTheme(theme, format);
  function select(t: Theme) {
    setTheme(t);
    setOriginal(t);
    setEditorError('');
  }
  function updateToken(key: keyof Tokens, value: string) {
    setTheme((t) => ({ ...t, [mode]: { ...t[mode], [key]: value } }));
  }
  function updateRadius(value: string) {
    const result = themeSchema.safeParse({ ...theme, radius: value });
    if (result.success) {
      setTheme(result.data);
      setEditorError('');
    } else setEditorError('Radius must be 0–19 rem or px (for example, 0.75rem).');
  }
  async function generate() {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/themes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, provider, model: model || undefined }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Theme generation failed.');
      const parsed = generationSchema.safeParse({ themes: data.themes });
      if (!parsed.success)
        throw new Error('The server returned invalid themes. Try generating again.');
      setVariations(parsed.data.themes);
      select(parsed.data.themes[0]);
      setSource(
        data.source === 'mock'
          ? 'Mock generator · No API key configured'
          : 'Live AI · ' + providerNames[provider],
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Cannot reach the API. Make sure both development servers are running.',
      );
    } finally {
      setBusy(false);
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Clipboard unavailable. Select the export text and copy it manually.');
    }
  }
  function download() {
    const blob = new Blob([output], {
      type: format === 'JSON tokens' ? 'application/json' : 'text/plain',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${theme.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${format === 'JSON tokens' ? 'json' : format === 'Tailwind config' ? 'js' : 'css'}`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="studio">
      <header className="app-header">
        <Link className="brand" href="/" aria-label="Chromatic home">
          <span className="brand-mark">
            <Palette size={21} />
          </span>
          chromatic
          <span className="brand-divider" />
          <span className="brand-subtitle">Theme studio</span>
        </Link>
        <div className="header-right">
          <span className="local-badge">
            <span />
            Local workspace
          </span>
          <span className="header-link">Made for developers</span>
          <span className="version">v1.0</span>
        </div>
      </header>
      <main className="workspace">
        <aside className="left-panel">
          <div className="panel-title">
            <Sparkles size={17} />
            <h2>Create your theme</h2>
          </div>
          <p className="muted intro">From a few words to a complete design system.</p>
          <label className="field-label" htmlFor="prompt">
            What are you building?
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            maxLength={3000}
            placeholder={
              'A modern SaaS platform that feels calm and confident. Use blue with soft neutrals. Avoid purple.'
            }
          />
          <div className="prompt-helper">
            <span>Be specific about mood, colors & audience</span>
            <span>{prompt.length}/3000</span>
          </div>
          <button
            className="generate-button"
            disabled={busy || prompt.trim().length < 10}
            onClick={generate}
          >
            {busy ? <LoaderCircle size={16} className="spin" /> : <Sparkles size={16} />}{' '}
            {busy ? 'Creating themes…' : 'Generate 3 variations'}
            <span>↵</span>
          </button>
          <button
            className="settings-toggle"
            onClick={() => setSettings(!settings)}
            aria-expanded={settings}
          >
            <Settings2 size={14} />
            <span>{providerNames[provider]}</span>
            <span className="muted">Model settings</span>
            <ChevronDown size={13} />
          </button>
          {settings && (
            <div className="settings-panel">
              <label>
                AI provider
                <select
                  value={provider}
                  onChange={(e) => {
                    setProvider(e.target.value as typeof provider);
                    setModel('');
                  }}
                >
                  {Object.entries(providerNames).map(([key, label]) => (
                    <option value={key} key={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Model ID
                <input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Use server default"
                  maxLength={100}
                />
              </label>
              <p>
                API keys stay on your server. Without a key, you&apos;ll get three mock variations.
              </p>
            </div>
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          {source && (
            <p className="source-status" role="status">
              {source}
            </p>
          )}
          {variations.length > 0 && (
            <section className="variation-list">
              <h3>Your variations</h3>
              {variations.map((t, i) => (
                <button
                  key={t.name}
                  className={`preset ${theme.name === t.name ? 'selected' : ''}`}
                  onClick={() => select(t)}
                >
                  <span className="variation-number">{i + 1}</span>
                  <span>
                    <strong>{t.name}</strong>
                    <small>{t.mood.join(' · ')}</small>
                  </span>
                </button>
              ))}
            </section>
          )}
          <div className="section-divider">
            <span>or start with a preset</span>
          </div>
          <section className="presets">
            <div className="section-heading">
              <h3>Curated themes</h3>
              <span>7 presets</span>
            </div>
            {presets.map((t, i) => (
              <button
                className={`preset ${theme.name === t.name ? 'selected' : ''}`}
                onClick={() => {
                  select(t);
                  setSource('');
                }}
                key={t.name}
              >
                <span className="preset-swatch" style={{ background: t.light.primary }}>
                  <i style={{ background: t.light.accent }} />
                </span>
                <span>
                  <strong>{t.name}</strong>
                  <small>
                    {
                      [
                        'Clean & versatile',
                        'Warm & trustworthy',
                        'Refined & understated',
                        'Simple & focused',
                        'Precise & confident',
                        'Friendly & engaging',
                        'Technical & expressive',
                      ][i]
                    }
                  </small>
                </span>
                {theme.name === t.name && <Check size={15} />}
              </button>
            ))}
          </section>
          <div className="tip">
            <Command size={16} />
            <div>
              <strong>A system, not just a palette.</strong>
              <p>Every theme includes light & dark tokens, typography, radius, and shadows.</p>
            </div>
          </div>
          <div className="sidebar-footer">
            <span className="status-light" />
            Your ideas. Your tokens. Your code.
          </div>
        </aside>
        <section className="canvas-panel">
          <div className="canvas-heading">
            <div>
              <h2>
                Live preview <span className="live-dot" />
              </h2>
              <p>Real components. Instant feedback.</p>
            </div>
            <div className="mode-control">
              <button
                className={mode === 'light' ? 'active' : ''}
                onClick={() => setMode('light')}
                aria-label="Light mode"
                aria-pressed={mode === 'light'}
              >
                <Sun size={15} />
              </button>
              <button
                className={mode === 'dark' ? 'active' : ''}
                onClick={() => setMode('dark')}
                aria-label="Dark mode"
                aria-pressed={mode === 'dark'}
              >
                <Moon size={15} />
              </button>
            </div>
          </div>
          <div className="preview-toolbar">
            <div className="template-select">
              <Monitor size={14} />
              <select
                aria-label="Preview template"
                value={template}
                onChange={(e) => setTemplate(e.target.value as Template)}
              >
                {templates.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="device-control">
              <button
                onClick={() => setMobile(false)}
                className={!mobile ? 'active' : ''}
                aria-label="Desktop preview"
                aria-pressed={!mobile}
              >
                <Monitor size={15} />
              </button>
              <button
                onClick={() => setMobile(true)}
                className={mobile ? 'active' : ''}
                aria-label="Mobile preview"
                aria-pressed={mobile}
              >
                <Smartphone size={15} />
              </button>
              <span>{mobile ? '390px' : 'Responsive'}</span>
            </div>
          </div>
          <div className={`preview-stage ${mobile ? 'mobile-preview' : ''}`}>
            <div className="browser-frame">
              <div className="browser-top">
                <div className="window-dots">
                  <i />
                  <i />
                  <i />
                </div>
                <span>orbit.app</span>
                <ArrowUpRight size={11} />
              </div>
              <ThemePreview theme={theme} mode={mode} template={template} />
            </div>
          </div>
          <div className="theme-caption">
            <div>
              <span className="caption-swatch" style={{ background: theme[mode].primary }} />
              <strong>{theme.name}</strong>
              <span>{mode} mode</span>
            </div>
            <span>20 semantic colors</span>
          </div>
          <section className="theme-story">
            <h3>Behind the theme</h3>
            <p>{theme.description}</p>
            <div>
              {theme.mood.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
            <p>{theme.explanation}</p>
          </section>
        </section>
        <aside className="right-panel">
          <div className="inspector-tabs">
            <button className={tab === 'tokens' ? 'active' : ''} onClick={() => setTab('tokens')}>
              <SlidersHorizontal size={14} />
              Customize
            </button>
            <button className={tab === 'export' ? 'active' : ''} onClick={() => setTab('export')}>
              <Code2 size={14} />
              Export
            </button>
          </div>
          {tab === 'tokens' ? (
            <>
              <div className="editor-heading">
                <div>
                  <h2>Theme tokens</h2>
                  <p>Editing {mode} mode</p>
                </div>
                <button
                  title="Reset theme edits"
                  aria-label="Reset theme edits"
                  onClick={() => {
                    setTheme(original);
                    setEditorError('');
                  }}
                >
                  <RotateCcw size={14} />
                </button>
              </div>
              <section className="token-editor">
                <h3>Colors</h3>
                {editable.map((key) => (
                  <div className="color-row" key={key}>
                    <label htmlFor={`color-${key}`}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>
                    <div className="color-input">
                      <input
                        id={`color-${key}`}
                        type="color"
                        value={theme[mode][key]}
                        onChange={(e) => updateToken(key, e.target.value)}
                      />
                      <input
                        aria-label={`${key} hex value`}
                        key={`${theme.name}-${mode}-${key}-${theme[mode][key]}`}
                        defaultValue={theme[mode][key].toUpperCase()}
                        maxLength={7}
                        onBlur={(e) => {
                          if (/^#[0-9a-f]{6}$/i.test(e.target.value)) {
                            updateToken(key, e.target.value);
                            setEditorError('');
                          } else {
                            setEditorError('Colors must use six-digit hex, for example #3155B7.');
                            e.target.value = theme[mode][key];
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}
                <details className="all-tokens">
                  <summary>Other semantic colors</summary>
                  {Object.entries(theme[mode])
                    .filter(([key]) => !editable.includes(key as (typeof editable)[number]))
                    .map(([key, value]) => (
                      <label key={key}>
                        {key}
                        <input
                          aria-label={key}
                          type="color"
                          value={value}
                          onChange={(e) => updateToken(key as keyof Tokens, e.target.value)}
                        />
                      </label>
                    ))}
                </details>
              </section>
              <section className="type-editor">
                <h3>Typography</h3>
                <label>
                  Heading font
                  <select
                    value={theme.typography.heading}
                    onChange={(e) =>
                      setTheme({
                        ...theme,
                        typography: {
                          ...theme.typography,
                          heading: fontSchema.parse(e.target.value),
                        },
                      })
                    }
                  >
                    {fontSchema.options.map((f) => (
                      <option key={f}>{f}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Body font
                  <select
                    value={theme.typography.body}
                    onChange={(e) =>
                      setTheme({
                        ...theme,
                        typography: { ...theme.typography, body: fontSchema.parse(e.target.value) },
                      })
                    }
                  >
                    {fontSchema.options.map((f) => (
                      <option key={f}>{f}</option>
                    ))}
                  </select>
                </label>
                <div className="type-specimen" style={{ fontFamily: theme.typography.heading }}>
                  <span>Aa</span>
                  <p>
                    The details make
                    <br />
                    the difference.
                  </p>
                </div>
              </section>
              <section className="radius-editor">
                <h3>Shape & depth</h3>
                <label className="radius-row">
                  Border radius
                  <input
                    aria-label="Border radius"
                    key={`${theme.name}-${theme.radius}`}
                    defaultValue={theme.radius}
                    onBlur={(e) => updateRadius(e.target.value)}
                  />
                </label>
                <input
                  aria-label="Radius slider"
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={
                    theme.radius.endsWith('rem')
                      ? parseFloat(theme.radius)
                      : parseFloat(theme.radius) / 16
                  }
                  onChange={(e) => setTheme({ ...theme, radius: `${e.target.value}rem` })}
                />
                <label>
                  Shadow style
                  <select
                    value={
                      theme.shadows.medium === 'none'
                        ? 'flat'
                        : theme.shadows.medium.includes('0.16')
                          ? 'strong'
                          : 'soft'
                    }
                    onChange={(e) => {
                      const flat = e.target.value === 'flat',
                        strong = e.target.value === 'strong';
                      setTheme({
                        ...theme,
                        shadows: {
                          soft: flat ? 'none' : '0 2px 6px rgba(16,30,50,0.04)',
                          medium: flat
                            ? 'none'
                            : strong
                              ? '0 8px 24px rgba(16,30,50,0.16)'
                              : '0 8px 24px rgba(16,30,50,0.08)',
                          strong: flat ? 'none' : '0 16px 48px rgba(16,30,50,0.14)',
                        },
                      });
                    }}
                  >
                    <option value="soft">Soft & subtle</option>
                    <option value="strong">Defined & elevated</option>
                    <option value="flat">Flat / no shadows</option>
                  </select>
                </label>
              </section>
              {editorError && (
                <p className="error" role="alert">
                  {editorError}
                </p>
              )}
            </>
          ) : (
            <section className="export-panel">
              <h2>Ready for your codebase.</h2>
              <p>Complete tokens for both light and dark modes.</p>
              <div className="export-formats">
                {exportFormats.map((f) => (
                  <button
                    key={f}
                    className={format === f ? 'active' : ''}
                    onClick={() => {
                      setFormat(f);
                      setCopied(false);
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <pre tabIndex={0} aria-label="Theme export">
                <code>{output}</code>
              </pre>
              <button className="generate-button" onClick={copy}>
                {copied ? <Check size={15} /> : <Copy size={15} />}{' '}
                {copied ? 'Copied!' : 'Copy configuration'}
              </button>
              <button className="download-button" onClick={download}>
                <Download size={14} />
                Download file
              </button>
            </section>
          )}
          <section className="accessibility-panel">
            <div className="section-heading">
              <h3>
                <ShieldCheck size={15} />
                Accessibility
              </h3>
              <span className={good === 4 ? 'good' : 'warning'}>
                {good === 4 ? 'All good' : `${good}/4 pass`}
              </span>
            </div>
            <p>WCAG AA · Normal text</p>
            {checks.map((c) => (
              <div className="contrast-row" key={c.key}>
                <span>
                  {c.key === 'background'
                    ? 'Body text'
                    : c.key === 'card'
                      ? 'Card text'
                      : c.key === 'primary'
                        ? 'Primary button'
                        : 'Destructive'}
                </span>
                <strong>{c.ratio.toFixed(2)}:1</strong>
                <span className={c.status.toLowerCase()}>{c.status}</span>
              </div>
            ))}
            <details>
              <summary>Accessibility notes</summary>
              <p>{theme.accessibilityNotes}</p>
            </details>
          </section>
          <button
            className="export-shortcut"
            onClick={() => setTab(tab === 'tokens' ? 'export' : 'tokens')}
          >
            {tab === 'tokens' ? <Code2 size={15} /> : <SlidersHorizontal size={15} />}{' '}
            {tab === 'tokens' ? 'Export theme' : 'Back to tokens'}
            <ArrowUpRight size={14} />
          </button>
        </aside>
      </main>
      <footer className="app-footer">
        <span>Designed to ship.</span>
        <span>
          CSS variables <i /> Tailwind <i /> shadcn/ui <i /> JSON
        </span>
        <span>
          <span className="status-light" /> All changes preview instantly
        </span>
      </footer>
    </div>
  );
}
