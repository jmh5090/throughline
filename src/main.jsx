import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ThroughlineApp from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThroughlineApp />
  </StrictMode>,
)
