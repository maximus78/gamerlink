const FRIENDS_PREVIEW = [
  {
    name: 'Marc',
    avatar_initial: 'M',
    avatar_color: '#FFE8CC',
    avatar_text: '#B85C00',
    activity: 'Joue à Red Dead Redemption 2',
    detail: '🎮 Steam · depuis 23 min',
  },
  {
    name: 'Sarah',
    avatar_initial: 'S',
    avatar_color: '#E8DAFF',
    avatar_text: '#5C2D91',
    activity: 'Cherche pour FIFA 25',
    detail: '🎮 PS5 · cherche 1 pote',
  },
  {
    name: 'Lucas',
    avatar_initial: 'L',
    avatar_color: '#CFE8FF',
    avatar_text: '#1F4D80',
    activity: 'Joue à Valorant',
    detail: '🎮 Steam · ranked',
  },
]

export default function DemoJoin() {
  return (
    <div style={{minHeight:'100vh',background:'#f0efe8',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div style={{maxWidth:'440px',width:'100%'}}>
        
        <div style={{background:'#FFE8A0',color:'#7A5C00',padding:'8px',textAlign:'center',fontSize:'11px',fontWeight:'600',borderRadius:'8px',marginBottom:'20px'}}>
          ✨ Mode démo · simulation de l'arrivée via lien d'invitation
        </div>

        <div style={{textAlign:'center',marginBottom:'24px'}}>
          <div style={{fontSize:'24px',fontWeight:'700',color:'#111',letterSpacing:'-.5px',marginBottom:'8px'}}>
            WhoPlays
          </div>
        </div>

        <div style={{background:'#fff',borderRadius:'20px',padding:'28px',border:'1px solid #eee',marginBottom:'16px'}}>
          
          <div style={{display:'flex',alignItems:'center',gap:'14px',marginBottom:'24px'}}>
            <div style={{width:'56px',height:'56px',borderRadius:'50%',background:'#EAF3DE',color:'#27500A',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',fontWeight:'700',flexShrink:0}}>
              M
            </div>
            <div>
              <div style={{fontSize:'13px',color:'#888'}}>🎮 Tu as été invité par</div>
              <div style={{fontSize:'18px',fontWeight:'700',color:'#111'}}>Maxime Vibert</div>
            </div>
          </div>

          <div style={{borderTop:'1px solid #f0f0f0',paddingTop:'20px',marginBottom:'20px'}}>
            <div style={{fontSize:'12px',color:'#888',marginBottom:'14px',textTransform:'uppercase',fontWeight:'600',letterSpacing:'.5px'}}>
              Tes potes déjà sur l'app
            </div>
            
            {FRIENDS_PREVIEW.map((friend, i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 0',borderBottom: i < FRIENDS_PREVIEW.length-1 ? '1px solid #f5f5f5' : 'none'}}>
                <div style={{width:'44px',height:'44px',borderRadius:'50%',background:friend.avatar_color,color:friend.avatar_text,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',fontWeight:'700',flexShrink:0,position:'relative'}}>
                  {friend.avatar_initial}
                  <div style={{position:'absolute',bottom:'-2px',right:'-2px',width:'12px',height:'12px',borderRadius:'50%',background:'#27500A',border:'2px solid #fff'}}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:'14px',fontWeight:'700',color:'#111',marginBottom:'2px'}}>{friend.name}</div>
                  <div style={{fontSize:'12px',color:'#666',marginBottom:'2px'}}>{friend.activity}</div>
                  <div style={{fontSize:'11px',color:'#888'}}>{friend.detail}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{background:'#fafaf9',borderRadius:'10px',padding:'12px 14px',marginBottom:'20px'}}>
            <div style={{fontSize:'12px',color:'#666',lineHeight:'1.5'}}>
              💡 Tu vois en temps réel à quoi joue Maxime et tes autres potes,<br/>
              peu importe leur plateforme.
            </div>
          </div>

          <button style={{width:'100%',padding:'14px',background:'#111',color:'#fff',border:'none',borderRadius:'12px',fontSize:'14px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}>
            <svg width="20" height="20" viewBox="0 0 20 20"><path fill="#fff" d="M19.6 10.23c0-.7-.06-1.37-.18-2.02H10v3.81h5.4c-.23 1.25-.95 2.31-2.03 3.02v2.51h3.28c1.92-1.77 3.03-4.38 3.03-7.32z M10 20c2.74 0 5.04-.91 6.72-2.45l-3.28-2.51c-.91.61-2.07.97-3.44.97-2.65 0-4.89-1.79-5.69-4.18H.91v2.59C2.58 17.74 6.04 20 10 20z M4.31 11.83c-.2-.61-.32-1.27-.32-1.93s.12-1.32.32-1.93V5.38H.91A9.99 9.99 0 0 0 0 9.9c0 1.62.39 3.15 1.08 4.52l3.23-2.59z M10 3.96c1.49 0 2.83.51 3.88 1.52l2.91-2.91C15.04.96 12.74 0 10 0 6.04 0 2.58 2.26.91 5.38l3.4 2.59C5.11 5.75 7.35 3.96 10 3.96z"/></svg>
            Continuer avec Google
          </button>
        </div>

        <div style={{textAlign:'center',fontSize:'12px',color:'#888'}}>
          Inscription gratuite · 30 secondes
        </div>

      </div>
    </div>
  )
}