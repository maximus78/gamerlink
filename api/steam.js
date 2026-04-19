export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  
  const { steamid } = req.query
  if (!steamid) return res.status(400).json({ error: 'steamid required' })

  try {
    const response = await fetch(
      `https://steamcommunity.com/profiles/${steamid}/games/?tab=all&xml=1`
    )
    const text = await response.text()
    
    const games = []
    const regex = /<game>[\s\S]*?<name><!\[CDATA\[([^\]]+)\]\]><\/name>[\s\S]*?<hoursOnRecord>([^<]+)<\/hoursOnRecord>[\s\S]*?<\/game>/g
    const regexNoHours = /<game>[\s\S]*?<name><!\[CDATA\[([^\]]+)\]\]><\/name>[\s\S]*?<\/game>/g
    
    let match
    while ((match = regex.exec(text)) !== null) {
      games.push({ name: match[1], hours: parseFloat(match[2].replace(',', '.')) || 0 })
    }
    
    games.sort((a, b) => b.hours - a.hours)
    res.status(200).json({ games: games.slice(0, 20) })
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}