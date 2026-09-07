import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import {
  about,
  contact,
  hero,
  marquee,
  nav,
  process,
  proof,
  services,
  site,
  testimonials,
  work,
} from '../../content'
import { VariantChrome } from '../../shared/VariantChrome'
import '../../shared/variant-chrome.css'

const EmberField = lazy(() => import('./EmberField'))

const easeOut = [0.22, 1, 0.36, 1]

function Icon({ name }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }
  if (name === 'route') {
    return (
      <svg {...common}>
        <circle cx="6" cy="19" r="2.2" />
        <circle cx="18" cy="5" r="2.2" />
        <path d="M8 18.2C12 18 14 14 14 10V8.5" />
      </svg>
    )
  }
  if (name === 'shield') {
    return (
      <svg {...common}>
        <path d="M12 3l7 3v5c0 5-3.2 8.2-7 10-3.8-1.8-7-5-7-10V6l7-3z" />
        <path d="M9.5 12.2l1.8 1.8 3.4-3.6" />
      </svg>
    )
  }
  if (name === 'chat') {
    return (
      <svg {...common}>
        <path d="M5 6.5A2.5 2.5 0 017.5 4h9A2.5 2.5 0 0119 6.5v6A2.5 2.5 0 0116.5 15H10l-4 3.2V6.5z" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.4" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.4" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.4" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.4" />
    </svg>
  )
}

function Reveal({ children, delay = 0, className, role }) {
  const reduce = useReducedMotion()
  if (reduce) {
    return (
      <div className={className} role={role}>
        {children}
      </div>
    )
  }
  return (
    <motion.div
      className={className}
      role={role}
      initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.75, ease: easeOut, delay }}
    >
      {children}
    </motion.div>
  )
}

function KineticText({ text, className, as: Tag = 'p', delay = 0 }) {
  const reduce = useReducedMotion()
  // Wrap by camelCase / space units so inline-block letters don't split mid-word
  const words = text.split(/(\s+|(?<=[a-z])(?=[A-Z]))/).filter((w) => w !== '')

  if (reduce) {
    return <Tag className={className}>{text}</Tag>
  }

  let charIndex = 0
  return (
    <Tag className={`${className} kinetic`} aria-label={text}>
      {words.map((word, wi) => {
        if (/^\s+$/.test(word)) {
          charIndex += word.length
          return <span key={`sp-${wi}`}>{'\u00A0'}</span>
        }
        const chars = word.split('')
        const start = charIndex
        charIndex += chars.length
        return (
          <span className="kinetic-word" key={`w-${wi}-${word}`}>
            {chars.map((ch, i) => (
              <motion.span
                key={`${ch}-${start + i}`}
                aria-hidden="true"
                initial={{ opacity: 0, y: '0.55em' }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: easeOut, delay: delay + (start + i) * 0.024 }}
              >
                {ch}
              </motion.span>
            ))}
          </span>
        )
      })}
    </Tag>
  )
}

function Magnetic({ className, href, children, ...rest }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()

  const onMove = (e) => {
    if (reduce || !ref.current || window.matchMedia('(pointer: coarse)').matches) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    ref.current.style.transform = `translate(${x * 0.16}px, ${y * 0.2}px)`
  }

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = 'translate(0, 0)'
  }

  return (
    <a ref={ref} className={className} href={href} onPointerMove={onMove} onPointerLeave={onLeave} {...rest}>
      {children}
    </a>
  )
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.2 })
  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />
}

