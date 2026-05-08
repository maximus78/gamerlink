export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  const { steamid } = req.query
  if (!steamid) return res.status(400).json({ error: 'steamid required' })

  try {
    // Récupérer la liste d'amis Steam
    const response = await fetch(
      `https://steamcommunity.com/profiles/${steamid}/friends/?xml=1`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    )
    const text = await response.text()

    if (text.includes('This profile is private') || text.includes('privacyMessage')) {
      return res.status(200).json({ error: 'private', friends: [] })
    }

    const friends = []
    const friendRegex = /<steamID64>(\d+)<\/steamID64>/g
    let match
    while ((match = friendRegex.exec(text)) !== null) {
      friends.push(match[1])
    }

    return res.status(200).json({ friends })
  } catch(e) {
    return res.status(500).json({ error: e.message })
  }
}