
/* =====================================================================
   五、界面与操作：摇杆、按钮、键鼠、HUD、小地图、制造/交易/九洲图/设置、主循环
   ===================================================================== */
const el=id=>document.getElementById(id);
let toastT=0;ui.toast=(t,long)=>{const e=el('toast');e.textContent=t;e.classList.add('on');toastT=long?4.5:2.6};
const BARS=['hp','hunger','sta','mana'];
ui.refresh=()=>{el('wpn').textContent=WEAPONS[G.weapon].n};
ui.bossBar=a=>{const b=el('boss');if(!a){b.style.display='none';return}b.style.display='block';el('bossN').textContent=a.name;el('bossF').style.width=(a.hp/a.maxhp*100)+'%'};
function panel(id,on){el(id).classList.toggle('on',on);G.paused=['craft','trade','map9','set','bigmap','stat','pets','route','ach'].some(k=>el(k).classList.contains('on'))}
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>panel(b.dataset.close,false));

/* ---------- 开始界面 ---------- */
const sv0=loadSave();const slot=f=>{try{return JSON.parse(localStorage.getItem(SAVE_KEY+'_'+f)||'null')}catch(e){return null}};
try{if(sv0&&sv0.faction&&!slot(sv0.faction))localStorage.setItem(SAVE_KEY+'_'+sv0.faction,JSON.stringify(sv0))}catch(e){}
let pickF=sv0&&sv0.faction||'A',pickO=sv0&&sv0.origin||'云',newArm=false;
function drawStart(){document.querySelectorAll('.fac').forEach(c=>c.classList.toggle('sel',c.dataset.f===pickF));
  el('origins').innerHTML=Object.entries(ORIGINS[pickF]).map(([k,n])=>`<button class="org ${k===pickO?'sel':''}" data-o="${k}"><b>${n}</b><small>${ORIGIN_BONUS[k]}</small></button>`).join('');
  el('origins').querySelectorAll('.org').forEach(b=>b.onclick=()=>{pickO=b.dataset.o;drawStart()});
  const s=slot(pickF);el('cont').style.display=s?'':'none';if(s)el('cont').textContent='继续'+FACTION[pickF].n+'（第 '+s.day+' 天'+(s.reg&&s.reg!=='mid'?' · '+regName(s.reg):'')+'）';
  newArm=false;el('newg').textContent=s?'新游戏（'+FACTION[pickF].n+'）':'新游戏'}
document.querySelectorAll('.fac').forEach(c=>c.onclick=()=>{pickF=c.dataset.f;if(!(ORIGINS[pickF]||{})[pickO])pickO=Object.keys(ORIGINS[pickF])[0];drawStart()});drawStart();
function landLock(){try{if(matchMedia('(pointer:coarse)').matches){const d=document.documentElement,f=d.requestFullscreen||d.webkitRequestFullscreen;const lk=()=>{try{screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{})}catch(e){}};if(f&&!document.fullscreenElement&&!matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches){const r=f.call(d);r&&r.then?r.then(lk,()=>{}):lk()}else lk()}}catch(e){}}
async function go(sv){landLock();el('start').style.display='none';const L=el('loading');L.style.display='';el('ltxt').textContent='正在载入人物和怪物模型…';el('lbar').style.display='none';el('lmsg').textContent='';
  el('hud').style.display='';try{await startGame(sv?sv.faction:pickF,sv?sv.origin:pickO,sv)}finally{L.style.display='none'}if(!sv&&CH!==2)try{startPrologue()}catch(e){console.warn('prologue',e)}if(G.faction!=='A')el('manaRow').firstChild.textContent='能量';
  el('skillB').textContent=G.faction==='A'?'火符':'射击';}
el('newg').onclick=()=>{if(slot(pickF)&&!newArm){newArm=true;el('newg').textContent='再点一次：覆盖'+FACTION[pickF].n+'的旧存档开新局';return}
  try{localStorage.removeItem(SAVE_KEY+'_'+pickF)}catch(e){}
  if(CH===2){try{localStorage.removeItem(SAVE_KEY);sessionStorage.setItem('td5_new',pickF+'|'+pickO)}catch(e){}location.reload();return}go(null)};
try{const nw=sessionStorage.getItem('td5_new');if(nw){sessionStorage.removeItem('td5_new');const q=nw.split('|');pickF=q[0];pickO=q[1];drawStart();setTimeout(()=>go(null),50)}}catch(e){}
el('cont').onclick=()=>{const s=slot(pickF);if(!s)return;if(sv0&&sv0.faction===pickF){go(sv0);return}
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(s));sessionStorage.setItem('td5_auto','1')}catch(e){}location.reload()};
el('next').onclick=()=>startChapter2();
try{if(sessionStorage.getItem('td5_auto')&&sv0){sessionStorage.removeItem('td5_auto');setTimeout(()=>go(sv0),50)}}catch(e){}
el('m9s').onclick=()=>{draw9();el('map9').classList.add('on')};

/* ---------- 摇杆与视角（触屏） ---------- */
const joy={id:null,ox:0,oy:0},look={id:null,x:0,y:0};const JR=55;
const jb=el('joy'),jk=el('knob');
function setJoy(x,y){let dx=x-joy.ox,dy=y-joy.oy;const l=Math.hypot(dx,dy);if(l>JR){dx=dx/l*JR;dy=dy/l*JR}jk.style.transform=`translate(${dx}px,${dy}px)`;IN.mx=dx/JR;IN.mz=-dy/JR;IN.run=l>JR*.92||runLock}
let runLock=false;
const cv=renderer.domElement;
cv.addEventListener('touchstart',e=>{for(const t of e.changedTouches){if(t.clientX<innerWidth*.45&&joy.id===null){joy.id=t.identifier;joy.ox=t.clientX;joy.oy=t.clientY;jb.style.left=(t.clientX-70)+'px';jb.style.top=(t.clientY-70)+'px';jb.classList.add('on');setJoy(t.clientX,t.clientY)}
  else if(look.id===null){look.id=t.identifier;look.x=t.clientX;look.y=t.clientY}}e.preventDefault()},{passive:false});
