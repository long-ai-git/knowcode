import type { SearchOptions, SearchResult, KnowledgeType } from '../types';
import type { Embedder } from '../embedding';
import type { VectorStore } from '../vector';
import { initDB } from '../db';

export class HybridSearcher {
  constructor(
    private embedder: Embedder,
    private vectorStore: VectorStore,
    private dbPath: string
  ) {}

  async vectorSearch(query: string, opts: { type?: KnowledgeType; limit: number }) {
    const embedding = await this.embedder.embed(query);
    const results = await this.vectorStore.search(embedding, opts.limit * 2);
    return opts.type
      ? results.filter(r => r.metadata?.type === opts.type).map(r => ({ id: r.id, score: r.score, type: opts.type! }))
      : results.map(r => ({ id: r.id, score: r.score, type: (r.metadata?.type as KnowledgeType) || 'bug' }));
  }

  async ftsSearch(query: string, opts: { type?: KnowledgeType; limit: number }) {
    try {
      const db = await initDB();
      const results = db.select().from('fts_knowledge').where(`fts_knowledge MATCH '${query.replace(/'/g, "''")}'`).limit(opts.limit).execSync();
      return results
        .filter((r: any) => !opts.type || r.type === opts.type)
        .map((r: any) => ({ id: r.id, score: 0.5, type: r.type as KnowledgeType }));
    } catch { return []; }
  }

  reciprocalRankFusion<T extends { id: string; score: number; type: KnowledgeType }>(
    vectorResults: T[], ftsResults: T[], k: number = 60
  ): T[] {
    const scores = new Map<string, { score: number; item: T }>();
    vectorResults.forEach((r, i) => { const s = 0.6 / (k + i + 1); scores.set(r.id, { score: s, item: r }); });
    ftsResults.forEach((r, i) => {
      const s = 0.4 / (k + i + 1);
      const e = scores.get(r.id); if (e) { e.score += s; } else { scores.set(r.id, { score: s, item: r }); }
    });
    return Array.from(scores.values()).sort((a, b) => b.score - a.score).map(v => v.item);
  }

  async search<T>(options: SearchOptions): Promise<SearchResult<T>[]> {
    const { query, types, threshold = 0.75, limit = 5 } = options;
    const type = types?.[0];
    const [v, f] = await Promise.all([
      this.vectorSearch(query, { type, limit: limit * 2 }),
      this.ftsSearch(query, { type, limit: limit * 2 }),
    ]);
    return this.reciprocalRankFusion(v, f)
      .filter(r => r.score >= threshold)
      .slice(0, limit)
      .map(r => ({ item: { id: r.id, type: r.type } as unknown as T, score: r.score, vectorScore: r.score, matchedFields: ['fts_content'] }));
  }
}