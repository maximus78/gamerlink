export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  const { steamid } = req.query
  if (!steamid) return res.status(400).json({ error: 'steamid required' })

  try {
    const response = await fetch(
      `https://api.steampowered.com/ISteamUser/GetFriendList/v1/?key=${process.env.STEAM_API_KEY}&steamid=${steamid}&relationship=friend`
    )
    const data = await response.json()

    if (!data.friendslist || !data.friendslist.friends) {
      return res.status(200).json({ friends: [] })
    }

    const friends = data.friendslist.friends.map(f => f.steamid)
    return res.status(200).json({ friends })
  } catch(e) {
    return res.status(500).json({ error: e.message })
  }
}