/* ---------- 新手引导（第一轮改进）：目标指路、营地光柱、采集物标记、拾取反馈、目标完成提示、画质建议 ---------- */
// 新手任务的游戏内奖励（只给少量材料/补给，不卖数值）
const TUT_REW={camp:{berry:3},gather:{wood:1,stone:1},axe:{potion:1},chop:{stone:2},fire:{meat:1},cook:{ling:2}};
const GUIDE={tgt:null,step:null,flash:{},ipEl:null,wpEl:null,doneEl:null,init:false,lowFps:0,suggested:false};
const PICK_C={stick:'#ffb347',pebble:'#9fe0ff',herb:'#7dff8a',berry:'#ff7a9a'};
const PICK_KINDS=new Set(['stick','pebble','herb','berry']);
function touchUI(){return isTouch}
function nearestOf(list,ok){let b=null,bd=1e18;for(const n of list){if(!ok(n))continue;const d=(n.x-P.x)**2+(n.z-P.z)**2;if(d<bd){bd=d;b=n}}return b}
function nearestNode(kinds){return nearestOf(nodes,n=>n.alive&&kinds.includes(n.kind))}
function nearestTree(){return nearestOf(trees,t=>t.alive&&TREE_TYPES[t.type]&&TREE_TYPES[t.type].wood>0)}
function nearestFire(){return nearestOf(G.builds,b=>b.t==='fire')}
function ptTgt(o,label,icon){return o?{x:o.x,z:o.z,label,icon:icon||'✦',small:true}:null}
function zoneTgt(Z,icon){return Z?{x:Z.x,z:Z.z,label:Z.name,icon:icon||'⛺',zone:true,r:Z.r}:null}

