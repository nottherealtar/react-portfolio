import { VariantChrome } from '../../shared/VariantChrome'
import '../../shared/variant-chrome.css'

export default function App() {
  return (
    <main style={{ minHeight: '100vh', padding: '4rem 1.5rem', fontFamily: 'system-ui' }}>
      <VariantChrome id="signal" name="Signal" />
      <h1 style={{ marginTop: '3rem' }}>Signal variant loading…</h1>
      <p>This stub is replaced by the full redesign build.</p>
    </main>
  )
}
