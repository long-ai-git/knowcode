import type { Server } from '@modelcontextprotocol/sdk/server';
import type { KnowledgeEngine } from '@knowcode/core';
import { z } from 'zod';

const RecordADRSchema = z.object({
  title: z.string(),
  context: z.string(),
  decision: z.string(),
  rationale: z.string(),
  consequences: z.string().optional(),
  alternativesConsidered: z.array(z.string()).optional(),
  modulesAffected: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export function registerAdrTools(server: Server, engine: KnowledgeEngine) {
  server.tool({
    name: 'kc_record_adr',
    description: '记录架构决策到知识库',
    inputSchema: RecordADRSchema,
    handler: async (input) => {
      try {
        const adr = await engine.recordADR(input);
        return {
          success: true,
          id: adr.id,
          message: `✅ 架构决策已记录 (${adr.id})。`,
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
    name: 'kc_list_adrs',
    description: '列出架构决策记录',
    inputSchema: z.object({
      status: z.enum(['proposed', 'accepted', 'deprecated', 'superseded']).optional(),
      tag: z.string().optional(),
      module: z.string().optional(),
      limit: z.number().min(1).max(50).default(10),
    }),
    handler: async (input) => {
      const adrs = await engine.adrService.listADRs(input);
      return { adrs, total: adrs.length };
    },
  });
}