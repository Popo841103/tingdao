/* =====================================================================
   九、玩法补充：闪避与顿帧、序章（修仙开场）、成就与图鉴、各州专属环境
   ===================================================================== */

/* ---------- 声音补充 ---------- */
SFX.dodge=()=>{noise({f:700,f2:2200,q:1.2,d:.22,v:.3,a:.01});tone({f:300,f2:600,d:.15,v:.06,type:'triangle'})};
SFX.perfect=()=>{[0,7,12,19].forEach((s,i)=>pluck(74+s,i*.04,.16,null,1.2));noise({f:4000,f2:8000,q:1,d:.5,v:.15,a:.05,rv:.5})};
SFX.wind=()=>noise({ft:'lowpass',f:300,f2:900,d:2.2,v:.4,a:.8,rv:.3});
SFX.ach=()=>{[0,4,7,12].forEach((s,i)=>pluck(79+s,i*.11,.16,null,1.6));tone({f:hz(91),d:2.5,v:.06,at:.45,rv:.9})};
Object.assign(SFX_VOL,{dodge:3,wind:2.5});

/* ---------- 时间扭曲：命中顿帧、完美闪避慢动作 ---------- */
function timeWarp(dt,raw){if(!G.started)return dt;if(G.hitStop>0){G.hitStop-=raw;return dt*.06}if(G.slowMo>0){G.slowMo-=raw;return dt*.3}return dt}
function hitStop(k){G.hitStop=Math.max(G.hitStop||0,k)}

/* ---------- 闪避：朝摇杆方向（没推摇杆就往后）冲一小段，期间无敌；敌人打中的瞬间闪开 = 完美闪避 ---------- */
function dodge(){if(busy()||G.flying||!P.ground||P.st==='swim'||(P.dodgeCd||0)>0||G.prologue===2)return;
  if(G.sta<12){toast('体力不够，闪避不了');return}
  if(P.sitFire||G.med){P.sitFire=null;G.med=false;G.timeScale=1}
  G.sta-=12;P.dodgeCd=.55;P.dodgeT=.3;P.inv=Math.max(P.inv,.32);
  const mx=IN.mx,mz=IN.mz,ml=Math.hypot(mx,mz);let wx,wz;
  if(ml>.15){const c=Math.cos(CAM.yaw),s=Math.sin(CAM.yaw);wx=(mx*c-mz*s)/ml;wz=(-mx*s-mz*c)/ml;P.yaw=Math.atan2(wx,wz)}else{wx=-Math.sin(P.yaw);wz=-Math.cos(P.yaw)}
  P.kx=wx*17;P.kz=wz*17;sfx('dodge');burst(P.x,P.y+.15,P.z,hitMat,6,1.6);
  if(P.model)play(P.model,'hurt',.25)}
function perfectDodge(){P.dodgeT=0;G.slowMo=.7;G.mana=Math.min(G.maxmana||0,(G.mana||0)+15);G.sta=Math.min(G.maxsta,G.sta+15);
  sfx('perfect');ftxt(P.x,P.y+2.2,P.z,'完美闪避！','lvup');burst(P.x,P.y+1,P.z,MAT.gold||hitMat,12,3);ACH.n.pd=(ACH.n.pd||0)+1;achSave()}

/* ---------- 序章：先当一回大能，再被暗算坠河、修为尽失（新游戏第一章才有，可跳过） ---------- */
let PRO=null;
function proDom(){let d=document.getElementById('pro');if(d)return d;d=document.createElement('div');d.id='pro';
  d.innerHTML='<div class="cap"></div><button id="proSkip">跳过序章 ›</button><div class="flash"></div>';document.body.appendChild(d);
  d.querySelector('#proSkip').onclick=()=>endPrologue(true);return d}
