import { supabase } from '../supabase'

export default function Login() {
  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#f0efe8',padding:'20px'}}>
      <div style={{width:'100%',maxWidth:'360px',background:'#fff',borderRadius:'24px',padding:'32px 24px',boxShadow:'0 4px 24px rgba(0,0,0,0.08)'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div style={{fontSize:'32px',fontWeight:'700',color:'#111',letterSpacing:'-1px',marginBottom:'8px'}}>GamerLink</div>
          <div style={{fontSize:'14px',color:'#888',lineHeight:'1.5'}}>Retrouve tes potes gamers et rejoins leurs sessions en temps réel</div>
        </div>

        <button onClick={handleGoogle}
          style={{width:'100%',padding:'14px',borderRadius:'12px',border:'1px solid #eee',background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',gap:'12px',cursor:'pointer',fontSize:'14px',fontWeight:'600',color:'#111',fontFamily:'inherit',marginBottom:'16px'}}>
          <svg width="20" height="20" viewBox="0 0 20 20">
            <path d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.79h5.39a4.6 4.6 0 01-2 3.02v2.5h3.24c1.9-1.75 3-4.33 3-7.31z" fill="#4285F4"/>
            <path d="M10 20c2.7 0 4.96-.89 6.62-2.42l-3.24-2.51c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H1.07v2.6A10 10 0 0010 20z" fill="#34A853"/>
            <path d="M4.41 11.91A6.03 6.03 0 014.1 10c0-.66.12-1.3.31-1.91V5.49H1.07A10 10 0 000 10c0 1.61.39 3.14 1.07 4.51l3.34-2.6z" fill="#FBBC05"/>
            <path d="M10 3.96c1.47 0 2.79.5 3.82 1.5l2.86-2.86C14.96.99 12.7 0 10 0A10 10 0 001.07 5.49l3.34 2.6C5.2 5.72 7.4 3.96 10 3.96z" fill="#EA4335"/>
          </svg>
          Continuer avec Google
        </button>

        <div style={{fontSize:'11px',color:'#bbb',textAlign:'center',lineHeight:'1.5'}}>
          En continuant tu acceptes que tes données de jeu soient utilisées pour connecter tes potes
        </div>
      </div>
    </div>
  )
}