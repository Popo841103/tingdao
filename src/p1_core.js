import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
window.GAME_OK=true;clearTimeout(window.__t);
/* =====================================================================
   《听道 · 灵河求生》完整版
   一、核心：渲染器、天空、地形、水面            （本段）
   二、世界：植被、石头、建筑、动态细节          （p2）
   三、角色：人物/野兽模型与动作、Tripo 模型导入  （p3）
   四、玩法：生存、采集制造建造、战斗、AI、昼夜、存档 （p4）
   五、界面与操作                                  （p5）
   ===================================================================== */
const $=s=>document.querySelector(s);
const isTouch=matchMedia('(pointer:coarse)').matches||('ontouchstart' in window);
const rnd=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>t*t*(3-2*t);
let rseed=20261122;const srnd=()=>{rseed=(rseed*16807)%2147483647;return (rseed-1)/2147483646};
// 画质三档：high 高清 / low 流畅 / min 极简（旧存的 'low' 照常有效）
const Q={low:false,min:false,tier:'high'};try{const q=localStorage.getItem('td5_q');Q.tier=q==='low'||q==='min'?q:'high';Q.low=Q.tier!=='high';Q.min=Q.tier==='min'}catch(e){}
// 第几章：第一章 中州·灵河界；第二章 回乡（上/下某州）
let SAVE0=null;try{SAVE0=JSON.parse(localStorage.getItem('td5_save')||'null')}catch(e){}
// 九州区域：中州（第一章）→ 故乡州 → 己方其余三州 → 敌方四州 → 终极区域「天墟」
const REGIONS={
  mid:{n:'中州·灵河界',side:'mid'},
  sy:{n:'上云州',side:'up',terr:'plateau',sp:[0,1,3],mat:'云纹石',perk:'yunbu',boss:['云州占领军统领·鹰隼','云霄宗长老·凌虚子'],
    g:['#8ccf74','#a8dc88','#6ab45c','#e8eef2','#c8d0d4'],tile:'#4a7fa8',sak:.05,float:1,wat:'cloud',fx:'wisp',fog:'#e8f0f8',skyR:1.2,mkt:'云台坊',frs:'云松林',bch:'云海崖',decor:'pagoda',grass:'#f0fff0'},
  sx:{n:'上玄州',side:'up',terr:'snow',sp:[1,2,3],mat:'玄铁',perk:'xuanjia',boss:['玄州占领军统领·铁狼','玄冥宗主·墨渊'],
    g:['#eef3f7','#dfe8ef','#cfdcd8','#e4ecf2','#8a96a2'],tile:'#3a5a7a',sak:0,crown:'#d8e6e0',wat:'ice',fx:'snow',fog:'#dde8f2',skyR:2,sun:'#f4f8ff',mkt:'雪原集',frs:'雪松林',bch:'冰湖岸',decor:'ice',grass:'#ffffff',noFlower:1,beast:{wolf:['#e8eef4','#ffffff'],boar:['#8a7a6a','#b8a898']}},
  st:{n:'上天州',side:'up',terr:'autumn',sp:[0,2,3],mat:'天雷木',perk:'leiyin',boss:['天州占领军统领·雷霆','天雷尊者·紫霄'],
    g:['#c0aa52','#d6a444','#a87a34','#ecd8a8','#a89a80'],tile:'#a83a2a',sak:0,hue:[.0,.12,.8,.5],fx:'leaf',fog:'#f6e6c8',sun:'#ffe0a8',mkt:'金秋市',frs:'枫林',bch:'金沙滩',decor:'torii',grass:'#f0d080'},
  sxian:{n:'上仙州',side:'up',terr:'sakura',sp:[0,1,2],mat:'仙灵玉',perk:'lingti',boss:['穿越者统领·赵铁衣','上仙宗长老·清虚子'],
    g:['#78c25c','#a2d670','#4f9c4a','#e9d6a6','#9a958c'],tile:'#3a8a96',sak:.4,float:1,fx:'petal',fog:'#e2ecf6',mkt:'仙坊',frs:'灵药谷',bch:'云海崖',home:'故居'},
  xy:{n:'下云州',side:'down',terr:'desert',sp:[0,1,3],mat:'合金板',perk:'jidong',boss:['机甲统领·铁砧','云州守城修士·白鹤'],
    g:['#e2c28a','#d6ae74','#c89a60','#eed8a8','#b08860'],tile:'#8a6a4a',sak:0,dead:1,tech:1,wat:'oasis',fx:'dust',fog:'#f0dcb8',sun:'#fff0c8',expo:1.08,mkt:'沙海集市',frs:'仙人掌林',bch:'绿洲',decor:'desert',grass:'#e8c890',noFlower:1,dry:1,beast:{wolf:['#c8a070','#ecd8b0'],boar:['#b08860','#d0b088']}},
  xx:{n:'下玄州',side:'down',terr:'volcano',sp:[1,2,3],mat:'能量电池',perk:'hudun',boss:['熔炉工厂主·赤焰','玄州镇守·炎阳真人'],
    g:['#3e3532','#5a3a2c','#2e2826','#4a3c34','#2a2422'],tile:'#3a2a2a',sak:0,dead:1,tech:1,wat:'lava',fx:'ash',fog:'#7a4a38',skyT:12,skyR:3,sun:'#ffb080',expo:.92,fogNear:60,fogFar:320,mkt:'熔炉镇',frs:'焦木林',bch:'黑沙滩',decor:'volcano',noGrass:1,noFlower:1,dry:1,beast:{wolf:['#4a2a2a','#7a3a2a','#ff4010'],boar:['#3a2a2a','#5a3a30']}},
  xt:{n:'下天州',side:'down',terr:'swamp',sp:[0,2,3],mat:'量子晶片',perk:'miaozhun',boss:['天网主脑·零','天州镇守·玄天老祖'],
    g:['#4f6e3a','#5f7e42','#3a5a2e','#5a5a3e','#5a5a50'],tile:'#3a5a4a',sak:0,crown:'#3a7a34',tech:1,wat:'swamp',fx:'firefly',fog:'#9aaa90',fogNear:50,fogFar:240,rainy:1,mkt:'泽畔集',frs:'雨林',bch:'泥沼岸',decor:'swamp',grass:'#8aa070',beast:{wolf:['#4a6a4a','#8aa080'],boar:['#4a4a3a','#6a6a50']}},
  xxian:{n:'下仙州',side:'down',terr:'city',sp:[0,1,2],mat:'反应核心',perk:'fanying',boss:['赛博道人·千机','仙州守护·紫微星君'],
    g:['#8a8a92','#9a9aa4','#7a7a84','#a0a0a8','#6a6a74'],tile:'#4a4a5a',sak:0,tech:1,wat:'dark',fx:'neon',fog:'#6a5a8a',skyT:8,skyR:3.5,sun:'#ffc8e8',expo:.95,mkt:'霓虹街',frs:'废墟公园',bch:'码头区',decor:'city',grass:'#a0a0a0',noFlower:1,dry:1,beast:{wolf:['#6a6a7a','#9a9aaa','#20d0ff'],boar:['#5a5a66','#8a8a96']}},
  tx:{n:'天墟·九州之巅',side:'top',terr:'sky',sp:[0,1,2,3],mat:'九州本源',perk:null,boss:['天道化身','天道化身'],
    g:['#ece6cc','#f6eed4','#d4dcae','#fff4dc','#f0ece4'],tile:'#c8a040',sak:.3,float:1,wat:'cloud',fx:'gold',fog:'#fff0d0',sun:'#fff4d0',expo:1.05,mkt:'天市',frs:'琼林',bch:'云海岸',decor:'sky',grass:'#fff8e0',beast:{wolf:['#f4ecd8','#ffffff','#ffd040']}}};
