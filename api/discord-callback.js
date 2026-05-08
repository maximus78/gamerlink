import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://phuucjawhdpentsyiwta.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBodXVjamF3aGRwZW50c3lpd3RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1ODYzODIsImV4cCI6MjA5MjE2MjM4Mn0.8NY4Zco0uiA7mDz_Q5Ef-gd2x9Y4YA-lgEuPpULtFyA'
)

export default async function handler(req, res) {
  const { code, state } = req.query
  if (!code) return res.redirect('https://gamerlink-psi.vercel.app?discord_error=1')

  try {
    // 1. Échanger le code contre un token
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: 'https://gamerlink-psi.vercel.app/api/discord-callback',
      })
    })
    const tokenData = await tokenRes.json()
    if (!tokenData.access_token) return res.redirect('https://gamerlink-psi.vercel.app?discord_error=1')

    // 2. Récupérer le profil Discord
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    })
    const discordUser = await userRes.json()

    // 3. Récupérer les amis Discord (nécessite relationships.read)
    const friendsRes = await fetch('https://discord.com/api/users/@me/relationships', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    })
    const friendsData = await friendsRes.json()
    const friendIds = Array.isArray(friendsData)
      ? friendsData.filter(f => f.type === 1).map(f => f.id)
      : []

    // Rediriger vers l'app avec les données
    const params = new URLSearchParams({
      discord_id: discordUser.id,
      discord_username: discordUser.username,
      discord_friends: friendIds.join(','),
    })
    res.redirect(`https://gamerlink-psi.vercel.app?${params}`)

  } catch(e) {
    res.redirect('https://gamerlink-psi.vercel.app?discord_error=1')
  }
}