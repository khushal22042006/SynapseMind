import React from 'react'

export default function Popup() {
  return (
    <div className="container">
      <div className="header">
        <img src="/icons/icon48.png" alt="logo" />
        <h2>My Extension</h2>
      </div>

      <p className="subtitle">
        React + Vite Chrome Extension
      </p>

      <div className="card">
        <button className="primary-btn">Start</button>
        <button className="secondary-btn">Settings</button>
      </div>

      <footer>
        <span>Version 1.0</span>
      </footer>
    </div>
  )
}
