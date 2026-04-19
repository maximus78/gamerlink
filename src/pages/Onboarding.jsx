import { useState } from 'react'
import { supabase } from '../supabase'

export default function Onboarding({ user, onComplete }) {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (phone.length < 10) {
      setError('Entre un numéro valide')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      name: user.user_metadata.full_name,
      phone: phone.replace(/\s/g, ''),
    }, { onConflict: 'id' })
    if (error) {
      setError('Erreur : ' + error.message)
      setLoading(false)
      return
    }
    onComplete()
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#f0efe8',padding:'20px'}}>
      <div style={{width:'100%',maxWidth:'360px',background:'#fff',borderRadius:'24px',padding:'32px 24px'}}>
        <div style={{marginBottom:'24px'}}>
          <div style={{fontSize:'22px',fontWeight:'700',color:'#111',marginBottom:'8px'}}>
            Dernière étape 👋
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
          style={{width:'100%',padding:'12px',border:'1px solid #eee',borderRadius:'12px',fontSize:'16px',color:'#111',fontFamily:'inherit',marginBottom:'8px',outline:'none'}}
        />
        {error && <div style={{fontSize:'12px',color:'#e63946',marginBottom:'8px'}}>{error}</div>}

        <div style={{fontSize:'11px',color:'#bbb',marginBottom:'20px',lineHeight:'1.5'}}>
          Utilisé uniquement pour retrouver tes potes. Jamais partagé sans ton accord.
        </div>

        <button onClick={handleSubmit} disabled={loading}
          style={{width:'100%',padding:'13px',borderRadius:'12px',background:'#111',color:'#fff',border:'none',fontSize:'13px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit',opacity: loading ? 0.7 : 1}}>
          {loading ? 'Enregistrement...' : "C'est parti →"}
        </button>

        <button onClick={onComplete}
          style={{width:'100%',padding:'10px',borderRadius:'12px',background:'transparent',color:'#bbb',border:'none',fontSize:'12px',cursor:'pointer',fontFamily:'inherit',marginTop:'8px'}}>
          Passer pour l'instant
        </button>
      </div>
    </div>
  )
}