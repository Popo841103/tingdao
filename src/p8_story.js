/* ---------- 此岸 · 故事层（只用现有营地、采集、坊市、篝火；不改地图） ----------
   设定：你是被冲到灵河此岸的游魂。对岸有你要找回的人。渡口只在雾退时出现。
   新增的都是 G.flags 里的标记（随原有存档一起保存，不改存档格式）：
   st_open 开场已看 / mem_* 记忆闪回已出现 / st_ask 问过摊主 / pledge 答应守火 / st_clue 知道渡口方位
   vigil 守夜结果（1 火保住 2 火灭）/ st_morn 守夜后的早晨已看 */
const STORY_ON=()=>CH!==2;
// 记忆闪回：短句，只出现一次
const MEMS={
  stick:'枯枝断口齐整。有人在这里劈过柴，等过一整个冬天。',
  pebble:'石子背面，磨出半个「渡」字。',
  axe:'这握法，你做过。很久以前，有人手把手教过你。',
  chop:'树倒下的声音，像那年渡口的船板。',
  fire:'火光里，你想起一个名字的第一个字。只有一个字。',
  cook:'肉香。有人总把最好的一块，留给你。'};
let memEl=null,memT=null;
function memory(k){if(!STORY_ON()||!MEMS[k]||G.flags['mem_'+k])return;G.flags['mem_'+k]=1;
  if(!memEl){memEl=document.createElement('div');memEl.id='mem';el('hud').appendChild(memEl)}
  memEl.textContent=MEMS[k];memEl.classList.remove('on');void memEl.offsetWidth;memEl.classList.add('on');clearTimeout(memT);memT=setTimeout(()=>memEl.classList.remove('on'),5200)}
function memCount(){return Object.keys(MEMS).filter(k=>G.flags['mem_'+k]).length}

/* ----- 故事卡片：几行短句 + 按钮（打开时游戏暂停） ----- */
function storyCard(title,lines,btns){const m=el('story');if(GUIDE.doneEl)GUIDE.doneEl.classList.remove('on');el('toast').classList.remove('on');el('stT').textContent=title||'';
  el('stL').innerHTML=lines.map((l,i)=>`<p style="animation-delay:${i*.45}s">${l}</p>`).join('');
  el('stB').innerHTML='';for(const b of btns){const x=document.createElement('button');x.textContent=b.t;if(b.off){x.disabled=true}x.onclick=()=>{panel('story',false);if(b.fn)b.fn()};el('stB').appendChild(x)}
  panel('story',true)}
function storyOpen(){return el('story').classList.contains('on')}

/* ----- 开场 ----- */
function storyIntro(){if(!STORY_ON()||G.flags.st_open)return;G.flags.st_open=1;
  storyCard('此岸',['河水把你推上岸。你记不起自己的名字。','只记得——对岸，有人在等。','渡口不常开。夜里河雾会涨，雾里会丢路，丢记忆，也丢命。','<b>今夜之前，先把火生起来。</b>火在，雾不近。'],[{t:'起身'}])}

/* ----- 坊市摊主：带条件的线索 ----- */
const CLUE='「渡口在北，灵河拐弯处。雾退的那一刻，船才靠岸。」';
function storyMerchant(){const f=G.flags;f.merchant=1;if(!STORY_ON()){ui.trade();return}
  const stone=(G.inv.stone||0)>=1,give1={t:stone?'交出一块石子':'交出一块石子（你身上没有）',off:!stone,fn:()=>{take({stone:1});f.st_ask=1;f.st_clue=1;storyCard('摊主',['他把石子翻过来，指腹摸过那半个「渡」字。','「……果然是你。」',CLUE],[{t:'记下'},{t:'看看货',fn:()=>ui.trade()}])}};
  const shop={t:'看看货',fn:()=>ui.trade()};
  if(!f.st_ask){storyCard('摊主',['「渡口？」他压低了声音。','「此岸的消息，都有灵价。」','「要么今夜把火守过子时，让对岸看见你；要么，给我一块你亲手拣的石子。」'],
      [give1,{t:'我今夜守火',fn:()=>{f.st_ask=1;f.pledge=1;storyCard('摊主',['「好。子时过后，我自会知道。」'],[{t:'告辞'},shop])}},{t:'先看看货',fn:()=>{f.st_ask=1;ui.trade()}}]);return}
  if(!f.st_clue){if(f.vigil===1){f.st_clue=1;storyCard('摊主',['「昨夜对岸那盏灯，我也看见了。」','他没再要你什么。',CLUE],[{t:'记下'},shop]);return}
    if(f.vigil===2){storyCard('摊主',['「火灭了？」他看了你很久。','「雾里的话，我不敢说全。……拿一块石子来。」'],[give1,shop]);return}
    storyCard('摊主',['「子时还没过。」','「守住你的火。」'],[give1,shop]);return}
  storyCard('摊主',['「又是你。」',CLUE],[shop,{t:'告辞'}])}

