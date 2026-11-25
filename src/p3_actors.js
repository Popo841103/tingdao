
/* =====================================================================
   三、角色：干净的简单人物/野兽模型 + 程序化动作；可导入 Tripo 导出的 GLB 替换主角
   ===================================================================== */
const SKIN='#f0c8a0';
const STY={
  A:{top:'#f6f8fb',top2:'#7a9cc8',bottom:'#dde6f2',robe:1,hair:'#1c1818',hat:'tail',belt:'#3d5f9a',shoe:'#3d5480',sword:1},
  B:{top:'#3a68b0',top2:'#2f5a9c',bottom:'#2c3d5e',robe:0,hair:'#141414',hat:'messy',belt:'#2a2a2a',shoe:'#f4f4f4',fore:'#f0c8a0',pack:1},
  eA:{top:'#dfe6f2',top2:'#2f4f8a',bottom:'#cfd6e2',robe:1,hair:'#1a1818',hat:'crown',belt:'#8a2a2a',shoe:'#2a2a30'},
  eB:{top:'#7a8a5a',top2:'#4a5a3a',bottom:'#4a5040',robe:0,hair:'#2a2a2a',hat:'helmet',belt:'#3a3a2a',shoe:'#3a3020'},
  bossA:{top:'#2a2a2e',top2:'#6a5a44',bottom:'#1e1e22',robe:0,hair:'#2a1a14',hat:'horns',belt:'#4a3a2a',shoe:'#18181a',fore:'#d8a880',big:1.35},
  bossB:{top:'#2a2a2e',top2:'#6a5a44',bottom:'#1e1e22',robe:0,hair:'#2a1a14',hat:'horns',belt:'#4a3a2a',shoe:'#18181a',fore:'#d8a880',big:1.35},
  merchant:{top:'#c86a3a',top2:'#8a3a22',bottom:'#5a4a3a',robe:1,hair:'#3a2a20',hat:'straw',belt:'#e0b050',shoe:'#3a2a20'}};
