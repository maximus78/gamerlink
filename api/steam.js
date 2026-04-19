export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  const { steamid } = req.query
  if (!steamid) return res.status(400).json({ error: 'steamid required' })

  try {
    const response = await fetch(
      `https://steamcommunity.com/profiles/${steamid}/games/?tab=all&xml=1`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    )
    const text = await response.text()

    if (text.includes('This profile is private') || text.includes('privacyMessage')) {
      return res.status(200).json({ error: 'private', games: [] })
    }

    const games = []
    const gameBlockRegex = /<game>([\s\S]*?)<\/game>/g
    let block
    while ((block = gameBlockRegex.exec(text)) !== null) {
      const content = block[1]

      const nameMatch = content.match(/<n><!\[CDATA\[([^\]]+)\]\]><\/name>/)
      if (!nameMatch) continue
      const name = nameMatch[1].trim()

      const hoursMatch = content.match(/<hoursOnRecord>([^<]+)<\/hoursOnRecord>/)
      const hours = hoursMatch ? parseFloat(hoursMatch[1].replace(',', '.')) || 0 : 0

      const appidMatch = content.match(/<appID>(\d+)<\/appID>/)
      const appid = appidMatch ? appidMatch[1] : null

      games.push({ name, hours, appid })
    }

    games.sort((a, b) => b.hours - a.hours)
    return res.status(200).json({ games: games.slice(0, 20) })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  const { steamid } = req.query
  if (!steamid) return res.status(400).json({ error: 'steamid required' })

  try {
    // API non-officielle Steam — pas besoin de clé
    const response = await fetch(
      `https://steamspy.com/api.php?request=playerdata&steamid=${steamid}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    )
    const data = await response.json()
    
    if (!data || Object.keys(data).length === 0) {
      return res.status(200).json({ error: 'private', games: [] })
    }

    const games = Object.values(data)
      .filter(g => g.name)
      .map(g => ({
        name: g.name,
        hours: Math.round((g.playtime_forever || 0) / 60),
        appid: g.appid
      }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 20)

    return res.status(200).json({ games })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}