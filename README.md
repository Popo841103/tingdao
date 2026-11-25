# 听道 · 灵河求生

网页 3D 修仙生存游戏。所有文件（包括 3D 引擎 three.js）都在本仓库里，不依赖外网 CDN。

## 本地运行
浏览器不允许直接双击打开时加载模型文件，需要起一个本地服务器：

```bash
python3 -m http.server 8000
```

然后打开 http://localhost:8000

## 目录
- `index.html` —— 由 `src/build.py` 生成，不要直接改；改 `src/*.js` 和 `src/shell.html` 后运行 `python3 src/build.py`
- `assets/*.js` —— 地形贴图、树、坊市等素材（贴图为 WebP）
- `assets/models/*.glb` —— 主角、敌兵、野兽模型（按需加载，只加载所选阵营的主角）
- `vendor/three/` —— three.js r160（MIT 许可）

## 打包上传 itch.io
```bash
zip -r tingdao-web.zip index.html manifest.json icon-192.png icon-512.png 素材来源.txt assets vendor
```
在 itch.io 新建项目时选 **HTML**，上传这个 zip，勾选「This file will be played in the browser」。

素材来源见「素材来源.txt」。
