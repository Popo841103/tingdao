
/* =====================================================================
   四、玩法：状态、采集、制造、建造、战斗、AI、昼夜天气、存档、结局
   ===================================================================== */
const DAY_LEN=600;   // 一昼夜 10 分钟
const FACTION={A:{n:'修士',from:'上四州',foe:'B',foeN:'穿越者',boss:'铁督·陈玄策',bossStyle:'bossB',soldier:'eB',soldierN:'穿越者兵'},
               B:{n:'穿越者',from:'下四州',foe:'A',foeN:'修士',boss:'玄霄真人',bossStyle:'bossA',soldier:'eA',soldierN:'修士弟子'}};
const ORIGINS={A:{云:'上云州',玄:'上玄州',天:'上天州',仙:'上仙州'},B:{云:'下云州',玄:'下玄州',天:'下天州',仙:'下仙州'}};
const ORIGIN_BONUS={云:'体力上限 +30%',玄:'攻击力 +25%',天:'生命上限 +30%',仙:'饥饿变慢 30%'};
const ITEM={wood:'木头',stone:'石头',herb:'灵草',berry:'浆果',meat:'生肉',cooked:'烤肉',hide:'兽皮',salt:'硝石',ling:'灵石',seed:'种子',grain:'灵谷',arrow:'弩箭',potion:'疗伤药',bomb:'火药包'};
const WEAPONS={fist:{n:'空手',dmg:7,range:1.7,prop:'none',cd:.42,chop:1,mine:1},axe:{n:'石斧',dmg:14,range:2.1,prop:'axe',cd:.55,chop:1.7,mine:1},pick:{n:'石镐',dmg:12,range:2.1,prop:'pick',cd:.6,chop:1,mine:2.1},
  spear:{n:'木矛',dmg:18,range:3,prop:'spear',cd:.55,chop:1,mine:1},sword:{n:'灵剑',dmg:30,range:2.5,prop:'sword',cd:.42,chop:1.2,mine:1},shovel:{n:'工兵铲',dmg:24,range:2.3,prop:'shovel',cd:.5,chop:1.4,mine:2.1}};
WEAPONS.xian={n:'秘境神兵',dmg:48,range:2.7,prop:'sword',cd:.42,chop:1.6,mine:2.1};
const WORDER=['fist','axe','pick','spear','sword','shovel','xian'];
const BOSS2={A:'穿越者统领·赵铁衣',B:'上仙宗长老·清虚子'};
const bossName=()=>CH===2?REGD.boss[G.faction==='A'?0:1]:FACTION[G.faction].boss;
const RECIPES=[
  {id:'axe',n:'石斧',cost:{wood:2,stone:2},d:'砍树 3 下就倒',k:'tool'},
  {id:'pick',n:'石镐',cost:{wood:2,stone:3},d:'挖石头更快，能挖出灵石',k:'tool'},
  {id:'spear',n:'木矛',cost:{wood:3},d:'攻击距离远',k:'tool'},
  {id:'sword',n:'灵剑',cost:{wood:2,stone:4,herb:2},d:'修士的本命兵器，伤害高',k:'tool',f:'A'},
  {id:'thunder',n:'雷符',cost:{herb:3,ling:2},d:'火符升级成雷符：伤害更高还能定身',k:'tool',f:'A'},
  {id:'shovel',n:'工兵铲',cost:{wood:2,stone:3,salt:1},d:'能砍能挖能打',k:'tool',f:'B'},
  {id:'bow',n:'弩',cost:{wood:5,stone:2},d:'技能键射弩箭',k:'tool',f:'B'},
  {id:'arrow',n:'弩箭 ×5',cost:{wood:2,stone:1},d:'弩的弹药',k:'item',give:{arrow:5},f:'B'},
  {id:'bomb',n:'火药包',cost:{salt:2,wood:1},d:'技能键扔出，范围爆炸',k:'item',give:{bomb:1},f:'B'},
  {id:'potion',n:'疗伤药',cost:{herb:3},d:'回复 50 点生命',k:'item',give:{potion:1}},
  {id:'canteen',n:'水壶',cost:{wood:2},d:'在河边打水，用来浇地',k:'tool'},
  {id:'glider',n:'滑翔伞',cost:{wood:4,hide:2},d:'空中按住「跳」滑翔',k:'tool'},
  {id:'fire',n:'篝火',cost:{wood:4,stone:3},d:'烤肉、坐下歇息，野兽怕火',k:'build'},
  {id:'shelter',n:'庇护所',cost:{wood:12},d:'睡觉到天亮，自动存档',k:'build'},
  {id:'farm',n:'种植田',cost:{wood:4},d:'种下种子、浇水，收获灵谷',k:'build'},
  {id:'boat',n:'灵舟',cost:{wood:40,stone:15,hide:4},d:'只能在灵河渡口建造。登船即可逃离',k:'build'}];
const TRADES=[{give:{ling:1},get:{seed:2},n:'种子 ×2'},{give:{ling:2},get:{potion:1},n:'疗伤药'},{give:{ling:2},get:{hide:1},n:'兽皮'},{give:{ling:3},get:{arrow:8},n:'弩箭 ×8',f:'B'},{give:{ling:3},get:{herb:3},n:'灵草 ×3'},{give:{berry:6},get:{ling:1},n:'(卖) 浆果换灵石'},{give:{hide:2},get:{ling:1},n:'(卖) 兽皮换灵石'}];

const G={qi:0,wtier:0,cleared:{},bases:{},rflags:{},perks:{},skillSel:'base',flying:false,med:false,trib:null,revealT:0,slowT:0,realm:0,lv:1,xp:0,pts:0,st:{str:0,vit:0,agi:0,spi:0},spdMul:1,skillMul:1,started:false,paused:false,faction:'A',origin:'云',inv:{},tools:{},hp:100,maxhp:100,hunger:100,sta:100,maxsta:100,mana:60,maxmana:60,
  hour:8,day:1,weapon:'fist',water:0,flags:{},rain:false,rainK:0,rainT:90,builds:[],bossDead:false,over:false,dead:false,timeScale:1,raidDay:0,bossOn:false,atkMul:1,hungerMul:1,played:0};
const P={x:0,z:0,y:0,vy:0,yaw:0,st:'idle',sp:0,ground:true,model:null,atkCd:0,inv:0,sitFire:null,lock:0,glider:null};
const CAM={yaw:Math.PI*.75,pitch:.32,dist:7.5,x:0,y:0,z:0};
const IN={mx:0,mz:0,run:false,jump:false,jumpHeld:false};
const ACT=[],PROJ=[],LATER=[],RESP=[];
const later=(t,fn)=>LATER.push({t,fn});
const has=(c)=>Object.entries(c).every(([k,v])=>(G.inv[k]||0)>=v);
const take=(c)=>{for(const k in c)G.inv[k]=(G.inv[k]||0)-c[k]};
const give=(c)=>{for(const k in c)G.inv[k]=(G.inv[k]||0)+c[k];sfx('pickup')};
const fmtCost=(c)=>Object.entries(c).map(([k,v])=>ITEM[k]+v).join(' ');
const ui={toast:()=>{},refresh:()=>{},trade:()=>{},end:()=>{},death:()=>{},bossBar:()=>{}};
function toast(t,long){if(G.prologue)return;ui.toast(t,long)}

/* ---------- 特效：碎屑、飘字、地面警示圈 ---------- */
const chipGeo=new THREE.BoxGeometry(.12,.12,.12),chips=[];
function burst(x,y,z,m,n=6,sp=3){for(let i=0;i<n;i++){let c=chips.find(c=>!c.visible);if(!c){if(chips.length>80)return;c=new THREE.Mesh(chipGeo,m);scene.add(c);chips.push(c)}
  c.material=m;c.visible=true;c.position.set(x,y,z);c.userData={vx:rnd(-sp,sp),vy:rnd(1.5,sp*1.6),vz:rnd(-sp,sp),t:.9};c.scale.setScalar(rnd(.6,1.3))}}
const hitMat=new THREE.MeshBasicMaterial({color:'#fff6d0'}),bloodMat=new THREE.MeshBasicMaterial({color:'#d8363a'}),fireMat=MAT.flame;
function updChips(dt){for(const c of chips){if(!c.visible)continue;const u=c.userData;u.vy-=18*dt;c.position.x+=u.vx*dt;c.position.y+=u.vy*dt;c.position.z+=u.vz*dt;c.rotation.x+=dt*8;c.rotation.y+=dt*6;
  const gy=groundAt(c.position.x,c.position.z);if(c.position.y<gy+.05){c.position.y=gy+.05;u.vy*=-.3;u.vx*=.6;u.vz*=.6}if((u.t-=dt)<0)c.visible=false}}
const FX=[];function ftxt(x,y,z,t,cls){const el=document.createElement('div');el.className='ft '+(cls||'');el.textContent=t;$('#fx').appendChild(el);FX.push({el,x,y,z,t:0})}
const _pv=new THREE.Vector3();
function proj(x,y,z){_pv.set(x,y,z).project(camera);return _pv.z<1?[(_pv.x*.5+.5)*innerWidth,(-_pv.y*.5+.5)*innerHeight]:null}
function updFX(dt){for(let i=FX.length-1;i>=0;i--){const f=FX[i];f.t+=dt;const p=proj(f.x,f.y+f.t*1.4,f.z);if(p){f.el.style.transform=`translate(${p[0]}px,${p[1]}px) translate(-50%,-50%)`;f.el.style.opacity=1-Math.max(0,f.t-.5)/.4}if(f.t>.9){f.el.remove();FX.splice(i,1)}}
  for(const a of ACT){const show=!a.dead&&a.hitT>0&&a.obj.visible;if(show&&!a.bar){a.bar=document.createElement('div');a.bar.className='hpb';a.bar.innerHTML='<i></i>';$('#fx').appendChild(a.bar)}
    if(a.bar){if(!show){a.bar.remove();a.bar=null;continue}a.hitT-=dt;const p=proj(a.x,a.y+a.h+.4,a.z);if(p){a.bar.style.display='';a.bar.style.transform=`translate(${p[0]}px,${p[1]}px) translate(-50%,-50%)`;a.bar.firstChild.style.width=(a.hp/a.maxhp*100)+'%'}else a.bar.style.display='none'}}}
