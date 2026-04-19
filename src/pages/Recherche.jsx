import { useState } from 'react'
import { supabase } from '../supabase'

export default function Recherche({ user }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState({})

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

  const handleSearch = async () => {
    if (query.length < 2) return
    setLoading(true)
    const cleanQuery = query.replace(/\s/g, '')
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .or(`phone.ilike.%${cleanQuery}%,name.ilike.%${query}%`)
      .limit(10)
    setResults((data || []).filter(p => p.id !== user.id))
    setLoading(false)
  }

  const handleAdd = async (friendId) => {
    await supabase.from('friends').upsert({
      user_id: user.id,
      friend_id: friendId
    })
    setAdded(prev => ({ ...prev, [friendId]: true }))
  }

  return (
    <div>
      <div style={{padding:'12px 16px 0'}}>
        <div style={{fontSize:'16px',fontWeight:'700',color:'#111',marginBottom:'4px'}}>Rechercher un pote</div>
        <div style={{fontSize:'12px',color:'#aaa',marginBottom:'14px'}}>Par numéro de téléphone ou par nom</div>

        <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
          <input
            type="text"
            placeholder="06 12 34 56 78 ou prénom..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            style={{flex:1,padding:'11px 14px',border:'1px solid #eee',borderRadius:'12px',fontSize:'14px',color:'#111',fontFamily:'inherit',outline:'none',background:'#fafaf9'}}
          />
          <button onClick={handleSearch}
            style={{padding:'11px 16px',borderRadius:'12px',background:'#111',color:'#fff',border:'none',fontSize:'13px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}}>
            Chercher
          </button>
        </div>

        {loading && (
          <div style={{textAlign:'center',color:'#aaa',fontSize:'13px',padding:'20px'}}>Recherche...</div>
        )}

        {!loading && results.length === 0 && query.length >= 2 && (
          <div style={{textAlign:'center',padding:'30px 0'}}>
            <div style={{fontSize:'28px',marginBottom:'10px'}}>🔍</div>
            <div style={{fontSize:'14px',fontWeight:'600',color:'#111',marginBottom:'6px'}}>Aucun résultat</div>
            <div style={{fontSize:'12px',color:'#aaa',lineHeight:'1.5'}}>
              Ce pote n'est pas encore sur GamerLink. Copie le lien d'invitation dans "Qui joue" pour l'inviter.
            </div>
          </div>
        )}

        {results.map(profile => (
          <div key={profile.id}
            style={{display:'flex',alignItems:'center',gap:'12px',padding:'10px 0',borderBottom:'1px solid #f5f5f5'}}>
            <div style={{width:'44px',height:'44px',borderRadius:'50%',background:getColor(profile.name),color:getTextColor(profile.name),display:'flex',alignItems:'center',justifyContent:'center',fontSize:'15px',fontWeight:'700',flexShrink:0}}>
              {getInitials(profile.name)}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:'14px',fontWeight:'600',color:'#111'}}>{profile.name}</div>
              <div style={{fontSize:'11px',color:'#bbb',marginTop:'2px'}}>
                {profile.phone ? `${profile.phone.slice(0,4)}•••••${profile.phone.slice(-2)}` : 'GamerLink'}
              </div>
            </div>
            <button onClick={() => handleAdd(profile.id)} disabled={added[profile.id]}
              style={{padding:'7px 14px',borderRadius:'20px',border:'1.5px solid',cursor:'pointer',fontFamily:'inherit',fontSize:'12px',fontWeight:'700',
                borderColor: added[profile.id] ? '#3B6D11' : '#111',
                background: added[profile.id] ? '#EAF3DE' : '#111',
                color: added[profile.id] ? '#27500A' : '#fff'
              }}>
              {added[profile.id] ? 'Ajouté ✓' : 'Ajouter'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}