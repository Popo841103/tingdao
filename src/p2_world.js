
/* =====================================================================
   二、世界：植被（实例化，可砍伐）、石头、草药、浆果、地上物资、建筑、动态细节
   ===================================================================== */
const _m=new THREE.Matrix4(),_q=new THREE.Quaternion(),_v=new THREE.Vector3(),_s=new THREE.Vector3(),_e=new THREE.Euler();
const ZERO=new THREE.Matrix4().makeScale(0,0,0);
const mat=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.85},o));
const MAT={bark:mat('#8a6a4a',{map:barkTex}),bark2:mat('#6e5038',{map:barkTex}),pine:mat('#3f7a3e',{map:leafTex}),leaf:mat('#5a9a3c',{map:leafTex}),leaf2:mat('#79b04a',{map:leafTex}),
  sakura:mat('#f4b6c8',{map:leafTex}),rock:mat('#9b968e',{flatShading:true}),rock2:mat('#857f76',{flatShading:true}),herb:mat('#4fb06a'),herbGlow:mat('#c8ffe0',{emissive:'#3cd08a',emissiveIntensity:.8}),
  bush:mat('#3f8a3e',{map:leafTex}),berry:mat('#d62a3a',{roughness:.35}),stick:mat('#b47c40'),pebble:mat('#a8a39a',{flatShading:true}),
  wood:mat('#a87a4e',{map:barkTex}),plank:mat('#c49a68'),wall:mat('#f2ede2'),pillar:mat('#b8432f'),tile:mat('#56657a',{roughness:.7}),cloth:mat('#e8e2d4'),
  red:mat('#c8402f'),blue:mat('#3a6ab0'),khaki:mat('#b8a068'),dark:mat('#3a3430'),straw:mat('#d8b860'),metal:mat('#8a8f96',{metalness:.6,roughness:.4}),gold:mat('#e0b050',{metalness:.5,roughness:.4}),
  soil:mat('#6e5034'),maroon:mat('#7a2c2a'),maroon2:mat('#5a1e1e'),lantern:mat('#ff6040',{emissive:'#ff3010',emissiveIntensity:.7}),sprout:mat('#6cc04a'),ripe:mat('#e8c048'),flame:new THREE.MeshBasicMaterial({color:'#ffb050',transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false}),
  flame2:new THREE.MeshBasicMaterial({color:'#ff6a20',transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false})};
if(CH===2){const RC={snow:'#c8d4dc',desert:'#c89a6a',volcano:'#2a2422',city:'#7a7a82',sky:'#f4f0e6',autumn:'#a89a88'}[REGD.terr];if(RC){MAT.rock.color.set(RC);MAT.rock2.color.set(RC).multiplyScalar(.85);MAT.pebble.color.set(RC)}if(REGD.terr==='volcano'){MAT.bark.color.set('#2a2220');MAT.bark2.color.set('#1e1816')}if(REGD.terr==='snow'){MAT.bush.color.set('#c8dcd4')}if(REGD.terr==='desert'){MAT.bark.color.set('#b89a78')}}
function merged(parts){/* parts: [geometry, matrix] -> 单个几何体 */const gs=parts.map(([g,m])=>{const c=g.index?g.toNonIndexed():g.clone();c.applyMatrix4(m);for(const k of Object.keys(c.attributes))if(!['position','normal','uv'].includes(k))c.deleteAttribute(k);if(!c.attributes.uv)c.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(c.attributes.position.count*2),2));return c});return mergeGeometries(gs)}
const M4=(x=0,y=0,z=0,ry=0,sx=1,sy=1,sz=1,rx=0,rz=0)=>new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),new THREE.Vector3(sx,sy,sz));

/* ---------- 外部模型（Quaternius Stylized Nature MegaKit，CC0） ---------- */
const ICO_D=Q.min?1:2;   // 极简画质：树冠/灌木用更少的面
const NAT_ON=!Q.low&&typeof NATM!=='undefined';
function natGeo(d,sc=1){const b=s=>{const r=atob(s),u=new Uint8Array(r.length);for(let i=0;i<r.length;i++)u[i]=r.charCodeAt(i);return u.buffer};
  const P=new Int16Array(b(d.p)),N=new Int8Array(b(d.n)),U=new Int16Array(b(d.u)),I=new Uint16Array(b(d.i));
  const p=new Float32Array(P.length),n=new Float32Array(N.length),u=new Float32Array(U.length),k=d.s/32767*sc;
  for(let i=0;i<P.length;i++)p[i]=P[i]*k;for(let i=0;i<N.length;i++)n[i]=N[i]/127;for(let i=0;i<U.length;i++)u[i]=U[i]/16383;
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('normal',new THREE.BufferAttribute(n,3));g.setAttribute('uv',new THREE.BufferAttribute(u,2));g.setIndex(new THREE.BufferAttribute(I,1));g.computeBoundingSphere();return g}
function natTex(u){const t=new THREE.TextureLoader().load(u);t.flipY=false;t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t}
const NATX={};if(NAT_ON){for(const k in NATT)NATX[k]=natTex(NATT[k]);
  const T_=CH===2?REGD.terr:'';
  MAT.barkN=mat(T_==='volcano'?'#4a3c36':T_==='desert'?'#e8d0b0':T_==='snow'?'#c8c0b8':'#f2ece6',{map:NATX.bark});
  const lm=(c,map)=>new THREE.MeshStandardMaterial({color:c,map,alphaTest:.45,side:THREE.DoubleSide,roughness:.8});
  MAT.leafN=lm('#86c45c',NATX.leaf);MAT.pineN=lm('#4e9a52',NATX.pine);MAT.sakN=lm('#ffb4cc',NATX.leaf);
  if(typeof GTEX!=='undefined'&&GTEX.leafC){const lt=natTex(GTEX.leafC);MAT.leafN=lm('#f4f4f4',lt);MAT.leafN.userData.photo=1;MAT.sakN=lm('#ffffff',natTex(GTEX.sakC));MAT.sakN.userData.photo=1}
  if(typeof GTEX!=='undefined'&&GTEX.bark){const bt=natTex(GTEX.bark);bt.repeat.set(1,2);MAT.barkN.map=bt}
  MAT.bush.map=NATX.bushL;MAT.bush.alphaTest=.45;MAT.bush.side=THREE.DoubleSide;MAT.bush.color.multiplyScalar(1.5);
  const grassy0=CH!==2||['sy','sxian','st','xt','tx'].includes(REGK);const rpt=typeof GTEX!=='undefined'&&GTEX.rock?natTex(grassy0||!GTEX.cliff?GTEX.rock:GTEX.cliff):NATX.rock;if(rpt!==NATX.rock)rpt.repeat.set(1.6,1.6);MAT.rockN=mat('#ffffff',{map:rpt,roughness:.92});const grassy=!CH||['sy','sxian','st','xt','tx'].includes(REGK)||CH!==2;if(!grassy||rpt===NATX.rock)MAT.rockN.color.copy(MAT.rock.color).lerp(new THREE.Color('#ffffff'),.55);else MAT.rockN.color.set('#f2f2f2')}
/* ---------- 地面材质混合：陡坡露岩、远近两层细节、泥土斑块（高画质） ---------- */
if(NAT_ON){const rk=NATX.rock.clone();rk.needsUpdate=true;rk.flipY=false;
  const T_=CH===2?REGD.terr:'';const rockTint=new THREE.Color(T_==='snow'?'#b8c4cc':T_==='desert'?'#d8a878':T_==='volcano'?'#3a3230':T_==='sky'?'#f0ece0':T_==='autumn'?'#b0a090':'#a8a296');
  const patchC=new THREE.Color(T_==='snow'?'#d0dce6':T_==='desert'?'#c89a62':T_==='volcano'?'#5a2a1a':T_==='swamp'?'#3a3a22':T_==='city'?'#6a6a70':'#8a6e48');
  const gt=typeof GTEX!=='undefined'?natTex(GTEX.grass):null;if(gt){gt.flipY=true;gt.needsUpdate=true}
  const dt_=typeof GTEX!=='undefined'?natTex(GTEX.dirt):null,rp_=typeof GTEX!=='undefined'?natTex(GTEX.cliff||GTEX.rock):null;const sd_=typeof GTEX!=='undefined'&&GTEX.sand?natTex(GTEX.sand):null,sn_=typeof GTEX!=='undefined'&&GTEX.bio&&GTEX.bio[T_]?natTex(GTEX.bio[T_][0]):null,sl_=typeof GTEX!=='undefined'&&GTEX.slate?natTex(GTEX.slate):null;for(const t of[dt_,rp_,sd_,sn_,sl_])if(t){t.flipY=true;t.needsUpdate=true}
  const GR_CH={mid:1,sy:1,sxian:1,st:.35,xt:.8,tx:.5}[CH===2?REGK:'mid']??0;
  const tm=terrain.material;tm.onBeforeCompile=sh=>{sh.uniforms.tRock={value:rk};sh.uniforms.tGrass={value:gt||rk};sh.uniforms.uGM={value:new THREE.Vector3(...(typeof GTEX!=='undefined'?GTEX.grassMean:[.3,.35,.17]))};sh.uniforms.uGC={value:gt?GR_CH:0};sh.uniforms.tDirt={value:dt_||rk};sh.uniforms.tRockP={value:rp_||rk};sh.uniforms.uDM={value:new THREE.Vector3(...(typeof GTEX!=='undefined'?GTEX.dirtMean:[.1,.06,.03]))};sh.uniforms.uRM={value:new THREE.Vector3(...(typeof GTEX!=='undefined'?(GTEX.cliffMean||GTEX.rockMean):[.14,.14,.1]))};sh.uniforms.uHasP={value:rp_?1:0};sh.uniforms.tSand={value:sd_||rk};sh.uniforms.tSnow={value:sn_||rk};sh.uniforms.uSM={value:new THREE.Vector3(...(GTEX.sandMean||[.5,.4,.3]))};sh.uniforms.uNM={value:new THREE.Vector3(...(sn_?GTEX.bio[T_][1]:[.5,.5,.5]))};sh.uniforms.tSlate={value:sl_||rk};sh.uniforms.uSlM={value:new THREE.Vector3(...(GTEX.slateMean||[.14,.2,.27]))};sh.uniforms.uSL={value:sl_&&['mid','sy','sxian','st','tx'].includes(CH===2?REGK:'mid')?1:0};sh.uniforms.uMZ={value:new THREE.Vector3(ZONES.market.x,ZONES.market.z,ZONES.market.r)};sh.uniforms.uSA={value:sd_?(T_==='desert'?1:0):0};sh.uniforms.uSB={value:sd_?1:0};sh.uniforms.uSN={value:sn_?({snow:1,desert:1,volcano:1,swamp:.85,autumn:.75}[T_]||0):0};sh.uniforms.uFZ={value:new THREE.Vector3(ZONES.forest.x,ZONES.forest.z,ZONES.forest.r)};sh.uniforms.uEZ={value:new THREE.Vector3(ZONES.enemy.x,ZONES.enemy.z,ZONES.enemy.r)};sh.uniforms.uRockC={value:rockTint};sh.uniforms.uPatchC={value:patchC};sh.uniforms.tDet={value:groundTex};
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;varying vec3 vWN;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvWP=(modelMatrix*vec4(transformed,1.)).xyz;vWN=normalize(mat3(modelMatrix)*objectNormal);');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;varying vec3 vWN;uniform sampler2D tRock;uniform sampler2D tDet;uniform vec3 uRockC;uniform vec3 uPatchC;uniform sampler2D tGrass;uniform vec3 uGM;uniform float uGC;uniform sampler2D tDirt;uniform sampler2D tRockP;uniform vec3 uDM;uniform vec3 uRM;uniform float uHasP;uniform vec3 uFZ;uniform sampler2D tSand;uniform sampler2D tSnow;uniform vec3 uSM;uniform vec3 uNM;uniform float uSA;uniform float uSB;uniform float uSN;uniform sampler2D tSlate;uniform vec3 uSlM;uniform float uSL;uniform vec3 uMZ;uniform vec3 uEZ;\nvec3 tri(sampler2D t,vec3 p,vec3 n){vec3 b=pow(abs(n),vec3(4.));b/=b.x+b.y+b.z;return texture2D(t,p.yz).rgb*b.x+texture2D(t,p.xz).rgb*b.y+texture2D(t,p.xy).rgb*b.z;}')
      .replace('#include <map_fragment>','float dA=texture2D(tDet,vWP.xz*.21).r;float dB=texture2D(tDet,vWP.xz*.043+.37).r;float dC=texture2D(tDet,vWP.xz*.0071+.11).r;diffuseColor.rgb*=(.45+.6*dA)*(.62+.42*dB);')
      .replace('#include <color_fragment>','#include <color_fragment>\nfloat slope=1.-clamp(vWN.y,0.,1.);vec2 gq=vWP.xz*.23;vec3 g1=texture2D(tGrass,gq).rgb;vec3 g2=texture2D(tGrass,vec2(gq.y,-gq.x)*.37+.13).rgb;vec3 gt=mix(g1,g2,.35+.3*dB);float gmask=smoothstep(.0,.06,vColor.g-max(vColor.r,vColor.b)*.92);float gl=dot(gt,vec3(.3,.59,.11))/dot(uGM,vec3(.3,.59,.11));diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*gl,.35*step(.001,length(uGM)));vec3 gcol=vColor/uGM*gt*(.88+.24*dB);diffuseColor.rgb=mix(diffuseColor.rgb,gcol,uGC*gmask);vec2 sq=vWP.xz*.27;vec3 sp=mix(texture2D(tSand,sq).rgb,texture2D(tSand,vec2(sq.y,-sq.x)*.61+.4).rgb,.5);float bm=uSB*(1.-smoothstep(1.15,1.55,vWP.y))*smoothstep(-.4,.3,vWP.y);diffuseColor.rgb=mix(diffuseColor.rgb,vColor/uSM*sp,max(bm,uSA)*(1.-smoothstep(.3,.5,slope)));vec2 nq=vWP.xz*.16;vec3 np_=mix(texture2D(tSnow,nq).rgb,texture2D(tSnow,vec2(-nq.y,nq.x)*.57+.2).rgb,.4);diffuseColor.rgb=mix(diffuseColor.rgb,np_*clamp(dot(vColor,vec3(.3,.59,.11))/dot(uNM,vec3(.3,.59,.11)),.55,1.4)*(.92+.16*dB),uSN*min(1.,.55+.45*smoothstep(.25,.6,dB)+step(.99,uSN)));float mz=uSL*(1.-smoothstep(uMZ.z*.5,uMZ.z*.62,distance(vWP.xz,uMZ.xy)));vec3 slp=texture2D(tSlate,vWP.xz*.25).rgb;diffuseColor.rgb=mix(diffuseColor.rgb,slp*.95,mz);vec2 dq=vWP.xz*.19;vec3 dp=mix(texture2D(tDirt,dq).rgb,texture2D(tDirt,vec2(-dq.y,dq.x)*.71+.29).rgb,.5)*1.15;float fm=(1.-smoothstep(uFZ.z*.45,uFZ.z*1.05,distance(vWP.xz,uFZ.xy)))*(.45+.55*smoothstep(.3,.7,dB));float em=1.-smoothstep(uEZ.z*.5,uEZ.z*.95,distance(vWP.xz,uEZ.xy));diffuseColor.rgb=mix(diffuseColor.rgb,dp,uGC*max(fm*.8,em*.85)*smoothstep(1.,1.6,vWP.y));float pm=smoothstep(.55,.75,dC)*smoothstep(1.2,2.2,vWP.y)*(1.-smoothstep(.3,.5,slope));diffuseColor.rgb=mix(diffuseColor.rgb,mix(uPatchC*(.6+.5*dA),dp,uGC),pm*.55);\nvec3 rc=tri(tRock,vWP*.09,vWN)*uRockC*1.5;if(uHasP>.5){vec3 rp=tri(tRockP,vWP*.11,vWN);float rl=dot(rp,vec3(.3,.59,.11))/dot(uRM,vec3(.3,.59,.11));rc=mix(uRockC*rl*.5,rp*1.1,uGC);}float rm=smoothstep(.22,.42,slope+(dB-.5)*.15);diffuseColor.rgb=mix(diffuseColor.rgb,rc,rm);')};
  tm.needsUpdate=true}
