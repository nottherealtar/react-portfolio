const variants = [
  {
    id: 'ember',
    name: 'Ember',
    href: './ember.html',
    inspo: 'shaders.com · Active Theory · Design Spells',
    thesis: 'Dark coffee atelier with WebGL ember field and magnetic craft.',
    tone: 'Atmosphere-first',
    palette: ['#050403', '#d4894a', '#f5eee5'],
  },
  {
    id: 'frost',
    name: 'Frost',
    href: './frost.html',
    inspo: 'Apple HIG · UI Guideline · ContentCore',
    thesis: 'Light editorial clarity — generous space, frosted chrome, calm hierarchy.',
    tone: 'Clarity-first',
    palette: ['#f4f6f8', '#1a1d21', '#2f6fed'],
  },
  {
    id: 'signal',
    name: 'Signal',
    href: './signal.html',
    inspo: 'Typeface Animator · StringTune · Active Theory',
    thesis: 'Typography as the product — kinetic type, scroll-linked drama, sparse chrome.',
    tone: 'Type-first',
    palette: ['#020203', '#f2f2f0', '#ff5a1f'],
  },
  {
    id: 'stage',
    name: 'Stage',
    href: './stage.html',
    inspo: 'Rotato · LS.graphics · ProVisual · Morflax · Spline',
    thesis: 'Device-stage cinema — product mockups as the hero, soft studio light.',
    tone: 'Product-first',
    palette: ['#0e1116', '#9ec5ff', '#f7f8fa'],
  },
  {
    id: 'lattice',
    name: 'Lattice',
    href: './lattice.html',
    inspo: 'Iteration X · Iconsax · UI Guideline · Design Spells',
    thesis: 'Annotated systems grid — hotspots, mono labels, blueprint precision.',
    tone: 'Systems-first',
    palette: ['#e8edf2', '#0b1f33', '#0f7a5f'],
  },
  {
    id: 'hybrid',
    name: 'Hybrid',
    href: './hybrid.html',
    inspo: 'Best-of combination',
    thesis: 'Recommended merge after critique — atmosphere + clarity + product stage.',
    tone: 'Recommended',
    palette: ['#070605', '#e8a15a', '#f6f1ea'],
    featured: true,
  },
]

export default function App() {
  return (
    <div className="hub">
      <header className="hub-hero">
        <p className="hub-kicker">TarsOnlineCafe · Redesign lab</p>
        <h1>Variant review board</h1>
        <p className="hub-lead">
          Same content and wording. Different visual systems drawn from the inspiration stack.
          Open each mockup, compare on mobile and desktop, then use <strong>Hybrid</strong> as the
          recommended ship direction.
        </p>
      </header>

      <div className="hub-grid">
        {variants.map((v) => (
          <a key={v.id} className={`hub-card ${v.featured ? 'is-featured' : ''}`} href={v.href}>
            <div className="hub-card__swatches" aria-hidden="true">
              {v.palette.map((c) => (
                <i key={c} style={{ background: c }} />
              ))}
            </div>
            <div className="hub-card__meta">
              <span>{v.tone}</span>
              {v.featured ? <em>Pick</em> : null}
            </div>
            <h2>{v.name}</h2>
            <p>{v.thesis}</p>
            <small>{v.inspo}</small>
          </a>
        ))}
      </div>

      <footer className="hub-foot">
        <p>Content locked to live-site copy. Production `/` untouched. Mockups under `/redesign/`.</p>
      </footer>
    </div>
  )
}
