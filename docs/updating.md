# 模块更新指南

## 修改入口表

| 要改什么 | 主要文件 | 联动检查 |
| --- | --- | --- |
| Tab 名称、URL、说明 | `site-config.js` | HTML 静态导航及深链接 |
| Identity 个人信息 | `identity-terminal.js` 的 `identityStages` | 静态无障碍稿、手动查询、首段换行 |
| Identity 打字与等待 | `identity-terminal.js` 的 `speed` / `pauseAfter` | 六次模块切换及手动滚动 |
| Todolist 内容 | `growth-roadmap.js` | 数量、搜索、筛选、详情 |
| Todolist 卡片和交互 | `growth-roadmap-view.js` | 待办优先、展开、链接、键盘 |
| 奖项图片 | `logo/` + view 的品牌列表 + CSS | 两处用途：获奖记录与评委申请 |
| Workshop 贴纸画板 | `modules/capabilities.js` / `modules/workshop.css` | 拖拽、键盘、旋转、重置、返回状态与边界 |
| 第四个 Tab | `modules/pending.js` | 保持未定义，待用户批准内容 |
| 公共色彩与尺寸 | `design-tokens.css` | 所有路由、手机、焦点对比度 |
| 共享组件状态 | `ui-components.css` | 悬浮、选中、禁用、焦点 |
| 公共布局 | `terminal-dashboard.css` | 所有路由、手机 |
| 登录与乌鸦 | `framework.js` / `terminal-crow.js` | 取消、切页、减少动态效果 |

## Todolist 数据规则

结构是 `方向 → 分组 → tasks`，不是把每条记录写进 HTML。

- 每个 task 的 `id` 唯一且稳定，不因改标题而改 id。
- `task(id,title,status,statusLabel,workflow,extra)` 给 `done` 自动添加 `progress:100`。其他状态可通过 `extra.progress` 保留用户明确提供的真实进度，必须是 0–100 的有限数值；没有依据时不推测百分比。
- `workflow` 是阶段列表；`nextStep` 是真实下一步；`detail` 是点击后的补充资料。
- 奖项用 `awardCount` 表示数量，`works:[{year,name,url}]` 展示作品。没有链接时保留空字符串，不用 `#` 假链接；真实链接在新标签打开并保留 `noopener noreferrer`。
- 各分组未完成项排在完成项之前，同类维持原数据顺序。Optional 是可选标签，不代表已完成。
- 看板的 Items 统计是 task 条数；奖项数量是完成记录的 `awardCount` 总和，两者不能混用。
- 奖项摘要须与明细同步，目前为 8 项；专利 11 项沿用用户提供的信息，不从奖项推导。
- 底部输入支持搜索与 `/xd 增加到团队建设的todo为…` 命令；新增项只存于当前浏览器的 `leiyin.todol.custom.v1`，不会自动更新 GitHub。公开内容仍在数据文件维护。
- 分组默认显示前四项，Show more 展开剩余项；筛选或搜索时显示全部匹配项。底部控件不随看板内容滚动。
- 不发布内部公司数据，作品公开范围与具体链接由用户确认。

## Identity 时序

“上一段最后一行出现 → 下一段命令开始打字”：

```text
最后一行类型等待 + 当前段 pauseAfter + speed.stage
```

当前 `stage=250ms`，常规行 `100ms`，manifesto `550ms`。用户新增 focus 段后共八段，七次切换依次为 `800 / 1000 / 1000 / 1700 / 1550 / 1250 / 900ms`。

命令逐字间隔 `28ms`，命令执行后等待 `200ms`，这些不包含在上述切换间隔中。Replay / Skip intro 按用户要求已删除；保留完成后的 Enter Workspace。

## 新模块接入

1. 在 `modules/` 建立模块，导出 `renderPage(host)`；内容通过 `textContent` 生成，避免用户文本直接进入 HTML。
2. 在 `site-config.js` 更新对应模块路径、标题与说明。改第三、第四个 Tab 的定位前先确认用户批准，不依据讨论直接填充项目案例。
3. 需要局部 CSS 时建立对应文件并在 `becoming.html` 引用；用模块根类限定范围。
4. 涉及计时器、全局事件、观察器或异步任务时，补全挂载与销毁契约；不要让旧模块改动新页面。
5. 更新结构文档、执行检查，并测试深链接、键盘、手机与浏览器前进后退。

## 检查与发布

```sh
node scripts/check-site.mjs
git diff --check
```

检查覆盖本地资源存在、JS 语法、配置路由、唯一 task id、进度数值范围、奖项数量及作品数量。它不核实数据真实性，也不验证渲染、动效或远程链接。

浏览器必查：登录与四条深链接；旧路由归一化；快速切 Tab；Identity 连续跟随 / 手动阅读 / reduced-motion；Todolist 搜索、状态筛选、详情关闭后焦点、作品链接；窄屏无横向溢出。

更新资源时维护 JS / CSS 引用的版本参数，包括 `becoming.html`、`site-config.js` 的动态模块路径，以及 `growth-roadmap-view.js` 内的数据导入。仅给 HTML URL 加参数不能刷新缓存中的 JS。

用户明确要求后，检查 diff，按文件名精确暂存，创建新提交并推送 `HEAD:main`。不自动提交文档之外的实验文件，不使用 `git add .`。

GitHub Pages 在 `main` 推送后由 `.github/workflows` 部署根目录。推送成功不等于线上验证成功；需另外确认部署任务、线上文件和浏览器效果。维护文档随仓库发布，因此不得写入凭据或内部敏感信息。
