# 网站结构

维护基线：2026-10-27。以当前源码为准，不以历史聊天中的验证结论代替本次验证。

## 路由与职责

| 路由 | 内部 key | 当前页面 | 实现 |
| --- | --- | --- | --- |
| `#/login` | 无 | 自动登录过场 | `framework.js` |
| `#/identity` | `identity` | 八段身份终端 | `identity-terminal.js` |
| `#/todol` | `todo` | 四方向待办看板 | `growth-roadmap-view.js` |
| `#/capabilities` | `model` | Workshop（当前为能力维度内容） | `modules/capabilities.js` |
| `#/pending` | `pending` | 未定义页 | `modules/pending.js` |

`#/roadmap` 是旧链接别名，replace 到 `#/todol`。无 hash 进入登录，未知路由归一化为 Identity。直接进入某个 Tab 不播放登录。

路由配置集中在 `site-config.js`。内部 key 同时关联 HTML 的 `nav-*` / `data-view`，及 Identity 的导航命令；修改 URL 不应顺便修改 key。

## 执行关系

```text
index.html -> becoming.html
                  |
                  +-- identity-terminal.js（defer，提供终端工厂）
                  +-- site-config.js（defer，提供配置）
                  +-- framework.js（defer，启动路由与框架）
                            |
                            +-- Identity -> createIdentityTerminal()
                            +-- Todolist -> 动态 import growth-roadmap-view.js
                            |                    -> import growth-roadmap.js
                            +-- model -> 动态 import modules/capabilities.js
                            +-- pending -> 动态 import modules/pending.js
                            +-- 登录 / Identity -> import terminal-crow.js
                                                   -> JSON 与字体资产
```

顶层 defer 脚本顺序是依赖契约，不是 ES module。不要直接把其中一个改为 `type="module"`，否则共享声明不可见。

## 模块接口

- Identity：`createIdentityTerminal(host, {navigate, reducedMotion, timing})`，返回 `destroy()`。切页必须取消异步流程、滚动、观察器和事件。
- Todolist：`renderRoadmap(host)`，自身负责看板、底部搜索/命令、筛选、Show more 和详情弹窗；模块级筛选与展开状态在同一会话保留。自定义任务存于当前浏览器 localStorage，不同步到仓库。
- 第三、第四个模块：ES module，导出 `renderPage(host)`，只更新给定容器，不能自动启动登录或重写导航。
- 当前第三、第四个模块仅有容器内事件，没有外部观察器或计时器。如未来增加这些资源，须先扩展公共框架接收清理控制器，并在切页时调用 `destroy()`，不能只删除 DOM。
- 公共框架以 `renderRequest` 拒绝过期动态导入结果；进入登录也会使旧请求失效。

## 样式顺序

加载顺序：`framework.css` → `terminal-crow.css` → `terminal-theme.css` → `design-tokens.css` → `terminal-dashboard.css` → `identity-terminal.css` → `growth-roadmap.css` → `ui-components.css`。

公共主题值在 `design-tokens.css`，共享组件规则在 `ui-components.css`。`terminal-dashboard.css` 保留公共布局；详细颜色、尺寸和更新规则见 [组件与色彩](design-system.md)。

Identity 使用 `.identity-shell` 等局部类；Todolist 使用 `.roadmap-workspace` 范围。新模块应使用自己的根类限定样式，避免覆盖全站 `button`、`h1` 或 `:root`。基础布局和主题暂时保留现有层叠，不在此次整理中合并重写。

## 资产与本地边界

`logo/` 保存原始奖项图片，不使用手绘替代。统一容器 30×30px、圆角 6px、图案 24×24px，尺寸令牌在 `design-tokens.css`；看板局部变量仅作为别名引用。

乌鸦资产保持现有根路径：84 姿态复用、24 fps 逻辑时间、30 秒循环；真实 HTML 字符绘制。`terminal-crow-manifest.json` 记录来源，字体许可随资产保留。

未迁移现有稳定文件到新目录，以免大范围改路径、缓存和素材来源。当前整理方式是独立配置、独立新模块及清楚的职责索引；不是完成了全站 ES module 重构。
