import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
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

const easeOut = [0.22, 1, 0.36, 1]

function Icon({ name, size = 22 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }
  if (name === 'route') {
    return (
      <svg {...common}>
        <circle cx="6" cy="19" r="2" />
        <circle cx="18" cy="5" r="2" />
        <path d="M8 18.2C11.5 18 14 14.2 14 10.2V8.2" />
        <path d="M14 8.2h2.5" />
      </svg>
    )
  }
  if (name === 'shield') {
    return (
      <svg {...common}>
        <path d="M12 3.2l7 2.8v5.2c0 4.8-3.1 7.9-7 9.6-3.9-1.7-7-4.8-7-9.6V6l7-2.8z" />
        <path d="M9.4 12.1l1.8 1.8 3.5-3.7" />
      </svg>
    )
  }
  if (name === 'chat') {
    return (
      <svg {...common}>
        <path d="M5.2 7A2.8 2.8 0 018 4.2h8A2.8 2.8 0 0118.8 7v5.2A2.8 2.8 0 0116 15H10.2L6 18.2V7z" />
        <path d="M9 9.2h6M9 12h3.5" />
      </svg>
    )
  }
  if (name === 'layers') {
    return (
      <svg {...common}>
        <path d="M12 3.5l8 4.2-8 4.2-8-4.2 8-4.2z" />
        <path d="M4 12.2l8 4.2 8-4.2" />
        <path d="M4 16.2l8 4.2 8-4.2" />
      </svg>
    )
  }
  if (name === 'arrow') {
    return (
      <svg {...common}>
        <path d="M5 12h14" />
        <path d="M13 6l6 6-6 6" />
      </svg>
    )
  }
  if (name === 'menu') {
    return (
      <svg {...common}>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    )
  }
  if (name === 'close') {
    return (
      <svg {...common}>
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    )
  }
  if (name === 'external') {
    return (
      <svg {...common}>
        <path d="M10 5H5.5A1.5 1.5 0 004 6.5v12A1.5 1.5 0 005.5 20h12a1.5 1.5 0 001.5-1.5V14" />
        <path d="M14 4h6v6" />
        <path d="M20 4l-9 9" />
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

function Reveal({ children, delay = 0, className, y = 18 }) {
  const reduce = useReducedMotion()
  if (reduce) {
    return <div className={className}>{children}</div>
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.55, ease: easeOut, delay }}
    >
      {children}
    </motion.div>
  )
}

function MonoLabel({ children, className = '' }) {
  return <span className={`mono-label ${className}`}>{children}</span>
}

function Callout({ n, children, className = '' }) {
  return (
    <span className={`callout ${className}`}>
      <span className="callout__n" aria-hidden="true">
        {String(n).padStart(2, '0')}
      </span>
      <span className="callout__t">{children}</span>
    </span>
  )
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.2 })
  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />
}

function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)
  const reduce = useReducedMotion()

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 12)
      setHidden(y > 160 && y > lastY.current)
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
          transition={{ duration: reduce ? 0 : 0.2 }}
          onClick={close}
        >
          <motion.div
            className="nav-sheet__panel"
            initial={reduce ? false : { y: '100%' }}
            animate={{ y: 0 }}
            exit={reduce ? undefined : { y: '100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 38 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="nav-sheet__handle" aria-hidden="true" />
            <MonoLabel className="nav-sheet__label">NAV / INDEX</MonoLabel>
            {nav.map((item, i) => (
              <a key={item.href} href={item.href} onClick={close} className="nav-sheet__link">
                <span className="nav-sheet__idx">{String(i + 1).padStart(2, '0')}</span>
                {item.label}
              </a>
            ))}
            <a className="btn btn-primary nav-sheet__cta" href="#contact" onClick={close}>
              {hero.secondaryCta.label}
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
          <img src={site.logo} alt="" width={28} height={28} />
          <span>{site.brand}</span>
        </a>
        <ul className="nav-links">
          {nav.map((item) => (
            <li key={item.href}>
              <a href={item.href}>{item.label}</a>
            </li>
          ))}
        </ul>
        <a className="btn btn-primary nav-cta" href="#contact">
          {hero.secondaryCta.label}
        </a>
        <button
          className={`nav-toggle ${open ? 'is-open' : ''}`}
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? 'close' : 'menu'} size={20} />
        </button>
      </nav>
      {typeof document !== 'undefined' ? createPortal(sheet, document.body) : null}
    </>
  )
}