/* ----- 第一章任务链：前 6 步是「新手引导」，后面接原来的主线 ----- */
function questSteps(){const f=G.flags,i=G.inv,fa=G.faction,T=touchUI(),press=T?'点右下角「互动」':'按 E 键（或点「互动」）';
  const got=()=>G.tools.axe||((i.wood||0)>=2&&(i.stone||0)>=2);
  return [
    {id:'camp',ok:()=>f.camp||got()||f.chop||f.b_fire,t:'前往「我方营地」',act:'跟着屏幕上方的金色箭头走，小地图上有金色虚线。营地有一道金色光柱。',tgt:()=>zoneTgt(ZONES.home,'⛺')},
    {id:'gather',ok:got,t:'在营地附近捡树枝和石子',prog:()=>`木头 ${Math.min(i.wood||0,2)}/2　石头 ${Math.min(i.stone||0,2)}/2`,act:'地上发<span style="color:#e08a10;font-weight:800">橙光</span>的是树枝，发<span style="color:#2a98d0;font-weight:800">蓝光</span>的是石子。走近后'+press+'捡起。',
      tgt:()=>{const need=[];if((i.wood||0)<2)need.push('stick');if((i.stone||0)<2)need.push('pebble');const n=nearestNode(need.length?need:['stick','pebble']);if(n&&Math.hypot(n.x-ZONES.home.x,n.z-ZONES.home.z)<60)return ptTgt(n,n.name,n.kind==='stick'?'🪵':'🪨');return zoneTgt(ZONES.home,'⛺')}},
    {id:'axe',ok:()=>G.tools.axe,t:'做一把石斧',act:'点「制造」→「石斧」（木2 石2），做好会自动拿在手上。',hl:'craftB',rec:'axe',tab:'tool'},
    {id:'chop',ok:()=>f.chop>=2||f.b_fire,t:'砍倒 2 棵树',prog:()=>`已砍倒 ${Math.min(f.chop||0,2)}/2`,act:'走到树旁，'+(T?'点「攻击」':'按 F 键或点「攻击」')+'连砍几下，树倒了就得到木头。',tgt:()=>ptTgt(nearestTree(),'树','🌳')},
    {id:'fire',ok:()=>f.b_fire,t:'搭一个篝火',prog:()=>`木头 ${Math.min(i.wood||0,4)}/4　石头 ${Math.min(i.stone||0,3)}/3`,act:'材料够了就点「制造」→「建造」→「篝火」，会建在你面前。',hl:'craftB',rec:'fire',tab:'build',
      tgt:()=>(i.stone||0)<3?ptTgt(nearestNode(['pebble']),'石子','🪨'):(i.wood||0)<4?ptTgt(nearestTree(),'树','🌳'):null},
    {id:'cook',ok:()=>f.cook||f.harvest,t:'在篝火边烤肉',act:(i.meat||0)>0?'带着生肉走到篝火旁，'+press+'「烤肉」。':'先打猎（兔、鹿、野猪）得到生肉，再到篝火旁烤。',
      tgt:()=>(i.meat||0)>0?ptTgt(nearestFire(),'篝火','🔥'):ptTgt(nearestOf(ACT,a=>!a.dead&&a.def&&a.def.flee&&!a.human),'猎物','🦌')},
    {id:'shelter',ok:()=>f.b_shelter,t:'搭一个「庇护所」（木12），天黑后去睡觉'},
    {id:'merchant',ok:()=>f.merchant,t:'去「坊市」找商人（地图上的🏮）',act:'跟着金色箭头走，到商人旁边点「和商人交易」。',tgt:()=>G.merchant?{x:G.merchant.x,z:G.merchant.z,label:'坊市商人',icon:'🏮',zone:true,r:6}:zoneTgt(ZONES.market,'🏮')},
    {id:'water',ok:()=>f.water,t:'做种植田和水壶，播种后打水浇地'},
    {id:'weapon',ok:()=>fa==='A'?G.tools.sword:G.tools.bow,t:fa==='A'?'炼一把「灵剑」（需要灵草）':'做一把「弩」和弩箭'},
    {id:'boss',ok:()=>G.cleared.mid||G.builds.some(b=>b.t==='boat'),t:'击败敌营首领「'+FACTION[fa].boss+'」，或在灵河渡口造灵舟，打通九州航线',tgt:()=>zoneTgt(ZONES.enemy,'⚔')},
    {id:'sail',ok:()=>false,t:'去灵河渡口登上灵舟，打开航线图，前往'+regName(ROUTE()[1]),tgt:()=>zoneTgt(ZONES.river,'⚓')}]}
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
  if(tg&&!G.dead&&!G.over){const dx=tg.x-P.x,dz=tg.z-P.z,d=Math.hypot(dx,dz);const near=tg.zone?d<(tg.r||10)*.6:d<2.2;
    if(near){wp.style.display='none'}else{wp.style.display='';const fx=-Math.sin(CAM.yaw),fz=-Math.cos(CAM.yaw),rx=Math.cos(CAM.yaw),rz=-Math.sin(CAM.yaw);const a=Math.atan2(dx*rx+dz*rz,dx*fx+dz*fz);
      wp.firstChild.style.transform=`rotate(${a-Math.PI/2}rad)`;wp.lastChild.textContent=`${tg.icon} ${tg.label} · ${Math.round(d)} 米`}
    beam.visible=!!tg.zone&&d>8;if(beam.visible){beam.position.set(tg.x,groundAt(tg.x,tg.z),tg.z);beam.userData.c.material.opacity=.22+.08*Math.sin(t*2.5);const s=1+.08*Math.sin(t*3);beam.userData.r.scale.set(s,1,s)}}
  else{wp.style.display='none';beam.visible=false}
  // 互动提示：贴在要捡/要交互的东西上方
  const it=GUIDE.it,ip=GUIDE.ipEl;if(it&&it.pos&&!busy()){const p=proj(it.pos.x,(it.pos.y||groundAt(it.pos.x,it.pos.z))+1.25,it.pos.z);if(p){ip.style.display='';ip.style.transform=`translate(${p[0]}px,${p[1]}px) translate(-50%,-100%)`;ip.innerHTML=(touchUI()?'<i>👆 点「互动」</i>':'<i>E</i>')+it.label}else ip.style.display='none'}else ip.style.display='none';
  updPickMarks(dt,t);
  // 画质建议：只根据本机实测帧率，连续 20 秒低于 24 帧才提示一次
  if(!GUIDE.suggested&&Q.tier!=='min'&&G.started&&!G.paused){GUIDE.lowFps=fpsV<24?GUIDE.lowFps+dt:Math.max(0,GUIDE.lowFps-dt*2);if(GUIDE.lowFps>20){GUIDE.suggested=true;toast('画面有点卡？可以在「设置 → 画质」换成'+(Q.tier==='high'?'「流畅」或「极简」':'「极简」'),1)}}}