const PERKS={yunbu:'云步：移动速度 +15%',xuanjia:'玄甲：受到伤害 -15%',leiyin:'天雷印：技能伤害 +30%',lingti:'仙灵体：生命每秒回复 1.5',jidong:'机动核心：体力恢复 ×2',hudun:'能量护盾：生命上限 +20%',miaozhun:'智能瞄准：20% 几率造成双倍伤害',fanying:'反应堆：灵力（能量）恢复 ×2'};
function routeFor(f,o){const sk={云:'y',玄:'x',天:'t',仙:'xian'},own=f==='A'?'s':'x',foe=f==='A'?'x':'s',order=['y','x','t','xian'];const mine=[sk[o],...order.filter(k=>k!==sk[o])];
  return ['mid',...mine.map(k=>own+k),...order.map(k=>foe+k),'tx']}
let REGK=SAVE0&&SAVE0.reg||null;if(!REGK&&SAVE0&&SAVE0.ch===2&&SAVE0.faction)REGK=routeFor(SAVE0.faction,SAVE0.origin)[1];if(!REGS_OK(REGK))REGK='mid';
function REGS_OK(k){return k&&!!REGIONS[k]}
const REGD=REGIONS[REGK],CH=REGK==='mid'?1:2;
const RIDX=SAVE0&&SAVE0.faction?Math.max(0,routeFor(SAVE0.faction,SAVE0.origin).indexOf(REGK)):0;   // 第几站，决定难度
const STREET=CH!==2||['sy','sxian','st','tx'].includes(REGK);   // 中式坊市长街（Grok 场景）
function streetF(x,z){const lx=x-(-14),lz=z-28;const dx=Math.max(0,Math.abs(lx)-13),dz=Math.max(0,-8-lz,lz-58);return Math.hypot(dx,dz)}
const DIFF=1+RIDX*.38;
const SPIRES=[[-150,-40],[-60,-130],[80,80],[-40,95]];

