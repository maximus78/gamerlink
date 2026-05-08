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
  const searchTimeout = useRef(null)

  const platforms = ['Steam', 'Xbox', 'PS', 'Epic', 'Discord']

  const platformColors = {
    'Steam': { bg: '#1b2838', color: '#c7d5e0' },
    'Xbox': { bg: '#107c10', color: '#fff' },
    'PS': { bg: '#003087', color: '#fff' },
    'Epic': { bg: '#2d2d2d', color: '#fff' },
    'Discord': { bg: '#5865F2', color: '#fff' }
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
      const res = await fetch(`https://api.rawg.io/api/games?search=${encodeURIComponent(query)}&page_size=6&key=`)
      const data = await res.json()
      setGameSuggestions(data.results || [])
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
    // Ajouter directement
    await supabase.from('user_games').upsert({
      user_id: user.id,
      game_name: game.name,
      platform: newPlatform,
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
        await fetchMyGames()
      }

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
          {profile?.discord_username && (
            <div style={{fontSize:'11px',color:'#5865F2',marginTop:'2px'}}>Discord : {profile.discord_username}</div>
          )}
        </div>
      </div>

      {/* Comptes connectés */}
      <div style={{margin:'14px 16px',border:'1px solid #eee',borderRadius:'16px',overflow:'hidden'}}>
        <div style={{padding:'10px 14px',background:'#fafaf9'}}>
          <span style={{fontSize:'11px',fontWeight:'700',color:'#888',textTransform:'uppercase',letterSpacing:'.06em'}}>Mes comptes</span>
        </div>

        {/* Steam */}
        <div style={{borderTop:'1px solid #f0f0f0'}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 14px'}}>
            <div style={{width:'36px',height:'36px',borderRadius:'8px',background:'#1b2838',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <span style={{fontSize:'10px',fontWeight:'700',color:'#c7d5e0'}}>Steam</span>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:'13px',fontWeight:'600',color:'#111'}}>Steam</div>
              <div style={{fontSize:'10px',color:'#bbb',marginTop:'1px'}}>
                {profile?.steam_id ? '✓ Connecté' : 'Non connecté'}
              </div>
            </div>
            <button onClick={connectSteam} disabled={steamImporting}
              style={{fontSize:'11px',padding:'5px 12px',borderRadius:'20px',border:'1px solid #eee',background:'#fff',color:'#111',cursor:'pointer',fontFamily:'inherit',fontWeight:'600',opacity:steamImporting?0.6:1}}>
              {steamImporting ? '...' : profile?.steam_id ? 'Resync' : '+ Connecter'}
            </button>
          </div>
          {steamImporting && (
            <div style={{margin:'0 14px 12px',padding:'10px 12px',background:'#f5f5f5',borderRadius:'10px',fontSize:'11px',color:'#888'}}>
              🔍 Import jeux + scan amis Steam en cours...
            </div>
          )}
          {steamResult && (
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

        {/* Discord */}
        <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 14px',borderTop:'1px solid #f0f0f0'}}>
          <div style={{width:'36px',height:'36px',borderRadius:'8px',background:'#5865F2',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <span style={{fontSize:'9px',fontWeight:'700',color:'#fff'}}>Discord</span>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:'13px',fontWeight:'600',color:'#111'}}>Discord</div>
            <div style={{fontSize:'10px',color:'#bbb',marginTop:'1px'}}>
              {profile?.discord_id ? `✓ ${profile.discord_username || 'Connecté'}` : 'Non connecté'}
            </div>
          </div>
          <button onClick={connectDiscord}
            style={{fontSize:'11px',padding:'5px 12px',borderRadius:'20px',border:'1px solid #eee',background:'#fff',color:'#111',cursor:'pointer',fontFamily:'inherit',fontWeight:'600'}}>
            {profile?.discord_id ? 'Resync' : '+ Connecter'}
          </button>
        </div>

        {/* PSN + Xbox + Epic */}
        {[
          { key: 'psn', label: 'PSN', bg: '#003087', color: '#fff' },
          { key: 'xbox', label: 'Xbox', bg: '#107c10', color: '#fff' },
          { key: 'epic', label: 'Epic', bg: '#2d2d2d', color: '#fff' },
        ].map(p => (
          <div key={p.key} style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 14px',borderTop:'1px solid #f0f0f0'}}>
            <div style={{width:'36px',height:'36px',borderRadius:'8px',background:p.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <span style={{fontSize:'10px',fontWeight:'700',color:p.color}}>{p.label}</span>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:'13px',fontWeight:'600',color:'#111'}}>{p.label}</div>
              <div style={{fontSize:'10px',color:'#bbb',marginTop:'1px'}}>Bientôt disponible</div>
            </div>
            <button onClick={() => alert('Bientôt disponible')}
              style={{fontSize:'11px',padding:'5px 12px',borderRadius:'20px',border:'1px solid #eee',background:'#fff',color:'#bbb',cursor:'pointer',fontFamily:'inherit',fontWeight:'600'}}>
              + Connecter
            </button>
          </div>
        ))}
      </div>

      {/* Mes jeux */}
      <div style={{margin:'0 16px 14px',border:'1px solid #eee',borderRadius:'16px',overflow:'hidden'}}>
        <div style={{padding:'10px 14px',background:'#fafaf9',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'6px'}}>
          <span style={{fontSize:'11px',fontWeight:'700',color:'#888',textTransform:'uppercase',letterSpacing:'.06em'}}>Mes jeux</span>
          <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
            <button onClick={connectSteam}
              style={{fontSize:'11px',color:'#c7d5e0',background:'#1b2838',border:'none',padding:'3px 8px',borderRadius:'20px',cursor:'pointer',fontFamily:'inherit',fontWeight:'600',whiteSpace:'nowrap'}}>
              ⬇ Steam
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
                <div style={{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',fontSize:'11px',color:'#bbb'}}>
                  ...
                </div>
              )}
              {/* Suggestions */}
              {gameSuggestions.length > 0 && (
                <div style={{position:'absolute',top:'100%',left:0,right:0,background:'#fff',border:'1px solid #eee',borderRadius:'10px',marginTop:'4px',zIndex:100,boxShadow:'0 4px 12px rgba(0,0,0,0.1)',overflow:'hidden'}}>
                  {gameSuggestions.map((g, i) => (
                    <div key={g.id} onClick={() => selectGame(g)}
                      style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 12px',cursor:'pointer',borderBottom:i<gameSuggestions.length-1?'1px solid #f5f5f5':'none',background:'#fff'}}
                      onMouseEnter={e => e.currentTarget.style.background='#fafaf9'}
                      onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                      {g.background_image ? (
                        <img src={g.background_image} alt={g.name}
                          style={{width:'36px',height:'36px',borderRadius:'6px',objectFit:'cover',flexShrink:0}}/>
                      ) : (
                        <div style={{width:'36px',height:'36px',borderRadius:'6px',background:'#f0f0f0',flexShrink:0}}/>
                      )}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:'12px',fontWeight:'600',color:'#111',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{g.name}</div>
                        <div style={{fontSize:'10px',color:'#aaa',marginTop:'1px'}}>
                          {g.released ? new Date(g.released).getFullYear() : ''} 
                          {g.genres?.slice(0,2).map(genre => genre.name).join(' · ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{display:'flex',gap:'6px',marginBottom:'8px'}}>
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
              <span style={{fontSize:'9px',fontWeight:'700',color:platformColors[g.platform]?.color||'#888'}}>{g.platform}</span>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:'13px',fontWeight:'600',color:'#111'}}>{g.game_name}</div>
              <div style={{fontSize:'10px',color:'#aaa',marginTop:'1px'}}>{g.platform}{g.hours_played ? ` · ${g.hours_played}h` : ''}</div>
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