cv.addEventListener('touchmove',e=>{for(const t of e.changedTouches){if(t.identifier===joy.id)setJoy(t.clientX,t.clientY);if(t.identifier===look.id){CAM.yaw-=(t.clientX-look.x)*.008;CAM.pitch=clamp(CAM.pitch+(t.clientY-look.y)*.005,-.15,1.2);look.x=t.clientX;look.y=t.clientY}}e.preventDefault()},{passive:false});
const tend=e=>{for(const t of e.changedTouches){if(t.identifier===joy.id){joy.id=null;IN.mx=IN.mz=0;IN.run=false;jb.classList.remove('on');jk.style.transform=''}if(t.identifier===look.id)look.id=null}};
cv.addEventListener('touchend',tend);cv.addEventListener('touchcancel',tend);
/* 鼠标：拖动转视角，单击攻击，滚轮缩放 */
let md=null;cv.addEventListener('mousedown',e=>{md={x:e.clientX,y:e.clientY,m:0,b:e.button}});
addEventListener('mousemove',e=>{if(!md)return;const dx=e.clientX-md.x,dy=e.clientY-md.y;md.m+=Math.abs(dx)+Math.abs(dy);CAM.yaw-=dx*.006;CAM.pitch=clamp(CAM.pitch+dy*.004,-.15,1.2);md.x=e.clientX;md.y=e.clientY});
addEventListener('mouseup',e=>{if(md&&md.m<6&&G.started){if(md.b===2)skill();else attack()}md=null});
cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('wheel',e=>{CAM.dist=clamp(CAM.dist+e.deltaY*.006,3.5,14)},{passive:true});
/* 按钮 */
function tap(id,down,up){const b=el(id);const d=e=>{e.preventDefault();e.stopPropagation();b.classList.add('dn');down&&down()};const u=e=>{e.preventDefault();b.classList.remove('dn');up&&up()};
  b.addEventListener('touchstart',d,{passive:false});b.addEventListener('touchend',u,{passive:false});b.addEventListener('touchcancel',u);b.addEventListener('mousedown',d);b.addEventListener('mouseup',u);b.addEventListener('mouseleave',e=>{if(b.classList.contains('dn'))u(e)})}
let atkHold=false;
tap('atkB',()=>{atkHold=true;attack()},()=>atkHold=false);
tap('jumpB',()=>{IN.jump=true;IN.jumpHeld=true},()=>IN.jumpHeld=false);
tap('actB',()=>{const t=findInteract();if(t&&!busy())t.fn();else if(!t)actEat()});tap('dodgeB',()=>dodge());tap('achB',()=>{drawAch();panel('ach',true)});
tap('skillB',()=>skill());tap('eatB',()=>eat());tap('wpnB',()=>nextWeapon());
tap('runB',()=>{runLock=!runLock;el('runB').classList.toggle('lit',runLock);if(joy.id===null)IN.run=runLock});
tap('craftB',()=>{if(GUIDE.tab)craftTab=GUIDE.tab;drawCraft();panel('craft',true)});tap('mapB',()=>{draw9();panel('map9',true)});tap('setB',()=>{drawSet();panel('set',true)});
/* 键盘 */
const K={};addEventListener('keydown',e=>{if(e.repeat&&e.code!=='Space')return;K[e.code]=true;if(!G.started)return;
  if(e.code==='Space'){IN.jump=!e.repeat;IN.jumpHeld=true;e.preventDefault()}
  if(e.code==='KeyE'){const t=findInteract();if(t&&!busy())t.fn();else if(!t)actEat()}if(e.code==='KeyV'||e.code==='ControlLeft'){e.preventDefault();dodge()}if(e.code==='KeyJ'){const on=!el('ach').classList.contains('on');if(on)drawAch();panel('ach',on)}if(e.code==='KeyF')attack();if(e.code==='KeyR')skill();if(e.code==='KeyQ')eat();
  if(e.code==='KeyC'||e.code==='Tab'){e.preventDefault();const on=!el('craft').classList.contains('on');if(on)drawCraft();panel('craft',on)}
  if(e.code==='KeyN'){setMM(!el('mmw').classList.contains('nomap'))}
  if(e.code==='KeyM'){const on=!el('map9').classList.contains('on');if(on)draw9();panel('map9',on)}
  if(e.code==='KeyP'){const on=!el('stat').classList.contains('on');if(on)drawStat();panel('stat',on)}
  if(e.code==='KeyT')cycleSkill();if(e.code==='KeyG')startMeditate();if(e.code==='KeyH'){const on=!el('pets').classList.contains('on');if(on)drawPets();panel('pets',on)}
  if(e.code==='Escape')['craft','trade','map9','set','bigmap','stat','pets','route','ach'].forEach(k=>panel(k,false));
  const n=['Digit1','Digit2','Digit3','Digit4','Digit5','Digit6'].indexOf(e.code);if(n>=0){const own=WORDER.filter(w=>w==='fist'||G.tools[w]);if(own[n])equip(own[n])}});
