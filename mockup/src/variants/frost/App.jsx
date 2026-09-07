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

const easeOut = [0.22, 1, 0.36, 1]

function Icon({ name }) {
  const common = {
    width: 22,
    height: 22,
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
      </svg>
    )
  }
  return (
    <svg {...common}>
      <path d="M12 3.5l8 4.2-8 4.2-8-4.2 8-4.2z" />
      <path d="M4 12.2l8 4.2 8-4.2" />
      <path d="M4 16.2l8 4.2 8-4.2" />
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
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.75, ease: easeOut, delay }}
    >
      {children}
    </motion.div>
  )
}

function WordReveal({ text, className, as: Tag = 'h2', delay = 0 }) {
  const reduce = useReducedMotion()
  const words = text.split(' ')
  if (reduce) {
    return <Tag className={className}>{text}</Tag>
  }
  return (
    <Tag className={`${className} frost-word-reveal`} aria-label={text}>
      {words.map((word, i) => (
        <span className="frost-word-reveal__word" key={`${word}-${i}`}>
          <motion.span
            aria-hidden="true"
            initial={{ opacity: 0, y: '105%' }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 0.7, ease: easeOut, delay: delay + i * 0.045 }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.2 })
  return <motion.div className="frost-progress" style={{ scaleX }} aria-hidden="true" />
}

function FrostOrb() {
  const reduce = useReducedMotion()
  return (
    <div className="frost-orb" aria-hidden="true">
      <div className={`frost-orb__glow ${reduce ? 'is-static' : ''}`} />
      <div className={`frost-orb__core ${reduce ? 'is-static' : ''}`} />
      <div className={`frost-orb__ring frost-orb__ring--a ${reduce ? 'is-static' : ''}`} />
      <div className={`frost-orb__ring frost-orb__ring--b ${reduce ? 'is-static' : ''}`} />
      <div className="frost-orb__shine" />
      <div className="frost-orb__mist" />
    </div>
  )
}

function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18)
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
          key="frost-sheet"
          className="frost-sheet"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            className="frost-sheet__panel"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="frost-sheet__handle" aria-hidden="true" />
            <p className="frost-sheet__label">Navigate</p>
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
            <a className="frost-btn frost-btn--fill frost-sheet__cta" href="#contact" onClick={close}>
              Start a Project
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <header className={`frost-nav ${scrolled ? 'is-scrolled' : ''}`}>
        <a className="frost-nav__brand" href="#hero" onClick={close}>
          <img src={site.logo} alt="" width={28} height={28} />
          <span>{site.brand}</span>
        </a>
        <ul className="frost-nav__links">
          {nav.map((item) => (
            <li key={item.href}>
              <a href={item.href}>{item.label}</a>
            </li>
          ))}
        </ul>
        <a className="frost-btn frost-btn--ghost frost-nav__cta" href="#contact">
          Start a Project
        </a>
        <button
          className={`frost-nav__toggle ${open ? 'is-open' : ''}`}
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
  const orbY = useTransform(scrollYProgress, [0, 1], [0, 140])
  const orbScale = useTransform(scrollYProgress, [0, 1], [1, 1.18])
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -48])

  return (
    <section id="hero" className="frost-hero" ref={ref}>
      <div className="frost-hero__atmosphere" aria-hidden="true" />
      <motion.div
        className="frost-hero__orb-wrap"
        style={reduce ? undefined : { y: orbY, scale: orbScale }}
      >
        <FrostOrb />
      </motion.div>

      <motion.div className="frost-hero__copy" style={reduce ? undefined : { y: copyY }}>

        <motion.h1
          className="frost-hero__brand"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.8, ease: easeOut }}
        >
          {site.brand}
        </motion.h1>

        <motion.p
          className="frost-hero__headline"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, duration: 0.7, ease: easeOut }}
        >
          {hero.headline}
        </motion.p>

        <motion.p
          className="frost-hero__body"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.58, duration: 0.65, ease: easeOut }}
        >
          {hero.body}
        </motion.p>

        <motion.div
          className="frost-hero__ctas"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.72, duration: 0.6, ease: easeOut }}
        >
          <a className="frost-btn frost-btn--fill" href={hero.primaryCta.href}>
            {hero.primaryCta.label}
          </a>
          <a className="frost-btn frost-btn--ghost" href={hero.secondaryCta.href}>
            {hero.secondaryCta.label}
          </a>
        </motion.div>
      </motion.div>

      <a className="frost-scroll-cue" href="#proof" aria-label="Scroll to content">
        <span />
      </a>
    </section>
  )
}

