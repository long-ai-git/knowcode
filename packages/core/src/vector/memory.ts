import type { VectorStore, VectorStoreConfig, VectorItem, VectorSearchResult } from './vector-store';

export class MemoryVectorStore implements VectorStore {
  private vectors: Map<string, { vector: number[]; metadata?: Record<string, unknown> }> = new Map();
  private path: string;
  private dimensions: number;

  constructor(config: VectorStoreConfig) {
    this.path = config.path;
    this.dimensions = config.dimensions || 384;
  }

  async add(item: VectorItem): Promise<void> {
    this.vectors.set(item.id, { vector: item.vector, metadata: item.metadata });
  }

  async addBatch(items: VectorItem[]): Promise<void> {
    for (const item of items) {
      this.vectors.set(item.id, { vector: item.vector, metadata: item.metadata });
    }
  }

  async search(queryVector: number[], limit: number = 5): Promise<VectorSearchResult[]> {
    const results: { id: string; score: number; metadata?: Record<string, unknown> }[] = [];

    for (const [id, { vector, metadata }] of this.vectors) {
      const similarity = this.cosineSimilarity(queryVector, vector);
      results.push({ id, score: similarity, metadata });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit).map(r => ({
      id: r.id,
      score: r.score,
      metadata: r.metadata,
    }));
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    const minLength = Math.min(a.length, b.length);
    for (let i = 0; i < minLength; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async get(id: string): Promise<VectorItem | null> {
    const item = this.vectors.get(id);
    if (!item) return null;
    return { id, vector: item.vector, metadata: item.metadata };
  }

  async delete(id: string): Promise<void> {
    this.vectors.delete(id);
  }

  async clear(): Promise<void> {
    this.vectors.clear();
  }

  async count(): Promise<number> {
    return this.vectors.size;
  }

  async save(): Promise<void> {
  }
}