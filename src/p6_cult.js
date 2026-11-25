
/* =====================================================================
   六、九州进阶：航线与区域、首领材料与功法、修炼（打坐/灵脉/灵气）、境界与渡劫、
       修仙技能、收服灵兽与灵兽干活、敌人先观察试探、峰顶宝箱与上升气流
   ===================================================================== */
const ROUTE=()=>routeFor(G.faction,G.origin);
for(const k in REGIONS)if(REGIONS[k].mat)ITEM['m_'+k]=REGIONS[k].mat;
ITEM.fu='驭兽符';
const regMat=k=>'m_'+k;
const regName=k=>REGIONS[k].n;
function nextRegion(){const r=ROUTE(),i=r.indexOf(REGK);return i>=0?r[i+1]||null:null}
function regionUnlocked(k){const r=ROUTE(),i=r.indexOf(k);if(i<=0)return true;return !!G.cleared[r[i-1]]}
function travel(k){
  G.bases[REGK]=G.builds.map(b=>({t:b.t,x:b.x,z:b.z,ry:b.ry,stage:b.stage,g:b.g}));G.rflags[REGK]=G.flags;
  const s=saveObj();s.reg=k;s.ch=k==='mid'?1:2;s.builds=G.bases[k]||[];s.x=null;s.z=null;s.bossDead=!!G.cleared[k];s.flags=G.rflags[k]||{};s.hour=9;s.day=G.day+1;s.hp=G.maxhp;s.sta=G.maxsta;
  try{writeSave(s);sessionStorage.setItem('td5_auto','1')}catch(e){}$('#fade').classList.add('on');setTimeout(()=>location.reload(),700)}

/* ---------- 境界 ---------- */
const REALMS=[
  {n:['炼气','凡躯'],hp:0,sta:0,mana:0,atk:0},
  {n:['筑基','强化'],hp:40,sta:25,mana:50,atk:.25,lv:8,qi:120,mat:0,herb:6,ling:3},
  {n:['结丹','超频'],hp:90,sta:50,mana:110,atk:.55,lv:16,qi:300,mat:6,ling:6},
  {n:['元婴','神经接驳'],hp:150,sta:80,mana:180,atk:.9,lv:24,qi:600,mat:12,ling:10},
  {n:['化神','机械飞升'],hp:230,sta:120,mana:260,atk:1.4,lv:32,qi:1000,mat:20,ling:15}];
const realmN=r=>REALMS[r].n[G.faction==='A'?0:1];
const matTotal=()=>Object.keys(G.inv).filter(k=>k.startsWith('m_')).reduce((s,k)=>s+(G.inv[k]||0),0);
function takeMats(n){const ks=Object.keys(G.inv).filter(k=>k.startsWith('m_')).sort((a,b)=>G.inv[b]-G.inv[a]);for(const k of ks){const t=Math.min(n,G.inv[k]);G.inv[k]-=t;n-=t;if(n<=0)break}}
const qiNeed=()=>G.realm<4?REALMS[G.realm+1].qi:REALMS[4].qi;
function gainQi(n){G.qi=Math.min(qiNeed()*1.5,(G.qi||0)+n)}
function realmHTML(){const A=G.faction==='A',r=G.realm;let h=`<div class="realm"><b>境界：${realmN(r)}</b>　灵气 ${Math.floor(G.qi||0)}`;
  if(r<4){const N=REALMS[r+1],ok=G.lv>=N.lv&&G.qi>=N.qi&&matTotal()>=N.mat&&(G.inv.ling||0)>=N.ling&&(!N.herb||(G.inv.herb||0)>=N.herb);
    const it=(c,t)=>`<i class="${c?'':'no'}">${t}</i>`;
    h+=`<br>下一境界「${realmN(r+1)}」需要：<span class="req">${it(G.lv>=N.lv,'等级 '+G.lv+'/'+N.lv)}${it(G.qi>=N.qi,'灵气 '+Math.floor(G.qi)+'/'+N.qi)}${it((G.inv.ling||0)>=N.ling,'灵石 '+(G.inv.ling||0)+'/'+N.ling)}${N.herb?it((G.inv.herb||0)>=N.herb,'灵草 '+(G.inv.herb||0)+'/'+N.herb):''}${N.mat?it(matTotal()>=N.mat,'各州材料 '+matTotal()+'/'+N.mat):''}</span>
    <button id="tribBtn" class="big" ${ok?'':'disabled'} style="font-size:15px;padding:8px 18px;margin-top:6px">${A?'渡劫突破':'过载突破'}</button><small>突破时会降下${A?'雷劫':'能量风暴'}：先躲开 ${6+3*r} 道落雷（红圈），再打败你的心魔。失败不会死，但会损失部分灵气。</small>`}
  else h+='<br>已达最高境界。';
  const act=Object.keys(SKILLS).filter(k=>k!=='base'&&G.realm>=SKILLS[k].realm).map(k=>SKILLS[k].n()).join('、')||'（筑基后解锁）';
  const pas=PASSIVES.filter(p=>G.realm>=p[0]).map(p=>p[1]).join('<br>')||'（筑基后解锁）';
  const pk=Object.keys(G.perks||{}).map(k=>PERKS[k]).join('<br>')||'（打败各州首领领悟）';
  return h+`<br><b>已掌握技能：</b>${act}<br><b>境界被动：</b><br>${pas}<br><b>功法（各州首领所得）：</b><br>${pk}<br><b>兵器强化：</b>+${G.wtier||0}</div>`}