function Marquee() {
  const items = [...marquee, ...marquee]
  return (
    <div className="frost-marquee" aria-hidden="true">
      <div className="frost-marquee__track">
        {items.map((item, i) => (
          <span key={`${item}-${i}`}>
            {item}
            <em>·</em>
          </span>
        ))}
      </div>
    </div>
  )
}

function Proof() {
  return (
    <section id="proof" className="frost-proof">
      <div className="frost-shell">
        <Reveal className="frost-section-head">
          <p className="frost-eyebrow">{proof.eyebrow}</p>
          <WordReveal className="frost-display" text={proof.title} />
          <p className="frost-lead">{proof.lead}</p>
        </Reveal>
        <div className="frost-proof__grid">
          {proof.items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.06} className="frost-proof__item">
              <div className="frost-proof__icon">
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
    <section id="about" className="frost-about">
      <div className="frost-shell">
        <Reveal className="frost-section-head">
          <p className="frost-eyebrow">{about.eyebrow}</p>
          <WordReveal className="frost-display" text={about.title} />
          <p className="frost-lead">{about.lead}</p>
        </Reveal>

        <div className="frost-about__layout">
          <Reveal className="frost-terminal">
            <div className="frost-terminal__bar">
              <span className="frost-terminal__dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span>about.txt</span>
            </div>
            <pre>{about.terminal.join('\n')}</pre>
          </Reveal>

          <Reveal delay={0.08} className="frost-about__story">
            <h3>{about.storyTitle}</h3>
            {about.story.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
            <ul className="frost-pills">
              {about.pills.map((pill) => (
                <li key={pill}>{pill}</li>
              ))}
            </ul>
            <div className="frost-stack">
              {about.stack.map((tech) => (
                <span key={tech}>{tech}</span>
              ))}
            </div>
            <aside id="hiring" className="frost-recruiter" aria-labelledby="hiring-title" tabIndex={-1}>
              <p id="hiring-title" className="frost-eyebrow">{about.recruiter.title}</p>
              <p>{about.recruiter.hint}</p>
              <div className="frost-social">
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
    <section id="services" className="frost-services">
      <div className="frost-shell">
        <Reveal className="frost-section-head">
          <p className="frost-eyebrow">{services.eyebrow}</p>
          <WordReveal className="frost-display" text={services.title} />
          <p className="frost-lead">{services.subtitle}</p>
        </Reveal>

        <div className="frost-services__layout">
          <Reveal className="frost-services__intro">
            <p>{services.intro}</p>
            <a href="#contact">Discuss your project →</a>
          </Reveal>
          <div className="frost-services__list" role="list">
            {services.items.map((item, i) => (
              <Reveal key={item.num} delay={i * 0.07} className="frost-service" role="listitem">
                <span className="frost-service__num" aria-hidden="true">
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
  const [activeSpot, setActiveSpot] = useState(0)

  return (
    <section id="work" className="frost-work">
      <div className="frost-shell">
        <Reveal className="frost-section-head">
          <p className="frost-eyebrow">{work.eyebrow}</p>
          <WordReveal className="frost-display" text={work.title} />
          <p className="frost-lead">{work.subtitle}</p>
        </Reveal>

        <div className="frost-work__stage">
          <Reveal className="frost-work__copy">
            <div className="frost-work__kicker">
              <span className="frost-badge">{project.badge}</span>
              <span>{project.meta}</span>
            </div>
            <h3 className="frost-work__name">{project.name}</h3>
            <p className="frost-work__url">
              <a href={project.url} target="_blank" rel="noopener noreferrer">
                {project.urlLabel}
              </a>
            </p>
            <p className="frost-work__tagline">{project.tagline}</p>
            <ul className="frost-work__highlights">
              {project.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <div className="frost-work__metrics">
              {project.metrics.map((m) => (
                <div key={m.label}>
                  <strong>{m.value}</strong>
                  <span>{m.label}</span>
                </div>
              ))}
            </div>
            <div className="frost-stack">
              {project.stack.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
            <div className="frost-work__actions">
              <a className="frost-btn frost-btn--fill" href={project.url} target="_blank" rel="noopener noreferrer">
                Visit live site
              </a>
              <a className="frost-btn frost-btn--ghost" href="#contact">
                Build something similar
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="frost-work__visual">
            <div className="frost-frame">
              <div className="frost-frame__chrome" aria-hidden="true">
                <i />
                <i />
                <i />
                <span>{project.urlLabel}</span>
              </div>
              <div className="frost-frame__screen">
                <div className="frost-frame__demo" aria-hidden="true">
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
                    className={`frost-hotspot frost-hotspot--${i} ${activeSpot === i ? 'is-active' : ''}`}
                    onClick={() => setActiveSpot(i)}
                    aria-label={spot.label}
                    aria-pressed={activeSpot === i}
                  >
                    <span />
                  </button>
                ))}
              </div>
            </div>
            <div className="frost-hotspot-card" aria-live="polite">
              <p className="frost-eyebrow">{project.hotspots[activeSpot].label}</p>
              <p>{project.hotspots[activeSpot].detail}</p>
            </div>
            <aside className="frost-work__aside">
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
    <section id="process" className="frost-process">
      <div className="frost-shell">
        <Reveal className="frost-section-head">
          <WordReveal className="frost-display" text={process.title} />
          <p className="frost-lead">{process.subtitle}</p>
        </Reveal>
        <div className="frost-process__rail">
          {process.steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.08} className="frost-process__step">
              <div className="frost-process__num">{String(i + 1).padStart(2, '0')}</div>
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
    <section id="testimonials" className="frost-testimonials">
      <div className="frost-shell">
        <Reveal className="frost-section-head">
          <WordReveal className="frost-display" text={testimonials.title} />
        </Reveal>
        <div className="frost-testimonial__rail">
          {testimonials.items.map((item, i) => (
            <Reveal key={item.name} delay={i * 0.07} className="frost-quote">
              <p className="frost-quote__text">“{item.quote}”</p>
              <footer>
                <div className="frost-quote__avatar" aria-hidden="true">
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
              <div className="frost-quote__verified">✓ {item.verified}</div>
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
    <section id="contact" className="frost-contact">
      <div className="frost-shell">
        <Reveal className="frost-section-head">
          <WordReveal className="frost-display" text={contact.title} />
          <p className="frost-lead">{contact.subtitle}</p>
        </Reveal>

        <Reveal className="frost-contact__panel">
          {sent ? (
            <div className="frost-contact__success" aria-live="polite">
              <h3>Got it</h3>
              <p>I&apos;ll be back within 24 hours.</p>
              <button className="frost-btn frost-btn--ghost" type="button" onClick={() => setSent(false)}>
                Send another message
              </button>
            </div>
          ) : (
            <form
              className="frost-form"
              onSubmit={(e) => {
                e.preventDefault()
                setSent(true)
              }}
            >
              <div className="frost-form__row">
                <label className="frost-field">
                  <span>Name *</span>
                  <input name="name" required autoComplete="name" placeholder="Your name" />
                </label>
                <label className="frost-field">
                  <span>Company</span>
                  <input name="company" autoComplete="organization" placeholder="Optional" />
                </label>
              </div>
              <label className="frost-field">
                <span>Email *</span>
                <input name="email" type="email" required autoComplete="email" placeholder="you@company.com" />
              </label>
              <label className="frost-field">
                <span>Project type *</span>
                <select name="project_type" required defaultValue="">
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
              <label className="frost-field">
                <span>Tell me about it *</span>
                <textarea name="message" rows={5} required placeholder="Describe the problem you’re trying to solve…" />
              </label>
              <p className="frost-form__note">Mockup form — local-only for this redesign preview.</p>
              <button className="frost-btn frost-btn--fill" type="submit">
                Send message
              </button>
            </form>
          )}
        </Reveal>

        <div className="frost-coffee">
          <p>{contact.coffeeText}</p>
          <a className="frost-btn frost-btn--ghost" href={site.social.coffee} target="_blank" rel="noopener noreferrer">
            Buy me a coffee
          </a>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="frost-footer">
      <div className="frost-shell frost-footer__inner">
        <div className="frost-footer__brand">{site.brand}</div>
        <div className="frost-footer__links">
          <a href={site.social.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href={site.social.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a href={site.social.blog}>Blog</a>
        </div>
        <p className="frost-footer__copy">© 2020–2026 {site.brand}. All rights reserved.</p>
      </div>
    </footer>
  )
}


export default function App() {
  return (
    <>
      <a className="frost-skip" href="#main">
        Skip to content
      </a>
      <VariantChrome id="frost" name="Frost" />
      <ScrollProgress />
      <div className="frost-app">
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
</>
  )
}
