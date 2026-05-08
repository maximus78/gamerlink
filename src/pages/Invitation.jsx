import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Invitation() {
  const [invitation, setInvitation] = useState(null)
  const [friendStatuses, setFriendStatuses] = useState([])
  const [inviterGames, setInviterGames] = useState([])
  const [inviterGamertags, setInviterGamertags] = useState({})
  const [steam, setSteam] = useState('')
  const [xbox, setXbox] = useState('')
  const [discord, setDiscord] = useState('')
  const [psn, setPsn] = useState('')
  const [epic, setEpic] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  const token = new URLSearchParams(window.location.search).get('token')

  useEffect(() => {
    if (token) fetchInvitation()
    else setLoading(false)
  }, [])

  const fetchInvitation = async () => {
    const { data } = await supabase
      .from('invitations')
      .select('*, profiles(id, name, avatar_url)')
      .eq('token', token)
      .single()
    setInvitation(data)
    if (data?.steam_tag) setSteam(data.steam_tag)
    if (data?.xbox_tag) setXbox(data.xbox_tag)
    if (data?.discord_tag) setDiscord(data.discord_tag)
    if (data?.psn_tag) setPsn(data.psn_tag)
    if (data?.epic_tag) setEpic(data.epic_tag)

    if (data?.profiles?.id) {
      await Promise.all([
        fetchFriendStatuses(data.profiles.id),
        fetchInviterGames(data.profiles.id),
        fetchInviterGamertags(data.profiles.id),
      ])
    }
    setLoading(false)
  }

  const fetchFriendStatuses = async (userId) => {
    const { data: friends } = await supabase
      .from('friends').select('friend_id').eq('user_id', userId)
    const friendIds = (friends || []).map(f => f.friend_id)
    friendIds.push(userId)
    const { data } = await supabase
      .from('statuses')
      .select('*, profiles(name, avatar_url)')
      .gt('expires_at', new Date().toISOString())
      .in('user_id', friendIds)
      .order('created_at', { ascending: false })
      .limit(3)
    setFriendStatuses(data || [])
  }

  const fetchInviterGames = async (userId) => {
    const { data } = await supabase
      .from('user_games').select('*').eq('user_id', userId)
      .order('hours_played', { ascending: false }).limit(5)
    setInviterGames(data || [])
  }

  const fetchInviterGamertags = async (userId) => {
    const { data } = await supabase
      .from('gamertags').select('*').eq('user_id', userId)
    if (data) {
      const tags = {}
      data.forEach(g => { tags[g.platform] = g.tag })
      setInviterGamertags(tags)
    }
  }

  const getGenres = (games) => {
    const genreMap = {
      'Warzone': 'FPS', 'CS2': 'FPS', 'Valorant': 'FPS', 'Apex': 'FPS',
      'Rocket League': 'Sport', 'FC 26': 'Sport', 'FIFA': 'Sport',
      'Fortnite': 'Battle Royale', 'PUBG': 'Battle Royale',
      'League of Legends': 'MOBA', 'Dota': 'MOBA',
    }
    const genres = new Set()
    games.forEach(g => {
      Object.entries(genreMap).forEach(([key, genre]) => {
        if (g.game_name?.toLowerCase().includes(key.toLowerCase())) genres.add(genre)
      })
    })
    return [...genres].slice(0, 3)
  }

  const handleSave = async () => {
    if (!steam && !xbox && !discord && !psn && !epic) return
    setLoading(true)
    await supabase.from('invitations').update({
      steam_tag: steam, xbox_tag: xbox, discord_tag: discord,
      psn_tag: psn, epic_tag: epic, completed: true
    }).eq('token', token)
    await supabase.from('contact_gamertags').upsert({
      owner_id: invitation.profiles.id,
      contact_name: invitation.contact_name,
      contact_phone: phone.replace(/\s/g, '') || null,
      steam_tag: steam, xbox_tag: xbox, psn_tag: psn,
      epic_tag: epic, discord_tag: discord,
      invitation_token: token
    }, { onConflict: 'invitation_token' })
    setSaved(true)
    setLoading(false)
  }

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : '?'
  const getColor = (name) => ['#C0DD97','#CECBF6','#FAC775','#B5D4F4','#F5C4B3','#9FE1CB'][name ? name.charCodeAt(0)%6 : 0]
  const getTextColor = (name) => ['#27500A','#3C3489','#633806','#0C447C','#712B13','#085041'][name ? name.charCodeAt(0)%6 : 0]
  const getPill = (type) => type==='game' ? {label:'En game',bg:'#EAF3DE',color:'#27500A'} : {label:'Chaud 🔥',bg:'#FCEBEB',color:'#A32D2D'}

  const hasValue = steam || xbox || discord || psn || epic
  const inviterName = invitation?.profiles?.name?.split(' ')[0]
  const inviterAvatar = invitation?.profiles?.avatar_url
  const inviterStatus = friendStatuses.find(s => s.user_id === invitation?.profiles?.id)
  const genres = getGenres(inviterGames)

  const platformColors = {
    'Steam': { bg:'#1b2838', color:'#c7d5e0' },
    'Xbox': { bg:'#107c10', color:'#fff' },
    'PS': { bg:'#003087', color:'#fff' },
    'Epic': { bg:'#2d2d2d', color:'#fff' },
    'Discord': { bg:'#5865F2', color:'#fff' },
  }

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f0efe8'}}>
      <div style={{fontSize:'20px',fontWeight:'700',color:'#111'}}>GamerLink</div>
    </div>
  )

  if (!token || !invitation) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f0efe8',padding:'20px'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'28px',marginBottom:'12px'}}>❌</div>
        <div style={{fontSize:'16px',fontWeight:'700',color:'#111'}}>Lien invalide</div>
      </div>
    </div>
  )

  if (saved) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f0efe8',padding:'20px'}}>
      <div style={{width:'100%',maxWidth:'360px',background:'#fff',borderRadius:'24px',padding:'32px 24px',textAlign:'center'}}>
        <div style={{fontSize:'48px',marginBottom:'16px'}}>🎮</div>
        <div style={{fontSize:'20px',fontWeight:'700',color:'#111',marginBottom:'8px'}}>C'est enregistré !</div>
        <div style={{fontSize:'13px',color:'#888',lineHeight:'1.5'}}>
          {inviterName} peut maintenant voir tes gamertags dans GamerLink.
        </div>
        <div style={{marginTop:'20px',padding:'12px',background:'#EAF3DE',borderRadius:'12px',fontSize:'12px',color:'#27500A',fontWeight:'500'}}>
          Tu veux voir à quoi jouent tes potes aussi ? Rejoins GamerLink gratuitement.
        </div>
        <button onClick={() => window.location.href = window.location.origin}
          style={{width:'100%',marginTop:'12px',padding:'13px',borderRadius:'12px',background:'#111',color:'#fff',border:'none',fontSize:'13px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit'}}>
          Rejoindre GamerLink →
        </button>
      </div>
    </div>
  )

  const fields = [
    { label:'Pseudo Steam', placeholder:'ex: MonPseudo42', value:steam, set:setSteam, bg:'#1b2838',
      icon:<svg width="11" height="11" viewBox="0 0 11 11"><circle cx="5.5" cy="5.5" r="4.5" fill="none" stroke="#c7d5e0" strokeWidth="1"/><circle cx="7.5" cy="5" r="1.5" fill="#c7d5e0"/></svg> },
    { label:'Xbox Gamertag', placeholder:'ex: MonGamerTag', value:xbox, set:setXbox, bg:'#107c10', optional:true,
      icon:<svg width="11" height="11" viewBox="0 0 11 11"><rect x="1" y="3" width="4" height="5" rx="1" fill="#fff" opacity=".8"/><rect x="6" y="3" width="4" height="5" rx="1" fill="#fff" opacity=".5"/></svg> },
    { label:'PSN (PlayStation)', placeholder:'ex: MonPseudoPS', value:psn, set:setPsn, bg:'#003087', optional:true,
      icon:<svg width="11" height="11" viewBox="0 0 11 11"><circle cx="5.5" cy="5.5" r="4.5" fill="none" stroke="#fff" strokeWidth="1"/><path d="M4 8V3l4 2.5-4 2.5z" fill="#fff"/></svg> },
    { label:'Epic Games', placeholder:'ex: MonEpicTag', value:epic, set:setEpic, bg:'#2d2d2d', optional:true,
      icon:<svg width="11" height="11" viewBox="0 0 11 11"><rect x="2" y="2" width="7" height="7" rx="1" fill="none" stroke="#fff" strokeWidth="1"/><line x1="5.5" y1="2" x2="5.5" y2="9" stroke="#fff" strokeWidth="1"/></svg> },
    { label:'Discord', placeholder:'ex: monpseudo#1234', value:discord, set:setDiscord, bg:'#5865F2', optional:true,
      icon:<svg width="11" height="11" viewBox="0 0 11 11"><path d="M8.8 1.9A7.8 7.8 0 007 1.5c-.1.18-.22.43-.3.6a6.8 6.8 0 00-1.9 0C4.72 1.93 4.6 1.68 4.5 1.5A7.8 7.8 0 002.7 1.9C1.3 4 .9 6 1.1 8a7.8 7.8 0 002.3 1.16c.2-.27.37-.56.52-.87a4.5 4.5 0 01-.77-.37l.2-.16a5.6 5.6 0 004.8 0l.2.16a4.5 4.5 0 01-.77.37c.15.31.32.6.52.87A7.8 7.8 0 009.9 8C10.1 5.7 9.5 3.72 8.8 1.9z" fill="#fff"/></svg> },
  ]

  return (
    <div style={{minHeight:'100vh',background:'#f0efe8',padding:'20px',display:'flex',flexDirection:'column',alignItems:'center'}}>
      <div style={{width:'100%',maxWidth:'360px'}}>

        <div style={{textAlign:'center',marginBottom:'16px',paddingTop:'12px'}}>
          <div style={{fontSize:'22px',fontWeight:'700',color:'#111',marginBottom:'4px'}}>GamerLink</div>
          <div style={{fontSize:'13px',color:'#888'}}>Snap Map pour le gaming 🎮</div>
        </div>

        {/* Vitrine inviteur */}
        <div style={{background:'#fff',borderRadius:'20px',padding:'16px',marginBottom:'14px',border:'1px solid #eee'}}>

          {/* Header inviteur */}
          <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'14px',paddingBottom:'12px',borderBottom:'1px solid #f5f5f5'}}>
            {inviterAvatar ? (
              <img src={inviterAvatar} alt={inviterName}
                style={{width:'42px',height:'42px',borderRadius:'50%',objectFit:'cover',flexShrink:0,border:'2px solid #EAF3DE'}}/>
            ) : (
              <div style={{width:'42px',height:'42px',borderRadius:'50%',background:getColor(invitation.profiles?.name),color:getTextColor(invitation.profiles?.name),display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',fontWeight:'700',flexShrink:0}}>
                {getInitials(invitation.profiles?.name)}
              </div>
            )}
            <div style={{flex:1}}>
              <div style={{fontSize:'14px',fontWeight:'700',color:'#111'}}>{inviterName}</div>
              {inviterStatus ? (
                <div style={{fontSize:'11px',color:'#27500A',marginTop:'2px'}}>🔴 Joue là — il t'attend 🎮</div>
              ) : (
                <div style={{fontSize:'11px',color:'#888',marginTop:'2px'}}>
                  Veut savoir à quoi tu joues — dis-lui en 30 sec
                </div>
              )}
            </div>
          </div>

          {/* Statut actif */}
          {inviterStatus && (
            <div style={{background:'#EAF3DE',borderRadius:'12px',padding:'10px 12px',marginBottom:'12px',display:'flex',alignItems:'center',gap:'8px'}}>
              <span style={{fontSize:'20px'}}>🎮</span>
              <div>
                <div style={{fontSize:'12px',fontWeight:'700',color:'#27500A'}}>{inviterStatus.game}</div>
                <div style={{fontSize:'10px',color:'#639922'}}>En game maintenant</div>
              </div>
            </div>
          )}

          {/* Jeux habituels */}
          {inviterGames.length > 0 && (
            <div style={{marginBottom:'12px'}}>
              <div style={{fontSize:'10px',fontWeight:'700',color:'#bbb',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'6px'}}>
                Joue habituellement à
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:'4px'}}>
                {inviterGames.slice(0,4).map((g, i) => (
                  <span key={i} style={{fontSize:'11px',fontWeight:'600',padding:'3px 8px',borderRadius:'20px',background:'#f5f5f5',color:'#555'}}>
                    {g.game_name}
                  </span>
                ))}
              </div>
              {genres.length > 0 && (
                <div style={{display:'flex',gap:'4px',marginTop:'6px'}}>
                  {genres.map((g, i) => (
                    <span key={i} style={{fontSize:'10px',padding:'2px 7px',borderRadius:'20px',background:'#EAF3DE',color:'#27500A',fontWeight:'600'}}>
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Gamertags inviteur */}
          {Object.keys(inviterGamertags).length > 0 && (
            <div>
              <div style={{fontSize:'10px',fontWeight:'700',color:'#bbb',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'6px'}}>
                Ses gamertags
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:'4px'}}>
                {Object.entries(inviterGamertags).slice(0,3).map(([plt, tag], i) => (
                  <div key={i} style={{display:'inline-flex',alignItems:'center',border:`1px solid ${platformColors[plt] ? '#ddd' : '#eee'}`,borderRadius:'6px',overflow:'hidden'}}>
                    <span style={{fontSize:'9px',fontWeight:'700',padding:'2px 5px',background:platformColors[plt]?.bg||'#eee',color:platformColors[plt]?.color||'#888'}}>{plt}</span>
                    <span style={{fontSize:'10px',fontWeight:'500',padding:'2px 7px 2px 4px',color:'#444'}}>{tag}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Formulaire */}
        <div style={{background:'#fff',borderRadius:'20px',padding:'20px',border:'1px solid #eee'}}>

          <div style={{fontSize:'13px',fontWeight:'700',color:'#111',marginBottom:'12px'}}>
            Renseigne tes pseudos 👇
          </div>

          <div style={{marginBottom:'12px',padding:'12px',background:'#EAF3DE',borderRadius:'12px',border:'1px solid #97C459'}}>
            <div style={{fontSize:'11px',fontWeight:'700',color:'#27500A',marginBottom:'6px'}}>
              📱 Ton numéro <span style={{fontWeight:'400',color:'#639922'}}>optionnel mais recommandé</span>
            </div>
            <input type="tel" placeholder="06 12 34 56 78" value={phone}
              onChange={e => setPhone(e.target.value)}
              style={{width:'100%',padding:'9px 12px',border:'1px solid #97C459',borderRadius:'10px',fontSize:'14px',color:'#111',fontFamily:'inherit',outline:'none',background:'#fff',boxSizing:'border-box'}}/>
            <div style={{fontSize:'10px',color:'#639922',marginTop:'5px',lineHeight:'1.4'}}>
              Permet à tes potes de te retrouver automatiquement si tu rejoins GamerLink.
            </div>
          </div>

          {fields.map((f, i) => (
            <div key={i} style={{marginBottom:'8px'}}>
              <div style={{fontSize:'11px',fontWeight:'600',color:'#888',marginBottom:'4px',display:'flex',alignItems:'center',gap:'6px'}}>
                <div style={{width:'18px',height:'18px',borderRadius:'4px',background:f.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  {f.icon}
                </div>
                {f.label}
                {f.optional && <span style={{fontWeight:'400',color:'#ccc',marginLeft:'2px'}}>optionnel</span>}
              </div>
              <input type="text" placeholder={f.placeholder} value={f.value}
                onChange={e => f.set(e.target.value)}
                style={{width:'100%',padding:'10px 14px',border:'1px solid #eee',borderRadius:'10px',fontSize:'13px',color:'#111',fontFamily:'inherit',outline:'none',background:'#fafaf9',boxSizing:'border-box'}}/>
            </div>
          ))}

          <button onClick={handleSave} disabled={loading || !hasValue}
            style={{width:'100%',marginTop:'12px',padding:'13px',borderRadius:'12px',background:!hasValue?'#eee':'#111',color:!hasValue?'#aaa':'#fff',border:'none',fontSize:'13px',fontWeight:'700',cursor:!hasValue?'default':'pointer',fontFamily:'inherit'}}>
            {loading ? 'Enregistrement...' : "C'est parti →"}
          </button>

          <div style={{fontSize:'11px',color:'#bbb',textAlign:'center',marginTop:'10px',lineHeight:'1.5'}}>
            Pas besoin de créer un compte. Tes données ne sont jamais revendues.
          </div>
        </div>

        <div style={{height:'24px'}}></div>
      </div>
    </div>
  )
}