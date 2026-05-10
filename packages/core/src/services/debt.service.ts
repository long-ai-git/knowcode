import { nanoid } from 'nanoid';
import type { TechDebt, Priority, Effort } from '../types';
import { techDebts, type DrizzleDB, eq } from '../db';

export interface RecordDebtInput {
  description: string;
  module: string;
  priority?: Priority;
  effortEstimate?: Effort;
  tags?: string[];
}

const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

export class DebtService {
  constructor(private db: DrizzleDB) {}

  async recordTechDebt(input: RecordDebtInput): Promise<TechDebt> {
    const debt: TechDebt = {
      id: `kc-debt-${nanoid(8)}`, projectId: 'default',
      description: input.description, module: input.module,
      priority: input.priority || 'medium',
      effortEstimate: input.effortEstimate || 'medium',
      status: 'open', tags: input.tags || [],
      discoveredAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.db.insert(techDebts).values({
      id: debt.id, project_id: debt.projectId,
      description: debt.description, module: debt.module,
      priority: debt.priority, effort_estimate: debt.effortEstimate,
      status: debt.status, tags: JSON.stringify(debt.tags),
      discovered_at: debt.discoveredAt,
      created_at: debt.createdAt, updated_at: debt.updatedAt,
    }).exec();

    return debt;
  }

  async listDebts(filters?: { priority?: Priority; module?: string }): Promise<TechDebt[]> {
    const records = await this.db.select().from(techDebts);
    return (records as any[])
      .filter((r: any) => {
        if (filters?.priority && r.priority !== filters.priority) return false;
        if (filters?.module && r.module !== filters.module) return false;
        return true;
      })
      .sort((a: any, b: any) => (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2))
      .map((r: any) => this.mapRow(r));
  }

  async getDebt(id: string): Promise<TechDebt | null> {
    const records = await this.db.select().from(techDebts).where(eq('id', id));
    if (records.length === 0) return null;
    return this.mapRow(records[0] as any);
  }

  async updateDebt(id: string, updates: Partial<TechDebt>): Promise<TechDebt | null> {
    const existing = await this.getDebt(id);
    if (!existing) return null;
    const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() };

    this.db.update(techDebts)
      .set({
        description: merged.description, module: merged.module,
        priority: merged.priority, effort_estimate: merged.effortEstimate,
        status: merged.status, tags: JSON.stringify(merged.tags),
        resolved_at: merged.resolvedAt, updated_at: merged.updatedAt,
      })
      .where(eq('id', id))
      .exec();

    return merged;
  }

  async resolveDebt(id: string): Promise<TechDebt | null> {
    return this.updateDebt(id, { status: 'resolved', resolvedAt: new Date().toISOString() });
  }

  private mapRow(r: any): TechDebt {
    return {
      id: r.id || '', projectId: r.project_id || 'default',
      description: r.description || '', module: r.module || '',
      priority: r.priority as Priority,
      effortEstimate: r.effort_estimate as Effort,
      status: r.status as TechDebt['status'],
      tags: r.tags ? JSON.parse(r.tags) : [],
      discoveredAt: r.discovered_at || '',
      resolvedAt: r.resolved_at ?? undefined,
      createdAt: r.created_at || '', updatedAt: r.updated_at || '',
    };
  }
}