const ringGeo=new THREE.RingGeometry(.85,1,40).rotateX(-Math.PI/2);
function warnRing(x,z,r,t){const m=new THREE.Mesh(ringGeo,new THREE.MeshBasicMaterial({color:'#ff3a2a',transparent:true,opacity:.75,depthWrite:false}));m.position.set(x,groundAt(x,z)+.08,z);m.scale.setScalar(r);scene.add(m);
  const f=new THREE.Mesh(new THREE.CircleGeometry(1,40).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:'#ff5a3a',transparent:true,opacity:.25,depthWrite:false}));f.position.copy(m.position);f.scale.setScalar(.01);scene.add(f);
  let k=0;const o={upd:dt=>{k+=dt/t;f.scale.setScalar(r*Math.min(1,k));if(k>=1){scene.remove(m,f);return true}}};FX_RINGS.push(o)}
const FX_RINGS=[];

/* ---------- 星空 ---------- */
const stars=(()=>{const n=500,p=new Float32Array(n*3);for(let i=0;i<n;i++){const a=Math.random()*6.28,e=Math.random()*1.3+.12;p[i*3]=Math.cos(a)*Math.cos(e)*900;p[i*3+1]=Math.sin(e)*900;p[i*3+2]=Math.sin(a)*Math.cos(e)*900}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));const s=new THREE.Points(g,new THREE.PointsMaterial({color:'#ffffff',size:2.2,sizeAttenuation:false,transparent:true,opacity:0,fog:false,depthWrite:false}));s.frustumCulled=false;scene.add(s);return s})();
const moon=new THREE.Mesh(new THREE.SphereGeometry(18,20,14),new THREE.MeshBasicMaterial({color:'#eef2ff',fog:false,transparent:true,opacity:0}));scene.add(moon);

/* ---------- 昼夜与天气 ---------- */
const _sv=new THREE.Vector3(),_c1=new THREE.Color(),_c2=new THREE.Color();
const FOG={day:new THREE.Color(CH===2?REGD.fog:'#cfe3ee'),dusk:new THREE.Color('#f2cfae'),night:new THREE.Color('#4a5a7c'),rain:new THREE.Color('#a8b4bc')};
function dayK(){const h=G.hour;const el=Math.sin((h-6)/12*Math.PI);return{el,day:smooth(clamp((el+.1)/.32,0,1))}}
function updSky(dt){
  G.rainK=lerp(G.rainK,G.rain?1:0,Math.min(1,dt*.5));const R=G.rainK;
  const {el,day}=dayK();const ang=(G.hour-6)/12*Math.PI;
  const sunDir=_sv.set(Math.cos(ang)*.85,Math.max(el,-.2),.42).normalize();
  const sunI=3.2*smooth(clamp((day-.5)/.5,0,1))*(1-.6*R),moonI=1.0*smooth(clamp((.5-day)/.5,0,1))*(1-.4*R);
  const dir=day>=.5?sunDir.clone():new THREE.Vector3(-Math.cos(ang)*.85,Math.max(-el,.35),-.42).normalize();
  sun.position.set(P.x+dir.x*120,P.y+dir.y*120,P.z+dir.z*120);sun.target.position.set(P.x,P.y,P.z);
  sun.intensity=sunI+moonI;sun.color.copy(day>=.5?_c1.set('#ffb070').lerp(_c2.set(CH===2&&REGD.sun||'#fff3dc'),clamp(el*3,0,1)):_c1.set('#b4c8ff'));
  hemi.intensity=(.5+.6*day)*(1-.25*R);hemi.color.copy(_c1.set('#8aa2d8').lerp(_c2.set('#cfe8ff'),day));hemi.groundColor.copy(_c1.set('#3a4658').lerp(_c2.set('#7a8a55'),day));
  const sp=sky.material.uniforms.sunPosition.value;if(day>.02)sp.copy(sunDir);else sp.set(sunDir.x,-.035,sunDir.z);
  sky.material.uniforms.turbidity.value=(CH===2&&REGD.skyT||3.2)+R*8;sky.material.uniforms.rayleigh.value=(CH===2&&REGD.skyR||1.4)+R*1.5;
  renderer.toneMappingExposure=(lerp(.6,.62,day)*(1-.18*R)+(day<.3?.05:0))*(CH===2&&REGD.expo||1);
  const dusk=clamp(1-Math.abs(el)*5,0,1)*day;
  scene.fog.color.copy(FOG.night).lerp(FOG.day,day).lerp(FOG.dusk,dusk*.6).lerp(FOG.rain,R*.7);const fN=CH===2&&REGD.fogNear||120,fF=CH===2&&REGD.fogFar||520;scene.fog.near=lerp(fN,40,R);scene.fog.far=lerp(fF,220,R);
  cloudMat.color.copy(_c1.set('#3e4870')).lerp(_c2.set('#ffffff'),day).lerp(_c2.set('#f4a6d2'),dusk*.85);cloudMat.opacity=.88*(1-.25*R);
  stars.material.opacity=(1-day)*(1-R);moon.material.opacity=(1-day)*.95;moon.position.set(P.x+dir.x*800,dir.y*800,P.z+dir.z*800);stars.position.set(P.x,0,P.z);
  // 天气
  G.rainT-=dt*G.timeScale;if(G.rainT<=0){if(G.rain){G.rain=false;G.rainT=rnd(220,420)}else if(!(CH===2&&REGD.dry)&&Math.random()<(CH===2&&REGD.rainy?.75:.35)){G.rain=true;G.rainT=rnd(70,140);toast(CH===2&&REGD.terr==='snow'?'风雪变大了':'下雨了，种下的地会被雨水浇透')}else G.rainT=rnd(120,300)}
}

/* ---------- 建造 ---------- */
function placeBuild(t,x,z,ry,st){let obj;if(t==='fire')obj=mkFire();if(t==='shelter')obj=mkShelter();if(t==='farm')obj=mkFarm();if(t==='boat')obj=mkBoat(G.faction);if(t==='pen')obj=mkPen();
  const y=t==='boat'?WATER_Y+.25:groundAt(x,z);obj.position.set(x,y,z);obj.rotation.y=ry;scene.add(obj);
  const b=Object.assign({t,x,z,ry,obj,stage:0,g:0},st||{});if(t!=='boat'&&t!=='farm')b.col=addCol({x,z,r:t==='shelter'?1.6:.7});G.builds.push(b);if(t==='farm')updFarm(b,0);return b}
function updFarm(b,dt){const c=b.obj.userData.crops;if(b.stage===2){b.g+=dt;if(b.g>=150){b.stage=3;if(dist2(b)<900)toast('种植田里的灵谷成熟了')}}
  if(b.stage===1&&G.rainK>.6){b.stage=2;b.g=0;if(!G.flags.water){G.flags.water=1;toast('雨水把种植田浇透了，灵谷开始生长')}}
  const k=b.stage===0?0:b.stage===1?.15:b.stage===2?.15+.85*b.g/150:1;c.visible=b.stage>0;c.children.forEach(cr=>{cr.scale.setScalar(Math.max(.01,k));cr.children[1].visible=b.stage===3})}
const dist2=(o)=>(o.x-P.x)**2+(o.z-P.z)**2;
function tryBuild(id){const r=RECIPES.find(r=>r.id===id);const fx=Math.sin(P.yaw),fz=Math.cos(P.yaw);let x=P.x+fx*2.6,z=P.z+fz*2.6;
  if(id==='boat'){const Z=ZONES.river;if(Math.hypot(P.x-Z.x,P.z-Z.z)>Z.r+6){toast('灵舟只能在「灵河渡口」建造（地图上的⚓）');return false}x=riverX(Z.z)-8;z=Z.z+3.6;if(G.builds.some(b=>b.t==='boat')){toast('已经造好灵舟了');return false}}
  else{if(WATER_Y-groundAt(x,z)>-.2){toast('这里是水里，换个地方');return false}for(const c of nearCols(x,z))if(!c.off&&Math.hypot(c.x-x,c.z-z)<c.r+1.2){toast('前面有东西挡着，换个空地');return false}}
  take(r.cost);sfx('build');placeBuild(id,x,z,P.yaw+Math.PI);play(P.model,'gather',.6);burst(x,groundAt(x,z)+.5,z,MAT.wood,10);toast('建好了：'+r.n);G.flags['b_'+id]=1;gainXP(10);return true}
function craft(id){const r=RECIPES.find(r=>r.id===id);if(!r||!has(r.cost))return false;
  if(r.k==='build')return tryBuild(id);
  sfx('craft');take(r.cost);if(r.fn)r.fn();else if(r.give)give(r.give);else{G.tools[id]=true;if(WEAPONS[id])equip(id);if(id==='canteen')G.water=0;if(id==='glider')toast('有了滑翔伞：跳起来后在空中按住「跳」就能滑翔');if(id==='thunder')toast('火符升级为雷符！')}
  G.flags['c_'+id]=1;toast('做好了：'+r.n);gainXP(3);return true}
