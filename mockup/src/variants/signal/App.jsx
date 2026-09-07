import { useEffect, useRef, useState } from 'react'
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

const easeOut = [0.16, 1, 0.3, 1]

function Icon({ name }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
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
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.2" />
    </svg>
  )
}

function CharReveal({ text, className, as: Tag = 'p', delay = 0, stagger = 0.028 }) {
  const reduce = useReducedMotion()
  const words = text.split(/(\s+)/).filter((w) => w !== '')

  if (reduce) {
    return <Tag className={className}>{text}</Tag>
  }

  let charIndex = 0
  return (
    <Tag className={`${className} char-reveal`} aria-label={text}>
      {words.map((word, wi) => {
        if (/^\s+$/.test(word)) {
          charIndex += word.length
          return <span key={`sp-${wi}`}>{'\u00A0'}</span>
        }
        const chars = word.split('')
        const start = charIndex
        charIndex += chars.length
        return (
          <span className="char-reveal__word" key={`w-${wi}-${word}`}>
            {chars.map((ch, i) => (
              <motion.span
                key={`${ch}-${start + i}`}
                aria-hidden="true"
                initial={{ opacity: 0, y: '0.7em', rotateX: -70 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.55, ease: easeOut, delay: delay + (start + i) * stagger }}
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

function WordReveal({ text, className, as: Tag = 'h2', delay = 0 }) {
  const reduce = useReducedMotion()
  const words = text.split(' ')

  if (reduce) {
    return <Tag className={className}>{text}</Tag>
  }

  return (
    <Tag className={`${className} word-reveal`} aria-label={text}>
      {words.map((word, i) => (
        <span className="word-reveal__word" key={`${word}-${i}`}>
          <motion.span
            aria-hidden="true"
            initial={{ opacity: 0, y: '110%' }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: easeOut, delay: delay + i * 0.05 }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

function ScrollTitle({ children, className = '' }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.55, 0.85], [0.15, 1, 1, 0.35])
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.92, 1, 1, 0.96])
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [40, 0, -20])

  if (reduce) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    )
  }

  return (
    <motion.div ref={ref} className={className} style={{ opacity, scale, y }}>
      {children}
    </motion.div>
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
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.7, ease: easeOut, delay }}
    >
      {children}
    </motion.div>
  )
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.18 })
  return <motion.div className="sig-progress" style={{ scaleX }} aria-hidden="true" />
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

  const sheet = (
    <AnimatePresence>
      {open && (
        <motion.div
          key="sig-sheet"
          className="sig-sheet"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            className="sig-sheet__panel"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 38 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sig-sheet__handle" aria-hidden="true" />
            <p className="sig-sheet__label">Broadcast menu</p>
            {nav.map((item, i) => (
              <motion.a
                key={item.href}
                href={item.href}
                onClick={close}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.06 + i * 0.05 }}
              >
                <span>{String(i + 1).padStart(2, '0')}</span>
                {item.label}
              </motion.a>
            ))}
            <a className="sig-btn sig-btn--fill sig-sheet__cta" href="#contact" onClick={close}>
              Start a Project
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <header className={`sig-nav ${scrolled ? 'is-scrolled' : ''}`}>
        <a className="sig-nav__brand" href="#hero" onClick={close}>
          <span className="sig-nav__pulse" aria-hidden="true" />
          <span>{site.brand}</span>
        </a>
        <ul className="sig-nav__links">
          {nav.map((item) => (
            <li key={item.href}>
              <a href={item.href}>{item.label}</a>
            </li>
          ))}
        </ul>
        <a className="sig-btn sig-btn--ghost sig-nav__cta" href="#contact">
          Let&apos;s Talk
        </a>
        <button
          className={`sig-nav__toggle ${open ? 'is-open' : ''}`}
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </header>
      {typeof document !== 'undefined' ? createPortal(sheet, document.body) : null}
    </>
  )
}

function Hero() {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const brandY = useTransform(scrollYProgress, [0, 1], [0, -120])
  const brandOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.15])
  const lineScale = useTransform(scrollYProgress, [0, 1], [1, 1.35])

  return (
    <section id="hero" className="sig-hero" ref={ref}>
      <div className="sig-hero__grid" aria-hidden="true" />
      <div className="sig-hero__scan" aria-hidden="true" />

      <motion.div
        className="sig-hero__brand-plane"
        style={reduce ? undefined : { y: brandY, opacity: brandOpacity }}
      >
        <CharReveal className="sig-hero__brand" text={site.brand} delay={0.04} stagger={0.032} as="h1" />
        <motion.div
          className="sig-hero__signal-line"
          style={reduce ? undefined : { scaleX: lineScale }}
          initial={reduce ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.55, duration: 0.9, ease: easeOut }}
          aria-hidden="true"
        />
      </motion.div>

      <div className="sig-hero__copy">
        <motion.p
          className="sig-hero__live"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="sig-hero__live-dot" />
          ON AIR · {site.est} · {site.location}
        </motion.p>
        <CharReveal className="sig-hero__headline" text={hero.headline} delay={0.35} stagger={0.018} as="p" />
        <motion.p
          className="sig-hero__body"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.65, ease: easeOut }}
        >
          {hero.body}
        </motion.p>
        <motion.div
          className="sig-hero__ctas"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6, ease: easeOut }}
        >
          <a className="sig-btn sig-btn--fill" href={hero.primaryCta.href}>
            {hero.primaryCta.label}
          </a>
          <a className="sig-btn sig-btn--ghost" href={hero.secondaryCta.href}>
            {hero.secondaryCta.label}
          </a>
        </motion.div>
        <p className="sig-hero__meta">
          {site.founder} · {site.tagline}
        </p>
      </div>

      <a className="sig-scroll-cue" href="#proof" aria-label="Scroll to content">
        <span>SCROLL</span>
        <i />
      </a>
    </section>
  )
}