const _matCache={};const sm=c=>_matCache[c]||(_matCache[c]=new THREE.MeshStandardMaterial({color:c,roughness:.75}));
function cap(r,len,c){const m=new THREE.Mesh(new THREE.CapsuleGeometry(r,len,6,12),sm(c));m.castShadow=true;return m}
function piv(parent,x,y,z){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);return g}
function makeHuman(key){
  const s=STY[key],root=new THREE.Group(),body=new THREE.Group();root.add(body);
  const pel=piv(body,0,.95,0),tor=piv(pel,0,.02,0);
  const chest=cap(.2,.32,s.top);chest.position.y=.3;chest.scale.set(1.05,1,.72);tor.add(chest);
  const belt=new THREE.Mesh(new THREE.CylinderGeometry(.205,.205,.07,16),sm(s.belt));belt.position.y=.06;belt.scale.z=.74;tor.add(belt);
  const collar=new THREE.Mesh(new THREE.TorusGeometry(.12,.035,6,16),sm(s.top2));collar.rotation.x=Math.PI/2;collar.position.y=.56;tor.add(collar);
  const neck=cap(.06,.06,SKIN);neck.position.y=.6;tor.add(neck);
  const hd=piv(tor,0,.78,0);const head=new THREE.Mesh(new THREE.SphereGeometry(.145,20,16),sm(SKIN));head.scale.set(.92,1.08,.98);head.castShadow=true;hd.add(head);
  for(const sx of[-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(.018,8,6),sm('#1a1410'));e.position.set(sx*.05,.02,.13);hd.add(e);const b=new THREE.Mesh(new THREE.BoxGeometry(.045,.008,.01),sm('#2a1e18'));b.position.set(sx*.05,.06,.135);hd.add(b)}
  const nose=new THREE.Mesh(new THREE.ConeGeometry(.015,.04,6),sm(SKIN));nose.rotation.x=Math.PI/2;nose.position.set(0,-.01,.15);hd.add(nose);
  const hair=new THREE.Mesh(new THREE.SphereGeometry(.152,20,12,0,Math.PI*2,0,Math.PI*.58),sm(s.hair));hair.rotation.x=-.3;hair.position.set(0,.02,-.01);hd.add(hair);
  if(s.hat==='bun'){const b=new THREE.Mesh(new THREE.SphereGeometry(.065,12,10),sm(s.hair));b.position.set(0,.16,-.04);hd.add(b);const pin=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.2,6),sm('#5fc08a'));pin.rotation.z=Math.PI/2;pin.position.set(0,.16,-.04);hd.add(pin)}
  if(s.hat==='cap'){const c=new THREE.Mesh(new THREE.CylinderGeometry(.155,.16,.08,16),sm('#4a5a3a'));c.position.y=.1;hd.add(c);const v=new THREE.Mesh(new THREE.BoxGeometry(.18,.015,.1),sm('#4a5a3a'));v.position.set(0,.08,.16);hd.add(v)}
  if(s.hat==='helmet'){const c=new THREE.Mesh(new THREE.SphereGeometry(.17,16,10,0,Math.PI*2,0,Math.PI*.5),sm('#5a6648'));c.position.y=.03;hd.add(c)}
  if(s.hat==='crown'){const c=new THREE.Mesh(new THREE.CylinderGeometry(.05,.06,.06,10),sm('#d8b050'));c.position.set(0,.16,-.02);hd.add(c)}
  if(s.hat==='goggle'){for(const sx of[-1,1]){const g=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.03,12),sm('#5a6066'));g.rotation.x=Math.PI/2-.4;g.position.set(sx*.05,.1,.12);hd.add(g)}}
  if(s.hat==='tail'){const b=new THREE.Mesh(new THREE.SphereGeometry(.06,12,10),sm(s.hair));b.position.set(0,.13,-.1);hd.add(b);const t=cap(.04,.24,s.hair);t.position.set(0,-.03,-.19);t.rotation.x=.35;hd.add(t);const r=new THREE.Mesh(new THREE.TorusGeometry(.045,.015,6,12),sm('#3d5f9a'));r.position.set(0,.12,-.12);r.rotation.x=1.2;hd.add(r)}
  if(s.hat==='messy'){for(let i=0;i<9;i++){const sp=new THREE.Mesh(new THREE.ConeGeometry(.05,.14,5),sm(s.hair));const a=i/9*6.28;sp.position.set(Math.cos(a)*.1,.1+Math.random()*.03,Math.sin(a)*.1-.02);sp.rotation.set(Math.sin(a)*.9,0,-Math.cos(a)*.9);hd.add(sp)}}
  if(s.hat==='horns'){const hm=new THREE.Mesh(new THREE.SphereGeometry(.165,16,10,0,Math.PI*2,0,Math.PI*.55),sm('#26262a'));hm.position.y=.02;hd.add(hm);for(const sx of[-1,1]){const h=new THREE.Mesh(new THREE.TorusGeometry(.13,.03,6,10,Math.PI*.8),sm('#2e2a26'));h.position.set(sx*.16,.12,0);h.rotation.set(0,Math.PI/2,sx>0?.2:Math.PI-.2);hd.add(h)}const fur=new THREE.Mesh(new THREE.TorusGeometry(.2,.07,8,16),sm('#1a1a1c'));fur.rotation.x=Math.PI/2;fur.position.y=-.2;hd.add(fur)}
  if(s.hat==='straw'){const c=new THREE.Mesh(new THREE.ConeGeometry(.32,.16,18),sm('#d8b870'));c.position.y=.14;hd.add(c)}
  const arm=(sx)=>{const ua=piv(tor,sx*.25,.5,0);const u=cap(.055,.22,s.robe?s.top:s.top);u.position.y=-.15;ua.add(u);
    const fa=piv(ua,0,-.31,0);const f=cap(.047,.2,s.fore||s.top);f.position.y=-.13;fa.add(f);if(s.robe){const sl=new THREE.Mesh(new THREE.CylinderGeometry(.09,.06,.2,10,1,true),sm(s.top));sl.material.side=THREE.DoubleSide;sl.position.y=-.2;fa.add(sl)}
    const h=new THREE.Mesh(new THREE.SphereGeometry(.05,10,8),sm(SKIN));h.position.y=-.29;fa.add(h);const hand=piv(fa,0,-.3,0);ua.rotation.z=sx*.08;return[ua,fa,hand]};
  const [uaL,faL]=arm(-1),[uaR,faR,hand]=arm(1);
  const leg=(sx)=>{const th=piv(pel,sx*.1,-.02,0);const t=cap(.075,.34,s.bottom);t.position.y=-.21;th.add(t);const sh=piv(th,0,-.44,0);const c=cap(.06,.32,s.bottom);c.position.y=-.2;sh.add(c);
    const f=new THREE.Mesh(new THREE.BoxGeometry(.1,.07,.22),sm(s.shoe));f.position.set(0,-.43,.04);f.castShadow=true;sh.add(f);return[th,sh]};
  const [thL,shL]=leg(-1),[thR,shR]=leg(1);
  let skirt=null;if(s.robe){skirt=new THREE.Mesh(new THREE.CylinderGeometry(.21,.34,.72,16,1,true),sm(s.top));skirt.material.side=THREE.DoubleSide;skirt.position.y=-.32;skirt.castShadow=true;pel.add(skirt);
    const hem=new THREE.Mesh(new THREE.TorusGeometry(.34,.02,6,20),sm(s.top2));hem.rotation.x=Math.PI/2;hem.position.y=-.68;pel.add(hem)}
  const back=piv(tor,0,.4,-.16);
  if(s.pack){const bp=new THREE.Mesh(new THREE.BoxGeometry(.34,.4,.16),sm('#1e1e22'));bp.position.set(0,-.08,-.04);bp.castShadow=true;back.add(bp);for(const sx of[-1,1]){const st=new THREE.Mesh(new THREE.BoxGeometry(.04,.36,.03),sm('#1e1e22'));st.position.set(sx*.12,-.05,.16);back.add(st)}}
  if(s.sword){const sc=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,.8,8),sm('#34508a'));sc.position.set(.24,-.42,.02);sc.rotation.set(.25,0,.35);tor.add(sc)}
  if(s.big)root.scale.setScalar(s.big);
  root.rig={body,pel,tor,hd,uaL,faL,uaR,faR,thL,shL,thR,shR,hand,back,skirt};root.cur={};root.phase=Math.random()*6;return root;
}
// 手里的东西
const PROPS={
  none:()=>null,
  axe:()=>{const g=new THREE.Group();const h=new THREE.Mesh(new THREE.CylinderGeometry(.025,.03,.7,8),MAT.wood);h.position.z=.2;h.rotation.x=Math.PI/2;g.add(h);const b=new THREE.Mesh(new THREE.BoxGeometry(.04,.18,.16),MAT.rock2);b.position.set(0,.06,.5);g.add(b);return g},
  pick:()=>{const g=new THREE.Group();const h=new THREE.Mesh(new THREE.CylinderGeometry(.025,.03,.7,8),MAT.wood);h.position.z=.2;h.rotation.x=Math.PI/2;g.add(h);const b=new THREE.Mesh(new THREE.ConeGeometry(.04,.5,6),MAT.rock2);b.rotation.z=Math.PI/2;b.position.set(0,0,.52);g.add(b);return g},
  spear:()=>{const g=new THREE.Group();const h=new THREE.Mesh(new THREE.CylinderGeometry(.02,.025,1.8,8),MAT.wood);h.position.z=.5;h.rotation.x=Math.PI/2;g.add(h);const t=new THREE.Mesh(new THREE.ConeGeometry(.045,.22,6),MAT.rock2);t.rotation.x=Math.PI/2;t.position.z=1.5;g.add(t);return g},
  sword:()=>{const g=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(.05,.012,.85),MAT.metal);b.position.z=.5;g.add(b);const gd=new THREE.Mesh(new THREE.BoxGeometry(.18,.03,.04),MAT.gold);gd.position.z=.08;g.add(gd);const hl=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.16,6),MAT.dark);hl.rotation.x=Math.PI/2;g.add(hl);return g},
  shovel:()=>{const g=new THREE.Group();const h=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.8,8),MAT.wood);h.position.z=.25;h.rotation.x=Math.PI/2;g.add(h);const b=new THREE.Mesh(new THREE.BoxGeometry(.18,.02,.24),MAT.metal);b.position.z=.72;g.add(b);return g},
  bow:()=>{const g=new THREE.Group();const s=new THREE.Mesh(new THREE.BoxGeometry(.06,.06,.6),MAT.wood);s.position.z=.2;g.add(s);const a=new THREE.Mesh(new THREE.TorusGeometry(.3,.015,6,16,Math.PI),MAT.wood);a.rotation.set(Math.PI/2,0,0);a.position.z=.45;g.add(a);return g},
  bigaxe:()=>{const g=new THREE.Group();const h=new THREE.Mesh(new THREE.CylinderGeometry(.035,.04,1.3,8),MAT.wood);h.position.z=.45;h.rotation.x=Math.PI/2;g.add(h);const b=new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,.04,16,1,false,0,Math.PI),MAT.metal);b.rotation.set(0,0,Math.PI/2);b.position.set(0,.02,.95);g.add(b);return g},
  can:()=>{const g=new THREE.Group();const c=new THREE.Mesh(new THREE.CylinderGeometry(.08,.09,.2,12),MAT.wood);c.rotation.x=Math.PI/2;c.position.z=.08;g.add(c);return g}};