addEventListener('keyup',e=>{K[e.code]=false;if(e.code==='Space')IN.jumpHeld=false});
function keyMove(){if(joy.id!==null)return;let x=0,z=0;if(K.KeyW||K.ArrowUp)z+=1;if(K.KeyS||K.ArrowDown)z-=1;if(K.KeyA||K.ArrowLeft)x-=1;if(K.KeyD||K.ArrowRight)x+=1;const l=Math.hypot(x,z)||1;IN.mx=x/l;IN.mz=z/l;IN.run=!!(K.ShiftLeft||K.ShiftRight)||runLock}

/* ---------- 制造 / 交易 / 九洲图 / 设置 ---------- */
let craftTab='tool';
function drawCraft(){const list=RECIPES.filter(r=>(!r.f||r.f===G.faction)&&!(CH===2&&r.id==='boat')&&(craftTab==='build'?r.k==='build':r.k!=='build'));
  el('ctabs').innerHTML=['tool','build'].map(t=>`<button class="${t===craftTab?'sel':''}" data-t="${t}">${t==='tool'?'工具 · 武器 · 药':'建造'}</button>`).join('');
  el('ctabs').querySelectorAll('button').forEach(b=>b.onclick=()=>{craftTab=b.dataset.t;drawCraft()});
  el('clist').innerHTML=list.map(r=>{const own=r.k==='tool'&&G.tools[r.id];const ok=has(r.cost)&&!own;
    return `<div class="rc ${ok?'ok':''} ${GUIDE.rec===r.id?'hl':''}"><div><b>${r.n}</b>${own?' <em>已拥有</em>':''}<small>${r.d}</small><span>${Object.entries(r.cost).map(([k,v])=>`<i class="${(G.inv[k]||0)>=v?'':'no'}">${ITEM[k]} ${G.inv[k]||0}/${v}</i>`).join('')}</span></div><button data-id="${r.id}" ${ok?'':'disabled'}>${r.k==='build'?'建造':'制造'}</button></div>`}).join('');
  el('clist').querySelectorAll('button').forEach(b=>b.onclick=()=>{const r=RECIPES.find(x=>x.id===b.dataset.id);if(r.k==='build'){panel('craft',false);craft(r.id)}else{craft(r.id);drawCraft()}});
  el('cinv').innerHTML=Object.entries(G.inv).filter(([k,v])=>v>0).map(([k,v])=>`<i>${ITEM[k]} ${v}</i>`).join('')||'<i>背包是空的</i>'}
ui.trade=()=>{const draw=()=>{el('tlist').innerHTML=TRADES.filter(t=>!t.f||t.f===G.faction).map((t,i)=>`<div class="rc ${has(t.give)?'ok':''}"><div><b>${t.n}</b><span><i>付 ${fmtCost(t.give)}</i></span></div><button data-i="${TRADES.indexOf(t)}" ${has(t.give)?'':'disabled'}>交易</button></div>`).join('');
  el('tlist').querySelectorAll('button').forEach(b=>b.onclick=()=>{const t=TRADES[+b.dataset.i];if(!has(t.give))return;take(t.give);give(t.get);toast('换到 '+fmtCost(t.get));draw()});
  el('tinv').textContent='你有：灵石 '+(G.inv.ling||0)+'　浆果 '+(G.inv.berry||0)+'　兽皮 '+(G.inv.hide||0)};draw();panel('trade',true)};
function draw9(){const cur=G.started?ORIGINS[G.faction][G.origin]:'';const cell=(n,cls)=>`<div class="zh ${cls} ${n===cur?'me':''}">${n}${n===cur?'<small>故乡</small>':''}</div>`;
  el('nine').innerHTML=`<div class="row">${['上云州','上玄州','上天州','上仙州'].map(n=>cell(n,'up')).join('')}</div><div class="row">${cell('中州','mid')}</div><div class="row">${['下云州','下玄州','下天州','下仙州'].map(n=>cell(n,'down')).join('')}</div>`}
function drawSet(){el('qBtn').textContent='画质：'+qualityLabel(Q.tier)+'（点击切换）';}
el('qBtn').onclick=()=>{const nx={high:'low',low:'min',min:'high'}[Q.tier];try{localStorage.setItem('td5_q',nx)}catch(e){}save();try{if(G.started)sessionStorage.setItem('td5_auto','1')}catch(e){}location.reload()};
el('saveBtn').onclick=()=>{save();toast('已存档')};
function quitGame(){if(!G.dead&&!G.over)save();try{sessionStorage.removeItem('td5_auto');sessionStorage.removeItem('td5_new')}catch(e){}location.reload()}
el('quitBtn').onclick=quitGame;el('quitB').onclick=()=>{if(confirmQuit())quitGame()};
function confirmQuit(){const b=el('quitB');if(b.dataset.sure){return true}b.dataset.sure=1;b.textContent='再点一次退出';setTimeout(()=>{delete b.dataset.sure;b.textContent='存档退出'},2500);return false}
function setMM(h){el('mmw').classList.toggle('nomap',h);el('mmT').textContent=h?'显示地图':'隐藏地图';try{localStorage.setItem('td5_mmh',h?'1':'')}catch(e){}}
el('mmT').onclick=()=>setMM(!el('mmw').classList.contains('nomap'));try{if(localStorage.getItem('td5_mmh'))setMM(true)}catch(e){}
el('glbBtn').onclick=()=>el('glbIn').click();
el('glbIn').onchange=async e=>{const f=e.target.files[0];if(!f)return;el('glbMsg').textContent='正在载入 '+f.name+' …';
  try{const g=await importGLB(f,el('flip').checked);el('glbMsg').innerHTML='载入成功。动作列表：<br>'+(g.names.map(n=>'· '+n).join('<br>')||'（文件里没有动作）')}catch(err){el('glbMsg').textContent='载入失败：'+(err&&err.message||err)+'。请确认是 .glb 文件'}e.target.value=''};