function equip(w){if(w!=='fist'&&!G.tools[w])return;G.weapon=w;if(P.model.rig)setProp(P.model,WEAPONS[w].prop);else if(P.model.glb)attachGLBProp(WEAPONS[w].prop);ui.refresh()}
function nextWeapon(){const own=WORDER.filter(w=>w==='fist'||G.tools[w]);const i=own.indexOf(G.weapon);equip(own[(i+1)%own.length]);toast('换成：'+WEAPONS[G.weapon].n)}
function attachGLBProp(key){const g=P.model.glb;if(!g.hand)return;if(g.prop)g.hand.remove(g.prop);g.prop=PROPS[key]?PROPS[key]():null;if(g.prop){const s=1/Math.max(.001,g.hand.getWorldScale(new THREE.Vector3()).x);g.prop.scale.setScalar(s);g.hand.add(g.prop)}}

/* ---------- 角色生成 ---------- */
function addActor(o){o.obj.position.set(o.x,groundAt(o.x,o.z),o.z);scene.add(o.obj);o.y=groundAt(o.x,o.z);o.kx=o.kz=0;o.cd=rnd(.5,1.5);o.hitT=0;o.yaw=o.yaw||rnd(0,6.28);o.wt=0;o.tx=o.x;o.tz=o.z;o.dead=false;o.maxhp=o.hp;ACT.push(o);return o}
function spawnBeast(kind,x,z,extra){const B_=BEASTS[kind];return addActor(Object.assign({kind,beast:true,name:B_.name,obj:makeBeast(kind),x,z,hp:Math.round(B_.hp*DIFF),dmg:B_.dmg*DIFF,speed:B_.speed,r:B_.r,h:B_.leg+B_.size[1]*1.4,home:{x,z},def:B_},extra||{}))}
function spawnSoldier(x,z,extra){const f=FACTION[G.faction];let o=grokHuman(G.faction==='A'?'boy':'xianxia');if(!o){o=makeHuman(f.soldier);setProp(o,G.faction==='A'?(Math.random()<.5?'shovel':'spear'):'sword')}
  return addActor(Object.assign({kind:'soldier',human:true,name:f.soldierN,obj:o,x,z,hp:Math.round(60*DIFF),dmg:9*DIFF,speed:4.6,r:.4,h:1.8,home:{x,z},aggro:15},extra||{}))}
function spawnBoss(){const f=FACTION[G.faction];let o=grokHuman('viking',1.3);if(!o){o=makeHuman(f.bossStyle);setProp(o,'bigaxe')}const Z=ZONES.enemy;
  return addActor({kind:'boss',human:true,boss:true,name:bossName(),obj:o,x:Z.x+6,z:Z.z-5.5,hp:Math.round((REGK==='tx'?1800:700)*(1+RIDX*.5)),dmg:16*DIFF,speed:4,r:.6,h:2.5,home:{x:Z.x+6,z:Z.z-5.5},aggro:20,slamCd:4,summoned:false,yaw:Math.PI})}
function randAround(cx,cz,r0,r1,test){for(let i=0;i<40;i++){const a=Math.random()*6.28,r=rnd(r0,r1),x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;const y=groundAt(x,z);if(y>WATER_Y+.4&&Math.hypot(x,z)<coastR(x,z)-6&&(!test||test(x,z)))return[x,z]}return null}
function populate(){
  for(let i=0;i<9;i++){const p=randAround(ZONES.forest.x,ZONES.forest.z,5,60);if(p)spawnBeast(i<4?'deer':'rabbit',...p)}
  for(let i=0;i<8;i++){const p=randAround(0,0,30,160,(x,z)=>!zoneOf(x,z));if(p)spawnBeast(['rabbit','deer','boar','rabbit'][i%4],...p)}
  for(let i=0;i<5;i++){const p=randAround(ZONES.forest.x,ZONES.forest.z,10,55);if(p)spawnBeast('boar',...p)}
  const Z=ZONES.enemy;for(let i=0;i<(CH===2?9:6);i++){const p=randAround(Z.x,Z.z,4,Z.r-4);if(p)spawnSoldier(...p)}
  for(let i=0;i<2;i++)spawnSoldier(Z.x+2,Z.z-4+i*8,{guard:1});
  if(!G.bossDead)spawnBoss();
  // 坊市商人
  const m=grokHuman('merchant')||makeHuman('merchant');const Mx=ZONES.market.x-4,Mz=ZONES.market.z+1.4;m.position.set(Mx,groundAt(Mx,Mz),Mz);m.rotation.y=0;scene.add(m);G.merchant={obj:m,x:Mx,z:Mz};
}

/* ---------- 伤害 ---------- */
function hurtPlayer(d,fx,fz){if(!G.dead&&!G.over&&P.dodgeT>0){perfectDodge();return}if(G.dead||G.over||P.inv>0)return;P.inv=.35;G.med=false;if(P.st==='sit'||P.sitFire){P.sitFire=null;G.timeScale=1}if(G.perks&&G.perks.xuanjia)d*=.85;if(G.realm>=3)d*=.9;
  G.hp-=d;sfx('hurt');ftxt(P.x,P.y+1.9,P.z,'-'+Math.round(d),'hurt');burst(P.x,P.y+1.1,P.z,bloodMat,4,2);const dx=P.x-fx,dz=P.z-fz,l=Math.hypot(dx,dz)||1;P.kx=dx/l*7;P.kz=dz/l*7;
  if(P.model)play(P.model,'hurt',.3);$('#hurt').classList.remove('on');void $('#hurt').offsetWidth;$('#hurt').classList.add('on');if(navigator.vibrate)try{navigator.vibrate(40)}catch(e){}
  if(G.hp<=0){if(G.trib){tribFail();return}G.hp=0;die()}}
function die(){sfx('death');G.flying=false;G.med=false;G.dead=true;P.st='dead';later(1.6,()=>ui.death())}
function hurtActor(a,d,fx,fz,kb=5,stun=0){if(a.dead)return;a.hp-=d;sfx(a.beast?'flesh':'hit',d>=30);hitStop(a.hp<=0?.11:d>=30?.07:.045);a.hitT=4;a.pop=.15;ftxt(a.x,a.y+a.h,a.z,Math.round(d),d>=30?'crit':'');
  burst(a.x,a.y+a.h*.6,a.z,a.beast?bloodMat:hitMat,5,2.4);const dx=a.x-fx,dz=a.z-fz,l=Math.hypot(dx,dz)||1;const kk=a.boss?kb*.25:kb;a.kx=dx/l*kk;a.kz=dz/l*kk;a.stun=Math.max(a.stun||0,stun);
  a.angry=true;if(a.human)play(a.obj,'hurt',.3);else a.obj.act={k:'hurt',t:0,d:.3};if(a.def&&a.def.flee){a.wound=true;a.tired=Math.max(a.tired||0,1.2)}
  if(a.hp<=0){a.hp=0;a.dead=true;a.deadT=0;gainXP(Math.round((a.boss?300:a.xinmo?150:a.guard2?120:a.human?30:({rabbit:5,deer:10,boar:20,wolf:25,ghost:18}[a.kind]||10))*DIFF));if(!a.human)gainQi(a.guard2?30:4);if(a.human){a.obj.act=null}
    sfx(a.boss?'gong':'kill');achKill(a);if(a.boss){G.bossDead=true;ui.bossBar(null);bossDefeated(a)}
    else if(a.xinmo){tribSuccess()}
    else if(a.ghost){gainQi(8);const l={};if(Math.random()<.45)l.ling=1;if(Math.random()<.25)l.herb=1;if(Object.keys(l).length)give(l);toast('游魂消散'+(Object.keys(l).length?'：'+fmtCost(l):'')+'，灵气 +8')}
    else if(a.human){const l={ling:1+(Math.random()<.5?1:0)};if(Math.random()<.3)l.potion=1;if(G.faction==='B'&&Math.random()<.4)l.arrow=3;give(l);toast('击败'+a.name+'：'+fmtCost(l));RESP.push({t:300,fn:()=>!G.bossDead&&spawnSoldier(...(randAround(ZONES.enemy.x,ZONES.enemy.z,4,20)||[ZONES.enemy.x,ZONES.enemy.z]))})}
    else{a.loot=true;toast(a.name+'倒下了，靠近按「互动」剥取');const k=a.kind,home=a.home;if(!a.raid)RESP.push({t:150,fn:()=>{const p=randAround(home.x,home.z,0,30,(x,z)=>(x-P.x)**2+(z-P.z)**2>900);if(p)spawnBeast(k,...p)}})}}}
function meleeHit(range,dmg,arc=1.25,kb=5){const fx=Math.sin(P.yaw),fz=Math.cos(P.yaw);let hit=0;
  for(const a of ACT){if(a.dead)continue;const dx=a.x-P.x,dz=a.z-P.z,d=Math.hypot(dx,dz);const ex=a.def&&a.def.flee?1.5:0;if(d>range+a.r+ex)continue;const dot=(dx*fx+dz*fz)/(d||1);if(d>1&&dot<Math.cos(arc))continue;hurtActor(a,dmg*(rnd(.9,1.1))*(G.perks&&G.perks.miaozhun&&Math.random()<.2?2:1),P.x,P.z,kb);hit++}return hit}
function nearestFoe(maxD,cone){let best=null,bd=maxD;const fx=Math.sin(P.yaw),fz=Math.cos(P.yaw);for(const a of ACT){if(a.dead||!a.obj.visible)continue;const dx=a.x-P.x,dz=a.z-P.z,d=Math.hypot(dx,dz);if(d>bd)continue;if(cone&&(dx*fx+dz*fz)/(d||1)<Math.cos(cone))continue;best=a;bd=d}return best}