/* ---------- 树：三种，实例化 ---------- */
const TREE_TYPES={
  pine:{trunk:merged([[new THREE.CylinderGeometry(.18,.32,6,8),M4(0,3)]]),crown:merged([0,1,2,3].map(i=>[new THREE.ConeGeometry(2.4-i*.5,2.6,9),M4(0,3.2+i*1.3,0,i)])),tm:MAT.bark2,cm:MAT.pine,r:.45,hits:5,wood:4},
  broad:{trunk:merged([[new THREE.CylinderGeometry(.24,.38,4.2,8),M4(0,2.1)],[new THREE.CylinderGeometry(.08,.14,2,6),M4(.5,3.6,0,0,1,1,1,0,-.6)]]),
    crown:merged([[new THREE.IcosahedronGeometry(2.2,ICO_D),M4(0,5.2)],[new THREE.IcosahedronGeometry(1.6,ICO_D),M4(1.4,4.6,.5)],[new THREE.IcosahedronGeometry(1.5,ICO_D),M4(-1.2,4.8,-.6)],[new THREE.IcosahedronGeometry(1.3,ICO_D),M4(.2,6.3,-.3)]]),tm:MAT.bark,cm:MAT.leaf,r:.5,hits:5,wood:5},
  sakura:{trunk:merged([[new THREE.CylinderGeometry(.2,.32,3.4,8),M4(0,1.7,0,0,1,1,1,0,.08)],[new THREE.CylinderGeometry(.08,.12,2,6),M4(-.5,3,0,0,1,1,1,0,.7)]]),
    crown:merged([[new THREE.IcosahedronGeometry(1.9,ICO_D),M4(0,4.2)],[new THREE.IcosahedronGeometry(1.4,ICO_D),M4(1.3,3.8,.4)],[new THREE.IcosahedronGeometry(1.3,ICO_D),M4(-1.4,3.9,-.3)],[new THREE.IcosahedronGeometry(1.1,ICO_D),M4(.1,5.3)]]),tm:MAT.bark2,cm:MAT.sakura,r:.45,hits:4,wood:3}};
if(NAT_ON){const T=TREE_TYPES;
  T.broad.trunk=natGeo(NATM.ct3.bark,.78);T.broad.crown=natGeo(NATM.ct3.leaf,.78);T.broad.tm=MAT.barkN;T.broad.cm=MAT.leafN;
  T.pine.trunk=natGeo(NATM.pine.bark,1.1);T.pine.crown=natGeo(NATM.pine.leaf,1.1);T.pine.tm=MAT.barkN;T.pine.cm=MAT.pineN;
  T.sakura.trunk=natGeo(NATM.ct1.bark,.8);T.sakura.crown=natGeo(NATM.ct1.leaf,.8);T.sakura.tm=MAT.barkN;T.sakura.cm=MAT.sakN}
if(NAT_ON&&typeof GTREEM!=='undefined'){const T=TREE_TYPES,lm2=(map,gray)=>{const m=new THREE.MeshStandardMaterial({color:'#ffffff',map,alphaTest:.45,side:THREE.DoubleSide,roughness:.8});m.userData.photo=1;m.userData.gray=gray;return m};
  for(const [k,g,sc] of[['broad','gbroad',.9],['pine','gpine',.95],['sakura','gsak',.85]]){if(!GTREEM[g])continue;T[k].trunk=natGeo(GTREEM[g].bark,sc);T[k].crown=natGeo(GTREEM[g].leaf,sc);
    const bt=natTex(GTREET[g+'B']);T[k].tm=mat('#ffffff',{map:bt,roughness:.95});T[k].tm.color.copy(MAT.barkN.color);T[k].cm=lm2(natTex(GTREET[g+'L']),natTex(GTREET[g+'G']))}}
