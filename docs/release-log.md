# KnowCode v1.0.0 发布流程记录

> **记录人**：Trae AI Agent  
> **执行日期**：2026-05-10  
> **项目路径**：`e:\01-fuye\knowcode`  
> **产品**：KnowCode — AI 编码项目的 BUG 知识库 + 架构决策记录 + 可视化知识图谱

---

## 执行概览

本次发布操作按照 [一人公司 AI 创业完整可行性方案](file:///e:/01-fuye/00-方案/01_一人公司AI创业完整可行性方案.md) 中 **§5 第 3 个月上线推广** 阶段和 **§4 路径 2 出海 SaaS** 的框架执行，历经 6 个步骤，完成了从代码仓库初始化到发布文档编写的全流程。

---

## Step 1：Git 仓库初始化

**执行时间**：2026-05-10 18:35

### 1.1 创建 .gitignore

创建 `e:\01-fuye\knowcode\.gitignore`，排除以下内容：

```gitignore
node_modules/
dist/
.env
*.db
*.db-journal
~/.knowcode/
.vite/
.DS_Store
*.log
coverage/
```

### 1.2 初始化 Git

```bash
git init                                      # 成功，创建空仓库
git config user.email "1649889130@qq.com"     # 设置用户邮箱
git config user.name "lONG20260501"           # 设置用户名
git add .                                     # 暂存所有源码文件
git commit -m "v1.0.0: KnowCode - ..."        # 初始提交
```

**结果**：
- 提交哈希：`ff5f2e2`
- 文件数：83 files
- 代码行数：8049 insertions
- dist/ 和 node_modules/ 已正确排除

### 1.3 仓库结构验证

```
knowcode/
├── .gitignore           ✅ 已创建
├── LICENSE              ✅ MIT
├── README.md            ✅
├── biome.json
├── docs/
│   ├── api.md
│   └── handbook.md
├── packages/
│   ├── cli/             ✅ 8 个命令
│   ├── core/            ✅ 知识引擎核心
│   ├── dashboard/       ✅ Vue 3 可视化
│   └── mcp-server/      ✅ MCP 协议实现
├── scripts/
│   └── install.sh
├── package.json         ✅ monorepo 根配置
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

---

## Step 2：npm 发布配置

**执行时间**：2026-05-10 18:38

### 2.1 添加 files 字段

为 3 个可发布包添加 `files` 字段，确保 npm publish 时只发布 `dist` + `README.md`：

| 包名 | package.json 路径 | files 配置 |
|------|------------------|-----------|
| `@knowcode/core` | `packages/core/package.json` | `["dist", "README.md"]` |
| `@knowcode/mcp-server` | `packages/mcp-server/package.json` | `["dist", "README.md"]` |
| `@knowcode/cli` | `packages/cli/package.json` | `["dist", "README.md"]` |

### 2.2 更新 README

将 README.md 中的 `<repository-url>` 占位符替换为实际格式：
```
git clone https://github.com/<your-username>/knowcode.git
```
（用户创建 GitHub 仓库后需替换 `<your-username>` 为实际用户名）

### 2.3 提交

```bash
git add .; git commit -m "chore: add npm publish files config and README repo URL placeholder"
```

**提交哈希**：`9fd6252`，4 files changed，13 insertions，1 deletion

---

## Step 3：测试 + 构建验证

**执行时间**：2026-05-10 18:39

### 3.1 运行测试

```bash
pnpm test
```

**结果**：✅ 全部通过

| 测试文件 | 用例数 | 结果 | 耗时 |
|---------|--------|------|------|
| `src/sanitizer.test.ts` | 4 | ✅ Passed | 947ms |

测试覆盖内容：
- OpenAI API Keys 脱敏
- 密码脱敏
- 邮箱脱敏
- 对象值清理

### 3.2 构建验证

```bash
pnpm build
```

**结果**：✅ 全部构建成功

| 包 | 构建工具 | 输出 | 耗时 |
|----|---------|------|------|
| `@knowcode/core` | tsup | dist/index.js (40KB) + .d.ts (18KB) + 9 chunks | 115ms |
| `@knowcode/mcp-server` | tsup | dist/index.js (2.8KB) + 2 chunks | 82ms |
| `@knowcode/cli` | tsup | dist/index.js (18KB) | 66ms |
| `@knowcode/dashboard` | Vite | dist/index.html + CSS (360KB) + JS (2MB) | 27s |

⚠️ Dashboard 的 JS bundle 较大（2MB），Element Plus + ECharts 未做按需加载优化，后续可改进但不阻塞发布。

---

## Step 4：上线发布文档编写

**执行时间**：2026-05-10 18:45

创建 `docs/launch.md`，覆盖以下内容：

| 章节 | 内容 |
|------|------|
| 产品概览 | 技术栈、包结构、核心功能清单 |
| 发布前检查清单 | 代码质量、待完成事项、法律合规 |
| 多渠道发布策略 | 7 个渠道的发布时间和优先级 |
| 各渠道发布内容 | PH/GitHub/Twitter/Reddit/即刻/V2EX 完整文案 |
| 发布日执行流程 | 按小时排列的时间线 |
| 发布后 72h 监控 | Day 1-3 的数据收集和复盘 |
| 变现路径设置 | 免费/Pro/Team 三层 + Lemon Squeezy |
| 法律合规确认 | 已确认项 + 待确认项 + 免责模板 |

---

## Step 5：发布流程记录（本文档）

**执行时间**：2026-05-10 18:50

创建 `docs/release-log.md`，记录本次发布操作的完整流程。

---

## 发布状态总结

### 已完成

| 序号 | 步骤 | 状态 |
|------|------|------|
| 1 | .gitignore 创建 + Git 初始化 | ✅ |
| 2 | npm files 配置 | ✅ |
| 3 | 测试通过（4/4） | ✅ |
| 4 | 全部构建成功（4/4） | ✅ |
| 5 | `docs/launch.md` 上线发布文档 | ✅ |
| 6 | `docs/release-log.md` 发布流程记录 | ✅ |

### 待用户完成（需要外部平台操作）

| 序号 | 步骤 | 平台 | 阻塞级别 |
|------|------|------|---------|
| 7 | 创建 GitHub 仓库 + 推送代码 | GitHub | 🔴 高 |
| 8 | npm 注册 + 发布 3 个包 | npm | 🔴 高 |
| 9 | Dashboard 部署到 Vercel | Vercel | 🟡 中 |
| 10 | Product Hunt 预约发布 | Product Hunt | 🟡 中 |
| 11 | Lemon Squeezy 账号注册 | Lemon Squeezy | 🟢 低 |
| 12 | 多渠道按时间线发布内容 | Twitter/X/Reddit/即刻/V2EX | 🟢 低 |

---

## 附录：Git 提交历史

```
ff5f2e2 v1.0.0: KnowCode - AI 编码知识管理工具 - BUG知识库 + ADR + 可视化知识图谱
9fd6252 chore: add npm publish files config and README repo URL placeholder
```

## 附录：文件变更统计

| 文件 | 操作 | 说明 |
|------|------|------|
| `.gitignore` | 新建 | 排除 dist/node_modules/.env 等 |
| `packages/core/package.json` | 修改 | 添加 files 字段 |
| `packages/mcp-server/package.json` | 修改 | 添加 files 字段 |
| `packages/cli/package.json` | 修改 | 添加 files 字段 |
| `README.md` | 修改 | 更新仓库 URL 占位符 |
| `docs/launch.md` | 新建 | 上线发布文档 |
| `docs/release-log.md` | 新建 | 发布流程记录 |