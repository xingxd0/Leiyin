# Always Becoming

对外个人终端网站。当前实际入口是 `becoming.html`，不是 `becoming.js`。

## 快速开始

在本目录运行：

```sh
python3 -m http.server 4174
```

打开 `http://127.0.0.1:4174/becoming.html`。没有 hash 时进入登录过场。

结构与内容检查：

```sh
node scripts/check-site.mjs
git diff --check
```

这是原生 HTML / CSS / JavaScript 项目，无打包或安装依赖要求。结构检查不代替浏览器验证。

## 文档入口

- [网站结构](docs/architecture.md)：入口、路由、依赖、样式与模块职责。
- [更新指南](docs/updating.md)：修改内容、Logo、时序、新模块以及发布流程。
- [当前状态与规划](docs/status.md)：已经实现的内容、未来 Tab 规划和公开边界。
- [组件与色彩](docs/design-system.md)：主题令牌、共享组件、交互状态与批量替换规则。

## 目录约定

```text
becoming.html              页面骨架与资源加载
index.html                 首页跳转
site-config.js             Tab 名称、路由、别名、模块路径
framework.js               路由、登录、公共框架与动画生命周期
identity-terminal.*        Identity 内容与交互
growth-roadmap.js          Todolist 数据
growth-roadmap-view.js      Todolist 渲染与交互
growth-roadmap.css          Todolist 局部样式
todolist-lab.css            Todolist Lab 报纸排版的隔离样式
modules/todolist-journal.js Todolist Lab 独立渲染，共享原始记录
modules/                   Lab、Map 与 Playground 的独立渲染
logo/                      奖项原图
terminal-crow.*             共享汉字动画、数据与字体许可
framework.css              基础布局
terminal-theme.css         基础终端主题
terminal-dashboard.css     当前公共主题
design-tokens.css          当前主题与组件尺寸令牌
ui-components.css          共享组件与交互状态
docs/                      当前维护文档
scripts/                   本地检查工具，不参与页面执行
.github/workflows/         GitHub Pages 发布
```

未列出的旧实验文件不属于当前入口依赖，不自动删除或移动。工作区上层的乌鸦绘制、作品集评估、其他项目和另一 Git 工作树也不属于本次网站模块。

当前本地分支跟踪 `origin/main`。仅在用户明确授权时提交、推送；不要把无关实验文件一起提交。
