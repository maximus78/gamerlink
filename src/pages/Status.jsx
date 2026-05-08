import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'

export default function Status({ user, profile }) {
  const [status, setStatus] = useState('off')
  const [selectedGame, setSelectedGame] = useState(null)
  const [when, setWhen] = useState('now')
  const [loading, setLoading] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(null)
  const [myGames, setMyGames] = useState([])
  const [viewers, setViewers] = useState(0)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [friends, setFriends] = useState([])
  const [contacts, setContacts] = useState([])
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [selectedDefiGame, setSelectedDefiGame] = useState(null)
  const [currentDefis, setCurrentDefis] = useState([])
  const [activeTab, setActiveTab] = useState('statut')
  const [groupId] = useState(() => `group-${user.id}`)
  const [manualPhone, setManualPhone] = useState('')
  const [gameSearch, setGameSearch] = useState('')
  const [defiGameSearch, setDefiGameSearch] = useState('')
  const messagesEndRef = useRef(null)

  const fallbackDefis = [
    "Je suis meilleur que toi — prouve le contraire 😈",
    "On joue ensemble ce soir — perdant paie une tournée 🍺",
    "Challenge accepté — qui perd range sa chambre 😂",
    "On fait un marathon ce soir — dernier à tenir gagne 🏆",
  ]

  const hardcodedDefis = {
    'warzone': ["Je fais plus de kills que toi ce soir 🎯","On finit top 3 ensemble ou on arrête 💀","Je te bats en Gulag — t'as peur ? 😈","Une soirée sans mourir au premier cercle 😂"],
    'rocket league': ["On passe Diamant 2 ce soir ou on sleep pas 🚀","Je t'affronte en 1v1 — perdant reste en Or 😬","Best of 3 — perdant change de pseudo 24h 😅","On finit la saison en ranked ensemble 🏆"],
    'valorant': ["On monte en Platine ce soir 💎","Je fais plus d'headshots que toi 🎯","On clutch ensemble ou on rage quit 😤","Premier à 20 kills gagne 🍟"],
    'cs2': ["Je fais plus de 20 kills ce soir 💣","On finit le match avec un ratio positif 📈","Je te bats en duel — 1v1 sur Aim Map 🔫","On sort de Silver ce soir ou jamais 😭"],
    'counter-strike': ["Je fais plus de 20 kills ce soir 💣","On finit le match avec un ratio positif 📈","Je te bats en duel 🔫","On sort de Silver ce soir 😭"],
    'apex': ["On finit Champion ce soir 👑","Je fais plus de kills — perdant fait le café ☕","On tente le 20 kills badge 🔥","On joue sans armure légendaire 😅"],
    'fortnite': ["Je fais plus de kills en BR 🎯","On finit top 3 ensemble 🏆","Je construis mieux que toi 🏗️","On tente le no-build ranked 😤"],
    'league': ["On monte de rang ensemble 🏆","Je fais plus de kills/assists 💎","On tente une compo full carry 🚀","Je te prouve que mon champion est OP 😏"],
    'dota': ["On monte de rank ensemble 🏆","Je fais plus de kills 🗡️","On tente une compo full carry 🚀","Je te prouve que mon hero est meilleur 😏"],
    'minecraft': ["Je construis quelque chose de plus beau 🏗️","On survit ensemble en Hardcore ⚔️","Premier à un full set de diamants 💎","On construit une ville ensemble 🏙️"],
    'fc ': ["Je te mets 3-0 ⚽","On fait un tournoi entre potes 🏆","Premier à 5 buts gagne 🕹️","Je te montre comment jouer 😏"],
    'fifa': ["Je te mets 3-0 ⚽","On fait un tournoi entre potes 🏆","Premier à 5 buts gagne 🕹️","Je te prouve que mon équipe est meilleure 😏"],
    'pubg': ["On finit top 3 ensemble 💀","Premier Chicken Dinner ce soir 🍗","Je fais plus de kills en BR 🎯","On tente le solo squad 😤"],
  }

  const getLocalDefis = (gameName) => {
    if (!gameName) return fallbackDefis
    const lower = gameName.toLowerCase()
    const key = Object.keys(hardcodedDefis).find(k => lower.includes(k))
    return hardcodedDefis[key] || fallbackDefis
  }

  const fetchDefis = async (gameName) => {
    if (!gameName) { setCurrentDefis(fallbackDefis); return }
    try {
      const { data } = await supabase
        .from('game_defis').select('defis').ilike('game_name', `%${gameName}%`).limit(1).single()
      if (data?.defis && data.defis.length > 0) setCurrentDefis(data.defis)
      else setCurrentDefis(getLocalDefis(gameName))
    } catch(e) {
      setCurrentDefis(getLocalDefis(gameName))
    }
  }

  useEffect(() => {
    fetchCurrentStatus()
    fetchMyGames()
    fetchFriends()
    fetchContacts()
    fetchGroupMessages()
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('group-chat-' + groupId)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'group_messages', filter: `group_id=eq.${groupId}` },
        () => fetchGroupMessages())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  useEffect(() => {
    if (currentStatus) fetchDefis(currentStatus.game)
    else if (myGames.length > 0) fetchDefis(myGames[0].game_name)
    else setCurrentDefis(fallbackDefis)
  }, [currentStatus?.id, myGames.length])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchMyGames = async () => {
    const { data } = await supabase
      .from('user_games').select('*').eq('user_id', user.id)
      .order('hours_played', { ascending: false })
    setMyGames(data || [])
  }

  const fetchFriends = async () => {
    const { data: friendIds } = await supabase
      .from('friends').select('friend_id').eq('user_id', user.id)
    if (!friendIds || friendIds.length === 0) return
    const { data: profiles } = await supabase
      .from('profiles').select('id, name, phone, avatar_url')
      .in('id', friendIds.map(f => f.friend_id))
    setFriends(profiles || [])
  }

  const fetchContacts = async () => {
    const { data } = await supabase
      .from('contact_gamertags').select('*').eq('owner_id', user.id)
    setContacts(data || [])
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

  const fetchGroupMessages = async () => {
    const { data } = await supabase
      .from('group_messages')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true })
      .limit(50)
    setMessages(data || [])
  }

  const sendMessage = async (text) => {
    if (!text.trim()) return
    await supabase.from('group_messages').insert({
      group_id: groupId,
      user_id: user.id,
      user_name: profile?.name?.split(' ')[0] || 'Moi',
      message: text.trim()
    })
    setNewMessage('')
  }

  const lancerDefi = (defi) => {
    const myName = profile?.name?.split(' ')[0] || 'Ton pote'
    const game = selectedDefiGame?.game_name || currentStatus?.game || myGames[0]?.game_name || 'ce jeu'
    const phone = selectedFriend?.phone || selectedFriend?.contact_phone || manualPhone || ''
    const text = `🎮 ${myName} te défie sur ${game} — "${defi}"\n\nRéponds sur WhoPlays : ${window.location.origin}`
    window.open(`sms:${phone}?body=${encodeURIComponent(text)}`)
    setSelectedFriend(null)
    setManualPhone('')
  }

  const inviterAuChat = (friend) => {
    const myName = profile?.name?.split(' ')[0] || 'Ton pote'
    const game = currentStatus?.game || myGames[0]?.game_name || 'ce soir'
    const phone = friend?.phone || friend?.contact_phone || ''
    const text = `${myName} t'invite à jouer à ${game} — rejoins la session : ${window.location.origin}`
    window.open(`sms:${phone}?body=${encodeURIComponent(text)}`)
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
    setLoading(true)
    await supabase.from('statuses').delete().eq('user_id', user.id)
    const gameName = selectedGame?.game_name || 'Jeu libre'
    await supabase.from('statuses').insert({
      user_id: user.id, type: status, game: gameName, expires_at: getExpiry()
    })
    await supabase.from('status_history').insert({
      user_id: user.id, game: gameName, type: status,
      hour: new Date().getHours(), day_of_week: new Date().getDay()
    })
    await fetchCurrentStatus()
    setLoading(false)
  }

  const handleStop = async () => {
    await supabase.from('statuses').delete().eq('user_id', user.id)
    setCurrentStatus(null)
    setStatus('off')
    setSelectedGame(null)
  }

  const handleExtend = async () => {
    if (!currentStatus) return
    const newExpiry = new Date(currentStatus.expires_at)
    newExpiry.setMinutes(newExpiry.getMinutes() + 30)
    await supabase.from('statuses').update({ expires_at: newExpiry.toISOString() }).eq('id', currentStatus.id)
    await fetchCurrentStatus()
  }

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : '?'
  const getColor = (name) => ['#C0DD97','#CECBF6','#FAC775','#B5D4F4','#F5C4B3','#9FE1CB'][name ? name.charCodeAt(0)%6 : 0]
  const getTextColor = (name) => ['#27500A','#3C3489','#633806','#0C447C','#712B13','#085041'][name ? name.charCodeAt(0)%6 : 0]

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

  const quickReplies = ["J'arrive 🎮", "2 min ⏱", "Go ! 🚀", "Pas dispo ❌"]

  const allPotes = [
    ...friends.map(f => ({ ...f, type: 'app' })),
    ...contacts.map(c => ({ id: c.id, name: c.contact_name, phone: c.contact_phone, type: 'contact' }))
  ]

  const GamePills = ({ selectedId, onSelect, search, onSearch }) => {
    const filtered = search
      ? myGames.filter(g => g.game_name.toLowerCase().includes(search.toLowerCase()))
      : myGames.slice(0, 3)
    return (
      <div style={{padding:'10px 14px'}}>
        <input type="text" placeholder="Rechercher un jeu..."
          value={search} onChange={e => onSearch(e.target.value)}
          style={{width:'100%',padding:'7px 12px',border:'1px solid #eee',borderRadius:'10px',fontSize:'12px',color:'#111',fontFamily:'inherit',outline:'none',marginBottom:'10px',boxSizing:'border-box'}}/>
        <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
          {myGames.length === 0 ? (
            <div style={{fontSize:'12px',color:'#bbb'}}>Ajoute des jeux dans ton Profil</div>
          ) : filtered.length === 0 ? (
            <div style={{fontSize:'12px',color:'#bbb'}}>Aucun jeu trouvé</div>
          ) : (
            filtered.map(g => (
              <div key={g.id} onClick={() => onSelect(g)}
                style={{display:'flex',alignItems:'center',gap:'6px',padding:'6px 12px',borderRadius:'20px',border:`1px solid ${selectedId===g.id?'#111':'#eee'}`,background:selectedId===g.id?'#111':'#fff',cursor:'pointer',flexShrink:0}}>
                {g.cover_url ? (
                  <img src={g.cover_url} alt={g.game_name}
                    onError={e => e.target.style.display='none'}
                    style={{width:'18px',height:'18px',borderRadius:'4px',objectFit:'cover',flexShrink:0}}/>
                ) : null}
                <span style={{fontSize:'12px',fontWeight:'600',color:selectedId===g.id?'#fff':'#111',whiteSpace:'nowrap'}}>
                  {g.game_name}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  const PoteChip = ({ pote, selected, onSelect }) => (
    <div onClick={onSelect}
      style={{display:'flex',alignItems:'center',gap:'6px',padding:'6px 12px',borderRadius:'20px',border:`1px solid ${selected?'#111':'#eee'}`,background:selected?'#111':'#fff',cursor:'pointer',flexShrink:0}}>
      {pote.avatar_url ? (
        <img src={pote.avatar_url} alt={pote.name} style={{width:'22px',height:'22px',borderRadius:'50%',objectFit:'cover'}}/>
      ) : (
        <div style={{width:'22px',height:'22px',borderRadius:'50%',background:getColor(pote.name),display:'flex',alignItems:'center',justifyContent:'center',fontSize:'8px',fontWeight:'700',color:getTextColor(pote.name)}}>
          {getInitials(pote.name)}
        </div>
      )}
      <span style={{fontSize:'12px',fontWeight:'600',color:selected?'#fff':'#111'}}>
        {pote.name?.split(' ')[0]}
      </span>
      {pote.type === 'contact' && (
        <span style={{fontSize:'9px',color:selected?'#aaa':'#bbb'}}> sans app</span>
      )}
    </div>
  )

  const tabs = [
    { key: 'statut', label: '📡 Statut' },
    { key: 'defi', label: '⚡ Défi' },
    { key: 'chat', label: '💬 Chat' },
  ]

  return (
    <div>
      {/* Tabs */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',borderBottom:'1px solid #eee',background:'#fff'}}>
        {tabs.map(t => (
          <div key={t.key} onClick={() => setActiveTab(t.key)}
            style={{padding:'12px 4px',textAlign:'center',fontSize:'12px',fontWeight:activeTab===t.key?'700':'500',color:activeTab===t.key?'#111':'#aaa',cursor:'pointer',borderBottom:activeTab===t.key?'2px solid #111':'2px solid transparent'}}>
            {t.label}
          </div>
        ))}
      </div>

      {/* TAB STATUT */}
      {activeTab === 'statut' && (
        <div>
          {currentStatus && (
            <div style={{margin:'12px 16px 0',background:'#f0f9f0',border:'1px solid #d4edbb',borderRadius:'14px',padding:'12px 14px'}}>
              <div style={{fontSize:'11px',fontWeight:'700',color:'#639922',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'4px'}}>Statut actif</div>
              <div style={{fontSize:'15px',fontWeight:'700',color:'#111',marginBottom:'2px'}}>{currentStatus.game}</div>
              <div style={{fontSize:'11px',color:'#888'}}>
                {viewers > 0 ? `${viewers} pote${viewers > 1 ? 's' : ''} peuvent te voir` : 'Visible par tes potes'}
              </div>
              <div style={{display:'flex',gap:'8px',marginTop:'10px'}}>
                <button onClick={handleExtend}
                  style={{flex:1,padding:'9px',borderRadius:'10px',background:'#fff',border:'1px solid #eee',fontSize:'12px',fontWeight:'600',color:'#111',cursor:'pointer',fontFamily:'inherit'}}>
                  +30 min
                </button>
                <button onClick={handleStop}
                  style={{flex:1,padding:'9px',borderRadius:'10px',background:'#111',color:'#fff',border:'none',fontSize:'12px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit'}}>
                  Stop
                </button>
              </div>
            </div>
          )}

          <div style={{margin:'12px 16px 10px',border:'1px solid #eee',borderRadius:'16px',overflow:'hidden'}}>
            <div style={{padding:'8px 14px',background:'#fafaf9',fontSize:'10px',fontWeight:'700',color:'#bbb',textTransform:'uppercase',letterSpacing:'.08em'}}>Je suis...</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr'}}>
              {statusOptions.map(s => (
                <div key={s.key} onClick={() => setStatus(s.key)}
                  style={{padding:'14px 4px',display:'flex',flexDirection:'column',alignItems:'center',gap:'5px',cursor:'pointer',borderRight:'1px solid #eee',background:status===s.key?'#f0f9f0':'#fff'}}>
                  <div style={{width:'32px',height:'32px',borderRadius:'50%',background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'15px'}}>{s.icon}</div>
                  <span style={{fontSize:'10px',fontWeight:'600',color:status===s.key?'#111':'#bbb',textAlign:'center',lineHeight:'1.3'}}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {status !== 'off' && (
            <div style={{margin:'0 16px 10px',border:'1px solid #eee',borderRadius:'16px',overflow:'hidden'}}>
              <div style={{padding:'8px 14px',background:'#fafaf9',fontSize:'10px',fontWeight:'700',color:'#bbb',textTransform:'uppercase',letterSpacing:'.08em'}}>Je joue à...</div>
              <GamePills
                selectedId={selectedGame?.id}
                onSelect={setSelectedGame}
                search={gameSearch}
                onSearch={setGameSearch}
              />
            </div>
          )}

          {status !== 'off' && (
            <div style={{margin:'0 16px 10px',border:'1px solid #eee',borderRadius:'16px',overflow:'hidden'}}>
              <div style={{padding:'8px 14px',background:'#fafaf9',fontSize:'10px',fontWeight:'700',color:'#bbb',textTransform:'uppercase',letterSpacing:'.08em'}}>Quand ?</div>
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

          <div style={{padding:'0 16px 16px'}}>
            <button onClick={handleBroadcast} disabled={loading}
              style={{width:'100%',padding:'14px',borderRadius:'12px',background:'#111',color:'#fff',border:'none',fontSize:'13px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit',opacity:loading?0.7:1,display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
              <svg width="16" height="16" viewBox="0 0 16 16"><polygon points="2,4 10,8 2,12" fill="#fff"/><line x1="12" y1="4" x2="12" y2="12" stroke="#fff" strokeWidth="1.5"/></svg>
              {loading ? 'Envoi...' : status === 'off' ? 'Effacer mon statut' : 'Je joue — qui vient ?'}
            </button>
          </div>
        </div>
      )}

      {/* TAB DÉFI */}
      {activeTab === 'defi' && (
        <div style={{padding:'16px'}}>
          <div style={{fontSize:'12px',color:'#888',marginBottom:'14px'}}>
            Défie un pote — il reçoit un SMS avec le défi.
          </div>

          <div style={{marginBottom:'14px'}}>
            <div style={{fontSize:'10px',fontWeight:'700',color:'#bbb',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'8px'}}>Défier qui ?</div>
            {allPotes.length === 0 ? (
              <div style={{fontSize:'12px',color:'#bbb',padding:'12px',background:'#fafaf9',borderRadius:'12px',textAlign:'center'}}>Aucun pote pour l'instant</div>
            ) : (
              <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                {allPotes.map(f => (
                  <PoteChip key={f.id} pote={f}
                    selected={selectedFriend?.id === f.id}
                    onSelect={() => setSelectedFriend(selectedFriend?.id === f.id ? null : f)}/>
                ))}
              </div>
            )}
            <div style={{marginTop:'10px'}}>
              <input type="tel" placeholder="Ou entre un numéro directement..."
                value={manualPhone} onChange={e => setManualPhone(e.target.value)}
                style={{width:'100%',padding:'8px 12px',border:'1px solid #eee',borderRadius:'10px',fontSize:'12px',color:'#111',fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}/>
            </div>
          </div>

          <div style={{marginBottom:'14px',border:'1px solid #eee',borderRadius:'16px',overflow:'hidden'}}>
            <div style={{padding:'8px 14px',background:'#fafaf9',fontSize:'10px',fontWeight:'700',color:'#bbb',textTransform:'uppercase',letterSpacing:'.08em'}}>Sur quel jeu ?</div>
            <GamePills
              selectedId={selectedDefiGame?.id}
              onSelect={(g) => { setSelectedDefiGame(g); fetchDefis(g.game_name) }}
              search={defiGameSearch}
              onSearch={setDefiGameSearch}
            />
          </div>

          <div>
            <div style={{fontSize:'10px',fontWeight:'700',color:'#bbb',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'8px'}}>Choisis ton défi</div>
            {currentDefis.map((defi, i) => (
              <div key={i}
                onClick={() => (selectedFriend || manualPhone) ? lancerDefi(defi) : alert('Choisis d\'abord un pote !')}
                style={{padding:'12px',borderRadius:'12px',border:'1px solid #eee',marginBottom:'8px',cursor:'pointer',fontSize:'12px',color:'#111',fontWeight:'500',background:'#fafaf9',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'8px',opacity:(selectedFriend||manualPhone)?1:0.6}}
                onMouseEnter={e => e.currentTarget.style.background='#f0f0f0'}
                onMouseLeave={e => e.currentTarget.style.background='#fafaf9'}>
                <span>{defi}</span>
                <span style={{fontSize:'16px',flexShrink:0}}>→</span>
              </div>
            ))}
            {!selectedFriend && !manualPhone && (
              <div style={{fontSize:'11px',color:'#bbb',textAlign:'center',marginTop:'4px'}}>
                ↑ Choisis un pote ou entre un numéro
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CHAT */}
      {activeTab === 'chat' && (
        <div style={{padding:'16px'}}>
          <div style={{marginBottom:'14px'}}>
            <div style={{fontSize:'10px',fontWeight:'700',color:'#bbb',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'8px'}}>Inviter au chat</div>
            {allPotes.length === 0 ? (
              <div style={{fontSize:'12px',color:'#bbb',padding:'12px',background:'#fafaf9',borderRadius:'12px',textAlign:'center'}}>Aucun pote pour l'instant</div>
            ) : (
              <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                {allPotes.map(f => (
                  <div key={f.id} onClick={() => inviterAuChat(f)}
                    style={{display:'flex',alignItems:'center',gap:'6px',padding:'6px 12px',borderRadius:'20px',border:'1px solid #eee',background:'#fff',cursor:'pointer'}}>
                    {f.avatar_url ? (
                      <img src={f.avatar_url} alt={f.name} style={{width:'22px',height:'22px',borderRadius:'50%',objectFit:'cover'}}/>
                    ) : (
                      <div style={{width:'22px',height:'22px',borderRadius:'50%',background:getColor(f.name),display:'flex',alignItems:'center',justifyContent:'center',fontSize:'8px',fontWeight:'700',color:getTextColor(f.name)}}>
                        {getInitials(f.name)}
                      </div>
                    )}
                    <span style={{fontSize:'12px',fontWeight:'600',color:'#111'}}>{f.name?.split(' ')[0]}</span>
                    <span style={{fontSize:'10px',color:'#bbb'}}>SMS →</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{marginTop:'10px',display:'flex',gap:'8px'}}>
              <input type="tel" placeholder="Ou entre un numéro directement..."
                value={manualPhone} onChange={e => setManualPhone(e.target.value)}
                style={{flex:1,padding:'8px 12px',border:'1px solid #eee',borderRadius:'10px',fontSize:'12px',color:'#111',fontFamily:'inherit',outline:'none'}}/>
              {manualPhone && (
                <button onClick={() => inviterAuChat({ phone: manualPhone, name: manualPhone })}
                  style={{padding:'8px 12px',borderRadius:'10px',background:'#111',color:'#fff',border:'none',fontSize:'12px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit'}}>
                  SMS →
                </button>
              )}
            </div>
          </div>

          <div style={{border:'1px solid #eee',borderRadius:'14px',overflow:'hidden'}}>
            <div style={{padding:'10px 14px',background:'#fafaf9',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{fontSize:'11px',fontWeight:'700',color:'#888',textTransform:'uppercase',letterSpacing:'.06em'}}>Messages</span>
              {messages.length > 0 && <span style={{fontSize:'10px',color:'#bbb'}}>{messages.length} message{messages.length > 1 ? 's' : ''}</span>}
            </div>

            <div style={{maxHeight:'220px',overflowY:'auto',padding:'8px 12px',background:'#fff'}}>
              {messages.length === 0 ? (
                <div style={{textAlign:'center',padding:'20px 0',fontSize:'11px',color:'#bbb'}}>
                  Lance la discussion !
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.user_id === user.id
                  const name = m.user_name || '?'
                  return (
                    <div key={m.id} style={{display:'flex',gap:'6px',marginBottom:'8px',flexDirection:isMe?'row-reverse':'row'}}>
                      {!isMe && (
                        <div style={{width:'24px',height:'24px',borderRadius:'50%',background:getColor(name),display:'flex',alignItems:'center',justifyContent:'center',fontSize:'9px',fontWeight:'700',color:getTextColor(name),flexShrink:0,marginTop:'2px'}}>
                          {getInitials(name)}
                        </div>
                      )}
                      <div style={{maxWidth:'75%'}}>
                        {!isMe && <div style={{fontSize:'9px',color:'#aaa',marginBottom:'2px',fontWeight:'600'}}>{name}</div>}
                        <div style={{padding:'7px 10px',borderRadius:isMe?'12px 12px 4px 12px':'12px 12px 12px 4px',background:isMe?'#111':'#f5f5f5',color:isMe?'#fff':'#111',fontSize:'12px',lineHeight:'1.4'}}>
                          {m.message}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef}/>
            </div>

            <div style={{padding:'8px 12px',borderTop:'1px solid #f5f5f5',background:'#fafaf9',display:'flex',gap:'6px',flexWrap:'wrap'}}>
              {quickReplies.map(r => (
                <button key={r} onClick={() => sendMessage(r)}
                  style={{padding:'5px 10px',borderRadius:'20px',background:'#fff',border:'1px solid #eee',fontSize:'11px',fontWeight:'600',color:'#111',cursor:'pointer',fontFamily:'inherit'}}>
                  {r}
                </button>
              ))}
            </div>

            <div style={{padding:'8px 12px',borderTop:'1px solid #f5f5f5',display:'flex',gap:'8px',background:'#fff'}}>
              <input type="text" placeholder="Écris un message..."
                value={newMessage} onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage(newMessage)}
                style={{flex:1,padding:'8px 12px',border:'1px solid #eee',borderRadius:'20px',fontSize:'12px',color:'#111',fontFamily:'inherit',outline:'none'}}/>
              <button onClick={() => sendMessage(newMessage)} disabled={!newMessage.trim()}
                style={{padding:'8px 14px',borderRadius:'20px',background:'#111',color:'#fff',border:'none',fontSize:'12px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit',opacity:!newMessage.trim()?0.4:1}}>
                →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}