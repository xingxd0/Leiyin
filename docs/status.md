# 当前状态与规划

更新日期：2026-10-27。

## 当前实现

- Identity：真实英文身份信息、ISTJ 标签、八段命令叙事（含 focus）、流式跟随、手动上翻暂停、减少动态效果、单次无障碍状态公告；无 Replay / Skip intro 按钮。
- Todolist：四方向英文内容，待办优先；完成项 100%，未完成项保留用户提供的明确进度、状态、阶段、下一步及 Why 说明。
- 底部搜索与筛选固定；分组默认显示前四项，支持 Show more。`/xd` 命令新增任务仅保存在当前浏览器，不自动同步 GitHub。
- 奖项按赛事合并，标题无年份，红色数量气泡，作品行含年份与名称，链接待补充。
- 当前奖项记录：Red Dot ×2（2026 Tmates、2025 SoulNest）；iF ×2（2026 Semi Design System、TikTok Customer Service Platform）；A' ×1（2026 CollabAgents）；MUSE ×1（2025 SoulNest）；London ×1（2025 CollabAgents）；NY ×1（2025 SoulNest）。共 8 项。
- Logo 原图：`logo/if.png`、`reddot.png`、`adesign.png`、`muse.png`、`london.png`、`ny.png`。
- 第三个 Tab 已由用户改名 Workshop / Work & Experiments，路由仍为 `#/capabilities`，当前内容仍是能力维度页；第四个 Tab 仍未定义。
- 深色冷炭灰与绿色 UI，乌鸦保持原色。84 姿态素材为用户授权暂用，不代表最终绘制质量验收。

## 讨论中的方向，尚未实施

第三个 Tab 可改为 Portfolio / Selected Work：以作品证明能力，展示项目、角色、关键判断与公开成果。需要用户补充封面、角色、案例文本、公开范围与链接。

第四个 Tab 可做 Playground：真实交互实验、AI 产品观察、个人研究或兴趣内容。汉字乌鸦与本站构建记录可作为首批素材；不填虚构兴趣，不复制参考站的整套桌面。

完整案例与实验内容仍是建议。本次结构整理保留用户在 GitHub 上的 Workshop 改名，不另改路由或生成作品集页面。

## 工作区文档与历史文件

- 当前维护入口：项目根 `README.md` 与 `docs/`。
- 上层 `personal-terminal-handoff.md`：保留早期历史，但顶部指向新文档；后续承接以新文档及源码为准。
- 上层 `leiyin-parked-ideas.md`：历史备用灵感，未启用，不参与当前设计。
- `crow-*`：绘制研究与验收过程，不是网站模块目录；未经用户授权不移动或替换。
- 上层作品集评估、训练资料及其他项目：独立工作区内容，不混入公开网站或维护文档。
- `becoming.js`、`becoming.css`、`personal.*`、`journey.*`、`bird-demo.*` 等未接入当前入口的本地实验：保留原位置，当前未删除、未迁移、未提交。

## 验证与发布边界

本次整合以用户远程提交 `125513e` 为内容基线，合入本地结构与设计系统整理提交 `869a6ec`。Identity 与 Todolist 的三个内容/交互脚本保留远程版本，不用旧本地文案覆盖。最终发布提交与部署状态以 Git 历史及 GitHub Actions 为准。

历史浏览器验证不是未来改动的验收。上线状态需单独核实；截图工具不可用时不能声称完成视觉验收。后续工作须记录实际执行的检查及未检查范围。

合并前结构整理检查：`node scripts/check-site.mjs` 通过，当时为 34 条 task、8 项获奖；`git diff --check` 通过。Chrome 检查通过登录、四个 Tab、旧路由归一化、前进后退与能力维度状态、Todolist 搜索、减少动态效果完整七段及 390px 页面无横向溢出。此记录不代表合并后新版验收。

组件与色彩整理：新增 `design-tokens.css` 与 `ui-components.css`，当前模块调色板改为共享引用；控件 6px、卡片 9px、面板/弹窗 12px 圆角，Logo 规格和原色保留；新版底部命令框保留 9px 圆角。检查工具覆盖加载顺序与当前样式禁止直接写入十六进制调色值。合并前 Chrome 验证通过跨页面强调色替换、圆角、Logo 加载与尺寸及四个 Tab 390px 无横向溢出，未做截图级验收。

合并后本地验收：静态检查通过（24 个资源、33 条任务、8 项获奖），`git diff --check` 通过。Chrome 验证通过八段 Identity 常规动画完成与 reduced-motion、ISTJ/Workshop、新版进度、待办优先、Show more、搜索、完成项筛选、详情关闭焦点恢复、固定底部控件、`/xd` 新增任务与刷新保留、登录、历史返回、旧路由归一化、快速切页过期导入保护、共享强调色替换、Logo 原图加载及 30/24/6 规格、四个 Tab 390px 无页面横向溢出；未发现 pageerror。测试自定义任务仅写入临时浏览器上下文，没有修改仓库数据。未重新测量逐段毫秒时序、手动阅读跟随、所有外链或截图级视觉效果；线上部署需另行确认。