function proCap(t){const c=proDom().querySelector('.cap');c.classList.remove('on');void c.offsetWidth;c.innerHTML=t;c.classList.add('on')}
function startPrologue(){if(CH===2||G.prologue)return;const A=G.faction==='A';
  PRO={t:0,ph:0,snap:{realm:G.realm,skillSel:G.skillSel,lv:G.lv,xp:G.xp,pts:G.pts,qi:G.qi,inv:JSON.parse(JSON.stringify(G.inv)),x:P.x,z:P.z,yaw:P.yaw},foes:[],resp:RESP.length,cast:false};
  G.prologue=1;document.body.classList.add('inpro');G.realm=3;applyOrigin();G.hp=G.maxhp;G.mana=G.maxmana;G.sta=G.maxsta;G.skillSel='tian';
  const Z=ZONES.home,sp=randAround(Z.x,Z.z,16,26)||[Z.x+2,Z.z+2];P.x=sp[0];P.z=sp[1];PRO.cam=[CAM.dist,CAM.pitch];CAM.dist=10;CAM.pitch=.42;G.flying=true;P.ground=false;P.y=groundAt(P.x,P.z)+6.5;P.vy=0;P.inv=999;
  for(let i=0;i<3;i++){const p=randAround(P.x,P.z,5,10)||[P.x+4,P.z+4];const a=spawnSoldier(p[0],p[1],{aggro:40,prolog:1});a.angry=true;PRO.foes.push(a)}
  proDom().classList.add('on');sfx('gong');try{$('#toast').classList.remove('on')}catch(e){}
  proCap(`<b>${ORIGINS[G.faction][G.origin]} · ${realmN(3)}${A?'修士':'改造人'}</b><br>${A?'你御剑巡游中州，一身修为，罕逢敌手。':'你背着喷射背包巡查中州，神经接驳全开，罕逢敌手。'}`)}
function updPrologue(dt){if(!PRO)return;PRO.t+=dt;const A=G.faction==='A';P.inv=999;
  if(PRO.ph===0&&PRO.t>4){PRO.ph=1;PRO.t=0;proCap(`${A?'敌方修士':'敌方士兵'}追杀而来！<br><b>点「${SKILLS.tian.n()}」</b>（电脑按 R）${A?'引天雷':'呼叫轨道打击'}劈下去！`)}
  if(PRO.ph===1){G.mana=G.maxmana;const alive=PRO.foes.filter(a=>!a.dead).length;
    if(PRO.t>12&&!PRO.cast){PRO.cast=true;castSkill('tian')}
    if(!alive||PRO.t>16){PRO.ph=2;PRO.t=0;proCap('……身后，一道黑雷无声落下。')}}
  if(PRO.ph===2&&PRO.t>1.6&&!PRO.hit){PRO.hit=true;lightning(P.x,P.z);shake(.8);hitStop(.25);const f=proDom().querySelector('.flash');f.classList.remove('on');void f.offsetWidth;f.classList.add('on');
    G.flying=false;G.prologue=2;if(P.model)play(P.model,'hurt',.6)}
  if(PRO.ph===2&&PRO.t>3.2){PRO.ph=3;PRO.t=0;$('#fade').classList.add('on');proCap(`你坠入灵河，${A?'金丹碎裂，元婴溃散':'义体烧毁，接驳断开'}——<br><b>修为尽失。</b>`)}
  if(PRO.ph===3&&PRO.t>3.4)endPrologue(false)}
