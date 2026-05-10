export interface Embedder {
  embed(text: string): Promise<number[]>;
  getDimensions(): number;
}

export type EmbeddingProvider = 'xenova' | 'ollama' | 'openai';

export interface EmbeddingConfig {
  provider: EmbeddingProvider;
  apiKey?: string;
  model?: string;
}

export async function createEmbedder(config: EmbeddingConfig): Promise<Embedder> {
  switch (config.provider) {
    case 'openai': {
      const { OpenAIEmbedder } = await import('./openai');
      return new OpenAIEmbedder(config);
    }
    case 'ollama': {
      const { OllamaEmbedder } = await import('./ollama');
      return new OllamaEmbedder(config);
    }
    case 'xenova':
    default: {
      try {
        const { XenovaEmbedder } = await import('./xenova');
        return new XenovaEmbedder({ model: config.model });
      } catch {
        const { FallbackEmbedder } = await import('./fallback');
        return new FallbackEmbedder();
      }
    }
  }
}

export async function getDefaultEmbedder(): Promise<Embedder> {
  if (process.env.KNOWCODE_EMBEDDING_PROVIDER === 'openai') {
    const { OpenAIEmbedder } = await import('./openai');
    return new OpenAIEmbedder({ provider: 'openai', apiKey: process.env.OPENAI_API_KEY });
  }
  
  if (await isOllamaAvailable()) {
    const { OllamaEmbedder } = await import('./ollama');
    return new OllamaEmbedder({ provider: 'ollama', model: 'nomic-embed-text' });
  }
  
  return createSafeEmbedder();
}

async function isOllamaAvailable(): Promise<boolean> {
  try {
    const { execSync } = await import('child_process');
    execSync('ollama --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

export async function createSafeEmbedder(): Promise<Embedder> {
  try {
    const { XenovaEmbedder } = await import('./xenova');
    const embedder = new XenovaEmbedder({ model: 'Xenova/all-MiniLM-L6-v2' });
    await embedder.embed('test');
    return embedder;
  } catch (error) {
    console.warn('⚠️ XenovaEmbedder 不可用，使用 FallbackEmbedder');
    const { FallbackEmbedder } = await import('./fallback');
    return new FallbackEmbedder();
  }
}

export class FallbackEmbedder implements Embedder {
  private dimensions: number = 384;

  async embed(text: string): Promise<number[]> {
    const hash = this.simpleHash(text);
    const vector = new Array(this.dimensions).fill(0);
    
    for (let i = 0; i < this.dimensions; i++) {
      vector[i] = this.charHash(hash, i);
    }
    
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map(v => v / norm);
  }

  getDimensions(): number {
    return this.dimensions;
  }

  private simpleHash(text: string): number {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private charHash(seed: number, index: number): number {
    const x = Math.sin(seed * (index + 1) * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }
}