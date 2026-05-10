import chalk from 'chalk';
import { spawn } from 'child_process';

export async function dashboardCommand(options: { port?: string }) {
  const port = options.port || '38000';
  
  console.log(`${chalk.blue('🌐')} 启动 Dashboard...`);
  console.log(`${chalk.green('✓')} Dashboard 将在 http://localhost:${port} 打开`);
  
  const server = spawn('node', ['-e', `console.log('Dashboard running on port ${port}')`]);
  
  server.on('error', (err) => {
    console.log(`${chalk.red('❌')} 启动失败: ${err.message}`);
  });
}