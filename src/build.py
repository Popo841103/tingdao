# 生成仓库根目录的 index.html（网页版 / itch.io 版）
# 用法：在 src 目录里运行  python3 build.py
# 大素材在 ../assets/*.js（按顺序用 <script src> 加载），3D 模型在 ../assets/models/*.glb（游戏里按需 fetch），
# three.js 在 ../vendor/three/（不依赖外网 CDN）。
import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
FILES=['p1_core.js','p8_audio.js','p2_world.js','p3_actors.js','p4_game.js','p6_cult.js','p7_guide.js','p9_more.js','p5_ui.js']
ASSETS=['nat_assets.js','mkt_assets.js','fangshi_assets.js','tex_assets.js','gtree_assets.js']
s=open('shell.html',encoding='utf8').read().replace("if(m&&!window.GAME_OK)m.textContent","if(m&&document.getElementById('loading').style.display!=='none')m.textContent")
code="\n".join(open(f,encoding='utf8').read() for f in FILES)
tags="".join('<script src="assets/%s"></script>\n'%a for a in ASSETS)
s=s.replace('<script type="module">',tags+'<script type="module">',1)
open('../index.html','w',encoding='utf8').write(s.replace('/*__CODE__*/',code))
print('wrote ../index.html')
