import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Feed from './pages/Feed'
import Status from './pages/Status'
import Profil from './pages/Profil'
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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
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

  const renderPage = () => {
    if (page === 'feed') return <Feed user={session.user} profile={profile} onNavigate={setPage} />
    if (page === 'status') return <Status user={session.user} profile={profile} />
    if (page === 'profil') return <Profil user={session.user} profile={profile} onProfileUpdate={() => fetchProfile(session.user.id)} onSignOut={handleSignOut} />
  }

  // DESKTOP
  if (isDesktop) return (
    <div style={{display:'flex',minHeight:'100vh',background:'#f0efe8'}}>
      {/* Sidebar */}
      <div style={{width:'240px',background:'#fff',borderRight:'1px solid #eee',padding:'28px 16px',display:'flex',flexDirection:'column',gap:'4px',position:'sticky',top:0,height:'100vh',flexShrink:0,overflowY:'auto'}}>
        <div style={{fontSize:'20px',fontWeight:'700',color:'#111',letterSpacing:'-.5px',marginBottom:'24px',padding:'0 10px'}}>GamerLink</div>

        {navItems.map(n => (
          <button key={n.key} onClick={() => setPage(n.key)}
            style={{display:'flex',alignItems:'center',gap:'12px',padding:'10px 14px',borderRadius:'12px',cursor:'pointer',fontSize:'14px',fontWeight:page===n.key?'600':'500',color:page===n.key?'#fff':'#888',background:page===n.key?'#111':'transparent',border:'none',fontFamily:'inherit',width:'100%',textAlign:'left'}}>
            {n.icon}
            {n.label}
          </button>
        ))}

        <div style={{height:'1px',background:'#eee',margin:'8px 0'}}></div>

        <button onClick={handleSignOut}
          style={{display:'flex',alignItems:'center',gap:'12px',padding:'10px 14px',borderRadius:'12px',cursor:'pointer',fontSize:'14px',fontWeight:'500',color:'#e63946',background:'transparent',border:'none',fontFamily:'inherit',width:'100%',textAlign:'left'}}>
          <svg width="18" height="18" viewBox="0 0 18 18"><path d="M7 3H4a1 1 0 00-1 1v10a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/><polyline points="12,6 15,9 12,12" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/><line x1="15" y1="9" x2="7" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          Se déconnecter
        </button>

        <div style={{marginTop:'auto',padding:'12px 14px',borderRadius:'12px',background:'#fafaf9',display:'flex',alignItems:'center',gap:'10px',cursor:'pointer'}}
          onClick={() => setPage('profil')}>
          <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'#EAF3DE',color:'#27500A',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:'700',flexShrink:0}}>
            {profile?.name?.charAt(0) || 'T'}
          </div>
          <div>
            <div style={{fontSize:'13px',fontWeight:'600',color:'#111'}}>{profile?.name?.split(' ')[0]}</div>
            <div style={{fontSize:'11px',color:'#aaa'}}>Mon profil →</div>
          </div>
        </div>
      </div>

      {/* Colonne centrale */}
      <div style={{flex:1,maxWidth:'680px',background:'#fff',borderRight:'1px solid #eee',height:'100vh',display:'flex',flexDirection:'column'}}>
        <div style={{padding:'20px 24px 16px',borderBottom:'1px solid #f0f0f0',flexShrink:0}}>
          <div style={{fontSize:'18px',fontWeight:'700',color:'#111'}}>
            {navItems.find(n => n.key === page)?.label}
          </div>
        </div>
        <div style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch'}}>
          {renderPage()}
        </div>
      </div>

      {/* Colonne droite */}
      <div style={{flex:1,padding:'24px 20px'}}>
        <div style={{fontSize:'13px',fontWeight:'700',color:'#111',marginBottom:'12px'}}>Jeux en commun</div>
        <div style={{fontSize:'12px',color:'#aaa',lineHeight:'1.6'}}>
          Les jeux que toi et tes potes avez en commun apparaîtront ici.
        </div>
      </div>
    </div>
  )

  // MOBILE
  return (
    <div style={{width:'100%',background:'#fff',display:'flex',flexDirection:'column',height:'100vh',overflow:'hidden'}}>

      {/* Header mobile */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 18px 8px',flexShrink:0,borderBottom:'1px solid #f5f5f5'}}>
        <span style={{fontSize:'20px',fontWeight:'700',color:'#111',letterSpacing:'-.5px'}}>GamerLink</span>
        <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
          <span style={{fontSize:'11px',color:'#27500A',background:'#EAF3DE',padding:'3px 10px',borderRadius:'20px',fontWeight:'600',cursor:'pointer'}}
            onClick={() => setPage('profil')}>
            {profile.name?.split(' ')[0] || 'Toi'} →
          </span>
          <button onClick={handleSignOut}
            style={{fontSize:'11px',color:'#888',background:'#f5f5f5',border:'none',padding:'3px 8px',borderRadius:'20px',cursor:'pointer',fontFamily:'inherit',fontWeight:'600'}}>
            ↪
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch'}}>
        {renderPage()}
      </div>

      {/* Tab bar mobile */}
      <div style={{display:'flex',borderTop:'1px solid #eee',padding:'8px 0 34px',background:'#fff',flexShrink:0}}>
        {navItems.map(n => (
          <div key={n.key} onClick={() => setPage(n.key)}
            style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',fontSize:'10px',color:page===n.key?'#111':'#bbb',cursor:'pointer',fontWeight:page===n.key?'700':'500',padding:'4px 0'}}>
            {n.icon}
            <span>{n.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}