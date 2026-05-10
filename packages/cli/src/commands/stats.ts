import { KnowledgeEngine, getDefaultConfig, getDefaultEmbedder, createVectorStore } from '@knowcode/core';
import chalk from 'chalk';

export async function statsCommand() {
  const config = getDefaultConfig();
  const embedder = await getDefaultEmbedder();
  const vectorStore = await createVectorStore({ type: 'memory', path: config.vectorStorePath, dimensions: embedder.getDimensions() });
  const engine = new KnowledgeEngine(config, embedder, vectorStore);
  await engine.init();

  const [bugs, adrs, debts] = await Promise.all([
    engine.bugService.listBugs({}),
    engine.adrService.listADRs(),
    engine.debtService.listDebts(),
  ]);

  const totalHits = bugs.reduce((sum, b) => sum + b.hitCount, 0);
  const tokensSaved = totalHits * 2000;

  console.log(chalk.blue('📊 知识库统计'));
  console.log(chalk.gray('─'.repeat(40)));
  console.log(`${chalk.green('🐛')} Bug 记录:    ${chalk.bold(String(bugs.length))}   (命中 ${totalHits} 次)`);
  console.log(`${chalk.cyan('📋')} ADR 记录:    ${chalk.bold(String(adrs.length))}`);
  console.log(`${chalk.yellow('⚠️')} 技术债:      ${chalk.bold(String(debts.length))}`);
  console.log(`${chalk.magenta('💰')} Token 节省: ${chalk.bold(tokensSaved.toLocaleString())}`);
  console.log(chalk.gray('─'.repeat(40)));
}