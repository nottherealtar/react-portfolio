import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
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
} from './content'

const EmberField = lazy(() => import('./EmberField'))

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
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
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.22 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

function PointerGlow() {
  const reduce = useReducedMotion()
  const ref = useRef(null)

  useEffect(() => {
    if (reduce) return undefined
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

function Magnetic({ className, href, children, ...rest }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()

  const onMove = (e) => {
    if (reduce || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    ref.current.style.transform = `translate(${x * 0.18}px, ${y * 0.22}px)`
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

function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
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

  return (
    <>
      <nav className={`site-nav ${scrolled ? 'is-scrolled' : ''}`} aria-label="Main navigation">
        <a className="nav-brand" href="#hero" onClick={close}>
          <img src={site.logo} alt="" width={34} height={34} />
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
          Let&apos;s Talk →
        </Magnetic>
        <button
          className="nav-toggle"
          type="button"
          aria-label="Toggle mobile menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            className="nav-mobile"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {nav.map((item) => (
              <a key={item.href} href={item.href} onClick={close}>
                {item.label}
              </a>
            ))}
            <a className="btn btn-primary" href="#contact" onClick={close}>
              Let&apos;s Talk →
            </a>
          </motion.div>
        )}
      </AnimatePresence>
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
          <textPath href="#circlePath">TARS ONLINE CAFE · EST 2020 · TARS ONLINE CAFE · EST 2020 ·</textPath>
        </text>
      </svg>
      <div className="brand-orb__core">
        <img src={site.logo} alt="" />
      </div>
    </div>
  )
}