function setProp(h,key){const r=h.rig;if(!r)return;if(r.propKey===key)return;r.propKey=key;while(r.hand.children.length)r.hand.remove(r.hand.children[0]);const p=PROPS[key]?PROPS[key]():null;if(p){p.traverse(m=>{if(m.isMesh)m.castShadow=true});r.hand.add(p)}}
// 滑翔伞
function mkGlider(){const g=new THREE.Group();const c=new THREE.Mesh(new THREE.SphereGeometry(1.6,20,8,0,Math.PI*2,0,Math.PI*.32),new THREE.MeshStandardMaterial({color:'#ff8a5a',side:THREE.DoubleSide,roughness:.7}));c.scale.set(1.2,.5,.7);c.position.y=1.2;g.add(c);
  for(const sx of[-1,1]){const l=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,1.5,4),MAT.dark);l.position.set(sx*.7,.55,0);l.rotation.z=sx*.45;g.add(l)}g.visible=false;return g}

/* ---------- 动作：根据状态算出目标姿势，再平滑过渡 ---------- */
const J=['pel_y','pel_x','tor_x','tor_y','hd_x','uaL_x','uaL_z','faL_x','uaR_x','uaR_z','faR_x','thL_x','shL_x','thR_x','shR_x','body_x','body_y'];
function poseFor(h,st,sp,dt){
  h.phase+=dt*(sp>.2?(sp>6?sp*1.05:sp*1.6):1.4);const p=h.phase,P={};J.forEach(k=>P[k]=0);P.pel_y=.95;P.uaL_z=-.08;P.uaR_z=.08;P.faL_x=-.12;P.faR_x=-.12;P.shL_x=P.shR_x=.04;
  const run=sp>5.5,mv=sp>.2;
  if(st==='swim'){P.body_x=1.3;P.body_y=0;P.uaL_x=-Math.PI+Math.sin(p*1.2)*1.4;P.uaR_x=-Math.PI-Math.sin(p*1.2)*1.4;P.thL_x=Math.sin(p*3)*.35;P.thR_x=-Math.sin(p*3)*.35;P.hd_x=-.9;return P}
  if(st==='glide'){P.body_x=.2;P.uaL_x=P.uaR_x=-2.9;P.uaL_z=-.35;P.uaR_z=.35;P.faL_x=P.faR_x=0;P.thL_x=.15+Math.sin(p)*.08;P.thR_x=.1-Math.sin(p)*.08;P.shL_x=P.shR_x=.3;return P}
  if(st==='air'){P.thL_x=-.75;P.shL_x=1;P.thR_x=.2;P.shR_x=.5;P.uaL_x=-.9;P.uaR_x=-.5;P.uaL_z=-.5;P.uaR_z=.5;return P}
  if(st==='sit'){P.pel_y=.42;P.thL_x=P.thR_x=-1.45;P.shL_x=P.shR_x=1.45;P.uaL_x=P.uaR_x=-.7;P.faL_x=P.faR_x=-.9;P.tor_x=.12;P.hd_x=.1+Math.sin(p*.4)*.05;return P}
  if(st==='sleep'||st==='dead'){P.pel_y=.2;P.pel_x=-1.5;P.uaL_x=P.uaR_x=-.2;P.uaL_z=-.3;P.uaR_z=.3;P.thL_x=.05;P.thR_x=-.05;return P}
  if(st==='kneel'){P.pel_y=.55;P.thL_x=-1.5;P.shL_x=1.6;P.thR_x=.2;P.shR_x=1.9;P.tor_x=.55;P.uaL_x=P.uaR_x=-1;P.faL_x=P.faR_x=-.3;P.hd_x=.3;return P}
  if(st==='pour'){P.tor_x=.2;P.uaR_x=-1.3;P.faR_x=-.2;P.uaR_z=.2;P.hd_x=.4;return P}
  // 走跑
  const A=run?.9:.55*Math.min(1,sp/3.5),K=run?1.35:.85*Math.min(1,sp/3.5);
  if(mv){P.thL_x=-Math.sin(p)*A;P.thR_x=Math.sin(p)*A;P.shL_x=Math.max(0,Math.cos(p))*K+.05;P.shR_x=Math.max(0,-Math.cos(p))*K+.05;
    P.pel_y=.95-Math.abs(Math.cos(p))*(run?.07:.03);P.tor_y=Math.sin(p)*(run?.18:.08);P.tor_x=run?-.22:-.04;
    P.uaL_x=Math.sin(p)*A*.85;P.uaR_x=-Math.sin(p)*A*.85;P.faL_x=P.faR_x=run?-1.2:-.35}
  else{P.pel_y=.95+Math.sin(p*1.3)*.006;P.tor_x=Math.sin(p*1.3)*.015;P.hd_x=Math.sin(p*.3)*.04}
  return P}