/* ---------- 修仙技能 ---------- */
const SKILLS={
  base:{n:()=>G.faction==='A'?(G.tools.thunder?'雷符':'火符'):'射击',realm:0},
  shen:{n:()=>G.faction==='A'?'神识':'扫描',realm:1,cost:25},
  fly:{n:()=>G.flying?'落地':(G.faction==='A'?'御剑':'喷射飞行'),realm:2,cost:10},
  tian:{n:()=>G.faction==='A'?'天罚':'轨道打击',realm:3,cost:45},
  clone:{n:()=>G.faction==='A'?'分身':'全息分身',realm:3,cost:50},
  slow:{n:()=>G.faction==='A'?'时缓领域':'时间力场',realm:4,cost:60},
  blink:{n:()=>G.faction==='A'?'瞬身':'相位跳跃',realm:4,cost:20}};
const PASSIVES=[[1,'御风：空中可再跳一次，没有滑翔伞也能滑翔'],[1,'神识 / 扫描：20 秒内地图显示附近宝箱、灵脉、野兽'],[2,'灵植催生：种植田生长 ×3，灵兽干活 ×1.5'],[2,'御剑飞行：自由飞行，按住「跳」上升'],[3,'元婴护体：受到伤害 -10%'],[4,'化神：灵气自动缓慢增长']];
function cycleSkill(){const ks=Object.keys(SKILLS).filter(k=>G.realm>=SKILLS[k].realm);const i=ks.indexOf(G.skillSel);G.skillSel=ks[(i+1)%ks.length];toast('技能键：'+SKILLS[G.skillSel].n()+(ks.length<2?'（筑基后会解锁更多修仙技能）':''))}
function castSkill(k){const S=SKILLS[k];if(k==='fly'&&G.flying){G.flying=false;toast('收起飞行');return}
  if(S.cost&&G.mana<S.cost){toast((G.faction==='A'?'灵力':'能量')+'不足（需要 '+S.cost+'）');return}if(S.cost)G.mana-=S.cost;P.atkCd=.4;if(k!=='tian')sfx('skill');
  if(k==='shen'){G.revealT=20;const n=PCHESTS.filter(c=>!c.open&&Math.hypot(c.x-P.x,c.z-P.z)<200).length;burst(P.x,P.y+1.6,P.z,MAT.crystal,12,3);toast('神识展开：附近还有 '+n+' 个未开的宝箱（看地图）')}
  if(k==='fly'){G.flying=true;P.vy=3;P.ground=false;toast((G.faction==='A'?'御剑飞行':'喷射飞行')+'：按住「跳」上升，松开慢慢下降，再按技能键落地')}
  if(k==='tian'){let n=0;for(const a of ACT){if(a.dead||Math.hypot(a.x-P.x,a.z-P.z)>15)continue;lightning(a.x,a.z);hurtActor(a,60*G.skillMul,P.x,P.z,3,.8);n++}play(P.model,'throw',.5);if(!n)lightning(P.x+Math.sin(P.yaw)*6,P.z+Math.cos(P.yaw)*6);shake(.3)}
  if(k==='clone'){spawnAlly();toast('分身出现，协助你战斗 30 秒')}
  if(k==='slow'){G.slowT=8;burst(P.x,P.y+1,P.z,MAT.crystal,20,6);toast('领域展开：周围敌人变慢 8 秒')}
  if(k==='blink'){const fx=Math.sin(P.yaw),fz=Math.cos(P.yaw);let x=P.x,z=P.z;for(let i=0;i<24;i++){const [nx,nz]=collide(x+fx*.5,z+fz*.5,.35);x=nx;z=nz}burst(P.x,P.y+1,P.z,hitMat,8,2);P.x=x;P.z=z;P.y=Math.max(P.y,groundAt(x,z));burst(x,P.y+1,z,hitMat,8,2)}}
function lightning(x,z){sfx('thunder');const y=groundAt(x,z);const m=new THREE.Mesh(new THREE.BoxGeometry(.25,60,.25).translate(0,30,0),new THREE.MeshBasicMaterial({color:'#cfe8ff',transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false}));m.position.set(x,y,z);scene.add(m);
  burst(x,y+.4,z,hitMat,10,4);let t=0;FX_RINGS.push({upd:dt=>{t+=dt;m.material.opacity=.95*(1-t/.3);m.scale.x=m.scale.z=1+Math.sin(t*60)*.5;if(t>=.3){scene.remove(m);return true}}})}

/* ---------- 修炼：打坐吸收灵气（灵脉旁 ×5） ---------- */
function nearLingmai(){return LINGMAI.find(l=>Math.hypot(l.x-P.x,l.z-P.z)<4.5)}
function startMeditate(){if(G.dead||G.over||busy())return;if(G.med){G.med=false;G.timeScale=1;return}if(G.flying||!P.ground){toast('落地后才能打坐');return}sfx('bowl');
  if(ACT.some(a=>!a.dead&&(a.angry||a.human)&&!a.def?.flee&&Math.hypot(a.x-P.x,a.z-P.z)<14)){toast('附近有敌人，静不下心');return}
  P.sitFire=null;G.med=true;G.timeScale=3;toast(nearLingmai()?'在灵脉旁打坐：灵气吸收 ×5':(G.faction==='A'?'打坐修炼：慢慢吸收天地灵气（去发光的灵脉旁会快 5 倍）':'充能冥想：吸收环境能量（去发光的灵脉旁会快 5 倍）'))}
