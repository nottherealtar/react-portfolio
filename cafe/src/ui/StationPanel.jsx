import {
  about,
  contact,
  hero,
  identity,
  process,
  proof,
  services,
  testimonials,
  work,
} from '../content'
import ContactForm from './ContactForm'
import { useCafe } from './CafeContext'

function HeroPanel({ onWork, onTalk }) {
  return (
    <>
      <p className="kicker">{identity.kicker}</p>
      <h1 className="h1">{hero.headline}</h1>
      <p className="lede">{hero.body}</p>
      <div className="chips">
        {hero.chips.map((chip) => (
          <span className="chip" key={chip}>
            {chip}
          </span>
        ))}
      </div>
      <ul className="list">
        {proof.items.map((item) => (
          <li key={item.title} className="row">
            <span className="num">•</span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="actions">
        <button type="button" className="btn btn-primary" onClick={onWork}>
          {hero.primary}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onTalk}>
          {hero.secondary}
        </button>
      </div>
      <p className="muted">{hero.recruiterHint}</p>
    </>
  )
}

function AboutPanel() {
  return (
    <>
      <p className="kicker">{about.eyebrow}</p>
      <h2 className="h2">{about.title}</h2>
      <p className="lede">{about.lead}</p>
      <pre className="terminal">{about.terminal}</pre>
      {about.story.map((para) => (
        <p className="body" key={para.slice(0, 24)}>
          {para}
        </p>
      ))}
      <ul className="pills">
        {about.pills.map((pill) => (
          <li className="chip" key={pill}>
            {pill}
          </li>
        ))}
      </ul>
    </>
  )
}

function ServicesPanel() {
  return (
    <>
      <p className="kicker">{services.eyebrow}</p>
      <h2 className="h2">{services.title}</h2>
      <p className="lede">{services.subtitle}</p>
      <p className="muted">{services.intro}</p>
      <ol className="list">
        {services.items.map((item) => (
          <li key={item.num} className="row">
            <span className="num">{item.num}</span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </>
  )
}

function WorkPanel({ onTalk }) {
  const project = work.project
  return (
    <>
      <p className="kicker">{work.eyebrow}</p>
      <div className="live-dot">
        <i />
        {project.badge}
      </div>
      <h2 className="h2">{project.name}</h2>
      <p className="lede">{project.tagline}</p>
      <div className="metric-row">
        {project.metrics.map((metric) => (
          <div className="metric" key={metric.label}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </div>
        ))}
      </div>
      <ul className="list">
        {project.highlights.map((line) => (
          <li key={line} className="row">
            <span className="num">•</span>
            <p>{line}</p>
          </li>
        ))}
      </ul>
      <p className="muted">
        <strong>{project.asideLabel}. </strong>
        {project.aside}
      </p>
      <div className="actions">
        <a className="btn btn-primary" href={project.url} target="_blank" rel="noopener noreferrer">
          {project.primary}
        </a>
        <button type="button" className="btn btn-secondary" onClick={onTalk}>
          {project.secondary}
        </button>
      </div>
    </>
  )
}

function ProcessPanel() {
  return (
    <>
      <p className="kicker">The pour</p>
      <h2 className="h2">{process.title}</h2>
      <p className="lede">{process.subtitle}</p>
      <ol className="list">
        {process.steps.map((step, i) => (
          <li key={step.title} className="row">
            <span className="num">0{i + 1}</span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </>
  )
}

function GuestsPanel() {
  return (
    <>
      <p className="kicker">{testimonials.title}</p>
      <ul className="list">
        {testimonials.items.map((entry) => (
          <li key={entry.name} className="row">
            <span className="num">{entry.initials}</span>
            <blockquote className="quote">
              <p>“{entry.quote}”</p>
              <footer>
                <cite>{entry.name}</cite>
                <span className="muted">{entry.role}</span>
                <span className="muted">{entry.verified}</span>
              </footer>
            </blockquote>
          </li>
        ))}
      </ul>
    </>
  )
}

function ContactPanel() {
  return (
    <>
      <p className="kicker">Place an order</p>
      <h2 className="h2">{contact.title}</h2>
      <p className="lede">{contact.subtitle}</p>
      <ContactForm />
      <p className="muted">{contact.coffee}</p>
      <a className="btn btn-secondary" href={identity.coffee} target="_blank" rel="noopener noreferrer">
        Buy me a coffee
      </a>
    </>
  )
}

export default function StationPanel() {
  const { station, setStation } = useCafe()
  const onWork = () => setStation('work')
  const onTalk = () => setStation('contact')

  return (
    <aside id="hud" className="hud">
      <div className={`panel ${station === 'hero' ? 'glass' : 'panel-solid'}`}>
        <div className="panel-inner">
          {station === 'hero' && <HeroPanel onWork={onWork} onTalk={onTalk} />}
          {station === 'about' && <AboutPanel />}
          {station === 'services' && <ServicesPanel />}
          {station === 'work' && <WorkPanel onTalk={onTalk} />}
          {station === 'process' && <ProcessPanel />}
          {station === 'testimonials' && <GuestsPanel />}
          {station === 'contact' && <ContactPanel />}
        </div>
      </div>
    </aside>
  )
}