const trees=[];
function zoneOf(x,z){if(STREET&&streetF(x,z)<2)return 'market';for(const k in ZONES){const Z=ZONES[k];if(Math.hypot(x-Z.x,z-Z.z)<Z.r)return k}return null}
function nearRoad(x,z){const P=[[ZONES.home,ZONES.market],[ZONES.market,{x:riverX(BRIDGE.z)+22,z:BRIDGE.z}],[{x:riverX(BRIDGE.z)+22,z:BRIDGE.z},ZONES.enemy],[ZONES.market,ZONES.river],[ZONES.home,ZONES.forest]];
  let d=1e9;for(const [a,b] of P){const dx=b.x-a.x,dz=b.z-a.z,t=clamp(((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz),0,1);d=Math.min(d,Math.hypot(x-a.x-dx*t,z-a.z-dz*t))}return d}
{ // 撒树
  const tryT=(type,x,z,s)=>{const y=H(x,z);if(y<1.4||y>20)return;if(Math.abs(x-riverX(z))<20)return;const zn=zoneOf(x,z);if(zn&&zn!=='forest'&&zn!=='mine'&&zn!=='beach')return;if(nearRoad(x,z)<4)return;
    for(const t of trees)if(Math.abs(t.x-x)<3.5&&Math.abs(t.z-z)<3.5)return;trees.push({type,x,z,s,ry:srnd()*6.28,alive:true,hp:TREE_TYPES[type].hits,t:0})};
  for(let i=0;i<5000&&trees.length<420;i++){const x=(srnd()*2-1)*175,z=(srnd()*2-1)*175;if(Math.hypot(x,z)>coastR(x,z)-14)continue;
    const fd=Math.hypot(x-ZONES.forest.x,z-ZONES.forest.z);const dens=(fd<55?.9:.22)*(CH===2?({desert:.3,volcano:.55,city:.25,plateau:.7,swamp:1.2}[REGD.terr]||1):1);if(srnd()>dens)continue;tryT(fd<55&&srnd()<.6||H(x,z)>9?'pine':(CH===2&&srnd()<REGD.sak?'sakura':'broad'),x,z,.85+srnd()*.45)}
  for(let i=0;i<(CH===2&&!(REGD.sak>0)?0:16);i++){const a=srnd()*6.28,r=ZONES.market.r+2+srnd()*8;const x=ZONES.market.x+Math.cos(a)*r,z=ZONES.market.z+Math.sin(a)*r;if(Math.abs(x-riverX(z))>20&&nearRoad(x,z)>3.5)trees.push({type:'sakura',x,z,s:.9+srnd()*.3,ry:srnd()*6,alive:true,hp:4,t:0})}
}
const treeIM={};
for(const type in TREE_TYPES){const T_=TREE_TYPES[type],list=trees.filter(t=>t.type===type);
  const a=new THREE.InstancedMesh(T_.trunk,T_.tm,list.length),b=new THREE.InstancedMesh(T_.crown,T_.cm,list.length);a.castShadow=b.castShadow=true;a.receiveShadow=b.receiveShadow=true;
  const col=new THREE.Color();const RT=CH===2&&(REGD.crown||REGD.hue);if(RT){b.material=T_.cm.clone();b.material.color.set('#ffffff');if(T_.cm.userData.photo&&type!=='sakura')b.material.map=T_.cm.userData.gray||NATX.leaf}if(CH===2&&REGD.dead)b.visible=false;
  list.forEach((t,i)=>{t.i=i;t.m=M4(t.x,H(t.x,t.z)-.15,t.z,t.ry,t.s,t.s*(.9+srnd()*.25),t.s);a.setMatrixAt(i,t.m);b.setMatrixAt(i,t.m);if(RT&&type!=='sakura'){if(REGD.hue){const h=REGD.hue;col.setHSL(h[0]+srnd()*(h[1]-h[0]),h[2],h[3]+srnd()*.12)}else col.set(REGD.crown).multiplyScalar(.85+srnd()*.3)}else col.setHSL(0,0,.85+srnd()*.3);b.setColorAt(i,col);t.col=addCol({x:t.x,z:t.z,r:T_.r*t.s,tree:t})});
  scene.add(a,b);treeIM[type]={a,b}}
function setTree(t,vis){const I=treeIM[t.type];I.a.setMatrixAt(t.i,vis?t.m:ZERO);I.b.setMatrixAt(t.i,vis?t.m:ZERO);I.a.instanceMatrix.needsUpdate=I.b.instanceMatrix.needsUpdate=true;t.col.off=!vis}
const falling=[];
function fellTree(t,dirX,dirZ){sfx('treefall');setTree(t,false);t.alive=false;t.t=0;const T_=TREE_TYPES[t.type];
  const g=new THREE.Group(),a=new THREE.Mesh(T_.trunk,T_.tm),b=new THREE.Mesh(T_.crown,T_.cm);a.castShadow=b.castShadow=true;g.add(a,b);
  g.position.set(t.x,H(t.x,t.z)-.15,t.z);g.scale.setScalar(t.s);scene.add(g);const ax=new THREE.Vector3(dirZ,0,-dirX).normalize();falling.push({g,ax,t:0})}

/* ---------- 可采集的石头、草药、浆果丛、地上物资 ---------- */
function scatter(n,test){const out=[];for(let i=0;i<n*40&&out.length<n;i++){const x=(srnd()*2-1)*175,z=(srnd()*2-1)*175;if(Math.hypot(x,z)>coastR(x,z)-10)continue;if(Math.abs(x-riverX(z))<17)continue;const y=H(x,z);if(test(x,z,y))out.push({x,z,y})}return out}
const nodes=[];   // 可交互/可击打的资源点
function makeIM(geo,m,list,kind,extra){const im=new THREE.InstancedMesh(geo,m,list.length);im.castShadow=true;im.receiveShadow=true;
  list.forEach((p,i)=>{const s=p.s||1;p.m=M4(p.x,p.y,p.z,srnd()*6.28,s,s,s);im.setMatrixAt(i,p.m)});scene.add(im);return im}
// 大石头（敲击得石头/硝石/灵石）
const rockList=scatter(150,(x,z,y)=>{const zn=zoneOf(x,z);if(zn==='market'||zn==='home'||zn==='enemy')return false;const md=Math.hypot(x-ZONES.mine.x,z-ZONES.mine.z);return md<45?srnd()<.9:srnd()<.25}).map(p=>Object.assign(p,{s:.8+srnd()*.9,y:p.y+.2}));
const rockGeo=new THREE.DodecahedronGeometry(1.1,1);{const pp=rockGeo.attributes.position;for(let i=0;i<pp.count;i++){const v=_v.fromBufferAttribute(pp,i);v.multiplyScalar(.85+.3*Math.abs(Math.sin(v.x*3.1+v.y*2.3+v.z*1.7)));v.y*=.7;pp.setXYZ(i,v.x,v.y,v.z)}rockGeo.computeVertexNormals()}
const rockIM=NAT_ON?makeIM(natGeo(NATM.rk1.m,.62),MAT.rockN,rockList):makeIM(rockGeo,MAT.rock,rockList);
rockList.forEach((r,i)=>{nodes.push(Object.assign(r,{kind:'rock',name:'石头',i,im:rockIM,hp:4,alive:true,t:0,col:addCol({x:r.x,z:r.z,r:1*r.s})}))});
// 草药（灵草）
const herbGeo=merged([[new THREE.CylinderGeometry(.02,.03,.5,5),M4(0,.25)],[new THREE.SphereGeometry(.16,8,6),M4(.12,.25,0,0,1,.25,.5,0,.6)],[new THREE.SphereGeometry(.16,8,6),M4(-.12,.3,0,0,1,.25,.5,0,-.6)],[new THREE.SphereGeometry(.14,8,6),M4(0,.2,.12,1.5,1,.25,.5,0,.6)]]);
const herbList=scatter(CH===2?150:90,(x,z,y)=>y>1.5&&y<12&&!zoneOf(x,z)||zoneOf(x,z)==='forest');
const herbIM=makeIM(herbGeo,MAT.herb,herbList);const herbBulb=makeIM(new THREE.SphereGeometry(.09,8,6).translate(0,.56,0),MAT.herbGlow,herbList);
herbList.forEach((h,i)=>nodes.push(Object.assign(h,{kind:'herb',name:'灵草',i,im:herbIM,im2:herbBulb,alive:true,t:0})));
// 浆果丛
const bushGeo=NAT_ON?natGeo(NATM.bush.leaf,.8):merged([[new THREE.IcosahedronGeometry(.75,ICO_D),M4(0,.55,0,0,1,.8,1)],[new THREE.IcosahedronGeometry(.55,ICO_D),M4(.5,.45,.2)],[new THREE.IcosahedronGeometry(.5,ICO_D),M4(-.45,.42,-.2)]]);
const berryGeo=merged(Array.from({length:12},(_,k)=>{const a=k*2.4,e=.3+(k%4)*.25;return[new THREE.SphereGeometry(.09,8,6),M4(Math.cos(a)*.72*Math.cos(e),.5+Math.sin(e)*.5,Math.sin(a)*.72*Math.cos(e))]}));
const bushList=scatter(70,(x,z,y)=>y>1.5&&y<10&&(!zoneOf(x,z)||zoneOf(x,z)==='forest')&&nearRoad(x,z)>3);
const bushIM=makeIM(bushGeo,MAT.bush,bushList),berryIM=makeIM(berryGeo,MAT.berry,bushList);
bushList.forEach((b,i)=>nodes.push(Object.assign(b,{kind:'berry',name:'浆果丛',i,im:berryIM,alive:true,t:0,col:addCol({x:b.x,z:b.z,r:.7})})));
// 地上的树枝和石子（开局好上手）
const stickGeo=merged([0,1,2].map(k=>[new THREE.CylinderGeometry(.04,.05,1,5),M4(0,.06+k*.05,0,k*1.1,1,1,1,0,Math.PI/2)]));
const stickList=scatter(70,(x,z,y)=>y>1.2&&y<10&&!['market','enemy'].includes(zoneOf(x,z)));
for(let i=0;i<6;i++)stickList.push({x:ZONES.home.x+rnd(-12,12),z:ZONES.home.z+rnd(-12,12),y:0,home:1});   // 营地这几根会在 p7 里挪到安全空地stickList.forEach(p=>{p.y=H(p.x,p.z);p.s=1.35});
const stickIM=makeIM(stickGeo,MAT.stick,stickList);stickList.forEach((p,i)=>nodes.push(Object.assign(p,{kind:'stick',name:'树枝',i,im:stickIM,alive:true,t:0})));
const pebList=scatter(55,(x,z,y)=>y>.8&&y<14&&!['market','enemy'].includes(zoneOf(x,z)));
for(let i=0;i<5;i++)pebList.push({x:ZONES.home.x+rnd(-12,12),z:ZONES.home.z+rnd(-12,12),y:0,home:1});pebList.forEach(p=>{p.y=H(p.x,p.z)+.05;p.s=1.3});
const pebIM=makeIM(merged([[new THREE.DodecahedronGeometry(.16,0),M4(0,.08,0,0,1,.6,1)],[new THREE.DodecahedronGeometry(.11,0),M4(.18,.05,.1,0,1,.6,1)]]),MAT.pebble,pebList);
pebList.forEach((p,i)=>nodes.push(Object.assign(p,{kind:'pebble',name:'石子',i,im:pebIM,alive:true,t:0})));
function setNode(n,vis){n.im.setMatrixAt(n.i,vis?n.m:ZERO);n.im.instanceMatrix.needsUpdate=true;if(n.im2){n.im2.setMatrixAt(n.i,vis?n.m:ZERO);n.im2.instanceMatrix.needsUpdate=true}if(n.col&&n.kind==='rock')n.col.off=!vis}

/* ---------- 静态建筑：合并几何体减少绘制次数 ---------- */
const bakeParts=new Map();   // material -> [[geo,matrix]]
function bk(geo,m,mx){if(!bakeParts.has(m))bakeParts.set(m,[]);bakeParts.get(m).push([geo,mx])}
function bakeAll(){for(const [m,parts] of bakeParts){const mesh=new THREE.Mesh(merged(parts),m);mesh.castShadow=mesh.receiveShadow=true;scene.add(mesh)}bakeParts.clear()}
const B=(x,z,ry=0)=>{const y=H(x,z);const base=M4(x,y,z,ry);return(lx,ly,lz,lry=0,sx=1,sy=1,sz=1,rx=0,rz=0)=>base.clone().multiply(M4(lx,ly,lz,lry,sx,sy,sz,rx,rz))};
const box=(w,h,d)=>new THREE.BoxGeometry(w,h,d).translate(0,h/2,0);
const cyl=(r1,r2,h,s=10)=>new THREE.CylinderGeometry(r2,r1,h,s).translate(0,h/2,0);
function roof(w,d,h){const g=new THREE.BufferGeometry();const x=w/2,z=d/2;const v=[-x,0,-z,x,0,-z,x*.9,h,0, -x,0,-z,x*.9,h,0,-x*.9,h,0, x,0,z,-x,0,z,-x*.9,h,0, x,0,z,-x*.9,h,0,x*.9,h,0, -x,0,-z,-x*.9,h,0,-x,0,z, x,0,-z,x,0,z,x*.9,h,0];
  g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.computeVertexNormals();g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(v.length/3*2),2));return g}
function house(x,z,ry,w=6,d=5,h=3.2,wallM=MAT.wall,roofM=MAT.tile){const L=B(x,z,ry);bk(box(w+.6,.4,d+.6),MAT.rock,L(0,-.1,0));bk(box(w,h,d),wallM,L(0,.3,0));
  for(const sx of[-1,1])for(const sz of[-1,1])bk(cyl(.16,.16,h,8),MAT.pillar,L(sx*w/2,.3,sz*d/2));
  bk(box(1.2,2.1,.1),MAT.dark,L(0,.3,d/2+.02));for(const sx of[-1,1])bk(box(1,.9,.06),MAT.dark,L(sx*w*.3,1.6,d/2+.03));
  bk(roof(w+1.8,d+1.8,h*.45+.6),roofM,L(0,h+.3,0));bk(box(w+1.4,.2,.25),MAT.dark,L(0,h+.3+h*.45+.55,0));addCol({x,z,r:Math.max(w,d)*.55})}
