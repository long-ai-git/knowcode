import type { Embedder, EmbeddingConfig } from './embedder';

export class OpenAIEmbedder implements Embedder {
  private apiKey: string;
  private model: string;

  constructor(config: EmbeddingConfig) {
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY || '';
    this.model = config.model || 'text-embedding-3-small';

    if (!this.apiKey) {
      throw new Error(
        'OpenAIEmbedder 需要 API Key。请设置:\n' +
        '  1. 环境变量 OPENAI_API_KEY\n' +
        '  2. 或在 EmbeddingConfig 中传入 apiKey\n' +
        '  3. 或改用其他 embedder 类型 (xenova/ollama)'
      );
    }
  }

  async embed(text: string): Promise<number[]> {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ model: this.model, input: text }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenAI API 错误 (${response.status}): ${errorBody}`);
    }

    const result = await response.json();
    return result.data[0].embedding as number[];
  }

  getDimensions(): number {
    return 1536;
  }
}