/* ---------- 渲染器 ---------- */
const canvas=$('#c');
const renderer=new THREE.WebGLRenderer({canvas,antialias:!isTouch&&!Q.min,powerPreference:'high-performance'});
renderer.setPixelRatio(Q.min?Math.min(devicePixelRatio,1)*.75:Math.min(devicePixelRatio,Q.low?1:(isTouch?1.5:2)));
renderer.shadowMap.enabled=!Q.low;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.62;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(55,1,.1,1400);
scene.fog=new THREE.Fog(CH===2?REGD.fog:'#cfe3ee',120,520);

/* ---------- 天空、太阳、月光 ---------- */
const sky=new Sky();sky.scale.setScalar(4000);scene.add(sky);
Object.assign(sky.material.uniforms.turbidity,{value:3.2});sky.material.uniforms.rayleigh.value=1.4;sky.material.uniforms.mieCoefficient.value=.004;sky.material.uniforms.mieDirectionalG.value=.82;
const hemi=new THREE.HemisphereLight('#cfe8ff','#7a8a55',1.0);scene.add(hemi);
const sun=new THREE.DirectionalLight('#fff3dc',3.2);sun.castShadow=true;
const SMS=isTouch?1024:2048;sun.shadow.mapSize.set(SMS,SMS);
Object.assign(sun.shadow.camera,{left:-40,right:40,top:40,bottom:-40,near:1,far:220});sun.shadow.bias=-.0004;sun.shadow.normalBias=.04;
scene.add(sun,sun.target);
const fireLight=new THREE.PointLight('#ff9a4a',0,18,1.6);scene.add(fireLight);

/* ---------- 程序化贴图（不加载外部图片） ---------- */
function noiseCanvas(size,fn){const c=document.createElement('canvas');c.width=c.height=size;const x=c.getContext('2d'),im=x.createImageData(size,size);
  for(let j=0;j<size;j++)for(let i=0;i<size;i++){const v=fn(i,j);const k=(j*size+i)*4;im.data[k]=v[0];im.data[k+1]=v[1];im.data[k+2]=v[2];im.data[k+3]=255}x.putImageData(im,0,0);return c}
