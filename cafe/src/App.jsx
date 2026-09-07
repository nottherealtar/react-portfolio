import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { CafeProvider, useCafe } from './ui/CafeContext'
import Chrome from './ui/Chrome'
import StationPanel from './ui/StationPanel'
import { about, contact, footer, hero, identity, process, proof, services, stations, testimonials, work } from './content'

const CafeCanvas = lazy(() => import('./scene/CafeCanvas'))

function usePrefers() {
  return useMemo(() => {
    if (typeof window === 'undefined') return { reduced: false, lowPower: false }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const lowPower = window.matchMedia('(max-width: 720px)').matches
    return { reduced, lowPower }
  }, [])
}

function WheelBridge() {
  const { index, setStation } = useCafe()
  useEffect(() => {
    let locked = false
    const go = (dir) => {
      if (locked) return
      locked = true
      const next = (index + dir + stations.length) % stations.length
      setStation(stations[next].id)
      window.setTimeout(() => {
        locked = false
      }, 950)
    }
    const onWheel = (event) => {
      if (event.target.closest('.panel, input, textarea, select, form')) return
      if (Math.abs(event.deltaY) < 18) return
      event.preventDefault()
      go(event.deltaY > 0 ? 1 : -1)
    }
    const onKey = (event) => {
      if (event.target.closest('input, textarea, select')) return
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') go(1)
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') go(-1)
    }
    let startY = 0
    const onTouchStart = (event) => {
      startY = event.touches[0].clientY
    }
    const onTouchEnd = (event) => {
      if (event.target.closest('.panel')) return
      const dy = event.changedTouches[0].clientY - startY
      if (Math.abs(dy) > 56) go(dy < 0 ? 1 : -1)
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [index, setStation])
  return null
}

function Fallback() {
  return (
    <main className="fallback">
      <div className="fallback-stack">
        <p className="webgl-note">3D shop paused for reduced motion. Same copy, still Joshua.</p>
        <section className="panel panel-solid">
          <div className="panel-inner">
            <p className="kicker">{identity.kicker}</p>
            <h1 className="h1">{hero.headline}</h1>
            <p className="lede">{hero.body}</p>
          </div>
        </section>
        <section className="panel panel-solid">
          <div className="panel-inner">
            <h2 className="h2">{proof.title}</h2>
            <p className="lede">{proof.lead}</p>
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
          </div>
        </section>
        <section className="panel panel-solid">
          <div className="panel-inner">
            <h2 className="h2">{about.title}</h2>
            <p className="lede">{about.lead}</p>
            {about.story.map((para) => (
              <p className="body" key={para.slice(0, 18)}>{para}</p>
            ))}
          </div>
        </section>
        <section className="panel panel-solid">
          <div className="panel-inner">
            <h2 className="h2">{services.title}</h2>
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
          </div>
        </section>
        <section className="panel panel-solid">
          <div className="panel-inner">
            <h2 className="h2">{work.project.name}</h2>
            <p className="lede">{work.project.tagline}</p>
            <a className="btn btn-primary" href={work.project.url} target="_blank" rel="noopener noreferrer">
              {work.project.primary}
            </a>
          </div>
        </section>
        <section className="panel panel-solid">
          <div className="panel-inner">
            <h2 className="h2">{process.title}</h2>
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
          </div>
        </section>
        <section className="panel panel-solid">
          <div className="panel-inner">
            {testimonials.items.map((entry) => (
              <blockquote className="quote" key={entry.name}>
                <p>“{entry.quote}”</p>
                <footer>
                  <cite>{entry.name}</cite>
                  <span className="muted">{entry.role}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </section>
        <section className="panel panel-solid">
          <div className="panel-inner">
            <h2 className="h2">{contact.title}</h2>
            <p className="lede">{contact.subtitle}</p>
            <a className="btn btn-primary" href="/#contact">
              {contact.submit}
            </a>
          </div>
        </section>
        <p className="muted">{footer.copy}</p>
      </div>
    </main>
  )
}

function CafeApp() {
  const { reduced, lowPower } = usePrefers()
  const [webgl, setWebgl] = useState(true)

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const ok = !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
      setWebgl(ok)
    } catch {
      setWebgl(false)
    }
  }, [])

  if (reduced || !webgl) {
    return (
      <div className="app">
        <Chrome />
        <Fallback />
      </div>
    )
  }

  return (
    <div className="app">
      <Suspense fallback={null}>
        <CafeCanvas reduced={reduced} lowPower={lowPower} />
      </Suspense>
      <div className="vignette" />
      <Chrome />
      <StationPanel />
      <WheelBridge />
    </div>
  )
}

export default function App() {
  return (
    <CafeProvider>
      <CafeApp />
    </CafeProvider>
  )
}
