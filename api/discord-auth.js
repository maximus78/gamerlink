export default function handler(req, res) {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: 'https://gamerlink-psi.vercel.app/api/discord-callback',
    response_type: 'code',
    scope: 'identify guilds.members.read relationships.read',
  })
  res.redirect(`https://discord.com/api/oauth2/authorize?${params}`)
}