function endPrologue(skip){if(!PRO)return;const s=PRO.snap;
  for(const a of PRO.foes)if(!a.dead){a.dead=true;a.deadT=999}RESP.length=Math.min(RESP.length,PRO.resp);
  G.realm=s.realm;G.skillSel=s.skillSel;G.lv=s.lv;G.xp=s.xp;G.pts=s.pts;G.qi=s.qi;G.inv=s.inv;applyOrigin();G.hp=G.maxhp;G.mana=G.maxmana;G.sta=G.maxsta;
  if(PRO.cam){CAM.dist=PRO.cam[0];CAM.pitch=PRO.cam[1]}G.flying=false;P.x=s.x;P.z=s.z;P.yaw=s.yaw;P.y=groundAt(P.x,P.z);P.vy=0;P.ground=true;P.inv=0;P.kx=P.kz=0;G.prologue=0;PRO=null;G.flags.prologue=1;
  document.body.classList.remove('inpro');$('#fade').classList.add('on');
  proCap(`醒来时，你躺在<b>中州·灵河界</b>的岸边。<br>${G.faction==='A'?'修为':'义体'}要从头再来……先活下去，再找回失去的一切。`);
  setTimeout(()=>{$('#fade').classList.remove('on')},600);
  setTimeout(()=>{const d=document.getElementById('pro');if(d&&!PRO)d.classList.remove('on')},skip?2600:4200);
  setTimeout(()=>toast('你在「我方营地」。地上发光的是树枝和石子，先捡几样吧',1),skip?2800:4400);
  ui.refresh();save()}

/* ---------- 成就与图鉴（跨存档保留，存在本机） ---------- */
const ACH=(()=>{let a=null;try{a=JSON.parse(localStorage.getItem('td5_ach')||'null')}catch(e){}a=a||{};a.got=a.got||{};a.kills=a.kills||{};a.names=a.names||{};a.best=a.best||{};a.n=a.n||{};return a})();
function achSave(){try{localStorage.setItem('td5_ach',JSON.stringify(ACH))}catch(e){}}
const BEAST_ORDER=['rabbit','deer','boar','wolf','ghost','soldier','boss','guard2','xinmo'];
const realmAch=r=>()=>G.realm>=r;
const ACHS=[
  ['chop1','第一斧','砍倒第一棵树',()=>(G.flags.chop||0)>=1],
  ['tree20','伐木工','累计砍倒 20 棵树',()=>(ACH.n.tree||0)>=20],
  ['fire','星星之火','建起第一堆篝火',()=>G.flags.b_fire],
  ['shelter','安身之所','搭好庇护所',()=>G.flags.b_shelter],
  ['cook','第一口热饭','在篝火边烤肉',()=>G.flags.cook],
  ['merchant','坊市来客','找到坊市商人',()=>G.flags.merchant],
  ['wolf','屠狼者','击败一只狼',()=>(ACH.kills.wolf||0)>=1],
  ['hunter','老猎户','累计猎杀 20 只野兽',()=>['rabbit','deer','boar','wolf'].reduce((s,k)=>s+(ACH.kills[k]||0),0)>=20],
  ['ghost','驱邪','打散 10 个夜晚游魂',()=>(ACH.kills.ghost||0)>=10],
  ['soldier10','以一敌十','累计击败 10 名敌兵',()=>(ACH.kills.soldier||0)>=10],
  ['boss1','灵河之主','击败中州敌营首领',()=>G.cleared&&G.cleared.mid],
  ['night5','熬过五夜','活到第 6 天',()=>G.day>=6],
  ['lv10','小有所成','等级达到 10',()=>G.lv>=10],
  ['lv25','一方高手','等级达到 25',()=>G.lv>=25],
  ['realm1','初入道途','突破到第二境界',realmAch(1)],
  ['realm2','金丹 / 超频','突破到第三境界',realmAch(2)],
  ['realm3','元婴 / 接驳','突破到第四境界（找回序章里的力量）',realmAch(3)],
  ['realm4','化神 / 飞升','突破到最高境界',realmAch(4)],
  ['pet1','第一只灵兽','收服一只灵兽',()=>PETS.length>=1],
  ['pet5','万兽之主','同时拥有 5 只灵兽',()=>PETS.length>=5],
  ['chest','秘境寻宝','打开秘境宝箱',()=>G.flags.chest],
  ['pd10','身轻如燕','完美闪避 10 次',()=>(ACH.n.pd||0)>=10],
  ['reg3','九州行者','收复 3 个州',()=>G.cleared&&Object.keys(G.cleared).length>=3],
  ['final','飞升','击败天道化身',()=>G.cleared&&G.cleared.tx]];
