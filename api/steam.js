export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  const { steamid, type, vanity } = req.query

  try {
    // Résoudre un pseudo Steam → SteamID
    if (vanity) {
      const response = await fetch(
        `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${process.env.STEAM_API_KEY}&vanityurl=${encodeURIComponent(vanity)}`
      )
      const data = await response.json()
      if (data.response?.success === 1) {
        return res.status(200).json({ steamid: data.response.steamid })
      }
      return res.status(200).json({ error: 'not_found' })
    }

    if (!steamid) return res.status(400).json({ error: 'steamid required' })

    if (type === 'recent') {
      const response = await fetch(
        `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=${process.env.STEAM_API_KEY}&steamid=${steamid}&count=10`
      )
      const data = await response.json()
      const games = (data.response?.games || []).map(g => ({
        name: g.name,
        hours_recent: Math.round(g.playtime_2weeks / 60 * 10) / 10,
        hours_total: Math.round(g.playtime_forever / 60),
        appid: g.appid,
        last_played: new Date().toISOString(),
        cover_url: `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/capsule_sm_120.jpg`
      }))
      return res.status(200).json({ games })
    }

    const response = await fetch(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${process.env.STEAM_API_KEY}&steamid=${steamid}&include_appinfo=true&include_played_free_games=true`
    )
    const data = await response.json()

    if (!data.response || !data.response.games) {
      return res.status(200).json({ error: 'private', games: [] })
    }

    const games = data.response.games
      .map(g => ({
        name: g.name,
        hours: Math.round(g.playtime_forever / 60),
        appid: g.appid,
        cover_url: `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/capsule_sm_120.jpg`
      }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 20)

    return res.status(200).json({ games })
  } catch(e) {
    return res.status(500).json({ error: e.message })
  }
}