/* ---------- 玩家动作：攻击 / 技能 / 互动 / 吃 ---------- */
function frontTree(){let best=null,bd=1e9;const fx=Math.sin(P.yaw),fz=Math.cos(P.yaw);for(const c of nearCols(P.x,P.z)){const t=c.tree;if(!t||!t.alive)continue;const dx=t.x-P.x,dz=t.z-P.z,d=Math.hypot(dx,dz);if(d>c.r+1.5)continue;if(d>c.r+1.1&&(dx*fx+dz*fz)/d<.2)continue;if(d<bd){bd=d;best=t}}return best}
function frontRock(){let best=null,bd=1e9;for(const n of nodes){if(n.kind!=='rock'||!n.alive)continue;const d=Math.hypot(n.x-P.x,n.z-P.z);if(d<n.s*1.1+1.4&&d<bd){bd=d;best=n}}return best}
function busy(){return G.dead||G.over||G.paused||P.st==='sleep'||P.lock>0}
function attack(){if(busy()||P.atkCd>0)return;if(P.sitFire){P.sitFire=null;G.timeScale=1}const w=WEAPONS[G.weapon];
  let foe=nearestFoe(w.range+1.8,null);if(foe&&P.st!=='swim'){P.yaw=Math.atan2(foe.x-P.x,foe.z-P.z);P.atkCd=w.cd;P.sta=Math.max(0,G.sta-=4);play(P.model,'swing',w.cd*.95);sfx('swing');later(.17,()=>{const n=meleeHit(w.range,w.dmg*G.atkMul,1.1,G.weapon==='spear'?7:5);if(n)shake(.12)});return}
  const t=frontTree();if(t){let ww=G.weapon;if(!WEAPONS[ww].chop||WEAPONS[ww].chop<1.5){const b=['axe','shovel'].find(k=>G.tools[k]);if(b){equip(b);ww=b}}
    P.yaw=Math.atan2(t.x-P.x,t.z-P.z);P.atkCd=.62;play(P.model,'chop',.6);later(.33,()=>{if(!t.alive)return;t.hp-=WEAPONS[ww].chop;sfx('chop');burst(t.x-Math.sin(P.yaw)*.3,P.y+1.1,t.z-Math.cos(P.yaw)*.3,MAT.wood,5,2.2);shake(.06);
      if(t.hp<=0.01){const dx=t.x-P.x,dz=t.z-P.z,l=Math.hypot(dx,dz)||1;fellTree(t,dx/l,dz/l);toast('树倒了！');
        later(1.5,()=>{const w=TREE_TYPES[t.type].wood;give({wood:w});toast('木头 +'+w);G.flags.chop=(G.flags.chop||0)+1;gainXP(4);
          RESP.push({t:240,fn:function f(){if(dist2(t)<900){RESP.push({t:30,fn:f});return}t.alive=true;t.hp=TREE_TYPES[t.type].hits;setTree(t,true)}})})}});return}
  const r=frontRock();if(r){let ww=G.weapon;if(WEAPONS[ww].mine<2){const b=['pick','shovel'].find(k=>G.tools[k]);if(b){equip(b);ww=b}}
    P.yaw=Math.atan2(r.x-P.x,r.z-P.z);P.atkCd=.65;play(P.model,'chop',.62);later(.34,()=>{if(!r.alive)return;r.hp-=WEAPONS[ww].mine;sfx('mine');burst(r.x,r.y+.6,r.z,MAT.rock2,6,2.6);shake(.06);
      if(r.hp<=0.01){r.alive=false;setNode(r,false);const l={stone:3};if(Math.random()<.35)l.salt=1;const good=WEAPONS[ww].mine>=2;const inMine=zoneOf(r.x,r.z)==='mine';if(good&&Math.random()<(inMine?.55:.18))l.ling=1;give(l);toast('采到：'+fmtCost(l)+(good?'':'（用石镐才挖得出灵石）'));gainXP(5);
        RESP.push({t:260,fn:function f(){if(dist2(r)<700){RESP.push({t:30,fn:f});return}r.alive=true;r.hp=4;setNode(r,true)}})}});return}
  P.atkCd=w.cd;play(P.model,'swing',w.cd*.95);sfx('swing');later(.17,()=>meleeHit(w.range,w.dmg*G.atkMul))}
function shoot(kind,a,spd,dmg){const fx=Math.sin(P.yaw),fz=Math.cos(P.yaw);let m;
  if(kind==='fire'||kind==='thunder'){m=new THREE.Mesh(new THREE.SphereGeometry(.22,12,8),new THREE.MeshBasicMaterial({color:kind==='fire'?'#ffb040':'#9ad8ff'}));const h=new THREE.Mesh(new THREE.SphereGeometry(.42,12,8),new THREE.MeshBasicMaterial({color:kind==='fire'?'#ff6a20':'#4aa0ff',transparent:true,opacity:.45,blending:THREE.AdditiveBlending,depthWrite:false}));m.add(h)}
  else if(kind==='bolt'){m=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.7,5).rotateX(Math.PI/2),MAT.wood)}
  else if(kind==='bomb'){m=new THREE.Mesh(new THREE.SphereGeometry(.2,10,8),MAT.dark)}else{m=new THREE.Mesh(new THREE.DodecahedronGeometry(.12,0),MAT.pebble)}
  let vx=fx*spd,vz=fz*spd,vy=kind==='bomb'?7:kind==='stone'?3:0;let sy=P.y+1.4;
  if(a){const dx=a.x-P.x,dz=a.z-P.z,d=Math.hypot(dx,dz);vx=dx/d*spd;vz=dz/d*spd;if(kind==='bomb'){const t=d/spd;vy=(a.y-sy)/t+9*t}else if(kind!=='stone')vy=(a.y+a.h*.6-sy)/(d/spd);else{const t=d/spd;vy=(a.y+a.h*.6-sy)/t+9*t}}
  sfx(kind==='fire'?'fire':kind==='thunder'?'thunderShot':kind==='bolt'?'bow':'throw');m.position.set(P.x+fx*.6,sy,P.z+fz*.6);scene.add(m);PROJ.push({m,vx,vy,vz,kind,dmg,t:0,g:kind==='bomb'||kind==='stone'?18:0})}
function skill(){if(busy()||P.atkCd>0)return;if(ENV.emp>0){toast('电磁风暴中，技能失灵');return}if(G.skillSel&&G.skillSel!=='base'){castSkill(G.skillSel);return}const a=nearestFoe(32,.9);if(a)P.yaw=Math.atan2(a.x-P.x,a.z-P.z);
  if(G.faction==='A'){if(G.mana<20){toast('灵力不足（每秒自动恢复）');return}G.mana-=20;const th=G.tools.thunder;play(P.model,'throw',.45);P.atkCd=.5;later(.2,()=>shoot(th?'thunder':'fire',a,24,(th?44:30)*G.atkMul*G.skillMul));return}
  if(G.tools.bow&&(G.inv.arrow||0)>0){G.inv.arrow--;play(P.model,'throw',.35);P.atkCd=.55;later(.12,()=>shoot('bolt',a,42,40*G.atkMul*G.skillMul));return}
  if((G.inv.bomb||0)>0){G.inv.bomb--;play(P.model,'throw',.5);P.atkCd=.8;later(.25,()=>shoot('bomb',a,14,65));return}
  if((G.inv.stone||0)>0){G.inv.stone--;play(P.model,'throw',.45);P.atkCd=.5;later(.2,()=>shoot('stone',a,20,9*G.atkMul));if(!G.tools.bow)toast('扔了块石头（做「弩」后技能键会射弩箭）');return}
  toast(G.tools.bow?'没有弩箭了，去制造':'没有可扔的东西')}
function explode(x,y,z,r,dmg){sfx('boom');burst(x,y+.3,z,MAT.flame2,14,6);burst(x,y+.3,z,MAT.dark,8,5);shake(.35);for(const a of ACT){if(a.dead)continue;const d=Math.hypot(a.x-x,a.z-z);if(d<r)hurtActor(a,dmg*(1-d/r*.5),x,z,9)}if(Math.hypot(P.x-x,P.z-z)<r*.6)hurtPlayer(15,x,z)}
function updProj(dt){for(let i=PROJ.length-1;i>=0;i--){const p=PROJ[i];p.t+=dt;p.vy-=p.g*dt;p.m.position.x+=p.vx*dt;p.m.position.y+=p.vy*dt;p.m.position.z+=p.vz*dt;const q=p.m.position;
  if(p.kind==='bolt')p.m.lookAt(q.x+p.vx,q.y+p.vy,q.z+p.vz);if(p.kind==='fire'||p.kind==='thunder'){p.m.children[0].scale.setScalar(1+Math.sin(p.t*30)*.2);if(Math.random()<.4)burst(q.x,q.y,q.z,p.kind==='fire'?MAT.flame2:hitMat,1,.6)}
  let done=p.t>3||q.y<groundAt(q.x,q.z);
  if(!done&&p.kind!=='bomb')for(const a of ACT){if(a.dead)continue;if(Math.hypot(a.x-q.x,a.z-q.z)<a.r+.45&&q.y>a.y-.2&&q.y<a.y+a.h+.3){hurtActor(a,p.dmg,q.x-p.vx,q.z-p.vz,p.kind==='bolt'?6:4,p.kind==='thunder'?1.6:0);if(p.kind==='thunder')burst(a.x,a.y+1,a.z,hitMat,10,4);done=true;break}}
  if(done){if(p.kind==='bomb')explode(q.x,groundAt(q.x,q.z),q.z,4.5,p.dmg);else if(p.kind!=='bolt'&&p.kind!=='stone')burst(q.x,q.y,q.z,MAT.flame2,6,2);scene.remove(p.m);PROJ.splice(i,1)}}}
