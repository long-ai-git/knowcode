import { KnowledgeEngine, getDefaultConfig, getDefaultEmbedder, createVectorStore } from '@knowcode/core';
import chalk from 'chalk';

export async function searchCommand(query: string, options: { type?: string; limit?: string }) {
  const config = getDefaultConfig();
  const embedder = await getDefaultEmbedder();
  const vectorStore = await createVectorStore({ type: 'memory', path: config.vectorStorePath, dimensions: embedder.getDimensions() });
  const engine = new KnowledgeEngine(config, embedder, vectorStore);
  await engine.init();

  const limit = parseInt(options.limit || '5', 10);
  console.log(chalk.blue(`🔍 搜索: "${query}"`));
  console.log(chalk.gray('─'.repeat(60)));

  const results = await engine.searchKnowledge({ query, types: options.type ? [options.type as any] : undefined, limit });
  if (results.length === 0) { console.log(chalk.gray('  未找到匹配结果。')); return; }

  for (const result of results) {
    const item = result.item as any;
    const confidence = Math.round(result.score * 100);
    console.log(`  ${chalk.green(`${confidence}%`)} ${chalk.bold(item.id || 'unknown')}`);
    console.log(`    ${item.symptom || item.title || item.description || ''}`);
    console.log('');
  }
}