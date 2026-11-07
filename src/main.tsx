import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import './index.css'

const updateServiceWorker = registerSW({ immediate: true, onNeedRefresh: () => window.dispatchEvent(new Event('colorvia-sw-update')) })
window.addEventListener('colorvia-apply-update', () => { void updateServiceWorker(true) })
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>)
