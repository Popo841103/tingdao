/* ---------- 声音：全部用 Web Audio 实时合成（不需要音频文件，没有版权问题） ----------
   sfx('名字') 播放音效；背景音乐是程序生成的古风五声音阶（古筝式拨弦 + 低音铺底），
   白天明亮、夜里低沉，附近有敌人时加入战鼓。设置里可以分别开关音效和音乐。 */
const AUD={ctx:null,master:null,sfxG:null,musG:null,rev:null,on:{sfx:true,mus:true},last:{},mus:null};
try{const s=JSON.parse(localStorage.getItem('td5_snd')||'null');if(s)AUD.on=Object.assign(AUD.on,s)}catch(e){}
function audInit(){if(AUD.ctx){if(AUD.ctx.state==='suspended')AUD.ctx.resume().catch(()=>{});return}
  const C=window.AudioContext||window.webkitAudioContext;if(!C)return;let c;try{c=new C()}catch(e){return}AUD.ctx=c;
  AUD.master=c.createGain();AUD.master.gain.value=.9;AUD.master.connect(c.destination);
  const comp=c.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;comp.connect(AUD.master);
  AUD.sfxG=c.createGain();AUD.sfxG.gain.value=AUD.on.sfx?.8:0;AUD.sfxG.connect(comp);
  AUD.musG=c.createGain();AUD.musG.gain.value=AUD.on.mus?.55:0;AUD.musG.connect(comp);
  // 混响：用衰减的噪声做脉冲响应
  const len=c.sampleRate*2.6,ir=c.createBuffer(2,len,c.sampleRate);for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3)}
  AUD.rev=c.createConvolver();AUD.rev.buffer=ir;const rg=c.createGain();rg.gain.value=.38;AUD.rev.connect(rg);rg.connect(comp);
  const nb=c.createBuffer(1,c.sampleRate,c.sampleRate),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;AUD.noise=nb;
  if(c.state==='suspended')c.resume().catch(()=>{});musStart()}
['pointerdown','touchstart','keydown','click'].forEach(e=>window.addEventListener(e,audInit,{capture:true,passive:true}));
document.addEventListener('visibilitychange',()=>{if(!AUD.ctx)return;if(document.hidden)AUD.ctx.suspend().catch(()=>{});else AUD.ctx.resume().catch(()=>{})});
function audSet(k,v){AUD.on[k]=v;try{localStorage.setItem('td5_snd',JSON.stringify(AUD.on))}catch(e){}if(!AUD.ctx)return;const t=AUD.ctx.currentTime;
  if(k==='sfx')AUD.sfxG.gain.setTargetAtTime(v?.8:0,t,.05);if(k==='mus')AUD.musG.gain.setTargetAtTime(v?.55:0,t,.3)}

/* 基本发声单元 */
function tone(o){const c=AUD.ctx,t=c.currentTime+(o.at||0);const os=c.createOscillator(),g=c.createGain();os.type=o.type||'sine';os.frequency.setValueAtTime(o.f,t);if(o.f2)os.frequency.exponentialRampToValueAtTime(Math.max(20,o.f2),t+(o.slide||o.d));if(o.det)os.detune.value=o.det;
  const v=o.v||.3,a=o.a||.005;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+o.d);
  let n=g;if(o.lp){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=o.lp;g.connect(f);n=f}os.connect(g);n.connect(o.out||AUD.cur||AUD.sfxG);if(o.rv){const s=c.createGain();s.gain.value=o.rv;n.connect(s);s.connect(AUD.rev)}os.start(t);os.stop(t+o.d+.05)}
function noise(o){const c=AUD.ctx,t=c.currentTime+(o.at||0);const s=c.createBufferSource();s.buffer=AUD.noise;s.loop=true;const f=c.createBiquadFilter();f.type=o.ft||'bandpass';f.frequency.setValueAtTime(o.f||1000,t);if(o.f2)f.frequency.exponentialRampToValueAtTime(o.f2,t+o.d);f.Q.value=o.q||1;
  const g=c.createGain(),v=o.v||.3;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+(o.a||.004));g.gain.exponentialRampToValueAtTime(.0001,t+o.d);s.connect(f);f.connect(g);g.connect(o.out||AUD.cur||AUD.sfxG);if(o.rv){const r=c.createGain();r.gain.value=o.rv;g.connect(r);r.connect(AUD.rev)}s.start(t,Math.random()*.5);s.stop(t+o.d+.05)}
