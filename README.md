# KnowCode - AI 编码知识管理工具

<div align="center">

📚 **BUG 知识库** · 📋 **架构决策记录** · 🔗 **可视化知识图谱**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Vue](https://img.shields.io/badge/Vue-3.4-green.svg)](https://vuejs.org/)

</div>

## 🎯 项目简介

KnowCode 是一款面向 AI 编码时代的知识管理工具，通过 MCP (Model Context Protocol) 与 AI 编码工具深度集成，自动记录和管理：

- 🐛 **BUG 模式与解决方案** - 智能识别并记录错误模式，积累修复经验
- 📋 **架构决策记录 (ADR)** - 追踪技术选型决策及其上下文
- ⚠️ **技术债清单** - 可视化管理代码中的技术债务
- 🔗 **知识关系图谱** - 揭示 BUG、ADR、技术债之间的关联

## ✨ 核心特性

| 特性 | 描述 |
|------|------|
| 智能 BUG 检测 | 实时监控命令执行，自动匹配历史相似 BUG 并提供解决方案 |
| 语义搜索 | 基于向量嵌入的相似度搜索，快速定位相关知识 |
| 安全脱敏 | 自动过滤敏感信息（API Keys、密码、邮箱等） |
| 上下文注入 | 根据当前任务智能注入相关知识到 AI 上下文 |
| 可视化图谱 | Web Dashboard 直观展示知识关系网络 |
| 本地优先 | 所有数据存储在本地，保护隐私安全 |

## 📦 包结构

```
knowcode/
├── packages/
│   ├── core/           # 核心库（数据库、向量存储、服务层）
│   ├── mcp-server/     # MCP 服务器实现
│   ├── cli/            # 命令行工具
│   └── dashboard/      # 可视化 Dashboard (Vue 3)
└── README.md
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 安装

```bash
# 克隆项目
git clone https://github.com/<your-username>/knowcode.git
cd knowcode

# 安装依赖
pnpm install

# 构建所有包
pnpm build
```

### 本地测试验证

```bash
# 运行测试
pnpm test

# 启动 Dashboard 开发服务器
pnpm --filter @knowcode/dashboard dev

# 启动 MCP 服务器（开发模式）
pnpm --filter @knowcode/mcp-server dev
```

### CLI 工具使用

```bash
# 初始化项目
pnpm --filter @knowcode/cli run dev init

# 安装 MCP Server
pnpm --filter @knowcode/cli run dev install

# 搜索相似 BUG
pnpm --filter @knowcode/cli run dev search "空指针异常"

# 列出所有 BUG
pnpm --filter @knowcode/cli run dev list bugs

# 查看统计信息
pnpm --filter @knowcode/cli run dev stats

# 打开可视化 Dashboard
pnpm --filter @knowcode/cli run dev dashboard --port 3000
```

## 🏗️ 开发指南

### 项目结构

```
knowcode/
├── packages/
│   ├── core/
│   │   └── src/
│   │       ├── db/           # 数据库 Schema (Drizzle)
│   │       ├── embedding/    # 嵌入向量生成
│   │       ├── vector/       # 向量存储
│   │       ├── services/     # 业务服务
│   │       ├── security/     # 安全脱敏
│   │       └── knowledge-engine.ts
│   ├── mcp-server/
│   │   └── src/
│   │       ├── tools/        # MCP Tools
│   │       ├── hooks/        # MCP Hooks
│   │       ├── resources/    # MCP Resources
│   │       └── server.ts
│   └── dashboard/
│       └── src/
│           ├── views/        # 页面组件
│           ├── components/    # 通用组件
│           └── router/       # 路由配置
```

### 技术栈

| 层级 | 技术选型 |
|------|----------|
| 核心语言 | TypeScript 5.5 |
| 数据库 | SQLite + Drizzle ORM |
| 向量存储 | MemoryVectorStore (可扩展) |
| 嵌入模型 | Xenova/all-MiniLM-L6-v2 |
| MCP 协议 | @modelcontextprotocol/sdk |
| CLI | Commander.js |
| Dashboard | Vue 3 + Element Plus + ECharts |
| 构建工具 | tsup (core) / Vite (dashboard) |

### 添加新的知识类型

1. 在 `packages/core/src/types.ts` 中定义类型
2. 在 `packages/core/src/db/schema.ts` 中添加数据库 Schema
3. 在 `packages/core/src/services/` 中实现服务类
4. 在 `packages/mcp-server/src/tools/` 中添加 MCP Tool

## 📚 文档

详细文档请参考：

- [项目开发手册](./docs/handbook.md) - 包含完整的开发、测试、打包指南
- [API 文档](./docs/api.md) - 核心模块 API 参考

## 🔧 环境变量

| 变量 | 描述 | 默认值 |
|------|------|--------|
| `KNOWCODE_DB_PATH` | 数据库路径 | `~/.knowcode/knowcode.db` |
| `KNOWCODE_VECTOR_PATH` | 向量存储路径 | `~/.knowcode/embeddings` |
| `KNOWCODE_EMBEDDER` | 嵌入模型 | `xenova` |

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