// 坊市
/* ---------- 各州集市：外部 3D 模型（来源见 credits） ---------- */
const MKT_KITS={
  mid:{gate:'cXyQGUwmlA5',land:'1zS7ucaAd4J',big:'PUZZ5F91OE',bld:['eHOI2VgW1ol','xYZB1TmGMv','d1M5ncMBUDi','xYZB1TmGMv','eHOI2VgW1ol'],stall:['DGIM5HGISb','l7bDe7ak6j'],lamp:'7PZhxLFiGc2'},
  sy:{gate:'cXyQGUwmlA5',land:'d1M5ncMBUDi',bld:['eHOI2VgW1ol','xYZB1TmGMv','eHOI2VgW1ol','xYZB1TmGMv','xYZB1TmGMv','eHOI2VgW1ol'],stall:['jSqGy8V0MQ','jSqGy8V0MQ','DGIM5HGISb','jSqGy8V0MQ'],lamp:'3jzk3YShv1'},
  sx:{land:'f7uccD5iyz0',bld:['et0OmFeZVkb','4CNw6ZPb4x3','et0OmFeZVkb','et0OmFeZVkb','4CNw6ZPb4x3','et0OmFeZVkb'],stall:['DGIM5HGISb','l7bDe7ak6j','DGIM5HGISb','DGIM5HGISb'],lamp:'3jzk3YShv1'},
  st:{gate:'cXyQGUwmlA5',land:'1zS7ucaAd4J',bld:['xYZB1TmGMv','eHOI2VgW1ol','xYZB1TmGMv','xYZB1TmGMv','eHOI2VgW1ol','xYZB1TmGMv'],stall:['jSqGy8V0MQ','jSqGy8V0MQ','jSqGy8V0MQ','DGIM5HGISb'],lamp:'7PZhxLFiGc2'},
  sxian:{gate:'cXyQGUwmlA5',land:'1zS7ucaAd4J',big:'PUZZ5F91OE',bld:['eHOI2VgW1ol','xYZB1TmGMv','d1M5ncMBUDi','xYZB1TmGMv'],stall:['DGIM5HGISb','l7bDe7ak6j'],lamp:'7PZhxLFiGc2'},
  xy:{land:'1d1nN3qb1E7',bld:['eXvS3l7k4DJ','5Q7qIrfDxA','eXvS3l7k4DJ','5Q7qIrfDxA','eXvS3l7k4DJ','5Q7qIrfDxA'],stall:['l7bDe7ak6j','DGIM5HGISb','l7bDe7ak6j','jSqGy8V0MQ'],lamp:'3jzk3YShv1'},
  xx:{land:'PrOdJaBrOu',bld:['PrOdJaBrOu','4MJWbyd6vw','4MJWbyd6vw','PrOdJaBrOu','4MJWbyd6vw','4MJWbyd6vw'],stall:['aTcKrofhCXS','aTcKrofhCXS','l7bDe7ak6j','aTcKrofhCXS'],lamp:'3jzk3YShv1'},
  xt:{land:'cAhxYWQ2dW1',bld:['4MJWbyd6vw','5KNeQg_znOu','5KNeQg_znOu','4MJWbyd6vw','5KNeQg_znOu','5KNeQg_znOu'],stall:['DGIM5HGISb','l7bDe7ak6j','jSqGy8V0MQ','DGIM5HGISb'],lamp:'3jzk3YShv1'},
  xxian:{land:'PsPe0MzK0E',bld:['lbNz2dClar','ppwtREejXg','lbNz2dClar','ppwtREejXg','lbNz2dClar','rsZJjigt1X'],stall:['aZcNr5-opYI','pWQYCoLbVL','aZcNr5-opYI','pWQYCoLbVL'],lamp:null},
  tx:{gate:'cXyQGUwmlA5',land:'d1M5ncMBUDi',bld:['eHOI2VgW1ol','eHOI2VgW1ol','1zS7ucaAd4J','eHOI2VgW1ol','xYZB1TmGMv','eHOI2VgW1ol'],stall:['jSqGy8V0MQ','jSqGy8V0MQ','DGIM5HGISb','jSqGy8V0MQ'],lamp:'7PZhxLFiGc2'}};
const MKTK=typeof MKTM!=='undefined'?(STREET&&MKTM.fangshi?{street:1}:MKT_KITS[CH===2?REGK:'mid']):null;
const MKT_CACHE={};
function mktModel(id){if(MKT_CACHE[id])return MKT_CACHE[id].clone();const d=MKTM[id];if(!d)return new THREE.Group();
  const b=s=>{const r=atob(s),u=new Uint8Array(r.length);for(let i=0;i<r.length;i++)u[i]=r.charCodeAt(i);return u.buffer};
  const mats=d.mats.map(m=>{const o={color:m.c,roughness:.75,metalness:0};if(m.e){o.emissive=m.e;o.emissiveIntensity=1}if(m.o){o.transparent=true;o.opacity=m.o}if(m.vc)o.vertexColors=true;
    if(m.map){const t=new THREE.TextureLoader().load(m.map);t.flipY=!!m.fy;t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;o.map=t}return new THREE.MeshStandardMaterial(o)});
  const g=new THREE.Group();
  for(const p of d.parts){const P=new Int16Array(b(p.p)),N=new Int8Array(b(p.n)),I=p.b?new Uint32Array(b(p.i)):new Uint16Array(b(p.i));const k=p.s/32767;
    const pos=new Float32Array(P.length);for(let i=0;i<P.length;i++)pos[i]=P[i]*k;const nor=new Float32Array(N.length);for(let i=0;i<N.length;i++)nor[i]=N[i]/127;
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('normal',new THREE.BufferAttribute(nor,3));
    if(p.u){const U=new Int16Array(b(p.u)),uv=new Float32Array(U.length);for(let i=0;i<U.length;i++)uv[i]=U[i]/16383;geo.setAttribute('uv',new THREE.BufferAttribute(uv,2))}
    if(p.c){const C=new Uint8Array(b(p.c)),cc=new Float32Array(C.length);for(let i=0;i<C.length;i++)cc[i]=C[i]/255;geo.setAttribute('color',new THREE.BufferAttribute(cc,3))}
    geo.setIndex(new THREE.BufferAttribute(I,1));geo.computeBoundingSphere();const m=new THREE.Mesh(geo,mats[p.m]);m.castShadow=m.receiveShadow=true;g.add(m)}
  MKT_CACHE[id]=g;return g.clone()}
function mktPlace(id,x,z,ry,col=.42,sc=1){const o=mktModel(id);o.position.set(x,groundAt(x,z)-.05,z);o.rotation.y=ry;o.scale.setScalar(sc);scene.add(o);const sz=MKTM[id]&&MKTM[id].sz;if(sz&&col)addCol({x,z,r:Math.max(sz[0],sz[2])*col*sc});return o}

{const Z=ZONES.market;
  const hs=[[-12,-8,0],[-3,-11,0],[6,-9,0],[-14,6,Math.PI/2],[-5,13,Math.PI],[5,12,Math.PI],[-15,-2,Math.PI/2]];

  if(!MKTK){
  for(const [dx,dz,ry] of hs)house(Z.x+dx,Z.z+dz,ry,6+srnd()*2,5,3+srnd());
  // 摊位
  for(const [dx,dz,c] of[[-4,0,MAT.red],[2,3,MAT.blue],[-6,5,MAT.khaki]]){const L=B(Z.x+dx,Z.z+dz);bk(box(2.6,.9,1.2),MAT.plank,L(0,0,0));for(const sx of[-1.2,1.2])for(const sz of[-.55,.55])bk(cyl(.05,.05,2.4,6),MAT.wood,L(sx,0,sz));bk(roof(3.2,1.8,.6),c,L(0,2.4,0));addCol({x:Z.x+dx,z:Z.z+dz,r:1.5})}
  // 井、灯笼
  {const L=B(Z.x+4,Z.z-2);bk(cyl(1.1,1.1,.9,14),MAT.rock,L(0,0,0));bk(cyl(.9,.9,.05,14),new THREE.MeshStandardMaterial({color:'#1a3a4a',roughness:.1}),L(0,.86,0));for(const sx of[-1,1])bk(box(.15,2.4,.15),MAT.wood,L(sx*1.2,0,0));bk(roof(2.8,1.4,.6),MAT.tile,L(0,2.4,0));addCol({x:Z.x+4,z:Z.z-2,r:1.3})}
  for(let i=0;i<10;i++){const x=Z.x-16+i*3.6,z=Z.z+(i%2?-3.2:3.2);bk(cyl(.06,.06,3,6),MAT.wood,M4(x,H(x,z),z));bk(new THREE.SphereGeometry(.28,10,8).scale(1,1.25,1),MAT.lantern,M4(x,H(x,z)+2.75,z))}
  }
  if(MKTK&&MKTK.street){const o=mktModel('fangshi');o.position.set(Z.x,2.42,Z.z);scene.add(o);o.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true}});
    const C=(x0,x1,z0,z1)=>{const r=Math.min(x1-x0,z1-z0)/2;const nx=Math.max(1,Math.round((x1-x0)/(2*r))),nz=Math.max(1,Math.round((z1-z0)/(2*r)));for(let a=0;a<nx;a++)for(let b=0;b<nz;b++)addCol({x:Z.x+x0+(a+.5)*(x1-x0)/nx,z:Z.z+z0+(b+.5)*(z1-z0)/nz,r:r*1.05})};
    for(const b of FANG_COL)C(...b)}
  if(MKTK&&!MKTK.street){const K=MKTK,P_=(dx,dz)=>[Z.x+dx,Z.z+dz],face=(dx,dz)=>Math.atan2(-dx,-dz);
    {const [x,z]=P_(9,-12);mktPlace(K.land,x,z,face(9,-12),.4)}
    if(K.big){const [x,z]=P_(9,9);mktPlace(K.big,x,z,0,0);for(const [a,c] of [[5,5],[13,5],[5,13],[13,13]])addCol({x:Z.x+a,z:Z.z+c,r:1.6})}
    const ring=[[-12,-9],[-1,-14],[-15,8],[-5,15],[7,15],[16,2]];K.bld.forEach((id,i)=>{if(K.big&&i>=2&&i<4){}const [dx,dz]=K.big&&i===4?[-15,-1]:ring[i];const [x,z]=P_(dx,dz);mktPlace(id,x,z,face(dx,dz),.42)});
    const st=[[3,4.5],[-9,4],[6,-4.5],[-9,-3]];K.stall.forEach((id,i)=>{const [dx,dz]=st[i];if(K.big&&dx>0&&dz>0)return;const [x,z]=P_(dx,dz);mktPlace(id,x,z,face(dx,dz),.45)});
    if(K.lamp)for(let i=0;i<10;i++){const x=Z.x-16+i*3.6,z=Z.z+(i%2?-3.2:3.2);bk(cyl(.06,.06,3,6),MAT.wood,M4(x,H(x,z),z));bk(box(.7,.06,.06),MAT.wood,M4(x+.3,H(x,z)+2.95,z));const o=mktModel(K.lamp);o.position.set(x+.55,H(x,z)+2.95-(MKTM[K.lamp].sz[1]),z);scene.add(o)}
    if(REGD.terr==='city'){const nn=['#ff40d0','#20e0ff'];for(let i=0;i<8;i++){const a=i/8*6.28,x=Z.x+Math.cos(a)*10,z=Z.z+Math.sin(a)*10;bk(cyl(.08,.08,4.5,6),MAT.metal,M4(x,H(x,z),z));bk(box(.12,1.4,.12),mat(nn[i%2],{emissive:nn[i%2],emissiveIntensity:2}),M4(x,H(x,z)+3.2,z))}}
  }
  // 桥
  {const rx=riverX(BRIDGE.z);for(let x=-20;x<=20;x+=1.1){const y=1.7+Math.cos(x/20*Math.PI/2)*.6;bk(box(1.05,.22,BRIDGE.w),MAT.plank,M4(rx+x,y-.22,BRIDGE.z))}
    for(const s of[-1,1])for(let x=-20;x<=20;x+=4){const y=1.7+Math.cos(x/20*Math.PI/2)*.6;bk(cyl(.07,.07,1,6),MAT.pillar,M4(rx+x,y,BRIDGE.z+s*BRIDGE.w/2));bk(cyl(.12,.12,4,6),MAT.wood,M4(rx+x,-3,BRIDGE.z+s*BRIDGE.w/2))}
    for(const s of[-1,1])bk(box(40,.08,.08),MAT.pillar,M4(rx,2.65,BRIDGE.z+s*BRIDGE.w/2))}
}
// 营地（我方与敌营的外观由阵营决定，在开局时生成）
function buildCamp(zone,f,enemy){const Z=ZONES[zone],L=B(Z.x,Z.z);
  const tent=(dx,dz,ry,m)=>{const L2=B(Z.x+dx,Z.z+dz,ry);bk(roof(3.6,4,2.4),m,L2(0,0,0));bk(box(.1,2.4,.1),MAT.wood,L2(0,0,2));addCol({x:Z.x+dx,z:Z.z+dz,r:2})};
  const cm=f==='A'?MAT.cloth:MAT.khaki,fl=f==='A'?MAT.blue:MAT.red;
  for(const [dx,dz,ry] of[[-7,-6,.3],[6,-7,-.2],[-8,6,1.4],[7,7,1.7]])tent(dx,dz,ry,cm);
  for(const [dx,dz] of[[-3,9],[3,-10]]){bk(cyl(.08,.08,6,6),MAT.wood,L(dx,0,dz));bk(box(1.4,.9,.04),fl,L(dx+.72,4.6,dz))}
  if(enemy){ // 木栅栏 + 望楼 + 首领大帐
    for(let i=0;i<54;i++){const a=i/54*Math.PI*2;if(Math.abs(Math.atan2(Math.sin(a-Math.PI),Math.cos(a-Math.PI)))<.22)continue;const r=Z.r-1,x=Z.x+Math.cos(a)*r,z=Z.z+Math.sin(a)*r;{const hh=3.6+srnd()*.6;bk(cyl(.28,.22,hh,7),MAT.wood,M4(x,H(x,z)-.2,z));bk(new THREE.ConeGeometry(.28,.6,7).translate(0,.3,0),MAT.plank,M4(x,H(x,z)-.2+hh,z))}addCol({x,z,r:.6})}
    for(const [dx,dz] of[[-14,-14],[14,14],[-14,14]]){const L2=B(Z.x+dx,Z.z+dz);for(const sx of[-1,1])for(const sz of[-1,1])bk(cyl(.15,.15,6,6),MAT.wood,L2(sx,0,sz));bk(box(2.6,.2,2.6),MAT.plank,L2(0,5,0));bk(roof(3,3,1.2),MAT.plank,L2(0,6.2,0));for(let k=0;k<10;k++)bk(box(.9,.06,.06),MAT.wood,L2(0,.4+k*.5,1.3));for(const sx of[-.45,.45])bk(box(.07,5.1,.07),MAT.wood,L2(sx,0,1.32));addCol({x:Z.x+dx,z:Z.z+dz,r:1.6})}
    {const L2=B(Z.x+6,Z.z);bk(box(9,4,7),MAT.maroon,L2(0,0,0));bk(roof(10.5,8.5,3),MAT.maroon2,L2(0,4,0));bk(box(2,3,.1),MAT.dark,L2(0,0,-3.52));addCol({x:Z.x+6,z:Z.z,r:4.6});signMesh(signTex('狼','#1c1a1a','#d8a84a',128,160),1.3,1.7,Z.x+6,H(Z.x+6,Z.z)+4.6,Z.z-3.75,0)
      for(const [dx,dz] of[[1,-6],[1.8,-6.4],[10,-5]])bk(box(.8,.8,.8),MAT.plank,L2(dx-6,0,dz,srnd()));for(let k=0;k<4;k++)bk(cyl(.025,.025,2,5),MAT.wood,L2(-5.2+k*.3,0,-4.2,0,1,1,1,-.25,0))}
    {const fx=Z.x-10,fz=Z.z-2;bk(cyl(.07,.07,7.5,6),MAT.wood,M4(fx,H(fx,fz),fz));signMesh(signTex('☠','#a02a22','#141010',160,110),1.6,1.1,fx+.85,H(fx,fz)+6.6,fz,0)}
  }else{ // 我方：被毁的营地，留下补给箱
    for(const [dx,dz] of[[2,2],[3,1.2],[2.4,.4]])bk(box(.9,.9,.9),MAT.plank,L(dx,0,dz,srnd()));addCol({x:Z.x+2.5,z:Z.z+1.2,r:1.3})
    // 熄灭的旧篝火：石圈、三脚架、吊锅；木桶、柴堆、灯笼
    {const fx=Z.x-2.5,fz=Z.z+1,L3=B(fx,fz);for(let i=0;i<10;i++){const a=i/10*6.28;bk(new THREE.DodecahedronGeometry(.22,0),MAT.rock2,L3(Math.cos(a)*.75,.1,Math.sin(a)*.75))}
      for(let i=0;i<3;i++){const a=i/3*6.28;bk(cyl(.035,.035,2,5),MAT.wood,L3(Math.cos(a)*.55,0,Math.sin(a)*.55,0,1,1,1,Math.sin(a)*.27,-Math.cos(a)*.27))}
      bk(new THREE.SphereGeometry(.28,10,8,0,Math.PI*2,Math.PI*.45,Math.PI*.55),MAT.dark,L3(0,1.05,0));for(let i=0;i<4;i++)bk(cyl(.1,.1,1.2,7),MAT.wood,L3(-1.6,.12+(i>1?.18:0),-1.2+(i%2)*.24+(i>1?.12:0),0,1,1,1,Math.PI/2,0));addCol({x:fx,z:fz,r:.95})}
    for(const [dx,dz] of[[-6,1],[-5.4,1.8]]){bk(cyl(.32,.36,.9,10),MAT.wood,L(dx,0,dz));addCol({x:Z.x+dx,z:Z.z+dz,r:.4})}
    for(const [dx,dz] of[[4,-3],[-4,-4]]){bk(cyl(.05,.05,2.2,6),MAT.wood,L(dx,0,dz));bk(box(.26,.34,.26),MAT.lampGlow,L(dx,2.05,dz))}
  }
}
// 渡口：栈桥
{const Z=ZONES.river,rx=riverX(Z.z);for(let i=0;i<8;i++)bk(box(1.2,.2,3),MAT.plank,M4(rx-14+i*1.25,1.1,Z.z));for(let i=0;i<4;i++)bk(cyl(.12,.12,4,6),MAT.wood,M4(rx-13+i*2.5,-2.5,Z.z+1.4));
  for(let i=0;i<6;i++)bk(cyl(.07,.07,1.2,5),MAT.wood,M4(Z.x-4+i*1.4,H(Z.x-4+i*1.4,Z.z-3),Z.z-3))}

