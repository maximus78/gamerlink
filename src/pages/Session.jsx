import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Session({ user, profile }) {
  const [sessions, setSessions] = useState([])
  const [game, setGame] = useState('Warzone')
  const [heure, setHeure] = useState('Ce soir — 21h00')
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)

  const games = ['Warzone', 'FC 26', 'Rocket League', 'Valorant', 'Apex Legends', 'CS2']
  const heures = ['Ce soir — 21h00', 'Ce soir — 21h30', 'Ce soir — 22h00', 'Demain — 20h00', 'Demain — 21h00']

  useEffect(() => {
    fetchSessions()
    const channel = supabase
      .channel('sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, () => fetchSessions())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from('sessions')
      .select('*, profiles(name)')
      .order('created_at', { ascending: false })
      .limit(10)
    if (error) console.error('fetchSessions error:', error)
    setSessions(data || [])
    setLoading(false)
  }

  const createSession = async () => {
  setCreating(true)
  await supabase.from('sessions').delete().eq('created_by', user.id)
  const { error } = await supabase.from('sessions').insert({
    created_by: user.id,
    game: game,
    scheduled_at: new Date().toISOString(),
    is_live: true,
    players: [user.id]
  })
  if (error) alert('Erreur : ' + error.message)
  await fetchSessions()
  setCreating(false)
}
  const joinSession = async (session) => {
    const players = session.players || []
    if (players.includes(user.id)) return
    const { error } = await supabase.from('sessions').update({
      players: [...players, user.id]
    }).eq('id', session.id)
    if (error) alert('Erreur rejoindre : ' + error.message)
  }

  const leaveSession = async (session) => {
    const players = (session.players || []).filter(p => p !== user.id)
    await supabase.from('sessions').update({ players }).eq('id', session.id)
  }

  const deleteSession = async (id) => {
    await supabase.from('sessions').delete().eq('id', id)
  }

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : '?'

  const timeAgo = (date) => {
    const mins = Math.floor((new Date() - new Date(date)) / 60000)
    if (mins < 1) return 'à l\'instant'
    if (mins < 60) return `il y a ${mins} min`
    return `il y a ${Math.floor(mins/60)}h`
  }

  return (
    <div>
      {sessions.length > 0 && (
        <div style={{margin:'12px 16px 0'}}>
          <div style={{fontSize:'10px',fontWeight:'700',color:'#bbb',letterSpacing:'.08em',textTransform:'uppercase',marginBottom:'8px'}}>
            Sessions en cours
          </div>
          {sessions.map(s => {
            const isMe = s.created_by === user.id
            const isIn = (s.players || []).includes(user.id)
            const name = s.profiles?.name || 'Joueur'
            return (
              <div key={s.id} style={{border:'1px solid #eee',borderRadius:'16px',overflow:'hidden',marginBottom:'10px'}}>
                <div style={{height:'60px',position:'relative',display:'flex',alignItems:'flex-end',padding:'8px 12px'}}>
                  <div style={{position:'absolute',inset:0,background:'#1a1a2e'}}></div>
                  <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,.65),rgba(0,0,0,.1))'}}></div>
                  <div style={{position:'relative',zIndex:1,width:'100%',display:'flex',alignItems:'flex-end',justifyContent:'space-between'}}>
                    <div>
                      <div style={{fontSize:'14px',fontWeight:'700',color:'#fff'}}>{s.game}</div>
                      <div style={{fontSize:'11px',color:'rgba(255,255,255,.65)',marginTop:'1px'}}>
                        Lancée par {name} · {timeAgo(s.created_at)}
                      </div>
                    </div>
                    <span style={{fontSize:'10px',fontWeight:'700',background:'#e63946',color:'#fff',padding:'3px 9px',borderRadius:'20px'}}>
                      Live
                    </span>
                  </div>
                </div>
                <div style={{padding:'10px 12px',display:'flex',alignItems:'center',gap:'8px'}}>
                  <div style={{display:'flex',flex:1,alignItems:'center'}}>
                    {(s.players || []).slice(0,4).map((p,i) => (
                      <div key={i} style={{width:'26px',height:'26px',borderRadius:'50%',background:'#EAF3DE',color:'#27500A',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'9px',fontWeight:'700',border:'2px solid #fff',marginLeft:i===0?'0':'-7px',flexShrink:0}}>
                        {p === user.id ? getInitials(profile?.name) : '?'}
                      </div>
                    ))}
                    <span style={{fontSize:'11px',color:'#888',marginLeft:'8px'}}>
                      {(s.players||[]).length} joueur{(s.players||[]).length>1?'s':''}
                    </span>
                  </div>
                  <div style={{display:'flex',gap:'6px'}}>
                    {isMe ? (
                      <button onClick={() => deleteSession(s.id)}
                        style={{padding:'6px 12px',borderRadius:'10px',border:'1px solid #eee',background:'#fff',fontSize:'11px',fontWeight:'600',color:'#e63946',cursor:'pointer',fontFamily:'inherit'}}>
                        Annuler
                      </button>
                    ) : isIn ? (
                      <button onClick={() => leaveSession(s)}
                        style={{padding:'6px 12px',borderRadius:'10px',border:'1px solid #eee',background:'#fff',fontSize:'11px',fontWeight:'600',color:'#888',cursor:'pointer',fontFamily:'inherit'}}>
                        Quitter
                      </button>
                    ) : (
                      <button onClick={() => joinSession(s)}
                        style={{padding:'6px 12px',borderRadius:'10px',border:'1.5px solid #3B6D11',background:'#EAF3DE',fontSize:'11px',fontWeight:'700',color:'#27500A',cursor:'pointer',fontFamily:'inherit'}}>
                        Rejoindre
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {sessions.length === 0 && !loading && (
        <div style={{padding:'30px 16px',textAlign:'center'}}>
          <div style={{fontSize:'28px',marginBottom:'10px'}}>🎮</div>
          <div style={{fontSize:'14px',fontWeight:'600',color:'#111',marginBottom:'6px'}}>Aucune session en cours</div>
          <div style={{fontSize:'12px',color:'#aaa',lineHeight:'1.5'}}>Lance une session et tes potes pourront te rejoindre en temps réel.</div>
        </div>
      )}

      <div style={{margin:'12px 16px',border:'1px solid #eee',borderRadius:'16px',padding:'14px'}}>
        <div style={{fontSize:'13px',fontWeight:'600',color:'#111',marginBottom:'12px'}}>Lancer une session</div>
        <div style={{fontSize:'11px',fontWeight:'600',color:'#aaa',marginBottom:'5px'}}>Jeu</div>
        <select value={game} onChange={e => setGame(e.target.value)}
          style={{width:'100%',padding:'9px 12px',border:'1px solid #eee',borderRadius:'10px',fontSize:'13px',color:'#111',background:'#fff',fontFamily:'inherit',marginBottom:'10px'}}>
          {games.map(g => <option key={g}>{g}</option>)}
        </select>
        <div style={{fontSize:'11px',fontWeight:'600',color:'#aaa',marginBottom:'5px'}}>Heure</div>
        <select value={heure} onChange={e => setHeure(e.target.value)}
          style={{width:'100%',padding:'9px 12px',border:'1px solid #eee',borderRadius:'10px',fontSize:'13px',color:'#111',background:'#fff',fontFamily:'inherit',marginBottom:'12px'}}>
          {heures.map(h => <option key={h}>{h}</option>)}
        </select>
        <button onClick={createSession} disabled={creating}
          style={{width:'100%',padding:'12px',borderRadius:'12px',background:creating?'#888':'#111',color:'#fff',border:'none',fontSize:'13px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit'}}>
          {creating ? 'Création...' : '+ Lancer — qui vient ?'}
        </button>
        <div style={{fontSize:'11px',color:'#aaa',marginTop:'8px',lineHeight:'1.5',textAlign:'center'}}>
          Tes potes verront la session apparaître instantanément.
        </div>
      </div>
    </div>
  )
}