let cachedToken = null
let tokenExpiry = 0

async function getTwitchToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: 'POST' }
  )
  const data = await res.json()
  cachedToken = data.access_token
  tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000
  return cachedToken
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const { query } = req.query
  if (!query) return res.status(400).json({ games: [] })

  try {
    const token = await getTwitchToken()
    const response = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body: `search "${query}"; fields name,cover.url,genres.name,first_release_date; limit 6; where version_parent = null;`
    })
    const games = await response.json()
    return res.status(200).json({ games })
  } catch(e) {
    return res.status(500).json({ error: e.message, games: [] })
  }
}