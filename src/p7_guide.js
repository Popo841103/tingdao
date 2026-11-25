/* ---------- 新手引导（第一轮改进）：目标指路、营地光柱、采集物标记、拾取反馈、目标完成提示、画质建议 ---------- */
// 新手任务的游戏内奖励（只给少量材料/补给，不卖数值）
const TUT_REW={camp:{berry:3},gather:{wood:1,stone:1},axe:{potion:1},chop:{stone:2},fire:{meat:1},cook:{ling:2}};
const GUIDE={tgt:null,step:null,flash:{},ipEl:null,wpEl:null,doneEl:null,init:false,lowFps:0,suggested:false};
const PICK_C={stick:'#ffb347',pebble:'#9fe0ff',herb:'#7dff8a',berry:'#ff7a9a'};
const PICK_KINDS=new Set(['stick','pebble','herb','berry']);
function touchUI(){return isTouch}
function nearestOf(list,ok){let b=null,bd=1e18;for(const n of list){if(!ok(n))continue;const d=(n.x-P.x)**2+(n.z-P.z)**2;if(d<bd){bd=d;b=n}}return b}
/* 安全可达判断：在陆地上、直线走过去不过水、不被帐篷/木箱压住、离营地不远 */
function dryPath(x0,z0,x1,z1){const d=Math.hypot(x1-x0,z1-z0);for(let k=0;k<=d;k+=1.2){const t=d?k/d:0;if(WATER_Y-groundAt(x0+(x1-x0)*t,z0+(z1-z0)*t)>-.15)return false}return true}
function freeSpot(x,z,pad){for(const c of nearCols(x,z))if(!c.off&&Math.hypot(c.x-x,c.z-z)<c.r+pad)return false;return true}
const SAFE_R=38;   // 新手引导只指向营地附近这个范围内的东西
function safeFor(o,pad){const H0=ZONES.home;return Math.hypot(o.x-H0.x,o.z-H0.z)<SAFE_R&&groundAt(o.x,o.z)>WATER_Y+.5&&dryPath(P.x,P.z,o.x,o.z)&&(pad==null||freeSpot(o.x,o.z,pad))}
function nearestNode(kinds){const ok=n=>n.alive&&kinds.includes(n.kind);return nearestOf(nodes,n=>ok(n)&&n.home&&dryPath(P.x,P.z,n.x,n.z))||nearestOf(nodes,n=>ok(n)&&safeFor(n,.3))}
function treeTgt(){const t=nearestTree();return t?ptTgt(t,'树','🌳',(t.col?t.col.r:.6)+1.0):null}
function nearestTree(){return nearestOf(trees,t=>t.alive&&TREE_TYPES[t.type]&&TREE_TYPES[t.type].wood>0&&safeFor(t))}
/* 营地的树枝和石子：原来是在营地 ±12 米里随便放，常常压在帐篷、木箱、篝火底下看不见也够不着。
   开局时把它们挪到营地周围的空地上（固定位置，每次一样；不影响存档，采集物本来就不存档）。 */
// 在 startGame 里营地和已有建筑都摆好之后调用
function placeCampPickups(){const H0=ZONES.home;let seed=97;const r01=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
  const spawn={x:H0.x+3,z:H0.z+4},picked=[];const list=nodes.filter(n=>n.home&&(n.kind==='stick'||n.kind==='pebble'));
  const good=(x,z)=>{const y=groundAt(x,z);if(y<WATER_Y+.8)return false;if(Math.abs(groundAt(x+1,z)-groundAt(x-1,z))+Math.abs(groundAt(x,z+1)-groundAt(x,z-1))>.9)return false;
    if(!freeSpot(x,z,1.3))return false;if(Math.hypot(x-spawn.x,z-spawn.z)<2.2)return false;for(const p of picked)if(Math.hypot(p.x-x,p.z-z)<1.8)return false;return dryPath(H0.x,H0.z,x,z)};
  for(const n of list){let ok=false;for(let k=0;k<400&&!ok;k++){const a=r01()*6.283,r=4+r01()*(k<200?8:12),x=spawn.x+Math.cos(a)*r,z=spawn.z+Math.sin(a)*r;if(good(x,z)){ok=true;picked.push({x,z});n.x=x;n.z=z;n.y=groundAt(x,z)+(n.kind==='pebble'?.05:0);const s=n.kind==='pebble'?1.3:1.35;n.m=M4(n.x,n.y,n.z,r01()*6.28,s,s,s);if(n.alive)setNode(n,true)}}
    if(!ok)n.home=0}}
