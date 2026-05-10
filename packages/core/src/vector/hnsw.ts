import type { VectorStore, VectorStoreConfig, VectorItem, VectorSearchResult } from './vector-store';

export class HNSWVectorStore implements VectorStore {
  constructor(config: VectorStoreConfig) {
    throw new Error(
      'HNSWVectorStore 尚未实现。请使用 type: "memory" 作为向量存储类型。\n' +
      '示例: createVectorStore({ type: "memory", path: "..." })'
    );
  }

  async add(item: VectorItem): Promise<void> {
    throw new Error('HNSWVectorStore 未实现');
  }

  async addBatch(items: VectorItem[]): Promise<void> {
    throw new Error('HNSWVectorStore 未实现');
  }

  async search(vector: number[], limit: number = 5): Promise<VectorSearchResult[]> {
    throw new Error('HNSWVectorStore 未实现');
  }

  async get(id: string): Promise<VectorItem | null> {
    throw new Error('HNSWVectorStore 未实现');
  }

  async delete(id: string): Promise<void> {
    throw new Error('HNSWVectorStore 未实现');
  }

  async clear(): Promise<void> {
    throw new Error('HNSWVectorStore 未实现');
  }

  async count(): Promise<number> {
    throw new Error('HNSWVectorStore 未实现');
  }

  async save(): Promise<void> {
    throw new Error('HNSWVectorStore 未实现');
  }
}