function PointerGlow() {
  const reduce = useReducedMotion()
  const ref = useRef(null)

  useEffect(() => {
    if (reduce || window.matchMedia('(pointer: coarse)').matches) return undefined
    const el = ref.current
    const onMove = (e) => {
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduce])

  if (reduce) return null
  return <div className="pointer-glow" ref={ref} aria-hidden="true" />
}

function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 18)
      setHidden(y > 140 && y > lastY.current)
      lastY.current = y
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const close = () => setOpen(false)

  const sheet = (
    <AnimatePresence>
      {open && (
        <motion.div
          key="nav-sheet"
          className="nav-sheet"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            className="nav-sheet__panel"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="nav-sheet__handle" aria-hidden="true" />
            {nav.map((item, i) => (
              <motion.a
                key={item.href}
                href={item.href}
                onClick={close}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.04 }}
              >
                {item.label}
              </motion.a>
            ))}
            <a className="btn btn-primary nav-sheet__cta" href="#contact" onClick={close}>
              Start a Project
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <nav
        className={`site-nav ${scrolled ? 'is-scrolled' : ''} ${hidden && !open ? 'is-hidden' : ''}`}
        aria-label="Main navigation"
      >
        <a className="nav-brand" href="#hero" onClick={close}>
          <img src={site.logo} alt="" width={32} height={32} />
          <span>{site.brand}</span>
        </a>
        <ul className="nav-links">
          {nav.map((item) => (
            <li key={item.href}>
              <a href={item.href}>{item.label}</a>
            </li>
          ))}
        </ul>
        <Magnetic className="btn btn-primary nav-cta" href="#contact">
          Let&apos;s Talk
        </Magnetic>
        <button
          className={`nav-toggle ${open ? 'is-open' : ''}`}
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </nav>

      {typeof document !== 'undefined' ? createPortal(sheet, document.body) : null}
    </>
  )
}

function BrandOrb() {
  const reduce = useReducedMotion()
  return (
    <div className="brand-orb" aria-hidden="true">
      <svg className="brand-orb__ring" viewBox="0 0 200 200" style={reduce ? { animation: 'none' } : undefined}>
        <defs>
          <path id="circlePath" d="M 100,100 m -78,0 a 78,78 0 1,1 156,0 a 78,78 0 1,1 -156,0" />
        </defs>
        <text>
          <textPath href="#circlePath">BREW · BUILD · SHIP · TARS ONLINE CAFE · EST 2020 · </textPath>
        </text>
      </svg>
      <div className="brand-orb__core">
        <img src={site.logo} alt="" />
      </div>
    </div>
  )
}

function Hero({ scrollProgress }) {
  const reduce = useReducedMotion()
  return (
    <section id="hero" className="hero">
      <div className="hero__stage">
        <Suspense fallback={<div className="ember-field ember-field--static" aria-hidden="true" />}>
          <EmberField scrollProgress={scrollProgress} />
        </Suspense>
        <div className="hero__aurora" aria-hidden="true" />
        <div className="hero__veil" />
        <BrandOrb />
      </div>

      <div className="hero__content">
        <KineticText className="hero__brand" text={site.brand} delay={0.05} />
        <motion.p
          className="hero__est-pill"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          {site.est}
        </motion.p>
        <motion.h1
          className="hero__headline"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.8, ease: easeOut }}
        >
          {hero.headline}
        </motion.h1>
        <motion.p
          className="hero__body"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7, ease: easeOut }}
        >
          {hero.body}
        </motion.p>
        <motion.div
          className="hero__ctas"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.65, ease: easeOut }}
        >
          <Magnetic className="btn btn-primary" href={hero.primaryCta.href}>
            {hero.primaryCta.label}
          </Magnetic>
          <Magnetic className="btn btn-ghost" href={hero.secondaryCta.href}>
            {hero.secondaryCta.label}
          </Magnetic>
        </motion.div>
        <p className="hero__meta">
          {site.founder} · {site.location} · {site.tagline}
        </p>
      </div>

      <a className="scroll-cue" href="#proof" aria-label="Scroll to content">
        <span />
      </a>
    </section>
  )
}

function Marquee() {
  const items = [...marquee, ...marquee]
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {items.map((item, i) => (
          <span key={`${item}-${i}`}>{item}</span>
        ))}
      </div>
    </div>
  )
}