const vnoise=(()=>{const P=new Float32Array(512);for(let i=0;i<512;i++)P[i]=srnd();return(x,y,per)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;const h=(a,b)=>P[(((a%per)+per)%per*31+(((b%per)+per)%per)*17)&511];
  const u=smooth(xf),v=smooth(yf);return lerp(lerp(h(xi,yi),h(xi+1,yi),u),lerp(h(xi,yi+1),h(xi+1,yi+1),u),v)}})();
const fbm2=(x,y,per)=>vnoise(x,y,per)*.5+vnoise(x*2,y*2,per*2)*.25+vnoise(x*4,y*4,per*4)*.15+vnoise(x*8,y*8,per*8)*.1;
// 地面细节贴图：明暗颗粒（与顶点颜色相乘）
const groundTex=new THREE.CanvasTexture(noiseCanvas(256,(i,j)=>{const v=.72+.4*fbm2(i/16,j/16,16)+.08*(srnd()-.5);const g=clamp(v*255,0,255);return[g,g,g]}));
groundTex.wrapS=groundTex.wrapT=THREE.RepeatWrapping;groundTex.repeat.set(70,70);groundTex.colorSpace=THREE.SRGBColorSpace;groundTex.anisotropy=4;
// 水面法线贴图（由噪声求导生成）
const waterN=(()=>{const S=256,h=new Float32Array(S*S);for(let j=0;j<S;j++)for(let i=0;i<S;i++)h[j*S+i]=fbm2(i/32,j/32,8);
  return new THREE.CanvasTexture(noiseCanvas(S,(i,j)=>{const dx=h[j*S+(i+1)%S]-h[j*S+(i+S-1)%S],dy=h[((j+1)%S)*S+i]-h[((j+S-1)%S)*S+i];const n=new THREE.Vector3(-dx*6,-dy*6,1).normalize();return[(n.x*.5+.5)*255,(n.y*.5+.5)*255,(n.z*.5+.5)*255]}))})();
waterN.wrapS=waterN.wrapT=THREE.RepeatWrapping;waterN.repeat.set(60,60);
const barkTex=new THREE.CanvasTexture(noiseCanvas(64,(i,j)=>{const v=.7+.35*vnoise(i/3,j/14,64)+.1*vnoise(i/1.5,j/4,64);const g=clamp(v*255,0,255);return[g,g,g]}));barkTex.wrapS=barkTex.wrapT=THREE.RepeatWrapping;barkTex.colorSpace=THREE.SRGBColorSpace;
const leafTex=new THREE.CanvasTexture(noiseCanvas(64,(i,j)=>{const v=.75+.35*fbm2(i/8,j/8,8);const g=clamp(v*255,0,255);return[g,g,g]}));leafTex.wrapS=leafTex.wrapT=THREE.RepeatWrapping;leafTex.colorSpace=THREE.SRGBColorSpace;

/* ---------- 地形：中州·灵河界 ----------
   x 向东、z 向南。灵河由北向南穿过地图，西岸是我方，东岸是敌营。 */
