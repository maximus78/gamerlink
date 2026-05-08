export default async function handler(req, res) {
  const { code } = req.query
  if (!code) return res.redirect('https://gamerlink-psi.vercel.app?discord_error=1')

  try {
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

    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    })
    const discordUser = await userRes.json()

    const params = new URLSearchParams({
      discord_id: discordUser.id,
      discord_username: discordUser.username,
      discord_friends: '',
    })
    res.redirect(`https://gamerlink-psi.vercel.app?${params}`)

  } catch(e) {
    res.redirect('https://gamerlink-psi.vercel.app?discord_error=1')
  }
}