let achTick=0;
function achCheck(dt){achTick-=dt;if(achTick>0||!G.started||G.prologue)return;achTick=1;let ch=false;
  for(const [id,n,d,ok] of ACHS){if(ACH.got[id])continue;let v=false;try{v=ok()}catch(e){}if(v){ACH.got[id]=Date.now();ch=true;achPop(n,d)}}if(ch)achSave()}
function achPop(n,d){sfx('ach');let e=document.getElementById('achPop');if(!e){e=document.createElement('div');e.id='achPop';document.body.appendChild(e)}
  e.innerHTML=`<small>🏆 成就达成</small><b>${n}</b><span>${d}</span>`;e.classList.remove('on');void e.offsetWidth;e.classList.add('on')}
function achKill(a){if(G.prologue)return;const k=a.boss?'boss':a.xinmo?'xinmo':a.guard2?'guard2':a.ghost?'ghost':a.human?'soldier':a.kind;ACH.kills[k]=(ACH.kills[k]||0)+1;if(a.name)ACH.names[k]=a.boss?'各州首领':a.name;achSave()}
function achTree(){if(!G.started||G.prologue)return;ACH.n.tree=(ACH.n.tree||0)+1}
function achEnd(kind){const k={final:'飞升（通关）',escape:'造舟回乡',conquer:'征服敌营'}[kind]||kind;const b=ACH.best[k];if(!b||G.day<b)ACH.best[k]=G.day;achSave()}
let achTab='ach';
function drawAch(){const tabs=`<div id="atabs"><button class="${achTab==='ach'?'sel':''}" data-t="ach">成就 ${Object.keys(ACH.got).length}/${ACHS.length}</button><button class="${achTab==='book'?'sel':''}" data-t="book">图鉴</button><button class="${achTab==='best'?'sel':''}" data-t="best">最佳纪录</button></div>`;
  let body='';
  if(achTab==='ach')body=ACHS.map(([id,n,d])=>`<div class="rc ${ACH.got[id]?'ok':''}"><div><b>${ACH.got[id]?'🏆':'🔒'} ${n}</b><small>${d}</small></div></div>`).join('');
  if(achTab==='book'){const NM={rabbit:'灵兔',deer:'灵鹿',boar:'野猪',wolf:'狼',ghost:'夜晚游魂',soldier:'敌兵',boss:'各州首领',guard2:'守山灵兽',xinmo:'心魔'};
    body=BEAST_ORDER.map(k=>{const c=ACH.kills[k]||0;return `<div class="rc ${c?'ok':''}"><div><b>${c?(ACH.names[k]&&k!=='soldier'?ACH.names[k]:NM[k]):'？？？'}</b><small>${c?'已击败 '+c+' 次':'尚未遇到'}</small></div></div>`}).join('')+
      `<div class="lore">灵兽：已收服 ${PETS.length} 只${PETS.length?'（'+PETS.map(p=>p.name).join('、')+'）':''}</div>`}
  if(achTab==='best'){const e=Object.entries(ACH.best);body=e.length?e.map(([k,v])=>`<div class="rc ok"><div><b>${k}</b><small>最快第 ${v} 天完成</small></div></div>`).join(''):'<div class="lore">还没有通关纪录。击败敌营首领、造舟回乡或最终飞升后，这里会记下你用了几天。</div>'}
  el('alist').innerHTML=tabs+body;el('alist').querySelectorAll('#atabs button').forEach(b=>b.onclick=()=>{achTab=b.dataset.t;drawAch()})}

