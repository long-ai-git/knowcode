import fs from 'fs';
import path from 'path';
import os from 'os';
import chalk from 'chalk';

export async function installCommand() {
  console.log(chalk.blue('🔧 KnowCode MCP Server 安装工具'));
  console.log(chalk.gray('─'.repeat(50)));

  const serverPath = path.resolve(__dirname, '..', '..', 'mcp-server', 'dist', 'index.js');
  const results: string[] = [];

  const cursorPath = getCursorPath();
  if (cursorPath) {
    try {
      installToCursor(cursorPath, serverPath);
      results.push('Cursor');
    } catch (e: any) {
      results.push(`Cursor: ❌ ${e.message}`);
    }
  }

  const claudeConfigPath = getClaudeCodePath();
  if (claudeConfigPath) {
    try {
      installToClaudeCode(claudeConfigPath, serverPath);
      results.push('Claude Code');
    } catch (e: any) {
      results.push(`Claude Code: ❌ ${e.message}`);
    }
  }

  console.log('');
  if (results.length === 0) {
    console.log(chalk.yellow('⚠️ 未检测到已安装的 AI 编码工具。'));
    console.log(chalk.gray('  支持的工具: Cursor, Claude Code'));
    console.log(chalk.gray('  请手动配置 MCP，参考: https://knowcode.dev/docs/mcp-setup'));
  } else {
    for (const result of results) {
      console.log(chalk.green(`  ✅ ${result}`));
    }
    console.log('');
    console.log(chalk.green('安装完成！重启对应工具即可使用 KnowCode。'));
  }
}

function getCursorPath(): string | null {
  if (process.platform === 'win32') {
    const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
    const cursorDir = path.join(appData, 'Cursor');
    return fs.existsSync(cursorDir) ? cursorDir : null;
  }
  const homeDir = os.homedir();
  const macPath = path.join(homeDir, 'Library', 'Application Support', 'Cursor');
  const linuxPath = path.join(homeDir, '.config', 'Cursor');
  if (fs.existsSync(macPath)) return macPath;
  if (fs.existsSync(linuxPath)) return linuxPath;
  return null;
}

function getClaudeCodePath(): string | null {
  const homeDir = os.homedir();
  const claudePath = path.join(homeDir, '.claude');
  return fs.existsSync(claudePath) ? claudePath : null;
}

function installToCursor(cursorDir: string, serverPath: string): void {
  const mcpConfigPath = path.join(cursorDir, 'mcp.json');
  let config: { mcpServers?: Record<string, unknown> } = {};

  if (fs.existsSync(mcpConfigPath)) {
    try {
      config = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf-8'));
    } catch {
      config = {};
    }
  }

  if (!config.mcpServers) {
    config.mcpServers = {};
  }

  config.mcpServers['knowcode'] = {
    command: 'node',
    args: [serverPath],
    cwd: path.resolve(__dirname, '..', '..', '..'),
  };

  fs.writeFileSync(mcpConfigPath, JSON.stringify(config, null, 2), 'utf-8');
}

function installToClaudeCode(claudeDir: string, serverPath: string): void {
  const mcpConfigPath = path.join(claudeDir, 'mcp.json');
  let config: { mcpServers?: Record<string, unknown> } = {};

  if (fs.existsSync(mcpConfigPath)) {
    try {
      config = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf-8'));
    } catch {
      config = {};
    }
  }

  if (!config.mcpServers) {
    config.mcpServers = {};
  }

  config.mcpServers['knowcode'] = {
    command: 'node',
    args: [serverPath],
  };

  fs.writeFileSync(mcpConfigPath, JSON.stringify(config, null, 2), 'utf-8');
}