// 动作叠加：挥砍/砍树/受击
function actOverlay(h,P){const a=h.act;if(!a)return;a.t+=h._dt;const k=Math.min(1,a.t/a.d);
  if(a.k==='swing'){if(k<.38){const q=k/.38;P.uaR_x=-2.5*q;P.uaR_z=.55*q;P.faR_x=-.7*q;P.tor_y=-.5*q}else if(k<.6){const q=(k-.38)/.22;P.uaR_x=-2.5+3*q;P.uaR_z=.55-.75*q;P.faR_x=-.7+.6*q;P.tor_y=-.5+.95*q;P.tor_x=-.2*q}else{const q=1-(k-.6)/.4;P.uaR_x=.5*q;P.tor_y=.45*q}}
  if(a.k==='chop'){const q=k<.45?k/.45:1-(k-.45)/.55;const down=k>=.45;P.uaL_x=P.uaR_x=down?-2.8+3.6*(1-q):-2.8*q;P.faL_x=P.faR_x=-.3;P.uaL_z=.25;P.uaR_z=-.15;P.tor_x=down?.35*(1-q):-.15*q;P.tor_y=-.4}
  if(a.k==='throw'){const q=Math.sin(k*Math.PI);P.uaR_x=-2.6*q+ (k>.5?1.2*(k-.5):0);P.tor_y=-.4*q}
  if(a.k==='hurt'){const q=Math.sin(k*Math.PI);P.tor_x=.45*q;P.hd_x=.3*q;P.uaL_x=P.uaR_x=.4*q}
  if(a.k==='gather'){const q=Math.sin(k*Math.PI);P.tor_x=.8*q;P.pel_y-=.25*q;P.uaR_x=P.uaL_x=-1.2*q;P.thL_x=-.5*q;P.shL_x=.9*q}
  if(a.k==='eat'){const q=Math.sin(k*Math.PI);P.uaR_x=-2.2*q;P.faR_x=-1.6*q;P.hd_x=-.25*q}
  if(a.t>=a.d)h.act=null}
function animHuman(h,st,sp,dt){const r=h.rig;if(!r)return;h._dt=dt;const P=poseFor(h,st,sp,dt);actOverlay(h,P);const c=h.cur,k=Math.min(1,dt*14);
  for(const key of J){c[key]=c[key]==null?P[key]:c[key]+(P[key]-c[key])*k}
  r.pel.position.y=c.pel_y+(r.pelOff||0);r.pel.rotation.x=c.pel_x;r.tor.rotation.x=c.tor_x;r.tor.rotation.y=c.tor_y;r.hd.rotation.x=c.hd_x;
  r.uaL.rotation.x=c.uaL_x;r.uaL.rotation.z=c.uaL_z-(r.zL||0);r.faL.rotation.x=c.faL_x;r.uaR.rotation.x=c.uaR_x;r.uaR.rotation.z=c.uaR_z-(r.zR||0);r.faR.rotation.x=c.faR_x;
  r.thL.rotation.x=c.thL_x;r.shL.rotation.x=c.shL_x;r.thR.rotation.x=c.thR_x;r.shR.rotation.x=c.shR_x;r.body.rotation.x=c.body_x;r.body.position.y=c.body_y;
  if(r.skirt){r.skirt.rotation.x=-(c.thL_x+c.thR_x)*.25;r.skirt.scale.z=1+Math.abs(c.thL_x-c.thR_x)*.25}}
function play(h,k,d){h.act={k,t:0,d}}

/* ---------- 野兽 ---------- */
const BEASTS={
  boar:{name:'野猪',hp:70,dmg:12,speed:5.2,r:.7,body:'#6a4630',belly:'#7e5a42',size:[.55,.5,1],head:.32,leg:.38,tusk:1,meat:2,hide:1,aggro:9,day:1},
  wolf:{name:'灵狼',hp:55,dmg:10,speed:6.6,r:.6,body:'#7078d8',belly:'#a8b0f0',glow:1,size:[.42,.42,.95],head:.28,leg:.5,ears:1,meat:1,hide:1,aggro:16,night:1},
  deer:{name:'灵鹿',hp:26,dmg:0,speed:7.2,r:.6,body:'#a8784a',belly:'#e8d2b0',size:[.42,.45,.9],head:.24,leg:.7,antler:1,meat:3,hide:1,flee:1,day:1},
  rabbit:{name:'灵兔',hp:10,dmg:0,speed:6.5,r:.3,body:'#b8a08a',belly:'#f0e6d8',size:[.2,.2,.3],head:.13,leg:.14,ears:2,meat:1,hide:0,flee:1,day:1}};