const aura=new THREE.Mesh(new THREE.TorusGeometry(1,.05,6,32),new THREE.MeshBasicMaterial({color:'#9af0ff',transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false}));aura.rotation.x=Math.PI/2;aura.visible=false;scene.add(aura);
function brewPill(){const A=G.faction==='A';if((G.inv.herb||0)<4){toast((A?'炼聚气丹':'灵能充能')+'需要灵草 4（现在 '+(G.inv.herb||0)+'）');return}G.inv.herb-=4;const n=Math.round(80*(1+G.realm*.4));gainQi(n);const fu=CH2OBJ.furnace;if(fu)burst(fu.x,fu.obj.position.y+2,fu.z,MAT.flame,14,3);P.lock=1;P.st='kneel';toast((A?'炼成聚气丹，服下：':'充能完成：')+'灵气 +'+n);gainXP(5)}

/* ---------- 渡劫：落雷 + 心魔 ---------- */
STY.xinmo={top:'#2a2034',top2:'#8a3aaa',bottom:'#1a1424',robe:1,hair:'#0a0a0a',hat:'tail',belt:'#8a3aaa',shoe:'#111',fore:'#6a5a7a',big:1.12};
function startTrib(){const r=G.realm;if(r>=4)return;const N=REALMS[r+1];
  if(!(G.lv>=N.lv&&G.qi>=N.qi&&matTotal()>=N.mat&&(G.inv.ling||0)>=N.ling&&(!N.herb||(G.inv.herb||0)>=N.herb))){toast('条件还不够，打开「人物」看看缺什么');return}
  if(ACT.some(a=>!a.dead&&a.human&&Math.hypot(a.x-P.x,a.z-P.z)<30)){toast('附近有敌人，找个清静地方再渡劫');return}
  G.inv.ling-=N.ling;if(N.herb)G.inv.herb-=N.herb;takeMats(N.mat);G.med=false;G.flying=false;G.timeScale=1;
  G.trib={n:6+3*r,wave:0,t:2,phase:'thunder',r};toast(G.faction==='A'?'天雷滚滚，雷劫降临！躲开地上的红圈！':'能量风暴来袭！躲开地上的红圈！',1);shake(.3)}
function updTrib(dt){const T=G.trib;if(!T)return;
  if(T.phase==='thunder'){T.t-=dt;if(T.t<=0){T.wave++;T.t=Math.max(.75,1.3-T.r*.1);const pts=[[P.x+rnd(-1,1),P.z+rnd(-1,1)]];if(T.r>=1)pts.push([P.x+rnd(-5,5),P.z+rnd(-5,5)]);if(T.r>=3)pts.push([P.x+rnd(-5,5),P.z+rnd(-5,5)]);
      for(const [x,z] of pts){warnRing(x,z,2.6,.9);later(.9,()=>{if(!G.trib)return;lightning(x,z);shake(.25);if(Math.hypot(P.x-x,P.z-z)<2.6)hurtPlayer(14+T.r*11,x,z)})}
      if(T.wave>=T.n){T.phase='wait';later(1.6,()=>{if(!G.trib)return;T.phase='heart';spawnHeart()})}}}}
function spawnHeart(){const o=makeHuman('xinmo');setProp(o,G.faction==='A'?'sword':'shovel');const p=randAround(P.x,P.z,5,8)||[P.x+5,P.z];const r=G.trib.r;
  const a=addActor({kind:'xinmo',human:true,xinmo:true,name:'心魔',obj:o,x:p[0],z:p[1],hp:Math.round((320+260*r)*DIFF),dmg:(12+7*r)*DIFF,speed:5.2,r:.45,h:2,home:{x:P.x,z:P.z},aggro:80,angry:true,raid:1,stalk:0});
  toast('心魔现身：「你真的有资格更进一步吗？」打败它！',1)}
function tribSuccess(){sfx('levelup');const was=G.realm;G.realm++;G.trib=null;applyOrigin();G.hp=G.maxhp;G.sta=G.maxsta;G.mana=G.maxmana;G.qi=Math.max(0,G.qi-REALMS[G.realm].qi);
  burst(P.x,P.y+1,P.z,MAT.gold,30,5);burst(P.x,P.y+1,P.z,MAT.crystal,20,4);ftxt(P.x,P.y+3,P.z,'突破！','lvup');
  const ns=Object.keys(SKILLS).filter(k=>SKILLS[k].realm===G.realm).map(k=>SKILLS[k].n()).join('、');
  toast((G.faction==='A'?'渡劫成功！':'过载突破成功！')+realmN(was)+' → '+realmN(G.realm)+'：生命、灵力、攻击大幅提升'+(ns?'；新技能：'+ns+'（按「换」切换技能）':''),1);gainXP(100);save()}
function tribFail(){G.hp=Math.round(G.maxhp*.3);G.qi=Math.round(G.qi*.6);for(const a of ACT)if(a.xinmo&&!a.dead){a.dead=true;a.deadT=999}G.trib=null;toast('渡劫失败……修为受损（灵气损失四成），休养后再来',1)}

/* ---------- 分身（元婴技能） ---------- */
const ALLIES=[];
function spawnAlly(){const o=G.faction==='A'?makeHuman('A'):makeHuman('B');o.traverse(m=>{if(m.isMesh){m.material=m.material.clone();m.material.transparent=true;m.material.opacity=.55;m.material.emissive=new THREE.Color('#4a8aff');m.material.emissiveIntensity=.5}});setProp(o,'sword');
  o.position.set(P.x+1,P.y,P.z);scene.add(o);ALLIES.push({obj:o,x:P.x+1,z:P.z,yaw:P.yaw,t:30,cd:0,dmg:24*G.skillMul})}