function guideMini(c,tp,sc,S,full){const tg=GUIDE.tgt;if(!tg)return;let [x,y]=tp(tg.x,tg.z);const [px,py]=tp(P.x,P.z);const m=10*sc;let out=false;
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
    gainXP(40);const prev=st?st[G._qn-1]:null;showDone(prev?prev.t:'目标完成',['经验 +40'].concat(got).join('　'),q.t);save()}
  G._qn=q.n;G._qid=q.id;GUIDE.step=q;
  try{GUIDE.tgt=q.tgt?q.tgt():null}catch(e){GUIDE.tgt=null}
  if(CH===2&&!GUIDE.tgt){const k=q.n;GUIDE.tgt=k===1?(G.merchant?{x:G.merchant.x,z:G.merchant.z,label:'商人',icon:'🏮',zone:true,r:6}:null):k===2&&CH2OBJ.chest?{x:CH2OBJ.chest.x,z:CH2OBJ.chest.z,label:'秘境宝箱',icon:'🎁',zone:true,r:8}:k===3?zoneTgt(ZONES.enemy,'⚔'):k===4?zoneTgt(ZONES.river,'⚓'):null}
  const tut=CH!==2&&q.n<=TUT_N,rew=CH!==2&&TUT_REW[q.id]&&!rw[q.id]?fmtCost(TUT_REW[q.id]):'';
  el('quest').innerHTML=`<b>${tut?'新手引导 '+q.n+'/'+TUT_N:'目标 '+q.n+'/'+q.all}</b>${q.t}`+(q.prog?`<div class="qp">${q.prog()}</div>`:'')+(q.act?`<div class="qa">👉 ${q.act}</div>`:'')+(rew?`<div class="qr">🎁 奖励：${rew}　经验 +40</div>`:'');
  for(const id of['craftB'])el(id).classList.toggle('hint',q.hl===id&&!el('craft').classList.contains('on'));
  GUIDE.rec=q.rec||null;GUIDE.tab=q.tab||null}
let doneT=null;
function showDone(title,rew,next){const d=GUIDE.doneEl;if(!d)return;d.innerHTML=`<div class="h">✓ 完成：${title}</div><div class="r">获得 ${rew}</div>${next&&next!=='完成'?`<div class="n">下一步：${next}</div>`:''}`;d.classList.remove('on');void d.offsetWidth;d.classList.add('on');el('hud').classList.add('qdon');clearTimeout(doneT);doneT=setTimeout(()=>{d.classList.remove('on');el('hud').classList.remove('qdon')},4200)}
// 拾取反馈：飘字 + 背包格子闪一下
function pickFX(n,l){const T={wood:'🪵',stone:'🪨',herb:'🌿',berry:'🍓',seed:'🌱'};let k=0;for(const key in l){ftxt(n.x,n.y+.7+k*.45,n.z,(T[key]||'')+' +'+l[key]+' '+ITEM[key],'pick');GUIDE.flash[key]=performance.now();k++}
  burst(n.x,n.y+.3,n.z,PICK_MAT[n.kind]||MAT.gold,5,1.2)}
const PICK_MAT={};for(const k in PICK_C)PICK_MAT[k]=new THREE.MeshBasicMaterial({color:PICK_C[k]});
function invFlash(k){return performance.now()-(GUIDE.flash[k]||0)<900}
function qualityLabel(t){return{high:'高清',low:'流畅（省电）',min:'极简（最省电）'}[t]}