function nearestFire(){return nearestOf(G.builds,b=>b.t==='fire')}
function ptTgt(o,label,icon,nr){return o?{x:o.x,z:o.z,label,icon:icon||'✦',small:true,nr:nr||2.2}:null}
function zoneTgt(Z,icon){return Z?{x:Z.x,z:Z.z,label:Z.name,icon:icon||'⛺',zone:true,r:Z.r}:null}

/* ----- 第一章任务链：前 6 步是「新手引导」，后面接原来的主线 ----- */
function inWaterNow(){return WATER_Y-groundAt(P.x,P.z)>.25}
function homeTgt(lbl){const t=zoneTgt(ZONES.home,'⛺');if(lbl)t.label=lbl;return t}
function questSteps(){const f=G.flags,i=G.inv,fa=G.faction,T=touchUI(),press=T?'点「互动」':'按 E';
  const got=()=>G.tools.axe||((i.wood||0)>=2&&(i.stone||0)>=2);
  const merchantTgt=()=>routeVia(G.merchant?{x:G.merchant.x,z:G.merchant.z,label:'坊市摊主',icon:'🏮',zone:true,r:5.5}:zoneTgt(ZONES.market,'🏮'),3);
  const fireTgt=()=>{const fs=campFires().filter(b=>!b.out);return fs.length?ptTgt(fs[0],'营火','🔥',2.8):campFires().length?ptTgt(campFires()[0],'熄了的火','🔥',2.8):homeTgt('营地')};
  return [
    {id:'camp',ok:()=>f.camp||got()||f.chop||f.b_fire,t:'回到营地',act:'金色箭头指着营地，那里有一道光。',tgt:()=>zoneTgt(ZONES.home,'⛺')},
    {id:'gather',ok:got,t:'拾柴，拣石',prog:()=>`枯枝 ${Math.min(i.wood||0,2)}/2　石子 ${Math.min(i.stone||0,2)}/2`,act:'<span style="color:#e08a10;font-weight:800">橙光</span>是枯枝，<span style="color:#2a98d0;font-weight:800">蓝光</span>是石子。走近，'+press+'。',
      tgt:()=>{const need=[];if((i.wood||0)<2)need.push('stick');if((i.stone||0)<2)need.push('pebble');const n=nearestNode(need.length?need:['stick','pebble']);if(n)return ptTgt(n,n.kind==='stick'?'枯枝':'石子',n.kind==='stick'?'🪵':'🪨');return homeTgt('营地（附近找找）')}},
    {id:'axe',ok:()=>G.tools.axe,t:'磨一把石斧',act:'点「制造」→ 石斧（木2 石2）。',hl:'craftB',rec:'axe',tab:'tool'},
    {id:'chop',ok:()=>f.chop>=2||f.b_fire,t:'伐两棵树',prog:()=>`${Math.min(f.chop||0,2)}/2`,act:'走到树下，箭头隐去就到了。'+(T?'点「攻击」':'按 F')+'，多砍几下。',tgt:()=>treeTgt()},
    {id:'fire',ok:()=>f.b_fire,t:'生火',prog:()=>`木 ${Math.min(i.wood||0,4)}/4　石 ${Math.min(i.stone||0,3)}/3`,act:'点「制造」→ 建造 → 篝火。天黑之前，一定要有火。',hl:'craftB',rec:'fire',tab:'build',
      tgt:()=>(i.stone||0)<3?ptTgt(nearestNode(['pebble']),'石子','🪨'):(i.wood||0)<4?treeTgt():null},
    {id:'cook',ok:()=>f.cook||f.harvest,t:'烤一块肉',act:(i.meat||0)>0?'带着生肉到火边，'+press+'。':'去猎兔、鹿，得了生肉再回火边。',
      tgt:()=>(i.meat||0)>0?ptTgt(nearestFire(),'营火','🔥',2.8):ptTgt(nearestOf(ACT,a=>!a.dead&&a.def&&a.def.flee&&!a.human),'猎物','🦌')},
    {id:'ask',ok:()=>f.st_ask||f.st_clue,t:'去坊市，打听渡口',act:'坊市有个摊主，'+press+'和他说话。',tgt:merchantTgt},
    {id:'vigil',ok:()=>!!f.vigil,t:'守火，过子时',prog:()=>{const fs=campFires().filter(b=>!b.out);const h=Math.floor(G.hour),m=Math.floor((G.hour-h)*60);const now=`此刻 ${h}:${String(m).padStart(2,'0')}`;
        if(!(G.hour>=20||G.hour<1))return now+'　入夜（20:00）火会变小';if(!fs.length)return now+'　营地没有火';return now+'　火势 '+Math.round(fs[0].flame==null?100:fs[0].flame)+'%'},
      act:'多备几根柴。入夜后在火边'+press+'「添柴」；坐在火边会自己添，时间也过得快。',tgt:fireTgt},
    {id:'clue',ok:()=>f.st_clue,t:'回坊市，听渡口在哪',act:isNight()?'夜里狼和游魂都出来了。守着火，天亮再走。':f.vigil===2?'火灭了。也许他还肯收一块石子。':'摊主说过，子时之后自会知道。',tgt:()=>isNight()?fireTgt():merchantTgt()},
    {id:'shelter',ok:()=>f.b_shelter,t:'搭一个「庇护所」（木12），夜里去睡'},
    {id:'water',ok:()=>f.water,t:'开一块种植田，做水壶，播种后打水浇地'},
    {id:'weapon',ok:()=>fa==='A'?G.tools.sword:G.tools.bow,t:fa==='A'?'炼一把「灵剑」（要灵草）':'做一把「弩」和弩箭'},
    {id:'boss',ok:()=>G.cleared.mid||G.builds.some(b=>b.t==='boat'),t:'击败敌营首领「'+FACTION[fa].boss+'」，或在灵河渡口造灵舟',tgt:()=>zoneTgt(ZONES.enemy,'⚔')},
    {id:'sail',ok:()=>false,t:'去灵河渡口，登上灵舟，渡往'+regName(ROUTE()[1]),tgt:()=>zoneTgt(ZONES.river,'⚓')}]}