function updAllies(dt){for(let i=ALLIES.length-1;i>=0;i--){const a=ALLIES[i];a.t-=dt;if(a.t<=0){burst(a.x,groundAt(a.x,a.z)+1,a.z,hitMat,10,2);scene.remove(a.obj);ALLIES.splice(i,1);continue}
  const foe=ACT.filter(e=>!e.dead&&!e.def?.flee&&Math.hypot(e.x-P.x,e.z-P.z)<18).sort((p,q)=>Math.hypot(p.x-a.x,p.z-a.z)-Math.hypot(q.x-a.x,q.z-a.z))[0];
  let tx=P.x-Math.sin(P.yaw)*2+1,tz=P.z-Math.cos(P.yaw)*2,sp=6;a.cd-=dt;
  if(foe){tx=foe.x;tz=foe.z;sp=7;const d=Math.hypot(foe.x-a.x,foe.z-a.z);if(d<foe.r+1.6){sp=0;if(a.cd<=0){a.cd=.7;play(a.obj,'swing',.5);hurtActor(foe,a.dmg,a.x,a.z,3)}}}
  const dx=tx-a.x,dz=tz-a.z,l=Math.hypot(dx,dz);let rs=0;if(l>1&&sp){const st=Math.min(l,sp*dt);a.x+=dx/l*st;a.z+=dz/l*st;a.yaw=Math.atan2(dx,dz);rs=sp}
  a.obj.position.set(a.x,groundAt(a.x,a.z),a.z);a.obj.rotation.y=a.yaw;animHuman(a.obj,'walk',rs,dt)}}

/* ---------- 收服灵兽 ---------- */
const PETS=[];
const PETDMG={wolf:14,boar:16,deer:6,rabbit:3};
const PETWORK={wolf:{meat:1,hide:.4},boar:{wood:2,stone:1},deer:{herb:1,berry:2},rabbit:{seed:1,berry:1}};
function tame(a){if(!(G.inv.fu>0)){toast('需要「驭兽符」：打开制造，用 灵草2 灵石1 做');return}if(PETS.length>=6){toast('灵兽最多 6 只，先在「灵兽」面板放生一只');return}
  G.inv.fu--;const ch=.35+.6*(1-a.hp/a.maxhp)+G.realm*.05-(a.guard2?.25:0);P.lock=.8;play(P.model,'throw',.5);burst(a.x,a.y+1,a.z,MAT.crystal,10,2);
  if(Math.random()>ch){a.angry=true;a.stalk=0;toast('收服失败，它挣脱了驭兽符！（血越少越容易收服）');return}
  const big=a.sz||1,name=a.guard2?'守山灵兽':a.name;scene.remove(a.obj);if(a.bar){a.bar.remove();a.bar=null}ACT.splice(ACT.indexOf(a),1);
  const role=PETS.some(p=>p.role==='follow')?(G.builds.some(b=>b.t==='pen')?'work':'rest'):'follow';const p=addPet({kind:a.kind,name,role,big},a.x,a.z);
  toast('收服了'+name+'！它现在'+({follow:'跟着你战斗',work:'在灵兽栏干活',rest:'在营地休息'}[role])+'（点「灵兽」按钮安排它）',1);gainXP(15);save()}
function addPet(d,x,z){const o=makeBeast(d.kind);o.scale.setScalar(d.big||1);const ring=new THREE.Mesh(new THREE.RingGeometry(.55,.68,24).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:'#5aff9a',transparent:true,opacity:.7,depthWrite:false}));ring.position.y=.05;o.add(ring);
  if(x==null){x=P.x+rnd(-2,2);z=P.z+rnd(-2,2)}o.position.set(x,groundAt(x,z),z);scene.add(o);const p=Object.assign({obj:o,x,z,yaw:0,cd:0,wt:0,tx:x,tz:z,prod:rnd(10,40),speed:BEASTS[d.kind].speed},d);PETS.push(p);return p}
