import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://phuucjawhdpentsyiwta.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBodXVjamF3aGRwZW50c3lpd3RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1ODYzODIsImV4cCI6MjA5MjE2MjM4Mn0.8NY4Zco0uiA7mDz_Q5Ef-gd2x9Y4YA-lgEuPpULtFyA'
)

// Templates de défis par genre
const genreDefis = {
  FPS: [
    "Je fais plus de kills que toi ce soir 🎯",
    "Premier à 20 kills gagne — perdant fait le café ☕",
    "Je te bats en duel 1v1 — t'as peur ? 😈",
    "On finit le match avec un ratio positif 📈",
  ],
  Sport: [
    "Je te mets 3-0 — t'as peur ? ⚽",
    "On fait un tournoi entre potes ce soir 🏆",
    "Premier à 5 buts gagne la manette 🕹️",
    "Je te montre comment vraiment jouer 😏",
  ],
  'Battle Royale': [
    "On finit top 3 ensemble ou on arrête 💀",
    "Premier Chicken Dinner ce soir 🍗",
    "Je fais plus de kills que toi en BR 🎯",
    "On tente le solo squad ce soir 😤",
  ],
  MOBA: [
    "On monte de rang ensemble ce soir 🏆",
    "Je fais plus de kills/assists que toi 💎",
    "On tente une compo full carry 🚀",
    "Premier à 10 victoires ce soir gagne 🥇",
  ],
  RPG: [
    "On finit le donjon ensemble ce soir ⚔️",
    "Premier à monter de niveau gagne 📈",
    "On tente le boss difficile ce soir 🐉",
    "Je trouve un meilleur loot que toi 💎",
  ],
  Survie: [
    "On survit ensemble jusqu'au matin 🌅",
    "Je construis une meilleure base que toi 🏗️",
    "On tente le raid ce soir 💣",
    "Premier à 100 kills sur le serveur gagne 🎯",
  ],
  default: [
    "Je suis meilleur que toi — prouve le contraire 😈",
    "On joue ensemble ce soir — perdant paie une tournée 🍺",
    "Challenge accepté — qui perd range sa chambre 😂",
    "On fait un marathon ce soir — dernier à tenir gagne 🏆",
  ]
}

// Défis spécifiques pour les jeux populaires
const specificDefis = {
  'Counter-Strike 2': [
    "Je fais plus de 20 kills ce soir 💣",
    "On finit le match avec un ratio positif 📈",
    "Je te bats en duel — 1v1 sur Aim Map 🔫",
    "On sort de Silver ce soir ou jamais 😭",
  ],
  'Dota 2': [
    "On monte de rank ensemble ce soir 🏆",
    "Je fais plus de kills que toi — mid ou rien 🗡️",
    "On tente une compo full carry 🚀",
    "Je te prouve que mon hero est meilleur 😏",
  ],
  'PUBG': [
    "On finit top 3 ensemble ou on arrête 💀",
    "Premier Chicken Dinner ce soir 🍗",
    "Je fais plus de kills que toi en BR 🎯",
    "On tente le solo squad ce soir 😤",
  ],
  'Apex Legends': [
    "On finit Champion ce soir 👑",
    "Je fais plus de kills que toi — perdant fait le café ☕",
    "On tente le 20 kills badge ensemble 🔥",
    "On joue sans armure légendaire — challenge accepted 😅",
  ],
  'Warzone': [
    "Je fais plus de kills que toi ce soir 🎯",
    "On finit top 3 ensemble ou on arrête 💀",
    "Je te bats en Gulag — t'as peur ? 😈",
    "On fait une soirée sans mourir au premier cercle 😂",
  ],
  'Rocket League': [
    "On passe Diamant 2 ce soir ou on sleep pas 🚀",
    "Je t'affronte en 1v1 — perdant reste en Or 😬",
    "Best of 3 — perdant change de pseudo 24h 😅",
    "On finit la saison en ranked ensemble 🏆",
  ],
  'Valorant': [
    "On monte en Platine ce soir 💎",
    "Je fais plus d'headshots que toi 🎯",
    "On clutch ensemble ou on rage quit 😤",
    "Premier à 20 kills gagne — perdant offre les chips 🍟",
  ],
  'Fortnite': [
    "Je fais plus de kills que toi en Battle Royale 🎯",
    "On finit top 3 ensemble ce soir 🏆",
    "Je construis une meilleure base que toi 🏗️",
    "On tente le no-build ranked ce soir 😤",
  ],
  'League of Legends': [
    "On monte de rang ensemble ce soir 🏆",
    "Je fais plus de kills/assists que toi 💎",
    "On tente une compo full carry 🚀",
    "Je te prouve que mon champion est OP 😏",
  ],
  'Minecraft': [
    "Je construis quelque chose de plus beau que toi 🏗️",
    "On survit ensemble en Hardcore ce soir ⚔️",
    "Premier à avoir un full set de diamants gagne 💎",
    "On construit une ville ensemble ce soir 🏙️",
  ],
}

export default async function handler(req, res) {
  try {
    // Récupérer le top 100 Steam
    const response = await fetch(
      'https://api.steampowered.com/ISteamChartsService/GetMostPlayedGames/v1/?key=' + process.env.STEAM_API_KEY
    )
    const data = await response.json()
    const topGames = data.response?.ranks || []

    // Pour chaque jeu dans le top Steam
    for (const game of topGames.slice(0, 100)) {
      const appid = game.appid?.toString()
      if (!appid) continue

      // Récupérer les infos du jeu via Steam
      const infoRes = await fetch(
        `https://store.steampowered.com/api/appdetails?appids=${appid}&fields=name,genres`
      )
      const infoData = await infoRes.json()
      const appData = infoData[appid]?.data
      if (!appData) continue

      const gameName = appData.name
      const genre = appData.genres?.[0]?.description || 'default'

      // Défis spécifiques ou par genre
      const defis = specificDefis[gameName] || genreDefis[genre] || genreDefis['default']

      // Upsert dans Supabase
      await supabase.from('game_defis').upsert({
        game_name: gameName,
        genre: genre,
        defis: defis,
        steam_appid: appid,
        players_count: game.peak_in_game || 0,
        updated_at: new Date().toISOString()
      }, { onConflict: 'game_name' })
    }

    return res.status(200).json({ success: true, updated: topGames.length })
  } catch(e) {
    return res.status(500).json({ error: e.message })
  }
}