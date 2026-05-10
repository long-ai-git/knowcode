#!/bin/bash

set -e

echo "🔧 安装 KnowCode..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 20+"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "📦 安装 pnpm..."
    npm install -g pnpm
fi

echo "📥 克隆仓库..."
git clone https://github.com/knowcode-ai/knowcode.git
cd knowcode

echo "📦 安装依赖..."
pnpm install

echo "🔨 构建项目..."
pnpm build

echo "📤 安装 CLI..."
pnpm --filter @knowcode/cli link --global

echo "🎉 安装完成！"
echo "💡 使用 'kc init' 初始化项目"
echo "💡 使用 'kc install' 安装到 AI 编码工具"