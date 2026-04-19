export default function Feed() {
  return (
    <div>
      <div className="fomo">
        <div className="fomo-avs">
          <div className="fomo-av" style={{background:'#C0DD97'}}></div>
          <div className="fomo-av" style={{background:'#CECBF6'}}></div>
          <div className="fomo-av" style={{background:'#FAC775'}}></div>
        </div>
        <div className="fomo-txt"><strong>3 potes jouent à Warzone</strong> — Lucas et 3 autres ne le savent pas encore ›</div>
      </div>

      <div className="sec">En game maintenant</div>

      <div className="frow">
        <div className="av-wrap">
          <div className="av" style={{background:'#C0DD97',color:'#27500A'}}>PL</div>
          <span className="fdot" style={{background:'#639922'}}></span>
        </div>
        <div className="fi">
          <div className="fn">Paul</div>
          <div className="game-row">
            <div className="game-logo-sm" style={{background:'#1a1a2e'}}>
              <svg width="13" height="13" viewBox="0 0 13 13"><rect x="1" y="5.5" width="11" height="2" fill="#e63946" rx="1"/><rect x="5.5" y="1" width="2" height="11" fill="#e63946" rx="1"/><circle cx="10" cy="9" r="1.5" fill="#fff" opacity=".8"/></svg>
            </div>
            <span className="game-row-txt">Warzone · Partie ranked</span>
          </div>
          <div className="gtag">
            <span className="gtag-dot" style={{background:'#1b2838'}}></span>
            <span>Paullgamer42</span>
            <span style={{color:'#eee',margin:'0 2px'}}>·</span>
            <span className="gtag-dot" style={{background:'#107c10'}}></span>
            <span>PaulXBL</span>
          </div>
          <div className="fchips">
            <span className="chip c-fps">FPS</span>
            <span className="chip c-br">Battle R.</span>
          </div>
        </div>
        <span className="pill p-live">En game</span>
      </div>

      <div className="frow">
        <div className="av-wrap">
          <div className="av" style={{background:'#FAC775',color:'#633806'}}>JU</div>
          <span className="fdot" style={{background:'#378ADD'}}></span>
        </div>
        <div className="fi">
          <div className="fn">Jules</div>
          <div className="game-row">
            <div className="game-logo-sm" style={{background:'#0d1b2a'}}>
              <svg width="13" height="13" viewBox="0 0 13 13"><ellipse cx="6.5" cy="6.5" rx="4.5" ry="3" fill="none" stroke="#4cc9f0" strokeWidth="1"/><circle cx="6.5" cy="6.5" r="1.2" fill="#4cc9f0"/></svg>
            </div>
            <span className="game-row-txt">Rocket League · statut manuel</span>
          </div>
          <div className="gtag">
            <span className="gtag-dot" style={{background:'#5865F2'}}></span>
            <span>jules_irl#2209</span>
          </div>
          <div className="fchips"><span className="chip c-multi">Multi</span></div>
        </div>
        <span className="pill p-hot">Chaud</span>
      </div>

      <div className="dvd" style={{marginTop:'5px'}}></div>
      <div className="sec" style={{marginTop:'5px'}}>Ce soir ~21h</div>

      <div className="frow">
        <div className="av-wrap">
          <div className="av" style={{background:'#CECBF6',color:'#3C3489'}}>MA</div>
          <span className="fdot" style={{background:'#EF9F27'}}></span>
        </div>
        <div className="fi">
          <div className="fn">Maxime</div>
          <div className="game-row">
            <div className="game-logo-sm" style={{background:'#1a1a2e'}}>
              <svg width="13" height="13" viewBox="0 0 13 13"><rect x="1" y="5.5" width="11" height="2" fill="#e63946" rx="1"/><rect x="5.5" y="1" width="2" height="11" fill="#e63946" rx="1"/></svg>
            </div>
            <span className="game-row-txt">Joue FPS · tous les soirs 21h</span>
          </div>
          <div className="gtag">
            <span className="gtag-dot" style={{background:'#1b2838'}}></span>
            <span>Max_FPS_</span>
          </div>
          <div className="fchips"><span className="chip c-fps">FPS</span></div>
        </div>
        <span className="pill p-soon">Ce soir</span>
      </div>

      <div className="frow">
        <div className="av-wrap">
          <div className="av" style={{background:'#B5D4F4',color:'#0C447C'}}>TH</div>
          <span className="fdot" style={{background:'#EF9F27'}}></span>
        </div>
        <div className="fi">
          <div className="fn">Thomas</div>
          <div className="game-row">
            <div className="game-logo-sm" style={{background:'#00875a'}}>
              <svg width="13" height="13" viewBox="0 0 13 13"><circle cx="6.5" cy="6.5" r="4.5" fill="none" stroke="#fff" strokeWidth="1"/><path d="M4 6.5C4 5 6.5 3.5 9 6.5C6.5 9.5 4 8 4 6.5Z" fill="#fff" opacity=".8"/></svg>
            </div>
            <span className="game-row-txt">FC 26 · En ligne</span>
          </div>
          <div className="gtag">
            <span className="gtag-dot" style={{background:'#1b2838'}}></span>
            <span>TomFC26</span>
          </div>
          <div className="fchips"><span className="chip c-sport">Sport</span></div>
        </div>
        <span className="pill p-soon">Ce soir</span>
      </div>

      <div className="dvd" style={{marginTop:'5px'}}></div>
      <div className="sec" style={{marginTop:'5px'}}>Pas encore sur l'app</div>

      <div className="ghost-box">
        <div className="ghost-hdr">Lucas et 3 autres</div>
        <div className="ghost-row">
          <div className="gav">LU</div>
          <div className="ghost-info">
            <div className="ghost-name">Lucas</div>
            <div className="ghost-maybe">
              <div className="game-logo-sm" style={{background:'#1a1a2e',width:'14px',height:'14px',borderRadius:'3px'}}>
                <svg width="9" height="9" viewBox="0 0 9 9"><rect x=".5" y="3.5" width="8" height="2" fill="#e63946" rx=".8"/><rect x="3.5" y=".5" width="2" height="8" fill="#e63946" rx=".8"/></svg>
              </div>
              <span>Joue peut-être à Warzone · via Steam de Paul</span>
            </div>
          </div>
          <div className="ghost-actions">
            <span className="gadd">+ Gamertag</span>
            <span className="glink">SMS ↗</span>
          </div>
        </div>
        <div className="ghost-row">
          <div className="gav">SA</div>
          <div className="ghost-info">
            <div className="ghost-name">Samir</div>
            <div className="ghost-sub">Profil inconnu · 06 98 76 54 32</div>
          </div>
          <div className="ghost-actions">
            <span className="gadd">+ Gamertag</span>
            <span className="glink">SMS ↗</span>
          </div>
        </div>
      </div>
      <div className="hint">+ Gamertag : tu connais son pseudo, renseigne-le. SMS : lien de 30 sec.</div>
    </div>
  )
}