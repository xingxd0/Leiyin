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
| 筛选、维度按钮、CTA | `--radius-control:6px` | 间距、行为、文案 |
| 底部终端输入框 | 最小高度 64px、`--radius-card:9px`、桌面内边距 16px 18px | 提示词、输入类型、命令行为 |
| 内容面板/弹窗 | `--radius-panel:12px` | 内容与自适应尺寸 |
| 小标签/图标按钮 | `--radius-sm:4px` | 局部显示 |
| 奖项数量气泡 | `--radius-pill:999px` | 数量 |
| Logo | `--size-logo:30px`、`--size-logo-art:24px`、控件圆角 | 图片源与品牌底色 |
| 弹窗关闭按钮 | `--size-icon-button:36px` | 关闭行为与焦点恢复 |
| Identity 阅读宽度 | `--width-reading:1200px` | 手机排版 |

Identity 与 Todolist 的底部输入框共用 `ui-input.js` 的 `globalThis.siteUI.createTerminalInput(options)` 和 `ui-components.css` 的 `.terminal-input-*`，以 Todolist 为视觉基准。统一等宽字体 13px/1.8、绿色提示词与光标、回车提交图标、外框焦点及 safe-area 底部留白；窄容器内换行且输入字号 16px，避免手机聚焦缩放。ISTJ 标签与命令提交按钮引用 `--radius-sm`。

工厂返回 `{form,input,syncValue}`。参数包含 `prompt`、`placeholder`、`label`、`submitLabel`、可选 `type/id/value/className`。页面负责 `input.oninput` 和 `form.onsubmit` 的业务逻辑；通过代码清空或设置输入值后调用 `syncValue()` 更新光标状态。组件阻止表单默认导航及中文输入法组字中的提交；不挂全局事件或计时器，随页面 DOM 销毁。

Identity 保留个人信息查询、help 与导航；Todolist 保留即时搜索和 `/xd` 本地新增，不共用命令语义。输入与提交按钮分别有可访问名称，装饰提示词和光标为 `aria-hidden`；减少动态效果时关闭光标闪烁。

组件覆盖层针对现有选择器提供共同规则，不要求重建 DOM。新组件优先加入共享规则或使用相同令牌，不复制整块 CSS。不同功能的按钮不强制相同宽高、字体或 padding。

## 状态与无障碍

Workshop 原型使用独立的 `.workshop-*` / `.sticker-*` 组件，不复用终端输入框。点阵画板 `--workshop-board:#121a1c`，纸边 `--workshop-paper:#f7f5ef`，纸上文字 `--workshop-ink:#20252c`；粉色、淡紫、黄绿印刷色统一放在 `--workshop-*` 令牌。贴纸白边 7–8px、初始旋转 -8 至 9 度，选中用绿色轮廓。画板铺满侧栏右侧视口，不设外层圆角或留白，隐藏公共标题栏及页脚；内部标题、工具、画布和操作提示自适应视口高度。演示贴纸只验证风格与交互，不代表真实项目案例。

贴纸为原生按钮，Pointer Events 支持鼠标与触控，方向键移动 10px、Shift 加速至 40px；旋转及重置提供独立按钮。移动受画板边界限制，拖拽不加位移过渡，reduced-motion 关闭悬浮过渡。仅贴纸设置 `touch-action:none`，空白画板可正常滚动。

按钮保持固定命中区域，内部 `.sticker-visual` 独立做 3D 变换，子节点不接收指针事件。精确指针进入停留 650ms 后翻面 180 度，离开缓冲 180ms，视觉过渡 450ms；鼠标位置驱动 X 轴最大 10 度、Y 轴最大 12 度倾斜。拖拽时取消悬浮计时、恢复正面，移动超过 6px 后视为拖动，不打开详情。切页清理计时器。点击或 Enter/Space 打开原生详情 dialog，Escape、关闭按钮和遮罩点击可关闭，焦点返回贴纸。手机直接点击查看详情，画板在右侧容器内纵向滚动。减少动态效果时关闭倾斜与翻转过渡。

`play` 演示贴纸通过 `effect:'rainbow'` 启用彩虹反光，正反面共用 `.sticker-rainbow-foil`；未悬浮时以 7 秒交替循环自动反光，悬浮后由 `--foil-x/y` 驱动色带与高光。覆盖层不接收指针事件，reduced-motion 使用静态效果。实现为独立 CSS 渐变与 soft-light 混合，未复制 pokemon-cards-css 的代码或资产。

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