/* ---------- 场景装饰：对照参考图（营地栈桥帆船、海中岩石小岛、山林蘑菇路牌石阶、灵河亭子石灯笼、坊市牌楼幡旗、云） ---------- */
function signTex(txt,bg,fg,w=256,h=96){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,w,h);x.strokeStyle=fg;x.lineWidth=6;x.strokeRect(7,7,w-14,h-14);
  x.fillStyle=fg;x.font='bold '+Math.round(h*.56)+'px "Noto Serif SC","Songti SC","STSong","SimSun","Microsoft YaHei",serif';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,w/2,h/2+3);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
function signMesh(tex,w,h,x,y,z,ry){const g=new THREE.Group(),m=new THREE.MeshStandardMaterial({map:tex,roughness:.8});const a=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m),b=a.clone();a.position.z=.07;b.position.z=-.07;b.rotation.y=Math.PI;
  const bd=new THREE.Mesh(new THREE.BoxGeometry(w+.1,h+.1,.12),MAT.dark);g.add(bd,a,b);g.position.set(x,y,z);g.rotation.y=ry;g.traverse(o=>{if(o.isMesh)o.castShadow=true});scene.add(g);return g}
const DECOR_BOATS=[];
MAT.stoneL=mat('#b8b2a6');MAT.lampGlow=mat('#ffe2a0',{emissive:'#ffb040',emissiveIntensity:.9});MAT.roofBlue=mat('#3d5f8c',{roughness:.6});MAT.cloth2=mat('#3a78b8',{side:THREE.DoubleSide});MAT.cloth3=mat('#e0b450',{side:THREE.DoubleSide});MAT.mushCap=mat('#e0342a',{emissive:'#ff2010',emissiveIntensity:.22,roughness:.5});MAT.mushStem=mat('#f2ead8');
MAT.crystal=mat('#8ae8ff',{emissive:'#40c8ff',emissiveIntensity:.8,roughness:.2,metalness:.1});
// 坊市牌楼（西门，写着「坊市」）+ 幡旗 + 更多摊位
{const Z=ZONES.market,gx=Z.x-23,gz=Z.z+1;const L=B(gx,gz,Math.PI/2);if(MKTK&&MKTK.street){}else if(MKTK&&MKTK.gate){mktPlace(MKTK.gate,gx,gz,Math.PI/2,0);for(const s of[-1,1])addCol({x:gx,z:gz+s*2.9,r:.5})}else{for(const s of[-1,1]){bk(cyl(.22,.22,4.6,10),MAT.pillar,L(s*2.7,0,0));bk(box(.7,.5,.7),MAT.stoneL,L(s*2.7,0,0));addCol({x:gx,z:gz+s*2.7,r:.45})}
  bk(box(6.6,.35,.5),MAT.pillar,L(0,4.3,0));bk(box(6.2,.25,.4),MAT.dark,L(0,3.6,0));bk(roof(7.6,1.8,1),MAT.tile,L(0,4.6,0));}
  if(!(MKTK&&MKTK.street))signMesh(signTex(ZONES.market.name.split('').join(' '),'#2c4a6e','#f2d27a'),2.2,.8,gx,H(gx,gz)+3.95,gz,Math.PI/2);
  if(!(MKTK&&MKTK.street))for(let i=0;i<8;i++){const a=i/8*Math.PI*2+.3,x=Z.x+Math.cos(a)*15,z=Z.z+Math.sin(a)*15;bk(cyl(.05,.05,3.6,6),MAT.wood,M4(x,H(x,z),z));bk(new THREE.PlaneGeometry(.7,1.7),i%2?MAT.cloth2:MAT.cloth3,M4(x+.38,H(x,z)+2.6,z,a))}
  for(const [dx,dz,ry,k] of(MKTK?[]:[[6,6,0,0],[9,-2,Math.PI/2,1],[-9,-3,0,2]])){const x=Z.x+dx,z=Z.z+dz,L2=B(x,z,ry);bk(box(2.6,.9,1.2),MAT.plank,L2(0,0,0));for(const sx of[-1.2,1.2])for(const sz of[-.55,.55])bk(cyl(.05,.05,2.4,6),MAT.wood,L2(sx,0,sz));
    bk(roof(3.2,1.8,.6),[MAT.cloth2,MAT.khaki,MAT.red][k],L2(0,2.4,0));
    for(let j=0;j<5;j++){if(k===1)bk(new THREE.OctahedronGeometry(.13,0),MAT.crystal,L2(-1+j*.5,1.05,0,j));else bk(cyl(.09,.11,.24,8),k?MAT.straw:MAT.stoneL,L2(-1+j*.5,.9,(j%2)*.25-.1))}addCol({x,z,r:1.5})}}
// 灵河：河边亭子与石灯笼
{const pz=-12,px=riverX(pz)-27;const L=B(px,pz,.3);for(const sx of[-1,1])for(const sz of[-1,1])bk(cyl(.14,.14,3,8),MAT.pillar,L(sx*1.5,0,sz*1.5));bk(cyl(2.3,2.3,.3,8),MAT.stoneL,L(0,-.1,0));
  bk(new THREE.ConeGeometry(2.9,1.5,4).rotateY(Math.PI/4).translate(0,.75,0),MAT.roofBlue,L(0,3,0));bk(new THREE.SphereGeometry(.15,8,6),MAT.gold,L(0,4.55,0));addCol({x:px,z:pz,r:2.1});
  for(let z=-90;z<=100;z+=19){if(Math.abs(z-BRIDGE.z)<8)continue;const x=riverX(z)-20.5,y=H(x,z);if(y<1)continue;bk(box(.42,.5,.42),MAT.stoneL,M4(x,y,z));bk(cyl(.08,.08,.5,6),MAT.stoneL,M4(x,y+.5,z));bk(box(.36,.32,.36),MAT.lampGlow,M4(x,y+1,z));bk(new THREE.ConeGeometry(.36,.3,4).rotateY(Math.PI/4).translate(0,.15,0),MAT.stoneL,M4(x,y+1.32,z));addCol({x,z,r:.35})}}
