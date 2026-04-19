import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Feed({ user, profile }) {
  const [statuses, setStatuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [inviting, setInviting] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [contactName, setContactName] = useState('')
  const [showInvite, setShowInvite] = useState(false)

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  const myName = profile?.name?.split(' ')[0] || 'Ton pote'

  useEffect(() => {
    fetchStatuses()
    const channel = supabase
      .channel('statuses')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'statuses'
      }, () => fetchStatuses())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const fetchStatuses = async () => {
    const { data: friends } = await supabase
      .from('friends')
      .select('friend_id')
      .eq('user_id', user.id)
    const friendIds = (friends || []).map(f => f.friend_id)
    friendIds.push(user.id)
    const { data } = await supabase
      .from('statuses')
      .select('*, profiles(name, phone)')
      .gt('expires_at', new Date().toISOString())
      .in('user_id', friendIds)
      .order('created_at', { ascending: false })
    setStatuses(data || [])
    setLoading(false)
  }

  const generateInvite = async () => {
    if (!contactName.trim()) return
    setInviting(true)
    const { data } = await supabase
      .from('invitations')
      .insert({ created_by: user.id, contact_name: contactName })
      .select()
      .single()
    if (data) {
      const link = `${window.location.origin}?token=${data.token}`
      setInviteLink(link)
    }
    setInviting(false)
  }

  const shareText = `${myName} veut savoir à quoi tu joues sur GamerLink. Renseigne ton pseudo en 30 sec 👇\n${inviteLink}`

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GamerLink — Renseigne ton gamertag',
          text: shareText,
          url: inviteLink
        })
      } catch(e) {}
    } else {
      navigator.clipboard.writeText(inviteLink)
      alert('Lien copié !')
    }
  }

  const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`)
  const shareSMS = () => window.open(`sms:?body=${encodeURIComponent(shareText)}`)
  const shareEmail = () => {
    const subject = encodeURIComponent('GamerLink — Renseigne ton gamertag')
    const body = encodeURIComponent(`${shareText}\n\nPas besoin de créer un compte.`)
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }
  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink)
    alert('Lien copié !')
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getColor = (name) => {
    const colors = ['#C0DD97','#CECBF6','#FAC775','#B5D4F4','#F5C4B3','#9FE1CB']
    return colors[name ? name.charCodeAt(0) % colors.length : 0]
  }

  const getTextColor = (name) => {
    const colors = ['#27500A','#3C3489','#633806','#0C447C','#712B13','#085041']
    return colors[name ? name.charCodeAt(0) % colors.length : 0]
  }

  const getPill = (type) => {
    if (type === 'game') return { label: 'En game', bg: '#EAF3DE', color: '#27500A' }
    if (type === 'hot') return { label: 'Chaud', bg: '#FCEBEB', color: '#A32D2D' }
    return { label: 'Dispo', bg: '#E6F1FB', color: '#185FA5' }
  }

  const getDot = (type) => {
    if (type === 'game') return '#639922'
    if (type === 'hot') return '#E24B4A'
    return '#378ADD'
  }

  if (loading) return (
    <div style={{padding:'40px 16px',textAlign:'center',color:'#bbb',fontSize:'13px'}}>Chargement...</div>
  )

  return (
    <div>
      {statuses.length === 0 ? (
        <div style={{padding:'40px 16px',textAlign:'center'}}>
          <div style={{fontSize:'32px',marginBottom:'12px'}}>🎮</div>
          <div style={{fontSize:'14px',fontWeight:'600',color:'#111',marginBottom:'8px'}}>Personne n'est en ligne</div>
          <div style={{fontSize:'12px',color:'#aaa',lineHeight:'1.5',marginBottom:'16px'}}>
            Mets ton statut ou invite des potes ci-dessous.
          </div>
        </div>
      ) : (
        <>
          <div style={{padding:'10px 16px 6px',fontSize:'11px',color:'#aaa',fontWeight:'500'}}>
            {statuses.length} joueur{statuses.length > 1 ? 's' : ''} actif{statuses.length > 1 ? 's' : ''} en ce moment
          </div>
          {statuses.map(s => {
            const name = s.profiles?.name || 'Joueur'
            const pill = getPill(s.type)
            const isMe = s.user_id === user?.id
            return (
              <div key={s.id} className="frow">
                <div className="av-wrap">
                  <div className="av" style={{background: getColor(name), color: getTextColor(name)}}>
                    {getInitials(name)}
                  </div>
                  <span className="fdot" style={{background: getDot(s.type)}}></span>
                </div>
                <div className="fi">
                  <div className="fn">{name} {isMe ? '(toi)' : ''}</div>
                  <div className="game-row">
                    <div className="game-logo-sm" style={{background:'#1a1a2e'}}>
                      <svg width="13" height="13" viewBox="0 0 13 13"><rect x="1" y="5.5" width="11" height="2" fill="#e63946" rx="1"/><rect x="5.5" y="1" width="2" height="11" fill="#e63946" rx="1"/></svg>
                    </div>
                    <span className="game-row-txt">{s.game}</span>
                  </div>
                </div>
                <span className="pill" style={{background: pill.bg, color: pill.color}}>{pill.label}</span>
              </div>
            )
          })}
        </>
      )}

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
                  Entre le prénom de ton pote — il reçoit un lien pour renseigner son gamertag en 30 sec sans créer de compte.
                </div>
                <div style={{display:'flex',gap:'8px'}}>
                  <input
                    type="text"
                    placeholder="Prénom du pote..."
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && generateInvite()}
                    style={{flex:1,padding:'9px 12px',border:'1px solid #eee',borderRadius:'10px',fontSize:'13px',color:'#111',fontFamily:'inherit',outline:'none'}}
                  />
                  <button onClick={generateInvite} disabled={inviting || !contactName.trim()}
                    style={{padding:'9px 14px',borderRadius:'10px',background:'#111',color:'#fff',border:'none',fontSize:'12px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit',opacity: !contactName.trim() ? 0.5 : 1}}>
                    {inviting ? '...' : 'Créer'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{fontSize:'12px',color:'#27500A',fontWeight:'600',marginBottom:'8px'}}>
                  Lien créé pour {contactName} ✓
                </div>

                {isMobile ? (
                  <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                    <button onClick={shareNative}
                      style={{width:'100%',padding:'11px',borderRadius:'10px',background:'#111',color:'#fff',border:'none',fontSize:'12px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit'}}>
                      Partager via le téléphone →
                    </button>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px'}}>
                      <button onClick={shareWhatsApp}
                        style={{padding:'9px',borderRadius:'10px',background:'#25D366',color:'#fff',border:'none',fontSize:'11px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit'}}>
                        WhatsApp
                      </button>
                      <button onClick={shareSMS}
                        style={{padding:'9px',borderRadius:'10px',background:'#34C759',color:'#fff',border:'none',fontSize:'11px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit'}}>
                        SMS
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                    <div style={{fontSize:'11px',color:'#aaa',marginBottom:'4px',lineHeight:'1.5'}}>
                      Sur PC — copie le lien ou envoie par email/WhatsApp web
                    </div>
                    <button onClick={copyLink}
                      style={{width:'100%',padding:'10px',borderRadius:'10px',background:'#111',color:'#fff',border:'none',fontSize:'12px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit'}}>
                      Copier le lien
                    </button>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px'}}>
                      <button onClick={shareWhatsApp}
                        style={{padding:'9px',borderRadius:'10px',background:'#25D366',color:'#fff',border:'none',fontSize:'11px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit'}}>
                        WhatsApp Web
                      </button>
                      <button onClick={shareEmail}
                        style={{padding:'9px',borderRadius:'10px',background:'#f0f0f0',color:'#555',border:'none',fontSize:'11px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit'}}>
                        Email
                      </button>
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