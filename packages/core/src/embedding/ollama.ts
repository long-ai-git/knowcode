import type { Embedder, EmbeddingConfig } from './embedder';

export class OllamaEmbedder implements Embedder {
  private model: string;

  constructor(config: EmbeddingConfig) {
    this.model = config.model || 'nomic-embed-text';
  }

  async embed(text: string): Promise<number[]> {
    const response = await fetch('http://localhost:11434/api/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.model, prompt: text }),
    });
    
    const result = await response.json();
    return result.embedding as number[];
  }

  getDimensions(): number {
    return 768;
  }
}