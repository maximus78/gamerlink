import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Feed from './pages/Feed'
import Status from './pages/Status'
import Session from './pages/Session'
import Decouvrir from './pages/Decouvrir'
import Recherche from './pages/Recherche'
import Invitation from './pages/Invitation'
import './App.css'

export default function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState('feed')
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768)

  const isInvitation = new URLSearchParams(window.location.search).get('token')

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (isInvitation) { setLoading(false); return }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setLoading(false)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })
  }, [])

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data)
    setLoading(false)
  }

  if (isInvitation) return <Invitation />

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f0efe8'}}>
      <div style={{fontSize:'24px',fontWeight:'700',color:'#111'}}>GamerLink</div>
    </div>
  )

  if (!session) return <Login />

  if (!profile) return (
    <Onboarding user={session.user} onComplete={() => fetchProfile(session.user.id)} />
  )

  const navItems = [
    { key:'feed', label:'Qui joue', icon:<svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="7" r="3.5" fill="currentColor" opacity=".8"/><ellipse cx="9" cy="14.5" rx="6" ry="3" fill="currentColor" opacity=".5"/></svg> },
    { key:'status', label:'Mon statut', icon:<svg width="18" height="18" viewBox="0 0 18 18"><polygon points="4,3 14,9 4,15" fill="currentColor" opacity=".8"/></svg> },
    { key:'session', label:'Session', icon:<svg width="18" height="18" viewBox="0 0 18 18"><rect x="3" y="4" width="12" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".8"/></svg> },
    { key:'dec', label:'Découvrir', icon:<svg width="18" height="18" viewBox="0 0 18 18"><path d="M9 2C9 2 14 6 14 10C14 13 11.5 15.5 9 15.5C6.5 15.5 4 13 4 10C4 6 9 2 9 2Z" fill="currentColor" opacity=".8"/></svg> },
    { key:'recherche', label:'Rechercher', icon:<svg width="18" height="18" viewBox="0 0 18 18"><circle cx="7.5" cy="7.5" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".8"/><line x1="11" y1="11" x2="15" y2="15" stroke="currentColor" strokeWidth="1.5" opacity=".8"/></svg> },
  ]

  const renderPage = () => {
    if (page === 'feed') return <Feed user={session.user} profile={profile} />
    if (page === 'status') return <Status user={session.user} profile={profile} />
    if (page === 'session') return <Session user={session.user} profile={profile} />
    if (page === 'dec') return <Decouvrir />
    if (page === 'recherche') return <Recherche user={session.user} />
  }

  if (isDesktop) return (
    <div style={{display:'flex',minHeight:'100vh',background:'#f0efe8'}}>
      <div style={{width:'240px',background:'#fff',borderRight:'1px solid #eee',padding:'28px 16px',display:'flex',flexDirection:'column',gap:'4px',position:'sticky',top:0,height:'100vh',flexShrink:0}}>
        <div style={{fontSize:'20px',fontWeight:'700',color:'#111',letterSpacing:'-.5px',marginBottom:'24px',padding:'0 10px'}}>GamerLink</div>
        {navItems.map(n => (
          <button key={n.key} onClick={() => setPage(n.key)}
            style={{display:'flex',alignItems:'center',gap:'12px',padding:'10px 14px',borderRadius:'12px',cursor:'pointer',fontSize:'14px',fontWeight: page===n.key ? '600' : '500',color: page===n.key ? '#fff' : '#888',background: page===n.key ? '#111' : 'transparent',border:'none',fontFamily:'inherit',width:'100%',textAlign:'left',transition:'background .15s'}}>
            {n.icon}
            {n.label}
          </button>
        ))}
        <div style={{marginTop:'auto',padding:'12px 14px',borderRadius:'12px',background:'#fafaf9',display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'#EAF3DE',color:'#27500A',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:'700',flexShrink:0}}>
            {profile?.name?.charAt(0) || 'T'}
          </div>
          <div>
            <div style={{fontSize:'13px',fontWeight:'600',color:'#111'}}>{profile?.name?.split(' ')[0]}</div>
            <div style={{fontSize:'11px',color:'#aaa'}}>En ligne</div>
          </div>
        </div>
      </div>

      <div style={{flex:1,maxWidth:'680px',background:'#fff',borderRight:'1px solid #eee',minHeight:'100vh'}}>
        <div style={{padding:'20px 24px 16px',borderBottom:'1px solid #f0f0f0'}}>
          <div style={{fontSize:'18px',fontWeight:'700',color:'#111'}}>
            {navItems.find(n => n.key === page)?.label}
          </div>
        </div>
        <div style={{overflowY:'auto'}}>
          {renderPage()}
        </div>
      </div>

      <div style={{flex:1,padding:'24px 20px'}}>
        <div style={{fontSize:'13px',fontWeight:'700',color:'#111',marginBottom:'12px'}}>Tendances</div>
        <div style={{fontSize:'12px',color:'#aaa',lineHeight:'1.6'}}>
          Les jeux en hype cette semaine apparaîtront ici.
        </div>
      </div>
    </div>
  )

  return (
    <div style={{width:'100%',background:'#fff',display:'flex',flexDirection:'column',minHeight:'100vh'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 18px 8px',flexShrink:0}}>
        <span style={{fontSize:'20px',fontWeight:'700',color:'#111',letterSpacing:'-.5px'}}>GamerLink</span>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <div onClick={() => setPage('recherche')}
            style={{width:'32px',height:'32px',borderRadius:'50%',background:page==='recherche'?'#111':'#f0f0f0',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
            <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="6.5" cy="6.5" r="4.5" fill="none" stroke={page==='recherche'?'#fff':'#888'} strokeWidth="1.5"/><line x1="10" y1="10" x2="14" y2="14" stroke={page==='recherche'?'#fff':'#888'} strokeWidth="1.5"/></svg>
          </div>
          <span style={{fontSize:'11px',color:'#27500A',background:'#EAF3DE',padding:'3px 10px',borderRadius:'20px',fontWeight:'600'}}>
            {profile.name?.split(' ')[0] || 'Toi'}
          </span>
        </div>
      </div>

      <div style={{display:'flex',borderBottom:'1px solid #f0f0f0',flexShrink:0}}>
        {navItems.slice(0,4).map(n => (
          <button key={n.key} onClick={() => setPage(n.key)}
            style={{flex:1,padding:'9px 2px',fontSize:'10px',fontWeight:'600',color:page===n.key?'#111':'#bbb',cursor:'pointer',background:'none',border:'none',fontFamily:'inherit',borderBottom:`2px solid ${page===n.key?'#111':'transparent'}`,textAlign:'center'}}>
            {n.label}
          </button>
        ))}
      </div>

      <div style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch'}}>
        {renderPage()}
      </div>

      {page !== 'recherche' && (
        <div style={{display:'flex',borderTop:'1px solid #eee',padding:'8px 0 20px',background:'#fff',flexShrink:0}}>
          {navItems.slice(0,4).map(n => (
            <div key={n.key} onClick={() => setPage(n.key)}
              style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',fontSize:'10px',color:page===n.key?'#111':'#bbb',cursor:'pointer',fontWeight:'500'}}>
              {n.icon}
              <span>{n.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}