let shakeK=0;const shake=k=>shakeK=Math.max(shakeK,k);

function eat(){if(busy())return;
  if(G.hp<G.maxhp*.5&&(G.inv.potion||0)>0){G.inv.potion--;G.hp=Math.min(G.maxhp,G.hp+50);play(P.model,'eat',.8);sfx('eat');toast('服下疗伤药 生命+50');ftxt(P.x,P.y+2,P.z,'+50','heal');return}
  const foods=[['cooked',38,6,'烤肉'],['grain',26,3,'灵谷'],['berry',9,1,'浆果'],['meat',12,-6,'生肉（会闹肚子）']];
  if(G.hunger>96){toast('还不饿');return}
  for(const [k,h,hp,n] of foods)if((G.inv[k]||0)>0){G.inv[k]--;G.hunger=Math.min(100,G.hunger+h);G.hp=clamp(G.hp+hp,1,G.maxhp);play(P.model,'eat',.8);sfx('eat');toast('吃了'+n+' 饱食+'+h);return}
  if((G.inv.potion||0)>0&&G.hp<G.maxhp){G.inv.potion--;G.hp=Math.min(G.maxhp,G.hp+50);toast('服下疗伤药 生命+50');return}
  toast('没有吃的：摘浆果、打猎烤肉，或者种灵谷')}

// 当前可以互动的目标（显示在「互动」按钮上）
function nearWater(){if(WATER_Y-groundAt(P.x,P.z)>.15)return true;const fx=Math.sin(P.yaw),fz=Math.cos(P.yaw);for(const r of[1.2,2.2]){if(WATER_Y-groundAt(P.x+fx*r,P.z+fz*r)>.25)return true}return false}
function findInteract(){if(G.dead||G.over)return null;let best=null,bd=1e9;const cand=(d,label,fn,pos)=>{if(d<bd){bd=d;best={label,fn,pos}}};
  for(const n of nodes){if(!n.alive||n.kind==='rock')continue;const d=(n.x-P.x)**2+(n.z-P.z)**2;if(d<(n.kind==='berry'?3.4:2.4)**2)cand(d,{stick:'捡树枝',pebble:'捡石子',herb:'采灵草',berry:'摘浆果'}[n.kind],()=>pick(n),n)}
  for(const a of ACT){if(!a.dead||!a.loot)continue;const d=(a.x-P.x)**2+(a.z-P.z)**2;if(d<2.8**2)cand(d,'剥取'+a.name,()=>{a.loot=false;const l={meat:a.def.meat};if(a.def.hide)l.hide=a.def.hide;give(l);play(P.model,'gather',.7);toast('得到 '+fmtCost(l));a.deadT=999},a)}
  for(const b of G.builds){const d=(b.x-P.x)**2+(b.z-P.z)**2;
    if(b.t==='fire'&&d<3.2**2){if((G.inv.meat||0)>0)cand(d-.1,'烤肉×'+G.inv.meat,()=>{P.lock=1.3;P.st='kneel';P.yaw=Math.atan2(b.x-P.x,b.z-P.z);later(1.2,()=>{const n=G.inv.meat;G.inv.meat=0;give({cooked:n});toast('烤好了 烤肉+'+n);G.flags.cook=1;gainXP(3)})},b);else cand(d,'坐下烤火',()=>{P.sitFire=b;P.yaw=Math.atan2(b.x-P.x,b.z-P.z);G.timeScale=6;toast('坐在火边歇息：时间流逝加快，体力恢复。动一下就起身')})}
    if(b.t==='shelter'&&d<3.4**2)cand(d,'睡觉',()=>sleep(b));
    if(b.t==='farm'&&d<3**2){if(b.stage===0)cand(d,(G.inv.seed||0)>0?'播种':'需要种子',()=>{if(!(G.inv.seed>0)){toast('没有种子：摘浆果有机会得到，或去坊市找商人买');return}G.inv.seed--;b.stage=1;P.lock=1.1;P.st='kneel';toast('种下了！现在需要浇水');G.flags.plant=1});
      else if(b.stage===1)cand(d,G.water>0?'浇水':'需要浇水',()=>{if(!G.tools.canteen){toast('先做一个「水壶」');return}if(G.water<=0){toast('水壶空了：到河边或海边按「互动」打水');return}G.water--;b.stage=2;b.g=0;P.lock=1.2;P.st='pour';burst(b.x,b.obj.position.y+.6,b.z,new THREE.MeshBasicMaterial({color:'#7ac8ff'}),10,1.5);toast('浇好水了，灵谷开始生长');G.flags.water=1});
      else if(b.stage===2)cand(d,'生长中 '+Math.round(b.g/150*100)+'%',()=>toast('灵谷还在长，睡一觉或坐在火边等等'));
      else cand(d,'收获灵谷',()=>{b.stage=0;const l={grain:3};if(Math.random()<.6)l.seed=1;give(l);P.lock=.8;play(P.model,'gather',.7);toast('收获 '+fmtCost(l));G.flags.harvest=1;gainXP(8)})}
    if(b.t==='boat'&&d<7**2)cand(d,'登上灵舟（航线图）',()=>{G.cleared.mid=1;ui.route()})}
  if(CH===2){const fu=CH2OBJ.furnace,cs=CH2OBJ.chest,A=G.faction==='A';
    if(fu){const d=(fu.x-P.x)**2+(fu.z-P.z)**2;if(d<3.2**2)cand(d,A?'丹炉：炼聚气丹':'改造台：灵能充能',()=>brewPill())}
    if(cs&&!G.flags.chest){const d=(cs.x-P.x)**2+(cs.z-P.z)**2;if(d<3**2)cand(d,ACT.some(a=>a.guard2&&!a.dead)?'先打败守山灵兽':'打开秘境宝箱',()=>openChest())}}
  extraInteract(cand);
  if(G.merchant){const d=(G.merchant.x-P.x)**2+(G.merchant.z-P.z)**2;if(d<3.5**2)cand(d,'和商人交易',()=>{G.flags.merchant=1;ui.trade()},G.merchant)}
  if(!best&&G.tools.canteen&&G.water<3&&nearWater())best={label:'打水',fn:()=>{G.water=3;play(P.model,'gather',.7);toast('水壶装满了（可浇 3 次）')}};
  return best}
function pick(n){n.alive=false;setNode(n,false);gainXP(n.kind==='herb'?2:1);play(P.model,'gather',.6);P.lock=.45;let l;
  if(n.kind==='stick')l={wood:1};if(n.kind==='pebble')l={stone:1};if(n.kind==='herb')l={herb:1};if(n.kind==='berry'){l={berry:3};if(Math.random()<.3)l.seed=1}
  give(l);pickFX(n,l);const qs=GUIDE.step;toast('得到 '+fmtCost(l)+(qs&&qs.id==='gather'&&qs.prog?'（'+qs.prog()+'）':qs&&qs.id==='fire'&&qs.prog?'（篝火需要 '+qs.prog()+'）':''));RESP.push({t:n.kind==='berry'?160:120+Math.random()*120,fn:function f(){if(dist2(n)<400){RESP.push({t:20,fn:f});return}n.alive=true;setNode(n,true)}})}
function sleep(b){const night=G.hour>=18||G.hour<5;if(!night){toast('天还亮着，18 点以后才能睡（坐在篝火边可以让时间过得快些）');return}
  if(ACT.some(a=>!a.dead&&(a.angry||a.kind==='wolf'||a.human)&&Math.hypot(a.x-P.x,a.z-P.z)<16)){toast('附近有危险，睡不着！');return}
  P.st='sleep';P.x=b.x;P.z=b.z;P.yaw=b.ry+Math.PI/2;P.sitFire=null;G.timeScale=1;$('#fade').classList.add('on');
  later(1.4,()=>{const add=(G.hour>=18?24-G.hour:0)+6.5-(G.hour<5?G.hour:0);if(G.hour>=18)G.day++;G.hour=6.5;G.hp=G.maxhp;G.sta=G.maxsta;G.hunger=Math.max(5,G.hunger-22);
    for(const f of G.builds)if(f.t==='farm'&&f.stage===2)f.g+=add*DAY_LEN/24;for(const a of ACT)if(a.kind==='wolf'&&!a.dead){a.dead=true;a.deadT=999}
    save();toast('第 '+G.day+' 天 清晨。已存档',1)});
  later(2.8,()=>{$('#fade').classList.remove('on');P.st='idle'})}