const TUT_N=6;
function questFull(){const steps=questSteps();for(let k=0;k<steps.length;k++)if(!steps[k].ok())return Object.assign({n:k+1,all:steps.length},steps[k]);return{n:steps.length,all:steps.length,t:'完成',id:'end'}}

/* ----- 3D 标记：营地光柱 + 采集物光圈 ----- */
const beam=(()=>{const g=new THREE.Group();const m=new THREE.MeshBasicMaterial({color:'#ffd65a',transparent:true,opacity:.3,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false});
  const c=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.6,70,16,1,true).translate(0,35,0),m);const r=new THREE.Mesh(new THREE.RingGeometry(2.2,2.9,40).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:'#ffd65a',transparent:true,opacity:.6,depthWrite:false,fog:false}));r.position.y=.12;
  g.add(c,r);g.visible=false;g.userData={c,r};scene.add(g);return g})();
const PK_MAX=48;
const pkRing=new THREE.InstancedMesh(new THREE.RingGeometry(.42,.56,28).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({transparent:true,opacity:.85,depthWrite:false,fog:false}),PK_MAX);
const pkGem=new THREE.InstancedMesh(new THREE.OctahedronGeometry(.11,0),new THREE.MeshBasicMaterial({fog:false}),PK_MAX);
for(const im of[pkRing,pkGem]){im.count=0;im.frustumCulled=false;im.renderOrder=2;im.setColorAt(0,new THREE.Color());scene.add(im)}
const _gm=new THREE.Matrix4(),_gq=new THREE.Quaternion(),_gv=new THREE.Vector3(),_gs=new THREE.Vector3(),_gc=new THREE.Color(),_ge=new THREE.Euler();
let pkList=[],pkT=0;
function updPickMarks(dt,t){pkT-=dt;if(pkT<=0){pkT=.3;pkList=[];for(const n of nodes){if(!n.alive||!PICK_KINDS.has(n.kind))continue;const d=(n.x-P.x)**2+(n.z-P.z)**2;if(d<26*26)pkList.push([d,n])}pkList.sort((a,b)=>a[0]-b[0]);pkList=pkList.slice(0,PK_MAX).map(a=>a[1])}
  const tg=GUIDE.tgt;let k=0;for(const n of pkList){if(!n.alive)continue;const isT=tg&&tg.small&&Math.abs(tg.x-n.x)<.01&&Math.abs(tg.z-n.z)<.01;const s=(isT?1.35:1)*(1+Math.sin(t*3+n.x)*.08);
    _gm.compose(_gv.set(n.x,n.y+.06,n.z),_gq.identity(),_gs.set(s,1,s));pkRing.setMatrixAt(k,_gm);
    _gm.compose(_gv.set(n.x,n.y+.75+Math.sin(t*2.4+n.z)*.12,n.z),_gq.setFromEuler(_ge.set(0,t*2+n.x,0)),_gs.setScalar(isT?1.5:1));pkGem.setMatrixAt(k,_gm);
    _gc.set(PICK_C[n.kind]);pkRing.setColorAt(k,_gc);pkGem.setColorAt(k,_gc);k++}
  pkRing.count=pkGem.count=k;for(const im of[pkRing,pkGem]){im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true}}

