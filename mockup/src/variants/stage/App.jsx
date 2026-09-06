import { VariantChrome } from '../../shared/VariantChrome'
import '../../shared/variant-chrome.css'

export default function App() {
  return (
    <main style={{ minHeight: '100vh', padding: '4rem 1.5rem', fontFamily: 'system-ui' }}>
      <VariantChrome id="stage" name="Stage" />
      <h1 style={{ marginTop: '3rem' }}>Stage variant loading…</h1>
      <p>This stub is replaced by the full redesign build.</p>
    </main>
  )
}