/* ---------- 各州专属环境 ---------- */
const ENV={t:0,cold:0,hintT:0,emp:0,shown:false};
const ENV_INFO={snow:'❄ 雪原：离开篝火会越来越冷，冷透了会掉血。夜里更冷。',desert:'☀ 沙海：白天酷热，饱食消耗加快。泡进绿洲水里能降温。',volcano:'🌋 火山：天上会落下火雨，看到红圈就闪避！',swamp:'☠ 沼泽：泥水里有瘴气，别在浅水里久站。',
  city:'⚡ 霓虹城：时不时会刮起电磁风暴，期间技能失灵。',plateau:'🌬 云台：罡风阵阵，会把人吹开，注意别被吹下崖。',autumn:'⛈ 枫林：雷暴天气，看到红圈赶快躲开落雷！',sakura:'🌸 仙州故土：灵气充沛，灵气会自动缓慢增长。',sky:'☁ 天墟：重力减轻，跳得更高、飘得更远。'};
function envHud(t){let e=document.getElementById('envB');if(!e){e=document.createElement('div');e.id='envB';const z=el('zone');z.parentNode.insertBefore(e,z.nextSibling)}e.textContent=t||'';e.style.display=t?'':'none'}
function warmNear(r){return nearFire(P.x,P.z,r)||!!P.sitFire}
function hazardStrike(kind){const p=Math.random()<.5?[P.x+rnd(-1.2,1.2),P.z+rnd(-1.2,1.2)]:(randAround(P.x,P.z,1,6)||[P.x,P.z]);const r=kind==='fire'?2.4:2;warnRing(p[0],p[1],r,1.3);
  later(1.3,()=>{if(!G.started||G.dead)return;if(kind==='fire'){burst(p[0],groundAt(p[0],p[1])+.3,p[1],MAT.flame2,14,5);sfx('boom');shake(.2)}else lightning(p[0],p[1]);
    if(Math.hypot(P.x-p[0],P.z-p[1])<r&&!G.flying)hurtPlayer((kind==='fire'?16:20)*DIFF,p[0],p[1])})}
function updEnv(dt){const T=CH===2?REGD.terr:null;G.grav=T==='sky'?13:22;if(!T||!G.started||G.dead||G.over||G.paused||P.st==='sleep'){if(!T)envHud('');return}
  if(!ENV.shown){ENV.shown=true;if(ENV_INFO[T])toast(ENV_INFO[T],1)}
  ENV.t-=dt;ENV.hintT-=dt;const night=G.hour<6||G.hour>19;let hud=ENV_INFO[T]?ENV_INFO[T].slice(0,2)+' ':'';
  if(T==='snow'){const warm=warmNear(7);ENV.cold=clamp(ENV.cold+(warm?-10:(night?1.4:.7))*dt,0,100);hud+='寒冷 '+Math.round(ENV.cold)+'%';
    if(ENV.cold>=100){G.hp-=1.5*dt;if(G.hp<=0){G.hp=0;die()}if(ENV.hintT<=0){ENV.hintT=20;toast('冻僵了！快回篝火边取暖（或造一堆篝火）')}}}
  else if(T==='desert'){const hot=G.hour>9.5&&G.hour<17.5,cool=waterDepth(P.x,P.z)>.3;if(hot&&!cool){G.hunger=Math.max(0,G.hunger-.25*dt);hud+='酷热中'}else hud+=cool?'清凉':'凉爽'}
  else if(T==='volcano'){hud+='火雨';if(ENV.t<=0){ENV.t=rnd(8,13);hazardStrike('fire')}}
  else if(T==='swamp'){const d=waterDepth(P.x,P.z);if(d>.12&&P.st!=='swim'&&!G.flying){G.hp-=2*dt;hud+='中瘴气！';if(G.hp<=0){G.hp=0;die()}if(ENV.hintT<=0){ENV.hintT=15;toast('瘴气入体：快离开泥水')}}else hud+='瘴气'}
  else if(T==='city'){if(ENV.emp>0){ENV.emp-=dt;G.mana=Math.max(0,G.mana-12*dt);hud+='电磁风暴 '+Math.ceil(ENV.emp)+'s'}else{hud+='电磁平稳';if(ENV.t<=0){ENV.t=rnd(45,65);ENV.emp=8;toast('⚡ 电磁风暴！8 秒内技能失灵',1);sfx('thunderShot')}}}
  else if(T==='plateau'){hud+='罡风';if(ENV.t<=0){ENV.t=rnd(15,24);const a=rnd(0,6.28);toast('🌬 罡风来了！');sfx('wind');later(1,()=>{if(G.dead)return;const k=(G.flying||!P.ground)?16:11;P.kx+=Math.cos(a)*k;P.kz+=Math.sin(a)*k})}}
  else if(T==='autumn'){hud+='雷暴';if(ENV.t<=0){ENV.t=rnd(10,16);hazardStrike('bolt')}}
  else if(T==='sakura'){gainQi(dt*.3);hud+='灵气充沛'}
  else if(T==='sky'){hud+='低重力'}
  envHud(hud)}