function HeroDiagram() {
  return (
    <div className="hero-diagram" aria-hidden="true">
      <div className="hero-diagram__frame">
        <div className="hero-diagram__header">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
          <MonoLabel>SYS / AUTOMATION.MAP</MonoLabel>
        </div>
        <div className="hero-diagram__body">
          <div className="hero-diagram__node hero-diagram__node--a">
            <Icon name="layers" size={18} />
            <span>CRM</span>
          </div>
          <div className="hero-diagram__node hero-diagram__node--b">
            <Icon name="route" size={18} />
            <span>Logic</span>
          </div>
          <div className="hero-diagram__node hero-diagram__node--c">
            <Icon name="shield" size={18} />
            <span>Ops</span>
          </div>
          <svg className="hero-diagram__wires" viewBox="0 0 320 220" preserveAspectRatio="none">
            <path d="M70 70 C120 70, 140 110, 160 110" />
            <path d="M250 70 C200 70, 180 110, 160 110" />
            <path d="M160 110 C160 150, 160 160, 160 180" />
          </svg>
          <div className="hero-diagram__hub">
            <MonoLabel>HUB</MonoLabel>
            <strong>API</strong>
          </div>
        </div>
        <div className="hero-diagram__pins">
          <span className="pin pin--1">
            <i />
            <em>01 · ingest</em>
          </span>
          <span className="pin pin--2">
            <i />
            <em>02 · transform</em>
          </span>
          <span className="pin pin--3">
            <i />
            <em>03 · deliver</em>
          </span>
        </div>
      </div>
      <Callout n={1} className="hero-diagram__callout hero-diagram__callout--1">
        Source systems
      </Callout>
      <Callout n={2} className="hero-diagram__callout hero-diagram__callout--2">
        Orchestration layer
      </Callout>
    </div>
  )
}

function Hero() {
  const reduce = useReducedMotion()
  return (
    <section id="hero" className="hero">
      <div className="hero__grid-bg" aria-hidden="true" />
      <div className="section-shell hero__layout">
        <div className="hero__copy">
          <motion.div
            className="hero__masthead"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut }}
          >
            <img src={site.logo} alt="" width={40} height={40} />
            <div>
              <p className="hero__brand">{site.brand}</p>
              <MonoLabel>
                {site.est} · {site.location} · {site.tagline}
              </MonoLabel>
            </div>
          </motion.div>

          <motion.h1
            className="hero__headline"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.55, ease: easeOut }}
          >
            {hero.headline}
          </motion.h1>

          <motion.p
            className="hero__body"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.5, ease: easeOut }}
          >
            {hero.body}
          </motion.p>

          <motion.div
            className="hero__ctas"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.45, ease: easeOut }}
          >
            <a className="btn btn-primary" href={hero.primaryCta.href}>
              {hero.primaryCta.label}
            </a>
            <a className="btn btn-ghost" href={hero.secondaryCta.href}>
              {hero.secondaryCta.label}
            </a>
          </motion.div>

          <p className="hero__founder">
            <MonoLabel>FOUNDER</MonoLabel>
            <span>
              {site.founder}
            </span>
          </p>
        </div>

        <motion.div
          className="hero__visual"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.6, ease: easeOut }}
        >
          <HeroDiagram />
        </motion.div>
      </div>
    </section>
  )
}

