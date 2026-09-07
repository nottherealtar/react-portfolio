import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const container = document.getElementById('root')
const tree = (
  <StrictMode>
    <App />
  </StrictMode>
)

if (container?.dataset.prerendered === 'true') {
  hydrateRoot(container, tree)
} else {
  createRoot(container).render(tree)
}