el('glbReset').onclick=async()=>{await resetModel();el('glbMsg').textContent='已换成简单人物'};
el('glbBuiltin').onclick=async()=>{await useBuiltin();el('glbMsg').textContent='修士使用内置的 Tripo 模型（自动绑骨）'};
ui.death=()=>{el('death').classList.add('on')};
el('reload').onclick=()=>{try{sessionStorage.setItem('td5_auto','1')}catch(e){}location.reload()};
ui.end=(t,txt,kind)=>{el('endT').textContent=t;el('endX').innerHTML=txt;el('next').style.display=kind==='escape'&&CH===1?'':'none';later(kind==='escape'?6:1.5,()=>el('end').classList.add('on'))};
el('again').onclick=()=>location.reload();

/* ---------- 人物属性（加点） ---------- */
const ATTR=[['str',()=>'力量',()=>'攻击 +6% / 点'],['vit',()=>'体魄',()=>'生命上限 +12 / 点'],['agi',()=>'身法',()=>'体力上限 +8、移动速度 +2% / 点'],['spi',()=>G.faction==='A'?'灵识':'精准',()=>G.faction==='A'?'灵力上限 +10、火符/雷符伤害 +8% / 点':'弩箭伤害 +8% / 点']];
function drawStat(){el('slv').innerHTML=`<b>${rankName()}</b>　经验 ${Math.floor(G.xp)} / ${needXP(G.lv)}　<em>可分配 ${G.pts} 点</em>`;
  el('slist').innerHTML=ATTR.map(([k,n,d])=>`<div class="rc ${G.pts>0?'ok':''}"><div><b>${n()}　${G.st[k]}</b><small>${d()}</small></div><button data-k="${k}" ${G.pts>0?'':'disabled'}>+1</button></div>`).join('');
  el('slist').querySelectorAll('button').forEach(b=>b.onclick=()=>{if(G.pts<=0)return;G.pts--;G.st[b.dataset.k]++;applyOrigin();G.hp=Math.min(G.maxhp,G.hp+12);G.sta=Math.min(G.maxsta,G.sta);drawStat();save()});
  el('sder').innerHTML=`生命上限 ${G.maxhp}　体力上限 ${G.maxsta}${G.maxmana?'　灵力上限 '+G.maxmana:''}<br>攻击 ×${G.atkMul.toFixed(2)}　技能 ×${G.skillMul.toFixed(2)}　移速 ×${G.spdMul.toFixed(2)}<br><small>每升一级：生命 +6、攻击 +2%、技能 +2%，并获得 2 个属性点</small>`+realmHTML();const tb=el('tribBtn');if(tb)tb.onclick=()=>{panel('stat',false);startTrib()}}
tap('ptsB',()=>{drawStat();panel('stat',true)});
tap('medB',()=>startMeditate());tap('swB',()=>cycleSkill());tap('petB',()=>{drawPets();panel('pets',true)});
/* ---------- 灵兽面板、航线图 ---------- */
function drawPets(){const pen=penOf();el('plist').innerHTML=PETS.length?PETS.map((p,i)=>`<div class="rc ok"><div><b>${p.name}</b>${p.big>1?' <em>强大</em>':''}<small>${({wolf:'战斗强，干活产出 肉、兽皮',boar:'战斗强，干活产出 木头、石头',deer:'跟随时慢慢给你回血，干活产出 灵草、浆果',rabbit:'跟随时会找灵草，干活产出 种子、浆果'})[p.kind]}</small></div>
  <span class="roles">${['follow','work','rest'].map(r=>`<button data-i="${i}" data-r="${r}" class="${p.role===r?'on':''}">${{follow:'跟随',work:'干活',rest:'休息'}[r]}</button>`).join('')}<button data-i="${i}" data-r="free">放生</button></span></div>`).join(''):'<div class="lore">还没有灵兽。做「驭兽符」，把野兽打到三成血以下，靠近按「互动」收服。</div>';
  el('plist').querySelectorAll('button').forEach(b=>b.onclick=()=>{const p=PETS[+b.dataset.i],r=b.dataset.r;if(r==='free'){scene.remove(p.obj);PETS.splice(+b.dataset.i,1);toast('放生了'+p.name)}
    else{if(r==='follow')for(const q of PETS)if(q.role==='follow')q.role=pen?'work':'rest';if(r==='work'&&!pen)toast('先建一个「灵兽栏」，它才有地方干活');p.role=r}drawPets();save()});
  el('pinfo').textContent=pen?'灵兽栏已建好：干活的灵兽每 45 秒产出一次，去灵兽栏按「互动」收取。':'提示：建造「灵兽栏」后，灵兽可以帮你干活。同一时间只能有一只跟随。'}
ui.route=()=>{const r=ROUTE();el('rlist').innerHTML=r.map((k,i)=>{const cur=k===REGK,cl=G.cleared[k],un=regionUnlocked(k);const st=cur?'你在这里':cl?'已平定':un?'可以前往':'未解锁（先击败上一站首领）';
    return `<div class="rc ${un&&!cur?'ok':''}"><div><b>${i+1}. ${regName(k)}</b>${cl?' <em>✓</em>':''}<small>${st}${REGIONS[k].mat?'　特产：'+REGIONS[k].mat:''}${REGIONS[k].perk?'　首领功法：'+PERKS[REGIONS[k].perk].split('：')[0]:''}</small></div>${un&&!cur?`<button data-k="${k}">前往</button>`:''}</div>`}).join('');
  el('rlist').querySelectorAll('button').forEach(b=>b.onclick=()=>{panel('route',false);toast('扬帆起航，前往'+regName(b.dataset.k)+'……',1);save();setTimeout(()=>travel(b.dataset.k),900)});panel('route',true)};
