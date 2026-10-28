# 网站结构

维护基线：2026-10-27。以当前源码为准，不以历史聊天中的验证结论代替本次验证。

## 路由与职责

| 路由 | 内部 key | 当前页面 | 实现 |
| --- | --- | --- | --- |
| `#/idt` | `identity` | IDentity / 身份认证终端 | `identity-terminal.js` |
| `#/tdl` | `todo` | Todolist / 四方向待办看板 | `growth-roadmap-view.js` |
| `#/tdl-lab` | `todoLab` | Todolist Lab / 访客阅读型个人进展报 | `modules/todolist-journal.js` + `todolist-lab.css` |
| `#/map` | `map` | Map / 可拖拽六边形地图 | `modules/map.js` |
| `#/pgd` | `playground` | Playground / 可交互留言墙 | `modules/playground.js` |

无 hash 进入登录过场，成功后进入 `#/idt`。未知或旧路由统一替换为 `#/idt`，不保留旧路由别名。直接进入四条有效路由中的任意一条不会播放登录。

路由配置集中在 `site-config.js`。内部 key 同时关联 HTML 的 `nav-*` / `data-view`、工作区状态和 Identity 的导航命令。

## 执行关系

```text
index.html -> becoming.html
                  |
                  +-- ui-input.js（defer，提供共享底部输入组件）
                  +-- identity-terminal.js（defer，提供终端工厂）
                  +-- site-config.js（defer，提供配置）
                  +-- framework.js（defer，启动路由与框架）
                            |
                            +-- Identity -> createIdentityTerminal()
                            +-- Todolist -> 动态 import growth-roadmap-view.js
                            +-- Todolist Lab -> 动态 import modules/todolist-journal.js
                            |                    -> 共享 growth-roadmap.js，独立阅读布局
                            +-- map -> 动态 import modules/map.js
                            +-- playground -> 动态 import modules/playground.js
                            +-- 登录 / Identity -> import terminal-crow.js
                                                   -> JSON 与字体资产
```

顶层 defer 脚本顺序是依赖契约，不是 ES module。不要直接把其中一个改为 `type="module"`，否则共享声明不可见。

`ui-input.js` 必须先于 Identity 和公共框架加载。它在 `globalThis.siteUI` 提供 `createTerminalInput()`，供 Identity 与动态加载的 Todolist 共用；输入 DOM 和状态由组件管理，各页只接入自己的命令逻辑，样式统一在 `ui-components.css`。

## 模块接口

- Identity：`createIdentityTerminal(host, {navigate, reducedMotion, timing})`，返回 `destroy()`。切页必须取消异步流程、滚动、观察器和事件。
- Todolist：`renderRoadmap(host)`，自身负责看板、底部搜索/命令、筛选、Show more 和详情弹窗；模块级筛选与展开状态在同一会话保留。自定义任务存于当前浏览器 localStorage，不同步到仓库。
- Todolist Lab：`renderPage(host)`，返回 `{destroy()}`。面向访客的报纸布局，共享原始记录；正文单一滚动、四栏目纵向阅读、成果作品直接显示、阶段与下一步原位展开。搜索覆盖全文并展开注记，不更改原版看板。读取并去重当前浏览器的本地新增记录；维护入口指向原版，不提供公开发布能力。
- Map 与 Playground：ES module，导出 `renderPage(host)`，只更新给定容器，不能自动启动登录或重写导航。
- 两个模块都返回 `{destroy()}`，在切页或登录时由公共框架断开观察器、请求和事件。
- Map 使用六边形坐标与连接性约束，背景平移、滚轮缩放和贴片位置分别管理，位置保存在当前浏览器。
- Playground 沿用现有留言 API 和审核机制，前台产品名称不再使用 Guestbook；留言、贴纸翻面、拖拽和缩放都在 Playground 内完成。
- 公共框架以 `renderRequest` 拒绝过期动态导入结果；进入登录也会使旧请求失效。

## 样式顺序

加载顺序：`framework.css` → `terminal-crow.css` → `terminal-theme.css` → `design-tokens.css` → `terminal-dashboard.css` → `identity-terminal.css` → `growth-roadmap.css` → `todolist-lab.css` → Map / Playground 模块样式 → `ui-components.css`。

公共主题值在 `design-tokens.css`，共享组件规则在 `ui-components.css`。`terminal-dashboard.css` 保留公共布局；详细颜色、尺寸和更新规则见 [组件与色彩](design-system.md)。

Identity 使用 `.identity-shell` 等局部类；Todolist 使用 `.roadmap-workspace` 范围。新模块应使用自己的根类限定样式，避免覆盖全站 `button`、`h1` 或 `:root`。基础布局和主题暂时保留现有层叠，不在此次整理中合并重写。

Lab 使用 `.todolist-lab-workspace` 和 `.journal-*`，不挂载 `.roadmap-workspace`。报纸感来自衬线标题、分栏、细线与留白，不使用暖白纸面；`design-tokens.css` 的 `--journal-*` 复用全站冷炭灰、灰白文字与绿色强调令牌，控件和滚动条同样保持深色。主题修改会同时作用于 Lab，避免产生独立配色体系。

## 资产与本地边界

`logo/` 保存原始奖项图片，不使用手绘替代。统一容器 30×30px、圆角 6px、图案 24×24px，尺寸令牌在 `design-tokens.css`；看板局部变量仅作为别名引用。

乌鸦资产保持现有根路径：84 姿态复用、24 fps 逻辑时间、30 秒循环；真实 HTML 字符绘制。`terminal-crow-manifest.json` 记录来源，字体许可随资产保留。

未迁移现有稳定文件到新目录，以免大范围改路径、缓存和素材来源。当前整理方式是独立配置、独立新模块及清楚的职责索引；不是完成了全站 ES module 重构。
