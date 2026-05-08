import { useState } from 'react'
import { supabase } from '../supabase'

export default function Onboarding({ user, onComplete }) {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const avatarUrl = user.user_metadata?.avatar_url || null
  const fullName = user.user_metadata?.full_name || ''
  const initials = fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : '?'

  const handleSubmit = async () => {
    if (phone.length < 10) {
      setError('Entre un numéro valide')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      name: fullName,
      phone: phone.replace(/\s/g, ''),
      avatar_url: avatarUrl,
    }, { onConflict: 'id' })
    if (error) {
      setError('Erreur : ' + error.message)
      setLoading(false)
      return
    }
    onComplete()
  }

  const handleSkip = async () => {
    await supabase.from('profiles').upsert({
      id: user.id,
      name: fullName,
      avatar_url: avatarUrl,
    }, { onConflict: 'id' })
    onComplete()
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#f0efe8',padding:'20px'}}>
      <div style={{width:'100%',maxWidth:'360px',background:'#fff',borderRadius:'24px',padding:'32px 24px'}}>

        {/* Avatar Google */}
        <div style={{display:'flex',justifyContent:'center',marginBottom:'20px'}}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={fullName}
              style={{width:'64px',height:'64px',borderRadius:'50%',objectFit:'cover',border:'3px solid #EAF3DE'}}/>
          ) : (
            <div style={{width:'64px',height:'64px',borderRadius:'50%',background:'#EAF3DE',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',fontWeight:'700',color:'#27500A'}}>
              {initials}
            </div>
          )}
        </div>

        <div style={{marginBottom:'24px',textAlign:'center'}}>
          <div style={{fontSize:'22px',fontWeight:'700',color:'#111',marginBottom:'8px'}}>
            Salut {fullName.split(' ')[0]} 👋
          </div>
          <div style={{fontSize:'14px',color:'#888',lineHeight:'1.5'}}>
            Ton numéro permet à tes potes de te retrouver automatiquement quand ils s'inscrivent.
          </div>
        </div>

        <div style={{marginBottom:'8px',fontSize:'11px',fontWeight:'600',color:'#888'}}>
          Ton numéro de téléphone
        </div>
        <input
          type="tel"
          placeholder="06 12 34 56 78"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={{width:'100%',padding:'12px',border:'1px solid #eee',borderRadius:'12px',fontSize:'16px',color:'#111',fontFamily:'inherit',marginBottom:'8px',outline:'none',boxSizing:'border-box'}}
        />
        {error && <div style={{fontSize:'12px',color:'#e63946',marginBottom:'8px'}}>{error}</div>}

        <div style={{fontSize:'11px',color:'#bbb',marginBottom:'20px',lineHeight:'1.5'}}>
          Utilisé uniquement pour retrouver tes potes. Jamais partagé sans ton accord.
        </div>

        <button onClick={handleSubmit} disabled={loading}
          style={{width:'100%',padding:'13px',borderRadius:'12px',background:'#111',color:'#fff',border:'none',fontSize:'13px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit',opacity:loading?0.7:1}}>
          {loading ? 'Enregistrement...' : "C'est parti →"}
        </button>

        <button onClick={handleSkip}
          style={{width:'100%',padding:'10px',borderRadius:'12px',background:'transparent',color:'#bbb',border:'none',fontSize:'12px',cursor:'pointer',fontFamily:'inherit',marginTop:'8px'}}>
          Passer pour l'instant
        </button>
      </div>
    </div>
  )
}