/* 「互动」键附近没东西时：饿了就吃 */
function actEat(){if(busy())return;if(G.hunger<96&&['cooked','grain','berry','meat','potion'].some(k=>(G.inv[k]||0)>0))eat()}

/* ---------- 全景天空：某些州用 360° 全景图（等距柱状投影 2:1）代替程序天空，配置在 REGIONS 的 pano 字段 ---------- */
const PANO={m:null};
if(CH===2&&REGD.pano){new THREE.TextureLoader().load(REGD.pano,t=>{t.colorSpace=THREE.SRGBColorSpace;const g=new THREE.SphereGeometry(1200,48,24);g.scale(-1,1,1);
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:t,fog:false,toneMapped:false,depthWrite:false}));m.renderOrder=-1;m.frustumCulled=false;scene.add(m);PANO.m=m;
  sky.visible=false;stars.visible=false;moon.visible=false;cloudMat.visible=false},undefined,e=>console.warn('pano',e))}
function updPano(){if(!PANO.m)return;PANO.m.position.copy(camera.position);const {day}=dayK();PANO.m.material.color.setScalar(.4+.6*day)}

/* ---------- 场景模型（混元生成）：河边亭子、灵舟。没加载到模型时退回程序拼的 ---------- */
function fitModel(gl,size,axis){const o=gl.scene.clone(true);const b=new THREE.Box3().setFromObject(o),sz=b.getSize(new THREE.Vector3());const k=size/(axis==='y'?sz.y:Math.max(sz.x,sz.z));
  o.scale.setScalar(k);const b2=new THREE.Box3().setFromObject(o),c=b2.getCenter(new THREE.Vector3());o.position.set(-c.x,-b2.min.y,-c.z);const g=new THREE.Group();g.add(o);
  o.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true}});return g}
function modelBoat(){try{if(!GROKM.boat)return null}catch(e){return null}   // 启动早期 GROKM 还没初始化
  const g=fitModel(GROKM.boat,10,'xz');g.children[0].position.y-=1.1;   // 船身吃水 1.1 米
  const dummy=new THREE.Object3D();dummy.visible=false;g.add(dummy);g.userData.sail=dummy;return g}
function placeSceneModels(){
  if(PAV&&!PAV.done){PAV.done=true;if(GROKM.pavilion){const g=fitModel(GROKM.pavilion,5.2,'y');g.position.set(PAV.x,groundAt(PAV.x,PAV.z)-.05,PAV.z);g.rotation.y=PAV.ry;scene.add(g)}else PAV.proc()}
  if(GROKM.boat)for(const b of DECOR_BOATS){const nb=modelBoat();for(const ch of [...b.children])ch.visible=false;const s=b.scale.x;nb.scale.setScalar(1/Math.max(.01,s)*Math.min(1,s*1.4));b.add(nb)}}

/* ---------- 每帧 ---------- */
function moreTick(dt){updPano();P.dodgeCd=(P.dodgeCd||0)-dt;P.dodgeT=(P.dodgeT||0)-dt;updPrologue(dt);achCheck(dt);updEnv(dt)}
