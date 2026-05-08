import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Status({ user, profile }) {
  const [status, setStatus] = useState('off')
  const [selectedGame, setSelectedGame] = useState(null)
  const [when, setWhen] = useState('now')
  const [loading, setLoading] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(null)
  const [myGames, setMyGames] = useState([])
  const [viewers, setViewers] = useState(0)

  useEffect(() => {
    fetchCurrentStatus()
    fetchMyGames()
  }, [])

  const fetchMyGames = async () => {
    const { data } = await supabase
      .from('user_games').select('*').eq('user_id', user.id)
      .order('hours_played', { ascending: false })
    setMyGames(data || [])
  }

  const fetchCurrentStatus = async () => {
    const { data } = await supabase
      .from('statuses').select('*').eq('user_id', user.id)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false }).limit(1)
    if (data && data.length > 0) {
      setCurrentStatus(data[0])
      setStatus(data[0].type)
    } else {
      setCurrentStatus(null)
    }
    const { count } = await supabase
      .from('friends').select('*', { count: 'exact', head: true })
      .eq('friend_id', user.id)
    setViewers(count || 0)
  }

  const getExpiry = () => {
    const now = new Date()
    if (when === 'now') now.setHours(now.getHours() + 2)
    else if (when === '1h') now.setHours(now.getHours() + 3)
    else if (when === 'afternoon') now.setHours(19, 0, 0, 0)
    else if (when === 'evening') now.setHours(23, 59, 0, 0)
    return now.toISOString()
  }

  const handleBroadcast = async () => {
    if (status === 'off') {
      await supabase.from('statuses').delete().eq('user_id', user.id)
      setCurrentStatus(null)
      return
    }
    if (!selectedGame && myGames.length > 0) {
      alert('Choisis un jeu !')
      return
    }
    setLoading(true)
    await supabase.from('statuses').delete().eq('user_id', user.id)

    const gameName = selectedGame?.game_name || 'Jeu libre'

    await supabase.from('statuses').insert({
      user_id: user.id,
      type: status,
      game: gameName,
      expires_at: getExpiry()
    })

    // Archiver pour les habitudes — silencieux
    await supabase.from('status_history').insert({
      user_id: user.id,
      game: gameName,
      type: status,
      hour: new Date().getHours(),
      day_of_week: new Date().getDay()
    })

    await fetchCurrentStatus()
    setLoading(false)
  }

  const handleStop = async () => {
    await supabase.from('statuses').delete().eq('user_id', user.id)
    setCurrentStatus(null)
    setStatus('off')
  }

  const handleExtend = async () => {
    if (!currentStatus) return
    const newExpiry = new Date(currentStatus.expires_at)
    newExpiry.setMinutes(newExpiry.getMinutes() + 30)
    await supabase.from('statuses').update({ expires_at: newExpiry.toISOString() }).eq('id', currentStatus.id)
    await fetchCurrentStatus()
  }

  const whenOptions = [
    { key: 'now', label: 'Maintenant' },
    { key: '1h', label: 'Dans 1h' },
    { key: 'afternoon', label: 'Cet après-midi' },
    { key: 'evening', label: 'Ce soir' },
  ]

  const statusOptions = [
    { key: 'game', label: 'En game', icon: '▶', bg: '#EAF3DE', color: '#27500A' },
    { key: 'hot', label: 'Chaud', icon: '🔥', bg: '#FCEBEB', color: '#A32D2D' },
    { key: 'off', label: 'Pas dispo', icon: '✕', bg: '#f5f5f5', color: '#999' },
  ]

  // POST-BROADCAST — dashboard vivant
  if (currentStatus) return (
    <div style={{padding:'16px'}}>

      <div style={{background:'#f0f9f0',border:'1px solid #d4edbb',borderRadius:'16px',padding:'16px',marginBottom:'14px'}}>
        <div style={{fontSize:'11px',fontWeight:'700',color:'#639922',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'6px'}}>
          Statut actif
        </div>
        <div style={{fontSize:'16px',fontWeight:'700',color:'#111',marginBottom:'4px'}}>
          {currentStatus.game}
        </div>
        <div style={{fontSize:'12px',color:'#888'}}>
          {viewers > 0 ? `${viewers} pote${viewers > 1 ? 's' : ''} peuvent te voir` : 'Visible par tes potes'}
        </div>
      </div>

      {/* Aperçu feed — ce que tes potes voient */}
      <div style={{background:'#fff',border:'1px solid #eee',borderRadius:'14px',padding:'12px 14px',marginBottom:'14px'}}>
        <div style={{fontSize:'10px',fontWeight:'700',color:'#bbb',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'10px'}}>
          Ce que tes potes voient dans Qui joue
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={profile?.name}
              style={{width:'38px',height:'38px',borderRadius:'50%',objectFit:'cover',flexShrink:0}}/>
          ) : (
            <div style={{width:'38px',height:'38px',borderRadius:'50%',background:'#EAF3DE',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:'700',color:'#27500A',flexShrink:0}}>
              {profile?.name?.charAt(0) || 'T'}
            </div>
          )}
          <div style={{flex:1}}>
            <div style={{fontSize:'13px',fontWeight:'700',color:'#111'}}>{profile?.name?.split(' ')[0]} (toi)</div>
            <div style={{fontSize:'11px',color:'#888',marginTop:'1px'}}>{currentStatus.game}</div>
          </div>
          <span style={{fontSize:'10px',fontWeight:'600',padding:'3px 8px',borderRadius:'20px',
            background:currentStatus.type==='game'?'#EAF3DE':'#FCEBEB',
            color:currentStatus.type==='game'?'#27500A':'#A32D2D',flexShrink:0}}>
            {currentStatus.type==='game'?'En game':'Chaud 🔥'}
          </span>
        </div>
        <div style={{marginTop:'10px',padding:'9px',borderRadius:'10px',background:'#111',color:'#fff',fontSize:'12px',fontWeight:'700',textAlign:'center'}}>
          🎮 Je rejoins
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'12px'}}>
        <button onClick={handleExtend}
          style={{padding:'12px',borderRadius:'12px',background:'#fff',border:'1px solid #eee',fontSize:'13px',fontWeight:'600',color:'#111',cursor:'pointer',fontFamily:'inherit'}}>
          +30 min
        </button>
        <button onClick={() => {}}
          style={{padding:'12px',borderRadius:'12px',background:'#fff',border:'1px solid #eee',fontSize:'13px',fontWeight:'600',color:'#e63946',cursor:'pointer',fontFamily:'inherit'}}>
          ⚡ Lancer un défi
        </button>
      </div>

      <div style={{background:'#fafaf9',border:'1px solid #eee',borderRadius:'14px',padding:'12px',marginBottom:'12px'}}>
        <div style={{fontSize:'11px',color:'#aaa',marginBottom:'8px',fontWeight:'600'}}>Réponses rapides</div>
        <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
          {["J'arrive 🎮", "2 min ⏱", "Go ! 🚀", "Pas dispo ❌"].map(r => (
            <button key={r}
              style={{padding:'6px 12px',borderRadius:'20px',background:'#fff',border:'1px solid #eee',fontSize:'11px',fontWeight:'600',color:'#111',cursor:'pointer',fontFamily:'inherit'}}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleStop}
        style={{width:'100%',padding:'13px',borderRadius:'12px',background:'#111',color:'#fff',border:'none',fontSize:'13px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit'}}>
        Stop
      </button>
    </div>
  )

  // PRÉ-BROADCAST
  return (
    <div>
      {/* Statut */}
      <div style={{margin:'12px 16px 10px',border:'1px solid #eee',borderRadius:'16px',overflow:'hidden'}}>
        <div style={{padding:'8px 14px',background:'#fafaf9',fontSize:'10px',fontWeight:'700',color:'#bbb',textTransform:'uppercase',letterSpacing:'.08em'}}>
          Je suis...
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr'}}>
          {statusOptions.map(s => (
            <div key={s.key} onClick={() => setStatus(s.key)}
              style={{padding:'14px 4px',display:'flex',flexDirection:'column',alignItems:'center',gap:'5px',cursor:'pointer',borderRight:'1px solid #eee',background:status===s.key?'#f0f9f0':'#fff'}}>
              <div style={{width:'32px',height:'32px',borderRadius:'50%',background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'15px'}}>
                {s.icon}
              </div>
              <span style={{fontSize:'10px',fontWeight:'600',color:status===s.key?'#111':'#bbb',textAlign:'center',lineHeight:'1.3'}}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Jeux */}
      {status !== 'off' && (
        <div style={{margin:'0 16px 10px',border:'1px solid #eee',borderRadius:'16px',overflow:'hidden'}}>
          <div style={{padding:'8px 14px',background:'#fafaf9',fontSize:'10px',fontWeight:'700',color:'#bbb',textTransform:'uppercase',letterSpacing:'.08em'}}>
            Je joue à...
          </div>
          {myGames.length === 0 ? (
            <div style={{padding:'14px',textAlign:'center',fontSize:'12px',color:'#bbb'}}>
              Ajoute des jeux dans ton Profil
            </div>
          ) : (
            myGames.slice(0, 6).map(g => (
              <div key={g.id} onClick={() => setSelectedGame(g)}
                style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',borderTop:'1px solid #f0f0f0',cursor:'pointer',background:selectedGame?.id===g.id?'#f0f9f0':'#fff'}}>
                <div style={{width:'32px',height:'32px',borderRadius:'8px',background:'#1a1a2e',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <span style={{fontSize:'8px',fontWeight:'700',color:'#fff'}}>{g.platform}</span>
                </div>
                <div style={{flex:1,fontSize:'13px',fontWeight:'600',color:'#111'}}>{g.game_name}</div>
                {selectedGame?.id===g.id && (
                  <div style={{width:'18px',height:'18px',borderRadius:'50%',background:'#EAF3DE',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <svg width="9" height="9" viewBox="0 0 9 9"><polyline points="1.5,4.5 3.5,6.5 7.5,2.5" stroke="#27500A" strokeWidth="1.5" fill="none"/></svg>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Quand */}
      {status !== 'off' && (
        <div style={{margin:'0 16px 10px',border:'1px solid #eee',borderRadius:'16px',overflow:'hidden'}}>
          <div style={{padding:'8px 14px',background:'#fafaf9',fontSize:'10px',fontWeight:'700',color:'#bbb',textTransform:'uppercase',letterSpacing:'.08em'}}>
            Quand ?
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr'}}>
            {whenOptions.map((w, i) => (
              <div key={w.key} onClick={() => setWhen(w.key)}
                style={{padding:'12px 14px',cursor:'pointer',borderTop:'1px solid #f0f0f0',borderRight:i%2===0?'1px solid #f0f0f0':'none',background:when===w.key?'#f0f9f0':'#fff',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={{fontSize:'12px',fontWeight:'600',color:when===w.key?'#111':'#888'}}>{w.label}</span>
                {when===w.key && <span style={{fontSize:'14px'}}>✓</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bouton broadcast */}
      <div style={{padding:'0 16px 16px'}}>
        <button onClick={handleBroadcast} disabled={loading}
          style={{width:'100%',padding:'14px',borderRadius:'12px',background:'#111',color:'#fff',border:'none',fontSize:'13px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit',opacity:loading?0.7:1,display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
          <svg width="16" height="16" viewBox="0 0 16 16"><polygon points="2,4 10,8 2,12" fill="#fff"/><line x1="12" y1="4" x2="12" y2="12" stroke="#fff" strokeWidth="1.5"/></svg>
          {loading ? 'Envoi...' : status === 'off' ? 'Effacer mon statut' : 'Je joue — qui vient ?'}
        </button>
      </div>
    </div>
  )
}