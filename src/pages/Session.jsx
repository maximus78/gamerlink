import { useState } from 'react'

export default function Session() {
  const [game, setGame] = useState('Warzone')
  const [heure, setHeure] = useState('Ce soir — 21h00')

  return (
    <div>
      <div style={{margin:'12px 16px 10px',border:'1px solid #eee',borderRadius:'16px',overflow:'hidden'}}>
        <div style={{height:'72px',position:'relative',display:'flex',alignItems:'flex-end',padding:'10px 14px'}}>
          <div style={{position:'absolute',inset:0,background:'#1a1a2e'}}></div>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,.65),rgba(0,0,0,.1))'}}></div>
          <div style={{position:'relative',zIndex:1,width:'100%',display:'flex',alignItems:'flex-end',justifyContent:'space-between'}}>
            <div>
              <div style={{fontSize:'14px',fontWeight:'700',color:'#fff'}}>Warzone · Session en cours</div>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,.65)',marginTop:'2px'}}>Lancée il y a 8 min · 3 joueurs</div>
            </div>
            <span style={{fontSize:'10px',fontWeight:'700',background:'#e63946',color:'#fff',padding:'3px 9px',borderRadius:'20px'}}>Live</span>
          </div>
        </div>
        <div style={{padding:'10px 14px',display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{display:'flex'}}>
            {[
              {bg:'#C0DD97',color:'#27500A',txt:'PL'},
              {bg:'#CECBF6',color:'#3C3489',txt:'MA'},
              {bg:'#f0f0f0',color:'#aaa',txt:'+1'}
            ].map((a,i) => (
              <div key={i} style={{width:'28px',height:'28px',borderRadius:'50%',background:a.bg,color:a.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'9px',fontWeight:'700',border:'2px solid #fff',marginLeft: i===0?'0':'-7px'}}>
                {a.txt}
              </div>
            ))}
          </div>
          <span style={{fontSize:'12px',color:'#888',flex:1,marginLeft:'4px'}}>Paul, Maxime et 1 autre</span>
          <button style={{fontSize:'11px',fontWeight:'700',padding:'7px 14px',borderRadius:'10px',border:'1.5px solid #3B6D11',background:'#EAF3DE',color:'#27500A',cursor:'pointer',fontFamily:'inherit'}}>Rejoindre</button>
        </div>
      </div>

      <div style={{margin:'0 16px 12px',border:'1px solid #eee',borderRadius:'16px',padding:'14px'}}>
        <div style={{fontSize:'13px',fontWeight:'600',color:'#111',marginBottom:'12px'}}>Programmer une session</div>

        <div style={{fontSize:'11px',fontWeight:'600',color:'#aaa',marginBottom:'5px'}}>Jeu</div>
        <select value={game} onChange={e => setGame(e.target.value)}
          style={{width:'100%',padding:'9px 12px',border:'1px solid #eee',borderRadius:'10px',fontSize:'13px',color:'#111',background:'#fff',fontFamily:'inherit',marginBottom:'10px'}}>
          <option>Warzone</option>
          <option>FC 26</option>
          <option>Rocket League</option>
        </select>

        <div style={{fontSize:'11px',fontWeight:'600',color:'#aaa',marginBottom:'5px'}}>Heure</div>
        <select value={heure} onChange={e => setHeure(e.target.value)}
          style={{width:'100%',padding:'9px 12px',border:'1px solid #eee',borderRadius:'10px',fontSize:'13px',color:'#111',background:'#fff',fontFamily:'inherit',marginBottom:'12px'}}>
          <option>Ce soir — 21h00</option>
          <option>Ce soir — 21h30</option>
          <option>Demain — 20h00</option>
        </select>

        <button style={{width:'100%',padding:'12px',borderRadius:'12px',background:'#111',color:'#fff',border:'none',fontSize:'13px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit'}}>
          + Lancer — qui vient ?
        </button>
        <div className="hint" style={{padding:'8px 0 0'}}>
          Thomas, Maxime et Jules notifiés. Lucas reçoit un SMS.
        </div>
      </div>
    </div>
  )
}