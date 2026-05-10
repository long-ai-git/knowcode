import type { Server } from '@modelcontextprotocol/sdk/server';
import type { KnowledgeEngine } from '@knowcode/core';
import { z } from 'zod';

export function registerContextTools(server: Server, engine: KnowledgeEngine) {
  server.tool({
    name: 'kc_get_session_context',
    description: '获取当前项目的知识上下文，用于 session 开始时注入',
    inputSchema: z.object({
      cwd: z.string(),
      maxTokens: z.number().min(100).max(3000).default(1500),
      gitBranch: z.string().optional(),
    }),
    handler: async (input) => {
      const context = await engine.generateSessionContext(input);
      return {
        context,
        tokenCount: engine.estimateTokens(context),
      };
    },
  });
}