function Proof() {
  return (
    <section id="proof" className="proof">
      <div className="section-shell">
        <Reveal>
          <p className="eyebrow">{proof.eyebrow}</p>
          <h2 className="section-title">{proof.title}</h2>
          <p className="section-lead">{proof.lead}</p>
        </Reveal>
        <div className="proof-grid">
          {proof.items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.06} className="proof-card">
              <div className="proof-card__icon">
                <Icon name={item.icon} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function About() {
  return (
    <section id="about" className="about">
      <div className="section-shell">
        <Reveal>
          <p className="eyebrow">{about.eyebrow}</p>
          <h2 className="section-title">{about.title}</h2>
          <p className="section-lead">{about.lead}</p>
        </Reveal>
        <div className="about-grid">
          <Reveal className="terminal">
            <div className="terminal__dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <pre className="terminal__cmd">$ cat about_josh.txt</pre>
            <pre>{about.terminal.join('\n')}</pre>
          </Reveal>
          <Reveal delay={0.08} className="about-story">
            <h3>{about.storyTitle}</h3>
            {about.story.map((p) => (
              <p key={p.slice(0, 28)}>{p}</p>
            ))}
            <ul className="pill-row">
              {about.pills.map((pill) => (
                <li key={pill}>{pill}</li>
              ))}
            </ul>
            <div className="stack-row">
              {about.stack.map((tech) => (
                <span key={tech}>{tech}</span>
              ))}
            </div>
            <div className="about-social">
              <a href={site.social.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                GitHub
              </a>
              <a href={site.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                LinkedIn
              </a>
            </div>
            <aside className="recruiter-card">
              <p className="eyebrow">{about.recruiter.title}</p>
              <p>{about.recruiter.hint}</p>
              <div className="recruiter-links">
                <a href={site.social.github} target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
                <a href={site.social.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
                <a href={site.social.blog}>Blog</a>
              </div>
            </aside>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function Services() {
  return (
    <section id="services" className="services">
      <div className="section-shell">
        <Reveal>
          <p className="eyebrow">{services.eyebrow}</p>
          <h2 className="section-title">{services.title}</h2>
          <p className="section-lead">{services.subtitle}</p>
        </Reveal>
        <div className="services-layout">
          <Reveal className="services-intro">
            <p>{services.intro}</p>
            <a href="#contact">Discuss your project →</a>
          </Reveal>
          <div className="service-list" role="list">
            {services.items.map((item, i) => (
              <Reveal key={item.num} delay={i * 0.07} className="service-item" role="listitem">
                <span className="service-num">{item.num}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Work() {
  const project = work.project
  const [activeSpot, setActiveSpot] = useState(0)

  return (
    <section id="work" className="work">
      <div className="section-shell">
        <Reveal>
          <p className="eyebrow">{work.eyebrow}</p>
          <h2 className="section-title">{work.title}</h2>
          <p className="section-lead">{work.subtitle}</p>
        </Reveal>

        <div className="work-stage">
          <Reveal className="work-copy">
            <div className="work-kicker">
              <span className="live-badge">{project.badge}</span>
              <span>{project.meta}</span>
            </div>
            <h3>{project.name}</h3>
            <p className="work-url">
              <a href={project.url} target="_blank" rel="noopener noreferrer">
                {project.urlLabel}
              </a>
            </p>
            <p className="work-tagline">{project.tagline}</p>
            <ul className="work-highlights">
              {project.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <div className="work-metrics">
              {project.metrics.map((m) => (
                <div key={m.label}>
                  <strong>{m.value}</strong>
                  <span>{m.label}</span>
                </div>
              ))}
            </div>
            <div className="work-stack">
              {project.stack.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
            <div className="work-actions">
              <Magnetic className="btn btn-primary" href={project.url} target="_blank" rel="noopener noreferrer">
                Visit live site
              </Magnetic>
              <Magnetic className="btn btn-ghost" href="#contact">
                Build something similar
              </Magnetic>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="work-visual">
            <div className="device-frame">
              <div className="device-frame__chrome" aria-hidden="true">
                <i />
                <i />
                <i />
                <span>{project.urlLabel}</span>
              </div>
              <div className="device-frame__screen">
                <div className="device-frame__demo" aria-hidden="true">
                  <strong>
                    solve my<span>PROBLEM</span>
                  </strong>
                  <p>Email marketing &amp; lead generation for growing businesses</p>
                  <em>Get a Free Quote</em>
                </div>
                {project.hotspots.map((spot, i) => (
                  <button
                    key={spot.label}
                    type="button"
                    className={`hotspot hotspot--${i} ${activeSpot === i ? 'is-active' : ''}`}
                    onClick={() => setActiveSpot(i)}
                    aria-label={spot.label}
                    aria-pressed={activeSpot === i}
                  >
                    <span />
                  </button>
                ))}
              </div>
            </div>
            <div className="hotspot-card" aria-live="polite">
              <p className="eyebrow">{project.hotspots[activeSpot].label}</p>
              <p>{project.hotspots[activeSpot].detail}</p>
            </div>
            <aside className="work-aside">
              <p className="eyebrow">Why this matters</p>
              <p>{project.aside}</p>
            </aside>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function Process() {
  return (
    <section id="process" className="process">
      <div className="section-shell">
        <Reveal>
          <h2 className="section-title">{process.title}</h2>
          <p className="section-lead">{process.subtitle}</p>
        </Reveal>
        <div className="process-rail">
          {process.steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.08} className="process-card">
              <div className="process-card__num">{String(i + 1).padStart(2, '0')}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  return (
    <section id="testimonials" className="testimonials">
      <div className="section-shell">
        <Reveal>
          <h2 className="section-title">{testimonials.title}</h2>
        </Reveal>
        <div className="testimonial-rail">
          {testimonials.items.map((item, i) => (
            <Reveal key={item.name} delay={i * 0.07} className="testimonial-card">
              <p>“{item.quote}”</p>
              <footer>
                <div className="avatar" aria-hidden="true">
                  {item.initials}
                </div>
                <div>
                  <cite>{item.name}</cite>
                  <span>{item.role}</span>
                </div>
                <a href={item.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${item.name} on LinkedIn`}>
                  in
                </a>
              </footer>
              <div className="verified">✓ {item.verified}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Contact() {
  const [sent, setSent] = useState(false)

  return (
    <section id="contact" className="contact">
      <div className="section-shell">
        <Reveal>
          <h2 className="section-title">{contact.title}</h2>
          <p className="section-lead">{contact.subtitle}</p>
        </Reveal>
        <Reveal className="contact-panel">
          {sent ? (
            <div className="contact-success" aria-live="polite">
              <h3>Got it</h3>
              <p>I&apos;ll be back within 24 hours.</p>
              <button className="btn btn-ghost" type="button" onClick={() => setSent(false)}>
                Send another message
              </button>
            </div>
          ) : (
            <form
              className="contact-form"
              onSubmit={(e) => {
                e.preventDefault()
                setSent(true)
              }}
            >
              <div className="contact-row">
                <label className="field">
                  <span>Name *</span>
                  <input name="name" required autoComplete="name" placeholder="Your name" />
                </label>
                <label className="field">
                  <span>Company</span>
                  <input name="company" autoComplete="organization" placeholder="Optional" />
                </label>
              </div>
              <label className="field">
                <span>Email *</span>
                <input name="email" type="email" required autoComplete="email" placeholder="you@company.com" />
              </label>
              <label className="field">
                <span>Project type *</span>
                <select name="project_type" required defaultValue="">
                  <option value="" disabled>
                    Select a category…
                  </option>
                  {contact.types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Tell me about it *</span>
                <textarea name="message" rows={5} required placeholder="Describe the problem you’re trying to solve…" />
              </label>
              <p className="contact-note">Mockup form — local-only for this redesign preview.</p>
              <button className="btn btn-primary" type="submit">
                Send message
              </button>
            </form>
          )}
        </Reveal>
        <div className="coffee-support">
          <p>{contact.coffeeText}</p>
          <a className="btn btn-ghost" href={site.social.coffee} target="_blank" rel="noopener noreferrer">
            Buy me a coffee
          </a>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="section-shell footer-inner">
        <div className="footer-brand">{site.brand}</div>
        <div className="footer-links">
          <a href={site.social.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href={site.social.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a href={site.social.blog}>Blog</a>
        </div>
        <p className="footer-copy">© 2020–2026 {site.brand}. All rights reserved.</p>
      </div>
    </footer>
  )
}


export default function App() {
  const { scrollYProgress } = useScroll()

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <VariantChrome id="hybrid" name="Hybrid" />
      <div className="hybrid-pick" role="note">Recommended combo · Ember atmosphere + Stage device craft + Frost mobile UX</div>
      <ScrollProgress />
      <PointerGlow />
      <div className="noise-layer" aria-hidden="true" />
      <div className="app-shell">
        <Nav />
        <main id="main">
          <Hero scrollProgress={scrollYProgress} />
          <Marquee />
          <Proof />
          <About />
          <Services />
          <Work />
          <Process />
          <Testimonials />
          <Contact />
        </main>
        <Footer />
      </div>
<div className="mockup-banner">Redesign mockup · leveled UI</div>
    </>
  )
}