function penOf(){return G.builds.find(b=>b.t==='pen')}
function updPets(dt){const pen=penOf();const mult=G.realm>=2?1.5:1;
  for(const p of PETS){let tx=p.x,tz=p.z,sp=0;const role=p.role==='work'&&!pen?'rest':p.role;
    if(role==='follow'){const d=Math.hypot(P.x-p.x,P.z-p.z);if(d>45){p.x=P.x-1;p.z=P.z-1}
      const foe=ACT.filter(e=>!e.dead&&!e.def?.flee&&(e.angry||e.chase||e.human)&&Math.hypot(e.x-P.x,e.z-P.z)<16).sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z))[0];p.cd-=dt;
      if(foe&&PETDMG[p.kind]>5){tx=foe.x;tz=foe.z;sp=p.speed;const fd=Math.hypot(foe.x-p.x,foe.z-p.z);if(fd<foe.r+1.4){sp=0;if(p.cd<=0){p.cd=1;p.obj.act={k:'bite',t:0,d:.4};hurtActor(foe,PETDMG[p.kind]*(p.big||1)*(1+G.lv*.03),p.x,p.z,3)}}}
      else if(d>3.5){const a=Math.atan2(p.x-P.x,p.z-P.z);tx=P.x+Math.sin(a)*2.6;tz=P.z+Math.cos(a)*2.6;sp=d>8?p.speed:p.speed*.6}
      if(p.kind==='deer'&&G.hp<G.maxhp)G.hp=Math.min(G.maxhp,G.hp+1.2*dt);
      if(p.kind==='rabbit'){p.prod-=dt;if(p.prod<=0){p.prod=60;give({herb:1});ftxt(p.x,groundAt(p.x,p.z)+1,p.z,'找到灵草','xp')}}}
    else{const c=role==='work'?pen:ZONES.home;p.wt-=dt;if(p.wt<=0){p.wt=rnd(3,8);p.tx=c.x+rnd(-4,4);p.tz=c.z+rnd(-4,4)}tx=p.tx;tz=p.tz;sp=Math.hypot(tx-p.x,tz-p.z)>.6?1.4:0;
      if(role==='work'){p.prod-=dt*mult;if(p.prod<=0){p.prod=45;const w=PETWORK[p.kind]||{};pen.store=pen.store||{};for(const k in w){const n=w[k]<1?(Math.random()<w[k]?1:0):w[k]*(p.big>1?2:1);if(n)pen.store[k]=(pen.store[k]||0)+n}}}}
    const dx=tx-p.x,dz=tz-p.z,l=Math.hypot(dx,dz);let rs=0;if(sp&&l>.3){const st=Math.min(l,sp*dt);let nx=p.x+dx/l*st,nz=p.z+dz/l*st;if(WATER_Y-groundAt(nx,nz)<.3){[nx,nz]=collide(nx,nz,.4);p.x=nx;p.z=nz}p.yaw=Math.atan2(dx,dz);rs=sp}
    p.obj.position.set(p.x,groundAt(p.x,p.z),p.z);p.obj.rotation.y=p.yaw;animBeast(p.obj,rs,dt,rs?'walk':'graze')}}
function mkPen(){const g=new THREE.Group();for(let i=0;i<16;i++){const a=i/16*Math.PI*2;if(i===4)continue;const post=new THREE.Mesh(new THREE.CylinderGeometry(.08,.09,1.1,6),MAT.wood);post.position.set(Math.cos(a)*4.2,.55,Math.sin(a)*4.2);g.add(post);
    const rail=new THREE.Mesh(new THREE.BoxGeometry(1.7,.08,.08),MAT.wood);const a2=a+Math.PI/16;rail.position.set(Math.cos(a2)*4.15,.8,Math.sin(a2)*4.15);rail.rotation.y=-a2+Math.PI/2;g.add(rail)}
  const tr=new THREE.Mesh(new THREE.BoxGeometry(1.6,.4,.6),MAT.plank);tr.position.set(0,.2,0);g.add(tr);const hay=new THREE.Mesh(new THREE.SphereGeometry(.5,8,6),MAT.straw);hay.scale.y=.5;hay.position.set(1.8,.2,1);g.add(hay);g.traverse(m=>{if(m.isMesh)m.castShadow=true});return g}
RECIPES.push({id:'fu',n:'驭兽符 ×2',cost:{herb:2,ling:1},d:'把野兽打到残血（三成以下），靠近按「互动」收服',k:'item',give:{fu:2}});
RECIPES.push({id:'pen',n:'灵兽栏',cost:{wood:10,stone:4},d:'安排灵兽在这里干活，定时产出木头、石头、草药、肉',k:'build'});
function wupCost(){const t=G.wtier||0;if(t<1)return{ling:3,stone:6};const ks=Object.keys(G.inv).filter(k=>k.startsWith('m_')).sort((a,b)=>G.inv[b]-G.inv[a]);const mk=ks[0]||(REGD.mat?regMat(REGK):'m_sy');return{ling:3+t*2,[mk]:3*t}}
RECIPES.push({id:'wup',get n(){return '强化兵器 +'+((G.wtier||0)+1)},get cost(){return wupCost()},d:'所有武器伤害 +12%，可以一直强化（第二次起需要各州材料）',k:'item',fn:()=>{G.wtier=(G.wtier||0)+1;applyOrigin();burst(P.x,P.y+1.2,P.z,MAT.gold,14,2)}});

/* ---------- 敌人先观察、试探、嚎叫叫同伴，残血会逃 ---------- */
function stalkAI(a,d,dx,dz,dt){
  if(a.hitT>0&&a.stalk>0)a.stalk=0;
  if(!a.boss&&!a.xinmo&&a.fled==null&&a.hp<a.maxhp*.25&&a.kind!=='soldier'){a.fled=rnd(3,5)}
  if(a.fled>0){a.fled-=dt;if(a.fled<=0)a.fled=-1;a._tx=a.x-dx/(d||1)*10;a._tz=a.z-dz/(d||1)*10;a._sp=a.speed;return true}
  if(a.stalk==null){if((a.kind==='wolf'||a.kind==='soldier')&&!a.boss&&!a.xinmo){a.stalk=rnd(3,6.5);a.circ=Math.random()<.5?1:-1;
      if(a.kind==='wolf'){ftxt(a.x,a.y+1.6,a.z,'嗷呜——','');for(const b of ACT)if(b!==a&&!b.dead&&b.kind==='wolf'&&Math.hypot(b.x-a.x,b.z-a.z)<40){b.angry=true;b.aggro=45}}}else a.stalk=0}
  if(a.stalk>0){a.stalk-=dt;if(d<3.2){a.stalk=0;return false}const ang=Math.atan2(a.x-P.x,a.z-P.z)+dt*.9*a.circ;const R=8.5;a._tx=P.x+Math.sin(ang)*R;a._tz=P.z+Math.cos(ang)*R;a._sp=a.speed*.5;
    if(!(a.feint>0)&&Math.random()<dt*.45)a.feint=.7;if(a.feint>0){a.feint-=dt;a._tx=P.x;a._tz=P.z;a._sp=a.speed;if(d<4)a.feint=-1;if(a.feint<0){a._tx=a.x+dx/(d||1)*-6;a._tz=a.z+dz/(d||1)*-6}}return true}
  return false}

