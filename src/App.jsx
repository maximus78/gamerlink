import { useState } from 'react'
import Feed from './pages/Feed'
import Status from './pages/Status'
import Session from './pages/Session'
import Decouvrir from './pages/Decouvrir'
import './App.css'

export default function App() {
  const [page, setPage] = useState('feed')

  return (
    <div className="app">
      <div className="topbar">
        <span className="appname">GamerLink</span>
        <span className="online">4 en ligne</span>
      </div>

      <div className="nav">
        <button className={page === 'feed' ? 'nbt on' : 'nbt'} onClick={() => setPage('feed')}>Qui joue</button>
        <button className={page === 'status' ? 'nbt on' : 'nbt'} onClick={() => setPage('status')}>Mon statut</button>
        <button className={page === 'session' ? 'nbt on' : 'nbt'} onClick={() => setPage('session')}>Session</button>
        <button className={page === 'dec' ? 'nbt on' : 'nbt'} onClick={() => setPage('dec')}>Découvrir</button>
      </div>

      <div className="scroll">
        {page === 'feed' && <Feed />}
        {page === 'status' && <Status />}
        {page === 'session' && <Session />}
        {page === 'dec' && <Decouvrir />}
      </div>

      <div className="tab-bar">
        <div className={page === 'feed' ? 'tab on' : 'tab'} onClick={() => setPage('feed')}>
          <svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="7" r="3.5" fill="currentColor" opacity=".8"/><ellipse cx="9" cy="14.5" rx="6" ry="3" fill="currentColor" opacity=".5"/></svg>
          <span>Qui joue</span>
        </div>
        <div className={page === 'status' ? 'tab on' : 'tab'} onClick={() => setPage('status')}>
          <svg width="18" height="18" viewBox="0 0 18 18"><polygon points="4,3 14,9 4,15" fill="currentColor" opacity=".8"/></svg>
          <span>Mon statut</span>
        </div>
        <div className={page === 'session' ? 'tab on' : 'tab'} onClick={() => setPage('session')}>
          <svg width="18" height="18" viewBox="0 0 18 18"><rect x="3" y="4" width="12" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".8"/></svg>
          <span>Session</span>
        </div>
        <div className={page === 'dec' ? 'tab on' : 'tab'} onClick={() => setPage('dec')}>
          <svg width="18" height="18" viewBox="0 0 18 18"><path d="M9 2C9 2 14 6 14 10C14 13 11.5 15.5 9 15.5C6.5 15.5 4 13 4 10C4 6 9 2 9 2Z" fill="currentColor" opacity=".8"/></svg>
          <span>Découvrir</span>
        </div>
      </div>
    </div>
  )
}