/* ---------- 小地图（跟着玩家、放大显示附近）+ 全岛大地图 ---------- */
const hx2=c=>{const n=parseInt(c.slice(1),16);return[n>>16,(n>>8)&255,n&255]};const MMC=(CH===2?REGD.g:['#7ac460','#9ccf6a','#408a44','#f0e0ac','#a8a296']).map(hx2);const MMW=CH===2&&REGD.wat?hx2(WTR[0]):null;
const mm=el('mm'),mx=mm.getContext('2d');const MB=600,MR=300;let mmBase=null;   // 底图覆盖 ±300 米
const ZI={home:'⛺',market:'🏮',forest:'🌲',river:'⚓',enemy:'⚔',mine:'⛏',beach:'🏖'};
function bakeMini(){const c=document.createElement('canvas');c.width=c.height=MB;const x=c.getContext('2d'),im=x.createImageData(MB,MB);
  for(let j=0;j<MB;j++)for(let i=0;i<MB;i++){const wx=(i/MB*2-1)*MR,wz=(j/MB*2-1)*MR,h=H(wx,wz),k=(j*MB+i)*4;let c3;
    if(h<WATER_Y){const d=Math.min(1,-h/6);c3=MMW?MMW.map(v=>v*(1-.3*d)):[96-40*d,196-60*d,222-30*d]}else if(h<1.4)c3=MMC[3];else if(h>16)c3=MMC[4];
    else{const f=Math.hypot(wx-ZONES.forest.x,wz-ZONES.forest.z)<50;c3=f?MMC[2]:MMC[0].map((v,q)=>v+(MMC[1][q]-v)*Math.min(1,h/14))}
    im.data[k]=c3[0];im.data[k+1]=c3[1];im.data[k+2]=c3[2];im.data[k+3]=255}
  x.putImageData(im,0,0);const P2=v=>(v/MR*.5+.5)*MB;const be={x:riverX(BRIDGE.z)+22,z:BRIDGE.z},bw={x:riverX(BRIDGE.z)-22,z:BRIDGE.z};
  x.strokeStyle='rgba(140,98,52,.95)';x.lineWidth=2.5;x.setLineDash([5,3]);
  for(const [p,q] of[[ZONES.home,ZONES.market],[ZONES.home,ZONES.forest],[ZONES.market,ZONES.river],[ZONES.market,bw],[be,ZONES.enemy]]){x.beginPath();x.moveTo(P2(p.x),P2(p.z));x.lineTo(P2(q.x),P2(q.z));x.stroke()}
  x.setLineDash([]);x.strokeStyle='#8a5a2a';x.lineWidth=4;x.beginPath();x.moveTo(P2(bw.x),P2(BRIDGE.z));x.lineTo(P2(be.x),P2(BRIDGE.z));x.stroke();mmBase=c}
function mapMarks(c,tp,sc,full){c.textAlign='center';c.textBaseline='middle';extraMarks(c,tp,sc,full);
  for(const b of G.builds){const [x,y]=tp(b.x,b.z);if(b.t==='boat'){c.font=Math.round(16*sc)+'px sans-serif';c.fillText('⛵',x,y);continue}c.fillStyle=b.t==='fire'?'#ff7a1a':b.t==='farm'?'#3aa040':'#8a5a2a';c.strokeStyle='#fff';c.lineWidth=1.5*sc;c.beginPath();if(b.t==='fire')c.arc(x,y,4.5*sc,0,7);else c.rect(x-4*sc,y-4*sc,8*sc,8*sc);c.fill();c.stroke()}
  if(G.merchant){const [x,y]=tp(G.merchant.x,G.merchant.z);c.fillStyle='#ffc020';c.beginPath();c.arc(x,y,4*sc,0,7);c.fill()}
  for(const a of ACT){if(a.dead||!(a.human||a.kind==='wolf'||a.kind==='boar'))continue;if(!full&&(a.x-P.x)**2+(a.z-P.z)**2>8100)continue;if(full&&!a.boss&&(a.x-P.x)**2+(a.z-P.z)**2>8100)continue;const [x,y]=tp(a.x,a.z);
    c.fillStyle=a.boss?'#ff1a1a':'#e03838';c.strokeStyle='#fff';c.lineWidth=1.2*sc;c.beginPath();c.arc(x,y,(a.boss?5.5:3.2)*sc,0,7);c.fill();c.stroke()}
  for(const k in ZONES){const Z=ZONES[k],[x,y]=tp(Z.x,Z.z);c.fillStyle='#000';c.font=Math.round(17*sc)+'px sans-serif';c.fillText(ZI[k],x,y);
    c.font='bold '+Math.round(12.5*sc)+'px "PingFang SC","Microsoft YaHei",sans-serif';c.lineWidth=3.5*sc;c.strokeStyle='rgba(255,255,255,.95)';c.strokeText(Z.name,x,y+15*sc);c.fillStyle='#1e2a30';c.fillText(Z.name,x,y+15*sc)}
  const [px,pz]=tp(P.x,P.z),s=(full?11:10)*sc;c.save();c.translate(px,pz);c.rotate(-P.yaw+Math.PI);c.fillStyle='#ffe14a';c.strokeStyle='#1a1a1a';c.lineWidth=2*sc;c.beginPath();c.moveTo(0,-s);c.lineTo(s*.7,s*.75);c.lineTo(0,s*.35);c.lineTo(-s*.7,s*.75);c.closePath();c.fill();c.stroke();c.restore()}
