import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const GAMES = [
  { id:'1172470', name:'Apex Legends', sub:'Battle Royale · Free', bg:'#cd3333', badge:'Pic actuel', badgeBg:'#e63946', players:'487k', youtube:'2.1M', trend:'↑ +34%', phase:2, spark:[20,22,25,28,35,42,48,52,58,62,68,72,75,78,82,87] },
  { id:'730', name:'CS2', sub:'FPS Tactique · Free', bg:'#1b2838', badge:'Toujours fort', badgeBg:'#378ADD', players:'1.2M', youtube:'3.4M', trend:'↑ +12%', phase:2, spark:[60,62,58,65,68,70,65,72,75,73,78,80,75,82,85,88] },
  { id:'2519060', name:'Warzone', sub:'Battle Royale · Free', bg:'#1a1a2e', badge:'En montée', badgeBg:'#EF9F27', players:'487k', youtube:'2.1M', trend:'↑ +18%', phase:1, spark:[10,12,15,18,22,28,32,38,42,48,52,58,62,68,72,75] },
  { id:'252950', name:'Rocket League', sub:'Sport · Free', bg:'#0d1b2a', badge:'Stable', badgeBg:'#4cc9f0', players:'120k', youtube:'890k', trend:'→ stable', phase:2, spark:[55,58,52,60,58,62,55,60,58,62,60,58,62,60,58,62] },
  { id:'2668510', name:'Elden Ring Nightreign', sub:'RPG · 39€ · Sort le 30 mai', bg:'#1a0a2e', badge:'Pré-hype', badgeBg:'#1D9E75', players:'—', youtube:'4.8M', trend:'↑ +580%', phase:0, spark:[2,3,4,5,8,10,15,20,28,35,45,55,65,75,85,92] },
  { id:'1174180', name:'Schedule I', sub:'Indie · 18€', bg:'#0d1b2a', badge:'Pépite indie', badgeBg:'#7F77DD', players:'148k', youtube:'890k', trend:'↑ +312%', phase:1, spark:[5,8,12,18,25,35,45,55,62,68,72,75,78,80,82,85] },
  { id:'1237970', name:'Titanfall 2', sub:'FPS · 7€', bg:'#1a1a2e', badge:'Pépite cachée', badgeBg:'#639922', players:'15k', youtube:'340k', trend:'↑ +22%', phase:2, spark:[30,32,35,33,38,36,40,38,42,40,44,42,46,44,48,50] },
]

const phases = ['Inconnu','Montée','Pic','Déclin']

