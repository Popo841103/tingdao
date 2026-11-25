# 3D 模型替换说明（给接手的 AI / 开发者）

本文件说明怎么把混元 3D（或 Tripo 等）生成的模型换进《听道 · 灵河求生》。**开工前先 `git pull` 拿到最新的 `main`。**

## 0. 必须遵守

- **不要直接改根目录的 `index.html`**，它是生成出来的。改 `src/*.js` 或 `src/shell.html`，然后运行：
  ```bash
  python3 src/build.py
  ```
- 本地测试必须起服务器（直接双击 `index.html` 加载不了模型文件）：
  ```bash
  python3 -m http.server 8000
  ```
  然后打开 http://localhost:8000
- 贴图**只用 JPG / PNG**。之前转成 WebP 后，用户的手机上人物显示不出来，已经撤回。
- 推到 `main` 后，GitHub Pages 会自动更新网站。

## 1. 面数与体积预算（手机要流畅）

| 类型 | 三角面上限 | 贴图 | 单个 .glb |
|---|---|---|---|
| 主角 | 约 25,000 | 1024×1024 | 3MB 以内 |
| 敌人 / NPC | 约 15,000 | 1024×1024 | 2MB 以内 |
| 动物 | 约 8,000 | 512–1024 | 1MB 以内 |
| 道具、建筑 | 约 3,000 | 512 | 0.5MB 以内 |

混元导出的「高模」常常有 100–200 万面，**必须先减面**。现在的主角 `heroA.glb` 只有约 1.2 万面。

## 2. 减面与压贴图（已验证可用）

用 gltf-transform（npm 包 `@gltf-transform/cli`，已测 4.1.1 版）：

```bash
npx @gltf-transform/cli@4.1.1 weld 原始.glb tmp1.glb
npx @gltf-transform/cli@4.1.1 simplify tmp1.glb tmp2.glb --ratio 0.0125 --error 0.01
npx @gltf-transform/cli@4.1.1 resize tmp2.glb 输出.glb --width 1024 --height 1024
npx @gltf-transform/cli@4.1.1 inspect 输出.glb
```

- `--ratio` 是保留比例：200 万面 × 0.0125 ≈ 2.5 万面。用 `inspect` 看 MESHES 一栏的 glPrimitives（三角面数），不够就调 ratio 再跑。
- 减面达不到目标时，把 `--error` 调大（如 0.02、0.05），代价是细节变少。
- **不要**加 `--texture-compress webp`，原因见上面第 0 节。

### 混元高模的实际处理经验（2026-11 第一批模型）
- 混元模型贴图接缝极多，普通 `simplify` 只能降到 6–8 万面。第一批是用 meshoptimizer 1.3 的
  `simplifyWithAttributes(... ['Permissive'])`（允许跨 UV 接缝减面，UV 权重 0.5）降到目标面数的，贴图效果良好。
- 混元自带 3 张 4096 PNG（颜色 / 金属粗糙度 / 法线），已去掉金属粗糙度贴图，其余压成 1024 JPG。
- 动物模型要预先：缩放到真实高度（鹿 1.6、兔 0.6）、脚底贴 y=0、头朝 +Z，并把节点变换**烘焙进顶点**，
  让网格直接挂在场景根下（`grokBeast()` 只认根下的网格，多套一层节点会导致不显示）。
- 自动绑骨已支持「双手下垂」的站姿，以及 gltf-transform 输出的「交错顶点」格式（以前会让人物变成一团尖刺）。

## 3. 各类模型放哪里、怎么接进游戏

所有模型都放在 `assets/models/`。

### 主角（最简单，只换文件）
- 修士：`assets/models/heroA.glb`
- 穿越者：`assets/models/heroB.glb`
- 直接覆盖同名文件即可，代码在 `src/p4_game.js` 的 `builtinHero()` 里按文件名加载。
- 模型**不需要骨骼**。没有骨骼的静态人物，游戏会自动绑 14 根骨骼，并用程序动画驱动走、跑、跳、攻击（见 `src/p3_actors.js` 的自动绑骨代码）。T 字或 A 字姿势效果最好；双手下垂也能用。
- 模型手里**不要拿武器**：游戏会把当前装备的武器挂到手上，自带的武器会变成「两把」。
- 用户也可以在游戏「设置 → 选择 .glb 文件」里临时换主角，用来快速预览效果（只存在那台设备上）。

### 敌兵、首领、狼、野猪、游魂
- 文件：`assets/models/` 下的 `boy.glb`、`xianxia.glb`（两阵营的敌兵）、`viking.glb`（首领）、`wolf.glb`、`boar.glb`、`youhun.glb`
- 列表在 `src/p3_actors.js` 的 `GROK_KEYS`，游戏开始时一起加载。
- 人形敌人用 `grokHuman()`，规则同主角。
- **动物要注意**：`grokBeast()` 靠网格名字找腿（名字以 `Leg`、`Hoof` 开头的网格）来做走路动画。混元导出的通常是一整块网格，没有这些名字，**放进去能显示，但腿不会动**（身体仍会跟着移动、起伏）。可以接受就直接用；想要腿动，需要在 Blender 里把四条腿拆成单独网格并命名为 `Leg1`…`Leg4`。

### 现在还是「方块拼的」、最值得换的
| 对象 | 现在的实现 | 要改的地方 |
|---|---|---|
| ~~鹿、兔、坊市商人~~ | 已换成混元模型（`deer.glb`、`rabbit.glb`、`merchant.glb`） | — |
| 营地帐篷、木箱 | 程序几何体 | 在 `src/p2_world.js` 的营地搭建代码里替换，工作量较大 |

### 新增模型（例如一条龙在天上盘旋）
1. 减面后放进 `assets/models/dragon.glb`
2. 把 `'dragon'` 加进 `GROK_KEYS`
3. 在 `src/p9_more.js` 的 `moreTick()` 里写一个绕圈飞行的更新（用 `GROKM.dragon.scene.clone(true)` 取模型，加进 `scene`），只在第一章（`CH===1`）显示

## 4. 授权

- 自己用混元生成的模型：先确认混元的用户协议是否允许商用。
- 「灵感广场」里别人做的模型：只能用来测试，**收费之前必须确认能否商用**。
- 新素材的来源写进 `素材来源.txt`。

## 5. 测试清单

- [ ] 两个阵营都开一局新游戏，主角、敌人、动物都能显示，没有报错
- [ ] 走、跑、跳、攻击、闪避时模型没有严重变形
- [ ] 手机上帧率没有明显下降（小地图下面有 fps 显示）
- [ ] `python3 src/build.py` 之后再提交，`index.html` 和 `src/` 保持一致
