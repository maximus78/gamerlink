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

      <div style={{padding:'0 16px 16px',display:'flex',alignItems:'center',gap:'14px',borderBottom:'1px solid #f5f5f5'}}>
        <div style={{width:'56px',height:'56px',borderRadius:'50%',background:getColor(name),color:getTextColor(name),display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',fontWeight:'700',flexShrink:0}}>
          {getInitials(name)}
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:'18px',fontWeight:'700',color:'#111'}}>{name}</div>
          {status ? (
            <div style={{fontSize:'12px',color:'#27500A',background:'#EAF3DE',padding:'2px 8px',borderRadius:'20px',display:'inline-block',marginTop:'4px',fontWeight:'600'}}>
              En game · {status.game}
            </div>
          ) : (
            <div style={{fontSize:'12px',color:'#aaa',marginTop:'4px'}}>Hors ligne</div>
          )}
        </div>
        <button onClick={handleDelete} disabled={deleting}
          style={{padding:'7px 12px',borderRadius:'10px',border:'1px solid #FCEBEB',background:'#FCEBEB',color:'#e63946',fontSize:'12px',fontWeight:'600',cursor:'pointer',fontFamily:'inherit',flexShrink:0}}>
          {deleting ? '...' : 'Supprimer'}
        </button>
      </div>

      {games.length > 0 && (
        <div style={{padding:'14px 16px 0'}}>
          <div style={{fontSize:'10px',fontWeight:'700',color:'#bbb',letterSpacing:'.08em',textTransform:'uppercase',marginBottom:'10px'}}>
            {poteId ? 'Jeux joués' : 'Gamertags'}
          </div>
          {games.map((g, i) => (
            <div key={i} style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px 0',borderBottom:'1px solid #f5f5f5'}}>
              <div style={{width:'32px',height:'32px',borderRadius:'8px',background:platformColors[g.platform]?.bg||'#eee',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <span style={{fontSize:'9px',fontWeight:'700',color:platformColors[g.platform]?.color||'#888'}}>{g.platform||'JEU'}</span>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:'13px',fontWeight:'600',color:'#111'}}>{g.game_name}</div>
                {g.hours_played > 0 && (
                  <div style={{fontSize:'11px',color:'#aaa',marginTop:'1px'}}>{g.hours_played}h jouées</div>
                )}
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