const PENTA=[0,2,4,7,9];const hz=(m)=>440*Math.pow(2,(m-69)/12);
function pluck(m,at,v,out,d){const f=hz(m);tone({f,type:'triangle',d:d||1.4,v:v||.18,at,a:.003,lp:3200,out,rv:.5});tone({f:f*2,type:'sine',d:(d||1.4)*.5,v:(v||.18)*.35,at,a:.002,out,rv:.3});tone({f:f*1.003,type:'sawtooth',d:.12,v:(v||.18)*.25,at,lp:2400,out})}

const SFX={
  swing:()=>noise({f:900,f2:2600,q:1.4,d:.18,v:.22,a:.03}),
  hit:(k)=>{tone({f:150,f2:55,d:.16,v:.5,type:'sine'});noise({f:1800,q:.8,d:.07,v:.3});if(k)tone({f:880,f2:440,d:.18,v:.12,type:'square',lp:2000})},
  flesh:()=>{tone({f:120,f2:50,d:.18,v:.5});noise({ft:'lowpass',f:900,d:.12,v:.35})},
  chop:()=>{tone({f:340,f2:220,d:.09,v:.35,type:'triangle'});noise({f:700,q:3,d:.08,v:.35})},
  treefall:()=>{noise({ft:'lowpass',f:500,f2:120,d:1.1,v:.35,a:.3});tone({f:70,f2:40,d:.6,v:.5,at:.9});noise({ft:'lowpass',f:300,d:.4,v:.4,at:.9})},
  mine:()=>{tone({f:1250+Math.random()*200,d:.22,v:.18,type:'square',lp:3000,rv:.2});noise({f:2500,q:2,d:.06,v:.3})},
  pickup:()=>{const b=74;pluck(b+12,0,.14,null,.5);pluck(b+19,.07,.12,null,.6)},
  craft:()=>{tone({f:900,d:.12,v:.15,type:'square',lp:2500});tone({f:900,d:.12,v:.15,type:'square',lp:2500,at:.14});[0,4,7].forEach((s,i)=>pluck(72+s,.3+i*.06,.13,null,.9))},
  levelup:()=>{[0,2,4,7,9,12,16].forEach((s,i)=>pluck(67+s,i*.07,.16,null,1.6));tone({f:hz(91),d:2.2,v:.08,at:.5,rv:.8})},
  quest:()=>{[0,4,7,12].forEach((s,i)=>pluck(72+s,i*.09,.15,null,1.2))},
  hurt:()=>{tone({f:200,f2:80,d:.22,v:.45,type:'sawtooth',lp:900});noise({ft:'lowpass',f:700,d:.15,v:.3})},
  death:()=>{[0,-2,-5,-7,-12].forEach((s,i)=>pluck(62+s,i*.28,.16,null,2))},
  fire:()=>{noise({ft:'lowpass',f:400,f2:2400,d:.45,v:.35,a:.05});tone({f:220,f2:520,d:.35,v:.12,type:'sawtooth',lp:1200})},
  thunderShot:()=>{noise({f:3000,q:.6,d:.3,v:.3});tone({f:1600,f2:300,d:.25,v:.12,type:'square',lp:3500})},
  thunder:()=>{noise({f:4000,q:.5,d:.08,v:.5});noise({ft:'lowpass',f:900,f2:120,d:1.8,v:.6,a:.02,at:.03,rv:.6});tone({f:60,f2:35,d:1.5,v:.45,at:.05})},
  bow:()=>{tone({f:330,f2:180,d:.12,v:.25,type:'triangle'});noise({f:2600,f2:900,q:2,d:.2,v:.18})},
  throw:()=>noise({f:600,f2:1500,q:1.2,d:.2,v:.2,a:.02}),
  boom:()=>{noise({ft:'lowpass',f:1200,f2:80,d:1.2,v:.7,rv:.5});tone({f:90,f2:30,d:.9,v:.6})},
  eat:()=>{for(let i=0;i<3;i++)noise({f:1400+Math.random()*800,q:2,d:.06,v:.25,at:i*.13})},
  jump:()=>noise({f:500,f2:1100,q:1,d:.16,v:.08,a:.02}),
  skill:()=>{[0,7,12].forEach((s,i)=>tone({f:hz(76+s),d:.6,v:.1,at:i*.05,rv:.6}));noise({f:2000,f2:5000,q:1,d:.4,v:.1,a:.1})},
  chest:()=>{tone({f:260,f2:180,d:.25,v:.25,type:'triangle'});[0,4,7,12,16].forEach((s,i)=>pluck(76+s,.2+i*.06,.13,null,1.4))},
  gong:()=>{[1,1.48,2.02,2.74,3.6].forEach((r,i)=>tone({f:98*r,d:4-i*.5,v:.22/(i+1),a:.01,rv:.9}));noise({ft:'lowpass',f:600,d:.5,v:.3})},
  kill:()=>{tone({f:hz(81),d:.5,v:.08,rv:.4})},
  bowl:()=>{tone({f:hz(62),d:3.5,v:.18,a:.02,rv:.9});tone({f:hz(62)*2.71,d:2.5,v:.05,a:.02,rv:.9})},
  click:()=>tone({f:1500,d:.04,v:.06,type:'triangle'}),
  build:()=>{for(let i=0;i<3;i++){tone({f:180,f2:120,d:.1,v:.4,at:i*.18,type:'triangle'});noise({f:900,q:2,d:.06,v:.3,at:i*.18})}}};