function Marquee() {
  const items = [...marquee, ...marquee]
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__rail">
        <MonoLabel>STACK</MonoLabel>
        <div className="marquee__track">
          {items.map((item, i) => (
            <span key={`${item}-${i}`}>
              <i />
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function Proof() {
  return (
    <section id="proof" className="proof">
      <div className="section-shell">
        <Reveal>
          <MonoLabel className="section-kicker">{proof.eyebrow}</MonoLabel>
          <h2 className="section-title">{proof.title}</h2>
          <p className="section-lead">{proof.lead}</p>
        </Reveal>
        <div className="proof-grid">
          {proof.items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.05} className="proof-cell">
              <div className="proof-cell__head">
                <span className="proof-cell__icon">
                  <Icon name={item.icon} />
                </span>
                <MonoLabel>{String(i + 1).padStart(2, '0')}</MonoLabel>
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
          <MonoLabel className="section-kicker">{about.eyebrow}</MonoLabel>
          <h2 className="section-title">{about.title}</h2>
          <p className="section-lead">{about.lead}</p>
        </Reveal>
        <div className="about-grid">
          <Reveal className="spec-panel">
            <div className="spec-panel__bar">
              <MonoLabel>SPEC / ABOUT_JOSH.TXT</MonoLabel>
              <span className="spec-panel__live" aria-hidden="true">
                READ
              </span>
            </div>
            <pre>{about.terminal.join('\n')}</pre>
          </Reveal>
          <Reveal delay={0.06} className="about-story">
            <h3>{about.storyTitle}</h3>
            {about.story.map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
            <ul className="anno-row">
              {about.pills.map((pill, i) => (
                <li key={pill}>
                  <Callout n={i + 1}>{pill}</Callout>
                </li>
              ))}
            </ul>
            <div className="stack-chips">
              {about.stack.map((tech) => (
                <span key={tech}>{tech}</span>
              ))}
            </div>
            <div className="about-links">
              <a href={site.social.github} target="_blank" rel="noopener noreferrer">
                GitHub <Icon name="external" size={14} />
              </a>
              <a href={site.social.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn <Icon name="external" size={14} />
              </a>
            </div>
            <aside id="hiring" className="recruiter-note" aria-labelledby="hiring-title" tabIndex={-1}>
              <MonoLabel id="hiring-title">{about.recruiter.title}</MonoLabel>
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
          <MonoLabel className="section-kicker">{services.eyebrow}</MonoLabel>
          <h2 className="section-title">{services.title}</h2>
          <p className="section-lead">{services.subtitle}</p>
        </Reveal>
        <div className="services-layout">
          <Reveal className="services-intro">
            <p>{services.intro}</p>
            <a className="text-link" href="#contact">
              Discuss your project <Icon name="arrow" size={16} />
            </a>
          </Reveal>
          <ol className="service-lattice">
            {services.items.map((item, i) => (
              <li key={item.num} className="service-row">
                <Reveal delay={i * 0.06}>
                  <div className="service-row__inner">
                    <span className="service-num">{item.num}</span>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

function Work() {
  const project = work.project
  const [active, setActive] = useState(0)
  const pins = [
    { x: 22, y: 38 },
    { x: 68, y: 28 },
    { x: 48, y: 72 },
  ]

  return (
    <section id="work" className="work">
      <div className="section-shell">
        <Reveal>
          <MonoLabel className="section-kicker">{work.eyebrow}</MonoLabel>
          <h2 className="section-title">{work.title}</h2>
          <p className="section-lead">{work.subtitle}</p>
        </Reveal>

        <div className="work-stage">
          <Reveal className="work-copy">
            <div className="work-kicker">
              <span className="live-badge">{project.badge}</span>
              <MonoLabel>{project.meta}</MonoLabel>
            </div>
            <h3>{project.name}</h3>
            <p className="work-url">
              <a href={project.url} target="_blank" rel="noopener noreferrer">
                {project.urlLabel} <Icon name="external" size={14} />
              </a>
            </p>
            <p className="work-tagline">{project.tagline}</p>
            <ul className="work-highlights">
              {project.highlights.map((h, i) => (
                <li key={h}>
                  <MonoLabel>{String(i + 1).padStart(2, '0')}</MonoLabel>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
            <div className="work-metrics">
              {project.metrics.map((m) => (
                <div key={m.label}>
                  <strong>{m.value}</strong>
                  <MonoLabel>{m.label}</MonoLabel>
                </div>
              ))}
            </div>
            <div className="stack-chips">
              {project.stack.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
            <div className="work-actions">
              <a className="btn btn-primary" href={project.url} target="_blank" rel="noopener noreferrer">
                Visit live site
              </a>
              <a className="btn btn-ghost" href="#contact">
                Build something similar
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="work-visual">
            <div className="wire-device">
              <div className="wire-device__chrome" aria-hidden="true">
                <i />
                <i />
                <i />
                <MonoLabel>{project.urlLabel}</MonoLabel>
              </div>
              <div className="wire-device__screen">
                <div className="wire-mock" aria-hidden="true">
                  <div className="wire-mock__nav" />
                  <div className="wire-mock__hero">
                    <span />
                    <span />
                    <em />
                  </div>
                  <div className="wire-mock__grid">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
                <svg className="wire-leaders" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  {pins.map((pin, i) => {
                    const endX = i === 0 ? 8 : i === 1 ? 92 : 50
                    const endY = i === 2 ? 92 : 8
                    return (
                      <line
                        key={project.hotspots[i].label}
                        className={active === i ? 'is-active' : ''}
                        x1={pin.x}
                        y1={pin.y}
                        x2={endX}
                        y2={endY}
                      />
                    )
                  })}
                </svg>
                {project.hotspots.map((spot, i) => (
                  <button
                    key={spot.label}
                    type="button"
                    className={`hotspot ${active === i ? 'is-active' : ''}`}
                    style={{ left: `${pins[i].x}%`, top: `${pins[i].y}%` }}
                    onClick={() => setActive(i)}
                    aria-label={spot.label}
                    aria-pressed={active === i}
                  >
                    <span className="hotspot__ring" />
                    <span className="hotspot__n">{String(i + 1).padStart(2, '0')}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="hotspot-panel" aria-live="polite">
              <Callout n={active + 1}>{project.hotspots[active].label}</Callout>
              <p>{project.hotspots[active].detail}</p>
            </div>
            <aside className="work-aside">
              <MonoLabel>WHY THIS MATTERS</MonoLabel>
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
          <MonoLabel className="section-kicker">PROCESS</MonoLabel>
          <h2 className="section-title">{process.title}</h2>
          <p className="section-lead">{process.subtitle}</p>
        </Reveal>
        <div className="process-lattice">
          {process.steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.07} className="process-step">
              <div className="process-step__rail" aria-hidden="true">
                <span className="process-step__node">{String(i + 1).padStart(2, '0')}</span>
                {i < process.steps.length - 1 ? <span className="process-step__line" /> : null}
              </div>
              <div className="process-step__body">
                <MonoLabel>STEP {String(i + 1).padStart(2, '0')}</MonoLabel>
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
          <MonoLabel className="section-kicker">SIGNALS</MonoLabel>
          <h2 className="section-title">{testimonials.title}</h2>
        </Reveal>
        <div className="testimonial-grid">
          {testimonials.items.map((item, i) => (
            <Reveal key={item.name} delay={i * 0.06} className="quote-cell">
              <MonoLabel>{String(i + 1).padStart(2, '0')} / REF</MonoLabel>
              <blockquote>“{item.quote}”</blockquote>
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
              <p className="verified">
                <span aria-hidden="true">✓</span> {item.verified}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Contact() {
  const [sent, setSent] = useState(false)
  const formId = useId()

  return (
    <section id="contact" className="contact">
      <div className="section-shell">
        <Reveal>
          <MonoLabel className="section-kicker">CONTACT</MonoLabel>
          <h2 className="section-title">{contact.title}</h2>
          <p className="section-lead">{contact.subtitle}</p>
        </Reveal>
        <Reveal className="contact-panel">
          {sent ? (
            <div className="contact-success" aria-live="polite">
              <MonoLabel>STATUS / OK</MonoLabel>
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
              <MonoLabel className="form-label">INTAKE / PROJECT.BRIEF</MonoLabel>
              <div className="contact-row">
                <label className="field" htmlFor={`${formId}-name`}>
                  <span>Name *</span>
                  <input id={`${formId}-name`} name="name" required autoComplete="name" placeholder="Your name" />
                </label>
                <label className="field" htmlFor={`${formId}-company`}>
                  <span>Company</span>
                  <input
                    id={`${formId}-company`}
                    name="company"
                    autoComplete="organization"
                    placeholder="Optional"
                  />
                </label>
              </div>
              <label className="field" htmlFor={`${formId}-email`}>
                <span>Email *</span>
                <input
                  id={`${formId}-email`}
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@company.com"
                />
              </label>
              <label className="field" htmlFor={`${formId}-type`}>
                <span>Project type *</span>
                <select id={`${formId}-type`} name="project_type" required defaultValue="">
                  <option value="" disabled>
                    Select a category…
                  </option>
                  {contact.types.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field" htmlFor={`${formId}-message`}>
                <span>Tell me about it *</span>
                <textarea
                  id={`${formId}-message`}
                  name="message"
                  rows={5}
                  required
                  placeholder="Describe the problem you’re trying to solve…"
                />
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
        <div className="footer-brand">
          <span>{site.brand}</span>
          <MonoLabel>
            {site.est} · {site.location}
          </MonoLabel>
        </div>
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
      <VariantChrome id="lattice" name="Lattice" />
      <ScrollProgress />
      <div className="paper-grain" aria-hidden="true" />
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
<div className="mockup-banner">Redesign mockup · Lattice blueprint</div>
    </>
  )
}
