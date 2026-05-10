import { nanoid } from 'nanoid';
import type { ADR, SearchOptions, SearchResult } from '../types';
import { adrs, type DrizzleDB, eq, like, desc } from '../db';

export interface RecordADRInput {
  title: string;
  context: string;
  decision: string;
  rationale: string;
  consequences?: string;
  alternativesConsidered?: string[];
  modulesAffected?: string[];
  tags?: string[];
}

export class AdrService {
  constructor(private db: DrizzleDB) {}

  async recordADR(input: RecordADRInput): Promise<ADR> {
    const existing = await this.db.select().from(adrs).orderBy(desc('seq_number')).limit(1);
    const seqNumber = existing.length > 0 ? (existing[0] as any).seq_number + 1 : 1;

    const adr: ADR = {
      id: `kc-adr-${String(seqNumber).padStart(3, '0')}`,
      projectId: 'default', seqNumber,
      title: input.title, status: 'proposed',
      context: input.context, decision: input.decision,
      rationale: input.rationale,
      consequences: input.consequences || '',
      alternativesConsidered: input.alternativesConsidered || [],
      modulesAffected: input.modulesAffected || [],
      tags: input.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.db.insert(adrs).values({
      id: adr.id, project_id: adr.projectId,
      seq_number: adr.seqNumber, title: adr.title, status: adr.status,
      context: adr.context, decision: adr.decision, rationale: adr.rationale,
      consequences: adr.consequences,
      alternatives_considered: JSON.stringify(adr.alternativesConsidered),
      modules_affected: JSON.stringify(adr.modulesAffected),
      tags: JSON.stringify(adr.tags),
      created_at: adr.createdAt, updated_at: adr.updatedAt,
    }).exec();

    return adr;
  }

  async getADR(id: string): Promise<ADR | null> {
    const records = await this.db.select().from(adrs).where(eq('id', id));
    if (records.length === 0) return null;
    return this.mapRow(records[0] as any);
  }

  async listADRs(filters?: { status?: string; tag?: string; module?: string }): Promise<ADR[]> {
    const records = await this.db.select().from(adrs).orderBy('seq_number');
    return (records as any[])
      .filter((r: any) => {
        if (filters?.status && r.status !== filters.status) return false;
        if (filters?.tag) {
          const tags = r.tags ? JSON.parse(r.tags) : [];
          if (!tags.includes(filters.tag)) return false;
        }
        if (filters?.module) {
          const modules = r.modules_affected ? JSON.parse(r.modules_affected) : [];
          if (!modules.includes(filters.module)) return false;
        }
        return true;
      })
      .map((r: any) => this.mapRow(r));
  }

  async searchADRs(options: SearchOptions): Promise<SearchResult<ADR>[]> {
    const records = await this.db.select().from(adrs)
      .where(like('title', `%${options.query}%`))
      .limit(options.limit || 5);

    return (records as any[]).map((r: any) => ({
      item: this.mapRow(r),
      score: 0.5, vectorScore: 0, matchedFields: ['title'],
    }));
  }

  async getRelevantADRs(modules: string[], limit: number = 5): Promise<ADR[]> {
    const allRecords = await this.db.select().from(adrs).where(eq('status', 'accepted'));
    return (allRecords as any[])
      .filter((r: any) => {
        const affected = r.modules_affected ? JSON.parse(r.modules_affected) : [];
        return affected.some((m: string) => modules.includes(m));
      })
      .slice(0, limit)
      .map((r: any) => this.mapRow(r));
  }

  async updateADR(id: string, updates: Partial<ADR>): Promise<ADR | null> {
    const existing = await this.getADR(id);
    if (!existing) return null;
    const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() };

    this.db.update(adrs)
      .set({
        title: merged.title, status: merged.status,
        context: merged.context, decision: merged.decision,
        rationale: merged.rationale, consequences: merged.consequences,
        alternatives_considered: JSON.stringify(merged.alternativesConsidered),
        modules_affected: JSON.stringify(merged.modulesAffected),
        tags: JSON.stringify(merged.tags),
        superseded_by: merged.supersededBy,
        updated_at: merged.updatedAt,
      })
      .where(eq('id', id))
      .exec();

    return merged;
  }

  private mapRow(r: any): ADR {
    return {
      id: r.id || '', projectId: r.project_id || 'default',
      seqNumber: r.seq_number || 0, title: r.title || '',
      status: r.status as ADR['status'], context: r.context || '',
      decision: r.decision || '', rationale: r.rationale || '',
      consequences: r.consequences || '',
      alternativesConsidered: r.alternatives_considered ? JSON.parse(r.alternatives_considered) : [],
      modulesAffected: r.modules_affected ? JSON.parse(r.modules_affected) : [],
      tags: r.tags ? JSON.parse(r.tags) : [],
      supersededBy: r.superseded_by ?? undefined,
      createdAt: r.created_at || '', updatedAt: r.updated_at || '',
    };
  }
}