function drawMini(){if(!mmBase)bakeMini();const S=mm.width,R=75,k=MB/(2*MR);mx.fillStyle='#3a8ab8';mx.fillRect(0,0,S,S);
  mx.drawImage(mmBase,(P.x-R+MR)*k,(P.z-R+MR)*k,2*R*k,2*R*k,0,0,S,S);mapMarks(mx,(x,z)=>[(x-P.x+R)/(2*R)*S,(z-P.z+R)/(2*R)*S],S/190,false);guideMini(mx,(x,z)=>[(x-P.x+R)/(2*R)*S,(z-P.z+R)/(2*R)*S],S/190,S,false);
  mx.font='bold 20px sans-serif';mx.fillStyle='#fff';mx.strokeStyle='#000';mx.lineWidth=3;mx.strokeText('北',16,16);mx.fillText('北',16,16)}
function drawBig(){if(!mmBase)bakeMini();const c=el('bm'),S=Math.round(Math.min(innerWidth*.92,innerHeight*.78,700)*Math.min(2,devicePixelRatio||1));c.width=c.height=S;const x=c.getContext('2d'),V=215,k=MB/(2*MR);
  x.drawImage(mmBase,(MR-V)*k,(MR-V)*k,2*V*k,2*V*k,0,0,S,S);mapMarks(x,(wx,wz)=>[(wx+V)/(2*V)*S,(wz+V)/(2*V)*S],S/420,true);guideMini(x,(wx,wz)=>[(wx+V)/(2*V)*S,(wz+V)/(2*V)*S],S/420,S,true)}
mm.addEventListener('click',()=>{if(!G.started)return;drawBig();panel('bigmap',true)});
/* ---------- HUD ---------- */
let hudT=0,lastZone='';
function updHUD(dt){hudT-=dt;
  el('hpF').style.width=(G.hp/G.maxhp*100)+'%';el('hungerF').style.width=G.hunger+'%';el('staF').style.width=(G.sta/G.maxsta*100)+'%';if(G.maxmana)el('manaF').style.width=(G.mana/G.maxmana*100)+'%';
  el('hpV').textContent=Math.ceil(G.hp);el('hungerV').textContent=Math.ceil(G.hunger);
  if(toastT>0){toastT-=dt;if(toastT<=0)el('toast').classList.remove('on')}
  const it=findInteract();GUIDE.it=it;const ab=el('actB');const food=!it&&G.hunger<80&&['cooked','grain','berry','meat','potion'].some(k=>(G.inv[k]||0)>0);ab.textContent=it?it.label:food?'吃':'互动';ab.classList.toggle('lit',!!it||food);
  if(hudT>0)return;hudT=.25;{const sb=el('stats').getBoundingClientRect();el('quest').style.top=(sb.bottom+6)+'px';if(innerWidth>720){el('inv').style.left=(sb.right+8)+'px';el('inv').style.right=(el('mmw').getBoundingClientRect().width+24)+'px'}}
  const hh=Math.floor(G.hour),mi=Math.floor((G.hour-hh)*60);el('clock').textContent=`第${G.day}天 ${String(hh).padStart(2,'0')}:${String(mi).padStart(2,'0')} ${G.rain?'🌧':G.hour>=6&&G.hour<18.5?'☀':'🌙'}`;
  const zn=zoneOf(P.x,P.z);const zname=zn?ZONES[zn].name:(WATER_Y-groundAt(P.x,P.z)>.5?(REGD.wat==='lava'?'岩浆中':'水中'):REGD.n);el('zone').textContent=zname;if(zn&&zn!==lastZone){toast('来到 '+ZONES[zn].name);if(zn==='market')G.flags.visitM=1}lastZone=zn||'';
  guideTick();
  el('qiF').style.width=Math.min(100,(G.qi||0)/qiNeed()*100)+'%';el('qiV').textContent=Math.floor(G.qi||0);el('skillB').textContent=SKILLS[G.skillSel]?SKILLS[G.skillSel].n():'技能';el('medB').classList.toggle('lit',!!G.med);el('swB').style.display=G.realm>=1?'':'none';
  el('lvT').textContent=rankName();el('xpF').style.width=(G.xp/needXP(G.lv)*100)+'%';el('ptsB').textContent=G.pts>0?'加点 +'+G.pts:'人物';el('ptsB').classList.toggle('lit',G.pts>0);
  el('inv').innerHTML=['wood','stone','herb','meat','cooked','berry','ling'].map(k=>`<i class="${invFlash(k)?'fl':''}">${ITEM[k]}<b>${G.inv[k]||0}</b></i>`).join('')+(G.tools.canteen?`<i>水壶<b>${G.water}/3</b></i>`:'')+(G.faction==='B'&&G.tools.bow?`<i>弩箭<b>${G.inv.arrow||0}</b></i>`:'')+((G.inv.potion||0)?`<i>药<b>${G.inv.potion}</b></i>`:'');
  el('wpn').textContent=WEAPONS[G.weapon].n;drawMini();
  el('fps').textContent=Math.round(fpsV)+' fps'}

