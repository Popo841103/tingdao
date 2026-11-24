import base64
FILES=['p1_core.js','nat_assets.js','mkt_assets.js','fangshi_assets.js','tex_assets.js','grok_assets.js','gtree_assets.js','p2_world.js','p3_actors.js','p4_game.js','p6_cult.js','p7_guide.js','p5_ui.js']
s=open('shell.html').read().replace("if(m&&!window.GAME_OK)m.textContent","if(m&&document.getElementById('loading').style.display!=='none')m.textContent")
code="\n".join(open(f).read() for f in FILES)
hero=base64.b64encode(open('/home/claude/hero/xiushi.glb','rb').read()).decode()
open('听道-灵河求生.html','w').write(s.replace('/*__CODE__*/',code).replace('/*__HERO__*/',hero).replace('/*__HEROB__*/',base64.b64encode(open('/home/claude/td5/earth.glb','rb').read()).decode()))
parts=[open(f).read() for f in FILES]
parts[0]="\n".join(l for l in parts[0].split("\n") if not l.startswith("import "))
open('/tmp/chk.mjs','w').write("\n".join(p.strip() for p in parts))
# ---- artifact version: big asset files served as separate scripts ----
ASSETS=['nat_assets.js','mkt_assets.js','fangshi_assets.js','tex_assets.js','grok_assets.js','gtree_assets.js']
import os
os.makedirs('art/assets',exist_ok=True)
for a in ASSETS:open('art/assets/'+a,'w').write(open(a).read())
code2="\n".join(open(f).read() for f in FILES if f not in ASSETS)
tags="".join('<script src="assets/%s"></script>\n'%a for a in ASSETS)
s2=s.replace('<script type="module">',tags+'<script type="module">',1)
open('art/index.html','w').write(s2.replace('/*__CODE__*/',code2).replace('/*__HERO__*/',hero).replace('/*__HEROB__*/',base64.b64encode(open('/home/claude/td5/earth.glb','rb').read()).decode()))