/* ---------- 宝箱、灵脉、灵舟等互动；地图标记 ---------- */
function openPChest(c,i){c.open=true;G.flags['pc'+i]=1;c.lid.rotation.x=-1.9;c.glow.visible=false;const l={ling:2+Math.floor(Math.random()*3),herb:2+Math.floor(Math.random()*2),fu:1};if(Math.random()<.6)l.potion=1;if(REGD.mat)l[regMat(REGK)]=1+Math.floor(Math.random()*2);
  give(l);gainQi(40);burst(c.x,c.obj.position.y+1,c.z,MAT.gold,14,3);toast('峰顶宝箱：'+fmtCost(l)+'，灵气 +40',1);gainXP(20);save()}
function extraInteract(cand){
  PCHESTS.forEach((c,i)=>{if(c.open)return;const d=(c.x-P.x)**2+(c.z-P.z)**2;if(d<3*3)cand(d,'打开宝箱',()=>openPChest(c,i))});
  const lm=nearLingmai();if(lm&&!G.med){cand(((lm.x-P.x)**2+(lm.z-P.z)**2)+.5,'灵脉：打坐修炼',()=>startMeditate())}
  for(const a of ACT){if(a.dead||a.human||a.boss||!a.beast||a.hp>a.maxhp*.35)continue;const d=(a.x-P.x)**2+(a.z-P.z)**2;if(d<3.2**2)cand(d-.2,'收服'+(a.guard2?'守山灵兽':a.name),()=>tame(a))}
  const pen=penOf();if(pen){const d=(pen.x-P.x)**2+(pen.z-P.z)**2;const st=pen.store||{},n=Object.values(st).reduce((s,v)=>s+v,0);if(d<5*5)cand(d+1,n?'灵兽栏：收取（'+n+'）':'灵兽栏（还没有产出）',()=>{if(!n){toast(PETS.some(p=>p.role==='work')?'灵兽们正在干活，过一会再来':'还没有灵兽在干活：点「灵兽」按钮安排');return}give(st);toast('收取：'+fmtCost(st));pen.store={}})}
  if(CH2OBJ.dock){const d=(CH2OBJ.dock.x-P.x)**2+(CH2OBJ.dock.z-P.z)**2;if(d<8*8)cand(d,'登上灵舟（航线图）',()=>ui.route())}}
function extraMarks(c,tp,sc,full){const near=(x,z,r)=>(x-P.x)**2+(z-P.z)**2<r*r;
  for(const l of LINGMAI){const [x,y]=tp(l.x,l.z);c.fillStyle='#3ad8ff';c.strokeStyle='#fff';c.lineWidth=1.5*sc;c.beginPath();c.arc(x,y,5*sc,0,7);c.fill();c.stroke();c.fillStyle='#fff';c.font='bold '+Math.round(9*sc)+'px sans-serif';c.fillText('灵',x,y)}
  for(const c2 of PCHESTS){if(c2.open)continue;if(!(G.revealT>0||full||near(c2.x,c2.z,45)))continue;const [x,y]=tp(c2.x,c2.z);c.font=Math.round(14*sc)+'px sans-serif';c.fillText('🎁',x,y)}
  for(const u of UPDRAFTS){const [x,y]=tp(u.x,u.z);c.fillStyle='#ffffff';c.font='bold '+Math.round(13*sc)+'px sans-serif';c.fillText('↑',x,y)}
  if(G.revealT>0)for(const a of ACT){if(a.dead)continue;const [x,y]=tp(a.x,a.z);c.fillStyle=a.def?.flee?'#ffe080':'#ff5050';c.beginPath();c.arc(x,y,2.5*sc,0,7);c.fill()}
  for(const p of PETS){const [x,y]=tp(p.x,p.z);c.fillStyle='#4aff8a';c.strokeStyle='#fff';c.lineWidth=1.2*sc;c.beginPath();c.arc(x,y,3.2*sc,0,7);c.fill();c.stroke()}
  if(CH2OBJ.dock){const [x,y]=tp(CH2OBJ.dock.x,CH2OBJ.dock.z);c.font=Math.round(15*sc)+'px sans-serif';c.fillText('⛵',x,y)}}

/* ---------- 每帧额外更新 ---------- */
const flyFx=new THREE.Group();{const b=new THREE.Mesh(new THREE.BoxGeometry(.18,.04,1.6),MAT.metal),g=new THREE.Mesh(new THREE.BoxGeometry(.5,.06,.1),MAT.gold),glow=new THREE.Mesh(new THREE.BoxGeometry(.5,.02,1.9),new THREE.MeshBasicMaterial({color:'#8ad8ff',transparent:true,opacity:.45,blending:THREE.AdditiveBlending,depthWrite:false}));g.position.z=-.55;flyFx.add(b,g,glow)}flyFx.visible=false;scene.add(flyFx);
function inUpdraft(){return UPDRAFTS.some(u=>(u.x-P.x)**2+(u.z-P.z)**2<16&&P.y<u.y0+48)}
let qiXpAcc=0;

