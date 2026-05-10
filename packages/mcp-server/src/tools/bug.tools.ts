import type { Server } from '@modelcontextprotocol/sdk/server';
import type { KnowledgeEngine } from '@knowcode/core';
import { z } from 'zod';

const RecordBugSchema = z.object({
  symptom: z.string().max(2000),
  rootCause: z.string().max(1000),
  fixSummary: z.string().max(500),
  filesInvolved: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  severity: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  resolutionMinutes: z.number().optional(),
  sessionId: z.string(),
  agentTool: z.string(),
});

const SearchBugsSchema = z.object({
  query: z.string(),
  threshold: z.number().min(0).max(1).default(0.75),
  limit: z.number().min(1).max(10).default(5),
  module: z.string().optional(),
});

export function registerBugTools(server: Server, engine: KnowledgeEngine) {
  server.tool({
    name: 'kc_record_bug_fix',
    description: '记录一次 bug 修复到知识库。在 bug 修复完成后调用。',
    inputSchema: RecordBugSchema,
    handler: async (input) => {
      try {
        const record = await engine.recordBugFix(input);
        return {
          success: true,
          id: record.id,
          message: `✅ Bug fix 已记录 (${record.id})。使用 \`kc show ${record.id}\` 查看详情。`,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
  });

  server.tool({
    name: 'kc_search_similar_bugs',
    description: '在知识库中搜索相似的历史 bug。当遇到报错时调用，可获取历史解决方案。',
    inputSchema: SearchBugsSchema,
    handler: async (input) => {
      const { query, threshold, limit, module } = input;
      const results = await engine.searchSimilarBugs({
        query,
        threshold,
        limit,
        module,
      });

      if (results.length === 0) {
        return { found: 0, results: [], message: '知识库中未找到相似的历史 bug。' };
      }

      const formatted = results.map(({ item, score }) => ({
        id: item.id,
        confidence: `${Math.round(score * 100)}%`,
        symptom: item.symptom,
        rootCause: item.rootCause,
        fixSummary: item.fixSummary,
        filesInvolved: item.filesInvolved,
        createdAt: item.createdAt,
      }));

      return { found: results.length, results: formatted };
    },
  });

  server.tool({
    name: 'kc_list_open_bugs',
    description: '列出未解决的 bug 记录',
    inputSchema: z.object({
      module: z.string().optional(),
      limit: z.number().min(1).max(50).default(10),
    }),
    handler: async (input) => {
      return { bugs: [], total: 0 };
    },
  });
}