export default function Decouvrir() {
  return (
    <div>
      <div style={{margin:'12px 16px 0',border:'1px solid #eee',borderRadius:'20px',overflow:'hidden'}}>
        <div style={{height:'86px',position:'relative',display:'flex',alignItems:'flex-end',padding:'12px 14px'}}>
          <div style={{position:'absolute',inset:0,background:'#1a1a2e'}}></div>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,.75),rgba(0,0,0,.1))'}}></div>
          <div style={{position:'relative',zIndex:1,width:'100%',display:'flex',alignItems:'flex-end',gap:'10px'}}>
            <div style={{width:'44px',height:'44px',borderRadius:'11px',background:'#e63946',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,border:'1.5px solid rgba(255,255,255,.25)'}}>
              <svg width="24" height="24" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="2.5" fill="#fff" rx="1.2"/><rect x="10.75" y="3" width="2.5" height="18" fill="#fff" rx="1.2"/><circle cx="19" cy="17" r="2.8" fill="#fff" opacity=".8"/></svg>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:'16px',fontWeight:'700',color:'#fff'}}>Warzone</div>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,.65)',marginTop:'2px'}}>Battle Royale · Free to play</div>
            </div>
            <span style={{fontSize:'10px',fontWeight:'700',background:'#e63946',color:'#fff',padding:'3px 9px',borderRadius:'20px',alignSelf:'flex-start'}}>Pic actuel</span>
          </div>
        </div>

        <div style={{padding:'11px 14px',borderTop:'1px solid #f0f0f0'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'7px'}}>
            <span style={{fontSize:'11px',fontWeight:'700',color:'#111'}}>Momentum</span>
            <span style={{fontSize:'11px',fontWeight:'700',color:'#e63946'}}>Pic — joue maintenant</span>
          </div>
          <div style={{height:'8px',background:'#f0f0f0',borderRadius:'4px',overflow:'visible',position:'relative'}}>
            <div style={{height:'100%',width:'88%',borderRadius:'4px',background:'linear-gradient(to right,#EAF3DE,#639922,#e63946)'}}></div>
            <div style={{position:'absolute',top:'-3px',left:'88%',width:'14px',height:'14px',borderRadius:'50%',background:'#e63946',border:'2.5px solid #fff',boxShadow:'0 1px 4px rgba(0,0,0,.25)',transform:'translateX(-50%)'}}></div>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:'5px'}}>
            {['Inconnu','Montée','Pic ●','Déclin'].map((p,i) => (
              <span key={i} style={{fontSize:'9px',color: i===2 ? '#e63946' : '#bbb',fontWeight: i===2 ? '700' : '500'}}>{p}</span>
            ))}
          </div>
        </div>

        <div style={{display:'flex',borderTop:'1px solid #f0f0f0'}}>
          {[
            {val:'487k',label:'joueurs Steam',trend:'↑ +34%'},
            {val:'2.1M',label:'vues YouTube/j',trend:'↑ +18%'},
            {val:'#1',label:'trending Steam',trend:'↑ +2'}
          ].map((s,i) => (
            <div key={i} style={{flex:1,padding:'10px 12px',borderRight: i<2 ? '1px solid #f0f0f0' : 'none',textAlign:'center'}}>
              <div style={{fontSize:'14px',fontWeight:'700',color:'#111'}}>{s.val}</div>
              <div style={{fontSize:'10px',color:'#aaa',marginTop:'2px'}}>{s.label}</div>
              <div style={{fontSize:'10px',fontWeight:'700',color:'#27500A',marginTop:'2px'}}>{s.trend}</div>
            </div>
          ))}
        </div>

        <div style={{display:'flex',alignItems:'center',gap:'6px',padding:'10px 14px',borderTop:'1px solid #f0f0f0'}}>
          {[
            {bg:'#C0DD97',color:'#27500A',txt:'PL'},
            {bg:'#CECBF6',color:'#3C3489',txt:'MA'},
            {bg:'#FAC775',color:'#633806',txt:'JU'}
          ].map((a,i) => (
            <div key={i} style={{width:'24px',height:'24px',borderRadius:'50%',background:a.bg,color:a.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'9px',fontWeight:'700',border:'2px solid #fff',marginLeft: i===0?'0':'-6px'}}>{a.txt}</div>
          ))}
          <span style={{fontSize:'12px',color:'#555',flex:1,marginLeft:'4px',fontWeight:'500'}}><strong>3 potes</strong> jouent déjà</span>
          <button style={{fontSize:'11px',fontWeight:'700',padding:'5px 13px',borderRadius:'20px',cursor:'pointer',border:'1.5px solid #3B6D11',background:'#EAF3DE',color:'#27500A',fontFamily:'inherit'}}>Rejoindre</button>
        </div>
      </div>

      {[
        {title:'Schedule I',sub:'Indie · 18€',bg:'#0d1b2a',badge:'Pépite indie',badgeBg:'#7F77DD',val1:'148k',val2:'+312%',col:'#7F77DD',pote:'?',poteBg:'#f0f0f0',poteColor:'#bbb',ptxt:'Aucun pote — sois le premier',btnTxt:'Découvrir',btnBg:'#EEEDFE',btnColor:'#3C3489',btnBorder:'#7F77DD'},
        {title:'Delta Force',sub:'FPS · Free',bg:'#0a1628',badge:'En montée',badgeBg:'#EF9F27',val1:'203k',val2:'+89%',col:'#EF9F27',pote:'MA',poteBg:'#CECBF6',poteColor:'#3C3489',ptxt:'Maxime aimerait · FPS',btnTxt:'Inviter',btnBg:'#FAEEDA',btnColor:'#633806',btnBorder:'#FAC775'},
      ].map((c,i) => (
        <div key={i} style={{margin: i===0 ? '14px 16px 8px' : '0 16px 8px',border:'1px solid #eee',borderRadius:'16px',overflow:'hidden'}}>
          <div style={{height:'54px',position:'relative',display:'flex',alignItems:'flex-end',padding:'7px 12px'}}>
            <div style={{position:'absolute',inset:0,background:c.bg}}></div>
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,.65),rgba(0,0,0,.1))'}}></div>
            <div style={{position:'relative',zIndex:1,width:'100%',display:'flex',alignItems:'flex-end',justifyContent:'space-between'}}>
              <div>
                <div style={{fontSize:'13px',fontWeight:'700',color:'#fff'}}>{c.title}</div>
                <div style={{fontSize:'10px',color:'rgba(255,255,255,.65)',marginTop:'1px'}}>{c.sub}</div>
              </div>
              <span style={{fontSize:'10px',fontWeight:'700',background:c.badgeBg,color:'#fff',padding:'2px 8px',borderRadius:'20px'}}>{c.badge}</span>
            </div>
          </div>
          <div style={{padding:'8px 12px',display:'flex',alignItems:'center',gap:'10px'}}>
            <div style={{display:'flex',gap:'14px',flex:1}}>
              <div><div style={{fontSize:'12px',fontWeight:'700',color:'#111'}}>{c.val1}</div><div style={{fontSize:'10px',color:'#aaa',marginTop:'1px'}}>joueurs</div></div>
              <div><div style={{fontSize:'12px',fontWeight:'700',color:c.col}}>{c.val2}</div><div style={{fontSize:'10px',color:'#aaa',marginTop:'1px'}}>cette sem.</div></div>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'5px',padding:'6px 12px',borderTop:'1px solid #f5f5f5'}}>
            <div style={{width:'18px',height:'18px',borderRadius:'50%',background:c.poteBg,color:c.poteColor,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'7px',fontWeight:'700',border:'1.5px solid #fff'}}>{c.pote}</div>
            <span style={{fontSize:'11px',color:'#888',flex:1}}>{c.ptxt}</span>
            <button style={{fontSize:'10px',fontWeight:'700',padding:'3px 10px',borderRadius:'20px',border:`1.5px solid ${c.btnBorder}`,background:c.btnBg,color:c.btnColor,fontFamily:'inherit',cursor:'pointer'}}>{c.btnTxt}</button>
          </div>
        </div>
      ))}

      <div style={{height:'14px'}}></div>
    </div>
  )
}