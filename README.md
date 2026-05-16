# 情侣飞行棋

一个适合双人轮流游玩的纯前端网页小游戏，使用 `Vite + React + TypeScript` 实现，无后端、无数据库、无登录、无统计追踪，适合直接部署到 GitHub Pages。

## 功能概览

- 双人轮流掷骰子，玩家 A 默认先手
- 默认 50 格蛇形棋盘，支持设置 20 到 60 格
- 落点后弹出该格对应的任务卡片，点击完成后切换玩家
- 支持“必须精确到达终点”规则
- 支持任务预览开关
- 支持自定义玩家名称
- 支持任务编辑、恢复默认任务、导入任务 JSON、导出任务 JSON
- 所有任务、设置和游戏进度都保存在浏览器 `localStorage` 中
- 刷新页面后可恢复当前对局
- 提供清空本地数据功能

## 目录结构

```text
couple-board-game/
  package.json
  vite.config.ts
  index.html
  README.md
  src/
    main.tsx
    App.tsx
    data/
      defaultTasks.json
    styles/
      global.css
    components/
      Board.tsx
      Cell.tsx
      Dice.tsx
      TaskModal.tsx
      SettingsPanel.tsx
      TaskEditor.tsx
      VictoryModal.tsx
    hooks/
      useLocalStorage.ts
    utils/
      game.ts
      storage.ts
      tasks.ts
    types/
      game.ts
  .github/
    workflows/
      deploy.yml
```

## 本地运行

```bash
npm install
npm run dev
```

默认本地开发地址通常是：

```bash
http://localhost:5173
```

## 构建与预览

```bash
npm run build
npm run preview
```

## 任务编辑说明

### 1. 直接在页面里编辑

进入页面后点击“任务编辑”，可以：

- 查看当前棋盘长度范围内的所有格子任务
- 分别编辑每一格的玩家 A / 玩家 B 任务
- 点击“保存任务”后写入本地浏览器
- 点击“恢复默认任务”把编辑器内容恢复为默认占位任务

### 2. 编辑默认占位任务文件

默认占位任务在：

- `src/data/defaultTasks.json`

这个文件只用于项目初始默认值。用户后续在浏览器中编辑过的自定义任务，会优先保存在 `localStorage` 中，不会回写到代码文件。

### 3. 导出任务 JSON

在“任务编辑”面板中点击“导出任务 JSON”，会下载一个任务文件，方便备份和迁移到其他浏览器。

### 4. 导入任务 JSON

支持两种方式：

- 上传 `.json` 文件
- 直接粘贴 JSON 内容

支持的 JSON 格式示例：

```json
{
  "tasks": {
    "1": { "A": "任务 1", "B": "任务 2" },
    "2": { "A": "任务 3", "B": "任务 1" }
  }
}
```

也支持直接以格子对象作为根节点：

```json
{
  "1": { "A": "任务 1", "B": "任务 2" },
  "2": { "A": "任务 3", "B": "任务 1" }
}
```

如果导入非法 JSON，界面会显示友好错误提示。

## GitHub Pages 部署

项目已在 `vite.config.ts` 中配置：

```ts
base: './'
```

这种写法适合静态托管和 GitHub Pages，通常不需要再额外改仓库名路径。

### 方式一：使用 gh-pages 包

已配置脚本：

```bash
npm run deploy
```

完整流程：

```bash
npm install
npm run build
npm run deploy
```

如果这是首次部署，请先把项目推到 GitHub 仓库，并确保你有对应仓库的发布权限。

### 方式二：使用 GitHub Actions

项目已提供：

- `.github/workflows/deploy.yml`

使用方法：

1. 把代码推送到 GitHub 的 `main` 分支
2. 在仓库设置中启用 GitHub Pages
3. 将 Pages 的来源设置为 `GitHub Actions`
4. 后续每次 push 到 `main`，都会自动构建并部署

## 常用命令

```bash
npm install
npm run dev
npm run build
npm run deploy
```

## 说明

- 这是一个纯静态前端项目，可直接部署到 GitHub Pages
- 没有任何后端服务、数据库、登录逻辑或第三方统计 SDK
- 所有自定义数据只存储在本地浏览器