if(CH===2&&REGD.beast)for(const k in REGD.beast){const c=REGD.beast[k];BEASTS[k].body=c[0];BEASTS[k].belly=c[1];if(c[2])BEASTS[k].glowC=c[2]}
if(CH===2){const WN={snow:'雪原白狼',desert:'沙漠狼',volcano:'熔岩狼',swamp:'沼泽狼',city:'机械狼',sky:'天狼'}[REGD.terr];if(WN)BEASTS.wolf.name=WN}
function makeBeast(kind){if(GROKM[kind]){const g=grokBeast(kind);if(g)return g}const B_=BEASTS[kind],root=new THREE.Group(),body=new THREE.Group();root.add(body);const [w,hh,l]=B_.size,L=B_.leg;
  const torso=new THREE.Mesh(new THREE.SphereGeometry(1,18,12),sm(B_.body));torso.scale.set(w,hh,l);torso.position.y=L+hh*.6;torso.castShadow=true;body.add(torso);
  const bel=new THREE.Mesh(new THREE.SphereGeometry(1,14,10),sm(B_.belly));bel.scale.set(w*.85,hh*.6,l*.8);bel.position.y=L+hh*.35;body.add(bel);
  const hp=piv(body,0,L+hh*.9,l*.85);const head=new THREE.Mesh(new THREE.SphereGeometry(B_.head,16,12),sm(B_.body));head.scale.set(1,.95,1.3);head.castShadow=true;hp.add(head);
  const snout=new THREE.Mesh(new THREE.SphereGeometry(B_.head*.55,12,10),sm(kind==='boar'?'#8a6a5a':B_.body));snout.scale.set(1,.85,1.4);snout.position.set(0,-B_.head*.2,B_.head*1.05);hp.add(snout);
  for(const sx of[-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(B_.head*.12,8,6),sm('#111'));e.position.set(sx*B_.head*.55,B_.head*.25,B_.head*.8);hp.add(e)}
  if(B_.tusk)for(const sx of[-1,1]){const t=new THREE.Mesh(new THREE.ConeGeometry(.03,.16,6),sm('#f2ead8'));t.position.set(sx*.1,-.08,B_.head*1.4);t.rotation.x=-.6;hp.add(t)}
  if(B_.ears)for(const sx of[-1,1]){const e=new THREE.Mesh(new THREE.ConeGeometry(B_.head*.3,B_.head*(B_.ears===2?1.6:.8),8),sm(B_.body));e.position.set(sx*B_.head*.45,B_.head*.95,-B_.head*.1);e.rotation.z=-sx*.25;hp.add(e)}
  if(B_.antler)for(const sx of[-1,1]){const a=new THREE.Mesh(new THREE.CylinderGeometry(.02,.03,.5,6),sm('#d8c8a8'));a.position.set(sx*.12,.35,0);a.rotation.z=-sx*.5;hp.add(a);const b=a.clone();b.scale.set(.7,.6,.7);b.position.set(sx*.25,.55,.05);b.rotation.z=sx*.4;hp.add(b)}
  const tail=new THREE.Mesh(new THREE.SphereGeometry(w*.25,8,6),sm(B_.belly));tail.position.set(0,L+hh*.8,-l*.95);body.add(tail);
  const legs=[];for(const [x,z] of[[-1,1],[1,1],[-1,-1],[1,-1]]){const lp=piv(body,x*w*.55,L+hh*.2,z*l*.6);const lg=new THREE.Mesh(new THREE.CapsuleGeometry(w*.16,L*.8,4,8),sm(B_.body));lg.position.y=-L*.55;lg.castShadow=true;lp.add(lg);legs.push(lp)}
  if(B_.glow){const gm=new THREE.MeshStandardMaterial({color:B_.body,emissive:B_.glowC||'#4030c0',emissiveIntensity:B_.glowC?.9:.55,roughness:.6}),eye=new THREE.MeshBasicMaterial({color:'#7ff0ff'});root.traverse(m=>{if(!m.isMesh)return;if(m.material===sm(B_.body))m.material=gm;else if(m.material===sm('#111'))m.material=eye})}
  if(kind==='boar'){for(let i=0;i<7;i++){const br=new THREE.Mesh(new THREE.ConeGeometry(.07,.22,5),sm('#4a3020'));br.position.set(0,L+hh*1.35,l*(.5-i*.15));br.rotation.x=-.3;body.add(br)}}
  root.beast={kind,legs,hp,body,torso};root.phase=0;return root}
function animBeast(b,sp,dt,st){const r=b.beast;b.phase+=dt*(sp>.1?sp*2.2:1.2);const a=sp>.1?Math.sin(b.phase)*.7:0;
  r.legs.forEach((l,i)=>l.rotation.x=(i===0||i===3)?a:-a);r.body.position.y=sp>.1?Math.abs(Math.sin(b.phase))*.06:0;r.hp.rotation.x=sp>.1?Math.sin(b.phase*2)*.08:Math.sin(b.phase*.4)*.12-(st==='graze'?.5:0);
  if(b.act){b.act.t+=dt;const k=Math.min(1,b.act.t/b.act.d);if(b.act.k==='bite'){r.body.rotation.x=-Math.sin(k*Math.PI)*.3;r.hp.rotation.x=Math.sin(k*Math.PI)*.6}if(b.act.k==='hurt')r.body.rotation.z=Math.sin(k*Math.PI)*.35;if(b.act.t>=b.act.d){b.act=null;r.body.rotation.set(0,0,0)}}
  if(st==='dead'){r.body.rotation.z=lerp(r.body.rotation.z,Math.PI/2,Math.min(1,dt*6));r.body.position.y=lerp(r.body.position.y,-.1,Math.min(1,dt*6))}}


