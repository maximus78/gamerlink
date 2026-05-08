export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  const { steamid } = req.query
  if (!steamid) return res.status(400).json({ error: 'steamid required' })

  try {
    // API officielle Steam — jeux possédés
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
        appid: g.appid
      }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 20)

    return res.status(200).json({ games })
  } catch(e) {
    return res.status(500).json({ error: e.message })
  }
}