/* ----- 屏幕上的指路箭头、互动提示、完成横幅 ----- */
function guideDom(){if(GUIDE.wpEl)return;const h=el('hud');
  GUIDE.wpEl=document.createElement('div');GUIDE.wpEl.id='wp';GUIDE.wpEl.innerHTML='<b class="ar">➤</b><span class="tx"></span>';h.appendChild(GUIDE.wpEl);
  GUIDE.ipEl=document.createElement('div');GUIDE.ipEl.id='ip';el('fx').appendChild(GUIDE.ipEl);
  GUIDE.doneEl=document.createElement('div');GUIDE.doneEl.id='qdone';h.appendChild(GUIDE.doneEl)}
function updGuide(dt,t){guideDom();const tg=GUIDE.tgt,wp=GUIDE.wpEl;
  // 指路箭头（相对镜头方向）
  if(tg&&!G.dead&&!G.over){const dx=tg.x-P.x,dz=tg.z-P.z,d=Math.hypot(dx,dz);const near=tg.zone?d<(tg.r||10)*.6:d<tg.nr;
    if(near){wp.style.display='none'}else{wp.style.display='';const fx=-Math.sin(CAM.yaw),fz=-Math.cos(CAM.yaw),rx=Math.cos(CAM.yaw),rz=-Math.sin(CAM.yaw);const a=Math.atan2(dx*rx+dz*rz,dx*fx+dz*fz);
      wp.firstChild.style.transform=`rotate(${a-Math.PI/2}rad)`;wp.lastChild.textContent=`${tg.icon} ${tg.label} · ${Math.round(tg.distOverride||d)} 米`}
    const bt=tg.final||tg;beam.visible=!!bt.zone&&Math.hypot(bt.x-P.x,bt.z-P.z)>8;if(beam.visible){beam.position.set(bt.x,groundAt(bt.x,bt.z),bt.z);beam.userData.c.material.opacity=.22+.08*Math.sin(t*2.5);const s=1+.08*Math.sin(t*3);beam.userData.r.scale.set(s,1,s)}}
  else{wp.style.display='none';beam.visible=false}
  // 互动提示：贴在要捡/要交互的东西上方
  const it=GUIDE.it,ip=GUIDE.ipEl;if(it&&it.pos&&!busy()){const p=proj(it.pos.x,(it.pos.y||groundAt(it.pos.x,it.pos.z))+1.25,it.pos.z);if(p){ip.style.display='';ip.style.transform=`translate(${p[0]}px,${p[1]}px) translate(-50%,-100%)`;ip.innerHTML=(touchUI()?'<i>👆 点「互动」</i>':'<i>E</i>')+it.label}else ip.style.display='none'}else ip.style.display='none';
  updPickMarks(dt,t);updStory(dt,t);
  // 画质建议：只根据本机实测帧率，连续 20 秒低于 24 帧才提示一次
  if(!GUIDE.suggested&&Q.tier!=='min'&&G.started&&!G.paused){GUIDE.lowFps=fpsV<24?GUIDE.lowFps+dt:Math.max(0,GUIDE.lowFps-dt*2);if(GUIDE.lowFps>20){GUIDE.suggested=true;toast('画面有点卡？可以在「设置 → 画质」换成'+(Q.tier==='high'?'「流畅」或「极简」':'「极简」'),1)}}}