/* ---------- 镜头 ---------- */
const _ct=new THREE.Vector3();
function updCam(dt){let tx=P.x,ty=P.y+(P.st==='swim'?.4:1.5),tz=P.z;if(G.over&&G.endBoat){const b=G.endBoat.obj;tx=b.position.x;ty=b.position.y+2;tz=b.position.z;CAM.yaw+=dt*.15}
  CAM.x=lerp(CAM.x||tx,tx,Math.min(1,dt*10));CAM.y=lerp(CAM.y||ty,ty,Math.min(1,dt*8));CAM.z=lerp(CAM.z||tz,tz,Math.min(1,dt*10));
  let d=(P.st==='sleep'?5:CAM.dist)*(G.over?1.6:1);const cp=Math.cos(CAM.pitch);
  {const dx=Math.sin(CAM.yaw)*cp,dz=Math.cos(CAM.yaw)*cp;for(let k=.8;k<d;k+=.5){const px=CAM.x+dx*k,pz=CAM.z+dz*k;if(nearCols(px,pz).some(c=>!c.off&&!c.tree&&c.r>1.2&&Math.hypot(c.x-px,c.z-pz)<c.r*.95)){d=Math.max(2,k-.5);break}}}let x=CAM.x+Math.sin(CAM.yaw)*cp*d,y=CAM.y+Math.sin(CAM.pitch)*d,z=CAM.z+Math.cos(CAM.yaw)*cp*d;
  const gy=Math.max(groundAt(x,z),WATER_Y)+.6;if(y<gy)y=gy;
  if(shakeK>0){x+=rnd(-1,1)*shakeK;y+=rnd(-1,1)*shakeK;shakeK=Math.max(0,shakeK-dt*1.5)}
  camera.position.set(x,y,z);camera.lookAt(_ct.set(CAM.x,CAM.y,CAM.z))}

/* ---------- 场景动态 ---------- */
function updDyn(dt,t){
  if(grassC&&(P.x-grassC.x)**2+(P.z-grassC.z)**2>64)refreshGrass(P.x,P.z);GU.uTime.value=t;WU.uTime.value=t;
  // 花瓣
  const MO=FXS[5],pv=MO==='snow'||G.rainK<.3;petals.visible=pv;if(pv){for(let i=0;i<PET_N;i++){const p=petalS[i];
    if(MO==='rise'){p.y+=p.vy*.6*dt;p.x+=Math.sin(t*.9+p.ph)*.3*dt;p.z+=Math.cos(t*.7+p.ph)*.3*dt}
    else if(MO==='hover'){p.y+=Math.sin(t*1.3+p.ph)*.4*dt;p.x+=Math.sin(t*.5+p.ph*2)*.5*dt;p.z+=Math.cos(t*.6+p.ph)*.5*dt;if(p.y>4)p.y=.5}
    else if(MO==='wind'){p.y-=p.vy*.15*dt;p.x+=(4+Math.sin(t+p.ph))*dt;p.z+=Math.sin(t*.8+p.ph)*.6*dt}
    else if(MO==='snow'){p.y-=p.vy*(1+G.rainK)*dt;p.x+=(Math.sin(t*.6+p.ph)*.4+G.rainK*2)*dt;p.z+=Math.cos(t*.5+p.ph)*.3*dt}
    else{p.y-=p.vy*dt;p.x+=(p.vx+.8+Math.sin(t*.7+p.ph)*.6)*dt;p.z+=Math.cos(t*.5+p.ph)*.4*dt}p.r+=dt*2;
    if(p.y<-.5||p.y>10||Math.abs(p.x)>16||Math.abs(p.z)>16){p.x=rnd(-14,14);p.z=rnd(-14,14);p.y=MO==='rise'||MO==='hover'?rnd(0,3):rnd(5,9);if(MO==='wind')p.x=-15}
    const wx=P.x+p.x,wz=P.z+p.z,gy=H(wx,wz);let y=gy+p.y;_m.compose(_v.set(wx,y,wz),_q.setFromEuler(_e.set(p.r,p.r*.7,p.r*.3)),_s.setScalar(1));petals.setMatrixAt(i,_m)}petals.instanceMatrix.needsUpdate=true}
  // 雨
  rain.visible=G.rainK>.05;rain.material.opacity=.5*G.rainK;if(rain.visible){const a=rain.geometry.attributes.position.array;for(let i=0;i<RAIN_N;i++){const r=rainS[i];r[1]-=dt*26;if(r[1]<-2){r[1]=rnd(14,22);r[0]=rnd(-25,25);r[2]=rnd(-25,25)}
    const x=P.x+r[0],y=P.y+r[1],z=P.z+r[2];a.set([x,y,z,x+.08,y+.7,z],i*6)}rain.geometry.attributes.position.needsUpdate=true}
  // 篝火
  let nf=null,nd=1e9;for(const b of G.builds){if(b.t==='fire'){const fl=b.obj.userData.flame;const k=1+Math.sin(t*13+b.x)*.12+Math.sin(t*23)*.08;fl.scale.set(1+Math.sin(t*9)*.08,k,1+Math.cos(t*11)*.08);fl.rotation.y=t*2;
      const d=dist2(b);if(d<nd){nd=d;nf=b}if(Math.random()<dt*6)burst(b.x+rnd(-.2,.2),b.obj.position.y+.9,b.z+rnd(-.2,.2),MAT.flame,1,.3)}if(b.t==='farm')updFarm(b,dt*G.timeScale);
    if(b.t==='boat'){b.obj.position.y=WATER_Y+.25+Math.sin(t*1.3)*.12;b.obj.rotation.z=Math.sin(t*.9)*.03;const s=b.obj.userData.sail;s.scale.z=1}}
  const {day}=dayK();if(nf&&nd<1600){fireLight.position.set(nf.x,nf.obj.position.y+1.2,nf.z);fireLight.intensity=(4+Math.sin(t*15)*.6+Math.sin(t*7)*.5)*(1.4-day)*6}else fireLight.intensity=0;
  for(const b of DECOR_BOATS){b.position.y=WATER_Y+.2+Math.sin(t*1.1+b.position.x)*.1;b.rotation.z=Math.sin(t*.8)*.04}
  for(const c of CRANES){c.a+=dt*c.sp;const x=c.cx+Math.cos(c.a)*c.r,z=c.cz+Math.sin(c.a)*c.r;c.g.position.set(x,c.y+Math.sin(t*.7+c.r)*2,z);c.g.rotation.y=Math.atan2(-Math.sin(c.a)*Math.sign(c.sp),Math.cos(c.a)*Math.sign(c.sp));const f=Math.sin(t*5+c.r)*.55;c.ws[0].rotation.z=-f;c.ws[1].rotation.z=f}
  if(CH2OBJ.furnace){const fr=CH2OBJ.furnace.fire;fr.scale.set(1,1+Math.sin(t*12)*.2,1)}if(CH2OBJ.chest&&CH2OBJ.chest.glow.visible){CH2OBJ.chest.glow.rotation.y=t*1.5;CH2OBJ.chest.glow.position.y=1.5+Math.sin(t*2)*.12}
  // 倒下的树
  for(let i=falling.length-1;i>=0;i--){const f=falling[i];f.t+=dt;const k=Math.min(1,f.t/1.4);f.g.quaternion.setFromAxisAngle(f.ax,-k*k*Math.PI/2*.96);if(f.t>2.4){f.g.position.y-=dt*2;if(f.t>3.2){scene.remove(f.g);falling.splice(i,1)}}}
  // 结局：船驶向大海
  if(G.over&&G.endBoat){const b=G.endBoat.obj;b.position.z+=dt*6;b.position.x=riverX(b.position.z);b.rotation.y=0}
}

