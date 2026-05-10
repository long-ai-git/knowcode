# KnowCode v1.0.0 上线发布文档

> **产品定位**：AI 编码项目的 BUG 知识库 + 架构决策记录(ADR) + 可视化知识图谱
> **一句话定位**：AI 编码 agent 的第二大脑 — 自动学习每次 bug fix、架构决策、踩过的坑，下次遇到类似问题时主动提醒
> **发布版本**：v1.0.0
> **发布日期**：2026-05-10
> **发布状态**：进行中

---

## 目录

1. [产品概览](#1-产品概览)
2. [发布前检查清单](#2-发布前检查清单)
3. [多渠道发布策略](#3-多渠道发布策略)
4. [各渠道发布内容](#4-各渠道发布内容)
5. [发布日执行流程](#5-发布日执行流程)
6. [发布后 72 小时监控](#6-发布后-72-小时监控)
7. [变现路径设置](#7-变现路径设置)
8. [法律合规确认](#8-法律合规确认)

---

## 1. 产品概览

### 1.1 技术栈

| 层级 | 技术选型 |
|------|----------|
| 核心语言 | TypeScript 5.5 |
| 数据库 | SQLite + Drizzle ORM |
| 向量存储 | MemoryVectorStore (HNSW) |
| 嵌入模型 | Xenova/all-MiniLM-L6-v2 (本地) |
| MCP 协议 | @modelcontextprotocol/sdk |
| CLI | Commander.js |
| Dashboard | Vue 3 + Element Plus + ECharts |
| 包管理 | pnpm (monorepo) |
| 许可证 | MIT |

### 1.2 包结构

```
knowcode/
├── packages/core/         → @knowcode/core (npm)
├── packages/mcp-server/   → @knowcode/mcp-server (npm)
├── packages/cli/          → @knowcode/cli (npm, bin: kc)
└── packages/dashboard/    → @knowcode/dashboard (Vercel 部署)
```

### 1.3 核心功能

| 功能 | 说明 | 状态 |
|------|------|------|
| BUG 模式库 | 记录症状→根因→修复方案，向量搜索匹配 | ✅ |
| ADR 自动化 | 记录架构决策，含备选方案和影响分析 | ✅ |
| 智能上下文注入 | 新 session 自动加载相关知识点 | ✅ |
| 错误自动检测 | post-tool-use hook 捕获错误并匹配历史方案 | ✅ |
| 安全脱敏 | 自动过滤 API Keys / 密码 / 邮箱 | ✅ |
| 可视化看板 | BUG 热点图 + ADR 时间线 + 知识图谱 | ✅ |
| 知识图谱 | ECharts 可视化模块关系、技术债分布 | ✅ |

---

## 2. 发布前检查清单

### 2.1 代码质量

- [x] 测试通过：4/4 (sanitizer.test.ts)
- [x] 全部构建成功：core + mcp-server + cli + dashboard
- [x] .gitignore 已配置
- [x] npm files 字段已配置（仅发布 dist + README.md）
- [x] Git 仓库已初始化，初始提交完成

### 2.2 待完成（阻塞发布）

- [ ] **GitHub 仓库创建**：在 github.com 创建 `knowcode` 仓库并推送代码
  ```bash
  git remote add origin git@github.com:<your-username>/knowcode.git
  git push -u origin main
  ```
  推送后更新 README.md 中的 `<your-username>` 为实际用户名。

- [ ] **npm 发布**（需要 npm 账号 + 创建 @knowcode organization）：
  ```bash
  npm login
  npm org create @knowcode
  cd packages/core && npm publish --access public
  cd ../mcp-server && npm publish --access public
  cd ../cli && npm publish --access public
  ```

- [ ] **Dashboard 部署**（Vercel Hobby 免费方案）：
  ```bash
  npm i -g vercel
  cd packages/dashboard && vercel --prod
  ```

- [ ] **Lemon Squeezy 账号注册**（用于 Dashboard Pro 收费 $19/月）
  - 访问 https://lemonsqueezy.com 注册
  - 创建产品 "KnowCode Pro Dashboard"

### 2.3 法律合规

- [ ] **检查劳动合同**：查阅知识产权归属、竞业限制、兼职条款
- [ ] **AIGC 合规**：本产品为开发工具，本地运行，不面向 C 端生成内容，暂无备案需求
- [ ] **MIT 开源许可**：LICENSE 文件已就绪

---

## 3. 多渠道发布策略

基于方案§4 路径 2（出海 SaaS）和方案§5 Day 61-68 框架：

| 渠道 | 目标 | 发布时间 | 优先级 |
|------|------|---------|--------|
| GitHub Release | 代码仓库 + Release Notes | 发布日 08:00 | ⭐⭐⭐ |
| Product Hunt | 最大流量来源，排名决定曝光 | 发布日 00:00 PST | ⭐⭐⭐ |
| Twitter/X | Build in Public 持续运营 | 发布日 08:30 | ⭐⭐⭐ |
| Reddit | r/ChatGPTCoding, r/CursorAI, r/programming | 发布日+1 | ⭐⭐ |
| MCP Directory | 注册 MCP 生态工具 | 发布日 | ⭐⭐ |
| 即刻 / V2EX | 中文开发者社区 | 发布日 10:00 | ⭐⭐ |
| Indie Hackers | Build in Public + MRR 公开 | 发布日+3 | ⭐ |

---

## 4. 各渠道发布内容

### 4.1 Product Hunt

**Tagline**（7 字以内）：
> AI 编码的第二大脑 — 自动复用历史 bug 修复

**Description**：

> **KnowCode** is a knowledge base for your AI coding agent. It automatically learns from every bug fix and architecture decision, then proactively reminds you when similar problems arise.
>
> 🔍 **Bug Pattern Library** — Records symptoms, root causes, and fixes. Vector search surfaces past solutions before you waste time debugging the same issue twice.
>
> 📋 **Auto ADR** — Captures architecture decisions with full context (options considered, rationale, consequences), so future sessions understand *why* things were built a certain way.
>
> 🔗 **Knowledge Graph** — Interactive visualization dashboard showing bug hotspots, tech debt distribution, and module relationships via ECharts.
>
> 🧩 **MCP-Native** — Works with Claude Code, Cursor, Copilot, Trae, and any MCP-compatible tool. 100% local data — zero cloud upload.
>
> 💡 **Why I built this**: As a heavy AI coding user, I kept getting bitten by the same class of bugs across sessions. Claude/Cursor had no memory of what we fixed last week. KnowCode fills that gap.

**Maker Comment**（第一条评论）：

> I built KnowCode because I was tired of debugging the same race condition 3 times across different AI coding sessions. Every AI coding tool has "amnesia" between sessions — they don't remember what broke and how you fixed it.
>
> KnowCode solves this by being a persistent knowledge layer that sits between your AI agent and your project. It records bug patterns, architecture decisions, and technical debt — then injects relevant knowledge at the start of each new session.
>
> The core MCP server is open source (MIT). The visualization dashboard will have a Pro tier at $19/month.
>
> Would love your feedback! What's the most annoying bug pattern you keep hitting in your AI coding workflow?

### 4.2 GitHub Release Notes

```markdown
# KnowCode v1.0.0 — Initial Release

## 🎯 Overview
KnowCode is a knowledge management tool for AI coding projects. It automatically
records bug patterns, architecture decisions, and technical debt — then surfaces
relevant knowledge to your AI agent in future sessions.

## ✨ Features

### Bug Pattern Library
- `kc_record_bug_fix` — Record symptom → root cause → fix
- `kc_search_similar_bugs` — Vector search for historical bug matches
- Auto-detection via `post-tool-use` hook on error exit codes

### Architecture Decision Records (ADR)
- `kc_record_adr` — Capture decisions with full context
- Standard ADR format: context → decision → rationale → consequences
- Automatic loading via `session-start` hook

### Knowledge Graph Dashboard
- Bug hotspots visualization
- ADR timeline
- Tech debt distribution
- Module relationship graph (ECharts)

### Security & Privacy
- 100% local data (SQLite + local embeddings)
- Automatic sanitization of API keys, passwords, emails
- MIT licensed

## 📦 Installation

```bash
# CLI tool
npm install -g @knowcode/cli
kc init

# Or install MCP server for your agent
npm install @knowcode/mcp-server
kc install
```

## 🔗 Links
- npm: https://npmjs.com/package/@knowcode/core
- Dashboard: https://knowcode-dashboard.vercel.app
- License: MIT
```

### 4.3 Twitter/X Launch Thread

**Tweet 1 (Hook)**：
> I shipped a tool that gives AI coding agents long-term memory 🧠
>
> No more debugging the same race condition 3 times across different sessions.
>
> Introducing KnowCode ↓

**Tweet 2 (Problem)**：
> The dirty secret of AI coding:
>
> Every session starts with amnesia.
>
> Claude/Cursor/Copilot have no idea what bug you fixed last week, why you chose PostgreSQL over MongoDB, or which module is a minefield of technical debt.

**Tweet 3 (Solution)**：
> KnowCode sits between your AI agent and your project as a persistent knowledge layer:
>
> 🐛 Records every bug fix
> 📋 Captures every architecture decision
> ⚠️ Tracks technical debt
> 🔍 And injects relevant knowledge at session start

**Tweet 4 (Tech)**：
> Built as an MCP server → works with Claude Code, Cursor, Copilot, Trae, and any MCP-compatible tool.
>
> Stack: TypeScript + SQLite + HNSW vector search + Xenova local embeddings + Vue 3 Dashboard.
>
> 100% local. Zero cloud upload.

**Tweet 5 (CTA)**：
> 🧩 MCP core — open source (MIT)
> 📊 Dashboard — free tier available
> 💰 Pro Dashboard — $19/month
>
> GitHub → [link]
> Product Hunt → [link]
>
> RT if you've been burned by AI amnesia 🙏

### 4.4 Reddit 帖子

**r/ChatGPTCoding / r/CursorAI** (Show HN 风格)：

**Title**: I built an MCP server that gives AI coding agents persistent memory across sessions

**Body**:
> After getting burned by debugging the same race condition issue 3 times in different Cursor sessions, I built KnowCode.
>
> It's an MCP server that automatically:
> - Records bug fix patterns (symptom → root cause → fix)
> - Captures architecture decisions with full context
> - Injects relevant knowledge at the start of each new session
>
> Built with TypeScript + SQLite + local embeddings (Xenova). 100% local — your project knowledge never leaves your machine.
>
> Core MCP server is open source (MIT).
>
> Would love feedback from other heavy AI coding users. What's your current workaround for cross-session memory?

### 4.5 即刻 / V2EX 中文版

**标题**：独立开发 90 天上线：给 AI 编程 agent 加一个外挂记忆系统 🧠

**内容**：
> 用 AI 写代码最大的痛点：每次新 session 都是失忆状态，上次修过的 bug 这次又踩一次。
>
> 我做了 KnowCode，一个 MCP server，安装在 Claude Code / Cursor 里之后可以：
> 1. 自动记录每次 bug 修复（症状→根因→方案）
> 2. 自动记录架构决策（为什么选了 A 而不是 B）
> 3. 新 session 自动注入相关知识到上下文
> 4. 可视化 Dashboard 看 bug 热点和技术债分布
>
> 全部本地运行，数据不出电脑。核心代码 MIT 开源。
>
> 欢迎体验和反馈！

---

## 5. 发布日执行流程

### 发布日时间线（按照北京时间）

| 时间 | 动作 | 预计耗时 |
|------|------|---------|
| **Day -1 20:00** | Product Hunt 预约 hunted，上传所有素材 | 1h |
| **Day 0 08:00** | GitHub Release v1.0.0 发布 + Tag | 15min |
| **Day 0 08:30** | Twitter/X Launch Thread 发布（5 条） | 15min |
| **Day 0 09:00** | npm 发布 3 个包（core/mcp-server/cli） | 10min |
| **Day 0 09:15** | Vercel Dashboard 部署 | 10min |
| **Day 0 09:30** | Product Hunt 上线确认（如果约了 hunted） | 5min |
| **Day 0 10:00** | 即刻 + V2EX 帖子发布 | 15min |
| **Day 0 10:30** | Reddit 内容准备（不急着发） | 15min |
| **Day 0 全天** | 回复 PH 评论（必须秒回，影响排名） | 碎片时间 |
| **Day 0 全天** | 回复 Twitter/X 评论和 DM | 碎片时间 |
| **Day 0 21:00** | Day 1 数据统计 | 15min |

### Day 0 统计指标目标

| 指标 | 目标（保守） | 目标（理想） |
|------|------------|------------|
| GitHub Stars | 20 | 100+ |
| Product Hunt Upvotes | 30 | 100+ |
| npm Downloads | 10 | 50+ |
| Twitter Impressions | 1000 | 5000+ |
| Waitlist/注册 | 10 | 50+ |

---

## 6. 发布后 72 小时监控

### Day 1（发布日）- 数据收集

- [ ] GitHub Stars 数
- [ ] Product Hunt 排名 + Upvotes + Comments
- [ ] npm Downloads
- [ ] Twitter/X 帖子曝光 + 互动
- [ ] Dashboard 访问量

### Day 2 - 社区跟进

- [ ] 回复所有 Product Hunt 评论
- [ ] Reddit 帖子发布（r/ChatGPTCoding, r/CursorAI）
- [ ] 回复 GitHub Issues（如果有）
- [ ] 检查 npm 下载趋势

### Day 3 - 复盘决策

按照方案§5 Day 81-85 框架评估：

- [ ] 哪个渠道带来最多流量？
- [ ] 用户的最高频反馈是什么？
- [ ] 有没有紧急 Bug 需要修？
- [ ] 下一步：加大获客 vs 加新功能 vs 砍掉重做？

---

## 7. 变现路径设置

### 开源免费层（获客）
- MCP Server 核心（MIT 开源，npm 免费）
- CLI 工具（免费）
- Dashboard 基础视图（免费）

### Pro 付费层（$19/月）
- 高级知识图谱可视化
- 知识导出功能（JSON/Markdown）
- 历史数据趋势图（Chart.js）
- 优先支持

### Team 付费层（$49/月）
- 多人协作知识库共享
- 团队 BUG 模式库
- 管理员面板
- ⚠️ 暂不开发，等有第一个 Pro 付费用户后再启动

### 支付通道

推荐 **Lemon Squeezy**（MoR 模式）：
- 个人即可注册，不需要海外公司
- 自动处理全球税务
- 抽成 5% + $0.50/笔
- 自带开发票功能

注册步骤：
1. 访问 https://lemonsqueezy.com
2. 注册账号
3. 创建产品 "KnowCode Pro Dashboard"
4. 定价 $19/月（按月订阅）
5. 获取购买链接用于 Dashboard 页面

---

## 8. 法律合规确认

### 已确认
- [x] MIT 开源许可证已就绪
- [x] 数据 100% 本地存储，不上传云端
- [x] 不涉及用户隐私数据收集

### 待确认
- [ ] 劳动合同知识产权条款（上线前必查一次）
- [ ] 是否需要 ICP 备案（如部署 Dashboard 到国内服务器 → 需要；Vercel 海外 → 不需要）
- [ ] 是否需要算法备案（本产品不涉及内容生成 → 暂不需要）

### 免责声明模板（加在 Dashboard 页面）

> KnowCode 存储的项目知识数据完全保留在您的本地设备上。我们不会上传、收集或分享您的任何项目数据。Dashboard 仅展示本地已存储的知识统计信息。

---

## 附录 A：关键链接

| 资源 | 链接 |
|------|------|
| GitHub | https://github.com/<your-username>/knowcode |
| npm (@knowcode/core) | https://npmjs.com/package/@knowcode/core |
| npm (@knowcode/mcp-server) | https://npmjs.com/package/@knowcode/mcp-server |
| npm (@knowcode/cli) | https://npmjs.com/package/@knowcode/cli |
| Dashboard | https://knowcode-dashboard.vercel.app |
| Product Hunt | [待创建] |
| Lemon Squeezy | [待创建] |

## 附录 B：环境变量参考

| 变量 | 描述 | 默认值 |
|------|------|--------|
| `KNOWCODE_DB_PATH` | 数据库路径 | `~/.knowcode/knowcode.db` |
| `KNOWCODE_VECTOR_PATH` | 向量存储路径 | `~/.knowcode/embeddings` |
| `KNOWCODE_EMBEDDER` | 嵌入模型提供者 | `xenova` (可选: ollama, openai) |