/* ----- 第一夜：守火过子时 ----- */
// 火势只在守夜这一夜会减（平时篝火照旧一直亮，不改原有玩法）
function campFires(){return G.builds.filter(b=>b.t==='fire'&&Math.hypot(b.x-ZONES.home.x,b.z-ZONES.home.z)<32)}
function fireK(b){return b.out?0:b.flame==null?1:.3+.7*b.flame/100}
function vigilActive(){return STORY_ON()&&GUIDE.step&&GUIDE.step.id==='vigil'&&(G.hour>=20||G.hour<1)}
let lamp=null,mistK=0,mistT=0,surge=0;
function mkLamp(){if(lamp)return;const x=riverX(70)+38,z=70;lamp=new THREE.Group();
  const core=new THREE.Mesh(new THREE.SphereGeometry(.9,12,10),new THREE.MeshBasicMaterial({color:'#ffd27a',fog:false}));
  const halo=new THREE.Mesh(new THREE.SphereGeometry(2.6,14,10),new THREE.MeshBasicMaterial({color:'#ffb040',transparent:true,opacity:.28,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
  lamp.add(core,halo);lamp.position.set(x,groundAt(x,z)+7,z);lamp.userData.halo=halo;scene.add(lamp)}
function vigilEnd(ok){const f=G.flags;f.vigil=ok?1:2;
  if(ok){mkLamp();storyCard('子时过了',['火还在。','对岸，亮起一盏灯。','风里有人轻轻唤了一声——像是你的名字。'],[{t:'记住它'}])}
  else{surge=28;storyCard('雾',['火灭了。雾从河面漫上来。','有人在雾里说：','「……别忘了，你答应过——」','后面的话，被雾吞了。'],[{t:'……'}])}
  for(const b of campFires())if(!b.out)b.flame=null;save()}   // 失败时熄灭的火保持熄灭，要自己添柴重新点
function updStory(dt,t){if(!STORY_ON()||!G.started||G.dead||G.over)return;const f=G.flags;
  if(!f.st_open&&!storyOpen()&&!G.paused)storyIntro();
  if(f.vigil===1&&!lamp)mkLamp();
  if(lamp){const s=1+Math.sin(t*2.2)*.12;lamp.userData.halo.scale.setScalar(s);lamp.visible=!dayK().day||dayK().day<.6}
  const gh=dt*G.timeScale*24/DAY_LEN;   // 这一帧过去的游戏小时
  if(vigilActive()&&!G.paused){const fs=campFires();
    for(const b of fs){if(b.out)continue;if(b.flame==null)b.flame=100;b.flame-=gh*50;   // 不添柴，大约两个时辰烧完
      if(P.sitFire===b&&b.flame<30&&(G.inv.wood||0)>0){take({wood:1});b.flame=Math.min(100,b.flame+40);toast('你添了一根柴')}
      if(b.flame<=0){b.flame=0;b.out=true;burst(b.x,b.obj.position.y+.6,b.z,MAT.dark,6,1.2);if(P.sitFire===b){P.sitFire=null;G.timeScale=1}}}
    f.vigilOn=1;const lit=fs.some(b=>!b.out);
    if(!lit&&(G.hour>=20.5||G.hour<1)&&!storyOpen())vigilEnd(false)}
  else if(f.vigilOn&&!f.vigil&&GUIDE.step&&GUIDE.step.id==='vigil'&&G.hour>=1&&G.hour<6&&!storyOpen()&&!G.paused)vigilEnd(campFires().some(b=>!b.out))
  else if(STORY_ON()&&GUIDE.step&&GUIDE.step.id==='vigil'&&G.hour>=19&&G.hour<20&&!campFires().length&&!GUIDE.duskWarn){GUIDE.duskWarn=true;toast('天快黑了。营地里，还没有火。',1)}
  // 守夜之后的早晨
  if(f.vigil&&!f.st_morn&&G.hour>=6&&G.hour<12&&!storyOpen()){f.st_morn=1;
    storyCard('天亮',f.vigil===1?['灯还在对岸，淡了，但没灭。','去坊市。那人知道路。']:['雾退了，带走了几段事。','还好，河还在。今夜，再生一次火。'],[{t:'走'}])}
  // 夜里的河雾：离火远、又靠近水边，会掉血，也会丢记忆
  let wet=false;if(isNight()&&!G.paused){const nearFire=G.builds.some(b=>b.t==='fire'&&!b.out&&(b.x-P.x)**2+(b.z-P.z)**2<14*14);
    if(!nearFire&&zoneOf(P.x,P.z)!=='home'){for(const a of[0,1.57,3.14,4.71])if(WATER_Y-groundAt(P.x+Math.cos(a)*7,P.z+Math.sin(a)*7)>.05){wet=true;break}}}
  mistK=lerp(mistK,wet||surge>0?1:0,Math.min(1,dt*1.5));if(surge>0)surge-=dt;
  if(wet){G.hp-=1.2*dt*G.timeScale;mistT-=dt;if(mistT<=0){mistT=14;toast(['雾里有人唤你。你应了一声，却想不起自己叫什么。','脚下的路，刚才还在。','雾很冷。回到火边去。'][(Math.random()*3)|0],1)}if(G.hp<=0){G.hp=0;die()}}
  if(mistK>.01){scene.fog.near*=1-.8*mistK;scene.fog.far*=1-.75*mistK}}
// 熄灭的火可以重新点（只会在守夜失败那一刻出现，结束后会自动复燃，这里是保险）
function relightCand(b,d,cand){if(b.out&&d<3.2**2)cand(d,'重新点火（木头1）',()=>{if((G.inv.wood||0)<1){toast('需要 木头1');return}take({wood:1});b.out=false;b.flame=60;toast('火又亮了')},b)}