const SFX_VOL={swing:8,hit:4.5,flesh:5,chop:6.5,mine:7,pickup:2,craft:1.3,hurt:5.5,fire:6.5,thunderShot:6.5,bow:7,throw:12,eat:4.5,jump:10,kill:7,click:7,skill:2.5};
function sfx(k,arg){if(!AUD.ctx||!AUD.on.sfx||!SFX[k])return;const now=performance.now();if(now-(AUD.last[k]||0)<45)return;AUD.last[k]=now;
  const g=AUD.ctx.createGain();g.gain.value=SFX_VOL[k]||1;g.connect(AUD.sfxG);AUD.cur=g;try{SFX[k](arg)}catch(e){}AUD.cur=null;setTimeout(()=>{try{g.disconnect()}catch(e){}},6000)}

/* 背景音乐：D 宫五声音阶的古风曲子。四小节和声循环（宫-徵-羽-商）、两小节一句的旋律动机（重复后再变奏）、
   古筝拨弦 + 笛子长音 + 低音 + 堂鼓/木鱼/沙锤。白天 112 拍、夜里 90 拍更安静、附近有敌人时 138 拍加重鼓点。 */
const MKEY=62,MPROG=[0,-5,-3,-7];
const pen=d=>{const o=Math.floor(d/5),r=((d%5)+5)%5;return o*12+PENTA[r]};
function newMotif(dense){const m=[];let d=5+Math.floor(Math.random()*3);
  for(let i=0;i<16;i++){const on=i%4===0?.92:i%2===0?.7:dense;if(Math.random()<on){d=clamp(d+[-2,-1,-1,0,1,1,2,3][Math.floor(Math.random()*8)],2,12);m.push({d,long:i%4===0&&Math.random()<.3})}else m.push(null)}
  m[0]=m[0]||{d:5};return m}
function flute(m,at,d,v,out){const c=AUD.ctx,t=c.currentTime+at,f=hz(m);const o=c.createOscillator(),g=c.createGain(),lfo=c.createOscillator(),lg=c.createGain();
  o.type='sine';o.frequency.value=f;lfo.frequency.value=5.5;lg.gain.value=f*.006;lfo.connect(lg);lg.connect(o.frequency);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.06);g.gain.setValueAtTime(v,t+d*.7);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(g);g.connect(out);const r=c.createGain();r.gain.value=.5;g.connect(r);r.connect(AUD.rev);o.start(t);lfo.start(t);o.stop(t+d+.05);lfo.stop(t+d+.05);
  tone({f:f*2,type:'sine',d:d*.8,v:v*.12,at,a:.06,out});noise({f:f*2,q:3,d:.12,v:v*.25,at,out})}