/* ---------- Grok 生成的模型：敌兵、首领、狼、野猪 ---------- */
const GROKM={};
const GROK_KEYS=['viking','boy','xianxia','wolf','boar','youhun','deer','rabbit','merchant'];
async function grokPreload(){await Promise.all(GROK_KEYS.map(async k=>{if(GROKM[k])return;try{const r=await fetch('assets/models/'+k+'.glb');if(!r.ok)throw new Error(r.status);GROKM[k]=await parseGLB(await r.arrayBuffer())}catch(e){console.warn('grok',k,e)}}))}
function grokHuman(k,scale=1){const gl=GROKM[k];if(!gl)return null;const w=glbWrap(gl,false,true);w.scale.setScalar(scale);w.grok=k;return w}
const GB_MAT={};
function grokBeast(kind){const gl=GROKM[kind];if(!gl)return null;const B_=BEASTS[kind],src=gl.scene.clone(true);
  if(!GB_MAT[kind]){GB_MAT[kind]=new Map();src.traverse(m=>{if(m.isMesh&&!GB_MAT[kind].has(m.material)){const nm=m.material.clone();if(/fur/i.test(nm.name||'')||m.name==='WolfBody'||m.name==='BoarBody'){if(CH===2&&REGD.beast&&REGD.beast[kind])nm.color.set(REGD.beast[kind][0]).lerp(new THREE.Color('#ffffff'),.35);if(B_.glow||B_.glowC){nm.emissive=new THREE.Color(B_.glowC||'#4030c0');nm.emissiveIntensity=B_.glowC?.55:.3}}GB_MAT[kind].set(m.material,nm)}})}
  const root=new THREE.Group(),body=new THREE.Group();root.add(body);const meshes=[];src.updateMatrixWorld(true);src.traverse(m=>{if(m.isMesh)meshes.push(m)});
  const hp=new THREE.Group();body.add(hp);const legs=[];const legMeshes=meshes.filter(m=>/^Leg/.test(m.name)),hoofs=meshes.filter(m=>/^Hoof/.test(m.name));
  const bb=m=>new THREE.Box3().setFromObject(m);
  for(const m of meshes){m.material=GB_MAT[kind].get(m.material)||m.material;m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false}
  for(const lm of legMeshes){const b=bb(lm),c=b.getCenter(new THREE.Vector3());const pv=new THREE.Group();pv.position.set(c.x,b.max.y,c.z);body.add(pv);lm.position.sub(pv.position);pv.add(lm);
    for(const h of hoofs){const hc=bb(h).getCenter(new THREE.Vector3());if(Math.abs(hc.x-c.x)<.12&&Math.abs(hc.z-c.z)<.12&&!h.parent.isGroup2){h.position.sub(pv.position);pv.add(h);h.parent.isGroup2=1}}
    legs.push({pv,c})}
  legs.sort((a,b)=>(b.c.z-a.c.z)||(a.c.x-b.c.x));
  const headM=meshes.filter(m=>/Head|Nose|Ears|Eyes|Tusks/.test(m.name));let neck=null;
  if(headM.length){const hb=new THREE.Box3();for(const m of headM)hb.union(bb(m));neck=new THREE.Vector3((hb.min.x+hb.max.x)/2,(hb.min.y+hb.max.y)/2,hb.min.z);hp.position.copy(neck);for(const m of headM){m.position.sub(neck);hp.add(m)}}
  for(const m of meshes)if(!m.parent||m.parent===src||m.parent.type==='Scene'||m.parent===gl.scene){if(m.parent!==hp&&!legs.some(l=>l.pv===m.parent))body.add(m)}
  const torso=meshes.find(m=>/Body/.test(m.name))||meshes[0];
  root.beast={kind,legs:legs.map(l=>l.pv),hp,body,torso};root.phase=0;root.grok=kind;return root}