const MAP=200;
const riverX=CH===2?(z=>16+20*Math.sin(z*.011+2)+7*Math.sin(z*.029)):(z=>22+18*Math.sin(z*.012)+8*Math.sin(z*.031+1));
const ZONES=CH===2?{
  home:{x:-120,z:40,r:16,name:REGD.home||'登岸营地'},market:{x:-14,z:28,r:22,name:REGD.mkt},forest:{x:-95,z:-85,r:45,name:REGD.frs},
  river:{x:riverX(125),z:125,r:14,name:'云河渡口'},enemy:{x:125,z:-30,r:26,name:REGD.side==='top'?'天宫':'敌占营寨'},mine:{x:65,z:-100,r:30,name:REGD.n.slice(0,2)+'之巅'},
  beach:{x:-60,z:150,r:30,name:REGD.bch}
}:{
  home:{x:-120,z:40,r:16,name:'我方营地'},market:{x:-14,z:28,r:22,name:'坊市'},forest:{x:-95,z:-85,r:45,name:'山林'},
  river:{x:riverX(125),z:125,r:14,name:'灵河渡口'},enemy:{x:125,z:-40,r:26,name:'敌营'},mine:{x:40,z:-135,r:30,name:'灵石山'},
  beach:{x:-60,z:150,r:30,name:'南岸沙滩'}
};
function coastR(x,z){const a=Math.atan2(z,x);if(CH===2)return 178+16*Math.sin(a*3+1.3+RIDX*.7)+10*Math.cos(a*4)+5*Math.sin(a*9+.5);return 182+14*Math.sin(a*3+.4)+9*Math.cos(a*5+1.2)+5*Math.sin(a*11)}
function H(x,z){return CH===2?H2(x,z):H1(x,z)}
// 第二章地形：中间一座高高的仙山，两侧小峰，丘陵更柔和
function H2(x,z){const d=Math.hypot(x,z),cr=coastR(x,z);if(d>cr)return Math.max(-9,1-(d-cr)*.3);
  let h=2.4+1.4*Math.sin(x*.019+2)*Math.cos(z*.021)+1.1*Math.sin(x*.043-z*.029)+.4*Math.sin(x*.12)*Math.cos(z*.1);const T=REGD.terr;
  if(T==='plateau'){const v=(h-1.4)*1.4+3.2*Math.sin(x*.016)*Math.cos(z*.014+1)+2;h=2.2+Math.max(0,Math.floor(v))*3.4+smooth(clamp((v-Math.floor(v)-.85)/.15,0,1))*3.4}
  if(T==='snow'){h+=11*Math.pow(Math.abs(Math.sin(x*.017+z*.006)),3)+5*Math.pow(Math.abs(Math.sin(z*.024-x*.005)),2)}
  if(T==='autumn'){h+=3.5*Math.sin(x*.03)*Math.sin(z*.027)+2;h=Math.floor(h/1.7)*1.7+(h-Math.floor(h/1.7)*1.7)*.2}
  if(T==='desert'){h=2.3+2.6*Math.pow(Math.sin(x*.045+z*.018),2)+1.1*Math.sin(z*.07+x*.012)}
  if(T==='volcano'){h+=2.6*Math.abs(Math.sin(x*.05)*Math.cos(z*.043))+1.5*Math.abs(Math.sin(x*.11+z*.07))}
  if(T==='swamp'){h=.7+1.35*Math.sin(x*.06+1)*Math.cos(z*.05)+.6*Math.sin(x*.13+z*.11)}
  if(T==='city'){h=2.4+.15*Math.sin(x*.05)}
  if(T==='sky'){const rv=Math.abs(Math.sin(x*.019+.5)*Math.cos(z*.017-.3));h=rv<.2?-3:h+3+(rv>.6?3:0)}
  if(T==='volcano')h+=60*Math.exp(-((x-65)**2+(z+100)**2)/2600)-24*Math.exp(-((x-65)**2+(z+100)**2)/160);else
  h+=46*Math.exp(-((x-65)**2+(z+100)**2)/2000)+14*Math.exp(-((x-110)**2+(z+70)**2)/600)+12*Math.exp(-((x+30)**2+(z+150)**2)/600);
  h+=7*Math.exp(-((x+95)**2+(z+85)**2)/2200);
  for(const i of REGD.sp){const s=SPIRES[i],hh=24+((i*7+RIDX*3)%10);h+=hh*Math.exp(-((x-s[0])**2+(z-s[1])**2)/(150+((i+RIDX)%3)*60))}
  const coast=clamp((cr-d)/24,0,1);h=lerp(.6,h,smooth(coast));
  for(const k in ZONES){if(k==='forest'||k==='mine'||k==='beach')continue;const Z=ZONES[k],dd=Math.hypot(x-Z.x,z-Z.z);const f=clamp((dd-Z.r*.7)/14,0,1);h=lerp(k==='river'?1.4:2.4,h,smooth(f))}
  if(STREET){const sd=streetF(x,z);if(sd<12)h=lerp(2.4,h,smooth(clamp(sd/12,0,1)))}
  const rd=Math.abs(x-riverX(z));if(rd<18){const t=clamp(rd/18,0,1);h=lerp(-3.2,h,smooth(Math.pow(t,1.3)))}
  return h}
