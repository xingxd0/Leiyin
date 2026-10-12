# Minimalist Designer Portfolio

一个用于个人作品集展示的前端项目，包含：

- 前台展示页：`Home`、`About Work`、作品详情页
- 本地后台：`/admin`，用于维护首页信息、作品列表和详情内容
- 静态发布内容：通过导出 JSON 和本地图库文件进行最终发布
- Vercel 部署：连接 GitHub 仓库后自动构建并发布

## 技术栈

- `React 19`
- `TypeScript`
- `Vite`
- `React Router`
- `Tailwind CSS`

## 本地运行

**前置要求：** `Node.js 20+`

1. 安装依赖

```bash
npm install
```

1. 启动开发环境

```bash
npm run dev
```

1. 打开页面

- 前台首页：`http://localhost:3000/`
- 后台编辑：`http://localhost:3000/admin`

## 内容维护流程

1. 将图片放入 `public/gallery/`
1. 在后台 `/admin` 编辑首页信息、作品列表和文章内容
1. 图片路径填写站点路径，例如：`/gallery/Avatar.png`
1. 后台保存后会先写入本地草稿
1. 导出发布文件后，用导出的 JSON 覆盖 `public/content/portfolio-content.json`
1. 将 `public/content/portfolio-content.json` 和新增图库图片一起提交到 Git

## 目录说明

```text
src/
  app/                    应用入口与布局
  features/frontend/      前台页面与组件
  features/admin/         本地后台页面与组件
  features/portfolio/     作品集内容模型与数据提供层
  shared/                 路由、工具函数、通用配置

public/
  content/                正式发布的静态内容 JSON
  gallery/                本地图库
```

## 构建与预览

```bash
npm run build
npm run preview
```

## 部署说明

- 项目已适配 Vercel 部署，默认根路径为 `'/'`
- 路由已切换为 `BrowserRouter`
- `vercel.json` 已配置 SPA rewrites，支持刷新 `/work`、`/work/:id`、`/admin`
- Vercel 推荐构建配置：
  - Framework Preset: `Vite`
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Install Command: `npm install`

## 发布建议

- 日常编辑在本地 `admin` 完成
- 确认内容无误后导出并覆盖正式 JSON
- 最后执行 `git add`、`git commit`、`git push`


## 拍立得交互 Demo

当前交互版本已同步到 [`public/instant/index.html`](public/instant/index.html)。

- 本地启动现有项目后访问 `http://localhost:3000/instant/index.html`。
- 该页面为自包含 HTML/CSS/JavaScript，Vite 构建时会作为静态文件复制到 `dist/instant/index.html`；也可直接打开 HTML 文件。
- 首页支持首屏拍照、照片逐渐显影、连续移入横向照片列表，以及逆向滚动还原。
- 手机支持纵向滚动和横向手势同步浏览；末尾 More 卡片点击或滑至末尾松手后进入作品 Tab。
- About Me 是独立页面；作品卡片在手机点击、桌面 hover 时显示概要，通过「查看更多」进入详情。
- 原色、暖调、黑白、褪色、冷调五种滤镜作用于首页和首页的作品照片；作品 Tab 和详情保持原色。
- 当前作品为 Demo 示例，尚未完成真机视觉验证。

同步时间：2026-10-12。当前线上交互预览：https://xudong-instant-moments.famousclock5.chatgpt.site
