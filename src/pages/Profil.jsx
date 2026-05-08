import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'

export default function Profil({ user, profile, onProfileUpdate, onSignOut }) {
  const [myGames, setMyGames] = useState([])
  const [newGame, setNewGame] = useState('')
  const [newPlatform, setNewPlatform] = useState('Steam')
  const [showAddGame, setShowAddGame] = useState(false)
  const [steamImporting, setSteamImporting] = useState(false)
  const [steamResult, setSteamResult] = useState(null)
  const [gameSuggestions, setGameSuggestions] = useState([])
  const [searchingGames, setSearchingGames] = useState(false)
  const [editingTag, setEditingTag] = useState(null)
  const [tagValue, setTagValue] = useState('')
  const searchTimeout = useRef(null)

  const platforms = ['Steam', 'Xbox', 'PS', 'Epic', 'Discord']

  const platformColors = {
    'Steam': { bg: '#1b2838', color: '#c7d5e0' },
    'Xbox': { bg: '#107c10', color: '#fff' },
    'PS': { bg: '#003087', color: '#fff' },
    'Epic': { bg: '#2d2d2d', color: '#fff' },
    'Discord': { bg: '#5865F2', color: '#fff' }
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

  useEffect(() => { fetchMyGames() }, [])

  const fetchMyGames = async () => {
    const { data } = await supabase
      .from('user_games').select('*').eq('user_id', user.id)
      .order('hours_played', { ascending: false })
    setMyGames(data || [])
  }

  const searchGames = async (query) => {
    if (!query || query.length < 2) { setGameSuggestions([]); return }
    setSearchingGames(true)
    try {
      const res = await fetch(`/api/games-search?query=${encodeURIComponent(query)}`)
      const data = await res.json()
      setGameSuggestions(data.games || [])
    } catch(e) {
      setGameSuggestions([])
    }
    setSearchingGames(false)
  }

  const handleGameInput = (value) => {
    setNewGame(value)
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => searchGames(value), 400)
  }

  const selectGame = async (game) => {
    setNewGame(game.name)
    setGameSuggestions([])
    await supabase.from('user_games').upsert({
      user_id: user.id, game_name: game.name, platform: newPlatform,
      last_played: new Date().toISOString()
    }, { onConflict: 'user_id,game_name' })
    setNewGame('')
    setShowAddGame(false)
    fetchMyGames()
  }

  const connectSteam = async () => {
    const steamId = prompt('Entre ton Steam ID (ex: 76561199027066116)\nTrouve-le sur steamcommunity.com/id/tonpseudo')
    if (!steamId) return
    setSteamImporting(true)
    setSteamResult(null)
    try {
      await supabase.from('profiles').update({ steam_id: steamId }).eq('id', user.id)
      const resGames = await fetch(`/api/steam?steamid=${steamId}`)
      const dataGames = await resGames.json()
      if (dataGames.games && dataGames.games.length > 0) {
        for (const g of dataGames.games) {
          await supabase.from('user_games').upsert({
            user_id: user.id, game_name: g.name, platform: 'Steam',
            hours_played: Math.floor(g.hours || 0), last_played: new Date().toISOString()
          }, { onConflict: 'user_id,game_name' })
        }
      }
      const resRecent = await fetch(`/api/steam?steamid=${steamId}&type=recent`)
      const dataRecent = await resRecent.json()
      if (dataRecent.games && dataRecent.games.length > 0) {
        for (const g of dataRecent.games) {
          await supabase.from('user_games').upsert({
            user_id: user.id, game_name: g.name, platform: 'Steam',
            hours_played: g.hours_total, last_played: g.last_played
          }, { onConflict: 'user_id,game_name' })
        }
      }
      await fetchMyGames()
      const resFriends = await fetch(`/api/steam-friends?steamid=${steamId}`)
      const dataFriends = await resFriends.json()
      let newFriends = 0
      if (dataFriends.friends && dataFriends.friends.length > 0) {
        const { data: matches } = await supabase
          .from('profiles').select('id, name, steam_id').in('steam_id', dataFriends.friends)
        if (matches && matches.length > 0) {
          for (const match of matches) {
            if (match.id === user.id) continue
            await supabase.from('friends').upsert({ user_id: user.id, friend_id: match.id }, { onConflict: 'user_id,friend_id' })
            await supabase.from('friends').upsert({ user_id: match.id, friend_id: user.id }, { onConflict: 'user_id,friend_id' })
            newFriends++
          }
        }
      }
      setSteamResult({ friends: newFriends, friendsTotal: dataFriends.friends?.length || 0 })
    } catch(e) {
      alert('Erreur : ' + e.message)
    }
    setSteamImporting(false)
  }

  const connectDiscord = () => {
    window.location.href = '/api/discord-auth'
  }

  const saveTag = async (key, value) => {
    await supabase.from('profiles').update({ [key]: value }).eq('id', user.id)
    setEditingTag(null)
    setTagValue('')
    if (onProfileUpdate) onProfileUpdate()
  }

  const handleAddGame = async () => {
    if (!newGame.trim()) return
    await supabase.from('user_games').upsert({
      user_id: user.id, game_name: newGame.trim(), platform: newPlatform,
      last_played: new Date().toISOString()
    }, { onConflict: 'user_id,game_name' })
    setNewGame('')
    setShowAddGame(false)
    setGameSuggestions([])
    fetchMyGames()
  }

  const handleDeleteGame = async (id) => {
    await supabase.from('user_games').delete().eq('id', id)
    fetchMyGames()
  }

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : '?'

  const platforms_list = [
    { key: 'steam', label: 'Steam', bg: '#1b2838', color: '#c7d5e0', action: connectSteam, connected: profile?.steam_id },
    { key: 'discord', label: 'Discord', bg: '#5865F2', color: '#fff', action: connectDiscord, connected: profile?.discord_id, subtitle: profile?.discord_username },
    { key: 'psn', label: 'PS', bg: '#003087', color: '#fff', tagKey: 'psn_tag', placeholder: 'ex: MonPseudoPS', connected: profile?.psn_tag },
    { key: 'xbox', label: 'Xbox', bg: '#107c10', color: '#fff', tagKey: 'xbox_tag', placeholder: 'ex: MonGamertag', connected: profile?.xbox_tag },
    { key: 'epic', label: 'Epic', bg: '#2d2d2d', color: '#fff', tagKey: 'epic_tag', placeholder: 'ex: MonEpicTag', connected: profile?.epic_tag },
  ]

  return (
    <div>
      {/* Hero profil */}
      <div style={{padding:'20px 16px 16px',display:'flex',alignItems:'center',gap:'14px',borderBottom:'1px solid #f5f5f5'}}>
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt={profile?.name}
            style={{width:'56px',height:'56px',borderRadius:'50%',objectFit:'cover',flexShrink:0,border:'3px solid #EAF3DE'}}/>
        ) : (
          <div style={{width:'56px',height:'56px',borderRadius:'50%',background:'#EAF3DE',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',fontWeight:'700',color:'#27500A',flexShrink:0}}>
            {getInitials(profile?.name)}
          </div>
        )}
        <div style={{flex:1}}>
          <div style={{fontSize:'16px',fontWeight:'700',color:'#111'}}>{profile?.name}</div>
          <div style={{fontSize:'12px',color:'#aaa',marginTop:'2px'}}>📱 {profile?.phone}</div>
        </div>
      </div>

      {/* Comptes connectés */}
      <div style={{margin:'14px 16px',border:'1px solid #eee',borderRadius:'16px',overflow:'hidden'}}>
        <div style={{padding:'10px 14px',background:'#fafaf9'}}>
          <span style={{fontSize:'11px',fontWeight:'700',color:'#888',textTransform:'uppercase',letterSpacing:'.06em'}}>Mes comptes</span>
        </div>

        {platforms_list.map((p) => (
          <div key={p.key}>
            <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 14px',borderTop:'1px solid #f0f0f0'}}>
              <div style={{width:'36px',height:'36px',borderRadius:'8px',background:p.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <span style={{color:p.color,display:'flex',alignItems:'center'}}>
                  <PlatformLogo platform={p.label} size={18}/>
                </span>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:'13px',fontWeight:'600',color:'#111'}}>{p.label}</div>
                <div style={{fontSize:'10px',color:'#bbb',marginTop:'1px'}}>
                  {p.connected ? `✓ ${p.subtitle || p.connected}` : 'Non connecté'}
                </div>
              </div>
              <button
                onClick={() => {
                  if (p.action) {
                    p.action()
                  } else if (p.tagKey) {
                    setEditingTag(p.tagKey)
                    setTagValue(p.connected || '')
                  }
                }}
                disabled={p.key === 'steam' && steamImporting}
                style={{fontSize:'11px',padding:'5px 12px',borderRadius:'20px',border:'1px solid #eee',background:'#fff',color:'#111',cursor:'pointer',fontFamily:'inherit',fontWeight:'600',opacity:(p.key==='steam'&&steamImporting)?0.6:1}}>
                {p.key === 'steam' && steamImporting ? '...' : p.connected ? 'Modifier' : '+ Ajouter'}
              </button>
            </div>

            {/* Champ de saisie manuelle PSN/Xbox/Epic */}
            {p.tagKey && editingTag === p.tagKey && (
              <div style={{padding:'0 14px 12px',display:'flex',gap:'6px'}}>
                <input
                  type="text"
                  placeholder={p.placeholder}
                  value={tagValue}
                  onChange={e => setTagValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveTag(p.tagKey, tagValue)}
                  autoFocus
                  style={{flex:1,padding:'8px 12px',border:'1px solid #eee',borderRadius:'10px',fontSize:'13px',color:'#111',fontFamily:'inherit',outline:'none'}}
                />
                <button onClick={() => saveTag(p.tagKey, tagValue)}
                  style={{padding:'8px 14px',borderRadius:'10px',background:'#111',color:'#fff',border:'none',fontSize:'12px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit'}}>
                  ✓
                </button>
                <button onClick={() => setEditingTag(null)}
                  style={{padding:'8px 10px',borderRadius:'10px',background:'#f5f5f5',color:'#888',border:'none',fontSize:'12px',cursor:'pointer',fontFamily:'inherit'}}>
                  ✕
                </button>
              </div>
            )}

            {p.key === 'steam' && steamImporting && (
              <div style={{margin:'0 14px 12px',padding:'10px 12px',background:'#f5f5f5',borderRadius:'10px',fontSize:'11px',color:'#888'}}>
                🔍 Import jeux récents + scan amis Steam...
              </div>
            )}
            {p.key === 'steam' && steamResult && (
              <div style={{margin:'0 14px 12px',padding:'10px 12px',background:'#EAF3DE',borderRadius:'10px'}}>
                <div style={{fontSize:'12px',fontWeight:'700',color:'#27500A'}}>
                  {steamResult.friends > 0
                    ? `🎉 ${steamResult.friends} pote${steamResult.friends > 1 ? 's' : ''} trouvé${steamResult.friends > 1 ? 's' : ''} !`
                    : '😕 Aucun pote Steam sur GamerLink pour l\'instant'}
                </div>
                <div style={{fontSize:'10px',color:'#639922',marginTop:'2px'}}>
                  {steamResult.friendsTotal} amis scannés · Jeux importés ✓
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mes jeux */}
      <div style={{margin:'0 16px 14px',border:'1px solid #eee',borderRadius:'16px',overflow:'hidden'}}>
        <div style={{padding:'10px 14px',background:'#fafaf9',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'6px'}}>
          <span style={{fontSize:'11px',fontWeight:'700',color:'#888',textTransform:'uppercase',letterSpacing:'.06em'}}>Mes jeux</span>
          <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
            <button onClick={connectSteam}
              style={{display:'flex',alignItems:'center',gap:'4px',fontSize:'11px',color:'#c7d5e0',background:'#1b2838',border:'none',padding:'3px 8px',borderRadius:'20px',cursor:'pointer',fontFamily:'inherit',fontWeight:'600',whiteSpace:'nowrap'}}>
              <span style={{display:'flex',alignItems:'center'}}><PlatformLogo platform="Steam" size={10}/></span>
              Steam
            </button>
            <button onClick={() => setShowAddGame(!showAddGame)}
              style={{fontSize:'11px',color:'#185FA5',fontWeight:'600',background:'none',border:'none',cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}}>
              {showAddGame ? 'Fermer' : '+ Ajouter'}
            </button>
          </div>
        </div>

        {showAddGame && (
          <div style={{padding:'12px',borderTop:'1px solid #f0f0f0',background:'#fafaf9'}}>
            <div style={{position:'relative',marginBottom:'8px'}}>
              <input type="text" placeholder="Recherche un jeu..." value={newGame}
                onChange={e => handleGameInput(e.target.value)}
                style={{width:'100%',padding:'8px 12px',border:'1px solid #eee',borderRadius:'10px',fontSize:'13px',color:'#111',fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}/>
              {searchingGames && (
                <div style={{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',fontSize:'11px',color:'#bbb'}}>...</div>
              )}
              {gameSuggestions.length > 0 && (
                <div style={{position:'absolute',top:'100%',left:0,right:0,background:'#fff',border:'1px solid #eee',borderRadius:'10px',marginTop:'4px',zIndex:100,boxShadow:'0 4px 12px rgba(0,0,0,0.1)',overflow:'hidden'}}>
                  {gameSuggestions.map((g, i) => (
                    <div key={g.id} onClick={() => selectGame(g)}
                      style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 12px',cursor:'pointer',borderBottom:i<gameSuggestions.length-1?'1px solid #f5f5f5':'none',background:'#fff'}}
                      onMouseEnter={e => e.currentTarget.style.background='#fafaf9'}
                      onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                      {g.cover?.url ? (
                        <img src={g.cover.url.replace('t_thumb','t_cover_small')} alt={g.name}
                          style={{width:'36px',height:'36px',borderRadius:'6px',objectFit:'cover',flexShrink:0}}/>
                      ) : (
                        <div style={{width:'36px',height:'36px',borderRadius:'6px',background:'#f0f0f0',flexShrink:0}}/>
                      )}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:'12px',fontWeight:'600',color:'#111',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{g.name}</div>
                        <div style={{fontSize:'10px',color:'#aaa',marginTop:'1px'}}>
                          {g.genres?.slice(0,2).map(genre => genre.name).join(' · ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{display:'flex',gap:'6px'}}>
              <select value={newPlatform} onChange={e => setNewPlatform(e.target.value)}
                style={{flex:1,padding:'8px 10px',border:'1px solid #eee',borderRadius:'10px',fontSize:'12px',color:'#111',fontFamily:'inherit',background:'#fff'}}>
                {platforms.map(p => <option key={p}>{p}</option>)}
              </select>
              <button onClick={handleAddGame} disabled={!newGame.trim()}
                style={{flex:1,padding:'9px',borderRadius:'10px',background:'#111',color:'#fff',border:'none',fontSize:'12px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit',opacity:!newGame.trim()?0.5:1}}>
                Ajouter
              </button>
            </div>
          </div>
        )}

        {myGames.length === 0 && !showAddGame && (
          <div style={{padding:'16px',textAlign:'center',fontSize:'12px',color:'#bbb'}}>
            Connecte Steam ou ajoute tes jeux manuellement
          </div>
        )}

        {myGames.map(g => (
          <div key={g.id} style={{display:'flex',alignItems:'center',gap:'10px',padding:'9px 14px',borderTop:'1px solid #f0f0f0'}}>
            <div style={{width:'32px',height:'32px',borderRadius:'8px',background:platformColors[g.platform]?.bg||'#eee',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <span style={{color:platformColors[g.platform]?.color||'#888',display:'flex',alignItems:'center'}}>
                <PlatformLogo platform={g.platform} size={16}/>
              </span>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:'13px',fontWeight:'600',color:'#111'}}>{g.game_name}</div>
              <div style={{fontSize:'10px',color:'#aaa',marginTop:'1px'}}>
                {g.platform}{g.hours_played ? ` · ${g.hours_played}h` : ''}
                {g.last_played ? ` · ${new Date(g.last_played).toLocaleDateString('fr-FR',{day:'numeric',month:'short'})}` : ''}
              </div>
            </div>
            <button onClick={() => handleDeleteGame(g.id)}
              style={{background:'none',border:'none',cursor:'pointer',color:'#ddd',fontSize:'16px',padding:'4px'}}>×</button>
          </div>
        ))}
      </div>

      {/* Déconnexion */}
      <div style={{padding:'0 16px 32px'}}>
        <button onClick={onSignOut}
          style={{width:'100%',padding:'12px',borderRadius:'12px',background:'#fff',border:'1px solid #eee',color:'#e63946',fontSize:'13px',fontWeight:'600',cursor:'pointer',fontFamily:'inherit'}}>
          Se déconnecter
        </button>
      </div>
    </div>
  )
}