function H1(x,z){
  const d=Math.hypot(x,z),cr=coastR(x,z);
  if(d>cr)return Math.max(-9,1-(d-cr)*.35);
  let h=2.2+1.6*Math.sin(x*.021+1)*Math.cos(z*.017)+1.2*Math.sin(x*.047+z*.033)+.5*Math.sin(x*.11)*Math.cos(z*.13);
  // 灵石山（北）与山林丘陵（西北）
  h+=26*Math.exp(-((x-40)**2+(z+140)**2)/1800)+10*Math.exp(-((x-80)**2+(z+120)**2)/900);
  h+=6*Math.exp(-((x+95)**2+(z+85)**2)/2500);
  h+=28*Math.exp(-((x+150)**2+(z+40)**2)/170)+26*Math.exp(-((x+40)**2+(z-95)**2)/200);   // 两座可攀爬的石峰
  // 海岸缓坡
  const coast=clamp((cr-d)/22,0,1);h=lerp(.6,h,smooth(coast));
  // 平整区域
  for(const k in ZONES){if(k==='forest'||k==='mine'||k==='beach')continue;const Z=ZONES[k],dd=Math.hypot(x-Z.x,z-Z.z);const f=clamp((dd-Z.r*.7)/14,0,1);h=lerp(k==='river'?1.4:2.4,h,smooth(f))}
  // 灵河河道
  if(STREET){const sd=streetF(x,z);if(sd<12)h=lerp(2.4,h,smooth(clamp(sd/12,0,1)))}
  const rd=Math.abs(x-riverX(z));if(rd<18){const t=clamp(rd/18,0,1);h=lerp(-3.2,h,smooth(Math.pow(t,1.3)))}
  return h}
// 可行走表面：地形 + 桥
const BRIDGE={z:30,w:3.4};
function groundAt(x,z){let g=H(x,z);if(REGD.wat==='ice'||REGD.wat==='cloud')g=Math.max(g,.06);const rx=riverX(BRIDGE.z);if(Math.abs(z-BRIDGE.z)<BRIDGE.w/2&&Math.abs(x-rx)<20)g=Math.max(g,1.7+Math.cos((x-rx)/20*Math.PI/2)*.6);const dz=125,dx=riverX(dz);if(Math.abs(z-dz)<1.5&&x>dx-14.7&&x<dx-4.4)g=Math.max(g,1.2);return g}
const T=new THREE.PlaneGeometry(MAP*2.2,MAP*2.2,Q.min?150:230,Q.min?150:230);T.rotateX(-Math.PI/2);
{const p=T.attributes.position,col=[],c=new THREE.Color();
  const RG=CH===2?REGD.g:['#6fae4a','#8cc25a','#4f8a3a','#e9d6a6','#9a958c'];const SAND=new THREE.Color(RG[3]),GR=new THREE.Color(RG[0]),GR2=new THREE.Color(RG[1]),FOR=new THREE.Color(RG[2]),DIRT=new THREE.Color(REGD.terr==='volcano'?'#2a2220':'#a8895c'),ROCK=new THREE.Color(RG[4]),MUD=new THREE.Color(REGD.wat==='lava'?'#1a1210':REGD.wat==='ice'?'#cfe0ea':'#8c7a5a'),PATH=new THREE.Color(REGD.terr==='city'?'#5a5a62':REGD.terr==='snow'?'#c8d4dc':REGD.terr==='sky'?'#fffaf0':'#c2a878');
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),y=H(x,z);p.setY(i,y);
    const fd=Math.hypot(x-ZONES.forest.x,z-ZONES.forest.z);
    if(y<.2)c.copy(MUD);else if(y<1.3)c.copy(SAND).lerp(GR,clamp((y-.9)/.4,0,1));
    else{c.copy(GR).lerp(GR2,.5+.5*Math.sin(x*.05)*Math.cos(z*.04));if(fd<50)c.lerp(FOR,clamp(1-fd/50,0,1)*.8);if(y>14)c.lerp(ROCK,clamp((y-14)/6,0,1))}
    for(const k of['home','market','enemy','river']){const Z=ZONES[k],dd=Math.hypot(x-Z.x,z-Z.z);if(dd<Z.r*.85)c.lerp(k==='enemy'?DIRT:PATH,clamp(1-(dd-Z.r*.6)/(Z.r*.25),0,1)*.75)}
    col.push(c.r,c.g,c.b)}
  T.setAttribute('color',new THREE.Float32BufferAttribute(col,3));T.computeVertexNormals()}