// 石阶小路：营地—坊市、营地—山林、坊市—渡口
{const segs=[[ZONES.home,ZONES.market],[ZONES.home,ZONES.forest],[ZONES.market,ZONES.river]],pts=[];for(const [a,b] of segs){const d=Math.hypot(b.x-a.x,b.z-a.z);for(let s=0;s<d;s+=1.5){const t=s/d,x=a.x+(b.x-a.x)*t+rnd(-.6,.6),z=a.z+(b.z-a.z)*t+rnd(-.6,.6),y=H(x,z);if(y<1.4||Math.abs(x-riverX(z))<19)continue;pts.push([x,y,z])}}
  const st=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.42,0).scale(1,.16,1),MAT.stoneL,pts.length);pts.forEach((p,i)=>{st.setMatrixAt(i,M4(p[0],p[1]+.02,p[2],rnd(0,6),rnd(.8,1.3),1,rnd(.8,1.3)))});st.receiveShadow=true;scene.add(st)}
// 山林：红蘑菇（夜里微微发光）+ 路牌
{const pts=scatter(70,(x,z,y)=>Math.hypot(x-ZONES.forest.x,z-ZONES.forest.z)<55&&y>1.5);const geo=new THREE.CylinderGeometry(.05,.07,.28,6).translate(0,.14,0),cap=new THREE.SphereGeometry(.17,10,6,0,Math.PI*2,0,Math.PI/2).scale(1,.7,1).translate(0,.26,0);
  const a=new THREE.InstancedMesh(geo,MAT.mushStem,pts.length),b=new THREE.InstancedMesh(cap,MAT.mushCap,pts.length);pts.forEach((p,i)=>{const s=rnd(.7,1.6),m=M4(p.x,p.y,p.z,0,s,s,s);a.setMatrixAt(i,m);b.setMatrixAt(i,m)});scene.add(a,b);
  const sx=ZONES.home.x+(ZONES.forest.x-ZONES.home.x)*.55+2,sz=ZONES.home.z+(ZONES.forest.z-ZONES.home.z)*.55;bk(cyl(.08,.08,2.4,6),MAT.wood,M4(sx,H(sx,sz),sz));signMesh(signTex(ZONES.forest.name+' →','#7a5430','#fff2d0'),1.1,.42,sx,H(sx,sz)+2.05,sz,.9);bk(new THREE.PlaneGeometry(.12,.9),MAT.red,M4(sx+.1,H(sx,sz)+1.6,sz,.9))}
// 南岸沙滩：木栈道 + 停泊的小帆船；海中岩石小岛
{let z0=140,z1=140;const bx=-62;for(let z=140;z<230;z+=.5){if(H(bx,z)<1.3&&z0===140)z0=z;if(H(bx,z)<-1.5){z1=z;break}}
  if(z1>z0){for(let z=z0-3;z<z1+4;z+=1.05)bk(box(2.2,.18,1),MAT.plank,M4(bx,1.15,z));for(let z=z0;z<z1+4;z+=3)for(const s of[-1,1])bk(cyl(.13,.13,5,6),MAT.wood,M4(bx+s*1.15,-3.5,z));
    const bt=mkBoat('X');bt.scale.setScalar(.6);bt.position.set(bx+3.2,WATER_Y+.25,z1+2);bt.rotation.y=.25;scene.add(bt);DECOR_BOATS.push(bt)}
  for(let i=0;i<7;i++){const a=i/7*Math.PI*2+.5,r=215+srnd()*70,cx=Math.cos(a)*r,cz=Math.sin(a)*r;for(let k=0;k<5;k++){const m=new THREE.Mesh(rockGeo,k%2?MAT.rock:MAT.rock2),s=4+srnd()*7;m.scale.set(s,s*(.8+srnd()*.9),s);m.position.set(cx+(srnd()-.5)*14,-1+srnd()*2,cz+(srnd()-.5)*14);m.rotation.y=srnd()*6;m.castShadow=true;scene.add(m)}
    const t=new THREE.Mesh(TREE_TYPES.broad.crown,MAT.leaf);t.scale.setScalar(1.3);t.position.set(cx,6,cz);scene.add(t)}}
// 云：程序画的柔和云朵，傍晚染成粉紫色
const cloudMat=new THREE.SpriteMaterial({map:(()=>{const c=document.createElement('canvas');c.width=256;c.height=128;const x=c.getContext('2d');for(let i=0;i<14;i++){const px=40+Math.random()*176,py=50+Math.random()*40,r=22+Math.random()*30;const g=x.createRadialGradient(px,py,0,px,py,r);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.beginPath();x.arc(px,py,r,0,7);x.fill()}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t})(),transparent:true,depthWrite:false,fog:false,opacity:.9});
for(let i=0;i<26;i++){const s=new THREE.Sprite(cloudMat),a=Math.random()*6.28,r=260+Math.random()*420;s.position.set(Math.cos(a)*r,150+Math.random()*120,Math.sin(a)*r);const w=150+Math.random()*180;s.scale.set(w,w*.45,1);scene.add(s)}

/* ---------- 第二章：浮空岛、仙鹤、丹炉、山顶亭子与秘境宝箱 ---------- */
const CRANES=[],CH2OBJ={};
if(CH===2){MAT.tile.color.set(REGD.tile);const M=ZONES.mine,top=H(M.x,M.z);
  if(REGD.float)for(let i=0;i<9;i++){const a=i/9*6.28+.4,r=42+srnd()*45,x=M.x+Math.cos(a)*r,z=M.z+Math.sin(a)*r,y=top-8+srnd()*30,s=3+srnd()*4;const g=new THREE.Group();
    const rk=new THREE.Mesh(new THREE.ConeGeometry(1,2.4,7),MAT.rock);rk.rotation.x=Math.PI;rk.scale.set(s,s,s);rk.position.y=-s*1.2;const gr=new THREE.Mesh(new THREE.CylinderGeometry(1.02,1,.3,7),MAT.leaf2);gr.scale.set(s,1,s);g.add(rk,gr);
    if(i%2){const t=new THREE.Mesh(TREE_TYPES.sakura.crown,MAT.sakura),tr=new THREE.Mesh(TREE_TYPES.sakura.trunk,MAT.bark2);t.scale.setScalar(.8);tr.scale.setScalar(.8);g.add(t,tr)}
    g.position.set(x,y,z);g.traverse(o=>{if(o.isMesh)o.castShadow=true});scene.add(g)}
  {const L=B(M.x+5,M.z+3,.5);for(const sx of[-1,1])for(const sz of[-1,1])bk(cyl(.14,.14,3,8),MAT.pillar,L(sx*1.6,0,sz*1.6));bk(cyl(2.4,2.4,.3,8),MAT.stoneL,L(0,-.1,0));bk(new THREE.ConeGeometry(3,1.6,8).translate(0,.8,0),MAT.roofBlue,L(0,3,0));addCol({x:M.x+5,z:M.z+3,r:2.2})}
  {const cx=M.x-3,cz=M.z-2,ch=new THREE.Group(),cb=new THREE.Mesh(new THREE.BoxGeometry(1.2,.7,.8),MAT.maroon);cb.position.y=.35;const lid=new THREE.Group(),lm=new THREE.Mesh(new THREE.BoxGeometry(1.24,.25,.84),MAT.gold);lm.position.set(0,.12,.42);lid.add(lm);lid.position.set(0,.7,-.42);
    const gl=new THREE.Mesh(new THREE.OctahedronGeometry(.32,0),MAT.crystal);gl.position.y=1.5;ch.add(cb,lid,gl);ch.position.set(cx,H(cx,cz),cz);ch.traverse(o=>{if(o.isMesh)o.castShadow=true});scene.add(ch);addCol({x:cx,z:cz,r:.8});CH2OBJ.chest={obj:ch,lid,glow:gl,x:cx,z:cz}}
  {const Z=ZONES.market,fx=Z.x+1,fz=Z.z-4,y=H(fx,fz),g=new THREE.Group();const body=new THREE.Mesh(new THREE.CylinderGeometry(.75,.9,1.2,12),MAT.gold);body.position.y=1.1;const lid2=new THREE.Mesh(new THREE.ConeGeometry(.8,.6,12),MAT.gold);lid2.position.y=2;
    for(let i=0;i<3;i++){const lg=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,.6,6),MAT.dark),a=i/3*6.28;lg.position.set(Math.cos(a)*.6,.3,Math.sin(a)*.6);g.add(lg)}
    const fire=new THREE.Mesh(new THREE.ConeGeometry(.4,.6,8,1,true),MAT.flame2);fire.position.y=.45;g.add(body,lid2,fire);g.position.set(fx,y,fz);g.traverse(o=>{if(o.isMesh&&o!==fire)o.castShadow=true});scene.add(g);addCol({x:fx,z:fz,r:1});CH2OBJ.furnace={x:fx,z:fz,obj:g,fire}}
  if(REGD.float)for(let i=0;i<7;i++){const g=new THREE.Group(),wm=new THREE.MeshStandardMaterial({color:'#ffffff',side:THREE.DoubleSide,roughness:.7});const b=new THREE.Mesh(new THREE.CapsuleGeometry(.18,.9,4,8),wm);b.rotation.x=Math.PI/2;
    const nk=new THREE.Mesh(new THREE.CylinderGeometry(.04,.05,.7,5),wm);nk.position.set(0,.2,.7);nk.rotation.x=.6;const hd=new THREE.Mesh(new THREE.SphereGeometry(.09,8,6),MAT.red);hd.position.set(0,.48,.98);g.add(b,nk,hd);const ws=[];
    for(const s of[-1,1]){const w=new THREE.Mesh(new THREE.PlaneGeometry(1.4,.45).translate(s*.7,0,0),wm);w.rotation.x=-Math.PI/2;const p=new THREE.Group();p.add(w);g.add(p);ws.push(p)}
    scene.add(g);CRANES.push({g,ws,a:Math.random()*6.28,r:30+Math.random()*60,y:top+6+Math.random()*25,sp:(.15+Math.random()*.1)*(Math.random()<.5?1:-1),cx:M.x+(Math.random()-.5)*60,cz:M.z+40+(Math.random()-.5)*80})}
}
/* ---------- 灵脉、峰顶宝箱、上升气流、渡口灵舟、下州的铁塔与集装箱 ---------- */
function mkChest(){const g=new THREE.Group(),cb=new THREE.Mesh(new THREE.BoxGeometry(1,.6,.7),MAT.maroon);cb.position.y=.3;const lid=new THREE.Group(),lm=new THREE.Mesh(new THREE.BoxGeometry(1.04,.22,.74),MAT.gold);lm.position.set(0,.11,.37);lid.add(lm);lid.position.set(0,.6,-.37);
  const glow=new THREE.Mesh(new THREE.OctahedronGeometry(.25,0),MAT.crystal);glow.position.y=1.3;g.add(cb,lid,glow);g.traverse(o=>{if(o.isMesh)o.castShadow=true});return{obj:g,lid,glow}}