function musStart(){if(AUD.mus||!AUD.ctx)return;AUD.mus={next:AUD.ctx.currentTime+.3,step:0,bar:0,motif:newMotif(.4),rep:0};setInterval(musTick,90)}
function musMood(){let night=false,fight=false;try{if(typeof G!=='undefined'){const h=G.hour||12;night=h<5.5||h>19;if(G.started&&!G.dead&&typeof ACT!=='undefined'&&typeof P!=='undefined')for(const a of ACT){if(!a.dead&&a.angry&&(a.human||a.boss||a.kind==='wolf'||a.ghost||a.xinmo)&&Math.hypot(a.x-P.x,a.z-P.z)<26){fight=true;break}}}}catch(e){}return{night,fight}}
function musTick(){const c=AUD.ctx,M=AUD.mus;if(!c||c.state!=='running'||!AUD.on.mus)return;const mood=musMood(),out=AUD.musG;
  const bpm=mood.fight?138:mood.night?90:112,st=60/bpm/2;
  if(M.next<c.currentTime-.4)M.next=c.currentTime+.05;
  while(M.next<c.currentTime+.6){const at=Math.max(0,M.next-c.currentTime),s=M.step%8,root=MPROG[M.bar%4],key=MKEY+(mood.night?-5:0);
    // 和声铺底：每小节换一次
    if(s===0){const bd=st*8;for(const [iv,dt] of [[0,0],[7,6]]){const o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();o.type='sawtooth';o.frequency.value=hz(key-12+root+iv);o.detune.value=dt;f.type='lowpass';f.frequency.value=mood.night?420:650;
        const t=c.currentTime+at;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(mood.night?.035:.026,t+.25);g.gain.setValueAtTime(mood.night?.035:.026,t+bd-.2);g.gain.exponentialRampToValueAtTime(.0001,t+bd+.1);o.connect(f);f.connect(g);g.connect(out);o.start(t);o.stop(t+bd+.15)}}
    // 低音：1、2 拍后半、4 拍
    if(s===0||s===3||(s===6&&!mood.night)){const n=key-24+root+(s===3?7:s===6?12:0);tone({f:hz(n),type:'triangle',d:st*2.6,v:.26,at,lp:650,out});tone({f:hz(n),type:'sawtooth',d:.1,v:.05,at,lp:900,out})}
    // 鼓
    const kick=mood.fight?[0,3,4,6]:mood.night?[0]:[0,4];
    if(kick.includes(s)){tone({f:110,f2:42,d:.32,v:mood.fight?.55:.4,at,out});noise({ft:'lowpass',f:350,d:.1,v:.18,at,out})}
    if(!mood.night&&(s===2||s===6)){tone({f:740,type:'triangle',d:.07,v:.14,at,out});tone({f:1180,type:'sine',d:.04,v:.06,at,out})}
    if(mood.fight&&(s===2||s===6))noise({f:1800,q:.7,d:.14,v:.3,at,out});
    if(!mood.night)noise({ft:'highpass',f:7000,d:.035,v:s%2?.05:.08,at,out});
    // 旋律：两小节一句，重复一次再换
    const ms=M.motif[M.step%16];if(ms&&(!mood.night||Math.random()<.75)){const m=key+pen(ms.d);
      if(ms.long&&!mood.fight)flute(m,at,st*3.2,mood.night?.07:.09,out);else{pluck(m,at,mood.night?.12:.15,out,mood.night?1.8:1.1);if(Math.random()<.18)pluck(m+12,at+st*.5,.06,out,.8)}}
    M.next+=st;M.step++;if(M.step%8===0)M.bar++;
    if(M.step%16===0){M.rep++;if(M.rep>=2){M.rep=0;M.motif=newMotif(mood.fight?.55:mood.night?.2:.4)}else{const v=M.motif.map(x=>x&&Math.random()<.25?{d:clamp(x.d+(Math.random()<.5?1:-1),2,12),long:x.long}:x);M.motif=v}}}}

/* 设置里的开关 + 按钮点击音 */
(function(){const sb=document.getElementById('sndBtn'),mb=document.getElementById('musBtn');
  const draw=()=>{if(sb)sb.textContent='音效：'+(AUD.on.sfx?'开':'关');if(mb)mb.textContent='音乐：'+(AUD.on.mus?'开':'关')};draw();
  if(sb)sb.onclick=()=>{audInit();audSet('sfx',!AUD.on.sfx);draw();sfx('click')};
  if(mb)mb.onclick=()=>{audInit();audSet('mus',!AUD.on.mus);draw()};
  document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('button');if(b&&!b.classList.contains('ab'))sfx('click')},true)})();