function guideMini(c,tp,sc,S,full){if(typeof lamp!=='undefined'&&lamp){const [lx,ly]=tp(lamp.position.x,lamp.position.z);if(full||(lx>0&&ly>0&&lx<S&&ly<S)){c.save();c.fillStyle='#ffcf5a';c.shadowColor='#ffb030';c.shadowBlur=8*sc;c.beginPath();c.arc(lx,ly,(full?7:5)*sc,0,7);c.fill();c.restore();if(full){c.fillStyle='#7a4a10';c.font=`${13*sc}px sans-serif`;c.fillText('对岸的灯',lx+9*sc,ly+4*sc)}}}
  const tg=GUIDE.tgt&&GUIDE.tgt.final||GUIDE.tgt;if(!tg)return;let [x,y]=tp(tg.x,tg.z);const [px,py]=tp(P.x,P.z);const m=10*sc;let out=false;
  if(!full&&(x<m||y<m||x>S-m||y>S-m)){const dx=x-px,dy=y-py,k=Math.min(Math.abs((S/2-m)/(dx||1e-6)),Math.abs((S/2-m)/(dy||1e-6)));x=px+dx*k;y=py+dy*k;out=true}
  c.save();c.setLineDash([6*sc,4*sc]);c.lineWidth=3*sc;c.strokeStyle='rgba(255,200,40,.95)';c.beginPath();c.moveTo(px,py);c.lineTo(x,y);c.stroke();c.setLineDash([]);
  const r=(out?6:8)*sc*(1+.15*Math.sin(performance.now()/200));c.fillStyle='#ffd23a';c.strokeStyle='#5a3a00';c.lineWidth=2*sc;c.beginPath();c.arc(x,y,r,0,7);c.fill();c.stroke();c.restore()}

/* ----- 每 0.25 秒：算当前目标、发奖励、显示完成提示 ----- */
function guideTick(){const q=CH===2?quest2():questFull();
  if(CH!==2){const zn=zoneOf(P.x,P.z);if(zn==='home')G.flags.camp=1}
  const rw=G.flags.qr||(G.flags.qr={});
  if(!GUIDE.init){GUIDE.init=true;if(CH!==2){const st=questSteps();for(let k=0;k<q.n-1&&k<st.length;k++)rw[st[k].id]=1}G._qn=q.n;G._qid=q.id}   // 读档时已经完成的步骤不补发奖励
  if(q.n>G._qn&&!G.over){const st=CH!==2?questSteps():null;let got=[];
    for(let k=G._qn-1;k<q.n-1;k++){const id=st?st[k].id:'q2_'+k;if(rw[id])continue;rw[id]=1;const r=TUT_REW[id];if(r){give(r);got.push(fmtCost(r))}}
    sfx('quest');gainXP(40);const prev=st?st[G._qn-1]:null;if(st)for(let k=G._qn-1;k<q.n-1;k++)memory(st[k].id);showDone(prev?prev.t:'目标完成',['修为 +40'].concat(got).join('　'),q.t);save()}
  G._qn=q.n;G._qid=q.id;GUIDE.step=q;
  try{GUIDE.tgt=q.tgt?q.tgt():null}catch(e){GUIDE.tgt=null}
  // 新手阶段走进水里：箭头先指回营地，并提醒一次（游泳耗体力，体力没了会掉血）
  if(CH!==2&&q.n<=TUT_N){const wet=inWaterNow();if(wet){GUIDE.tgt=homeTgt('回岸上 · 我方营地');if(!GUIDE.wetWarn){GUIDE.wetWarn=true;toast('河水冰冷，游久了会没力气，掉血。回岸上——枯枝和石子都在营地边。',1)}}else if(GUIDE.wetWarn&&!wet)GUIDE.wetWarn=false;
    if(!wet&&GUIDE.tgt&&GUIDE.tgt.small&&Math.hypot(P.x-ZONES.home.x,P.z-ZONES.home.z)>SAFE_R+6)GUIDE.tgt=homeTgt('先回营地')}
  if(CH===2&&!GUIDE.tgt){const k=q.n;GUIDE.tgt=k===1?(G.merchant?{x:G.merchant.x,z:G.merchant.z,label:'商人',icon:'🏮',zone:true,r:6}:null):k===2&&CH2OBJ.chest?{x:CH2OBJ.chest.x,z:CH2OBJ.chest.z,label:'秘境宝箱',icon:'🎁',zone:true,r:8}:k===3?zoneTgt(ZONES.enemy,'⚔'):k===4?zoneTgt(ZONES.river,'⚓'):null}
  const tut=CH!==2&&q.n<=TUT_N,rew=CH!==2&&TUT_REW[q.id]&&!rw[q.id]?fmtCost(TUT_REW[q.id]):'';
  const mc=CH!==2?memCount():0;el('quest').innerHTML=`<b>${tut?'此岸 · '+q.n+'/'+TUT_N:'前路 · '+q.n+'/'+q.all}${mc?'<span class="mc">忆 '+mc+'</span>':''}</b>${q.t}`+(q.prog?`<div class="qp">${q.prog()}</div>`:'')+(q.act?`<div class="qa">${q.act}</div>`:'')+(rew?`<div class="qr">所得：${rew}</div>`:'');
  for(const id of['craftB'])el(id).classList.toggle('hint',q.hl===id&&!el('craft').classList.contains('on'));
  GUIDE.rec=q.rec||null;GUIDE.tab=q.tab||null}
