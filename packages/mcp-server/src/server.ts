import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import {
  getDefaultEmbedder,
  createVectorStore,
  getDefaultConfig,
  KnowledgeEngine,
} from '@knowcode/core';
import { registerTools } from './tools/index.js';

async function startServer() {
  const finalConfig = getDefaultConfig();
  const embedder = await getDefaultEmbedder();
  const vectorStore = await createVectorStore({
    type: 'memory',
    path: finalConfig.vectorStorePath,
    dimensions: embedder.getDimensions(),
  });

  const engine = new KnowledgeEngine(finalConfig, embedder, vectorStore);
  await engine.init();

  const server = new Server(
    {
      name: 'knowcode',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  registerTools(server, engine);

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'kc_record_bug_fix',
        description: 'Record a bug fix pattern for future reference',
        inputSchema: {
          type: 'object',
          properties: {
            symptom: { type: 'string', description: 'BUG symptom description' },
            rootCause: { type: 'string', description: 'Root cause analysis' },
            fixSummary: { type: 'string', description: 'Fix summary' },
            filesInvolved: { type: 'array', items: { type: 'string' } },
            tags: { type: 'array', items: { type: 'string' } },
            severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
            sessionId: { type: 'string' },
            agentTool: { type: 'string' },
          },
          required: ['symptom', 'rootCause', 'fixSummary', 'sessionId', 'agentTool'],
        },
      },
      {
        name: 'kc_search_similar_bugs',
        description: 'Search for similar historical bugs',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
            threshold: { type: 'number' },
            limit: { type: 'number' },
          },
          required: ['query'],
        },
      },
      {
        name: 'kc_list_bugs',
        description: 'List bug records',
        inputSchema: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            limit: { type: 'number' },
          },
        },
      },
      {
        name: 'kc_record_adr',
        description: 'Record an architecture decision',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            context: { type: 'string' },
            decision: { type: 'string' },
            rationale: { type: 'string' },
            consequences: { type: 'string' },
            alternativesConsidered: { type: 'array', items: { type: 'string' } },
            modulesAffected: { type: 'array', items: { type: 'string' } },
            tags: { type: 'array', items: { type: 'string' } },
          },
          required: ['title', 'context', 'decision', 'rationale'],
        },
      },
      {
        name: 'kc_get_context',
        description: 'Get knowledge context for current project',
        inputSchema: {
          type: 'object',
          properties: {
            cwd: { type: 'string' },
            maxTokens: { type: 'number' },
          },
          required: ['cwd'],
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
      switch (name) {
        case 'kc_record_bug_fix': {
          const bug = await engine.recordBugFix(args as any);
          return { content: [{ type: 'text', text: JSON.stringify({ success: true, id: bug.id, message: 'BUG记录已保存' }) }] };
        }
        case 'kc_search_similar_bugs': {
          const results = await engine.searchSimilarBugs(args as any);
          return { content: [{ type: 'text', text: JSON.stringify({ found: results.length, results: results.map(r => ({ id: r.item.id, confidence: `${Math.round(r.score * 100)}%`, symptom: r.item.symptom, rootCause: r.item.rootCause, fixSummary: r.item.fixSummary })) }) }] };
        }
        case 'kc_list_bugs': {
          const bugs = await engine.bugService.listBugs(args as any);
          return { content: [{ type: 'text', text: JSON.stringify({ total: bugs.length, bugs }) }] };
        }
        case 'kc_record_adr': {
          const adr = await engine.recordADR(args as any);
          return { content: [{ type: 'text', text: JSON.stringify({ success: true, id: adr.id, message: 'ADR记录已保存' }) }] };
        }
        case 'kc_get_context': {
          const context = await engine.generateSessionContext(args as any);
          return { content: [{ type: 'text', text: context }] };
        }
        default:
          return { content: [{ type: 'text', text: `Unknown tool: ${name}` }] };
      }
    } catch (error: any) {
      return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
    }
  });

  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [
      {
        uri: 'knowcode://project/bugs',
        name: 'BUG Records',
        mimeType: 'application/json',
        description: '所有 BUG 记录',
      },
      {
        uri: 'knowcode://project/adrs',
        name: 'ADRs',
        mimeType: 'application/json',
        description: '架构决策记录',
      },
      {
        uri: 'knowcode://project/debts',
        name: 'Tech Debts',
        mimeType: 'application/json',
        description: '技术债清单',
      },
      {
        uri: 'knowcode://project/stats',
        name: 'Statistics',
        mimeType: 'application/json',
        description: '知识库统计',
      },
    ],
  }));

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;
    try {
      if (uri === 'knowcode://project/bugs') {
        const bugs = await engine.bugService.listBugs({});
        return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(bugs) }] };
      }
      if (uri === 'knowcode://project/adrs') {
        const adrs = await engine.adrService.listADRs();
        return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(adrs) }] };
      }
      if (uri === 'knowcode://project/debts') {
        const debts = await engine.debtService.listDebts();
        return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(debts) }] };
      }
      if (uri === 'knowcode://project/stats') {
        const [bugs, adrs, debts] = await Promise.all([
          engine.bugService.listBugs({}),
          engine.adrService.listADRs(),
          engine.debtService.listDebts(),
        ]);
        const stats = {
          totalBugs: bugs.length,
          totalAdrs: adrs.length,
          totalDebts: debts.length,
          totalHits: bugs.reduce((s, b) => s + b.hitCount, 0),
        };
        return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(stats) }] };
      }
      return { contents: [{ uri, mimeType: 'text/plain', text: 'Not found' }] };
    } catch (error: any) {
      return { contents: [{ uri, mimeType: 'text/plain', text: `Error: ${error.message}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('KnowCode MCP Server started');
}

const isMainModule = process.argv[1] && (process.argv[1].endsWith('index.js') || process.argv[1].endsWith('index.ts') || process.argv[1].endsWith('server.ts') || process.argv[1].endsWith('server.js'));
if (isMainModule) {
  startServer().catch(console.error);
}

export { startServer };