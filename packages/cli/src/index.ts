#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from './commands/init';
import { installCommand } from './commands/install';
import { listCommand } from './commands/list';
import { searchCommand } from './commands/search';
import { showCommand } from './commands/show';
import { exportCommand } from './commands/export';
import { dashboardCommand } from './commands/dashboard';
import { statsCommand } from './commands/stats';

const program = new Command()
  .name('kc')
  .description('KnowCode - AI 编码知识管理工具')
  .version('1.0.0');

program
  .command('init')
  .description('初始化当前项目的 KnowCode 知识库')
  .option('--global', '初始化全局配置')
  .action(initCommand);

program
  .command('install')
  .description('安装 KnowCode MCP server 到 AI 编码工具')
  .option('--cursor', '仅安装到 Cursor')
  .option('--claude-code', '仅安装到 Claude Code')
  .option('--all', '安装到所有检测到的工具（默认）')
  .action(installCommand);

program
  .command('list')
  .description('列出知识记录')
  .argument('<type>', '记录类型: bugs | adrs | debts | sessions')
  .option('--module <module>', '按模块过滤')
  .option('--status <status>', '按状态过滤')
  .option('--json', '输出 JSON 格式')
  .action((type) => listCommand(type));

program
  .command('search <query>')
  .description('在知识库中语义搜索')
  .option('--type <type>', 'bug | adr | debt | note')
  .option('--threshold <n>', '相似度阈值 (0-1)', '0.7')
  .option('--limit <n>', '返回数量', '5')
  .action(searchCommand);

program
  .command('show <id>')
  .description('查看知识详情')
  .action(showCommand);

program
  .command('export')
  .description('导出知识记录')
  .option('--format <format>', '导出格式: json | markdown', 'json')
  .option('--output <path>', '输出文件路径')
  .action(exportCommand);

program
  .command('dashboard')
  .description('在浏览器中打开可视化 Dashboard')
  .option('--port <port>', '端口', '38000')
  .action(dashboardCommand);

program
  .command('stats')
  .description('查看知识库统计和 Token 节省量')
  .action(statsCommand);

program.parse();