/* ---------- 夜晚游魂：天黑后出没，穿墙飘来，怕篝火，天亮消散 ---------- */
const GHOST_MAT=()=>new THREE.MeshStandardMaterial({color:'#d8ecff',emissive:'#5a9cff',emissiveIntensity:.7,transparent:true,opacity:.55,depthWrite:false,roughness:.4});
function makeGhost(){if(typeof GROKM!=='undefined'&&GROKM.youhun){const g=new THREE.Group(),src=SkeletonUtils.clone(GROKM.youhun.scene),mats=[];
    src.traverse(m=>{if(!m.isMesh)return;m.frustumCulled=false;m.castShadow=false;const mt=m.material.clone();const eye=/eye/i.test(mt.name||'');
      if(eye){mt.emissive=new THREE.Color('#7ff6ff');mt.emissiveIntensity=3}else{mt.emissive=new THREE.Color('#a8d8ff');mt.emissiveIntensity=/robe/i.test(mt.name||'')?.28:.1}
      mt.transparent=true;mt.depthWrite=eye;mt.userData.base=eye?1:(/hair/i.test(mt.name||'')?.85:.72);mt.opacity=mt.userData.base;m.material=mt;mats.push(mt)});
    src.position.y=-.15;g.add(src);const lt=new THREE.PointLight('#cfe8ff',1.6,6,2);lt.position.y=1.6;g.add(lt);g.userData.mats=mats;g.userData.mat={set opacity(v){for(const m of mats)m.opacity=m.userData.base*Math.min(1,v/.55)},get opacity(){return .55}};return g}
  const g=new THREE.Group(),m=GHOST_MAT();
  const robe=new THREE.Mesh(new THREE.ConeGeometry(.55,1.5,14,4,true),m);const pp=robe.geometry.attributes.position;for(let i=0;i<pp.count;i++){const y=pp.getY(i);if(y<-.6){const a=Math.atan2(pp.getZ(i),pp.getX(i));pp.setY(i,y+Math.sin(a*5)*.12)}}robe.geometry.computeVertexNormals();robe.position.y=1.05;robe.rotation.x=Math.PI;robe.scale.y=-1;
  const head=new THREE.Mesh(new THREE.SphereGeometry(.27,14,10),m);head.position.y=1.95;
  const hood=new THREE.Mesh(new THREE.SphereGeometry(.33,14,10,0,6.29,0,1.9),m);hood.position.y=1.99;
  const eyeM=new THREE.MeshBasicMaterial({color:'#9ff4ff'});for(const s of[-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(.045,8,6),eyeM);e.position.set(s*.1,1.97,.24);g.add(e)}
  for(const s of[-1,1]){const arm=new THREE.Mesh(new THREE.ConeGeometry(.09,.75,8),m);arm.position.set(s*.32,1.45,.25);arm.rotation.x=-1.25;g.add(arm)}
  const lt=new THREE.PointLight('#7ab8ff',4,7,2);lt.position.y=1.6;g.add(robe,head,hood,lt);g.userData.mat=m;return g}
function spawnGhost(x,z){const o=makeGhost();const a=addActor({kind:'ghost',ghost:true,name:'游魂',obj:o,x,z,hp:Math.round(45*DIFF),dmg:7*DIFF,speed:3.3,r:.45,h:2.2,home:{x,z},angry:true,raid:1,aggro:80});a.ph=Math.random()*6;a.fade=0;return a}
const isNight=()=>G.hour>=20||G.hour<4.6;
function ghostAI(a,dt){const o=a.obj,m=o.userData.mat;a.ph+=dt;
  if(a.dead){a.deadT+=dt;m.opacity=Math.max(0,.55-a.deadT*.4);o.position.y+=dt*1.2;o.scale.setScalar(1+a.deadT*.4);if(a.deadT>1.5){scene.remove(o);if(a.bar){a.bar.remove();a.bar=null}ACT.splice(ACT.indexOf(a),1)}return}
  if(!isNight()){a.fade+=dt;m.opacity=Math.max(0,.55-a.fade*.35);if(a.fade>1.6){scene.remove(o);if(a.bar){a.bar.remove();a.bar=null}ACT.splice(ACT.indexOf(a),1)}return}
  const dx=P.x-a.x,dz=P.z-a.z,d=Math.hypot(dx,dz)||1;a.cd-=dt;a.stun=(a.stun||0)-dt;
  const fire=G.builds.find(b=>b.t==='fire'&&Math.hypot(b.x-a.x,b.z-a.z)<7);let vx=0,vz=0;
  if(a.stun>0){}else if(fire){vx=(a.x-fire.x);vz=(a.z-fire.z);const l=Math.hypot(vx,vz)||1;vx=vx/l*a.speed;vz=vz/l*a.speed}
  else if(!G.dead&&P.st!=='sleep'&&d<90){const near=nearFire(P.x,P.z,5.5);if(near&&d<9){vx=-dx/d*a.speed*.6;vz=-dz/d*a.speed*.6}else if(d>1.2){vx=dx/d*a.speed;vz=dz/d*a.speed}
    if(d<1.7&&a.cd<=0&&!near){a.cd=1.6;hurtPlayer(a.dmg,a.x,a.z);if(G.maxmana)G.mana=Math.max(0,G.mana-8);ftxt(P.x,P.y+2.1,P.z,'阴气侵体','hurt')}}
  a.x+=vx*dt+(a.kx||0)*dt;a.z+=vz*dt+(a.kz||0)*dt;a.kx*=.9;a.kz*=.9;if(vx||vz)a.yaw=Math.atan2(vx,vz);
  a.y=groundAt(a.x,a.z);o.position.set(a.x,Math.max(a.y,WATER_Y)+.25+Math.sin(a.ph*2)*.18,a.z);o.rotation.y=a.yaw;
  m.opacity=.38+.2*Math.abs(Math.sin(a.ph*1.7))+(a.hitT>3.7?.3:0)}
