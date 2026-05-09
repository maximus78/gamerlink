import { useState } from 'react'

const DEMO_PROFILE = {
  id: 'demo-user',
  name: 'Maxime Vibert',
  avatar_initial: 'M',
  avatar_color: '#EAF3DE',
  avatar_text: '#27500A',
  phone: '0698072498',
  steam_id: '76561199027066116',
  discord_username: 'maximus_7891',
  xbox_tag: 'BigBoss42',
}

const DEMO_FRIENDS = [
  {
    id: 'friend-1',
    name: 'Marc',
    avatar_initial: 'M',
    avatar_color: '#FFE8CC',
    avatar_text: '#B85C00',
    status: 'playing',
    game: 'Red Dead Redemption 2',
    platform: 'Steam',
    duration: '23 min',
    available: true,
    tags: [
      { label: 'Compétitif', emoji: '🎯', bg: '#EAF3DE', color: '#27500A' },
      { label: 'Soirs', emoji: '🌆', bg: '#FFF3CC', color: '#7A5C00' },
    ],
  },
  {
    id: 'friend-2',
    name: 'Sarah',
    avatar_initial: 'S',
    avatar_color: '#E8DAFF',
    avatar_text: '#5C2D91',
    status: 'looking',
    game: 'Cherche pour FIFA 25',
    platform: 'PS5',
    duration: null,
    available: true,
    tags: [
      { label: 'Coop', emoji: '🤝', bg: '#FFE8E8', color: '#A02050' },
      { label: 'Weekends', emoji: '🎮', bg: '#E0F0FF', color: '#1F4D80' },
    ],
  },
  {
    id: 'friend-3',
    name: 'Lucas',
    avatar_initial: 'L',
    avatar_color: '#CFE8FF',
    avatar_text: '#1F4D80',
    status: 'playing',
    game: 'Valorant',
    platform: 'Steam',
    duration: '1h 12 min',
    available: false,
    tags: [
      { label: 'Compétitif', emoji: '🎯', bg: '#EAF3DE', color: '#27500A' },
      { label: 'Quotidien', emoji: '🔥', bg: '#FFE0E0', color: '#A02020' },
    ],
  },
  {
    id: 'friend-4',
    name: 'Julie',
    avatar_initial: 'J',
    avatar_color: '#FFD6E8',
    avatar_text: '#A0205E',
    status: 'offline',
    game: null,
    platform: 'Xbox',
    duration: null,
    available: false,
    last_seen: 'Hier 22h',
    tags: [
      { label: 'Casual', emoji: '🎮', bg: '#F0E8FF', color: '#5C2D91' },
      { label: 'Weekends', emoji: '🎮', bg: '#E0F0FF', color: '#1F4D80' },
    ],
  },
  {
    id: 'friend-5',
    name: 'Alex',
    avatar_initial: 'A',
    avatar_color: '#D6F5D6',
    avatar_text: '#1F6B1F',
    status: 'playing',
    game: 'Elden Ring',
    platform: 'PS5',
    duration: '47 min',
    available: true,
    tags: [
      { label: 'Solo', emoji: '🎬', bg: '#FFF0E0', color: '#8B4513' },
      { label: 'Soirs', emoji: '🌆', bg: '#FFF3CC', color: '#7A5C00' },
    ],
  },
]

const DEMO_MY_GAMES = [
  { name: 'Red Dead Redemption 2', platform: 'Steam', last_played: '8 mai', hours: 137 },
  { name: 'Call of Duty', platform: 'Steam', last_played: '8 mai', hours: 13 },
  { name: 'Battlefield 6', platform: 'Steam', last_played: '8 mai', hours: 37 },
  { name: 'Counter-Strike 2', platform: 'Steam', last_played: '6 mai', hours: 412 },
  { name: 'Valorant', platform: 'Steam', last_played: '5 mai', hours: 89 },
]

const PLATFORM_BADGE = {
  Steam: { bg: '#1b2838', color: '#c7d5e0' },
  Discord: { bg: '#5865F2', color: '#fff' },
  PS5: { bg: '#003087', color: '#fff' },
  Xbox: { bg: '#107c10', color: '#fff' },
  Epic: { bg: '#2d2d2d', color: '#fff' },
}

