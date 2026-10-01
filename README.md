# 坦克战术 · 赤铁与苍蓝

React + Vite 的 4×4 回合制战术游戏，支持同屏双人对战和人机演练，以及陆战、海战两个战区。

![指挥部首页](docs/screenshots/home-desktop.jpg)

## 美术与声音

- **两支独立军团**：赤铁军团使用圆炮塔重装坦克、木甲板战列舰；苍蓝先锋使用棱角侦察坦克、窄舰体导弹驱逐舰。轮廓、结构和配色均不同。
- **ChatGPT 作图资源**：单位、沙土地形、海面、首页、双方胜利、失败、炮弹、扬尘、炮口闪光、爆炸、水花和尾流均使用生成的 PNG 原稿，运行时使用 WebP。没有 SVG 游戏绘图或 SVG 图标。
- **运动表现**：转向、加减速、四帧履带循环、悬挂颠簸、扬尘；战舰推进带有尾流和轻微舰体运动。
- **战斗表现**：炮管后坐、单位受力反馈、炮口闪光、发光弹道拖尾、局部命中光照、六帧陆地爆炸或水面喷溅。
- **15 种声音样本**：陆海分别有引擎、转向、炮击、爆炸、环境音，另有点击、骰子、回合、胜利和失败。原创分层程序合成采样，提供 Ogg 和 WAV 回退。
- **指挥界面**：首页部署、军团说明、战场日志、战术手册、胜利与失败结算；支持手机和桌面、键盘操作、音量控制与静音。

## 运行

需要 Node.js 与 pnpm。在项目目录执行：

```bash
pnpm install
pnpm dev --host 127.0.0.1
```

访问终端输出的地址，路径为 `/tank-tactics-game/`。

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm preview --host 127.0.0.1
```

`pnpm test` 覆盖移动与保护规则、双轴集火、完整获胜序列，以及静音、主题切换、重置、音频回退和声音并发上限。

## 游戏规则

选择己方单位，移动到上下左右相邻的空格。移动后，如果同一行或列出现连续的「己方、己方、敌方」或反向排列，会触发集火。

四个单位占满同一行／列时触发拥挤保护；敌军的同色邻居也提供保护。敌方剩一个单位或更少时获胜。

**人机演练中你控制蓝方苍蓝先锋，电脑控制红方赤铁军团。** 同屏双人对战由双方轮流操作。掷骰决定先手。

## 资源与维护

| 路径 | 内容 |
|---|---|
| `public/art/` | 18 个正式 WebP 资源，包含单位、动画图集、地形和插画 |
| `source-art/` | ChatGPT 原始 PNG、提示词、归一化报告 |
| `scripts/prepare_art.py` | 统一尺寸、共享缩放、居中锚点、切分并编码图像 |
| `public/audio/` | 浏览器播放的 Ogg 与 WAV 样本 |
| `source-audio/` | 原始 WAV 与响度报告 |
| `scripts/build_audio.py` | 可复现的原创音效合成脚本 |
| `docs/UPGRADE_NOTES.md` | 实施与验证记录 |
| `docs/screenshots/` | 桌面、手机、海战和胜负结算截图 |

重新整理美术需要 Python + Pillow；重新生成声音需要 Python + FFmpeg。这些工具只用于资源制作，玩家运行不需要它们。

```bash
python3 scripts/prepare_art.py
python3 scripts/build_audio.py
```

## 在线项目

[GitHub 仓库](https://github.com/holynova/tank-tactics-game) · [GitHub Pages](https://holynova.github.io/tank-tactics-game/)

推送 `main` 后，GitHub Actions 会构建并部署到上方 GitHub Pages 地址。美术源稿、声音生成脚本和测试随代码一同保存。

## 技术栈与许可

React 18 · TypeScript · Vite · Tailwind CSS · CSS 图集动画 · Web Audio API。项目沿用原仓库的 MIT 许可说明。
