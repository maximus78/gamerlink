// api/xbox-callback.js
// Reçoit le retour de OpenXBL après auth Microsoft
// Récupère le gamertag et le sauve dans Supabase

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  const { code, app_key, user_id } = req.query
  const apiKey = process.env.OPENXBL_API_KEY
  
  if (!apiKey) {
    return res.status(500).send('OPENXBL_API_KEY not configured')
  }

  // OpenXBL renvoie soit "code" soit "app_key" selon leur flow
  const xblToken = code || app_key
  
  if (!xblToken) {
    return res.redirect('/?xbox_error=no_token')
  }

  try {
    // Récupère le profil Xbox de l'utilisateur via OpenXBL
    const profileResponse = await fetch('https://xbl.io/api/v2/account', {
      headers: {
        'X-Authorization': apiKey,
        'X-Contract': '100',
        'Accept': 'application/json',
      }
    })

    if (!profileResponse.ok) {
      console.error('OpenXBL profile error:', await profileResponse.text())
      return res.redirect('/?xbox_error=profile_fetch_failed')
    }

    const profileData = await profileResponse.json()
    const xboxProfile = profileData.profileUsers?.[0]
    
    if (!xboxProfile) {
      return res.redirect('/?xbox_error=no_profile')
    }

    // Extraction des données du profil
    const xuid = xboxProfile.id
    const settings = xboxProfile.settings || []
    
    const getSetting = (id) => settings.find(s => s.id === id)?.value
    
    const gamertag = getSetting('Gamertag')
    const avatarUrl = getSetting('GameDisplayPicRaw')
    const gamerscore = parseInt(getSetting('Gamerscore') || '0', 10)

    if (!gamertag) {
      return res.redirect('/?xbox_error=no_gamertag')
    }

    // Récupération du user_id depuis la session (via cookie ou param)
    // OpenXBL ne nous renvoie PAS l'user_id Supabase, donc on doit le passer en param
    // ou utiliser un cookie temporaire
    
    // Pour le moment, on stocke les données dans l'URL et on laisse le frontend
    // les sauvegarder une fois connecté à Supabase
    const params = new URLSearchParams({
      xbox_id: xuid,
      xbox_gamertag: gamertag,
      xbox_avatar_url: avatarUrl || '',
      xbox_gamerscore: String(gamerscore),
    })

    res.redirect(`/?${params.toString()}`)
    
  } catch (error) {
    console.error('Xbox callback error:', error)
    res.redirect('/?xbox_error=server_error')
  }
}