import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Invitation() {
  const [invitation, setInvitation] = useState(null)
  const [friendStatuses, setFriendStatuses] = useState([])
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

    // Récupérer les statuts actifs du réseau de l'inviteur
    if (data?.profiles?.id) {
      await fetchFriendStatuses(data.profiles.id)
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
      .limit(5)
    setFriendStatuses(data || [])
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
  const getPill = (type) => type==='game' ? {label:'En game',bg:'#EAF3DE',color:'#27500A'} : type==='hot' ? {label:'Chaud 🔥',bg:'#FCEBEB',color:'#A32D2D'} : {label:'Dispo',bg:'#E6F1FB',color:'#185FA5'}

  const hasValue = steam || xbox || discord || psn || epic

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
          {invitation.profiles?.name?.split(' ')[0]} peut maintenant voir tes gamertags dans GamerLink.
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

  const inviterName = invitation.profiles?.name?.split(' ')[0]
  const inviterAvatar = invitation.profiles?.avatar_url

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

        {/* Header */}
        <div style={{textAlign:'center',marginBottom:'16px',paddingTop:'12px'}}>
          <div style={{fontSize:'22px',fontWeight:'700',color:'#111',marginBottom:'4px'}}>GamerLink</div>
          <div style={{fontSize:'13px',color:'#888'}}>Snap Map pour le gaming 🎮</div>
        </div>

        {/* Vitrine — ce qui se passe en ce moment */}
        {friendStatuses.length > 0 && (
          <div style={{background:'#fff',borderRadius:'20px',padding:'16px',marginBottom:'14px',border:'1px solid #eee'}}>
            <div style={{fontSize:'11px',fontWeight:'700',color:'#bbb',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:'10px'}}>
              🔴 En ce moment dans le réseau de {inviterName}
            </div>
            {friendStatuses.map((s, i) => {
              const name = s.profiles?.name || 'Joueur'
              const pill = getPill(s.type)
              return (
                <div key={i} style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px 0',borderBottom:i<friendStatuses.length-1?'1px solid #f5f5f5':'none'}}>
                  {s.profiles?.avatar_url ? (
                    <img src={s.profiles.avatar_url} alt={name}
                      style={{width:'32px',height:'32px',borderRadius:'50%',objectFit:'cover',flexShrink:0}}/>
                  ) : (
                    <div style={{width:'32px',height:'32px',borderRadius:'50%',background:getColor(name),color:getTextColor(name),display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:'700',flexShrink:0}}>
                      {getInitials(name)}
                    </div>
                  )}
                  <div style={{flex:1}}>
                    <div style={{fontSize:'12px',fontWeight:'700',color:'#111'}}>{name}</div>
                    <div style={{fontSize:'11px',color:'#888'}}>{s.game}</div>
                  </div>
                  <span style={{fontSize:'10px',fontWeight:'600',padding:'2px 7px',borderRadius:'20px',background:pill.bg,color:pill.color,flexShrink:0}}>
                    {pill.label}
                  </span>
                </div>
              )
            })}
            <div style={{marginTop:'10px',padding:'10px',background:'#f8f8f6',borderRadius:'10px',fontSize:'11px',color:'#888',textAlign:'center',lineHeight:'1.5'}}>
              Rejoins GamerLink pour voir ça en temps réel et jouer avec eux 👇
            </div>
          </div>
        )}

        {/* Card principale */}
        <div style={{background:'#fff',borderRadius:'20px',padding:'20px 20px 24px',border:'1px solid #eee'}}>

          {/* Inviteur */}
          <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'16px',paddingBottom:'14px',borderBottom:'1px solid #f5f5f5'}}>
            {inviterAvatar ? (
              <img src={inviterAvatar} alt={inviterName}
                style={{width:'38px',height:'38px',borderRadius:'50%',objectFit:'cover',flexShrink:0}}/>
            ) : (
              <div style={{width:'38px',height:'38px',borderRadius:'50%',background:'#EAF3DE',color:'#27500A',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:'700',flexShrink:0}}>
                {getInitials(invitation.profiles?.name)}
              </div>
            )}
            <div>
              <div style={{fontSize:'13px',fontWeight:'700',color:'#111'}}>
                {inviterName} t'invite sur GamerLink
              </div>
              <div style={{fontSize:'11px',color:'#888',marginTop:'1px'}}>
                Renseigne au moins un pseudo en 30 sec
              </div>
            </div>
          </div>

          {/* Numéro */}
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

          {/* Champs gamertags */}
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