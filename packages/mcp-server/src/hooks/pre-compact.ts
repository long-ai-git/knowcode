export interface PreCompactInput {
  sessionId: string;
  contextSummary?: string;
}

export async function handlePreCompact(input: PreCompactInput): Promise<void> {
  if (input.contextSummary) {
  }
}