/* ---------- 主循环 ---------- */
const clock=new THREE.Clock();let fpsV=60,fpsN=0,fpsT=0,simT=0;
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}addEventListener('resize',resize);resize();
function frame(){requestAnimationFrame(frame);const rawDt=clock.getDelta();let dt=Math.min(rawDt,.05);dt=timeWarp(dt,rawDt);fpsN++;fpsT+=rawDt;   // 帧率按真实时间算（以前用截断后的 dt，低于 20 帧时也会显示 20）
  if(fpsT>.5){fpsV=fpsN/fpsT;fpsN=0;fpsT=0}
  if(!G.started){CAM.yaw+=dt*.05;const t=performance.now()/1000;if(!G.starting){P.x=ZONES.market.x;P.z=ZONES.market.z}P.y=groundAt(P.x,P.z);updSky(0);updCam(dt);WU.uTime.value=t;GU.uTime.value=t;renderer.render(scene,camera);return}
  const run=!G.paused;simT+=run?dt:0;
  if(run){keyMove();if(atkHold)attack();
    const ts=G.timeScale;G.hour+=dt*24/DAY_LEN*ts;if(G.hour>=24){G.hour-=24;G.day++}
    if(!G.dead&&!G.over&&P.st!=='sleep'){G.hunger=Math.max(0,G.hunger-dt*.19*G.hungerMul*(G.med?1:ts)*(IN.run?1.4:1));
      if(G.hunger<15&&!busy()){const fd=[['cooked',38,'烤肉'],['grain',26,'灵谷'],['berry',9,'浆果']].find(f=>(G.inv[f[0]]||0)>0);if(fd){G.inv[fd[0]]--;G.hunger=Math.min(100,G.hunger+fd[1]);toast('肚子饿了，自动吃了'+fd[2]+'（饱食+'+fd[1]+'）')}}
      G._hw=(G._hw||0)-dt;if(G.hunger<30&&G._hw<=0){G._hw=G.hunger<=0?6:25;if(G.med&&G.hunger<10){G.med=false;G.timeScale=1}toast(G.hunger<=0?'⚠ 饿得一直掉血！快点「互动」键吃东西，或去摘浆果、打猎烤肉':'肚子饿了，记得点「互动」键吃东西',G.hunger<=0?1:0)}
      if(G.hunger<=0){G.hp-=dt*1.2;if(G.hp<=0){G.hp=0;die()}}else if(G.hunger>45&&G.hp<G.maxhp)G.hp=Math.min(G.maxhp,G.hp+dt*.5*(P.sitFire?3:1));
      if(G.maxmana&&!G.flying)G.mana=Math.min(G.maxmana,G.mana+dt*2.2*(G.perks&&G.perks.fanying?2:1))}
    for(let i=LATER.length-1;i>=0;i--){LATER[i].t-=dt;if(LATER[i].t<=0){const f=LATER[i].fn;LATER.splice(i,1);f()}}
    for(let i=RESP.length-1;i>=0;i--){RESP[i].t-=dt*ts;if(RESP[i].t<=0){const f=RESP[i].fn;RESP.splice(i,1);f()}}
    if(!G.over)updPlayer(dt);for(let i=ACT.length-1;i>=0;i--)if(ACT[i])updActor(ACT[i],dt);updProj(dt);updChips(dt);updRaid();updExtra(dt);moreTick(dt);
    for(let i=FX_RINGS.length-1;i>=0;i--)if(FX_RINGS[i].upd(dt))FX_RINGS.splice(i,1);
    G.played+=dt;if(G.played>90){G.played=0;if(!G.dead&&!G.over)save()}}
  updSky(dt);updDyn(dt,simT);updCam(dt);updFX(dt);updHUD(dt);updGuide(dt,simT);renderer.render(scene,camera)}
frame();el('loading').style.display='none';el('start').style.display='';
window.__game={dodge,hurtPlayer,spawnGhost,gainXP,drawStat,G,P,CAM,IN,ACT,nodes,trees,attack,skill,eat,craft,findInteract,startGame,go,save,importGLB,useGLB,renderer,scene,camera,THREE,spawnBeast,hurtActor,ending,equip,ZONES,groundAt,H,WATER_Y,riverX,panel};
