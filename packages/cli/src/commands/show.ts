import { KnowledgeEngine, getDefaultConfig, getDefaultEmbedder, createVectorStore } from '@knowcode/core';
import chalk from 'chalk';

export async function showCommand(id: string) {
  const config = getDefaultConfig();
  const embedder = await getDefaultEmbedder();
  const vectorStore = await createVectorStore({ type: 'memory', path: config.vectorStorePath, dimensions: embedder.getDimensions() });
  const engine = new KnowledgeEngine(config, embedder, vectorStore);
  await engine.init();

  console.log(chalk.blue(`📖 详情: ${id}`));
  console.log(chalk.gray('─'.repeat(60)));

  if (id.startsWith('kc-bug-')) {
    const bug = await engine.bugService.getBugById(id);
    if (!bug) { console.log(chalk.red(`未找到: ${id}`)); return; }
    console.log(`${chalk.bold('症状:')} ${bug.symptom}`);
    console.log(`${chalk.bold('根因:')} ${bug.rootCause}`);
    console.log(`${chalk.bold('修复:')} ${bug.fixSummary}`);
    console.log(`${chalk.bold('严重程度:')} ${bug.severity}`);
    console.log(`${chalk.bold('状态:')} ${bug.status}`);
    console.log(`${chalk.bold('命中次数:')} ${bug.hitCount}`);
  } else if (id.startsWith('kc-adr-')) {
    const adr = await engine.adrService.getADR(id);
    if (!adr) { console.log(chalk.red(`未找到: ${id}`)); return; }
    console.log(`${chalk.bold('标题:')} ${adr.title} #${adr.seqNumber}`);
    console.log(`${chalk.bold('状态:')} ${adr.status}`);
    console.log(`${chalk.bold('决策:')} ${adr.decision}`);
    console.log(`${chalk.bold('理由:')} ${adr.rationale}`);
  } else if (id.startsWith('kc-debt-')) {
    const debt = await engine.debtService.getDebt(id);
    if (!debt) { console.log(chalk.red(`未找到: ${id}`)); return; }
    console.log(`${chalk.bold('描述:')} ${debt.description}`);
    console.log(`${chalk.bold('优先级:')} ${debt.priority}`);
    console.log(`${chalk.bold('状态:')} ${debt.status}`);
  } else {
    console.log(chalk.yellow(`未知 ID 类型: ${id}`));
  }
}