import type { KnowledgeEngine } from '@knowcode/core';

export interface SessionStartInput {
  sessionId: string;
  cwd: string;
}

export async function handleSessionStart(engine: KnowledgeEngine, input: SessionStartInput): Promise<void> {
  const context = await engine.generateSessionContext({
    cwd: input.cwd,
    maxTokens: 1500,
  });

  if (!context) return;

  console.log(JSON.stringify({
    type: 'inject_context',
    content: context,
  }));
}