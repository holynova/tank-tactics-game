# 坦克战术 (Tank Tactics Game)

一个基于 React + Vite 的回合制战术对战游戏，支持双人对战(PvP)和人机对战(PvE)。

## 🎮 游戏特色

- **陆战风云** / **怒海争锋** 两种主题切换
- **集火机制**：2v1 夹击消灭敌方单位
- **保护系统**：友军保护和拥挤保护机制
- **音效系统**：引擎轰鸣、炮火、爆炸等音效
- **精美动画**：旋转、移动、射击、爆炸全程动画

## 🚀 在线体验

访问 GitHub Pages 在线体验：[https://holynova.github.io/tank-tactics-game/](https://holynova.github.io/tank-tactics-game/)

## 💻 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

## 📦 技术栈

- **框架**: React 18
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **包管理**: pnpm

## 🎯 游戏规则

详细规则请在游戏中点击"游戏规则"按钮查看，包含：
- 游戏目标
- 基本规则（移动、旋转、集火）
- 集火机制（2v1夹击）
- 保护机制（友军保护、拥挤保护）
- 策略提示

## 🔧 部署

本项目使用 GitHub Actions 自动部署到 GitHub Pages。

每次推送到 `main` 分支时，会自动触发构建和部署流程。

## 📝 License

MIT