const LINGMAI=[],PCHESTS=[],UPDRAFTS=[];
{const lmMat=new THREE.MeshBasicMaterial({color:'#9af0ff',transparent:true,opacity:.3,blending:THREE.AdditiveBlending,depthWrite:false});
  const cand=[[ZONES.forest.x+14,ZONES.forest.z+12],[ZONES.home.x+28,ZONES.home.z-42],[ZONES.mine.x-30,ZONES.mine.z+32],[ZONES.beach.x+32,ZONES.beach.z-34],[ZONES.market.x-30,ZONES.market.z+40]];
  for(const [x,z] of cand){if(LINGMAI.length>=3)break;const y=H(x,z);if(y<1.6||y>18||Math.abs(x-riverX(z))<21||zoneOf(x,z)==='enemy')continue;
    const g=new THREE.Group(),col=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.5,24,16,1,true),lmMat.clone());col.position.y=12;const ring=new THREE.Mesh(new THREE.TorusGeometry(2.3,.12,6,28),MAT.crystal);ring.rotation.x=Math.PI/2;ring.position.y=.15;g.add(col,ring);
    for(let i=0;i<6;i++){const s=new THREE.Mesh(new THREE.OctahedronGeometry(.3,0),MAT.crystal),a=i/6*6.28;s.position.set(Math.cos(a)*2.3,.45,Math.sin(a)*2.3);g.add(s)}g.position.set(x,y,z);scene.add(g);LINGMAI.push({x,z,g,col})}}
{const spl=CH===2?REGD.sp:[0,3];for(const i of spl){const [sx,sz]=SPIRES[i];let bx=sx,bz=sz,bh=-99;for(let k=0;k<80;k++){const x=sx+(srnd()-.5)*14,z=sz+(srnd()-.5)*14,y=H(x,z);if(y>bh){bh=y;bx=x;bz=z}}
    if(bh<12)continue;const c=mkChest();c.obj.position.set(bx,bh,bz);scene.add(c.obj);PCHESTS.push(Object.assign(c,{x:bx,z:bz,open:false}));
    for(let k=0;k<8;k++){const a=srnd()*6.28,ux=sx+Math.cos(a)*20,uz=sz+Math.sin(a)*20;if(H(ux,uz)<1.6||H(ux,uz)>8||Math.abs(ux-riverX(uz))<20)continue;
      const m=new THREE.Mesh(new THREE.CylinderGeometry(3,3,46,16,1,true),new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.1,depthWrite:false,side:THREE.DoubleSide}));m.position.set(ux,H(ux,uz)+23,uz);scene.add(m);UPDRAFTS.push({x:ux,z:uz,y0:H(ux,uz),m});break}}}
if(CH===2){const bt=mkBoat('A');const dx=riverX(ZONES.river.z)-8,dz=ZONES.river.z+3.6;bt.position.set(dx,WATER_Y+.25,dz);scene.add(bt);DECOR_BOATS.push(bt);CH2OBJ.dock={x:dx,z:dz,obj:bt}}
if(REGD.tech){MAT.rust=mat('#9a5a3a');for(let i=0;i<8;i++){const p=scatter(1,(x,z,y)=>y>1.6&&y<12&&!zoneOf(x,z)&&nearRoad(x,z)>5)[0];if(!p)continue;const L=B(p.x,p.z,srnd()*3);for(const sx of[-1,1])for(const sz of[-1,1])bk(box(.15,9,.15),MAT.metal,L(sx*.8,0,sz*.8));for(let k=1;k<5;k++)bk(box(1.8,.08,1.8),MAT.metal,L(0,k*2,0));addCol({x:p.x,z:p.z,r:1.2})}
  for(let i=0;i<14;i++){const p=scatter(1,(x,z,y)=>y>1.6&&y<10&&!zoneOf(x,z)&&nearRoad(x,z)>4)[0];if(!p)continue;bk(box(2.6,1.4,1.2),i%3?MAT.rust:MAT.blue,B(p.x,p.z,srnd()*3)(0,0,0));addCol({x:p.x,z:p.z,r:1.3})}}
/* ---------- 各州专属地貌景物 ---------- */
if(CH===2){const T=REGD.terr,ok=(x,z,y)=>y>1.4&&!zoneOf(x,z)&&nearRoad(x,z)>4.5;
  const emi=(c,k=1)=>mat(c,{emissive:c,emissiveIntensity:k});
  if(T==='plateau'){const wt=mat('#f4f2ec'),rf=mat('#3a6a9a');for(const p of scatter(10,ok)){const L=B(p.x,p.z,srnd()*3),n=3+(srnd()*3|0);for(let k=0;k<n;k++){const w=2.4-k*.42;bk(box(w,1.3,w),wt,L(0,k*1.6,0));bk(new THREE.ConeGeometry(w*.95,.5,4).rotateY(.785).translate(0,.25,0),rf,L(0,k*1.6+1.3,0))}addCol({x:p.x,z:p.z,r:1.4})}
    for(const p of scatter(30,ok))bk(new THREE.DodecahedronGeometry(1.2+srnd(),0),MAT.rock,B(p.x,p.z,srnd()*6)(0,.2,0,0,1,.6,1))}
  if(T==='snow'){const ice=mat('#bfe8ff',{emissive:'#5ab8e8',emissiveIntensity:.35,roughness:.15,metalness:.1,transparent:true,opacity:.85});
    for(const p of scatter(40,ok)){const L=B(p.x,p.z,srnd()*6);const n=2+(srnd()*3|0);for(let k=0;k<n;k++){const h=1.5+srnd()*3.5;bk(new THREE.OctahedronGeometry(.5,0).scale(.6,h,.6).translate(0,h*.4,0),ice,L((srnd()-.5)*1.4,0,(srnd()-.5)*1.4,0,1,1,1,(srnd()-.5)*.6,(srnd()-.5)*.6))}addCol({x:p.x,z:p.z,r:.9})}
    for(const p of scatter(60,ok))bk(new THREE.SphereGeometry(.9+srnd()*.8,8,6).scale(1,.4,1),mat('#ffffff'),B(p.x,p.z)(0,0,0))}
  if(T==='autumn'){const red=MAT.pillar;for(const p of scatter(12,ok)){const L=B(p.x,p.z,srnd()*3);bk(cyl(.2,.2,4.2),red,L(-1.6,0,0));bk(cyl(.2,.2,4.2),red,L(1.6,0,0));bk(box(4.6,.3,.4),red,L(0,3.6,0));bk(box(5.2,.3,.5),MAT.dark,L(0,4.1,0));bk(box(.25,.5,.25),red,L(0,3.9,0));addCol({x:p.x-1.6,z:p.z,r:.3});addCol({x:p.x+1.6,z:p.z,r:.3})}
    for(const p of scatter(4,ok)){const L=B(p.x,p.z,srnd()*3);for(let k=0;k<5;k++){const w=2.2-k*.3;bk(box(w*.8,1.2,w*.8),MAT.wall,L(0,k*1.5,0));bk(new THREE.ConeGeometry(w*1.1,.4,4).rotateY(.785).translate(0,.2,0),MAT.red,L(0,k*1.5+1.2,0))}addCol({x:p.x,z:p.z,r:1.3})}
    for(const p of scatter(50,ok))bk(new THREE.SphereGeometry(.7+srnd()*.6,7,5).scale(1,.55,1),mat(srnd()<.5?'#d86a2a':'#e8b030'),B(p.x,p.z)(0,.2,0))}
  if(T==='desert'){const cac=mat('#5a8a3e');for(const p of scatter(70,ok)){const L=B(p.x,p.z,srnd()*6),h=1.6+srnd()*2.2;bk(cyl(.28,.25,h,8),cac,L(0,0,0));if(srnd()<.8){bk(cyl(.17,.17,.9,7),cac,L(.45,h*.45,0));bk(box(.5,.22,.22),cac,L(.22,h*.45-.1,0))}if(srnd()<.6){bk(cyl(.15,.15,.7,7),cac,L(-.42,h*.6,0));bk(box(.45,.2,.2),cac,L(-.2,h*.6-.1,0))}addCol({x:p.x,z:p.z,r:.4})}
    const sst=mat('#c8885a',{flatShading:true});for(const p of scatter(8,ok)){const L=B(p.x,p.z,srnd()*3);bk(box(1.6,6,1.6),sst,L(-3,0,0));bk(box(1.6,6,1.6),sst,L(3,0,0));bk(box(7.6,1.8,1.8),sst,L(0,6,0));addCol({x:p.x-3,z:p.z,r:1.1});addCol({x:p.x+3,z:p.z,r:1.1})}
    for(const p of scatter(16,ok)){const L=B(p.x,p.z,srnd()*3);bk(cyl(.5,.45,1.5+srnd()*3.5,10),MAT.wall,L(0,0,0,0,1,1,1,(srnd()-.5)*.3,0));addCol({x:p.x,z:p.z,r:.55})}
    for(const p of scatter(18,(x,z,y)=>y>.4&&y<2.2&&Math.abs(x-riverX(z))<26)){const L=B(p.x,p.z,srnd()*6),h=4+srnd()*2;bk(cyl(.16,.12,h,6),MAT.bark,L(0,0,0,0,1,1,1,.15,0));for(let k=0;k<6;k++)bk(box(2.2,.04,.4),MAT.leaf2,L(Math.cos(k)*.9,h,Math.sin(k)*.9,k,1,1,1,0,-.35))}}
  if(T==='volcano'){const obs=mat('#1a1418',{roughness:.2,metalness:.3,flatShading:true}),lav=emi('#ff5010',1.4);
    for(const p of scatter(36,ok)){const L=B(p.x,p.z,srnd()*6),h=3+srnd()*7;bk(new THREE.ConeGeometry(.9+srnd()*.6,h,5).translate(0,h/2,0),obs,L(0,0,0,0,1,1,1,(srnd()-.5)*.3,(srnd()-.5)*.3));addCol({x:p.x,z:p.z,r:.9})}
    for(const p of scatter(40,ok))bk(new THREE.CylinderGeometry(.6+srnd(),.6+srnd(),.06,7),lav,B(p.x,p.z,srnd()*6)(0,.05,0,0,1+srnd()*1.5,1,.4+srnd()*.4));
    const pl=new THREE.PointLight('#ff5a20',30,60,1.6);pl.position.set(65,H(65,-100)+6,-100);scene.add(pl);bk(new THREE.CylinderGeometry(5,5,.3,14),lav,M4(65,H(65,-100)+.5,-100))}
  if(T==='swamp'){const caps=['#ff6aa0','#6ae0ff','#c08aff'];for(const p of scatter(40,ok)){const L=B(p.x,p.z,srnd()*6),h=2+srnd()*4,c=caps[(srnd()*3)|0];bk(cyl(.3,.22,h,8),mat('#e8e0d0'),L(0,0,0));bk(new THREE.SphereGeometry(1.2+h*.25,12,8,0,6.29,0,1.5).translate(0,h,0),emi(c,.7),L(0,0,0));addCol({x:p.x,z:p.z,r:.45})}
    for(const p of scatter(60,(x,z,y)=>y>.1&&y<1.4))bk(new THREE.CylinderGeometry(.5,.5,.03,8),mat('#5a9a3e'),B(p.x,p.z,srnd()*6)(0,.02-H(p.x,p.z)+.02,0));
    for(const p of scatter(40,ok))bk(cyl(.05,.05,1.6,4),mat('#7a8a4a'),B(p.x,p.z)(0,0,0,0,1,1,1,(srnd()-.5)*.4,(srnd()-.5)*.4))}
  if(T==='city'){const cn=mat('#8a8a94',{roughness:.95}),cn2=mat('#5a5a66'),nn=['#ff40d0','#20e0ff','#ffe040'].map(c=>emi(c,1.8)),win=emi('#ffd890',.6);
    for(let gx=-150;gx<=150;gx+=34)for(let gz=-150;gz<=150;gz+=34){const x=gx+(srnd()-.5)*10,z=gz+(srnd()-.5)*10,y=H(x,z);if(!ok(x,z,y)||Math.abs(x-riverX(z))<18||Math.hypot(x,z)>coastR(x,z)-14||srnd()<.25)continue;
      const w=6+srnd()*6,d=6+srnd()*6,h=6+srnd()*26,L=B(x,z,0);bk(box(w,h,d),srnd()<.5?cn:cn2,L(0,0,0));for(let k=3;k<h-1;k+=3.2)if(srnd()<.7)bk(box(w*.7,.6,.05),win,L(0,k,d/2+.03));bk(box(.15,h*.9,.15),nn[(srnd()*3)|0],L(w/2+.08,0,d/2+.08));bk(box(w+.1,.25,.1),nn[(srnd()*3)|0],L(0,h-.5,d/2+.06));
      addCol({x,z,r:Math.max(w,d)*.55})}
    for(const p of scatter(30,ok))bk(box(1+srnd()*2,.5+srnd(),1+srnd()*2),cn2,B(p.x,p.z,srnd()*3)(0,0,0,0,1,1,1,(srnd()-.5)*.4,(srnd()-.5)*.4))}
  if(T==='sky'){const jade=mat('#f6f2e8',{roughness:.3}),gold=MAT.gold;
    for(const p of scatter(26,ok)){const L=B(p.x,p.z,0),h=5+srnd()*5;bk(cyl(.45,.45,h,12),jade,L(0,0,0));bk(cyl(.65,.65,.4,12),gold,L(0,h,0));bk(cyl(.65,.65,.4,12),gold,L(0,0,0));addCol({x:p.x,z:p.z,r:.6})}
    for(const p of scatter(5,ok)){const L=B(p.x,p.z,srnd()*3);bk(box(9,.6,9),jade,L(0,0,0));for(const sx of[-1,1])for(const sz of[-1,1])bk(cyl(.3,.3,4,10),MAT.pillar,L(sx*3.6,.6,sz*3.6));bk(new THREE.ConeGeometry(7,2.6,4).rotateY(.785).translate(0,1.3,0),gold,L(0,4.6,0));addCol({x:p.x,z:p.z,r:4.5})}}
}
/* ---------- 玩家可建造的东西 ---------- */
function mkFire(){const g=new THREE.Group();for(let i=0;i<9;i++){const a=i/9*6.28,s=new THREE.Mesh(new THREE.DodecahedronGeometry(.2,0),MAT.rock2);s.position.set(Math.cos(a)*.6,.1,Math.sin(a)*.6);g.add(s)}
  for(let i=0;i<3;i++){const l=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,1.1,6),MAT.wood);l.rotation.set(0,i*2.1,Math.PI/2-.35);l.position.y=.25;g.add(l)}
  const fl=new THREE.Group();const f1=new THREE.Mesh(new THREE.ConeGeometry(.32,1,8,1,true),MAT.flame2),f2=new THREE.Mesh(new THREE.ConeGeometry(.2,.75,8,1,true),MAT.flame);f1.position.y=.55;f2.position.y=.5;fl.add(f1,f2);g.add(fl);g.userData.flame=fl;
  g.traverse(m=>{if(m.isMesh&&m.material!==MAT.flame&&m.material!==MAT.flame2){m.castShadow=true;m.receiveShadow=true}});return g}