let doneT=null;
function showDone(title,rew,next){const d=GUIDE.doneEl;if(!d)return;d.innerHTML=`<div class="h">✓ ${title}</div><div class="r">所得 ${rew}</div>${next&&next!=='完成'?`<div class="n">接下来：${next}</div>`:''}`;d.classList.remove('on');void d.offsetWidth;d.classList.add('on');el('hud').classList.add('qdon');clearTimeout(doneT);doneT=setTimeout(()=>{d.classList.remove('on');el('hud').classList.remove('qdon')},4200)}
// 拾取反馈：飘字 + 背包格子闪一下
function pickFX(n,l){const T={wood:'🪵',stone:'🪨',herb:'🌿',berry:'🍓',seed:'🌱'};let k=0;for(const key in l){ftxt(n.x,n.y+.7+k*.45,n.z,(T[key]||'')+' +'+l[key]+' '+ITEM[key],'pick');GUIDE.flash[key]=performance.now();k++}
  burst(n.x,n.y+.3,n.z,PICK_MAT[n.kind]||MAT.gold,5,1.2);memory(n.kind)}
const PICK_MAT={};for(const k in PICK_C)PICK_MAT[k]=new THREE.MeshBasicMaterial({color:PICK_C[k]});
function invFlash(k){return performance.now()-(GUIDE.flash[k]||0)<900}
function qualityLabel(t){return{high:'高清',low:'流畅（省电）',min:'极简（最省电）'}[t]}

/* ----- 坊市里绕路指引：摊主在铺子柜台后面，直线箭头会把人引到墙上。
   在坊市周围预先算一张 1 米格子的可走地图（只算一次），每秒用 A* 找一条路，箭头指向路上前方几米的点。 ----- */
