import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom' // İşte eksik olan parça bu!

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Uygulamayı Router ile sarmalıyoruz ki sayfalar çalışsın */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)