function Marquee() {
  const items = [...marquee, ...marquee, ...marquee]
  return (
    <div className="sig-marquee" aria-hidden="true">
      <div className="sig-marquee__row sig-marquee__row--a">
        <div className="sig-marquee__track">
          {items.map((item, i) => (
            <span key={`a-${item}-${i}`}>
              {item}
              <em>/</em>
            </span>
          ))}
        </div>
      </div>
      <div className="sig-marquee__row sig-marquee__row--b">
        <div className="sig-marquee__track">
          {items.map((item, i) => (
            <span key={`b-${item}-${i}`}>
              {item}
              <em>/</em>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function Proof() {
  return (
    <section id="proof" className="sig-proof">
      <div className="sig-shell">
        <ScrollTitle className="sig-section-head">
          <p className="sig-eyebrow">{proof.eyebrow}</p>
          <WordReveal className="sig-display" text={proof.title} />
          <p className="sig-lead">{proof.lead}</p>
        </ScrollTitle>
        <div className="sig-proof__grid">
          {proof.items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.07} className={`sig-proof__item sig-proof__item--${i}`}>
              <div className="sig-proof__icon">
                <Icon name={item.icon} />
              </div>
              <span className="sig-proof__idx">{String(i + 1).padStart(2, '0')}</span>
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
    <section id="about" className="sig-about">
      <div className="sig-shell">
        <ScrollTitle className="sig-section-head sig-section-head--offset">
          <p className="sig-eyebrow">{about.eyebrow}</p>
          <WordReveal className="sig-display" text={about.title} />
          <p className="sig-lead">{about.lead}</p>
        </ScrollTitle>

        <div className="sig-about__planes">
          <Reveal className="sig-terminal">
            <div className="sig-terminal__bar">
              <span>SIGNAL // ABOUT</span>
              <span>FREQ 01</span>
            </div>
            <pre className="sig-terminal__cmd">$ cat about_josh.txt</pre>
            <pre>{about.terminal.join('\n')}</pre>
          </Reveal>

          <Reveal delay={0.1} className="sig-about__story">
            <h3>{about.storyTitle}</h3>
            {about.story.map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
            <ul className="sig-pills">
              {about.pills.map((pill) => (
                <li key={pill}>{pill}</li>
              ))}
            </ul>
            <div className="sig-stack">
              {about.stack.map((tech) => (
                <span key={tech}>{tech}</span>
              ))}
            </div>
            <div className="sig-social">
              <a href={site.social.github} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              <a href={site.social.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            </div>
            <aside className="sig-recruiter">
              <p className="sig-eyebrow">{about.recruiter.title}</p>
              <p>{about.recruiter.hint}</p>
              <div className="sig-social">
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
    <section id="services" className="sig-services">
      <div className="sig-shell">
        <ScrollTitle className="sig-section-head">
          <p className="sig-eyebrow">{services.eyebrow}</p>
          <WordReveal className="sig-display" text={services.title} />
          <p className="sig-lead">{services.subtitle}</p>
        </ScrollTitle>

        <div className="sig-services__layout">
          <Reveal className="sig-services__intro">
            <p>{services.intro}</p>
            <a href="#contact">Discuss your project →</a>
          </Reveal>

          <div className="sig-services__list" role="list">
            {services.items.map((item, i) => (
              <Reveal key={item.num} delay={i * 0.08} className="sig-service" role="listitem">
                <span className="sig-service__num" aria-hidden="true">
                  {item.num}
                </span>
                <div className="sig-service__copy">
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
    <section id="work" className="sig-work">
      <div className="sig-shell">
        <ScrollTitle className="sig-section-head">
          <p className="sig-eyebrow">{work.eyebrow}</p>
          <WordReveal className="sig-display" text={work.title} />
          <p className="sig-lead">{work.subtitle}</p>
        </ScrollTitle>

        <div className="sig-work__stage">
          <Reveal className="sig-work__copy">
            <div className="sig-work__kicker">
              <span className="sig-live">{project.badge}</span>
              <span>{project.meta}</span>
            </div>
            <h3 className="sig-work__name">{project.name}</h3>
            <p className="sig-work__url">
              <a href={project.url} target="_blank" rel="noopener noreferrer">
                {project.urlLabel}
              </a>
            </p>
            <p className="sig-work__tagline">{project.tagline}</p>
            <ul className="sig-work__highlights">
              {project.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <div className="sig-work__metrics">
              {project.metrics.map((m) => (
                <div key={m.label}>
                  <strong>{m.value}</strong>
                  <span>{m.label}</span>
                </div>
              ))}
            </div>
            <div className="sig-stack">
              {project.stack.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
            <div className="sig-work__actions">
              <a className="sig-btn sig-btn--fill" href={project.url} target="_blank" rel="noopener noreferrer">
                Visit live site
              </a>
              <a className="sig-btn sig-btn--ghost" href="#contact">
                Build something similar
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="sig-work__visual">
            <div className="sig-frame">
              <div className="sig-frame__chrome" aria-hidden="true">
                <i />
                <i />
                <i />
                <span>{project.urlLabel}</span>
              </div>
              <div className="sig-frame__screen">
                <div className="sig-frame__demo" aria-hidden="true">
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
                    className={`sig-hotspot sig-hotspot--${i} ${activeSpot === i ? 'is-active' : ''}`}
                    onClick={() => setActiveSpot(i)}
                    aria-label={spot.label}
                    aria-pressed={activeSpot === i}
                  >
                    <span />
                  </button>
                ))}
              </div>
            </div>
            <div className="sig-hotspot-card" aria-live="polite">
              <p className="sig-eyebrow">{project.hotspots[activeSpot].label}</p>
              <p>{project.hotspots[activeSpot].detail}</p>
            </div>
            <aside className="sig-work__aside">
              <p className="sig-eyebrow">Why this matters</p>
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
    <section id="process" className="sig-process">
      <div className="sig-shell">
        <ScrollTitle className="sig-section-head">
          <WordReveal className="sig-display" text={process.title} />
          <p className="sig-lead">{process.subtitle}</p>
        </ScrollTitle>
        <div className="sig-process__rail">
          {process.steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.09} className={`sig-process__step sig-process__step--${i}`}>
              <div className="sig-process__num">{String(i + 1).padStart(2, '0')}</div>
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
    <section id="testimonials" className="sig-testimonials">
      <div className="sig-shell">
        <ScrollTitle className="sig-section-head">
          <WordReveal className="sig-display" text={testimonials.title} />
        </ScrollTitle>
        <div className="sig-testimonial__rail">
          {testimonials.items.map((item, i) => (
            <Reveal key={item.name} delay={i * 0.08} className="sig-quote">
              <p className="sig-quote__text">“{item.quote}”</p>
              <footer>
                <div className="sig-quote__avatar" aria-hidden="true">
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
              <div className="sig-quote__verified">✓ {item.verified}</div>
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
    <section id="contact" className="sig-contact">
      <div className="sig-shell">
        <ScrollTitle className="sig-section-head">
          <WordReveal className="sig-display" text={contact.title} />
          <p className="sig-lead">{contact.subtitle}</p>
        </ScrollTitle>

        <Reveal className="sig-contact__panel">
          {sent ? (
            <div className="sig-contact__success" aria-live="polite">
              <h3>Got it</h3>
              <p>I&apos;ll be back within 24 hours.</p>
              <button className="sig-btn sig-btn--ghost" type="button" onClick={() => setSent(false)}>
                Send another message
              </button>
            </div>
          ) : (
            <form
              className="sig-form"
              onSubmit={(e) => {
                e.preventDefault()
                setSent(true)
              }}
            >
              <div className="sig-form__row">
                <label className="sig-field">
                  <span>Name *</span>
                  <input name="name" required autoComplete="name" placeholder="Your name" />
                </label>
                <label className="sig-field">
                  <span>Company</span>
                  <input name="company" autoComplete="organization" placeholder="Optional" />
                </label>
              </div>
              <label className="sig-field">
                <span>Email *</span>
                <input name="email" type="email" required autoComplete="email" placeholder="you@company.com" />
              </label>
              <label className="sig-field">
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
              <label className="sig-field">
                <span>Tell me about it *</span>
                <textarea name="message" rows={5} required placeholder="Describe the problem you’re trying to solve…" />
              </label>
              <p className="sig-form__note">Mockup form — local-only for this redesign preview.</p>
              <button className="sig-btn sig-btn--fill" type="submit">
                Send message
              </button>
            </form>
          )}
        </Reveal>

        <div className="sig-coffee">
          <p>{contact.coffeeText}</p>
          <a className="sig-btn sig-btn--ghost" href={site.social.coffee} target="_blank" rel="noopener noreferrer">
            Buy me a coffee
          </a>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="sig-footer">
      <div className="sig-shell sig-footer__inner">
        <div className="sig-footer__brand">{site.brand}</div>
        <div className="sig-footer__links">
          <a href={site.social.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href={site.social.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a href={site.social.blog}>Blog</a>
        </div>
        <p className="sig-footer__copy">© 2020–2026 {site.brand}. All rights reserved.</p>
      </div>
    </footer>
  )
}


export default function App() {
  return (
    <>
      <a className="sig-skip" href="#main">
        Skip to content
      </a>
      <VariantChrome id="signal" name="Signal" />
      <ScrollProgress />
      <div className="sig-noise" aria-hidden="true" />
      <div className="sig-app">
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
<div className="sig-banner">Signal · typography broadcast</div>
    </>
  )
}
