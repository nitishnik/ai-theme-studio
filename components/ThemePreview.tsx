import { CSSProperties } from 'react';
import { ArrowUpRight, Check, Layers, ArrowRight, BarChart3, ShoppingBag } from 'lucide-react';
import { Theme, Mode, cssVariables } from '../shared/theme';
export const templates = ['Landing page', 'Ecommerce', 'Dashboard', 'Form / Auth'] as const;
export type Template = (typeof templates)[number];
export default function ThemePreview({
  theme,
  mode,
  template,
}: {
  theme: Theme;
  mode: Mode;
  template: Template;
}) {
  return (
    <div className="themed-preview" style={cssVariables(theme, mode) as CSSProperties}>
      <nav className="preview-nav">
        <strong>
          <Layers size={18} /> orbit<span>®</span>
        </strong>
        <div>
          <span>Product</span>
          <span>Resources</span>
          <button className="p-button small">
            Get started <ArrowUpRight size={13} />
          </button>
        </div>
      </nav>
      {template === 'Landing page' ? (
        <>
          <section className="preview-hero">
            <span className="p-pill">
              <span className="status-dot" /> A better way to build
            </span>
            <h1>
              Big ideas.
              <br />
              Beautifully brought to life.
            </h1>
            <p>
              Your next chapter starts with the right tools. Bring your team, your projects, and
              your possibilities together.
            </p>
            <div className="hero-actions">
              <button className="p-button">
                Start building <ArrowRight size={15} />
              </button>
              <button className="p-button secondary">Explore the product</button>
            </div>
            <div className="hero-proof">
              <div className="avatars">
                <i>AK</i>
                <i>JL</i>
                <i>SR</i>
                <i>MT</i>
              </div>
              <span>Built for teams that care about the details.</span>
            </div>
          </section>
          <section className="preview-features">
            {[
              ['Thoughtfully connected', 'Everything you need, right where you need it.'],
              ['Room to grow', 'From your first idea to your next big launch.'],
              ['Made for your team', 'Less friction. More meaningful work.'],
            ].map(([title, body], i) => (
              <article className="p-card" key={title}>
                <div className="feature-icon">
                  {i === 0 ? (
                    <Layers size={19} />
                  ) : i === 1 ? (
                    <BarChart3 size={19} />
                  ) : (
                    <Check size={19} />
                  )}
                </div>
                <h3>{title}</h3>
                <p>{body}</p>
                <span className="p-link">
                  Learn more <ArrowUpRight size={13} />
                </span>
              </article>
            ))}
          </section>
          <section className="preview-bottom">
            <div>
              <h3>A little more possibility.</h3>
              <p>All the essentials. One simple plan.</p>
            </div>
            <div>
              <strong>
                $24 <small>/ month</small>
              </strong>
              <button className="p-button small">Choose Pro</button>
            </div>
          </section>
        </>
      ) : null}
      {template === 'Ecommerce' ? (
        <section className="product-view">
          <div className="product-art">
            <ShoppingBag size={115} strokeWidth={0.8} />
            <span>THE EVERYDAY COLLECTION</span>
          </div>
          <div>
            <span className="p-pill">Thoughtfully made</span>
            <h1>The everyday carry.</h1>
            <p>
              A considered companion for wherever the day takes you. Recycled canvas, durable
              hardware, and room for what matters.
            </p>
            <h2>₹4,800</h2>
            <label>
              Finish
              <select>
                <option>Natural canvas</option>
                <option>Charcoal</option>
              </select>
            </label>
            <button className="p-button">
              Add to bag <ShoppingBag size={16} />
            </button>
            <p className="p-success">✓ In stock · Free delivery</p>
          </div>
        </section>
      ) : null}
      {template === 'Dashboard' ? (
        <section className="dashboard-view">
          <h1>Your workspace, at a glance.</h1>
          <p>A clear picture of what&apos;s moving forward.</p>
          <div className="stat-grid">
            {[
              ['Revenue', '₹1,24,800'],
              ['Active projects', '24'],
              ['Conversion', '4.8%'],
            ].map(([a, b]) => (
              <article className="p-card" key={a}>
                <p>{a}</p>
                <h2>{b}</h2>
                <span className="p-success">↗ 12% this month</span>
              </article>
            ))}
          </div>
          <div className="chart" aria-label="Weekly activity bar chart">
            {[35, 55, 42, 74, 61, 88, 70, 93, 80, 65, 90, 100].map((h, i) => (
              <div key={i} style={{ height: `${h}%` }} />
            ))}
          </div>
          <h3>Recent projects</h3>
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Status</th>
                <th>Owner</th>
              </tr>
            </thead>
            <tbody>
              {['Website redesign', 'Mobile experience', 'Design system'].map((name, i) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td>
                    <span className="p-pill">{i === 0 ? 'Complete' : 'In progress'}</span>
                  </td>
                  <td>{['Ananya', 'James', 'Sarah'][i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
      {template === 'Form / Auth' ? (
        <section className="auth-view">
          <div className="p-card">
            <span className="p-pill">Your next chapter</span>
            <h1>Welcome back.</h1>
            <p>Sign in to your Orbit workspace.</p>
            <form onSubmit={(e) => e.preventDefault()}>
              <label>
                Email address
                <input type="email" placeholder="you@company.com" />
              </label>
              <label>
                Password
                <input type="password" placeholder="Enter your password" />
              </label>
              <label className="checkbox">
                <input type="checkbox" /> Keep me signed in
              </label>
              <button className="p-button" type="submit">
                Sign in <ArrowRight size={16} />
              </button>
            </form>
            <p>
              New here? <span className="p-link">Create an account</span>
            </p>
          </div>
        </section>
      ) : null}
      <div className="component-strip">
        <span className="p-success">● All systems operational</span>
        <span style={{ color: 'var(--warning)' }}>● Review pending</span>
        <span style={{ color: 'var(--info)' }}>● New update</span>
        <button className="p-destructive">Delete</button>
      </div>
      <footer className="preview-footer">
        <strong>orbit</strong>
        <span>A little clarity goes a long way.</span>
        <span>© 2026 Orbit</span>
      </footer>
    </div>
  );
}
