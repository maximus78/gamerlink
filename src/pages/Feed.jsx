import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import ProfilPote from './ProfilPote'

export default function Feed({ user, profile }) {
  const [statuses, setStatuses] = useState([])
  const [contacts, setContacts] = useState([])
  const [userGames, setUserGames] = useState({})
  const [userHabits, setUserHabits] = useState({})
  const [loading, setLoading] = useState(true)
  const [inviting, setInviting] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [contactName, setContactName] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [selectedPote, setSelectedPote] = useState(null)
  const [selectedContact, setSelectedContact] = useState(null)
  const [search, setSearch] = useState('')
  const [scanning, setScanning] = useState(false)
  const [scanDone, setScanDone] = useState(false)
  const [scanResult, setScanResult] = useState(null)

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  const myName = profile?.name?.split(' ')[0] || 'Ton pote'
  const contactsSupported = 'contacts' in navigator && 'ContactsManager' in window

  const PlatformLogo = ({ platform, size = 14 }) => {
    const logos = {
      Steam: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.029 4.524 4.524s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.606 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.497 1.009 2.452-.397.957-1.497 1.41-2.455 1.015zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.662 0 3.015-1.35 3.015-3.015zm-5.273.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.252 0-2.265-1.014-2.265-2.265z"/></svg>,
      Xbox: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M4.102 7.062C2.908 8.418 2.139 10.2 2.021 12.15c.194 2.014 1.026 3.864 2.312 5.319C5.346 14.607 7.777 11.937 10.32 9.645c-1.297-1.269-4.023-3.177-6.218-2.583zM12 2.021c-1.293.024-2.533.36-3.627.958C10.14 4.51 12.721 6.98 14.1 8.87c1.383-1.893 3.963-4.36 5.727-5.891A9.888 9.888 0 0 0 12 2.021zm7.898 5.041c-2.195-.594-4.921 1.314-6.218 2.583 2.543 2.292 4.974 4.962 5.987 7.824 1.286-1.455 2.118-3.305 2.312-5.319a9.962 9.962 0 0 0-2.081-5.088zM5.697 18.445C7.207 19.95 9.493 20.927 12 20.979c2.507-.052 4.793-1.029 6.303-2.534C16.886 15.78 14.469 13.12 12 10.82c-2.469 2.3-4.886 4.96-6.303 7.625z"/></svg>,
      PS: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M8.984 2.596v16.71l3.915 1.261V6.688c0-.69.304-1.151.794-.991.636.181.76.814.76 1.504v5.876c1.735.895 3.03.07 3.03-2.437 0-2.492-.87-3.837-3.428-4.691-1.366-.45-3.505-1.02-5.071-1.353zm9.806 14.239c-1.79.499-3.667.249-5.126-.57v1.807c1.184.66 2.744.994 4.582.596 2.092-.445 3.135-1.735 3.135-3.193 0-1.504-.889-2.535-3.135-3.148l-2.46-.769v4.683c.736.42 1.565.594 2.46.594h.544zm-12.48-.664c-1.58.414-2.808.144-3.424-.57-.593-.693-.511-1.807.57-2.596.77-.569 2.013-.974 3.424-1.19v-1.74c-1.79.245-3.414.83-4.582 1.807-1.52 1.262-1.655 3.078-.413 4.445 1.243 1.367 3.59 1.807 5.845 1.191l-1.42-.347z"/></svg>,
      Epic: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M4 2h16v4H8v4h8v4H8v4h12v4H4V2z"/></svg>,
      Discord: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.101 18.08.114 18.1.136 18.116a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>,
    }
    return logos[platform] || null
  }

  const platformColors = {
    Steam: { bg: '#1b2838', color: '#c7d5e0' },
    Xbox: { bg: '#107c10', color: '#fff' },
    PS: { bg: '#003087', color: '#fff' },
    Epic: { bg: '#2d2d2d', color: '#fff' },
    Discord: { bg: '#5865F2', color: '#fff' }
  }

  const GameBubbles = ({ games }) => {
    const top = games.filter(g => g.cover_url).slice(0, 5)
    if (top.length === 0) return null
    return (
      <div style={{display:'flex',marginBottom:'8px'}}>
        {top.map((g, i) => (
          <div key={i} style={{
            width:'28px', height:'28px', borderRadius:'50%',
            border:'2px solid #fff', overflow:'hidden',
            marginLeft: i === 0 ? '0' : '-8px',
            background: platformColors[g.platform]?.bg || '#333',
            zIndex: top.length - i,
            position:'relative', flexShrink:0,
            boxShadow:'0 1px 3px rgba(0,0,0,0.2)'
          }}>
            <img src={g.cover_url} alt={g.game_name}
              style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          </div>
        ))}
      </div>
    )
  }

  useEffect(() => {
    fetchAll()
    const channel = supabase
      .channel('feed-' + user.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'statuses' }, () => fetchStatuses())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_gamertags' }, () => fetchContacts())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const fetchAll = async () => {
    await Promise.all([fetchStatuses(), fetchContacts()])
  }

  const fetchStatuses = async () => {
    const { data: friends } = await supabase
      .from('friends').select('friend_id').eq('user_id', user.id)
    const friendIds = (friends || []).map(f => f.friend_id)
    friendIds.push(user.id)
    const { data } = await supabase
      .from('statuses')
      .select('*, profiles(id, name, phone, avatar_url)')
      .gt('expires_at', new Date().toISOString())
      .in('user_id', friendIds)
      .order('created_at', { ascending: false })

    const hasMyStatus = (data || []).some(s => s.user_id === user.id)
    const allStatuses = hasMyStatus ? (data || []) : [
      {
        id: 'me-placeholder',
        user_id: user.id,
        type: 'off',
        game: null,
        expires_at: null,
        invited_friends: [],
        scheduled_when: null,
        profiles: {
          id: user.id,
          name: profile?.name,
          avatar_url: profile?.avatar_url,
          phone: profile?.phone
        }
      },
      ...(data || [])
    ]

    setStatuses(allStatuses)
    const ids = [...new Set([...allStatuses.map(s => s.user_id)])]
    fetchGamesForUsers(ids)
    fetchHabitsForUsers(ids)
    setLoading(false)
  }

  const fetchGamesForUsers = async (userIds) => {
    if (!userIds || userIds.length === 0) return
    const { data } = await supabase
      .from('user_games').select('*').in('user_id', userIds)
      .order('hours_played', { ascending: false })
    if (data) {
      const grouped = {}
      data.forEach(g => {
        if (!grouped[g.user_id]) grouped[g.user_id] = []
        grouped[g.user_id].push(g)
      })
      setUserGames(prev => ({ ...prev, ...grouped }))
    }
  }

  const fetchHabitsForUsers = async (userIds) => {
    if (!userIds || userIds.length === 0) return
    const { data } = await supabase
      .from('status_history').select('user_id, hour, day_of_week')
      .in('user_id', userIds)
    if (data) {
      const habits = {}
      data.forEach(h => {
        if (!habits[h.user_id]) habits[h.user_id] = { hours: [], days: [] }
        habits[h.user_id].hours.push(h.hour)
        habits[h.user_id].days.push(h.day_of_week)
      })
      const result = {}
      Object.entries(habits).forEach(([uid, h]) => {
        const avgHour = h.hours.reduce((a, b) => a + b, 0) / h.hours.length
        const weekendCount = h.days.filter(d => d === 0 || d === 6).length
        const isWeekend = weekendCount / h.days.length > 0.5
        let timeLabel = ''
        if (avgHour >= 6 && avgHour < 12) timeLabel = '🌅 Matin'
        else if (avgHour >= 12 && avgHour < 18) timeLabel = '☀️ Après-midi'
        else if (avgHour >= 18 && avgHour < 22) timeLabel = '🌙 Soir'
        else timeLabel = '🌃 Nuit'
        result[uid] = { timeLabel, isWeekend }
      })
      setUserHabits(result)
    }
  }

  const fetchContacts = async () => {
    const { data } = await supabase
      .from('contact_gamertags').select('*').eq('owner_id', user.id)
    setContacts(data || [])
  }

  const getGenres = (games) => {
    const genreMap = {
      'warzone': 'FPS', 'cs2': 'FPS', 'valorant': 'FPS', 'apex': 'FPS', 'overwatch': 'FPS', 'battlefield': 'FPS', 'cod': 'FPS', 'xdefiant': 'FPS',
      'rocket league': 'Sport', 'fc ': 'Sport', 'fifa': 'Sport', 'nba': 'Sport', 'nhl': 'Sport',
      'fortnite': 'Battle Royale', 'pubg': 'Battle Royale',
      'league': 'MOBA', 'dota': 'MOBA',
      'minecraft': 'Survie', 'rust': 'Survie',
      'wow': 'RPG', 'elden': 'RPG', 'witcher': 'RPG', 'diablo': 'RPG',
      'gta': 'Open World', 'among': 'Party',
    }
    const genres = new Set()
    games.forEach(g => {
      const name = g.game_name?.toLowerCase() || ''
      Object.entries(genreMap).forEach(([key, genre]) => {
        if (name.includes(key)) genres.add(genre)
      })
    })
    return [...genres].slice(0, 3)
  }

  const handleScanContacts = async () => {
    if (!contactsSupported) { alert('Le scan de contacts n\'est disponible que sur mobile'); return }
    setScanning(true)
    try {
      const rawContacts = await navigator.contacts.select(['name', 'tel'], { multiple: true })
      if (!rawContacts || rawContacts.length === 0) { setScanning(false); return }
      const phones = []
      rawContacts.forEach(c => {
        ;(c.tel || []).forEach(tel => {
          const clean = tel.replace(/\s/g, '').replace(/\./g, '').replace(/-/g, '')
          if (clean) phones.push(clean)
        })
      })
      if (phones.length === 0) { setScanning(false); return }
      const { data: matches } = await supabase.from('profiles').select('id, name, phone, avatar_url').in('phone', phones)
      let newFriends = 0
      if (matches && matches.length > 0) {
        for (const match of matches) {
          if (match.id === user.id) continue
          const { error } = await supabase.from('friends').upsert({ user_id: user.id, friend_id: match.id }, { onConflict: 'user_id,friend_id' })
          if (!error) newFriends++
          await supabase.from('friends').upsert({ user_id: match.id, friend_id: user.id }, { onConflict: 'user_id,friend_id' })
        }
      }
      setScanResult({ total: phones.length, found: newFriends })
      setScanDone(true)
      await fetchStatuses()
    } catch(e) { console.error(e) }
    setScanning(false)
  }

  const generateInvite = async () => {
    if (!contactName.trim()) return
    setInviting(true)
    const { data } = await supabase.from('invitations').insert({ created_by: user.id, contact_name: contactName }).select().single()
    if (data) setInviteLink(`${window.location.origin}?token=${data.token}`)
    setInviting(false)
  }

  const handleRejoindre = (s) => {
    const text = `Yo ! Je te rejoins sur ${s.game} 🎮 — WhoPlays`
    if (isMobile) window.open(`sms:${s.profiles?.phone || ''}?body=${encodeURIComponent(text)}`)
    else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`)
  }

  const handleInviterContact = (c) => {
    window.open(`sms:?body=${encodeURIComponent(`${myName} t'invite sur WhoPlays — viens voir à quoi on joue ce soir : ${window.location.origin}`)}`)
  }

  const shareText = `${myName} veut savoir à quoi tu joues sur WhoPlays. Renseigne ton pseudo en 30 sec 👇\n${inviteLink}`
  const shareNative = async () => {
    if (navigator.share) { try { await navigator.share({ title: 'WhoPlays', text: shareText, url: inviteLink }) } catch(e) {} }
    else { navigator.clipboard.writeText(inviteLink); alert('Lien copié !') }
  }
  const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`)
  const shareSMS = () => window.open(`sms:?body=${encodeURIComponent(shareText)}`)
  const shareEmail = () => window.open(`mailto:?subject=${encodeURIComponent('WhoPlays')}&body=${encodeURIComponent(shareText)}`)
  const copyLink = () => { navigator.clipboard.writeText(inviteLink); alert('Lien copié !') }

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : '?'
  const getColor = (name) => ['#C0DD97','#CECBF6','#FAC775','#B5D4F4','#F5C4B3','#9FE1CB'][name ? name.charCodeAt(0)%6 : 0]
  const getTextColor = (name) => ['#27500A','#3C3489','#633806','#0C447C','#712B13','#085041'][name ? name.charCodeAt(0)%6 : 0]
  const getPill = (type) => type==='game' ? {label:'En game',bg:'#EAF3DE',color:'#27500A'} : type==='hot' ? {label:'Chaud 🔥',bg:'#FCEBEB',color:'#A32D2D'} : {label:'Pas dispo',bg:'#f5f5f5',color:'#999'}
  const getDot = (type) => type==='game' ? '#639922' : type==='hot' ? '#E24B4A' : '#ccc'

  const getPlatformTags = (c) => {
    const tags = []
    if (c.steam_tag) tags.push({ label: c.steam_tag, plt:'Steam' })
    if (c.xbox_tag) tags.push({ label: c.xbox_tag, plt:'Xbox' })
    if (c.psn_tag) tags.push({ label: c.psn_tag, plt:'PS' })
    if (c.epic_tag) tags.push({ label: c.epic_tag, plt:'Epic' })
    if (c.discord_tag) tags.push({ label: c.discord_tag, plt:'Discord' })
    return tags
  }

  const Avatar = ({ name, avatarUrl, size = 38 }) => avatarUrl ? (
    <img src={avatarUrl} alt={name} style={{width:`${size}px`,height:`${size}px`,borderRadius:'50%',objectFit:'cover',flexShrink:0}}/>
  ) : (
    <div style={{width:`${size}px`,height:`${size}px`,borderRadius:'50%',background:getColor(name),color:getTextColor(name),display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:'700',flexShrink:0}}>
      {getInitials(name)}
    </div>
  )

  const filteredStatuses = statuses.filter(s => {
    if (!search) return true
    const name = s.profiles?.name || ''
    return name.toLowerCase().includes(search.toLowerCase()) || s.game?.toLowerCase().includes(search.toLowerCase())
  })

  const filteredContacts = contacts.filter(c => {
    if (!search) return true
    return c.contact_name?.toLowerCase().includes(search.toLowerCase())
  })

  if (selectedPote) return <ProfilPote poteId={selectedPote} onBack={() => { setSelectedPote(null); fetchContacts(); fetchStatuses(); }} user={user} />
  if (selectedContact) return <ProfilPote poteContact={selectedContact} onBack={() => { setSelectedContact(null); fetchContacts(); fetchStatuses(); }} user={user} />
  if (loading) return <div style={{padding:'40px 16px',textAlign:'center',color:'#bbb',fontSize:'13px'}}>Chargement...</div>

  return (
    <div>
      <div style={{padding:'12px 16px 8px'}}>
        <div style={{position:'relative'}}>
          <svg style={{position:'absolute',left:'10px',top:'50%',transform:'translateY(-50%)',opacity:0.4}} width="14" height="14" viewBox="0 0 14 14">
            <circle cx="5.5" cy="5.5" r="4" fill="none" stroke="#111" strokeWidth="1.5"/>
            <line x1="8.5" y1="8.5" x2="13" y2="13" stroke="#111" strokeWidth="1.5"/>
          </svg>
          <input type="text" placeholder="Rechercher un pote ou un jeu..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{width:'100%',padding:'9px 12px 9px 30px',border:'1px solid #eee',borderRadius:'12px',fontSize:'13px',color:'#111',fontFamily:'inherit',outline:'none',background:'#fafaf9',boxSizing:'border-box'}}/>
        </div>
      </div>

      {!scanDone && isMobile && (
        <div style={{padding:'0 16px 10px'}}>
          <button onClick={handleScanContacts} disabled={scanning}
            style={{width:'100%',padding:'11px',borderRadius:'12px',background:'#EAF3DE',color:'#27500A',border:'1px solid #97C459',fontSize:'12px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
            {scanning ? '🔍 Scan en cours...' : '📱 Scanner mes contacts — trouver mes potes'}
          </button>
        </div>
      )}

      {scanDone && scanResult && (
        <div style={{margin:'0 16px 10px',padding:'12px 14px',background:'#EAF3DE',borderRadius:'12px',border:'1px solid #97C459'}}>
          <div style={{fontSize:'13px',fontWeight:'700',color:'#27500A'}}>
            {scanResult.found > 0 ? `🎉 ${scanResult.found} pote${scanResult.found > 1 ? 's' : ''} trouvé${scanResult.found > 1 ? 's' : ''} !` : '😕 Aucun pote sur WhoPlays pour l\'instant'}
          </div>
          <div style={{fontSize:'11px',color:'#639922',marginTop:'3px'}}>
            {scanResult.found > 0 ? 'Ils apparaissent maintenant dans ton feed' : `${scanResult.total} contacts scannés — invite tes potes`}
          </div>
        </div>
      )}

      <>
        {statuses.length > 0 && (
          <>
            <div style={{padding:'4px 16px 6px',fontSize:'11px',color:'#aaa',fontWeight:'500'}}>
              {filteredStatuses.filter(s => s.type !== 'off').length} joueur{filteredStatuses.filter(s => s.type !== 'off').length>1?'s':''} actif{filteredStatuses.filter(s => s.type !== 'off').length>1?'s':''}
              {filteredStatuses.filter(s => s.type === 'off').length > 0 ? ` · ${filteredStatuses.filter(s => s.type === 'off').length} pas dispo` : ''}
            </div>
            {filteredStatuses.map(s => {
              const name = s.profiles?.name || 'Joueur'
              const pill = getPill(s.type)
              const isMe = s.user_id === user?.id
              const games = userGames[s.user_id] || []
              const genres = getGenres(games)
              const habits = userHabits[s.user_id]
              const top5 = games.slice(0, 5)
              const isOff = s.type === 'off'
              const invitedFriends = s.invited_friends || []

              return (
                <div key={s.id}
                  style={{padding:'12px 16px',borderBottom:'1px solid #f5f5f5',cursor:isMe?'default':'pointer',opacity:isOff?0.45:1}}
                  onClick={() => !isMe && !isOff && setSelectedPote(s.user_id)}>

                  <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:isOff?'0':'8px'}}>
                    <div style={{position:'relative',flexShrink:0}}>
                      <Avatar name={name} avatarUrl={s.profiles?.avatar_url} size={40} />
                      <span style={{position:'absolute',bottom:'0',right:'0',width:'9px',height:'9px',borderRadius:'50%',background:getDot(s.type),border:'2px solid #fff'}}></span>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:'13px',fontWeight:'700',color:'#111'}}>{name}{isMe?' (toi)':''}</div>
                      <div style={{fontSize:'11px',color:'#888',marginTop:'1px'}}>
                        {isOff ? 'Pas dispo' : s.game}
                        {!isOff && s.scheduled_when && (
                          <span style={{marginLeft:'6px',color:'#bbb'}}>· {s.scheduled_when}</span>
                        )}
                      </div>
                    </div>
                    <span style={{fontSize:'10px',fontWeight:'600',padding:'3px 8px',borderRadius:'20px',background:pill.bg,color:pill.color,flexShrink:0}}>
                      {pill.label}
                    </span>
                  </div>

                  {!isOff && (genres.length > 0 || habits) && (
                    <div style={{display:'flex',gap:'4px',flexWrap:'wrap',marginBottom:'8px'}}>
                      {genres.map((g,i) => (
                        <span key={i} style={{fontSize:'9px',padding:'2px 6px',borderRadius:'20px',background:'#f0f0f0',color:'#666',fontWeight:'600'}}>{g}</span>
                      ))}
                      {habits && (
                        <span style={{fontSize:'9px',padding:'2px 6px',borderRadius:'20px',background:'#f0f0f0',color:'#666',fontWeight:'600'}}>
                          {habits.timeLabel}{habits.isWeekend?' · Week-end':''}
                        </span>
                      )}
                    </div>
                  )}

                  {!isOff && <GameBubbles games={top5} />}

                  {!isOff && invitedFriends.length > 0 && (
                    <div style={{display:'flex',alignItems:'center',gap:'4px',marginBottom:'8px',flexWrap:'wrap'}}>
                      <span style={{fontSize:'9px',color:'#aaa',fontWeight:'600'}}>avec</span>
                      {invitedFriends.map((f, i) => (
                        <div key={i} style={{display:'inline-flex',alignItems:'center',gap:'3px',padding:'2px 8px',borderRadius:'20px',background:'#f0f0f0'}}>
                          {f.avatar_url ? (
                            <img src={f.avatar_url} alt={f.name} style={{width:'14px',height:'14px',borderRadius:'50%',objectFit:'cover'}}/>
                          ) : null}
                          <span style={{fontSize:'10px',fontWeight:'600',color:'#555'}}>{f.name?.split(' ')[0]}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {!isMe && !isOff && (
                    <button onClick={(e) => { e.stopPropagation(); handleRejoindre(s) }}
                      style={{width:'100%',padding:'9px',borderRadius:'10px',background:'#111',color:'#fff',border:'none',fontSize:'12px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
                      🎮 Je rejoins
                    </button>
                  )}
                </div>
              )
            })}
          </>
        )}

        {filteredContacts.length > 0 && (
          <>
            <div style={{padding:'10px 16px 6px',fontSize:'10px',fontWeight:'700',color:'#bbb',letterSpacing:'.08em',textTransform:'uppercase',marginTop:'6px'}}>
              Potes sans l'app
            </div>
            {filteredContacts.map(c => (
              <div key={c.id} style={{padding:'10px 16px',borderBottom:'1px solid #f5f5f5',display:'flex',alignItems:'center',gap:'10px',cursor:'pointer'}}
                onClick={() => setSelectedContact(c)}>
                <div style={{width:'36px',height:'36px',borderRadius:'50%',background:getColor(c.contact_name),color:getTextColor(c.contact_name),display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:'700',border:'1.5px dashed #ddd',flexShrink:0}}>
                  {getInitials(c.contact_name)}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:'13px',fontWeight:'600',color:'#888'}}>{c.contact_name}</div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'4px',marginTop:'3px'}}>
                    {getPlatformTags(c).slice(0,2).map((t,i) => (
                      <div key={i} style={{display:'inline-flex',alignItems:'center',gap:'3px',padding:'2px 6px',borderRadius:'6px',background:platformColors[t.plt]?.bg||'#eee'}}>
                        <span style={{color:platformColors[t.plt]?.color||'#fff',display:'flex',alignItems:'center'}}>
                          <PlatformLogo platform={t.plt} size={9}/>
                        </span>
                        <span style={{fontSize:'9px',color:platformColors[t.plt]?.color||'#fff',fontWeight:'500'}}>{t.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleInviterContact(c) }}
                  style={{fontSize:'10px',color:'#888',background:'#f5f5f5',border:'1px solid #eee',padding:'4px 8px',borderRadius:'20px',cursor:'pointer',fontFamily:'inherit',fontWeight:'600',whiteSpace:'nowrap',flexShrink:0}}>
                  Inviter
                </button>
              </div>
            ))}
          </>
        )}
      </>

      <div style={{margin:'16px 16px 0',border:'1px dashed #ddd',borderRadius:'14px',overflow:'hidden'}}>
        <div style={{background:'#fafaf9',padding:'10px 12px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontSize:'11px',color:'#888',fontWeight:'600'}}>Inviter un pote</span>
          <button onClick={() => setShowInvite(!showInvite)}
            style={{fontSize:'11px',color:'#185FA5',fontWeight:'600',background:'none',border:'none',cursor:'pointer',fontFamily:'inherit'}}>
            {showInvite ? 'Fermer' : '+ Générer un lien'}
          </button>
        </div>
        {showInvite && (
          <div style={{padding:'12px'}}>
            {!inviteLink ? (
              <>
                <div style={{fontSize:'11px',color:'#aaa',marginBottom:'8px',lineHeight:'1.5'}}>
                  Entre le prénom de ton pote — il reçoit un lien pour renseigner son gamertag en 30 sec.
                </div>
                <div style={{display:'flex',gap:'8px'}}>
                  <input type="text" placeholder="Prénom du pote..." value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    onKeyDown={e => e.key==='Enter' && generateInvite()}
                    style={{flex:1,padding:'9px 12px',border:'1px solid #eee',borderRadius:'10px',fontSize:'13px',color:'#111',fontFamily:'inherit',outline:'none'}}/>
                  <button onClick={generateInvite} disabled={inviting || !contactName.trim()}
                    style={{padding:'9px 14px',borderRadius:'10px',background:'#111',color:'#fff',border:'none',fontSize:'12px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit',opacity:!contactName.trim()?0.5:1}}>
                    {inviting ? '...' : 'Créer'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{fontSize:'12px',color:'#27500A',fontWeight:'600',marginBottom:'8px'}}>Lien créé pour {contactName} ✓</div>
                {isMobile ? (
                  <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                    <button onClick={shareNative}
                      style={{width:'100%',padding:'11px',borderRadius:'10px',background:'#111',color:'#fff',border:'none',fontSize:'12px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit'}}>
                      Partager via le téléphone →
                    </button>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px'}}>
                      <button onClick={shareWhatsApp} style={{padding:'9px',borderRadius:'10px',background:'#25D366',color:'#fff',border:'none',fontSize:'11px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit'}}>WhatsApp</button>
                      <button onClick={shareSMS} style={{padding:'9px',borderRadius:'10px',background:'#34C759',color:'#fff',border:'none',fontSize:'11px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit'}}>SMS</button>
                    </div>
                  </div>
                ) : (
                  <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                    <div style={{fontSize:'11px',color:'#aaa',marginBottom:'4px'}}>Sur PC — copie le lien ou partage via WhatsApp/Email</div>
                    <button onClick={copyLink} style={{width:'100%',padding:'10px',borderRadius:'10px',background:'#111',color:'#fff',border:'none',fontSize:'12px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit'}}>Copier le lien</button>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px'}}>
                      <button onClick={shareWhatsApp} style={{padding:'9px',borderRadius:'10px',background:'#25D366',color:'#fff',border:'none',fontSize:'11px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit'}}>WhatsApp Web</button>
                      <button onClick={shareEmail} style={{padding:'9px',borderRadius:'10px',background:'#f0f0f0',color:'#555',border:'none',fontSize:'11px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit'}}>Email</button>
                    </div>
                  </div>
                )}
                <button onClick={() => {setInviteLink('');setContactName('');}}
                  style={{width:'100%',marginTop:'6px',padding:'8px',borderRadius:'10px',background:'#f5f5f5',color:'#888',border:'none',fontSize:'11px',cursor:'pointer',fontFamily:'inherit'}}>
                  Générer un nouveau lien
                </button>
              </>
            )}
          </div>
        )}
      </div>
      <div style={{height:'14px'}}></div>
    </div>
  )
}