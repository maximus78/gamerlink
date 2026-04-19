import { useState, useEffect } from 'react'

const STEAM_AFFILIATE = 'YOUR_AFFILIATE_ID' // à remplacer plus tard

const GAMES = [
  { id: '1172470', name: 'Apex Legends', genre: 'Battle Royale · Free', color: '#cd3333', peak: 'Pic actuel' },
  { id: '730', name: 'CS2', genre: 'FPS Tactique · Free', color: '#1b2838', peak: 'Toujours fort' },
  { id: '1172620', name: 'Warzone', genre: 'Battle Royale · Free', color: '#1a1a2e', peak: 'En montée' },
  { id: '252950', name: 'Rocket League', genre: 'Sport · Free', color: '#0d1b2a', peak: 'Stable' },
  { id: '1237970', name: 'Titanfall 2', genre: 'FPS · 7€', color: '#1a1a2e', peak: 'Pépite' },
  { id: '1593500', name: 'God of War', genre: 'Action · 40€', color: '#8b0000', peak: 'Classique' },
  { id: '2668510', name: 'Elden Ring Nightreign', genre: 'RPG · 39€', color: '#1a0a2e', peak: 'Pré-hype' },
]

export default function Decouvrir() {
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')

  const filtered = GAMES.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase())
  )

  const openSteam = (gameId, gameName) => {
    window.open(`https://store.steampowered.com/app/${gameId}/?utm_source=gamerlink`, '_blank')
  }

  const openYoutube = (gameName) => {
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(gameName + ' gameplay 2026')}`, '_blank')
  }

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()

  return (
    <div>
      <div style={{padding:'12px 16px 8px'}}>
        <input
          type="text"
          placeholder="Chercher un jeu..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{width:'100%',padding:'10px 14px',border:'1px solid #eee',borderRadius:'12px',fontSize:'14px',color:'#111',fontFamily:'inherit',outline:'none',background:'#fafaf9'}}
        />
      </div>

      {filtered.map(g => (
        <div key={g.id} style={{margin:'0 16px 10px',border:'1px solid #eee',borderRadius:'16px',overflow:'hidden'}}>
          <div style={{height:'70px',position:'relative',display:'flex',alignItems:'flex-end',padding:'10px 14px'}}>
            <div style={{position:'absolute',inset:0,background:g.color}}></div>
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,.7),rgba(0,0,0,.1))'}}></div>
            <div style={{position:'relative',zIndex:1,width:'100%',display:'flex',alignItems:'flex-end',justifyContent:'space-between'}}>
              <div>
                <div style={{fontSize:'16px',fontWeight:'700',color:'#fff'}}>{g.name}</div>
                <div style={{fontSize:'11px',color:'rgba(255,255,255,.65)',marginTop:'1px'}}>{g.genre}</div>
              </div>
              <span style={{fontSize:'10px',fontWeight:'700',background:'rgba(255,255,255,.2)',color:'#fff',padding:'3px 9px',borderRadius:'20px',backdropFilter:'blur(4px)'}}>
                {g.peak}
              </span>
            </div>
          </div>

          <div style={{padding:'10px 14px',display:'flex',gap:'8px'}}>
            <button onClick={() => openSteam(g.id, g.name)}
              style={{flex:1,padding:'9px',borderRadius:'10px',background:'#1b2838',color:'#c7d5e0',border:'none',fontSize:'12px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
              <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6" fill="none" stroke="#c7d5e0" strokeWidth="1"/><circle cx="9.5" cy="6" r="2" fill="#c7d5e0"/></svg>
              Voir sur Steam
            </button>
            <button onClick={() => openYoutube(g.name)}
              style={{flex:1,padding:'9px',borderRadius:'10px',background:'#ff0000',color:'#fff',border:'none',fontSize:'12px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
              <svg width="14" height="14" viewBox="0 0 14 14"><polygon points="5,3 11,7 5,11" fill="#fff"/></svg>
              YouTube
            </button>
          </div>
        </div>
      ))}

      <div style={{padding:'8px 16px 20px',fontSize:'11px',color:'#bbb',textAlign:'center',lineHeight:'1.5'}}>
        Les données Steam Charts arrivent prochainement. Les liens Steam sont affiliés — tu soutiens GamerLink en achetant via l'app.
      </div>
    </div>
  )
}