/* ---------- 每帧：玩家 ---------- */
function updPlayer(dt){const h=P.model;P.atkCd-=dt;P.inv-=dt;P.lock-=dt;
  if(P.st==='sleep'||G.dead){animate(h,G.dead?'dead':'sleep',0,dt);place(h);return}
  const c=Math.cos(CAM.yaw),s=Math.sin(CAM.yaw);let mx=IN.mx,mz=IN.mz;const ml=Math.hypot(mx,mz);if(P.lock>0){mx=mz=0}
  if(ml>.15&&(P.sitFire||G.med)){P.sitFire=null;G.med=false;G.timeScale=1}
  let wx=mx*c-mz*s,wz=-mx*s-mz*c;const depth=WATER_Y-groundAt(P.x,P.z);const swim=depth>1.15;
  let spd=0,run=IN.run&&G.sta>1&&ml>.2;
  if(swim){spd=(run?4.2:2.8)*Math.min(1,ml);G.sta-=(run?9:3.5)*dt;if(G.sta<=0){G.sta=0;G.hp-=4*dt;if(G.hp<=0){G.hp=0;die()}}}
  else{spd=(run?7.2:3.8)*Math.min(1,ml)*G.spdMul;if(run)G.sta-=13*dt}
  if(G.flying){spd=(run?20:12)*Math.min(1,ml)}else if(P.st==='glide'){spd=Math.max(spd,8.5)}
  if(ml>.15||P.st==='glide'){const ty=ml>.15?Math.atan2(wx,wz):P.yaw;let d=ty-P.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));P.yaw+=d*Math.min(1,dt*(P.st==='glide'?3:12))}
  const vx=(ml>.15?wx/ml:P.st==='glide'?Math.sin(P.yaw):0)*spd,vz=(ml>.15?wz/ml:P.st==='glide'?Math.cos(P.yaw):0)*spd;
  P.kx=(P.kx||0)*Math.max(0,1-dt*8);P.kz=(P.kz||0)*Math.max(0,1-dt*8);
  let nx=P.x+(vx+P.kx)*dt,nz=P.z+(vz+P.kz)*dt;[nx,nz]=collide(nx,nz,.35);P.x=nx;P.z=nz;
  const gy=groundAt(P.x,P.z);
  if(swim&&P.y<WATER_Y+.3){P.y=lerp(P.y,WATER_Y-.45,Math.min(1,dt*6));P.vy=0;P.ground=false;P.st='swim';if(IN.jump&&depth<2){P.vy=6.5;P.y=WATER_Y+.32;P.st='air'}}
  else{
    if(IN.jump&&P.ground&&G.sta>6&&P.lock<=0&&!G.flying){sfx('jump');P.vy=8.6;P.ground=false;G.sta-=6;P.dj=0}else if(IN.jump&&!P.ground&&G.realm>=1&&!P.dj&&G.sta>8&&!G.flying){P.vy=8.2;P.dj=1;G.sta-=8;burst(P.x,P.y,P.z,hitMat,6,2)}
    const upd=inUpdraft();const gliding=!G.flying&&!P.ground&&IN.jumpHeld&&(G.tools.glider||G.realm>=1)&&(P.vy<-.5||(upd&&P.st==='glide'))&&G.sta>0&&P.y-gy>1.2;
    if(G.flying){P.vy=IN.jumpHeld?6:-1.3}else{P.vy-=(gliding?6:(G.grav||22))*dt;if(gliding){P.vy=upd?Math.min(P.vy+22*dt,7.5):Math.max(P.vy,-1.9);G.sta-=(upd?0:2.5)*dt}}
    P.y+=P.vy*dt;if(P.y<=gy){P.y=gy;P.vy=0;P.ground=true}else if(P.y-gy>.25||P.vy>0)P.ground=false;
    if(gliding||(G.flying&&!P.ground))P.st='glide';else if(!P.ground)P.st='air';else if(P.sitFire||G.med)P.st='sit';else if(P.lock>0&&(P.st==='kneel'||P.st==='pour')){}else P.st='walk'}
  IN.jump=false;
  P.sp=P.st==='glide'?8:Math.hypot(vx,vz);
  if(!run&&P.st!=='swim'&&P.st!=='glide')G.sta=Math.min(G.maxsta,G.sta+(P.sitFire?30:16)*dt*(P.sp<.2?1.4:1));
  if(P.glider)P.glider.visible=P.st==='glide'&&!G.flying;
  animate(h,P.st==='walk'?'idle':P.st,P.sp,dt);place(h)}
function animate(h,st,sp,dt){if(h.glb)animGLB(h,st,sp,dt);else animHuman(h,st,sp,dt)}
function place(h){h.position.set(P.x,P.y,P.z);h.rotation.y=P.yaw}

/* ---------- 每帧：AI ---------- */
const nearFire=(x,z,r)=>G.builds.some(b=>b.t==='fire'&&Math.hypot(b.x-x,b.z-z)<r);
function updActor(a,dt){const o=a.obj;if(G.slowT>0&&!a.dead)dt*=.3;
  if(a.ghost){ghostAI(a,dt);return}
  if(a.dead){a.deadT+=dt;if(a.human){animate(o,'dead',0,dt)}else animBeast(o,0,dt,'dead');o.position.y=lerp(o.position.y,a.y-(a.deadT>20?(a.deadT-20)*.2:0),.1);
    if(a.deadT>(a.loot?90:a.human?8:30)){scene.remove(o);if(a.bar){a.bar.remove();a.bar=null}ACT.splice(ACT.indexOf(a),1)}return}
  const dx=P.x-a.x,dz=P.z-a.z,d=Math.hypot(dx,dz);
  if(d>130&&!a.boss){o.visible=false;return}o.visible=true;
  a.cd-=dt;a.stun=(a.stun||0)-dt;let tx=a.x,tz=a.z,spd=0,st='idle';const pAlive=!G.dead&&P.st!=='sleep';
  const def=a.def||{};
  if(a.stun>0){}
  else if(def.flee){ // 鹿、兔：受惊逃跑
    if(a.tired>0){a.tired-=dt;if(a.tired<=0)a.fleeT=0}
    if((d<(IN.run?7:4)||(a.angry&&d<20))&&pAlive){tx=a.x-dx/d*10;tz=a.z-dz/d*10;
      if(a.tired>0){spd=a.speed*.28;st='walk'}else{spd=a.speed*(a.wound?.55:1);st='run';a.fleeT=(a.fleeT||0)+dt;if(a.fleeT>(a.wound?1.5:2.5)){a.tired=5;ftxt(a.x,a.y+1.4,a.z,a.wound?'受伤跑不动了':'跑不动了','')}}
      if(d>28)a.angry=false}else{a.wt-=dt;if(a.wt<=0){a.wt=rnd(3,8);const p=randAround(a.home.x,a.home.z,0,18);if(p&&Math.random()<.6){a.tx=p[0];a.tz=p[1]}else{a.tx=a.x;a.tz=a.z}}tx=a.tx;tz=a.tz;spd=Math.hypot(tx-a.x,tz-a.z)>.5?1.4:0;st=spd?'walk':'graze'}}
  else{ // 有攻击性的：野猪、狼、敌兵、首领
    const aggro=a.boss?a.aggro:a.kind==='boar'?(a.angry?20:4):a.kind==='wolf'?(a.raid?70:Math.max(18,a.aggro||0)):a.aggro||15;
    const leash=Math.hypot(a.x-a.home.x,a.z-a.home.z)>(a.raid?999:a.boss?28:45);
    const fear=a.kind==='wolf'&&nearFire(a.x,a.z,7);
    if(a.kind==='wolf'&&a.leave){tx=a.x-dx/d*10;tz=a.z-dz/d*10;spd=a.speed;if(d>60){a.dead=true;a.deadT=999}}
    else if(fear){const f=G.builds.find(b=>b.t==='fire'&&Math.hypot(b.x-a.x,b.z-a.z)<7);tx=a.x+(a.x-f.x);tz=a.z+(a.z-f.z);spd=a.speed*.7}
    else if(pAlive&&d<aggro&&!leash&&P.st!=='swim'){a.chase=true;if(a.boss&&!G.bossOn){G.bossOn=true;toast(a.name+'：「来得正好！」',1)}
      if(stalkAI(a,d,dx,dz,dt)){tx=a._tx;tz=a._tz;spd=a._sp}else if(nearFire(P.x,P.z,5.5)&&a.kind==='wolf'){tx=a.x;tz=a.z}
      else if(d>a.r+1.1){tx=P.x;tz=P.z;spd=a.speed}else spd=0;
      if(d<a.r+1.6&&a.cd<=0&&!a.pend&&!(a.stalk>0)&&!(a.fled>0)){a.cd=a.boss?1.4:rnd(1.1,1.6);if(a.human)play(o,'swing',.55);else o.act={k:'bite',t:0,d:.45};
        a.pend={t:a.boss?.5:.32,dmg:a.dmg*(a.boss?1.15:1),r:a.boss?3.4:a.r+1.8}}
      if(a.boss){a.slamCd-=dt;if(a.slamCd<=0&&d<14){a.slamCd=rnd(5,7);const sx=P.x,sz=P.z;warnRing(sx,sz,3.4,1.2);toast('小心红圈！');later(1.2,()=>{if(a.dead)return;burst(sx,groundAt(sx,sz)+.2,sz,MAT.rock2,14,5);shake(.4);if(Math.hypot(P.x-sx,P.z-sz)<3.4)hurtPlayer(30,sx,sz)});a.cd=1.5}
        if(!a.summoned&&a.hp<a.maxhp*.5){a.summoned=true;toast(a.name+'：「来人！」召唤了援兵',1);for(let i=0;i<3;i++){const p=randAround(a.x,a.z,3,6);if(p)spawnSoldier(...p,{raid:1,angry:true,aggro:40})}}
        ui.bossBar(a)}}
    else if(a.chase||leash){a.chase=false;tx=a.home.x;tz=a.home.z;spd=Math.hypot(tx-a.x,tz-a.z)>1?a.speed*.6:0;if(a.boss&&G.bossOn&&d>30){G.bossOn=false;ui.bossBar(null);a.hp=Math.min(a.maxhp,a.hp+120)}}
    else{a.wt-=dt;if(a.wt<=0){a.wt=rnd(3,9);const p=a.guard?null:randAround(a.home.x,a.home.z,0,a.kind==='soldier'?14:20);if(p){a.tx=p[0];a.tz=p[1]}}tx=a.tx;tz=a.tz;spd=Math.hypot(tx-a.x,tz-a.z)>.6?1.6:0;if(a.guard){spd=0;a.yaw=lerp(a.yaw,Math.PI,.02)}}
    if(a.pend){a.pend.t-=dt;spd*=.3;if(a.pend.t<=0){if(!a.stun||a.stun<=0){const dd=Math.hypot(P.x-a.x,P.z-a.z);if(dd<a.pend.r&&pAlive)hurtPlayer(a.pend.dmg,a.x,a.z)}a.pend=null}}}
  // 移动
  let mvx=0,mvz=0;if(spd>0){const ddx=tx-a.x,ddz=tz-a.z,l=Math.hypot(ddx,ddz);if(l>.3){mvx=ddx/l*spd;mvz=ddz/l*spd;const ty=Math.atan2(ddx,ddz);let dy=ty-a.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));a.yaw+=dy*Math.min(1,dt*8)}}
  else if(a.chase&&d<6){const ty=Math.atan2(dx,dz);let dy=ty-a.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));a.yaw+=dy*Math.min(1,dt*8)}
  a.kx*=Math.max(0,1-dt*7);a.kz*=Math.max(0,1-dt*7);
  let nx=a.x+(mvx+a.kx)*dt,nz=a.z+(mvz+a.kz)*dt;if(WATER_Y-groundAt(nx,nz)>.35){nx=a.x;nz=a.z;a.wt=0}else{[nx,nz]=collide(nx,nz,a.r*.8)}
  // 别和玩家重叠
  const pdx=nx-P.x,pdz=nz-P.z,pd=Math.hypot(pdx,pdz),mr=a.r+.35;if(pd<mr&&pd>.001){nx=P.x+pdx/pd*mr;nz=P.z+pdz/pd*mr}
  const realSp=Math.hypot(nx-a.x,nz-a.z)/Math.max(dt,1e-4);a.x=nx;a.z=nz;a.y=groundAt(a.x,a.z);
  o.position.set(a.x,a.y,a.z);o.rotation.y=a.yaw;
  if(a.pop>0){a.pop-=dt;const k=1+Math.sin(a.pop/.15*Math.PI)*.12;{const bs=a.sz||(a.boss?1.35:1);o.scale.set(k*bs,bs/k,k*bs)}}
  if(a.human)animate(o,'walk',realSp,dt);else animBeast(o,realSp,dt,st)}

