import type { KnowledgeEngine } from '@knowcode/core';

export interface PostToolUseInput {
  toolName: string;
  toolInput: unknown;
  toolResult: unknown;
  exitCode?: number;
}

export async function handlePostToolUse(engine: KnowledgeEngine, input: PostToolUseInput): Promise<void> {
  const relevantTools = ['bash', 'computer', 'execute_code'];
  if (!relevantTools.includes(input.toolName)) return;

  const result = String(input.toolResult);
  const hasError = input.exitCode !== 0 || 
    /error|exception|traceback|panic|fatal/i.test(result);

  if (!hasError) return;

  const { hasMatches, suggestion } = await engine.bugService.onErrorDetected(result, {
    cwd: process.cwd(),
    toolName: input.toolName,
    exitCode: input.exitCode,
  });

  if (hasMatches && suggestion) {
    console.log(JSON.stringify({
      type: 'inject_context',
      content: suggestion,
      priority: 'high',
    }));
  }
}