export interface XenovaConfig {
  model?: string;
}

export class XenovaEmbedder {
  private modelName: string;

  constructor(config?: XenovaConfig) {
    this.modelName = config?.model || 'Xenova/all-MiniLM-L6-v2';
  }
  
  async embed(text: string): Promise<number[]> {
    throw new Error('XenovaEmbedder 需要安装 @xenova/transformers。请运行: pnpm add @xenova/transformers');
  }
  
  getDimensions(): number {
    return 384;
  }
}