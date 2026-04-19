import { useState } from 'react'

export default function Status() {
  const [status, setStatus] = useState('hot')
  const [game, setGame] = useState('wz')
  const [dur, setDur] = useState('2h')

  const games = {
    wz: { name: 'Warzone', bg: '#1a1a2e' },
    fc: { name: 'FC 26', bg: '#00875a' },
    rl: { name: 'Rocket League', bg: '#0d1b2a' }
  }

  return (
    <div>
      <div style={{margin:'12px 16px 10px',border:'1px solid #eee',borderRadius:'16px',overflow:'hidden'}}>
        <div style={{padding:'11px 14px',background:'#fafaf9',display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'38px',height:'38px',borderRadius:'50%',background:'#EAF3DE',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',fontWeight:'700',color:'#27500A'}}>TO</div>
          <div>
            <div style={{fontSize:'14px',fontWeight:'600',color:'#111'}}>Ton statut actuel</div>
            <div style={{fontSize:'11px',color:'#888',marginTop:'2px',display:'flex',alignItems:'center',gap:'4px'}}>
              <span style={{width:'7px',height:'7px',borderRadius:'50%',background:'#ccc',display:'inline-block'}}></span>
              Pas dispo
            </div>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr'}}>
          {[
            { key:'game', label:'En game', color:'#EAF3DE', icon:'▶' },
            { key:'hot', label:'Chaud pour jouer', color:'#FCEBEB', icon:'🔥' },
            { key:'off', label:'Pas dispo', color:'#f5f5f5', icon:'✕' }
          ].map(s => (
            <div key={s.key}
              onClick={() => setStatus(s.key)}
              style={{
                padding:'12px 4px',display:'flex',flexDirection:'column',alignItems:'center',gap:'5px',
                cursor:'pointer',borderRight:'1px solid #eee',borderTop:'1px solid #eee',
                background: status === s.key ? '#f0f9f0' : '#fff'
              }}>
              <div style={{width:'30px',height:'30px',borderRadius:'50%',background:s.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px'}}>{s.icon}</div>
              <span style={{fontSize:'10px',fontWeight:'600',color: status === s.key ? '#111' : '#bbb',textAlign:'center',lineHeight:'1.3'}}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{margin:'0 16px 10px',border:'1px solid #eee',borderRadius:'16px',overflow:'hidden'}}>
        <div style={{padding:'8px 14px',background:'#fafaf9',fontSize:'10px',fontWeight:'700',color:'#bbb',textTransform:'uppercase',letterSpacing:'.08em'}}>Quel jeu ce soir ?</div>
        {Object.entries(games).map(([key, g]) => (
          <div key={key} onClick={() => setGame(key)}
            style={{display:'flex',alignItems:'center',gap:'10px',padding:'9px 14px',borderTop:'1px solid #f0f0f0',cursor:'pointer',background: game === key ? '#f0f9f0' : '#fff'}}>
            <div style={{width:'36px',height:'36px',borderRadius:'9px',background:g.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <svg width="18" height="18" viewBox="0 0 18 18"><rect x="2" y="8" width="14" height="2.5" fill="#e63946" rx="1.2"/><rect x="7.75" y="2" width="2.5" height="14" fill="#e63946" rx="1.2"/></svg>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:'13px',fontWeight:'600',color:'#111'}}>{g.name}</div>
            </div>
            {game === key && (
              <div style={{width:'18px',height:'18px',borderRadius:'50%',background:'#EAF3DE',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <svg width="9" height="9" viewBox="0 0 9 9"><polyline points="1.5,4.5 3.5,6.5 7.5,2.5" stroke="#27500A" strokeWidth="1.5" fill="none"/></svg>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'0 16px 10px'}}>
        <span style={{fontSize:'11px',color:'#bbb',flex:1}}>Durée estimée</span>
        <div style={{display:'flex',gap:'4px'}}>
          {['1h','2h','3h','Soirée'].map(d => (
            <button key={d} onClick={() => setDur(d)}
              style={{fontSize:'10px',padding:'4px 9px',borderRadius:'20px',border:'1px solid',cursor:'pointer',fontFamily:'inherit',
                borderColor: dur === d ? '#111' : '#eee',
                background: dur === d ? '#111' : '#fff',
                color: dur === d ? '#fff' : '#aaa'
              }}>{d}</button>
          ))}
        </div>
      </div>

      <button style={{margin:'0 16px 4px',width:'calc(100% - 32px)',padding:'13px',borderRadius:'12px',background:'#111',color:'#fff',border:'none',fontSize:'13px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
        <svg width="16" height="16" viewBox="0 0 16 16"><polygon points="2,4 10,8 2,12" fill="#fff"/><line x1="12" y1="4" x2="12" y2="12" stroke="#fff" strokeWidth="1.5"/></svg>
        Je joue à {games[game].name} — qui vient ?
      </button>
      <div className="hint">Paul, Maxime et Jules seront notifiés. Statut actif {dur} puis effacé automatiquement.</div>
    </div>
  )
}