function mkShelter(){const g=new THREE.Group();for(const s of[-1,1]){const side=new THREE.Group();for(let i=0;i<7;i++){const l=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,3.2,6),MAT.wood);l.position.set(-1.5+i*.5,0,0);l.rotation.x=Math.PI/2;side.add(l)}
    const lf=new THREE.Mesh(new THREE.BoxGeometry(3.6,.12,3.3),MAT.leaf2);lf.position.y=.12;side.add(lf);side.rotation.x=s*.62;side.position.set(0,1.25,s*.75);g.add(side)}
  const bed=new THREE.Mesh(new THREE.BoxGeometry(1.2,.2,2.2),MAT.straw);bed.position.y=.1;bed.rotation.y=Math.PI/2;g.add(bed);g.traverse(m=>{if(m.isMesh){m.castShadow=m.receiveShadow=true}});return g}
function mkFarm(){const g=new THREE.Group();const s=new THREE.Mesh(new THREE.BoxGeometry(2.6,.25,2.6),MAT.soil);s.position.y=.08;g.add(s);
  for(const sx of[-1,1])for(const sz of[-1,1]){const b=new THREE.Mesh(new THREE.BoxGeometry(2.8,.18,.12),MAT.wood);b.position.set(0,.18,sz*1.35);if(sx<0)g.add(b);const c=new THREE.Mesh(new THREE.BoxGeometry(.12,.18,2.8),MAT.wood);c.position.set(sx*1.35,.18,0);if(sz<0)g.add(c)}
  const crops=new THREE.Group();for(let i=0;i<9;i++){const c=new THREE.Group(),st=new THREE.Mesh(new THREE.ConeGeometry(.12,.7,6),MAT.sprout),ear=new THREE.Mesh(new THREE.SphereGeometry(.12,8,6),MAT.ripe);st.position.y=.35;ear.position.y=.7;ear.scale.y=1.6;c.add(st,ear);c.position.set((i%3-1)*.75,.2,(Math.floor(i/3)-1)*.75);crops.add(c)}
  g.add(crops);g.userData.crops=crops;g.traverse(m=>{if(m.isMesh){m.castShadow=m.receiveShadow=true}});return g}
function mkBoat(f){const g=new THREE.Group();const hull=new THREE.Mesh(new THREE.SphereGeometry(1,20,12,0,Math.PI*2,Math.PI/2,Math.PI/2),MAT.wood);hull.scale.set(1.7,1.1,5);g.add(hull);
  const deck=new THREE.Mesh(new THREE.BoxGeometry(3.2,.15,9),MAT.plank);deck.position.y=-.05;g.add(deck);const mast=new THREE.Mesh(new THREE.CylinderGeometry(.1,.12,7,8),MAT.wood);mast.position.y=3.4;g.add(mast);
  const sail=new THREE.Mesh(new THREE.PlaneGeometry(3.6,4.6,6,6),new THREE.MeshStandardMaterial({color:'#f6f1e6',side:THREE.DoubleSide,roughness:.8}));sail.position.set(0,4,.15);g.add(sail);
  const em=new THREE.Mesh(new THREE.CircleGeometry(.7,24),f==='A'?MAT.blue:MAT.red);em.position.set(0,4.2,.18);g.add(em);const em2=em.clone();em2.position.z=.12;em2.rotation.y=Math.PI;g.add(em2);
  g.userData.sail=sail;g.traverse(m=>{if(m.isMesh){m.castShadow=m.receiveShadow=true}});return g}

/* ---------- 短草（随玩家移动的实例化草丛，风吹摆动） ---------- */
const GR_N=Q.min?0:Q.low?2500:6000,GR_R=26;
const bladeGeo=(()=>{const g=new THREE.BufferGeometry(),w=.045,h=.26;const v=[-w,0,0,w,0,0,0,h,0, 0,0,-w,0,0,w,0,h,0];const c=[];const base=new THREE.Color('#5f9e3e'),tip=new THREE.Color('#8fc25e');
  for(let i=0;i<6;i++){const t=i%3===2?tip:base;c.push(t.r,t.g,t.b)}g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));g.setAttribute('normal',new THREE.Float32BufferAttribute([0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0],3));return g})();
const grassMat=new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:.9,color:CH===2&&REGD.grass||'#ffffff'});
const GU={uTime:{value:0}};
grassMat.onBeforeCompile=sh=>{sh.uniforms.uTime=GU.uTime;sh.vertexShader='uniform float uTime;\n'+sh.vertexShader.replace('#include <begin_vertex>',
  '#include <begin_vertex>\nvec3 ip=vec3(instanceMatrix[3][0],0.,instanceMatrix[3][2]);float k=position.y/.26;transformed.x+=sin(uTime*2.+ip.x*.5+ip.z*.3)*.06*k;transformed.z+=cos(uTime*1.6+ip.z*.4)*.04*k;');sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_begin>','#include <normal_fragment_begin>\nnormal=normalize(vNormal);')};
const grass=new THREE.InstancedMesh(bladeGeo,grassMat,GR_N);grass.receiveShadow=true;scene.add(grass);if(CH===2&&REGD.noGrass)grass.visible=false;let grassC=null;
function refreshGrass(px,pz){grassC={x:px,z:pz};let n=0;for(let i=0;i<GR_N*3&&n<GR_N;i++){const x=px+(Math.random()*2-1)*GR_R,z=pz+(Math.random()*2-1)*GR_R,y=H(x,z);
  if(y<1.5||y>13)continue;const zn=zoneOf(x,z);if(zn==='market'||zn==='home'||zn==='enemy')continue;if(nearRoad(x,z)<2.5)continue;
  _m.compose(_v.set(x,y,z),_q.setFromEuler(_e.set(0,Math.random()*3,0)),_s.setScalar(.7+Math.random()*.6));grass.setMatrixAt(n++,_m)}
  grass.count=n;grass.instanceMatrix.needsUpdate=true;refreshFlowers(px,pz)}

/* ---------- 野花（跟着玩家刷新，颜色随机） ---------- */
const FL_N=Q.min?0:Q.low?250:600;const flowers=new THREE.InstancedMesh(merged([[new THREE.CylinderGeometry(.008,.01,.22,4),M4(0,.11)],[new THREE.IcosahedronGeometry(.055,0),M4(0,.23,0,0,1,.55,1)]]),new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.7}),FL_N);flowers.castShadow=false;scene.add(flowers);if(CH===2&&REGD.noFlower)flowers.visible=false;
const FL_C=['#ffffff','#ffe04a','#c890ff','#ff8ab8','#7ab4ff','#ffb04a'].map(c=>new THREE.Color(c));
function refreshFlowers(px,pz){let n=0;for(let i=0;i<FL_N*3&&n<FL_N;i++){const x=px+(Math.random()*2-1)*GR_R,z=pz+(Math.random()*2-1)*GR_R,y=H(x,z);if(y<1.6||y>12)continue;const zn=zoneOf(x,z);if(zn==='market'||zn==='enemy'||zn==='home')continue;if(nearRoad(x,z)<2.5)continue;
  _m.compose(_v.set(x,y,z),_q.setFromEuler(_e.set(0,Math.random()*3,0)),_s.setScalar(.8+Math.random()*.6));flowers.setMatrixAt(n,_m);flowers.setColorAt(n,FL_C[(Math.random()*FL_C.length)|0]);n++}flowers.count=n;flowers.instanceMatrix.needsUpdate=true;if(flowers.instanceColor)flowers.instanceColor.needsUpdate=true}
/* ---------- 樱花花瓣（约 150 片，随风飘落；下雨时停止） ---------- */
const FXK=CH===2?REGD.fx:'petal';
const FXS={petal:['#ffc2d4','#5a2a34',.25,.09,.06,'fall',150],wisp:['#ffffff','#ffffff',.6,.07,.07,'hover',120],snow:['#ffffff','#e0f0ff',.5,.06,.06,'snow',420],leaf:['#e87a2a','#6a2a10',.3,.13,.09,'fall',180],
  dust:['#e8d0a0','#5a4a30',.3,.05,.05,'wind',260],ash:['#ff8a30','#ff4010',1.4,.05,.05,'rise',220],firefly:['#d0ff80','#a0ff40',2,.05,.05,'hover',90],neon:['#ff40d0','#20e0ff',1.6,.05,.05,'hover',140],gold:['#ffe080','#ffc040',1.2,.06,.06,'rise',160]}[FXK];
const PET_N=Q.min?0:FXS[6];const petals=new THREE.InstancedMesh(new THREE.PlaneGeometry(FXS[3],FXS[4]),new THREE.MeshStandardMaterial({color:FXS[0],side:THREE.DoubleSide,roughness:.6,emissive:FXS[1],emissiveIntensity:FXS[2]}),PET_N);petals.frustumCulled=false;
if(FXK==='neon'){const cc=new THREE.Color();for(let i=0;i<PET_N;i++){petals.setColorAt(i,cc.set(i%2?'#ff40d0':'#20e0ff'))}}
scene.add(petals);const petalS=Array.from({length:PET_N},()=>({x:rnd(-14,14),y:rnd(0,9),z:rnd(-14,14),vx:rnd(-.3,.3),vy:rnd(.4,.9),ph:rnd(0,6),r:rnd(0,6)}));
/* ---------- 雨 ---------- */
const RAIN_N=Q.min?250:Q.low?500:1100;const rainGeo=new THREE.BufferGeometry();rainGeo.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(RAIN_N*6),3));
const rain=new THREE.LineSegments(rainGeo,new THREE.LineBasicMaterial({color:'#cfe0ea',transparent:true,opacity:.55}));rain.frustumCulled=false;scene.add(rain);
const rainS=Array.from({length:RAIN_N},()=>[rnd(-25,25),rnd(0,22),rnd(-25,25)]);
