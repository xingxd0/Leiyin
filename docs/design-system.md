# 组件与色彩维护

## 统一入口

`design-tokens.css` 管理当前主题值，`ui-components.css` 管理跨页面组件规则。模块 CSS 仅保留布局、排版和特定交互，不重复定义当前调色板。

旧 `framework.css` / `terminal-theme.css` 仍保留历史布局与基础回退样式；当前主题令牌在它们之后加载并覆盖历史变量。旧主题不作为当前修改入口，也未在本次整理中全部重写。

## 色彩

| 语义 | 令牌 | 当前值 |
| --- | --- | --- |
| 页面背景 | `--color-bg` | `#0a0d10` |
| 卡片 | `--color-surface` | `#16191f` |
| 悬浮/活动底色 | `--color-surface-active` | `#20252c` |
| 输入与控件底色 | `--color-control` | `#12161c` |
| 标题 | `--color-heading` | `#e2e5e9` |
| 正文 | `--color-text` | `#c3c8d0` |
| 次级文字 | `--color-text-secondary` | `#a0a8b4` |
| 辅助文字 | `--color-text-muted` | `#959da8` |
| 边框 | `--color-border` | `#2b333d` |
| 强调/完成/焦点 | `--color-accent` | `#2dd49b` |
| 选中底色/边框 | `--color-accent-surface` / `--color-accent-border` | `#102d23` / `#24533f` |
| 准备/进行中 | `--color-warning` | `#f4bf36` |
| 审核/确认 | `--color-info` | `#8fbded` |
| 数量气泡 | `--color-danger` | `#c92b38` |

`--bg`、`--ink`、`--accent` 及 `--roadmap-*` 等现有变量是兼容别名，最终引用统一令牌。更换绿色时应同时调整强调、选中底色、边框和强调上的文字，不单独改变一项后就认定对比度通过。

`--brand-*` 是 Logo 底色，原图本身在 `logo/`。`--art-crow-*` 保留乌鸦原色；`--syntax-*` 是 CLI 语法色。它们不会随着 UI 强调色自动改变。

## 组件规则

| 组件 | 共用规格 | 页面负责 |
| --- | --- | --- |
| 导航/任务卡片 | `--radius-card:9px` | 尺寸、内容、布局 |
| 筛选、输入框、维度按钮、CTA | `--radius-control:6px` | 间距、行为、文案 |
| 内容面板/弹窗 | `--radius-panel:12px` | 内容与自适应尺寸 |
| 小标签/图标按钮 | `--radius-sm:4px` | 局部显示 |
| 奖项数量气泡 | `--radius-pill:999px` | 数量 |
| Logo | `--size-logo:30px`、`--size-logo-art:24px`、控件圆角 | 图片源与品牌底色 |
| 弹窗关闭按钮 | `--size-icon-button:36px` | 关闭行为与焦点恢复 |
| Identity 阅读宽度 | `--width-reading:1200px` | 手机排版 |

用户新版 Todolist 底部命令框保留 64px 最小高度与 9px 圆角，圆角引用 `--radius-card`；ISTJ 标签与命令提交按钮引用 `--radius-sm`。这是明确的局部组件差异，不由通用输入框规则覆盖。

组件覆盖层针对现有选择器提供共同规则，不要求重建 DOM。新组件优先加入共享规则或使用相同令牌，不复制整块 CSS。不同功能的按钮不强制相同宽高、字体或 padding。

## 状态与无障碍

- 选中状态沿用 `aria-selected` / `aria-pressed`，统一青绿文字、深绿底色及边框。
- 悬浮态提高背景或边框明度，不使用布局移动。
- 键盘焦点采用 `--focus-width:2px` 强调色轮廓和 `--focus-offset:3px` 外偏移。搜索框在外层画焦点，不重复包围输入文字。
- Disabled 使用 `--opacity-disabled:.5`，需要真实 `disabled` 属性阻止交互；不能只降低透明度。
- UI 过渡统一 `--duration-ui:.2s`；减少动态效果时关闭这些过渡，Identity 动画仍由自己的取消流程处理。
- 状态必须保留文字说明，不能只靠颜色或气泡传达。
- 当前边框用于分区，不作为唯一可操作提示。换主题后重新测文字对比度和焦点可辨性，不把深色主题本身当作 WCAG 证明。

## 批量维护

1. 改 `design-tokens.css` 的主题值或尺寸。
2. 若是共享组件行为/样式，改 `ui-components.css`；模块文件只改必要差异。
3. 运行 `node scripts/check-site.mjs`，再检查四个路由、Logo、状态、键盘焦点、手机及 reduced-motion。
4. 发布时更新入口资源版本参数，确认加载顺序。不能仅依赖 HTML 预览 URL 的参数清 JS/CSS 缓存。

不在此次整理中统一所有字号、间距或移除历史 CSS；这些涉及信息密度与布局变化，应另做页面级调整。
