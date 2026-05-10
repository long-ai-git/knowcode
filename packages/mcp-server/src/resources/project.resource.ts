import type { Server } from '@modelcontextprotocol/sdk/server';
import type { KnowledgeEngine } from '@knowcode/core';

export function registerResources(server: Server, engine: KnowledgeEngine) {
  server.resource({
    uri: 'knowcode://project/summary',
    name: '项目知识摘要',
    description: '当前项目的知识库摘要，包含统计和最新条目',
    mimeType: 'text/markdown',
    handler: async () => {
      return '# Project Knowledge Summary\n\nNo data yet.';
    },
  });

  server.resource({
    uri: 'knowcode://bugs/open',
    name: '未解决的 BUG 列表',
    mimeType: 'application/json',
    handler: async () => {
      return JSON.stringify({ bugs: [], total: 0 });
    },
  });

  server.resource({
    uri: 'knowcode://adrs/active',
    name: '生效中的架构决策',
    mimeType: 'application/json',
    handler: async () => {
      return JSON.stringify({ adrs: [], total: 0 });
    },
  });
}