let ghostT=20,ghostWarn=false;
function updGhosts(dt){if(G.over||G.dead)return;if(!isNight()){ghostWarn=false;return}
  if(!ghostWarn){ghostWarn=true;toast('夜深了，游魂出没……它们穿墙而来，怕篝火。靠近篝火或者睡觉更安全',1)}
  ghostT-=dt*G.timeScale;if(ghostT>0)return;ghostT=rnd(14,26);
  const n=ACT.filter(a=>a.ghost&&!a.dead).length,max=Math.min(6,2+RIDX);if(n>=max)return;
  const p=randAround(P.x,P.z,22,34,(x,z)=>!nearFire(x,z,8));if(p)spawnGhost(p[0],p[1])}
let lavaT=0;
function updExtra(dt){updGhosts(dt);if(CH===2&&REGD.wat==='lava'&&!G.flying&&waterDepth(P.x,P.z)>.05&&P.y<.6){lavaT-=dt;if(lavaT<=0){lavaT=.5;hurtPlayer(8*DIFF);toast('岩浆！快上岸')}}
  if(G.revealT>0)G.revealT-=dt;if(G.slowT>0)G.slowT-=dt;
  // 飞行
  if(G.flying){G.mana-=5*dt;if(G.mana<=0||G.dead){G.mana=Math.max(0,G.mana);G.flying=false;toast((G.faction==='A'?'灵力':'能量')+'耗尽，落下')}}
  flyFx.visible=G.flying&&!P.ground;if(flyFx.visible){flyFx.position.set(P.x,P.y-.05,P.z);flyFx.rotation.y=P.yaw}
  // 打坐
  if(G.med){if(P.st!=='sit'&&P.st!=='walk'){G.med=false;G.timeScale=1}const lm=nearLingmai();const rate=(1.5+G.realm*.6)*(lm?5:1);gainQi(rate*dt);qiXpAcc+=(lm?1.2:.4)*dt;if(qiXpAcc>=5){gainXP(5);qiXpAcc=0}
    if(Math.random()<dt*(lm?8:3))burst(P.x+rnd(-1.2,1.2),P.y+.2,P.z+rnd(-1.2,1.2),MAT.crystal,1,.4)}
  aura.visible=G.med;if(aura.visible){aura.position.set(P.x,P.y+.1,P.z);aura.scale.setScalar(1+Math.sin(performance.now()/300)*.15)}
  if(G.realm>=4&&!G.med)gainQi(.4*dt);
  // 功法被动
  const pk=G.perks||{};if(pk.lingti&&!G.dead&&G.hp<G.maxhp)G.hp=Math.min(G.maxhp,G.hp+1.5*dt);if(pk.jidong&&!IN.run)G.sta=Math.min(G.maxsta,G.sta+12*dt);
  for(const l of LINGMAI){l.col.material.opacity=.25+Math.sin(performance.now()/600+l.x)*.1;l.g.rotation.y+=dt*.3}
  for(const u of UPDRAFTS){u.m.rotation.y+=dt*2;if(Math.random()<dt*4)burst(u.x+rnd(-2,2),u.y0+rnd(0,4),u.z+rnd(-2,2),MAT.leaf2,1,.2)}
  updTrib(dt);updAllies(dt);updPets(dt)}
function initRegion(sv){
  PCHESTS.forEach((c,i)=>{if(G.flags['pc'+i]){c.open=true;c.lid.rotation.x=-1.9;c.glow.visible=false}});
  if(CH===2&&G.flags.chest&&CH2OBJ.chest){CH2OBJ.chest.lid.rotation.x=-1.9;CH2OBJ.chest.glow.visible=false}
  for(const d of (sv&&sv.pets)||[])addPet(d);
  if(REGK==='mid'&&G.cleared.mid&&!G.builds.some(b=>b.t==='boat'))placeBuild('boat',riverX(ZONES.river.z)-8,ZONES.river.z+3.6,0)}
function bossDefeated(a){G.cleared[REGK]=1;burst(a.x,a.y+1,a.z,MAT.gold,24,4);
  if(REGK==='tx'){toast(a.name+'被击败了！',1);later(3,()=>ending('final'));save();return}
  const l={ling:8};if(REGD.mat)l[regMat(REGK)]=6;give(l);let msg=a.name+' 被击败了！获得 '+fmtCost(l);
  if(REGD.perk&&!G.perks[REGD.perk]){G.perks[REGD.perk]=1;applyOrigin();msg+='；领悟功法「'+PERKS[REGD.perk]+'」'}
  const nx=nextRegion();if(nx)msg+='；新航线：'+regName(nx)+'（去渡口登上灵舟）';toast(msg,1);
  if(REGK==='mid'&&!G.builds.some(b=>b.t==='boat')){placeBuild('boat',riverX(ZONES.river.z)-8,ZONES.river.z+3.6,0)}
  save()}
