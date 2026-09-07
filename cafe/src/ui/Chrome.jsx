import { identity, stations } from '../content'
import { useCafe } from './CafeContext'

export default function Chrome() {
  const { station, setStation, index } = useCafe()

  return (
    <>
      <a className="skip-link" href="#hud">
        Skip to content
      </a>
      <nav className={`nav glass${index > 0 ? ' scrolled' : ''}`} aria-label="Cafe stations">
        <a className="nav-brand" href="#hero" onClick={(e) => { e.preventDefault(); setStation('hero') }}>
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="" width="28" height="28" />
          {identity.brand}
        </a>
        <div className="nav-links">
          {stations.filter((item) => item.id !== 'hero').map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-link${station === item.id ? ' is-active' : ''}`}
              onClick={() => setStation(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <a className="nav-live" href={identity.liveSite}>
          Live site
        </a>
        <button type="button" className="nav-cta" onClick={() => setStation('contact')}>
          Let&apos;s Talk
        </button>
      </nav>
      <div className="dock glass" role="tablist" aria-label="Move through the shop">
        {stations.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={station === item.id}
            className={`dock-btn${station === item.id ? ' is-active' : ''}`}
            onClick={() => setStation(item.id)}
          >
            {item.short}
          </button>
        ))}
      </div>
      <p className="hint">Scroll · click the floor rings</p>
    </>
  )
}