const terrain=new THREE.Mesh(T,new THREE.MeshStandardMaterial({vertexColors:true,map:groundTex,roughness:.96}));terrain.receiveShadow=true;scene.add(terrain);

/* ---------- 水面：海与灵河共用一个水面，顶点波浪 + 滚动法线 ---------- */
const WTR={cloud:['#ffffff',.95,'#c8d4e8',.35,.25],ice:['#c4e6f4',.92,'#6a9ab0',.15,0],lava:['#ff6a20',1,'#ff4010',1.3,.35],oasis:['#2ac8c0',.82,'#000',0,1],swamp:['#4a6a48',.9,'#000',0,.5],dark:['#2a3a5a',.88,'#3a2a6a',.25,.6]}[REGD.wat]||['#2bbcd0',.8,'#000',0,1];
const waterMat=new THREE.MeshStandardMaterial({emissive:WTR[2],emissiveIntensity:WTR[3],color:WTR[0],roughness:.08,metalness:.15,transparent:WTR[1]<1,opacity:WTR[1],normalMap:waterN,normalScale:new THREE.Vector2(.55,.55)});
const WU={uTime:{value:0},uAmpK:{value:WTR[4]}};
waterMat.onBeforeCompile=sh=>{sh.uniforms.uTime=WU.uTime;sh.uniforms.uAmpK=WU.uAmpK;sh.vertexShader='uniform float uTime;uniform float uAmpK;\n'+sh.vertexShader.replace('#include <begin_vertex>',
  '#include <begin_vertex>\nvec4 wpW=modelMatrix*vec4(transformed,1.);float dc=length(wpW.xz);float amp=mix(.05,.35,smoothstep(150.,230.,dc))*uAmpK;transformed.y+=(sin(wpW.x*.09+uTime*1.1)+cos(wpW.z*.07+uTime*.9))*amp;')};
const water=new THREE.Mesh(new THREE.PlaneGeometry(1600,1600,Q.min?64:160,Q.min?64:160).rotateX(-Math.PI/2),waterMat);water.position.y=0;water.receiveShadow=true;scene.add(water);
const WATER_Y=0;
function waterDepth(x,z){return WATER_Y-groundAt(x,z)}

/* ---------- 碰撞：空间网格 ---------- */
const GRID=8,cgrid=new Map();
const gkey=(x,z)=>Math.floor(x/GRID)+','+Math.floor(z/GRID);
function addCol(c){const k=gkey(c.x,c.z);if(!cgrid.has(k))cgrid.set(k,[]);cgrid.get(k).push(c);return c}
function removeCol(c){const a=cgrid.get(gkey(c.x,c.z));if(a){const i=a.indexOf(c);if(i>=0)a.splice(i,1)}}
function nearCols(x,z){const out=[],cx=Math.floor(x/GRID),cz=Math.floor(z/GRID);for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const a=cgrid.get((cx+i)+','+(cz+j));if(a)for(const c of a)out.push(c)}return out}
function collide(x,z,r){for(const c of nearCols(x,z)){if(c.off)continue;const dx=x-c.x,dz=z-c.z,d=Math.hypot(dx,dz),m=c.r+r;if(d<m&&d>1e-4){x=c.x+dx/d*m;z=c.z+dz/d*m}}
  const d=Math.hypot(x,z);if(d>coastR(x,z)+30){const s=(coastR(x,z)+30)/d;x*=s;z*=s}return[x,z]}
