import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Feed({ user }) {
  const [statuses, setStatuses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatuses()
    const channel = supabase
      .channel('statuses')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'statuses'
      }, () => fetchStatuses())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const fetchStatuses = async () => {
    const { data } = await supabase
      .from('statuses')
      .select('*, profiles(name, phone)')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
    setStatuses(data || [])
    setLoading(false)
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getColor = (name) => {
    const colors = ['#C0DD97','#CECBF6','#FAC775','#B5D4F4','#F5C4B3','#9FE1CB']
    const index = name ? name.charCodeAt(0) % colors.length : 0
    return colors[index]
  }

  const getTextColor = (name) => {
    const colors = ['#27500A','#3C3489','#633806','#0C447C','#712B13','#085041']
    const index = name ? name.charCodeAt(0) % colors.length : 0
    return colors[index]
  }

  const getPill = (type) => {
    if (type === 'game') return { label: 'En game', bg: '#EAF3DE', color: '#27500A' }
    if (type === 'hot') return { label: 'Chaud', bg: '#FCEBEB', color: '#A32D2D' }
    return { label: 'Dispo', bg: '#E6F1FB', color: '#185FA5' }
  }

  const getDot = (type) => {
    if (type === 'game') return '#639922'
    if (type === 'hot') return '#E24B4A'
    return '#378ADD'
  }

  if (loading) return (
    <div style={{padding:'40px 16px',textAlign:'center',color:'#bbb',fontSize:'13px'}}>
      Chargement...
    </div>
  )

  return (
    <div>
      {statuses.length === 0 ? (
        <div style={{padding:'40px 16px',textAlign:'center'}}>
          <div style={{fontSize:'32px',marginBottom:'12px'}}>🎮</div>
          <div style={{fontSize:'14px',fontWeight:'600',color:'#111',marginBottom:'8px'}}>Personne n'est en ligne</div>
          <div style={{fontSize:'12px',color:'#aaa',lineHeight:'1.5'}}>Mets ton statut pour que tes potes te voient, ou invite-les à rejoindre GamerLink.</div>
        </div>
      ) : (
        <>
          <div style={{padding:'10px 16px 6px',fontSize:'11px',color:'#aaa',fontWeight:'500'}}>
            {statuses.length} joueur{statuses.length > 1 ? 's' : ''} actif{statuses.length > 1 ? 's' : ''} en ce moment
          </div>
          {statuses.map(s => {
            const name = s.profiles?.name || 'Joueur'
            const pill = getPill(s.type)
            const isMe = s.user_id === user?.id
            return (
              <div key={s.id} className="frow">
                <div className="av-wrap">
                  <div className="av" style={{background: getColor(name), color: getTextColor(name)}}>
                    {getInitials(name)}
                  </div>
                  <span className="fdot" style={{background: getDot(s.type)}}></span>
                </div>
                <div className="fi">
                  <div className="fn">{name} {isMe ? '(toi)' : ''}</div>
                  <div className="game-row">
                    <div className="game-logo-sm" style={{background:'#1a1a2e'}}>
                      <svg width="13" height="13" viewBox="0 0 13 13"><rect x="1" y="5.5" width="11" height="2" fill="#e63946" rx="1"/><rect x="5.5" y="1" width="2" height="11" fill="#e63946" rx="1"/></svg>
                    </div>
                    <span className="game-row-txt">{s.game}</span>
                  </div>
                </div>
                <span className="pill" style={{background: pill.bg, color: pill.color}}>{pill.label}</span>
              </div>
            )
          })}
        </>
      )}

      <div style={{margin:'16px 16px 0',border:'1px dashed #ddd',borderRadius:'14px',overflow:'hidden'}}>
        <div style={{background:'#fafaf9',padding:'10px 12px',fontSize:'11px',color:'#888',fontWeight:'600'}}>
          Inviter des potes
        </div>
        <div style={{padding:'10px 12px',fontSize:'12px',color:'#aaa',lineHeight:'1.5'}}>
          Partage ce lien à tes potes pour qu'ils rejoignent GamerLink et apparaissent dans ton feed.
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href)
            alert('Lien copié !')
          }}
          style={{margin:'0 12px 12px',padding:'8px 16px',borderRadius:'10px',border:'1px solid #eee',background:'#fff',fontSize:'12px',fontWeight:'600',color:'#111',cursor:'pointer',fontFamily:'inherit'}}>
          Copier le lien d'invitation
        </button>
      </div>
      <div style={{height:'14px'}}></div>
    </div>
  )
}