export default function Demo() {
  const [page, setPage] = useState('feed')
  const [isDesktop] = useState(window.innerWidth >= 768)

  const navItems = [
    {
      key: 'feed',
      label: 'Qui joue',
      icon: <svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="7" r="4" fill="currentColor" opacity=".85"/><ellipse cx="10" cy="16" rx="7" ry="3.5" fill="currentColor" opacity=".4"/></svg>
    },
    {
      key: 'status',
      label: 'Statut',
      icon: <svg width="20" height="20" viewBox="0 0 20 20"><polygon points="4,3 16,10 4,17" fill="currentColor" opacity=".85"/></svg>
    },
    {
      key: 'profil',
      label: 'Profil',
      icon: <svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="7" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.8" opacity=".85"/><path d="M3 18c0-3.9 3.1-7 7-7s7 3.1 7 7" fill="none" stroke="currentColor" strokeWidth="1.8" opacity=".85"/></svg>
    },
  ]

  const renderFeed = () => (
    <div style={{padding:'16px'}}>
      <div style={{fontSize:'12px',color:'#888',marginBottom:'12px',textTransform:'uppercase',fontWeight:'600',letterSpacing:'.5px'}}>
        En ce moment ({DEMO_FRIENDS.filter(f => f.status === 'playing' || f.status === 'looking').length})
      </div>

      {DEMO_FRIENDS.map(friend => (
        <div key={friend.id}
          style={{background:'#fff',borderRadius:'14px',padding:'14px',marginBottom:'10px',border:'1px solid #eee',display:'flex',alignItems:'flex-start',gap:'12px'}}>
          
          <div style={{width:'48px',height:'48px',borderRadius:'50%',background:friend.avatar_color,color:friend.avatar_text,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',fontWeight:'700',flexShrink:0,position:'relative',marginTop:'2px'}}>
            {friend.avatar_initial}
            {friend.status === 'playing' && <div style={{position:'absolute',bottom:'-2px',right:'-2px',width:'14px',height:'14px',borderRadius:'50%',background:'#27500A',border:'2px solid #fff'}}/>}
            {friend.status === 'looking' && <div style={{position:'absolute',bottom:'-2px',right:'-2px',width:'14px',height:'14px',borderRadius:'50%',background:'#FFB800',border:'2px solid #fff'}}/>}
          </div>

          <div style={{flex:1,minWidth:0}}>
            <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}>
              <span style={{fontSize:'15px',fontWeight:'700',color:'#111'}}>{friend.name}</span>
              {friend.status === 'looking' && (
                <span style={{fontSize:'10px',color:'#B85C00',background:'#FFE8CC',padding:'2px 8px',borderRadius:'10px',fontWeight:'700'}}>
                  CHERCHE
                </span>
              )}
            </div>
            <div style={{fontSize:'13px',color:'#666',marginBottom:'4px'}}>
              {friend.game ? friend.game : <em style={{color:'#aaa'}}>Hors ligne · {friend.last_seen}</em>}
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'6px',flexWrap:'wrap'}}>
              {friend.platform && PLATFORM_BADGE[friend.platform] && (
                <span style={{fontSize:'10px',padding:'2px 8px',borderRadius:'10px',fontWeight:'600',background:PLATFORM_BADGE[friend.platform].bg,color:PLATFORM_BADGE[friend.platform].color}}>
                  {friend.platform}
                </span>
              )}
              {friend.duration && (
                <span style={{fontSize:'11px',color:'#888'}}>· {friend.duration}</span>
              )}
            </div>
            
            <div style={{display:'flex',gap:'5px',flexWrap:'wrap'}}>
              {friend.tags && friend.tags.map((tag, ti) => (
                <span key={ti} style={{fontSize:'10px',padding:'2px 8px',borderRadius:'10px',fontWeight:'600',background:tag.bg,color:tag.color,display:'inline-flex',alignItems:'center',gap:'3px'}}>
                  <span>{tag.emoji}</span>
                  <span>{tag.label}</span>
                </span>
              ))}
            </div>
          </div>

          {friend.available && (
            <button style={{background:'#111',color:'#fff',border:'none',padding:'8px 14px',borderRadius:'20px',fontSize:'12px',fontWeight:'600',cursor:'pointer',fontFamily:'inherit',flexShrink:0,marginTop:'4px'}}>
              Rejoindre
            </button>
          )}
        </div>
      ))}

      <div style={{marginTop:'24px'}}>
        <div style={{fontSize:'12px',color:'#888',marginBottom:'12px',textTransform:'uppercase',fontWeight:'600',letterSpacing:'.5px'}}>
          Jeux en commun (5)
        </div>
        <div style={{background:'#fff',borderRadius:'14px',padding:'14px',border:'1px solid #eee'}}>
          {[
            {name:'Red Dead Redemption 2',count:3},
            {name:'Counter-Strike 2',count:4},
            {name:'Valorant',count:2},
            {name:'FIFA 25',count:2},
            {name:'Elden Ring',count:3},
          ].map((g,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom: i<4?'1px solid #f5f5f5':'none'}}>
              <span style={{fontSize:'14px',color:'#111',fontWeight:'500'}}>{g.name}</span>
              <span style={{fontSize:'11px',color:'#888'}}>{g.count} potes</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderStatus = () => (
    <div style={{padding:'16px'}}>
      <div style={{background:'#fff',borderRadius:'14px',padding:'18px',border:'1px solid #eee',marginBottom:'12px'}}>
        <div style={{fontSize:'14px',fontWeight:'700',color:'#111',marginBottom:'14px'}}>Mon statut</div>
        
        <div style={{display:'flex',gap:'8px',marginBottom:'12px'}}>
          <button style={{flex:1,padding:'12px',borderRadius:'12px',background:'#27500A',color:'#fff',border:'none',fontSize:'13px',fontWeight:'600',cursor:'pointer',fontFamily:'inherit'}}>
            ▶ Je joue
          </button>
          <button style={{flex:1,padding:'12px',borderRadius:'12px',background:'#FFE8CC',color:'#B85C00',border:'none',fontSize:'13px',fontWeight:'600',cursor:'pointer',fontFamily:'inherit'}}>
            🔍 Je cherche
          </button>
          <button style={{flex:1,padding:'12px',borderRadius:'12px',background:'#f5f5f5',color:'#888',border:'none',fontSize:'13px',fontWeight:'500',cursor:'pointer',fontFamily:'inherit'}}>
            😴 Off
          </button>
        </div>

        <input
          type="text"
          placeholder="À quoi tu joues ?"
          style={{width:'100%',padding:'12px',borderRadius:'10px',border:'1px solid #eee',fontSize:'14px',fontFamily:'inherit',boxSizing:'border-box'}}
        />
      </div>

      <div style={{background:'#fff',borderRadius:'14px',padding:'18px',border:'1px solid #eee',marginBottom:'12px'}}>
        <div style={{fontSize:'12px',color:'#888',marginBottom:'12px',textTransform:'uppercase',fontWeight:'600',letterSpacing:'.5px'}}>
          Suggestions auto (Steam)
        </div>
        {DEMO_MY_GAMES.slice(0,3).map((game,i)=>(
          <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom: i<2?'1px solid #f5f5f5':'none'}}>
            <div>
              <div style={{fontSize:'14px',color:'#111',fontWeight:'600'}}>{game.name}</div>
              <div style={{fontSize:'11px',color:'#888'}}>{game.platform} · {game.hours}h jouées</div>
            </div>
            <button style={{background:'#111',color:'#fff',border:'none',padding:'6px 12px',borderRadius:'14px',fontSize:'11px',fontWeight:'600',cursor:'pointer',fontFamily:'inherit'}}>
              Lancer
            </button>
          </div>
        ))}
      </div>

      <div style={{background:'#FFFBEA',borderRadius:'14px',padding:'14px',border:'1px solid #FFE8A0'}}>
        <div style={{fontSize:'12px',color:'#7A5C00',fontWeight:'600',marginBottom:'4px'}}>
          ✨ Mode démo
        </div>
        <div style={{fontSize:'12px',color:'#7A5C00'}}>
          Tu visites WhoPlays en mode démo. Inscris-toi pour avoir tes vrais potes.
        </div>
      </div>
    </div>
  )

  const renderProfil = () => (
    <div style={{padding:'16px'}}>
      <div style={{background:'#fff',borderRadius:'14px',padding:'20px',border:'1px solid #eee',marginBottom:'12px',textAlign:'center'}}>
        <div style={{width:'72px',height:'72px',borderRadius:'50%',background:DEMO_PROFILE.avatar_color,color:DEMO_PROFILE.avatar_text,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'28px',fontWeight:'700',margin:'0 auto 12px'}}>
          {DEMO_PROFILE.avatar_initial}
        </div>
        <div style={{fontSize:'18px',fontWeight:'700',color:'#111',marginBottom:'2px'}}>{DEMO_PROFILE.name}</div>
        <div style={{fontSize:'12px',color:'#888'}}>📱 {DEMO_PROFILE.phone}</div>
        
        <div style={{display:'flex',gap:'5px',justifyContent:'center',flexWrap:'wrap',marginTop:'12px'}}>
          <span style={{fontSize:'10px',padding:'3px 10px',borderRadius:'10px',fontWeight:'600',background:'#EAF3DE',color:'#27500A'}}>
            🎯 Compétitif
          </span>
          <span style={{fontSize:'10px',padding:'3px 10px',borderRadius:'10px',fontWeight:'600',background:'#FFF3CC',color:'#7A5C00'}}>
            🌆 Soirs
          </span>
          <span style={{fontSize:'10px',padding:'3px 10px',borderRadius:'10px',fontWeight:'600',background:'#FFE0E0',color:'#A02020'}}>
            🔥 Quotidien
          </span>
        </div>
      </div>

      <div style={{background:'#fff',borderRadius:'14px',padding:'4px',border:'1px solid #eee',marginBottom:'12px'}}>
        <div style={{fontSize:'12px',color:'#888',padding:'10px 14px 4px',textTransform:'uppercase',fontWeight:'600',letterSpacing:'.5px'}}>
          Mes comptes
        </div>

        {[
          { key:'steam', label:'Steam', bg:'#1b2838', color:'#c7d5e0', value:'✓ '+DEMO_PROFILE.steam_id, connected:true },
          { key:'discord', label:'Discord', bg:'#5865F2', color:'#fff', value:'✓ '+DEMO_PROFILE.discord_username, connected:true },
          { key:'xbox', label:'Xbox', bg:'#107c10', color:'#fff', value:'✓ '+DEMO_PROFILE.xbox_tag, connected:true },
          { key:'psn', label:'PS', bg:'#003087', color:'#fff', value:'Non connecté', connected:false },
          { key:'epic', label:'Epic', bg:'#2d2d2d', color:'#fff', value:'Non connecté', connected:false },
        ].map(p=>(
          <div key={p.key} style={{display:'flex',alignItems:'center',padding:'10px 14px',borderTop:'1px solid #f5f5f5'}}>
            <div style={{width:'40px',height:'40px',borderRadius:'8px',background:p.bg,color:p.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:'700',flexShrink:0,marginRight:'12px'}}>
              {p.label==='Steam'?'S':p.label==='Discord'?'D':p.label==='Xbox'?'X':p.label==='PS'?'PS':'E'}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:'14px',fontWeight:'600',color:'#111'}}>{p.label}</div>
              <div style={{fontSize:'11px',color:p.connected?'#27500A':'#aaa'}}>{p.value}</div>
            </div>
            <button style={{fontSize:'11px',color:p.connected?'#888':'#fff',background:p.connected?'#f5f5f5':'#111',border:'none',padding:'6px 12px',borderRadius:'14px',fontWeight:'600',cursor:'pointer',fontFamily:'inherit'}}>
              {p.connected?'Modifier':'+ Ajouter'}
            </button>
          </div>
        ))}
      </div>

      <div style={{background:'#fff',borderRadius:'14px',padding:'4px',border:'1px solid #eee'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px 4px'}}>
          <div style={{fontSize:'12px',color:'#888',textTransform:'uppercase',fontWeight:'600',letterSpacing:'.5px'}}>
            Mes jeux ({DEMO_MY_GAMES.length})
          </div>
          <span style={{fontSize:'10px',color:'#27500A',background:'#EAF3DE',padding:'3px 8px',borderRadius:'10px',fontWeight:'600'}}>
            🎮 Steam
          </span>
        </div>

        {DEMO_MY_GAMES.map((game,i)=>(
          <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',borderTop:'1px solid #f5f5f5'}}>
            <div>
              <div style={{fontSize:'14px',color:'#111',fontWeight:'600'}}>{game.name}</div>
              <div style={{fontSize:'11px',color:'#888'}}>{game.platform} · {game.hours}h · {game.last_played}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderPage = () => {
    if (page==='feed') return renderFeed()
    if (page==='status') return renderStatus()
    if (page==='profil') return renderProfil()
  }

  const pageTitle = navItems.find(n=>n.key===page)?.label

  if (isDesktop) return (
    <div style={{display:'flex',minHeight:'100vh',background:'#f0efe8'}}>
      <div style={{position:'fixed',top:0,left:0,right:0,background:'#FFE8A0',color:'#7A5C00',padding:'8px',textAlign:'center',fontSize:'12px',fontWeight:'600',zIndex:100}}>
        ✨ Mode démo · <a href="/" style={{color:'#7A5C00',textDecoration:'underline'}}>S'inscrire pour de vrai</a>
      </div>

      <div style={{width:'240px',background:'#fff',borderRight:'1px solid #eee',padding:'52px 16px 28px',display:'flex',flexDirection:'column',gap:'4px',position:'sticky',top:0,height:'100vh',flexShrink:0,overflowY:'auto'}}>
        <div style={{fontSize:'20px',fontWeight:'700',color:'#111',letterSpacing:'-.5px',marginBottom:'24px',padding:'0 10px'}}>WhoPlays</div>

        {navItems.map(n=>(
          <button key={n.key} onClick={()=>setPage(n.key)}
            style={{display:'flex',alignItems:'center',gap:'12px',padding:'10px 14px',borderRadius:'12px',cursor:'pointer',fontSize:'14px',fontWeight:page===n.key?'600':'500',color:page===n.key?'#fff':'#888',background:page===n.key?'#111':'transparent',border:'none',fontFamily:'inherit',width:'100%',textAlign:'left'}}>
            {n.icon}
            {n.label}
          </button>
        ))}

        <div style={{marginTop:'auto',padding:'12px 14px',borderRadius:'12px',background:'#fafaf9',display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'36px',height:'36px',borderRadius:'50%',background:DEMO_PROFILE.avatar_color,color:DEMO_PROFILE.avatar_text,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:'700'}}>
            {DEMO_PROFILE.avatar_initial}
          </div>
          <div>
            <div style={{fontSize:'13px',fontWeight:'600',color:'#111'}}>Maxime</div>
            <div style={{fontSize:'11px',color:'#aaa'}}>Mode démo</div>
          </div>
        </div>
      </div>

      <div style={{flex:1,maxWidth:'680px',background:'#fff',borderRight:'1px solid #eee',height:'100vh',display:'flex',flexDirection:'column',marginTop:'32px'}}>
        <div style={{padding:'20px 24px 16px',borderBottom:'1px solid #f0f0f0',flexShrink:0}}>
          <div style={{fontSize:'18px',fontWeight:'700',color:'#111'}}>{pageTitle}</div>
        </div>
        <div style={{flex:1,overflowY:'auto'}}>
          {renderPage()}
        </div>
      </div>

      <div style={{flex:1,padding:'56px 20px 20px'}}>
        <div style={{fontSize:'13px',fontWeight:'700',color:'#111',marginBottom:'12px'}}>Démo interactive</div>
        <div style={{fontSize:'12px',color:'#888',lineHeight:'1.6'}}>
          Tu navigues dans WhoPlays avec 5 potes fictifs.<br/>
          Clique sur les onglets pour explorer.
        </div>
      </div>
    </div>
  )

  return (
    <div style={{width:'100%',background:'#fff',display:'flex',flexDirection:'column',height:'100vh',overflow:'hidden'}}>
      <div style={{background:'#FFE8A0',color:'#7A5C00',padding:'6px',textAlign:'center',fontSize:'11px',fontWeight:'600'}}>
        ✨ Mode démo · <a href="/" style={{color:'#7A5C00',textDecoration:'underline'}}>S'inscrire</a>
      </div>

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 18px 8px',flexShrink:0,borderBottom:'1px solid #f5f5f5'}}>
        <span style={{fontSize:'20px',fontWeight:'700',color:'#111',letterSpacing:'-.5px'}}>WhoPlays</span>
        <span style={{fontSize:'11px',color:'#27500A',background:'#EAF3DE',padding:'3px 10px',borderRadius:'20px',fontWeight:'600'}}>
          Maxime →
        </span>
      </div>

      <div style={{flex:1,overflowY:'auto'}}>
        {renderPage()}
      </div>

      <div style={{display:'flex',borderTop:'1px solid #eee',padding:'8px 0 34px',background:'#fff',flexShrink:0}}>
        {navItems.map(n=>(
          <div key={n.key} onClick={()=>setPage(n.key)}
            style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',fontSize:'10px',color:page===n.key?'#111':'#bbb',cursor:'pointer',fontWeight:page===n.key?'700':'500',padding:'4px 0'}}>
            {n.icon}
            <span>{n.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}