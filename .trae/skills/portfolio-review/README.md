# 作品集评审 skill · 私有使用包

入口：[SKILL.md](SKILL.md)。包版本：0.2.0。评分配置版本保持 0.1.0-draft。

已整理：作者信息确认、可选 JD、六维评分、三类方向权重、B/C 端 L1–L5 能力锚点、双评分和具体修改反馈。内部规则与交付报告模板分开。

## 在当前环境使用

向当前助手提供作品集 PDF、图片或公开链接，并要求按本目录的 SKILL.md 开始评审。先读取作品、提取信息，等待操作者确认，再进入可选 JD 与评分步骤。

这是本地 skill 包，尚未全局安装；其他会话或机器不会自动拥有本目录。当前目录在 Mytools Git 仓库外，未提交或推送。不要把内部规则或整包附入候选人报告。

## 导出后如何使用

解压后保留整个 `portfolio-review` 文件夹。将它放到支持本地 skill 的工具所规定的技能目录，或让具备文件读取能力的助手直接读取其中的 `SKILL.md`。各平台安装路径不同，本压缩包不会自动安装或联网发布。

可直接发起：

> 请按 portfolio-review/SKILL.md 评审我提供的作品集。默认分层读取，先确认作者信息，再询问可选 JD；内部评判规则不进入报告。

本包只含通用流程、规则、模板与合成样例，不包含任何真实候选人的作品集、个人资料或评分记录。包内含内部标准，请仅供本人使用。

## 文件

- [主流程](SKILL.md)
- [分层读取与缓存](references/reading-policy.md)
- [证据缓存模板](templates/evidence-cache.json)
- [六维评审细则](references/rubric.md)
- [B/C 端能力模型](references/competency-models.md)
- [JD 评审规则](references/jd-policy.md)
- [评分配置](references/scoring-config.json)
- [操作者信息确认卡](templates/profile-card.md)
- [交付报告模板](templates/report.md)
- [验收场景与初稿限制](examples/acceptance.md)

## 计算示例

在本目录运行：

```sh
python3 scripts/score.py examples/score-record.synthetic.json
```

该记录是明确标记的合成计算样例，不是真实作品评审。输出包含内部权重，不能直接复制为报告。

## 验证范围

已验证文件引用、权重与计分的关键分支；已完成一次真实 PDF 的人工评审演练；分层读取策略尚未完成同文件 token 用量对照，评分稳定性、网页读取和各平台卡片兼容性仍需验证。

当前完整分层锚点覆盖 B/C 产品设计；非产品平面、艺术与留学等需额外适配。未确定的次方向混合权重暂不启用。