function Hero() {
  const reduce = useReducedMotion()
  return (
    <section id="hero" className="hero">
      <div className="hero__stage">
        <Suspense fallback={null}>
          <EmberField />
        </Suspense>
        <div className="hero__veil" />
        <BrandOrb />
      </div>

      <div className="hero__content">
        <motion.p
          className="hero__brand"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {site.brand}
          <span>{site.est}</span>
        </motion.p>
        <motion.h1
          className="hero__headline"
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          {hero.headline}
        </motion.h1>
        <motion.p
          className="hero__body"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          {hero.body}
        </motion.p>
        <motion.div
          className="hero__ctas"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          <Magnetic className="btn btn-primary" href={hero.primaryCta.href}>
            {hero.primaryCta.label}
          </Magnetic>
          <Magnetic className="btn btn-ghost" href={hero.secondaryCta.href}>
            {hero.secondaryCta.label} →
          </Magnetic>
        </motion.div>
        <p className="hero__est">
          {site.founder} · {site.location} · {site.tagline}
        </p>
      </div>
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
    <section className="proof" aria-labelledby="proof-title">
      <div className="section-shell">
        <Reveal>
          <p className="eyebrow">{proof.eyebrow}</p>
          <h2 id="proof-title" className="section-title">
            {proof.title}
          </h2>
          <p className="section-lead">{proof.lead}</p>
        </Reveal>
        <div className="proof-grid">
          {proof.items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.06} className="proof-item glass-panel">
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
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
            <ul className="pill-row" aria-label="What you can expect">
              {about.pills.map((pill) => (
                <li key={pill}>{pill}</li>
              ))}
            </ul>
            <div className="stack-row" aria-label="Core technologies">
              {about.stack.map((tech) => (
                <span key={tech}>▸ {tech}</span>
              ))}
            </div>
            <div className="about-social">
              <a href={site.social.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                GH
              </a>
              <a href={site.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                in
              </a>
            </div>
            <aside className="recruiter-panel glass-panel" aria-label="For recruiters">
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
            <a href="#contact">
              Discuss your project <span aria-hidden="true">→</span>
            </a>
          </Reveal>
          <div className="service-list" role="list">
            {services.items.map((item, i) => (
              <Reveal key={item.num} delay={i * 0.07} className="service-item glass-panel" role="listitem">
                <span className="service-num" aria-hidden="true">
                  {item.num}
                </span>
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
  return (
    <section id="work" className="work">
      <div className="section-shell">
        <Reveal>
          <p className="eyebrow">{work.eyebrow}</p>
          <h2 className="section-title">{work.title}</h2>
          <p className="section-lead">{work.subtitle}</p>
        </Reveal>

        <div className="work-feature">
          <Reveal>
            <div className="work-kicker">
              <span className="live-badge">{project.badge}</span>
              <span className="work-meta">{project.meta}</span>
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
            <div className="work-metrics" aria-label="Site highlights">
              {project.metrics.map((m) => (
                <div className="work-metric" key={m.label}>
                  <strong>{m.value}</strong>
                  <span>{m.label}</span>
                </div>
              ))}
            </div>
            <div className="work-stack" aria-label="Focus areas">
              {project.stack.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
            <div className="work-actions">
              <Magnetic className="btn btn-primary" href={project.url} target="_blank" rel="noopener noreferrer">
                Visit live site ↗
              </Magnetic>
              <Magnetic className="btn btn-ghost" href="#contact">
                Build something similar
              </Magnetic>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="browser-frame" aria-hidden="true">
              <div className="browser-chrome">
                <i />
                <i />
                <i />
                <div className="browser-url">{project.urlLabel}</div>
              </div>
              <div className="browser-preview">
                <strong>
                  solve my<span>PROBLEM</span>
                </strong>
                <p>Email marketing &amp; lead generation for growing businesses</p>
                <em>Get a Free Quote</em>
              </div>
            </div>
            <aside className="work-aside glass-panel">
              <p className="label">Why this matters</p>
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
        <div className="process-track">
          {process.steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.08} className="process-step glass-panel">
              <div className="process-node" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
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
        <div className="testimonial-grid">
          {testimonials.items.map((item, i) => (
            <Reveal key={item.name} delay={i * 0.07}>
              <blockquote className="testimonial glass-panel">
                <p>“{item.quote}”</p>
                <footer>
                  <div className="avatar" aria-hidden="true">
                    {item.initials}
                  </div>
                  <div>
                    <cite>{item.name}</cite>
                    <div className="role">{item.role}</div>
                  </div>
                  <a href={item.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${item.name} on LinkedIn`}>
                    in
                  </a>
                </footer>
                <div className="verified">✓ {item.verified}</div>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Contact() {
  const [sent, setSent] = useState(false)

  const onSubmit = (event) => {
    event.preventDefault()
    setSent(true)
  }

  return (
    <section id="contact" className="contact">
      <div className="section-shell">
        <Reveal>
          <h2 className="section-title">{contact.title}</h2>
          <p className="section-lead">{contact.subtitle}</p>
        </Reveal>

        <Reveal className="contact-panel glass-panel">
          {sent ? (
            <div aria-live="polite">
              <h3 className="section-title" style={{ fontSize: '1.8rem' }}>
                Got it!
              </h3>
              <p className="section-lead">I&apos;ll be back within 24 hours.</p>
              <button className="btn btn-ghost" type="button" onClick={() => setSent(false)} style={{ marginTop: '1.25rem' }}>
                Send another message
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={onSubmit}>
              <div className="contact-row">
                <div className="field">
                  <label htmlFor="cf-name">Name *</label>
                  <input id="cf-name" name="name" required autoComplete="name" placeholder="Your name" />
                </div>
                <div className="field">
                  <label htmlFor="cf-company">Company (optional)</label>
                  <input id="cf-company" name="company" autoComplete="organization" placeholder="Your company" />
                </div>
              </div>
              <div className="field">
                <label htmlFor="cf-email">Email *</label>
                <input id="cf-email" name="email" type="email" required autoComplete="email" placeholder="you@company.com" />
              </div>
              <div className="field">
                <label htmlFor="cf-type">Type of project *</label>
                <select id="cf-type" name="project_type" required defaultValue="">
                  <option value="" disabled>
                    Select a category…
                  </option>
                  {contact.types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="cf-message">Tell me about it *</label>
                <textarea
                  id="cf-message"
                  name="message"
                  rows={5}
                  required
                  placeholder="Describe the problem you're trying to solve…"
                />
              </div>
              <p className="contact-note">Mockup form — submission is local-only for this redesign preview.</p>
              <button className="btn btn-primary" type="submit">
                Send it
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
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <PointerGlow />
      <div className="app-shell">
        <Nav />
        <main id="main">
          <Hero />
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
      <div className="mockup-banner">Redesign mockup · WebGL</div>
    </>
  )
}
