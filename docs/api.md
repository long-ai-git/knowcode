# KnowCode API 文档

## 目录

1. [核心类型](#1-核心类型)
2. [配置接口](#2-配置接口)
3. [向量存储接口](#3-向量存储接口)
4. [嵌入接口](#4-嵌入接口)
5. [服务类](#5-服务类)
6. [MCP 工具](#6-mcp-工具)

---

## 1. 核心类型

### BugRecord

```typescript
interface BugRecord {
  id: string;                    // 唯一标识 (格式: kc-bug-xxxxxx)
  projectId: string;              // 项目 ID
  symptom: string;               // BUG 症状描述
  symptomEmbedding: number[];     // 症状嵌入向量
  rootCause: string;             // 根因分析
  fixSummary: string;            // 修复摘要
  fixDiff?: string;             // 修复差异
  filesInvolved: string[];       // 涉及的文件
  tags: string[];                // 标签
  severity: Severity;            // 严重程度
  resolutionMinutes?: number;    // 解决耗时（分钟）
  status: 'open' | 'in-progress' | 'resolved';  // 状态
  sessionId: string;             // 会话 ID
  agentTool: string;             // AI 工具名称
  gitCommit?: string;            // Git 提交哈希
  hitCount: number;              // 命中次数
  lastHitAt?: string;            // 最后命中时间
  createdAt: string;             // 创建时间
  updatedAt: string;             // 更新时间
}
```

### ADR (Architecture Decision Record)

```typescript
interface ADR {
  id: string;                    // 唯一标识 (格式: kc-adr-001)
  projectId: string;
  seqNumber: number;             // 序号
  title: string;                 // 标题
  status: 'proposed' | 'accepted' | 'deprecated' | 'superseded';
  context: string;               // 上下文/背景
  decision: string;              // 决策内容
  rationale: string;              // 决策理由
  consequences: string;          // 后果/影响
  alternativesConsidered: string[];  // 考虑的替代方案
  modulesAffected: string[];     // 受影响的模块
  tags: string[];
  supersededBy?: string;         // 被哪个 ADR 替代
  createdAt: string;
  updatedAt: string;
}
```

### TechDebt

```typescript
interface TechDebt {
  id: string;
  projectId: string;
  description: string;            // 描述
  module: string;                 // 所属模块
  priority: Priority;            // 优先级
  effortEstimate: Effort;         // 工作量估计
  status: 'open' | 'in-progress' | 'resolved';
  tags: string[];
  discoveredAt: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

### SearchOptions & SearchResult

```typescript
interface SearchOptions {
  query: string;
  types?: KnowledgeType[];
  threshold?: number;             // 相似度阈值 (默认 0.75)
  limit?: number;                // 返回数量 (默认 5)
  module?: string;               // 按模块过滤
  dateRange?: { from: Date; to: Date };
  useHybrid?: boolean;           // 使用混合搜索
}

interface SearchResult<T> {
  item: T;                       // 匹配的项
  score: number;                 // 综合得分
  vectorScore: number;           // 向量相似度
  textScore?: number;            // 文本匹配得分
  matchedFields: string[];       // 匹配的字段
}
```

---

## 2. 配置接口

### KnowCodeConfig

```typescript
interface KnowCodeConfig {
  dbPath: string;                 // 数据库路径
  vectorStorePath: string;        // 向量存储路径
  embedding: {
    provider: 'xenova' | 'ollama' | 'openai';
    apiKey?: string;
    model?: string;              // 模型名称
  };
  security: {
    encryptDatabase: boolean;     // 加密数据库 (默认 false)
    sanitizeOnWrite: boolean;     // 写入时脱敏 (默认 true)
    localOnly: boolean;          // 仅本地模式 (默认 true)
  };
  injection: {
    totalTokens: number;          // 总 Token 限制 (默认 1500)
    bugPatternsTokens: number;    // BUG 模式 Token (默认 600)
    adrsTokens: number;          // ADR Token (默认 500)
    projectSummaryTokens: number; // 项目摘要 Token (默认 300)
    metadataTokens: number;      // 元数据 Token (默认 100)
  };
  similarity: {
    threshold: number;          // 默认阈值 (默认 0.82)
    highThreshold: number;      // 高阈值 (默认 0.92)
    lowThreshold: number;       // 低阈值 (默认 0.70)
  };
}
```

### getDefaultConfig

```typescript
function getDefaultConfig(projectRoot?: string): KnowCodeConfig;
```

---

## 3. 向量存储接口

### VectorStore

```typescript
interface VectorStore {
  // 添加向量
  add(item: VectorItem): Promise<void>;

  // 批量添加
  addBatch(items: VectorItem[]): Promise<void>;

  // 搜索相似向量
  search(vector: number[], limit?: number): Promise<VectorSearchResult[]>;

  // 获取单个向量
  get(id: string): Promise<VectorItem | null>;

  // 删除向量
  delete(id: string): Promise<void>;

  // 清空所有向量
  clear(): Promise<void>;

  // 获取向量数量
  count(): Promise<number>;

  // 保存到磁盘
  save(): Promise<void>;
}

interface VectorItem {
  id: string;
  vector: number[];
  metadata?: Record<string, unknown>;
}

interface VectorSearchResult {
  id: string;
  score: number;
  metadata?: Record<string, unknown>;
}
```

### MemoryVectorStore

```typescript
import { MemoryVectorStore } from '@knowcode/core';

const store = new MemoryVectorStore({
  path: 'path/to/storage',
  dimensions: 384,  // 默认 384
});

// 使用
await store.add({ id: 'test-1', vector: [0.1, 0.2, ...] });
const results = await store.search([0.1, 0.2, ...], 5);
```

---

## 4. 嵌入接口

### Embedder

```typescript
interface Embedder {
  // 生成嵌入向量
  embed(text: string): Promise<number[]>;

  // 获取向量维度
  getDimensions(): number;
}
```

### XenovaEmbedder

```typescript
import { XenovaEmbedder } from '@knowcode/core';

const embedder = new XenovaEmbedder({
  model: 'Xenova/all-MiniLM-L6-v2',  // 可选
});

const vector = await embedder.embed('要嵌入的文本');
console.log(embedder.getDimensions()); // 384
```

---

## 5. 服务类

### BugService

```typescript
import { BugService } from '@knowcode/core';

interface RecordBugInput {
  symptom: string;
  rootCause: string;
  fixSummary: string;
  filesInvolved?: string[];
  tags?: string[];
  severity?: Severity;
  resolutionMinutes?: number;
  sessionId: string;
  agentTool: string;
}

class BugService {
  // 记录 BUG 修复
  recordBugFix(input: RecordBugInput): Promise<BugRecord>;

  // 搜索相似 BUG
  searchSimilarBugs(options: SearchOptions): Promise<SearchResult<BugRecord>[]>;

  // 获取单个 BUG
  getBugById(id: string): Promise<BugRecord | null>;

  // 列出 BUG
  listBugs(options?: { module?: string; status?: string; limit?: number }): Promise<BugRecord[]>;

  // 更新命中计数
  updateBugHitCount(id: string): Promise<void>;

  // 错误检测回调
  onErrorDetected(
    errorOutput: string,
    context: { cwd: string; toolName: string; exitCode?: number }
  ): Promise<{
    hasMatches: boolean;
    suggestion?: string;
    matches: SearchResult<BugRecord>[];
  }>;
}
```

### AdrService

```typescript
interface RecordADRInput {
  title: string;
  context: string;
  decision: string;
  rationale: string;
  consequences?: string;
  alternativesConsidered?: string[];
  modulesAffected?: string[];
  tags?: string[];
}

class AdrService {
  // 记录 ADR
  recordADR(input: RecordADRInput): Promise<ADR>;

  // 获取 ADR
  getADR(id: string): Promise<ADR | null>;

  // 列出 ADR
  listADRs(filters?: { status?: string; tag?: string; module?: string }): Promise<ADR[]>;

  // 搜索 ADR
  searchADRs(options: SearchOptions): Promise<SearchResult<ADR>[]>;

  // 获取相关 ADR
  getRelevantADRs(modules: string[], limit?: number): Promise<ADR[]>;

  // 更新 ADR
  updateADR(id: string, updates: Partial<ADR>): Promise<ADR | null>;
}
```

### KnowledgeEngine

```typescript
import { KnowledgeEngine, getDefaultConfig, getDefaultEmbedder, createVectorStore } from '@knowcode/core';

const config = getDefaultConfig();
const embedder = await getDefaultEmbedder();
const vectorStore = await createVectorStore({ type: 'memory', path: config.vectorStorePath });

const engine = new KnowledgeEngine(config, embedder, vectorStore);

// 记录 BUG
const bug = await engine.recordBugFix({
  symptom: '空指针异常',
  rootCause: '未检查 null',
  fixSummary: '添加 null 检查',
  sessionId: 'session-1',
  agentTool: 'cursor',
});

// 搜索相似 BUG
const results = await engine.searchSimilarBugs({
  query: '空指针',
  threshold: 0.75,
  limit: 5,
});

// 生成上下文
const context = await engine.generateSessionContext({
  cwd: '/project',
  maxTokens: 1500,
});

// 记录 ADR
const adr = await engine.recordADR({
  title: '采用微服务架构',
  context: '系统复杂度增加',
  decision: '拆分为多个服务',
  rationale: '提高可维护性',
});
```

---

## 6. MCP 工具

### BUG 工具

#### kc_record_bug_fix

```typescript
// 输入 Schema
{
  symptom: string;        // BUG 症状
  rootCause: string;       // 根因
  fixSummary: string;      // 修复摘要
  filesInvolved?: string[]; // 涉及文件
  tags?: string[];
  severity?: 'critical' | 'high' | 'medium' | 'low';
  resolutionMinutes?: number;
  sessionId: string;
  agentTool: string;
}

// 返回
{
  success: boolean;
  id: string;
  message: string;
}
```

#### kc_search_similar_bugs

```typescript
// 输入 Schema
{
  query: string;           // 搜索查询
  threshold?: number;       // 相似度阈值 (0-1)
  limit?: number;          // 返回数量 (1-10)
  module?: string;         // 模块过滤
}

// 返回
{
  found: number;
  results: Array<{
    id: string;
    confidence: string;    // 如 "85%"
    symptom: string;
    rootCause: string;
    fixSummary: string;
    filesInvolved: string[];
    createdAt: string;
  }>;
}
```

### ADR 工具

#### kc_record_adr

```typescript
// 输入 Schema
{
  title: string;
  context: string;
  decision: string;
  rationale: string;
  consequences?: string;
  alternativesConsidered?: string[];
  modulesAffected?: string[];
  tags?: string[];
}

// 返回
{
  success: boolean;
  id: string;
  message: string;
}
```

#### kc_list_adrs

```typescript
// 输入 Schema
{
  status?: 'proposed' | 'accepted' | 'deprecated' | 'superseded';
  tag?: string;
  module?: string;
  limit?: number;          // 默认 10
}

// 返回
{
  adrs: ADR[];
  total: number;
}
```

---

## 附录：导出符号

```typescript
// 从 @knowcode/core 导出的所有内容

// 类型
export type { BugRecord, ADR, TechDebt, SearchOptions, SearchResult, Severity, Priority, Effort }

// 配置
export { KnowCodeConfigSchema, getDefaultConfig } from './config';

// 数据库
export { getDB, bugRecords, adrs, techDebts, notes, sessions, hitEvents } from './db';

// 向量存储
export { VectorStore, MemoryVectorStore, createVectorStore } from './vector';

// 嵌入
export { Embedder, XenovaEmbedder, getDefaultEmbedder } from './embedding';

// 服务
export { BugService, AdrService, ContextService, DebtService, SessionService } from './services';

// 安全
export { Sanitizer } from './security';

// 知识引擎
export { KnowledgeEngine } from './knowledge-engine';
```