/* ---------- Tripo 模型导入（GLB / GLTF 二进制） ---------- */
const CLIP_RE={idle:/idle|stand|breath|待机/i,walk:/walk|走/i,run:/run|sprint|jog|跑/i,jump:/jump|跳/i,swim:/swim|游/i,glide:/glid|fly|fall|air|飞|滑/i,attack:/attack|slash|punch|hit|swing|sword|strike|攻|砍/i,sit:/sit|坐/i,sleep:/sleep|lie|睡|躺/i,dead:/death|die|dead|死/i};
const gltfLoader=new GLTFLoader();
function idb(){return new Promise((res,rej)=>{const r=indexedDB.open('tingdao5',1);r.onupgradeneeded=()=>r.result.createObjectStore('f');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function idbSet(k,v){try{const d=await idb();await new Promise((res,rej)=>{const t=d.transaction('f','readwrite');t.objectStore('f').put(v,k);t.oncomplete=res;t.onerror=()=>rej(t.error)})}catch(e){}}
async function idbGet(k){try{const d=await idb();return await new Promise(res=>{const t=d.transaction('f','readonly').objectStore('f').get(k);t.onsuccess=()=>res(t.result);t.onerror=()=>res(null)})}catch(e){return null}}
// 自动绑骨：根据 T/A 字形人物的身体比例，给每个顶点分配骨骼权重（输入坐标已归一化：脚底 y=0，身高 1，左右居中）
function rigLayout(P){ // P: Float32Array xyz（归一化）
  const n=P.length/3;let hL=null,hR=null,lx=[0,0],ln=[0,0];
  for(let i=0;i<n;i++){const x=P[i*3],y=P[i*3+1],z=P[i*3+2];
    if(y>.45){if(x<0&&(!hL||x<hL[0]))hL=[x,y,z];if(x>0&&(!hR||x>hR[0]))hR=[x,y,z]}
    if(y<.08){const s=x<0?0:1;lx[s]+=x;ln[s]++}}
  const L={hip:.47,knee:.25,waist:.55,neck:.84,sY:.775,sX:.1,legL:ln[0]?lx[0]/ln[0]:-.06,legR:ln[1]?lx[1]/ln[1]:.06};
  L.handL=hL||[-.3,.6,0];L.handR=hR||[.3,.6,0];
  // 双手自然下垂的模型（混元等常见）：肩膀高度两侧没有手臂。这时按「手垂在身体两侧」绑骨，
  // 否则会把袖子、手里的剑当成伸出去的手，做动作时把衣服甩成尖刺
  {let side=0,band=0;for(let i=0;i<n;i++){const y=P[i*3+1];if(y>.6&&y<.8){band++;if(Math.abs(P[i*3])>.27)side++}}
   L.down=band>0&&side/band<.01;if(L.down){L.handL=[-.17,.47,0];L.handR=[.17,.47,0]}}
  // 手太低（双手下垂）时肩膀到手的方向接近竖直，也能工作
  return L}
const RIG_BONES=['body','pel','tor','hd','uaL','faL','handL','uaR','faR','handR','thL','shL','thR','shR'];
function rigWeights(P,L){const n=P.length/3,si=new Uint16Array(n*4),sw=new Float32Array(n*4);
  const sm=(a,b,v)=>{const t=Math.min(1,Math.max(0,(v-a)/(b-a)));return t*t*(3-2*t)};
  const arm=(x,y,side)=>{const S=[side*L.sX,L.sY],T=side<0?L.handL:L.handR;const ax=T[0]-S[0],ay=T[1]-S[1],l2=ax*ax+ay*ay;
    const rx=x-S[0],ry=y-S[1];const t=(rx*ax+ry*ay)/l2;const d=Math.abs(rx*ay-ry*ax)/Math.sqrt(l2);
    if(t<=0||y<L.hip||Math.abs(x)<L.sX*.85)return null;const a=sm(.02,.14,t)*(d<.07?1:d<.1?1-(d-.07)/.03:0);if(a<=0)return null;
    const e=sm(.4,.6,t),h=sm(.86,.96,t);return{a,ua:a*(1-e),fa:a*e*(1-h),hand:a*e*h}};
  for(let i=0;i<n;i++){const x=P[i*3],y=P[i*3+1];const w=new Float32Array(14);
    const wTor=sm(L.waist-.03,L.waist+.04,y),wHead=sm(L.neck-.025,L.neck+.02,y);
    const legW=1-sm(L.hip-.15,L.hip+.01,y);const sL=1-sm(-.03,.03,x);const kw=sm(L.knee-.03,L.knee+.03,y);
    const c=1-legW;w[1]=c*(1-wTor);w[2]=c*wTor*(1-wHead);w[3]=c*wTor*wHead;
    w[10]=legW*sL*kw;w[11]=legW*sL*(1-kw);w[12]=legW*(1-sL)*kw;w[13]=legW*(1-sL)*(1-kw);
    const A=arm(x,y,x<0?-1:1);if(A){for(let k=0;k<14;k++)w[k]*=1-A.a;const o=x<0?4:7;w[o]+=A.ua;w[o+1]+=A.fa;w[o+2]+=A.hand}
    const idx=[...w.keys()].sort((a,b)=>w[b]-w[a]).slice(0,4);let s=0;for(const k of idx)s+=w[k];
    idx.forEach((k,j)=>{si[i*4+j]=k;sw[i*4+j]=s>0?w[k]/s:(j?0:1)})}
  return{si,sw}}
function shrinkTex(m){const lim=isTouch?512:1024;for(const k of['map','normalMap','roughnessMap','metalnessMap','aoMap','emissiveMap']){const t=m[k];if(!t||!t.image)continue;const im=t.image,w=im.width||0;if(w<=lim)continue;
  const c=document.createElement('canvas');c.width=c.height=lim;c.getContext('2d').drawImage(im,0,0,lim,lim);t.image=c;t.needsUpdate=true}}
// 没有骨骼和动作的静态模型：自动绑上 14 根骨骼，然后用内置的程序动作驱动（走、跑、跳、游泳、滑翔、攻击、坐、睡）
function autoRigHero(model,flip){model.updateMatrixWorld(true);const meshes=[];model.traverse(o=>{if(o.isMesh)meshes.push(o)});
  const geos=meshes.map(m=>{const g=m.geometry.clone();for(const k of Object.keys(g.attributes)){const at=g.attributes[k];if(!['position','normal','uv'].includes(k)){g.deleteAttribute(k);continue}if(at.isInterleavedBufferAttribute)g.setAttribute(k,at.clone())}g.applyMatrix4(m.matrixWorld);return g});
  const box=new THREE.Box3();geos.forEach(g=>{g.computeBoundingBox();box.union(g.boundingBox)});const K=1.8,S=K/Math.max(.001,box.max.y-box.min.y);
  const nm=new THREE.Matrix4().makeScale(S,S,S).multiply(new THREE.Matrix4().makeTranslation(-(box.min.x+box.max.x)/2,-box.min.y,-(box.min.z+box.max.z)/2));if(flip)nm.premultiply(new THREE.Matrix4().makeRotationY(Math.PI));
  geos.forEach(g=>g.applyMatrix4(nm));let tot=0;geos.forEach(g=>tot+=g.attributes.position.array.length);const PA=new Float32Array(tot);{let o=0;geos.forEach(g=>{const a=g.attributes.position.array;for(let i=0;i<a.length;i++)PA[o++]=a[i]/K})}
  const L=rigLayout(PA);const abs={body:[0,0,0],pel:[0,L.hip,0],tor:[0,L.waist,0],hd:[0,L.neck,0],thL:[L.legL,L.hip,0],shL:[L.legL,L.knee,0],thR:[L.legR,L.hip,0],shR:[L.legR,L.knee,0]};
  for(const [s,T,n] of[[-1,L.handL,'L'],[1,L.handR,'R']]){const Sx=s*L.sX,Sy=L.sY;abs['ua'+n]=[Sx,Sy,0];abs['fa'+n]=[Sx+(T[0]-Sx)*.5,Sy+(T[1]-Sy)*.5,0];abs['hand'+n]=[Sx+(T[0]-Sx)*.92,Sy+(T[1]-Sy)*.92,0]}
  const par={pel:'body',tor:'pel',hd:'tor',uaL:'tor',faL:'uaL',handL:'faL',uaR:'tor',faR:'uaR',handR:'faR',thL:'pel',shL:'thL',thR:'pel',shR:'thR'};const B={};
  for(const n of RIG_BONES){const b=new THREE.Bone();b.name=n;const a=abs[n],p=par[n]?abs[par[n]]:[0,0,0];b.position.set((a[0]-p[0])*K,(a[1]-p[1])*K,(a[2]-p[2])*K);if(par[n])B[par[n]].add(b);B[n]=b}
  const root=new THREE.Group();root.add(B.body);root.updateMatrixWorld(true);const skel=new THREE.Skeleton(RIG_BONES.map(n=>B[n]));let off=0;
  geos.forEach((g,gi)=>{const n=g.attributes.position.count;const {si,sw}=rigWeights(PA.subarray(off*3,(off+n)*3),L);off+=n;g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(si,4));g.setAttribute('skinWeight',new THREE.Float32BufferAttribute(sw,4));
    const mt=meshes[gi].material;(Array.isArray(mt)?mt:[mt]).forEach(shrinkTex);const sm_=new THREE.SkinnedMesh(g,mt);sm_.castShadow=true;sm_.receiveShadow=true;sm_.frustumCulled=false;root.add(sm_);sm_.bind(skel)});
  const ang=(T,s)=>{const dx=T[0]-s*L.sX,dy=T[1]-L.sY;return Math.atan2(dx,-dy)};
  const wrap=new THREE.Group();wrap.add(root);wrap.rig={body:B.body,pel:B.pel,tor:B.tor,hd:B.hd,uaL:B.uaL,faL:B.faL,uaR:B.uaR,faR:B.faR,thL:B.thL,shL:B.shL,thR:B.thR,shR:B.shR,hand:B.handR,back:B.tor,skirt:null,zL:ang(L.handL,-1),zR:ang(L.handR,1),pelOff:L.hip*K-.95};
  wrap.cur={};wrap.phase=0;wrap.auto=true;return wrap}
// 把 GLB 里的贴图改成 data: 地址，并让加载器用 <img> 读图（网页版的安全限制不允许它默认的 blob 读取方式，否则人物会变成黑影）
function inlineImages(buf){try{const dv=new DataView(buf);if(dv.getUint32(0,true)!==0x46546C67)return buf;const jl=dv.getUint32(12,true);const js=JSON.parse(new TextDecoder().decode(new Uint8Array(buf,20,jl)));const bo=20+jl;const bl=dv.getUint32(bo,true);const bin=new Uint8Array(buf,bo+8,bl);
  if(!js.images)return buf;for(const im of js.images){if(im.bufferView==null)continue;const v=js.bufferViews[im.bufferView];const st=v.byteOffset||0;const u=bin.subarray(st,st+v.byteLength);let s='';for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));im.uri='data:'+(im.mimeType||'image/png')+';base64,'+btoa(s);delete im.bufferView;delete im.mimeType}
  const jb=new TextEncoder().encode(JSON.stringify(js)),J=new Uint8Array(Math.ceil(jb.length/4)*4).fill(32);J.set(jb);
  const out=new Uint8Array(20+J.length+8+bl),o=new DataView(out.buffer);o.setUint32(0,0x46546C67,true);o.setUint32(4,2,true);o.setUint32(8,out.length,true);o.setUint32(12,J.length,true);o.setUint32(16,0x4E4F534A,true);out.set(J,20);
  const b2=20+J.length;o.setUint32(b2,bl,true);o.setUint32(b2+4,0x004E4942,true);out.set(bin,b2+8);return out.buffer}catch(e){return buf}}