export default function Decouvrir({ user }) {
  const [search, setSearch] = useState('')
  const [friendStatuses, setFriendStatuses] = useState([])

  useEffect(() => {
    fetchFriendStatuses()
  }, [])

  const fetchFriendStatuses = async () => {
    if (!user) return
    const { data: friends } = await supabase
      .from('friends').select('friend_id').eq('user_id', user.id)
    const friendIds = (friends || []).map(f => f.friend_id)
    if (friendIds.length === 0) return
    const { data } = await supabase
      .from('statuses')
      .select('*, profiles(name)')
      .gt('expires_at', new Date().toISOString())
      .in('user_id', friendIds)
    setFriendStatuses(data || [])
  }

  const getPotesForGame = (gameName) => {
    return friendStatuses.filter(s =>
      s.game?.toLowerCase().includes(gameName.toLowerCase()) ||
      gameName.toLowerCase().includes(s.game?.toLowerCase())
    )
  }

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : '?'
  const getColor = (name) => ['#C0DD97','#CECBF6','#FAC775','#B5D4F4','#F5C4B3','#9FE1CB'][name ? name.charCodeAt(0)%6 : 0]
  const getTextColor = (name) => ['#27500A','#3C3489','#633806','#0C447C','#712B13','#085041'][name ? name.charCodeAt(0)%6 : 0]

  const filtered = GAMES.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase())
  )

  const openSteam = (gameId) => window.open(`https://store.steampowered.com/app/${gameId}/?utm_source=gamerlink`, '_blank')
  const openYoutube = (gameName) => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(gameName + ' gameplay 2026')}`, '_blank')

  const Spark = ({ data, color }) => {
    const max = Math.max(...data)
    const min = Math.min(...data)
    const w = 80, h = 28
    const pts = data.map((v, i) => {
      const x = (i / (data.length - 1)) * w
      const y = h - ((v - min) / (max - min)) * h
      return `${x},${y}`
    }).join(' ')
    const area = `0,${h} ` + pts + ` ${w},${h}`
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2"/>
        <polygon points={area} fill={color} opacity=".1"/>
        <circle cx={data.length > 0 ? (((data.length-1)/(data.length-1))*w) : w} cy={h - ((data[data.length-1] - min) / (max - min)) * h} r="3" fill={color}/>
      </svg>
    )
  }

  return (
    <div>
      <div style={{padding:'12px 16px 8px'}}>
        <input type="text" placeholder="Chercher un jeu..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{width:'100%',padding:'10px 14px',border:'1px solid #eee',borderRadius:'12px',fontSize:'14px',color:'#111',fontFamily:'inherit',outline:'none',background:'#fafaf9'}}
        />
      </div>

      {filtered.map((g, idx) => {
        const potes = getPotesForGame(g.name)
        return (
          <div key={g.id} style={{margin: idx===0 ? '4px 16px 10px' : '0 16px 10px',border:'1px solid #eee',borderRadius:'20px',overflow:'hidden'}}>
            <div style={{height:'80px',position:'relative',display:'flex',alignItems:'flex-end',padding:'12px 14px'}}>
              <div style={{position:'absolute',inset:0,background:g.bg}}></div>
              <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,.75),rgba(0,0,0,.1))'}}></div>
              <div style={{position:'relative',zIndex:1,width:'100%',display:'flex',alignItems:'flex-end',gap:'10px'}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:'16px',fontWeight:'700',color:'#fff'}}>{g.name}</div>
                  <div style={{fontSize:'11px',color:'rgba(255,255,255,.65)',marginTop:'2px'}}>{g.sub}</div>
                </div>
                <span style={{fontSize:'10px',fontWeight:'700',background:g.badgeBg,color:'#fff',padding:'3px 9px',borderRadius:'20px',alignSelf:'flex-start'}}>
                  {g.badge}
                </span>
              </div>
            </div>

            <div style={{padding:'10px 14px',borderTop:'1px solid #f0f0f0'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'7px'}}>
                <span style={{fontSize:'11px',fontWeight:'700',color:'#111'}}>Momentum</span>
                <span style={{fontSize:'11px',fontWeight:'700',color:g.badgeBg}}>{g.badge}</span>
              </div>
              <div style={{height:'8px',background:'#f0f0f0',borderRadius:'4px',position:'relative'}}>
                <div style={{height:'100%',width:`${(g.phase/3)*100}%`,borderRadius:'4px',background:`linear-gradient(to right,#EAF3DE,#639922,${g.badgeBg})`}}></div>
                <div style={{position:'absolute',top:'-3px',left:`${(g.phase/3)*100}%`,width:'14px',height:'14px',borderRadius:'50%',background:g.badgeBg,border:'2.5px solid #fff',boxShadow:'0 1px 4px rgba(0,0,0,.25)',transform:'translateX(-50%)'}}></div>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:'5px'}}>
                {phases.map((p,i) => (
                  <span key={i} style={{fontSize:'9px',color: i===g.phase ? g.badgeBg : '#bbb',fontWeight: i===g.phase ? '700' : '500'}}>{p}{i===g.phase?' ●':''}</span>
                ))}
              </div>
            </div>

            <div style={{display:'flex',borderTop:'1px solid #f0f0f0'}}>
              <div style={{flex:1,padding:'10px 12px',borderRight:'1px solid #f0f0f0',textAlign:'center'}}>
                <div style={{fontSize:'14px',fontWeight:'700',color:'#111'}}>{g.players}</div>
                <div style={{fontSize:'10px',color:'#aaa',marginTop:'2px'}}>joueurs Steam</div>
                <div style={{fontSize:'10px',fontWeight:'700',color:'#27500A',marginTop:'2px'}}>{g.trend}</div>
              </div>
              <div style={{flex:1,padding:'10px 12px',borderRight:'1px solid #f0f0f0',textAlign:'center'}}>
                <div style={{fontSize:'14px',fontWeight:'700',color:'#111'}}>{g.youtube}</div>
                <div style={{fontSize:'10px',color:'#aaa',marginTop:'2px'}}>vues YouTube/j</div>
              </div>
              <div style={{padding:'10px 12px',display:'flex',alignItems:'center'}}>
                <Spark data={g.spark} color={g.badgeBg} />
              </div>
            </div>

            {potes.length > 0 && (
              <div style={{display:'flex',alignItems:'center',gap:'6px',padding:'8px 14px',borderTop:'1px solid #f0f0f0'}}>
                {potes.slice(0,3).map((p,i) => (
                  <div key={i} style={{width:'24px',height:'24px',borderRadius:'50%',background:getColor(p.profiles?.name),color:getTextColor(p.profiles?.name),display:'flex',alignItems:'center',justifyContent:'center',fontSize:'9px',fontWeight:'700',border:'2px solid #fff',marginLeft:i===0?'0':'-6px',flexShrink:0}}>
                    {getInitials(p.profiles?.name)}
                  </div>
                ))}
                <span style={{fontSize:'12px',color:'#555',flex:1,marginLeft:'4px',fontWeight:'500'}}>
                  <strong>{potes.length} pote{potes.length>1?'s':''}</strong> joue{potes.length>1?'nt':''} en ce moment
                </span>
                <button onClick={() => openSteam(g.id)}
                  style={{fontSize:'10px',fontWeight:'700',padding:'4px 10px',borderRadius:'20px',border:'1.5px solid #3B6D11',background:'#EAF3DE',color:'#27500A',cursor:'pointer',fontFamily:'inherit'}}>
                  Rejoindre
                </button>
              </div>
            )}

            {potes.length === 0 && (
              <div style={{display:'flex',alignItems:'center',gap:'6px',padding:'8px 14px',borderTop:'1px solid #f0f0f0'}}>
                <span style={{fontSize:'11px',color:'#aaa',flex:1}}>Aucun pote sur ce jeu</span>
              </div>
            )}

            <div style={{display:'flex',gap:'8px',padding:'8px 14px 10px'}}>
              <button onClick={() => openSteam(g.id)}
                style={{flex:1,padding:'8px',borderRadius:'10px',background:'#1b2838',color:'#c7d5e0',border:'none',fontSize:'11px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:'5px'}}>
                <svg width="12" height="12" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6" fill="none" stroke="#c7d5e0" strokeWidth="1"/><circle cx="9.5" cy="6" r="2" fill="#c7d5e0"/></svg>
                Voir sur Steam
              </button>
              <button onClick={() => openYoutube(g.name)}
                style={{flex:1,padding:'8px',borderRadius:'10px',background:'#ff0000',color:'#fff',border:'none',fontSize:'11px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:'5px'}}>
                <svg width="12" height="12" viewBox="0 0 14 14"><polygon points="5,3 11,7 5,11" fill="#fff"/></svg>
                YouTube
              </button>
            </div>
          </div>
        )
      })}

      <div style={{padding:'8px 16px 20px',fontSize:'11px',color:'#bbb',textAlign:'center',lineHeight:'1.5'}}>
        Les liens Steam soutiennent GamerLink via affiliation.
      </div>
    </div>
  )
}