import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import ProfilPote from './ProfilPote'

export default function Feed({ user, profile }) {
  const [statuses, setStatuses] = useState([])
  const [contacts, setContacts] = useState([])
  const [userGames, setUserGames] = useState({})
  const [loading, setLoading] = useState(true)
  const [inviting, setInviting] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [contactName, setContactName] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [selectedPote, setSelectedPote] = useState(null)
  const [selectedContact, setSelectedContact] = useState(null)
  const [search, setSearch] = useState('')

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  const myName = profile?.name?.split(' ')[0] || 'Ton pote'

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
    await Promise.all([fetchStatuses(), fetchContacts(), fetchGamesForUsers([user.id])])
  }

  const fetchStatuses = async () => {
    const { data: friends } = await supabase
      .from('friends').select('friend_id').eq('user_id', user.id)
    const friendIds = (friends || []).map(f => f.friend_id)
    friendIds.push(user.id)
    const { data } = await supabase
      .from('statuses')
      .select('*, profiles(name, phone)')
      .gt('expires_at', new Date().toISOString())
      .in('user_id', friendIds)
      .order('created_at', { ascending: false })
    setStatuses(data || [])
    const ids = [...new Set([...(data || []).map(s => s.user_id), user.id])]
    fetchGamesForUsers(ids)
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
        if (grouped[g.user_id].length < 3) grouped[g.user_id].push(g)
      })
      setUserGames(prev => ({ ...prev, ...grouped }))
    }
  }

  const fetchContacts = async () => {
    const { data } = await supabase
      .from('contact_gamertags').select('*').eq('owner_id', user.id)
    setContacts(data || [])
  }

  const generateInvite = async () => {
    if (!contactName.trim()) return
    setInviting(true)
    const { data } = await supabase
      .from('invitations')
      .insert({ created_by: user.id, contact_name: contactName })
      .select().single()
    if (data) setInviteLink(`${window.location.origin}?token=${data.token}`)
    setInviting(false)
  }

  // SMS pré-rempli pour rejoindre
  const handleRejoindre = (s) => {
    const name = s.profiles?.name?.split(' ')[0] || 'ton pote'
    const text = `Yo ! Je te rejoins sur ${s.game} 🎮 — GamerLink`
    if (isMobile) {
      const phone = s.profiles?.phone
      window.open(`sms:${phone || ''}?body=${encodeURIComponent(text)}`)
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`)
    }
  }

  // SMS pré-rempli pour inviter un pote sans l'app
  const handleInviterContact = (c) => {
    const text = `${myName} t'invite sur GamerLink 🎮 — viens voir à quoi on joue ce soir : ${window.location.origin}`
    window.open(`sms:?body=${encodeURIComponent(text)}`)
  }

  const shareText = `${myName} veut savoir à quoi tu joues sur GamerLink. Renseigne ton pseudo en 30 sec 👇\n${inviteLink}`
  const shareNative = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'GamerLink', text: shareText, url: inviteLink }) } catch(e) {}
    } else { navigator.clipboard.writeText(inviteLink); alert('Lien copié !') }
  }
  const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`)
  const shareSMS = () => window.open(`sms:?body=${encodeURIComponent(shareText)}`)
  const shareEmail = () => window.open(`mailto:?subject=${encodeURIComponent('GamerLink')}&body=${encodeURIComponent(shareText)}`)
  const copyLink = () => { navigator.clipboard.writeText(inviteLink); alert('Lien copié !') }

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : '?'
  const getColor = (name) => ['#C0DD97','#CECBF6','#FAC775','#B5D4F4','#F5C4B3','#9FE1CB'][name ? name.charCodeAt(0)%6 : 0]
  const getTextColor = (name) => ['#27500A','#3C3489','#633806','#0C447C','#712B13','#085041'][name ? name.charCodeAt(0)%6 : 0]
  const getPill = (type) => type==='game' ? {label:'En game',bg:'#EAF3DE',color:'#27500A'} : type==='hot' ? {label:'Chaud',bg:'#FCEBEB',color:'#A32D2D'} : {label:'Dispo',bg:'#E6F1FB',color:'#185FA5'}
  const getDot = (type) => type==='game' ? '#639922' : type==='hot' ? '#E24B4A' : '#378ADD'

  const platformColors = {
    'Steam': '#1b2838', 'Xbox': '#107c10', 'PS': '#003087', 'Epic': '#2d2d2d', 'Discord': '#5865F2'
  }

  const getPlatformTags = (c) => {
    const tags = []
    if (c.steam_tag) tags.push({ label: c.steam_tag, plt:'Steam', bg:'#1b2838', color:'#c7d5e0', border:'#4a90d9' })
    if (c.xbox_tag) tags.push({ label: c.xbox_tag, plt:'Xbox', bg:'#107c10', color:'#fff', border:'#5dc85d' })
    if (c.psn_tag) tags.push({ label: c.psn_tag, plt:'PS', bg:'#003087', color:'#fff', border:'#4a6fc4' })
    if (c.epic_tag) tags.push({ label: c.epic_tag, plt:'Epic', bg:'#2d2d2d', color:'#fff', border:'#888' })
    if (c.discord_tag) tags.push({ label: c.discord_tag, plt:'Discord', bg:'#5865F2', color:'#fff', border:'#7983f5' })
    return tags
  }

  // Filtrage recherche
  const filteredStatuses = statuses.filter(s => {
    if (!search) return true
    const name = s.profiles?.name || ''
    return name.toLowerCase().includes(search.toLowerCase()) ||
      s.game?.toLowerCase().includes(search.toLowerCase())
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

      {/* Barre de recherche */}
      <div style={{padding:'12px 16px 8px'}}>
        <div style={{position:'relative'}}>
          <svg style={{position:'absolute',left:'10px',top:'50%',transform:'translateY(-50%)',opacity:0.4}} width="14" height="14" viewBox="0 0 14 14">
            <circle cx="5.5" cy="5.5" r="4" fill="none" stroke="#111" strokeWidth="1.5"/>
            <line x1="8.5" y1="8.5" x2="13" y2="13" stroke="#111" strokeWidth="1.5"/>
          </svg>
          <input
            type="text"
            placeholder="Rechercher un pote ou un jeu..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{width:'100%',padding:'9px 12px 9px 30px',border:'1px solid #eee',borderRadius:'12px',fontSize:'13px',color:'#111',fontFamily:'inherit',outline:'none',background:'#fafaf9',boxSizing:'border-box'}}
          />
        </div>
      </div>

      {filteredStatuses.length === 0 && filteredContacts.length === 0 ? (
        <div style={{padding:'40px 16px',textAlign:'center'}}>
          <div style={{fontSize:'32px',marginBottom:'12px'}}>🎮</div>
          <div style={{fontSize:'14px',fontWeight:'600',color:'#111',marginBottom:'8px'}}>
            {search ? 'Aucun résultat' : 'Personne n\'est en ligne'}
          </div>
          <div style={{fontSize:'12px',color:'#aaa',lineHeight:'1.5'}}>
            {search ? 'Essaie un autre nom ou jeu.' : 'Mets ton statut ou invite des potes ci-dessous.'}
          </div>
        </div>
      ) : (
        <>
          {filteredStatuses.length > 0 && (
            <>
              <div style={{padding:'4px 16px 6px',fontSize:'11px',color:'#aaa',fontWeight:'500'}}>
                {filteredStatuses.length} joueur{filteredStatuses.length>1?'s':''} actif{filteredStatuses.length>1?'s':''} en ce moment
              </div>
              {filteredStatuses.map(s => {
                const name = s.profiles?.name || 'Joueur'
                const pill = getPill(s.type)
                const isMe = s.user_id === user?.id
                const games = userGames[s.user_id] || []
                return (
                  <div key={s.id} style={{padding:'12px 16px',borderBottom:'1px solid #f5f5f5'}}>
                    {/* Ligne principale */}
                    <div style={{display:'flex',alignItems:'center',gap:'10px',cursor:isMe?'default':'pointer'}}
                      onClick={() => !isMe && setSelectedPote(s.user_id)}>
                      <div style={{position:'relative',flexShrink:0}}>
                        <div style={{width:'38px',height:'38px',borderRadius:'50%',background:getColor(name),color:getTextColor(name),display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:'700'}}>
                          {getInitials(name)}
                        </div>
                        <span style={{position:'absolute',bottom:'0',right:'0',width:'9px',height:'9px',borderRadius:'50%',background:getDot(s.type),border:'2px solid #fff'}}></span>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:'13px',fontWeight:'700',color:'#111'}}>{name}{isMe?' (toi)':''}</div>
                        <div style={{fontSize:'11px',color:'#888',marginTop:'1px'}}>{s.game}</div>
                        {games.length > 0 && (
                          <div style={{display:'flex',gap:'3px',marginTop:'4px',flexWrap:'wrap'}}>
                            {games.map((g,i) => (
                              <span key={i} style={{fontSize:'9px',padding:'1px 5px',borderRadius:'4px',background:platformColors[g.platform]||'#333',color:'#fff',opacity:0.75,fontWeight:'500'}}>
                                {g.game_name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span style={{fontSize:'10px',fontWeight:'600',padding:'3px 8px',borderRadius:'20px',background:pill.bg,color:pill.color,flexShrink:0}}>
                        {pill.label}
                      </span>
                    </div>

                    {/* Bouton Je rejoins — seulement si c'est pas moi */}
                    {!isMe && (
                      <div style={{marginTop:'10px'}}>
                        <button onClick={() => handleRejoindre(s)}
                          style={{width:'100%',padding:'9px',borderRadius:'10px',background:'#111',color:'#fff',border:'none',fontSize:'12px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
                          🎮 Je rejoins
                        </button>
                      </div>
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
                <div key={c.id} style={{padding:'12px 16px',borderBottom:'1px solid #f5f5f5'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer',marginBottom:'8px'}}
                    onClick={() => setSelectedContact(c)}>
                    <div style={{flexShrink:0}}>
                      <div style={{width:'38px',height:'38px',borderRadius:'50%',background:getColor(c.contact_name),color:getTextColor(c.contact_name),display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:'700',border:'1.5px dashed #ddd'}}>
                        {getInitials(c.contact_name)}
                      </div>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:'13px',fontWeight:'600',color:'#888'}}>{c.contact_name}</div>
                      <div style={{display:'flex',flexWrap:'wrap',gap:'4px',marginTop:'4px'}}>
                        {getPlatformTags(c).slice(0,2).map((t,i) => (
                          <div key={i} style={{display:'inline-flex',alignItems:'center',border:`1px solid ${t.border}`,borderRadius:'6px',overflow:'hidden'}}>
                            <span style={{fontSize:'9px',fontWeight:'700',padding:'2px 5px',background:t.bg,color:t.color}}>{t.plt}</span>
                            <span style={{fontSize:'10px',fontWeight:'500',padding:'2px 6px 2px 4px',color:'#444'}}>{t.label}</span>
                          </div>
                        ))}
                        {getPlatformTags(c).length > 2 && (
                          <span style={{fontSize:'10px',color:'#aaa',padding:'2px 4px'}}>+{getPlatformTags(c).length - 2}</span>
                        )}
                      </div>
                    </div>
                    <span style={{fontSize:'10px',color:'#bbb',padding:'2px 7px',borderRadius:'20px',border:'1px dashed #ddd',whiteSpace:'nowrap',flexShrink:0}}>
                      Sans app
                    </span>
                  </div>
                  <button onClick={() => handleInviterContact(c)}
                    style={{width:'100%',padding:'8px',borderRadius:'10px',background:'#f5f5f5',color:'#555',border:'none',fontSize:'12px',fontWeight:'600',cursor:'pointer',fontFamily:'inherit'}}>
                    📲 Inviter sur GamerLink
                  </button>
                </div>
              ))}
            </>
          )}
        </>
      )}

      {/* Inviter un pote */}
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