/* ---------- 夜袭 ---------- */
function updRaid(){const night=G.hour>=20||G.hour<5;
  if(night&&G.raidDay!==G.day&&G.hour>=20){G.raidDay=G.day;const n=2+Math.min(3,G.day);for(let i=0;i<n;i++){const p=randAround(P.x,P.z,38,55);if(p)spawnBeast('wolf',...p,{raid:1})}
    if(G.day>=2&&!G.bossDead)for(let i=0;i<Math.min(3,G.day-1);i++){const p=randAround(P.x,P.z,40,55);if(p)spawnSoldier(...p,{raid:1,aggro:70,angry:true})}
    toast('夜深了，远处传来狼嚎……'+(G.day>=2?FACTION[G.faction].foeN+'的夜袭队也来了！':'')+' 篝火边更安全',1)}
  if(!night)for(const a of ACT)if(a.kind==='wolf'&&!a.dead&&!a.leave&&!a.guard2){a.leave=true}
  if(CH===2&&!G.flags.chest&&!G.guardOn&&CH2OBJ.chest&&Math.hypot(P.x-CH2OBJ.chest.x,P.z-CH2OBJ.chest.z)<32){G.guardOn=true;const c=CH2OBJ.chest;
    const k=spawnBeast('wolf',c.x+4,c.z+3,{guard2:1,name:'守山灵兽',hp:Math.round(240*DIFF),dmg:18*DIFF,speed:6,r:.9,aggro:45,angry:true,sz:1.7,h:2});k.obj.scale.setScalar(1.7);
    for(let i=0;i<3;i++){const p=randAround(c.x,c.z,5,9);if(p)spawnBeast('wolf',...p,{guard2:1,aggro:45,angry:true})}toast('守山灵兽苏醒了！打败它们才能打开秘境宝箱',1)}}
/* ---------- 第二章：突破、秘境宝箱 ---------- */
function breakthrough(){const A=G.faction==='A';if(G.realm){toast(A?'你已是筑基境界':'改造已经完成');return}const need={herb:6,ling:3};
  if(!has(need)){toast((A?'炼「筑基丹」':'义体改造')+'需要：灵草 6、灵石 3（现在 灵草 '+(G.inv.herb||0)+'、灵石 '+(G.inv.ling||0)+'）');return}
  take(need);G.realm=1;applyOrigin();G.hp=G.maxhp;G.sta=G.maxsta;G.mana=G.maxmana;G.flags.realm=1;P.lock=1.4;P.st='kneel';const fu=CH2OBJ.furnace;burst(fu.x,fu.obj.position.y+2,fu.z,MAT.flame,16,3);burst(P.x,P.y+1,P.z,hitMat,14,3);shake(.2);
  toast(A?'突破成功！炼气 → 筑基：生命 +30、体力 +20、灵力 +40、攻击 +20%':'改造完成！生命 +30、体力 +20、攻击 +20%',1);save()}
function openChest_old(){const c=CH2OBJ.chest;if(ACT.some(a=>a.guard2&&!a.dead)){toast('守山灵兽还在，先打败它们');return}
  G.flags.chest=1;sfx('chest');c.lid.rotation.x=-1.9;c.glow.visible=false;G.tools.xian=true;WEAPONS.xian.n=G.faction==='A'?'仙剑·流云':'合金战刀';give({ling:6,herb:5,potion:2});equip('xian');burst(c.x,c.obj.position.y+1,c.z,MAT.crystal,18,3);
  toast('获得秘境神兵「'+WEAPONS.xian.n+'」（伤害 48），以及 灵石6 灵草5 疗伤药2',1);save()}
function startChapter2(){travel(ROUTE()[1]);return;const s={v:1,ch:2,faction:G.faction,origin:G.origin,inv:G.inv,tools:G.tools,hp:G.maxhp,hunger:Math.max(70,G.hunger),sta:G.maxsta,mana:G.maxmana,hour:9,day:G.day+1,weapon:G.weapon,water:G.water,flags:{},bossDead:false,x:null,z:null,builds:[],realm:0,lv:G.lv,xp:G.xp,pts:G.pts,st:G.st};
  try{writeSave(s);sessionStorage.setItem('td5_auto','1')}catch(e){}location.reload()}

/* ---------- 任务提示 ---------- */
function quest(){return CH===2?quest2():questFull()}   // 第一章任务链见 p7_guide.js（新手引导 + 主线）

function openChest(){const c=CH2OBJ.chest;if(ACT.some(a=>a.guard2&&!a.dead)){toast('守山灵兽还在，先打败它们');return}
  G.flags.chest=1;sfx('chest');c.lid.rotation.x=-1.9;c.glow.visible=false;const l={ling:5,herb:4,potion:1,fu:2};if(REGD.mat)l[regMat(REGK)]=4;give(l);gainQi(60);burst(c.x,c.obj.position.y+1,c.z,MAT.crystal,18,3);
  let msg='秘境宝箱：'+fmtCost(l)+'，灵气 +60';if(!G.tools.xian){G.tools.xian=true;WEAPONS.xian.n=G.faction==='A'?'仙剑·流云':'合金战刀';equip('xian');msg+='，以及秘境神兵「'+WEAPONS.xian.n+'」'}toast(msg,1);save()}
function quest2(){const f=G.flags,A=G.faction==='A';const steps=[
    [()=>f.merchant,'去「'+ZONES.market.name+'」找商人打听'+REGD.n+'的消息'],
    [()=>f.chest,'登上「'+ZONES.mine.name+'」，打败守山灵兽，打开秘境宝箱（得到'+(REGD.mat||'宝物')+'）'],
    [()=>G.cleared[REGK],'攻入「'+ZONES.enemy.name+'」，击败「'+bossName()+'」'],
    [()=>false,nextRegion()?'去渡口登上灵舟，前往下一站：'+regName(nextRegion()):'九州已定']];
  for(let k=0;k<steps.length;k++)if(!steps[k][0]())return{n:k+1,all:steps.length,t:steps[k][1]};return{n:steps.length,all:steps.length,t:'完成'}}
/* ---------- 存档 ---------- */
const SAVE_KEY='td5_save';
function writeSave(s){const j=JSON.stringify(s);localStorage.setItem(SAVE_KEY,j);if(s&&s.faction)localStorage.setItem(SAVE_KEY+'_'+s.faction,j)}
function save(){if(G.dead||G.hp<=0||G.prologue)return;try{writeSave(saveObj())}catch(e){}}
function saveObj(){return({v:2,reg:REGK,qi:G.qi,wtier:G.wtier,cleared:G.cleared,bases:G.bases,rflags:Object.assign({},G.rflags,{[REGK]:G.flags}),pets:PETS.map(p=>({kind:p.kind,name:p.name,role:p.role,big:p.big})),perks:G.perks,skillSel:G.skillSel,ch:CH,realm:G.realm,lv:G.lv,xp:G.xp,pts:G.pts,st:G.st,faction:G.faction,origin:G.origin,inv:G.inv,tools:G.tools,hp:G.hp,hunger:G.hunger,sta:G.sta,mana:G.mana,hour:G.hour,day:G.day,weapon:G.weapon,water:G.water,flags:G.flags,bossDead:G.bossDead,x:P.x,z:P.z,
  builds:G.builds.map(b=>({t:b.t,x:b.x,z:b.z,ry:b.ry,stage:b.stage,g:b.g}))})}