const MG={grid:null,ox:0,oz:0,N:0,S:.5,path:null,t:0,goal:null};
function mgBuild(){const Z=ZONES.market,R=70,S=MG.S;MG.ox=Z.x-R;MG.oz=Z.z-R;MG.N=Math.round(2*R/S)+1;const N=MG.N,g=new Uint8Array(N*N);
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=MG.ox+i*S,z=MG.oz+j*S;let b=WATER_Y-groundAt(x,z)>.3;if(!b)for(const c of nearCols(x,z))if(!c.off&&!c.tree&&Math.hypot(c.x-x,c.z-z)<c.r+.38){b=true;break}g[j*N+i]=b?1:0}MG.grid=g}
function mgPath(sx,sz,tx,tz,goalR){if(!MG.grid)mgBuild();const N=MG.N,S=MG.S,g=MG.grid,idx=(i,j)=>j*N+i,X=i=>MG.ox+i*S,Zc=j=>MG.oz+j*S;let si=Math.round((sx-MG.ox)/S),sj=Math.round((sz-MG.oz)/S);if(si<0||sj<0||si>=N||sj>=N)return null;
  if(g[idx(si,sj)]){let bd=1e9,bi=si,bj=sj;for(let a=-4;a<=4;a++)for(let b=-4;b<=4;b++){const i=si+a,j=sj+b;if(i<0||j<0||i>=N||j>=N||g[idx(i,j)])continue;const dd=a*a+b*b;if(dd<bd){bd=dd;bi=i;bj=j}}si=bi;sj=bj}   // 人贴着墙站时，起点格可能算作被挡，换到旁边最近的空格
  const gs=new Float32Array(N*N).fill(1e9),from=new Int32Array(N*N).fill(-1),heap=[];const push=(f,k)=>{heap.push([f,k]);let c=heap.length-1;while(c>0){const p=(c-1)>>1;if(heap[p][0]<=heap[c][0])break;[heap[p],heap[c]]=[heap[c],heap[p]];c=p}};
  const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let c=0;for(;;){const l=2*c+1,r=l+1;let m=c;if(l<heap.length&&heap[l][0]<heap[m][0])m=l;if(r<heap.length&&heap[r][0]<heap[m][0])m=r;if(m===c)break;[heap[m],heap[c]]=[heap[c],heap[m]];c=m}}return top};
  const s=idx(si,sj);gs[s]=0;push(0,s);let end=-1,n=0;
  while(heap.length&&n<90000){n++;const [,k]=pop();const i=k%N,j=(k/N)|0;if(Math.hypot(X(i)-tx,Zc(j)-tz)<goalR){end=k;break}
    for(let di=-1;di<=1;di++)for(let dj=-1;dj<=1;dj++){if(!di&&!dj)continue;const a=i+di,b=j+dj;if(a<0||b<0||a>=N||b>=N)continue;const kk=idx(a,b);if(g[kk]&&Math.hypot(X(a)-tx,Zc(b)-tz)>=goalR)continue;if(di&&dj&&(g[idx(i+di,j)]||g[idx(i,j+dj)]))continue;
      const ng=gs[k]+(di&&dj?1.414:1)*S;if(ng<gs[kk]){gs[kk]=ng;from[kk]=k;push(ng+Math.hypot(X(a)-tx,Zc(b)-tz),kk)}}}
  if(end<0)return null;const pts=[];for(let k=end;k>=0;k=from[k])pts.push([X(k%N),Zc((k/N)|0)]);return pts.reverse()}
// 指引到坊市摊主：在坊市附近时，箭头沿着可走的路走
function routeVia(tg,goalR){if(!tg)return tg;const Z=ZONES.market;if(Math.abs(P.x-Z.x)>68||Math.abs(P.z-Z.z)>68)return tg;
  const now=performance.now();if(!MG.path||now-MG.t>1000||MG.goal!==tg.label){MG.t=now;MG.goal=tg.label;MG.path=mgPath(P.x,P.z,tg.x,tg.z,goalR)}
  const pth=MG.path;if(!pth||pth.length<2)return tg;
  // 箭头指向路上「看得见」的最远一点（直线上没有墙），避免斜穿墙角
  const los=(x1,z1)=>{const d=Math.hypot(x1-P.x,z1-P.z);for(let s=.25;s<d;s+=.25){const x=P.x+(x1-P.x)*s/d,z=P.z+(z1-P.z)*s/d;const i=Math.round((x-MG.ox)/MG.S),j=Math.round((z-MG.oz)/MG.S);if(i>=0&&j>=0&&i<MG.N&&j<MG.N&&MG.grid[j*MG.N+i]&&Math.hypot(x-P.x,z-P.z)>.6)return false}return true};
  let k=1;for(let i=Math.min(pth.length-1,40);i>=1;i--){if(los(pth[i][0],pth[i][1])){k=i;break}}
  // 路要绕（比直线远）时才改指向路上的点
  const d=Math.hypot(tg.x-P.x,tg.z-P.z);let len=0;for(let i=1;i<pth.length;i++)len+=Math.hypot(pth[i][0]-pth[i-1][0],pth[i][1]-pth[i-1][1]);
  if(len+goalR<d+2.5)return tg;
  return Object.assign({},tg,{x:pth[k][0],z:pth[k][1],zone:false,small:false,nr:1.2,distOverride:len,final:tg})}
