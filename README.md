# 拾语 Expression System

一个本地优先的英语表达知识库。GitHub 保存原文、Skill 和处理结果；本地脚本负责分析；`xxd-design.com` 只负责静态展示。

## 使用流程

1. 把文章或对话保存到 `content/inbox/`，支持 `.json`、`.txt`、`.md`。
2. 编辑 `skills/current.md` 调整提取规则。
3. 本地运行：

```sh
python3 scripts/process.py
```

4. 脚本会更新：
- `data/cards.json`
- `data/sources.json`
- `public/knowledge.json`

5. 提交并推送到 GitHub 后，GitHub Pages 会展示最新知识库。

## 本地学习记录

使用本地后台启动页面，正确率和“熟悉/不熟悉”会写入知识库文件：

```sh
python3 server.py
```

打开 `http://127.0.0.1:8765/`。点击“正确 / 错误”会更新卡片的 `practice` 字段；点击“熟悉 / 不熟悉”会更新或移除 `priority_override` 字段，并同步刷新 `public/knowledge.json`。

## 目录

- `content/inbox/`：待处理原文。
- `content/processed/`：已处理原文副本。
- `skills/current.md`：当前 Skill / 提取规则。
- `data/`：长期保存的卡片和来源数据。
- `public/knowledge.json`：网页读取的静态数据。
- `server.py`：本地预览和学习记录写入后台。
- `scripts/process.py`：本地处理脚本。
- `index.html`、`styles.css`、`app.js`：静态展示网站。

## 当前限制

- 第一版提取逻辑是可解释的本地规则模拟，后续会替换为本地模型按 Skill 分析。
- 线上网页只展示，不提交内容，不直接写 GitHub；本地后台只写入本机 JSON 文件。
- 运行中的数据库、日志和备份不提交到仓库。

## 归档

旧作品集已保存到分支：

```text
archive/portfolio-2026-09-09
```
