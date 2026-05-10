import fs from 'fs';
import path from 'path';
import os from 'os';
import { getDefaultConfig } from '@knowcode/core';
import chalk from 'chalk';

export async function initCommand() {
  const configPath = path.join(os.homedir(), '.knowcode');
  const configFile = path.join(configPath, 'config.json');

  console.log(chalk.blue('🚀 KnowCode 初始化'));
  console.log(chalk.gray('─'.repeat(50)));

  if (!fs.existsSync(configPath)) {
    fs.mkdirSync(configPath, { recursive: true });
    console.log(chalk.green(`  ✅ 创建配置目录: ${configPath}`));
  } else {
    console.log(chalk.gray(`  📁 配置目录已存在: ${configPath}`));
  }

  const config = getDefaultConfig();
  
  if (!fs.existsSync(configFile)) {
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2), 'utf-8');
    console.log(chalk.green(`  ✅ 已创建配置文件: ${configFile}`));
  } else {
    console.log(chalk.gray(`  📄 配置文件已存在: ${configFile}`));
  }

  const dbDir = path.dirname(config.dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const vectorDir = config.vectorStorePath;
  if (!fs.existsSync(vectorDir)) {
    fs.mkdirSync(vectorDir, { recursive: true });
  }

  console.log(chalk.green(`  ✅ 数据库路径: ${config.dbPath}`));
  console.log(chalk.green(`  ✅ 向量存储路径: ${config.vectorStorePath}`));
  console.log('');
  console.log(chalk.green('初始化完成！运行 `kc install` 将 KnowCode 接入 AI 编码工具。'));
}