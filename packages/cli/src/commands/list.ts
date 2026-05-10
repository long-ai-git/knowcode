import { KnowledgeEngine, getDefaultConfig, getDefaultEmbedder, createVectorStore } from '@knowcode/core';
import chalk from 'chalk';

async function getEngine(): Promise<KnowledgeEngine> {
  const config = getDefaultConfig();
  const embedder = await getDefaultEmbedder();
  const vectorStore = await createVectorStore({ type: 'memory', path: config.vectorStorePath, dimensions: embedder.getDimensions() });
  const engine = new KnowledgeEngine(config, embedder, vectorStore);
  await engine.init();
  return engine;
}

export async function listCommand(type: string) {
  const engine = await getEngine();

  switch (type) {
    case 'bugs': {
      console.log(chalk.blue('🐛 Bug 记录列表'));
      console.log(chalk.gray('─'.repeat(60)));
      const bugs = await engine.bugService.listBugs({ limit: 20 });
      if (bugs.length === 0) { console.log(chalk.gray('  暂无 Bug 记录。使用 kc-bug-fix 工具记录第一个 Bug！')); return; }
      for (const bug of bugs) {
        const severityColor = bug.severity === 'critical' ? chalk.red : bug.severity === 'high' ? chalk.yellow : chalk.green;
        console.log(`  ${chalk.bold(bug.id)}`);
        console.log(`    ${severityColor(`[${bug.severity}]`)} ${bug.symptom}`);
        console.log(`    → ${chalk.gray(bug.fixSummary.slice(0, 60))}`);
        console.log(`    命中: ${bug.hitCount} | ${bug.createdAt}`);
        console.log('');
      }
      break;
    }
    case 'adrs': {
      console.log(chalk.blue('📋 ADR 记录列表'));
      console.log(chalk.gray('─'.repeat(60)));
      const adrs = await engine.adrService.listADRs();
      if (adrs.length === 0) { console.log(chalk.gray('  暂无 ADR 记录。')); return; }
      for (const adr of adrs) {
        console.log(`  ${chalk.bold(adr.id)} #${adr.seqNumber} ${chalk.cyan(adr.title)}`);
        console.log(`    状态: ${adr.status} | ${adr.createdAt}`);
        console.log('');
      }
      break;
    }
    case 'debts': {
      console.log(chalk.blue('⚠️ 技术债清单'));
      console.log(chalk.gray('─'.repeat(60)));
      const debts = await engine.debtService.listDebts();
      if (debts.length === 0) { console.log(chalk.gray('  暂无技术债记录。')); return; }
      for (const debt of debts) {
        const priorityColor = debt.priority === 'critical' ? chalk.red : chalk.yellow;
        console.log(`  ${chalk.bold(debt.id)} ${priorityColor(`[${debt.priority}]`)}`);
        console.log(`    ${debt.description}`);
        console.log(`    模块: ${debt.module} | 工作量: ${debt.effortEstimate}`);
        console.log('');
      }
      break;
    }
    case 'sessions': {
      console.log(chalk.blue('📅 会话历史'));
      console.log(chalk.gray('  暂无会话记录'));
      break;
    }
    default:
      console.log(chalk.red(`未知类型: ${type}。支持: bugs / adrs / debts / sessions`));
  }
}