function parseGLB(buf){buf=inlineImages(buf);return new Promise((res,rej)=>{const cib=window.createImageBitmap;try{window.createImageBitmap=undefined}catch(e){}try{gltfLoader.parse(buf,'',res,rej)}catch(e){rej(e)}finally{try{window.createImageBitmap=cib}catch(e){}}})}
async function buildGLBHero(buf,flip){
  const gl=await parseGLB(buf);return glbWrap(gl,flip)}
function glbWrap(gl,flip,clone){const model=clone?SkeletonUtils.clone(gl.scene):gl.scene;let skinned=false;model.traverse(o=>{if(o.isSkinnedMesh)skinned=true});if(!gl.animations.length&&!skinned)return autoRigHero(model,flip);model.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false}});
  const skBox=()=>{model.updateMatrixWorld(true);const bx=new THREE.Box3();let any=false;model.traverse(m=>{if(m.isSkinnedMesh){m.skeleton.update();m.computeBoundingBox();const bb=m.boundingBox.clone().applyMatrix4(m.matrixWorld);bx.union(bb);any=true}});return any?bx:new THREE.Box3().setFromObject(model)};
  const box=skBox(),size=box.getSize(new THREE.Vector3());const sc=1.75/Math.max(.01,size.y);
  const wrap=new THREE.Group(),inner=new THREE.Group();inner.add(model);model.scale.setScalar(sc);const b2=skBox();model.position.y-=b2.min.y;
  const c=b2.getCenter(new THREE.Vector3());model.position.x-=c.x;model.position.z-=c.z;inner.rotation.y=flip?Math.PI:0;wrap.add(inner);
  const mixer=new THREE.AnimationMixer(model),acts={};const names=gl.animations.map(a=>a.name);
  for(const key in CLIP_RE){const clip=gl.animations.find(a=>CLIP_RE[key].test(a.name));if(clip)acts[key]=mixer.clipAction(clip)}
  if(!acts.idle&&gl.animations[0])acts.idle=mixer.clipAction(gl.animations[0]);
  let hand=null;model.traverse(o=>{if(!hand&&o.isBone&&/(right|r_|_r\b|\.r\b|r).*hand|hand.*(right|_r|\.r)/i.test(o.name))hand=o});
  wrap.glb={mixer,acts,names,cur:null,hand,inner};return wrap}
function animGLB(h,st,sp,dt){const g=h.glb;let key=st==='swim'?'swim':st==='glide'?'glide':st==='air'?'jump':st==='sit'?'sit':st==='sleep'||st==='dead'?(st==='dead'?'dead':'sleep'):sp>5.5?'run':sp>.2?'walk':'idle';
  if(h.act&&(h.act.k==='swing'||h.act.k==='chop'||h.act.k==='throw')){key='attack';h.act.t+=dt;if(h.act.t>=h.act.d)h.act=null}else if(h.act){h.act.t+=dt;if(h.act.t>=h.act.d)h.act=null}
  const fb={run:['walk','idle'],walk:['idle'],jump:['idle'],swim:['walk','idle'],glide:['jump','idle'],attack:['idle'],sit:['idle'],sleep:['idle'],dead:['sleep','idle']};
  let a=g.acts[key];if(!a)for(const k of fb[key]||[])if(g.acts[k]){a=g.acts[k];break}
  if(a&&g.cur!==a){a.reset().fadeIn(.2).play();if(g.cur)g.cur.fadeOut(.2);g.cur=a}
  if(a===g.acts.walk&&key==='walk')a.timeScale=clamp(sp/3.5,.6,1.4);if(a===g.acts.run)a.timeScale=clamp(sp/7,.8,1.3);
  g.mixer.update(dt);
  if(g.inner){const ty=(key==='sit'&&g.acts.sit)?-.42:0;g.inner.position.y+=(ty-g.inner.position.y)*Math.min(1,dt*6)}
  // 没有游泳/睡觉动画时，用整体姿态补一下
  g.inner.rotation.x=(st==='swim'&&!g.acts.swim)?1.2:(st==='sleep'||st==='dead')&&!g.acts.sleep&&!g.acts.dead?-1.5:0;g.inner.position.y=st==='swim'&&!g.acts.swim?.2:(st==='sleep'||st==='dead')?.25:0}
