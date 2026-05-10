export interface VectorItem {
  id: string;
  vector: number[];
  metadata?: Record<string, unknown>;
}

export interface VectorSearchResult {
  id: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface VectorStore {
  add(item: VectorItem): Promise<void>;
  addBatch(items: VectorItem[]): Promise<void>;
  search(vector: number[], limit?: number): Promise<VectorSearchResult[]>;
  get(id: string): Promise<VectorItem | null>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
  count(): Promise<number>;
  save(): Promise<void>;
}

export type VectorStoreType = 'memory' | 'hnsw';

export interface VectorStoreConfig {
  type: VectorStoreType;
  path: string;
  dimensions?: number;
}

export async function createVectorStore(config: VectorStoreConfig): Promise<VectorStore> {
  switch (config.type) {
    case 'hnsw':
      const { HNSWVectorStore } = await import('./hnsw');
      return new HNSWVectorStore(config);
    case 'memory':
    default:
      const { MemoryVectorStore } = await import('./memory');
      return new MemoryVectorStore(config);
  }
}