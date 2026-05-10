import fs from 'fs';
import path from 'path';
import { KnowledgeEngine, getDefaultConfig, getDefaultEmbedder, createVectorStore } from '@knowcode/core';
import chalk from 'chalk';

export async function exportCommand(options: { format?: string; output?: string }) {
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

  const data = { bugs, adrs, debts, exportedAt: new Date().toISOString() };
  const format = options.format || 'json';
  const outputFile = options.output || `knowcode-export-${Date.now()}.${format}`;

  if (format === 'json') {
    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), 'utf-8');
  } else if (format === 'markdown') {
    let md = '# KnowCode 知识导出\n\n';
    md += `导出时间: ${data.exportedAt}\n\n`;
    md += `## BUG 记录 (${bugs.length})\n\n`;
    for (const bug of bugs) {
      md += `### ${bug.id}\n- **症状**: ${bug.symptom}\n- **根因**: ${bug.rootCause}\n- **修复**: ${bug.fixSummary}\n- **严重程度**: ${bug.severity}\n- **命中次数**: ${bug.hitCount}\n\n`;
    }
    md += `## ADR (${adrs.length})\n\n`;
    for (const adr of adrs) {
      md += `### ${adr.id} #${adr.seqNumber} ${adr.title}\n- **状态**: ${adr.status}\n- **决策**: ${adr.decision}\n\n`;
    }
    md += `## 技术债 (${debts.length})\n\n`;
    for (const debt of debts) {
      md += `- **[${debt.priority}]** ${debt.description} (${debt.module})\n`;
    }
    fs.writeFileSync(outputFile, md, 'utf-8');
  } else {
    console.log(chalk.red(`不支持的格式: ${format}。支持: json / markdown`)); return;
  }

  console.log(chalk.green(`✅ 导出完成: ${path.resolve(outputFile)}`));
  console.log(chalk.gray(`   ${bugs.length} bugs, ${adrs.length} adrs, ${debts.length} debts`));
}