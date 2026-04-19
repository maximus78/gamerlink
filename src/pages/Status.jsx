import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Status({ user, profile }) {
  const [status, setStatus] = useState('off')
  const [game, setGame] = useState('wz')
  const [dur, setDur] = useState('2h')
  const [currentStatus, setCurrentStatus] = useState(null)
  const [myGames, setMyGames] = useState([])
  const [newGame, setNewGame] = useState('')
  const [newPlatform, setNewPlatform] = useState('Steam')
  const [showAddGame, setShowAddGame] = useState(false)
  const [loading, setLoading] = useState(false)

  const predefinedGames = [
    { key:'wz', name:'Warzone', bg:'#1a1a2e' },
    { key:'fc', name:'FC 26', bg:'#00875a' },
    { key:'rl', name:'Rocket League', bg:'#0d1b2a' },
    { key:'val', name:'Valorant', bg:'#ff4655' },
    { key:'apex', name:'Apex Legends', bg:'#cd3333' },
    { key:'cs2', name:'CS2', bg:'#1b2838' },
  ]

  const platforms = ['Steam','Xbox','PS','Epic','Discord']

  useEffect(() => {
    fetchCurrentStatus()
    fetchMyGames()
  }, [])

  const fetchCurrentStatus = async () => {
    const { data } = await supabase
      .from('statuses')
      .select('*')
      .eq('user_id', user.id)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
    if (data && data.length > 0) {
      setCurrentStatus(data[0])
      setStatus(data[0].type)
    } else {
      setCurrentStatus(null)
    }
  }

  const fetchMyGames = async () => {
    const { data } = await supabase
      .from('user_games').select('*').eq('user_id', user.id)
      .order('hours_played', { ascending: false })
    setMyGames(data || [])
  }

  const handleBroadcast = async () => {
    setLoading(true)
    await supabase.from('statuses').delete().eq('user_id', user.id)
    if (status !== 'off') {
      const expiresAt = new Date()
      const hours = { '1h':1, '2h':2, '3h':3, 'Soirée':6 }
      expiresAt.setHours(expiresAt.getHours() + hours[dur])
      const selectedGame = predefinedGames.find(g => g.key === game)
      await supabase.from('statuses').insert({
        user_id: user.id, type: status,
        game: selectedGame?.name || game,
        expires_at: expiresAt.toISOString()
      })
    }
    await fetchCurrentStatus()
    setLoading(false)
    alert(status === 'off' ? 'Statut effacé' : 'Statut activé !')
  }

  const handleAddGame = async () => {
    if (!newGame.trim()) return
    await supabase.from('user_games').upsert({
      user_id: user.id,
      game_name: newGame.trim(),
      platform: newPlatform,
      last_played: new Date().toISOString()
    }, { onConflict: 'user_id,game_name' })
    setNewGame('')
    setShowAddGame(false)
    fetchMyGames()
  }

  const handleDeleteGame = async (id) => {
    await supabase.from('user_games').delete().eq('id', id)
    fetchMyGames()
  }

  const platformColors = {
    'Steam': { bg:'#1b2838', color:'#c7d5e0' },
    'Xbox': { bg:'#107c10', color:'#fff' },
    'PS': { bg:'#003087', color:'#fff' },
    'Epic': { bg:'#2d2d2d', color:'#fff' },
    'Discord': { bg:'#5865F2', color:'#fff' }
  }

  return (
    <div>
      <div style={{margin:'12px 16px 10px',border:'1px solid #eee',borderRadius:'16px',overflow:'hidden'}}>
        <div style={{padding:'11px 14px',background:'#fafaf9',display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'38px',height:'38px',borderRadius:'50%',background:'#EAF3DE',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',fontWeight:'700',color:'#27500A'}}>
            {profile?.name?.charAt(0) || 'T'}
          </div>
          <div>
            <div style={{fontSize:'14px',fontWeight:'600',color:'#111'}}>{profile?.name?.split(' ')[0] || 'Toi'}</div>
            <div style={{fontSize:'11px',color:'#888',marginTop:'2px',display:'flex',alignItems:'center',gap:'4px'}}>
              <span style={{width:'7px',height:'7px',borderRadius:'50%',background:currentStatus?'#639922':'#ccc',display:'inline-block'}}></span>
              {currentStatus ? `${currentStatus.game} · actif` : 'Pas dispo'}
            </div>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr'}}>
          {[
            { key:'game', label:'En game', color:'#EAF3DE', icon:'▶' },
            { key:'hot', label:'Chaud pour jouer', color:'#FCEBEB', icon:'🔥' },
            { key:'off', label:'Pas dispo', color:'#f5f5f5', icon:'✕' }
          ].map(s => (
            <div key={s.key} onClick={() => setStatus(s.key)}
              style={{padding:'12px 4px',display:'flex',flexDirection:'column',alignItems:'center',gap:'5px',cursor:'pointer',borderRight:'1px solid #eee',borderTop:'1px solid #eee',background:status===s.key?'#f0f9f0':'#fff'}}>
              <div style={{width:'30px',height:'30px',borderRadius:'50%',background:s.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px'}}>{s.icon}</div>
              <span style={{fontSize:'10px',fontWeight:'600',color:status===s.key?'#111':'#bbb',textAlign:'center',lineHeight:'1.3'}}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{margin:'0 16px 10px',border:'1px solid #eee',borderRadius:'16px',overflow:'hidden'}}>
        <div style={{padding:'8px 14px',background:'#fafaf9',fontSize:'10px',fontWeight:'700',color:'#bbb',textTransform:'uppercase',letterSpacing:'.08em'}}>Quel jeu ce soir ?</div>
        {predefinedGames.map(g => (
          <div key={g.key} onClick={() => setGame(g.key)}
            style={{display:'flex',alignItems:'center',gap:'10px',padding:'9px 14px',borderTop:'1px solid #f0f0f0',cursor:'pointer',background:game===g.key?'#f0f9f0':'#fff'}}>
            <div style={{width:'36px',height:'36px',borderRadius:'9px',background:g.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <svg width="18" height="18" viewBox="0 0 18 18"><rect x="2" y="8" width="14" height="2.5" fill="#e63946" rx="1.2"/><rect x="7.75" y="2" width="2.5" height="14" fill="#e63946" rx="1.2"/></svg>
            </div>
            <div style={{flex:1,fontSize:'13px',fontWeight:'600',color:'#111'}}>{g.name}</div>
            {game===g.key && <div style={{width:'18px',height:'18px',borderRadius:'50%',background:'#EAF3DE',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="9" height="9" viewBox="0 0 9 9"><polyline points="1.5,4.5 3.5,6.5 7.5,2.5" stroke="#27500A" strokeWidth="1.5" fill="none"/></svg>
            </div>}
          </div>
        ))}
      </div>

      <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'0 16px 10px'}}>
        <span style={{fontSize:'11px',color:'#bbb',flex:1}}>Durée estimée</span>
        <div style={{display:'flex',gap:'4px'}}>
          {['1h','2h','3h','Soirée'].map(d => (
            <button key={d} onClick={() => setDur(d)}
              style={{fontSize:'10px',padding:'4px 9px',borderRadius:'20px',border:'1px solid',cursor:'pointer',fontFamily:'inherit',
                borderColor:dur===d?'#111':'#eee',background:dur===d?'#111':'#fff',color:dur===d?'#fff':'#aaa'}}>
              {d}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleBroadcast} disabled={loading}
        style={{margin:'0 16px 14px',width:'calc(100% - 32px)',padding:'13px',borderRadius:'12px',background:'#111',color:'#fff',border:'none',fontSize:'13px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',opacity:loading?0.7:1}}>
        <svg width="16" height="16" viewBox="0 0 16 16"><polygon points="2,4 10,8 2,12" fill="#fff"/><line x1="12" y1="4" x2="12" y2="12" stroke="#fff" strokeWidth="1.5"/></svg>
        {loading ? 'Envoi...' : 'Je joue — qui vient ?'}
      </button>

      <div style={{margin:'0 16px',border:'1px solid #eee',borderRadius:'16px',overflow:'hidden',marginBottom:'14px'}}>
        <div style={{padding:'10px 14px',background:'#fafaf9',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontSize:'11px',fontWeight:'700',color:'#888',textTransform:'uppercase',letterSpacing:'.06em'}}>Mes jeux</span>
          <button onClick={() => setShowAddGame(!showAddGame)}
            style={{fontSize:'11px',color:'#185FA5',fontWeight:'600',background:'none',border:'none',cursor:'pointer',fontFamily:'inherit'}}>
            {showAddGame ? 'Fermer' : '+ Ajouter'}
          </button>
        </div>

        {showAddGame && (
          <div style={{padding:'12px',borderTop:'1px solid #f0f0f0',background:'#fafaf9'}}>
            <div style={{display:'flex',gap:'6px',marginBottom:'8px'}}>
              <input type="text" placeholder="Nom du jeu..." value={newGame}
                onChange={e => setNewGame(e.target.value)}
                onKeyDown={e => e.key==='Enter' && handleAddGame()}
                style={{flex:1,padding:'8px 12px',border:'1px solid #eee',borderRadius:'10px',fontSize:'13px',color:'#111',fontFamily:'inherit',outline:'none'}}/>
              <select value={newPlatform} onChange={e => setNewPlatform(e.target.value)}
                style={{padding:'8px 10px',border:'1px solid #eee',borderRadius:'10px',fontSize:'12px',color:'#111',fontFamily:'inherit',background:'#fff'}}>
                {platforms.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <button onClick={handleAddGame} disabled={!newGame.trim()}
              style={{width:'100%',padding:'9px',borderRadius:'10px',background:'#111',color:'#fff',border:'none',fontSize:'12px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit',opacity:!newGame.trim()?0.5:1}}>
              Ajouter ce jeu
            </button>
          </div>
        )}

        {myGames.length === 0 && !showAddGame && (
          <div style={{padding:'16px',textAlign:'center',fontSize:'12px',color:'#bbb'}}>
            Ajoute tes jeux pour que tes potes sachent à quoi tu joues
          </div>
        )}

        {myGames.map(g => (
          <div key={g.id} style={{display:'flex',alignItems:'center',gap:'10px',padding:'9px 14px',borderTop:'1px solid #f0f0f0'}}>
            <div style={{width:'32px',height:'32px',borderRadius:'8px',background:platformColors[g.platform]?.bg||'#eee',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <span style={{fontSize:'9px',fontWeight:'700',color:platformColors[g.platform]?.color||'#888'}}>{g.platform}</span>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:'13px',fontWeight:'600',color:'#111'}}>{g.game_name}</div>
              <div style={{fontSize:'10px',color:'#aaa',marginTop:'1px'}}>{g.platform}</div>
            </div>
            <button onClick={() => handleDeleteGame(g.id)}
              style={{background:'none',border:'none',cursor:'pointer',color:'#ddd',fontSize:'16px',padding:'4px'}}>
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}