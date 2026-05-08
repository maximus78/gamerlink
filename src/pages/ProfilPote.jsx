import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function ProfilPote({ poteId, poteContact, onBack, user }) {
  const [profile, setProfile] = useState(null)
  const [games, setGames] = useState([])
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (poteId) fetchFromDB()
    else if (poteContact) loadContact()
  }, [])

  const fetchFromDB = async () => {
    const { data: p } = await supabase.from('profiles').select('*').eq('id', poteId).single()
    const { data: g } = await supabase.from('user_games').select('*').eq('user_id', poteId).order('hours_played', { ascending: false })
    const { data: s } = await supabase.from('statuses').select('*').eq('user_id', poteId).gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }).limit(1)
    setProfile(p)
    setGames(g || [])
    setStatus(s && s.length > 0 ? s[0] : null)
    setLoading(false)
  }

  const loadContact = () => {
    setProfile({ name: poteContact.contact_name })
    const g = []
    if (poteContact.steam_tag) g.push({ game_name: poteContact.steam_tag, platform: 'Steam' })
    if (poteContact.xbox_tag) g.push({ game_name: poteContact.xbox_tag, platform: 'Xbox' })
    if (poteContact.psn_tag) g.push({ game_name: poteContact.psn_tag, platform: 'PS' })
    if (poteContact.epic_tag) g.push({ game_name: poteContact.epic_tag, platform: 'Epic' })
    if (poteContact.discord_tag) g.push({ game_name: poteContact.discord_tag, platform: 'Discord' })
    setGames(g)
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm(`Supprimer ${profile?.name?.split(' ')[0]} de tes potes ?`)) return
    setDeleting(true)
    if (poteId && user) {
      await supabase.from('friends').delete().eq('user_id', user.id).eq('friend_id', poteId)
    }
    if (poteContact && user) {
      await supabase.from('contact_gamertags').delete().eq('id', poteContact.id)
    }
    onBack()
  }

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : '?'
  const getColor = (name) => ['#C0DD97','#CECBF6','#FAC775','#B5D4F4','#F5C4B3','#9FE1CB'][name ? name.charCodeAt(0)%6 : 0]
  const getTextColor = (name) => ['#27500A','#3C3489','#633806','#0C447C','#712B13','#085041'][name ? name.charCodeAt(0)%6 : 0]

  const platformColors = {
    'Steam': { bg:'#1b2838', color:'#c7d5e0' },
    'Xbox': { bg:'#107c10', color:'#fff' },
    'PS': { bg:'#003087', color:'#fff' },
    'Epic': { bg:'#2d2d2d', color:'#fff' },
    'Discord': { bg:'#5865F2', color:'#fff' }
  }

  const PlatformLogo = ({ platform, size = 16 }) => {
    const logos = {
      Steam: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.029 4.524 4.524s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.606 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.497 1.009 2.452-.397.957-1.497 1.41-2.455 1.015zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.662 0 3.015-1.35 3.015-3.015zm-5.273.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.252 0-2.265-1.014-2.265-2.265z"/></svg>,
      Xbox: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M4.102 7.062C2.908 8.418 2.139 10.2 2.021 12.15c.194 2.014 1.026 3.864 2.312 5.319C5.346 14.607 7.777 11.937 10.32 9.645c-1.297-1.269-4.023-3.177-6.218-2.583zM12 2.021c-1.293.024-2.533.36-3.627.958C10.14 4.51 12.721 6.98 14.1 8.87c1.383-1.893 3.963-4.36 5.727-5.891A9.888 9.888 0 0 0 12 2.021zm7.898 5.041c-2.195-.594-4.921 1.314-6.218 2.583 2.543 2.292 4.974 4.962 5.987 7.824 1.286-1.455 2.118-3.305 2.312-5.319a9.962 9.962 0 0 0-2.081-5.088zM5.697 18.445C7.207 19.95 9.493 20.927 12 20.979c2.507-.052 4.793-1.029 6.303-2.534C16.886 15.78 14.469 13.12 12 10.82c-2.469 2.3-4.886 4.96-6.303 7.625z"/></svg>,
      PS: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M8.984 2.596v16.71l3.915 1.261V6.688c0-.69.304-1.151.794-.991.636.181.76.814.76 1.504v5.876c1.735.895 3.03.07 3.03-2.437 0-2.492-.87-3.837-3.428-4.691-1.366-.45-3.505-1.02-5.071-1.353zm9.806 14.239c-1.79.499-3.667.249-5.126-.57v1.807c1.184.66 2.744.994 4.582.596 2.092-.445 3.135-1.735 3.135-3.193 0-1.504-.889-2.535-3.135-3.148l-2.46-.769v4.683c.736.42 1.565.594 2.46.594h.544zm-12.48-.664c-1.58.414-2.808.144-3.424-.57-.593-.693-.511-1.807.57-2.596.77-.569 2.013-.974 3.424-1.19v-1.74c-1.79.245-3.414.83-4.582 1.807-1.52 1.262-1.655 3.078-.413 4.445 1.243 1.367 3.59 1.807 5.845 1.191l-1.42-.347z"/></svg>,
      Epic: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M4 2h16v4H8v4h8v4H8v4h12v4H4V2z"/></svg>,
      Discord: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.101 18.08.114 18.1.136 18.116a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>,
    }
    return logos[platform] || null
  }

  const Avatar = ({ name, avatarUrl, size = 56 }) => avatarUrl ? (
    <img src={avatarUrl} alt={name}
      style={{width:`${size}px`,height:`${size}px`,borderRadius:'50%',objectFit:'cover',flexShrink:0,border:'2px solid #EAF3DE'}}/>
  ) : (
    <div style={{width:`${size}px`,height:`${size}px`,borderRadius:'50%',background:getColor(name),color:getTextColor(name),display:'flex',alignItems:'center',justifyContent:'center',fontSize:size>40?'18px':'13px',fontWeight:'700',flexShrink:0}}>
      {getInitials(name)}
    </div>
  )

  if (loading) return (
    <div style={{padding:'40px 16px',textAlign:'center',color:'#bbb',fontSize:'13px'}}>Chargement...</div>
  )

  const name = profile?.name || 'Joueur'

  return (
    <div>
      <div style={{padding:'12px 16px 0',display:'flex',alignItems:'center',gap:'10px',marginBottom:'16px'}}>
        <button onClick={onBack}
          style={{background:'none',border:'none',cursor:'pointer',padding:'4px',color:'#888',fontSize:'20px',lineHeight:1}}>
          ←
        </button>
        <span style={{fontSize:'14px',fontWeight:'600',color:'#888'}}>Retour</span>
      </div>

      {/* Header pote */}
      <div style={{padding:'0 16px 16px',display:'flex',alignItems:'center',gap:'14px',borderBottom:'1px solid #f5f5f5'}}>
        <Avatar name={name} avatarUrl={profile?.avatar_url} size={56} />
        <div style={{flex:1}}>
          <div style={{fontSize:'18px',fontWeight:'700',color:'#111'}}>{name}</div>
          {status ? (
            <div style={{fontSize:'12px',color:'#27500A',background:'#EAF3DE',padding:'2px 8px',borderRadius:'20px',display:'inline-block',marginTop:'4px',fontWeight:'600'}}>
              En game · {status.game}
            </div>
          ) : (
            <div style={{fontSize:'12px',color:'#aaa',marginTop:'4px'}}>Hors ligne</div>
          )}
          {/* Gamertags connectés */}
          <div style={{display:'flex',gap:'6px',marginTop:'8px',flexWrap:'wrap'}}>
            {profile?.steam_id && (
              <div style={{display:'inline-flex',alignItems:'center',gap:'4px',padding:'3px 8px',borderRadius:'20px',background:'#1b2838'}}>
                <span style={{color:'#c7d5e0',display:'flex'}}><PlatformLogo platform="Steam" size={12}/></span>
                <span style={{fontSize:'10px',color:'#c7d5e0',fontWeight:'600'}}>Steam</span>
              </div>
            )}
            {profile?.discord_username && (
              <div style={{display:'inline-flex',alignItems:'center',gap:'4px',padding:'3px 8px',borderRadius:'20px',background:'#5865F2'}}>
                <span style={{color:'#fff',display:'flex'}}><PlatformLogo platform="Discord" size={12}/></span>
                <span style={{fontSize:'10px',color:'#fff',fontWeight:'600'}}>{profile.discord_username}</span>
              </div>
            )}
          </div>
        </div>
        <button onClick={handleDelete} disabled={deleting}
          style={{padding:'7px 12px',borderRadius:'10px',border:'1px solid #FCEBEB',background:'#FCEBEB',color:'#e63946',fontSize:'12px',fontWeight:'600',cursor:'pointer',fontFamily:'inherit',flexShrink:0}}>
          {deleting ? '...' : 'Supprimer'}
        </button>
      </div>

      {/* Jeux */}
      {games.length > 0 && (
        <div style={{padding:'14px 16px 0'}}>
          <div style={{fontSize:'10px',fontWeight:'700',color:'#bbb',letterSpacing:'.08em',textTransform:'uppercase',marginBottom:'10px'}}>
            {poteId ? 'Jeux joués' : 'Gamertags'}
          </div>
          {games.map((g, i) => (
            <div key={i} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 0',borderBottom:'1px solid #f5f5f5'}}>
              <div style={{width:'36px',height:'36px',borderRadius:'10px',background:platformColors[g.platform]?.bg||'#eee',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <span style={{color:platformColors[g.platform]?.color||'#888',display:'flex',alignItems:'center'}}>
                  <PlatformLogo platform={g.platform} size={18}/>
                </span>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:'13px',fontWeight:'600',color:'#111'}}>{g.game_name}</div>
                <div style={{display:'flex',alignItems:'center',gap:'6px',marginTop:'2px'}}>
                  <span style={{fontSize:'10px',color:'#aaa'}}>{g.platform}</span>
                  {g.hours_played > 0 && (
                    <span style={{fontSize:'10px',color:'#aaa'}}>· {g.hours_played}h</span>
                  )}
                </div>
              </div>
              {g.last_played && (
                <div style={{fontSize:'10px',color:'#bbb'}}>
                  {new Date(g.last_played).toLocaleDateString('fr-FR',{day:'numeric',month:'short'})}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {games.length === 0 && (
        <div style={{padding:'30px 16px',textAlign:'center'}}>
          <div style={{fontSize:'24px',marginBottom:'8px'}}>🎮</div>
          <div style={{fontSize:'13px',color:'#aaa'}}>Aucun jeu renseigné pour l'instant</div>
        </div>
      )}
    </div>
  )
}