function loadSave(){try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'null')}catch(e){return null}}
function ending(kind){if(G.over)return;achEnd(kind);G.over=true;const f=FACTION[G.faction],home=ORIGINS[G.faction][G.origin];
  if(kind==='final'){ui.end(G.faction==='A'?'白日飞升':'机械飞升','你在第 '+G.day+' 天登上天墟，击败了天道化身。<br>九州归一，'+realmN(G.realm)+'境界的你'+(G.faction==='A'?'踏云而上，白日飞升。':'把意识上传到星海，完成了机械飞升。')+'<br>等级 '+G.lv+'，收服灵兽 '+PETS.length+' 只。','final');try{localStorage.removeItem(SAVE_KEY)}catch(e){}return}
  if(kind==='escape'){const b=G.builds.find(b=>b.t==='boat');P.model.visible=false;G.endBoat=b;
    ui.end('灵舟远航','你在第 '+G.day+' 天驾着灵舟离开中州·灵河界，顺着灵河入海，回到了'+home+'。<br>'+f.from+'的人们会听你讲起这片土地的故事。','escape')}
  else if(CH===2)ui.end('收复故乡','你在第 '+G.day+' 天攻破敌占营寨，击败了「'+bossName()+'」。<br>'+home+'重新回到'+f.n+'手中。乡亲们点起灯笼，迎你回家。','conquer');
  else ui.end('征服','你在第 '+G.day+' 天攻入敌营，击败了'+f.foeN+'首领「'+f.boss+'」。<br>灵河界从此归'+f.n+'所有，'+home+'的旗帜插上了敌营的望楼。','conquer');
  try{localStorage.removeItem(SAVE_KEY);localStorage.removeItem(SAVE_KEY+'_'+G.faction)}catch(e){}}

/* ---------- 开局 ---------- */
function applyOrigin(){const o=G.origin,RB=REALMS[G.realm||0];G.maxhp=(o==='天'?130:100)+RB.hp;G.maxsta=(o==='云'?130:100)+RB.sta;G.atkMul=(o==='玄'?1.25:1)*(1+RB.atk)*(1+(G.wtier||0)*.12);G.hungerMul=o==='仙'?.7:1;G.maxmana=60+RB.mana;
  const s=G.st||{},lb=(G.lv||1)-1;G.maxhp+=lb*6+(s.vit||0)*12;G.maxsta+=lb*2+(s.agi||0)*8;G.atkMul*=1+lb*.02+(s.str||0)*.06;G.spdMul=1+(s.agi||0)*.02;G.skillMul=1+lb*.02+(s.spi||0)*.08;if(G.maxmana)G.maxmana+=lb*2+(s.spi||0)*10;G.skillMul*=1+RB.atk;const pk=G.perks||{};if(pk.yunbu)G.spdMul*=1.15;if(pk.hudun)G.maxhp*=1.2;if(pk.leiyin)G.skillMul*=1.3;G.maxhp=Math.round(G.maxhp)}
/* ---------- 等级与经验：打怪、砍树、采集、制造、建造、完成目标都加经验；每升一级生命回满并获得 2 个属性点 ---------- */
const needXP=l=>40+l*35;
function rankName(){return realmN(G.realm||0)+' · '+G.lv+' 级'}
function gainXP(n){if(G.over||!G.started||G.prologue)return;G.xp+=n;ftxt(P.x,P.y+2.3,P.z,'+'+n+' 经验','xp');let up=0;while(G.lv<50&&G.xp>=needXP(G.lv)){G.xp-=needXP(G.lv);G.lv++;G.pts+=2;up++}
  if(up){sfx('levelup');const r=G.hp/G.maxhp;applyOrigin();G.hp=G.maxhp;G.sta=G.maxsta;if(G.maxmana)G.mana=G.maxmana;burst(P.x,P.y+1,P.z,MAT.gold,18,3);ftxt(P.x,P.y+2.8,P.z,'升级！','lvup');
    toast('升级了！'+rankName()+'：生命体力回满，获得 '+(2*up)+' 个属性点（点左上角「加点」）',1);save()}}
async function startGame(fac,origin,sv){G.starting=true;try{await grokPreload()}catch(e){}
  G.faction=fac;G.origin=origin;G.realm=sv&&sv.realm||0;G.lv=sv&&sv.lv||1;G.xp=sv&&sv.xp||0;G.pts=sv&&sv.pts||0;G.st=Object.assign({str:0,vit:0,agi:0,spi:0},sv&&sv.st||{});Object.assign(G,{qi:sv&&sv.qi||0,wtier:sv&&sv.wtier||0,cleared:sv&&sv.cleared||{},bases:sv&&sv.bases||{},rflags:sv&&sv.rflags||{},perks:sv&&sv.perks||{},skillSel:sv&&sv.skillSel||'base'});applyOrigin();G.hp=G.maxhp;G.sta=G.maxsta;G.mana=G.maxmana;G.inv={};G.tools={};
  buildCamp('home',fac,false);buildCamp('enemy',FACTION[fac].foe,true);try{placeSceneModels()}catch(e){console.warn('scene models',e);if(PAV&&!PAV.done)PAV.proc()}bakeAll();
  P.x=ZONES.home.x+3;P.z=ZONES.home.z+4;P.yaw=Math.PI*.6;
  if(sv){Object.assign(G,{inv:sv.inv||{},tools:sv.tools||{},hp:sv.hp,hunger:sv.hunger,sta:sv.sta,mana:sv.mana||0,hour:sv.hour,day:sv.day,water:sv.water||0,flags:sv.flags||{},bossDead:!!sv.bossDead});if(sv.x!=null){P.x=sv.x;P.z=sv.z}if(G.tools.xian)WEAPONS.xian.n=fac==='A'?'仙剑·流云':'合金战刀';for(const b of sv.builds||[])placeBuild(b.t,b.x,b.z,b.ry,{stage:b.stage,g:b.g})}
  if(sv){G.hp=Math.max(G.hp||0,(G.maxhp||100)*.6);G.hunger=Math.max(G.hunger||0,60)}
  populate();initRegion(sv);
  P.model=makeHuman(fac);scene.add(P.model);P.glider=mkGlider();P.model.add(P.glider);
  const glb=await idbGet('hero_glb');if(glb&&glb.buf){try{await useGLB(glb.buf,glb.flip,true)}catch(e){toast('自定义模型加载失败，已用默认人物')}}
  else if(!glb){const hb=await builtinHero(fac==='A'?'heroA':'heroB');if(hb)try{await useGLB(hb,false,true)}catch(e){console.warn(e)}}
  equip(sv&&sv.weapon&&(sv.weapon==='fist'||G.tools[sv.weapon])?sv.weapon:'fist');
  try{if(CH!==2)placeCampPickups()}catch(e){console.warn('placeCampPickups',e)}
  P.y=groundAt(P.x,P.z);refreshGrass(P.x,P.z);G.started=true;G.raidDay=G.hour>=20?G.day:0;if(!sv)save();
  if(CH===2&&sv&&sv.x==null){save();toast(REGK==='tx'?'你登上了天墟·九州之巅。天道化身就在天宫之中……':'灵舟靠岸，你来到了'+REGD.n+'。'+(G.cleared[REGK]?'这里已经平定。':'这里被「'+bossName()+'」把持，先去'+ZONES.market.name+'打听消息'),1);return}
  toast(sv?'读取存档：第 '+G.day+' 天'+(CH===2?'（第二章 · '+ORIGINS[fac][origin]+'）':''):'你是来自'+ORIGINS[fac][origin]+'的'+FACTION[fac].n+'，流落到中州·灵河界。你在「我方营地」，地上发光的就是树枝和石子，先捡几样吧',1)}
async function useGLB(buf,flip,quiet){const w=await buildGLBHero(buf.slice(0),flip);const old=P.model;if(old){scene.remove(old)}P.model=w;scene.add(w);P.glider=mkGlider();w.add(P.glider);
  if(w.rig){w.rig.propKey=null;setProp(w,WEAPONS[G.weapon].prop);if(!quiet)toast('模型已替换：它没有自带骨骼和动作，已自动绑骨，用游戏内置动作驱动',1);return{names:['（没有自带动作：已自动绑骨，用内置的走、跑、跳、游泳、滑翔、攻击、坐、睡动作）'],acts:{}}}
  if(G.started||quiet)attachGLBProp(WEAPONS[G.weapon].prop);const g=w.glb;const miss=['idle','walk','run','jump','swim','glide','attack'].filter(k=>!g.acts[k]);
  if(!quiet)toast('模型已替换。找到的动作：'+(g.names.join('、')||'（没有动作）')+(miss.length?'；缺少：'+miss.join('、')+'（会用其它动作代替）':''),1);return g}
async function importGLB(file,flip){const buf=await file.arrayBuffer();const g=await useGLB(buf,flip);await idbSet('hero_glb',{buf,flip});return g}
const HERO_CACHE={};
async function builtinHero(id){id=id||(G.faction==='B'?'heroB':'heroA');try{if(!HERO_CACHE[id]){const r=await fetch('assets/models/'+id+'.glb');if(!r.ok)return null;HERO_CACHE[id]=await r.arrayBuffer()}return HERO_CACHE[id].slice(0)}catch(e){console.warn('hero',e);return null}}
async function useBuiltin(){await idbSet('hero_glb',null);const b=await builtinHero();if(b){await useGLB(b,false,true);toast('已换回内置 3D 人物模型')}else toast('没有内置 3D 模型')}
async function resetModel(){await idbSet('hero_glb',{simple:1});const m=makeHuman(G.faction);scene.remove(P.model);P.model=m;scene.add(m);P.glider=mkGlider();m.add(P.glider);P.model.rig.propKey=null;equip(G.weapon);toast('已恢复默认人物')}
