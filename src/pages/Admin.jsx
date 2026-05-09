import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const ADMIN_USER_ID = 'fb230653-43fa-4495-a6ce-d5b2e04b1b35'

export default function Admin({ user }) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [demoEnabled, setDemoEnabled] = useState(false)
  const [demoToggling, setDemoToggling] = useState(false)

  const authorized = user?.id === ADMIN_USER_ID

  useEffect(() => {
    if (authorized) {
      loadStats()
      loadDemoStatus()
    }
    else setLoading(false)
  }, [authorized])

  async function loadDemoStatus() {
    const { data } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'demo_enabled')
      .single()
    setDemoEnabled(data?.value === true || data?.value === 'true')
  }

  async function toggleDemo() {
    setDemoToggling(true)
    const newValue = !demoEnabled
    const { error } = await supabase
      .from('app_settings')
      .upsert({ key: 'demo_enabled', value: newValue, updated_at: new Date().toISOString() })
    
    if (error) {
      alert('Erreur : ' + error.message)
    } else {
      setDemoEnabled(newValue)
    }
    setDemoToggling(false)
  }

  async function loadStats() {
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    const { count: completedProfiles } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .not('phone', 'is', null)

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const { count: thisWeek } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneWeekAgo.toISOString())

    const { data: activeData } = await supabase
      .from('status_history')
      .select('user_id')
    const activeUserIds = new Set(activeData?.map(s => s.user_id) || [])
    const activeUsers = activeUserIds.size

    const { count: totalBroadcasts } = await supabase
      .from('status_history')
      .select('*', { count: 'exact', head: true })

    const { count: broadcastsThisWeek } = await supabase
      .from('status_history')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneWeekAgo.toISOString())

    const { data: gamesData } = await supabase
      .from('status_history')
      .select('game')
    const gameCounts = {}
    gamesData?.forEach(s => {
      if (s.game) gameCounts[s.game] = (gameCounts[s.game] || 0) + 1
    })
    const topGames = Object.entries(gameCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)

    const { data: platformData } = await supabase
      .from('profiles')
      .select('steam_id, discord_id, psn_tag, xbox_tag, epic_tag')
    const platforms = {
      steam: platformData?.filter(p => p.steam_id).length || 0,
      discord: platformData?.filter(p => p.discord_id).length || 0,
      psn: platformData?.filter(p => p.psn_tag).length || 0,
      xbox: platformData?.filter(p => p.xbox_tag).length || 0,
      epic: platformData?.filter(p => p.epic_tag).length || 0,
    }

    const { count: invitationsSent } = await supabase
      .from('invitations')
      .select('*', { count: 'exact', head: true })

    const { count: invitationsCompleted } = await supabase
      .from('invitations')
      .select('*', { count: 'exact', head: true })
      .eq('completed', true)

    const { data: recentUsers } = await supabase
      .from('profiles')
      .select('id, name, phone, avatar_url, created_at, steam_id, discord_id')
      .order('created_at', { ascending: false })
      .limit(10)

    const { count: groupMessages } = await supabase
      .from('group_messages')
      .select('*', { count: 'exact', head: true })

    setStats({
      totalUsers: totalUsers || 0,
      completedProfiles: completedProfiles || 0,
      thisWeek: thisWeek || 0,
      activeUsers,
      totalBroadcasts: totalBroadcasts || 0,
      broadcastsThisWeek: broadcastsThisWeek || 0,
      topGames,
      platforms,
      invitationsSent: invitationsSent || 0,
      invitationsCompleted: invitationsCompleted || 0,
      recentUsers: recentUsers || [],
      groupMessages: groupMessages || 0,
    })
    setLoading(false)
  }

  if (!authorized) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>🔒 Accès refusé</h2>
        <p style={{ color: '#888' }}>Cette page est réservée à l'admin.</p>
      </div>
    )
  }

  if (loading || !stats) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Chargement...</div>
  }

  const conversionRate = stats.totalUsers > 0
    ? Math.round((stats.completedProfiles / stats.totalUsers) * 100) : 0
  const activationRate = stats.totalUsers > 0
    ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0

  const card = {
    background: '#fff',
    border: '1px solid #eee',
    borderRadius: 12,
    padding: 20,
  }
  const bigNumber = { fontSize: 32, fontWeight: 700, color: '#111', margin: '8px 0 4px' }
  const label = { fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }
  const sublabel = { fontSize: 12, color: '#aaa', marginTop: 4 }

  return (
    <div style={{ padding: '20px 18px 100px', background: '#f0efe8', minHeight: '100%' }}>
      <h1 style={{ fontSize: 22, marginBottom: 4, color: '#111' }}>📊 Dashboard</h1>
      <p style={{ color: '#888', marginBottom: 20, fontSize: 12 }}>
        Mis à jour : {new Date().toLocaleString('fr-FR')}
      </p>

      {/* 🎮 Toggle Mode Démo */}
      <div style={{ ...card, marginBottom: 20, background: demoEnabled ? '#FFFBEA' : '#fff', borderColor: demoEnabled ? '#FFE8A0' : '#eee' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 4 }}>
              🎮 Mode démo {demoEnabled ? <span style={{color:'#27500A'}}>· ACTIVÉ</span> : <span style={{color:'#888'}}>· désactivé</span>}
            </div>
            <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>
              {demoEnabled 
                ? 'Le bouton "Voir la démo" est visible sur Login. Les URLs /demo et /demo/join sont accessibles.'
                : 'La démo est cachée. Active-la quand tu lances ta vidéo pour que les visiteurs puissent tester.'}
            </div>
            {demoEnabled && (
              <div style={{ marginTop: 8, fontSize: 11, color: '#7A5C00' }}>
                URLs actives : <code style={{background:'#fff',padding:'2px 6px',borderRadius:4}}>/demo</code> · <code style={{background:'#fff',padding:'2px 6px',borderRadius:4}}>/demo/join</code>
              </div>
            )}
          </div>
          <button
            onClick={toggleDemo}
            disabled={demoToggling}
            style={{
              background: demoEnabled ? '#27500A' : '#111',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: demoToggling ? 'wait' : 'pointer',
              fontFamily: 'inherit',
              minWidth: 100,
              opacity: demoToggling ? 0.6 : 1,
            }}>
            {demoToggling ? '...' : (demoEnabled ? '✓ ACTIVÉ' : 'Activer')}
          </button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12,
        marginBottom: 20,
      }}>
        <div style={card}>
          <div style={label}>Total inscrits</div>
          <div style={bigNumber}>{stats.totalUsers}</div>
          <div style={sublabel}>+{stats.thisWeek} cette semaine</div>
        </div>
        <div style={card}>
          <div style={label}>Profils complets</div>
          <div style={bigNumber}>{stats.completedProfiles}</div>
          <div style={sublabel}>{conversionRate}% onboarding</div>
        </div>
        <div style={card}>
          <div style={label}>Actifs (broadcast)</div>
          <div style={bigNumber}>{stats.activeUsers}</div>
          <div style={sublabel}>{activationRate}% activation</div>
        </div>
        <div style={card}>
          <div style={label}>Total broadcasts</div>
          <div style={bigNumber}>{stats.totalBroadcasts}</div>
          <div style={sublabel}>+{stats.broadcastsThisWeek} cette semaine</div>
        </div>
        <div style={card}>
          <div style={label}>Invitations</div>
          <div style={bigNumber}>{stats.invitationsSent}</div>
          <div style={sublabel}>
            {stats.invitationsCompleted} complétées
          </div>
        </div>
        <div style={card}>
          <div style={label}>Messages chat</div>
          <div style={bigNumber}>{stats.groupMessages}</div>
          <div style={sublabel}>Total cumulé</div>
        </div>
      </div>

      <div style={{ ...card, marginBottom: 20 }}>
        <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 14, color: '#111' }}>🎮 Top jeux</h3>
        {stats.topGames.length === 0 ? (
          <p style={{ color: '#aaa', fontSize: 13 }}>Aucun broadcast pour le moment</p>
        ) : (
          stats.topGames.map(([game, count], i) => (
            <div key={game} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0',
              fontSize: 13,
              borderBottom: i < stats.topGames.length - 1 ? '1px solid #f5f5f5' : 'none',
            }}>
              <span style={{ color: '#111' }}>
                <span style={{ color: '#bbb', marginRight: 8 }}>#{i + 1}</span>
                {game}
              </span>
              <span style={{ color: '#888' }}>{count}</span>
            </div>
          ))
        )}
      </div>

      <div style={{ ...card, marginBottom: 20 }}>
        <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 14, color: '#111' }}>🔗 Plateformes</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
          gap: 8,
        }}>
          {Object.entries(stats.platforms).map(([name, count]) => (
            <div key={name} style={{
              background: '#fafaf9',
              padding: 10,
              borderRadius: 8,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#111' }}>{count}</div>
              <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>
                {name}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 14, color: '#111' }}>👥 Derniers inscrits</h3>
        {stats.recentUsers.length === 0 ? (
          <p style={{ color: '#aaa', fontSize: 13 }}>Aucun inscrit</p>
        ) : (
          stats.recentUsers.map((u, i) => (
            <div key={u.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 0',
              borderBottom: i < stats.recentUsers.length - 1 ? '1px solid #f5f5f5' : 'none',
            }}>
              {u.avatar_url ? (
                <img src={u.avatar_url} alt={u.name}
                  style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: '#EAF3DE', color: '#27500A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700,
                }}>
                  {u.name?.charAt(0) || '?'}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#111' }}>{u.name || 'Sans nom'}</div>
                <div style={{ fontSize: 11, color: '#888' }}>
                  {u.phone || 'Pas de tél'}
                  {u.steam_id ? ' · Steam ✓' : ''}
                  {u.discord_id ? ' · Discord ✓' : ''}
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#bbb' }}>
                {u.created_at ? new Date(u.created_at).toLocaleDateString('fr-FR') : '—'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}