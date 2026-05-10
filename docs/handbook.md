# KnowCode 项目开发手册

## 目录

1. [环境准备](#1-环境准备)
2. [项目结构](#2-项目结构)
3. [本地开发](#3-本地开发)
4. [测试验证](#4-测试验证)
5. [打包部署](#5-打包部署)
6. [常见问题](#6-常见问题)

---

## 1. 环境准备

### 1.1 系统要求

| 要求 | 版本 |
|------|------|
| Node.js | >= 18.0.0 |
| pnpm | >= 8.0.0 |
| 操作系统 | Windows / macOS / Linux |

### 1.2 安装步骤

```bash
# 1. 克隆项目
git clone <repository-url>
cd knowcode

# 2. 安装 pnpm（如未安装）
npm install -g pnpm

# 3. 安装项目依赖
pnpm install

# 4. 验证安装
pnpm list
```

### 1.3 环境变量配置（可选）

```bash
# 创建 .env 文件
cat > .env << EOF
KNOWCODE_DB_PATH=~/.knowcode/knowcode.db
KNOWCODE_VECTOR_PATH=~/.knowcode/embeddings
KNOWCODE_EMBEDDER=xenova
EOF
```

---

## 2. 项目结构

### 2.1 Monorepo 架构

```
knowcode/
├── packages/
│   ├── core/           # 核心库包
│   │   ├── src/
│   │   │   ├── db/           # 数据库 Schema
│   │   │   │   └── schema.ts
│   │   │   ├── embedding/    # 嵌入生成
│   │   │   │   ├── xenova.ts
│   │   │   │   ├── ollama.ts
│   │   │   │   └── openai.ts
│   │   │   ├── vector/       # 向量存储
│   │   │   │   ├── vector-store.ts
│   │   │   │   ├── memory.ts
│   │   │   │   └── hnsw.ts
│   │   │   ├── services/     # 业务服务
│   │   │   │   ├── bug.service.ts
│   │   │   │   ├── adr.service.ts
│   │   │   │   ├── debt.service.ts
│   │   │   │   └── context.service.ts
│   │   │   ├── security/     # 安全脱敏
│   │   │   │   └── sanitizer.ts
│   │   │   ├── search/       # 搜索模块
│   │   │   │   └── hybrid.ts
│   │   │   ├── types.ts      # 类型定义
│   │   │   ├── config.ts     # 配置
│   │   │   └── knowledge-engine.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── mcp-server/     # MCP 服务器
│   │   ├── src/
│   │   │   ├── tools/        # MCP Tools
│   │   │   │   ├── bug.tools.ts
│   │   │   │   ├── adr.tools.ts
│   │   │   │   ├── context.tools.ts
│   │   │   │   └── search.tools.ts
│   │   │   ├── hooks/        # MCP Hooks
│   │   │   │   ├── post-tool-use.ts
│   │   │   │   ├── pre-compact.ts
│   │   │   │   ├── session-start.ts
│   │   │   │   └── stop.ts
│   │   │   ├── resources/     # MCP Resources
│   │   │   │   └── project.resource.ts
│   │   │   ├── index.ts
│   │   │   └── server.ts
│   │   └── package.json
│   │
│   ├── cli/            # 命令行工具
│   │   ├── src/
│   │   │   ├── commands/     # 命令实现
│   │   │   │   ├── init.ts
│   │   │   │   ├── install.ts
│   │   │   │   ├── list.ts
│   │   │   │   ├── search.ts
│   │   │   │   ├── show.ts
│   │   │   │   ├── export.ts
│   │   │   │   ├── dashboard.ts
│   │   │   │   └── stats.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── dashboard/      # 可视化 Dashboard
│       ├── src/
│       │   ├── views/        # 页面组件
│       │   ├── components/   # 通用组件
│       │   ├── router/       # 路由
│       │   ├── App.vue
│       │   └── main.ts
│       ├── index.html
│       ├── vite.config.ts
│       └── package.json
│
├── package.json       # 根 package.json
└── pnpm-workspace.yaml
```

### 2.2 核心模块说明

#### 2.2.1 Core 包

| 模块 | 文件 | 功能 |
|------|------|------|
| 数据库 | `db/schema.ts` | Drizzle ORM Schema 定义 |
| 向量存储 | `vector/memory.ts` | 内存向量存储实现 |
| 嵌入 | `embedding/xenova.ts` | Xenova 本地嵌入模型 |
| 安全 | `security/sanitizer.ts` | 敏感信息脱敏 |
| 服务 | `services/bug.service.ts` | BUG 记录与搜索 |

#### 2.2.2 MCP Server 包

| 模块 | 文件 | 功能 |
|------|------|------|
| Tools | `tools/bug.tools.ts` | BUG 相关 MCP Tools |
| Hooks | `hooks/post-tool-use.ts` | 工具执行后 Hook |
| Resources | `resources/project.resource.ts` | 项目知识资源 |

---

## 3. 本地开发

### 3.1 开发模式

#### 启动 Core 包（监视模式）

```bash
# 监视模式运行测试
pnpm --filter @knowcode/core test:watch

# 监听模式重新构建
pnpm --filter @knowcode/core build --watch
```

#### 启动 MCP Server（开发模式）

```bash
cd packages/mcp-server
pnpm dev
```

#### 启动 Dashboard（开发模式）

```bash
cd packages/dashboard
pnpm dev
# 访问 http://localhost:3000
```

#### 启动 CLI（开发模式）

```bash
cd packages/cli
pnpm dev init
pnpm dev list bugs
pnpm dev search "空指针异常"
```

### 3.2 数据库操作

#### 生成数据库迁移

```bash
cd packages/core
pnpm db:generate
```

#### 应用迁移

```bash
cd packages/core
pnpm db:migrate
```

#### 查看数据库

```bash
# 使用 sqlite3
sqlite3 ~/.knowcode/knowcode.db

# 查看表结构
sqlite> .schema bug_records

# 查询数据
sqlite> SELECT * FROM bug_records LIMIT 10;
```

---

## 4. 测试验证

### 4.1 运行测试

```bash
# 运行所有测试
pnpm test

# 运行特定包的测试
pnpm --filter @knowcode/core test

# 监视模式（开发时）
pnpm --filter @knowcode/core test:watch
```

### 4.2 测试覆盖范围

| 测试文件 | 测试内容 |
|----------|----------|
| `sanitizer.test.ts` | 敏感信息脱敏功能 |

### 4.3 测试报告

```
Test Files  1 passed (1)
     Tests  4 passed (4)
```

### 4.4 本地集成测试

```bash
# 1. 启动 MCP 服务器
pnpm --filter @knowcode/mcp-server dev &

# 2. 测试 MCP 工具调用
# 使用 MCP Inspector 或集成到 Cursor/Claude Code

# 3. 测试 CLI 命令
pnpm --filter @knowcode/cli run dev init
pnpm --filter @knowcode/cli run dev list bugs
pnpm --filter @knowcode/cli run dev stats

# 4. 打开 Dashboard 验证
pnpm --filter @knowcode/cli run dev dashboard --port 3000
# 访问 http://localhost:3000
```

---

## 5. 打包部署

### 5.1 构建所有包

```bash
# 构建所有包
pnpm build

# 按顺序构建
pnpm --filter @knowcode/core build
pnpm --filter @knowcode/mcp-server build
pnpm --filter @knowcode/cli build
pnpm --filter @knowcode/dashboard build
```

### 5.2 独立包构建

#### Core 包

```bash
cd packages/core
pnpm build
# 输出: dist/index.js, dist/index.d.ts
```

#### MCP Server 包

```bash
cd packages/mcp-server
pnpm build
# 输出: dist/index.js
```

#### CLI 包

```bash
cd packages/cli
pnpm build
# 输出: dist/index.js
```

#### Dashboard 包

```bash
cd packages/dashboard
pnpm build
# 输出: dist/index.html, dist/assets/
```

### 5.3 全量打包

```bash
# 创建发布包
mkdir -p release
cd release

# 复制构建产物
cp -r ../packages/*/dist ./

# 创建启动脚本
cat > start.sh << 'EOF'
#!/bin/bash
echo "Starting KnowCode MCP Server..."
node ./mcp-server/dist/index.js
EOF
chmod +x start.sh
```

### 5.4 Docker 部署（可选）

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY packages/*/dist ./packages/
COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

ENV NODE_ENV=production

CMD ["node", "packages/mcp-server/dist/index.js"]
```

```bash
# 构建 Docker 镜像
docker build -t knowcode:latest .

# 运行
docker run -v ~/.knowcode:/root/.knowcode knowcode:latest
```

---

## 6. 常见问题

### Q1: 构建失败，提示找不到模块

```bash
# 清除缓存并重新安装
rm -rf node_modules packages/*/dist
pnpm install
pnpm build
```

### Q2: 测试失败

```bash
# 查看详细错误
pnpm test -- --reporter=verbose

# 运行单个测试
pnpm test -- src/sanitizer.test.ts
```

### Q3: MCP 服务器无法连接

```bash
# 检查 MCP 配置
cat ~/.cursor/mcp.json  # 或其他 AI 工具的配置

# 确保端口未被占用
lsof -i :3000
```

### Q4: Dashboard 无法启动

```bash
# 检查端口占用
netstat -an | grep 3000

# 使用其他端口
pnpm dev -- --port 3001
```

### Q5: 数据库初始化失败

```bash
# 检查目录权限
ls -la ~/.knowcode/

# 手动创建目录
mkdir -p ~/.knowcode
```

---

## 附录：命令参考

### 构建命令

| 命令 | 描述 |
|------|------|
| `pnpm install` | 安装所有依赖 |
| `pnpm build` | 构建所有包 |
| `pnpm test` | 运行测试 |
| `pnpm lint` | 代码检查 |

### CLI 命令

| 命令 | 描述 |
|------|------|
| `kc init` | 初始化项目 |
| `kc install` | 安装 MCP Server |
| `kc list bugs` | 列出 BUG |
| `kc list adrs` | 列出 ADR |
| `kc search <query>` | 搜索知识 |
| `kc show <id>` | 查看详情 |
| `kc stats` | 统计信息 |
| `kc dashboard` | 打开 Dashboard |

---

**最后更新**: 2024年
**版本**: 1.0.0
