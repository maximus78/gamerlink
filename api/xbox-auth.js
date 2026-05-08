// api/xbox-auth.js
// Démarre le flow OAuth Xbox via OpenXBL

export default function handler(req, res) {
  const apiKey = process.env.OPENXBL_API_KEY
  
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENXBL_API_KEY not configured' })
  }

  // OpenXBL utilise un flow OAuth simplifié
  // L'utilisateur sera redirigé vers leur page d'auth Microsoft
  // Puis renvoyé sur notre callback avec un code
  
  const redirectUri = `https://${req.headers.host}/api/xbox-callback`
  
  // URL OAuth OpenXBL
  const authUrl = `https://xbl.io/app/auth?app_key=${apiKey}&redirect_uri=${encodeURIComponent(redirectUri)}`
  
  // Redirection vers OpenXBL → Microsoft → retour callback
  res.redirect(authUrl)
}