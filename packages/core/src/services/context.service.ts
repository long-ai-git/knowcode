import fs from 'fs';
import path from 'path';
import type { BugRecord, ADR, TechDebt, Priority } from '../types';
import type { KnowCodeConfig } from '../config';
import { bugRecords, adrs, techDebts, type DrizzleDB, eq, sql } from '../db';

export class ContextService {
  private config: KnowCodeConfig;

  constructor(private db: DrizzleDB, config?: KnowCodeConfig) {
    const defaultCfg: KnowCodeConfig = {
      dbPath: '', vectorStorePath: '',
      embedding: { provider: 'xenova' },
      security: { encryptDatabase: false, sanitizeOnWrite: true, localOnly: true },
      injection: { totalTokens: 1500, bugPatternsTokens: 600, adrsTokens: 500, projectSummaryTokens: 300, metadataTokens: 100 },
      similarity: { threshold: 0.82, highThreshold: 0.92, lowThreshold: 0.70 },
    };
    this.config = config || defaultCfg;
  }

  async generateSessionContext(options: {
    cwd: string;
    maxTokens?: number;
    gitBranch?: string;
  }): Promise<string> {
    const { cwd, maxTokens = this.config.injection.totalTokens } = options;
    const modules = await this.detectModules(cwd);

    const [bugs, adrList, debts] = await Promise.all([
      this.getRecentBugs({ modules, limit: 5 }),
      this.getRelevantAdrs({ modules, limit: 5 }),
      this.getOpenDebts({ priority: ['critical', 'high'], limit: 3 }),
    ]);

    return this.assembleContext({ bugs, adrs: adrList, debts, maxTokens });
  }

  private async detectModules(cwd: string): Promise<string[]> {
    const modules: string[] = [];
    try {
      const pkgPath = path.join(cwd, 'package.json');
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        if (pkg.workspaces) {
          modules.push(...(Array.isArray(pkg.workspaces) ? pkg.workspaces : (pkg.workspaces.packages || [])));
        }
        if (pkg.name) modules.push(pkg.name);
      }
    } catch { /* ignore */ }

    try {
      const srcDir = path.join(cwd, 'src');
      if (fs.existsSync(srcDir)) {
        for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
          if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
            modules.push(entry.name);
          }
        }
      }
    } catch { /* ignore */ }

    return modules.length > 0 ? modules : [path.basename(cwd)];
  }

  private async getRecentBugs(options: { modules: string[]; limit: number }): Promise<BugRecord[]> {
    try {
      const rows = await this.db.select().from(bugRecords)
        .where(sql`status = 'resolved'`)
        .orderBy('created_at DESC').limit(options.limit * 3);

      return (rows as any[])
        .filter((r: any) => {
          if (!r.files_involved) return true;
          try {
            const files: string[] = JSON.parse(r.files_involved);
            return files.some((f: string) => options.modules.some(m => f.includes(m)));
          } catch { return false; }
        })
        .slice(0, options.limit)
        .map((r: any) => this.mapBug(r));
    } catch { return []; }
  }

  private async getRelevantAdrs(options: { modules: string[]; limit: number }): Promise<ADR[]> {
    try {
      const rows = await this.db.select().from(adrs)
        .where(eq('status', 'accepted'))
        .limit(options.limit * 3);

      return (rows as any[])
        .filter((r: any) => {
          try {
            const affected: string[] = r.modules_affected ? JSON.parse(r.modules_affected) : [];
            return affected.some((m: string) => options.modules.some(mod => m.includes(mod) || mod.includes(m)));
          } catch { return false; }
        })
        .slice(0, options.limit)
        .map((r: any): ADR => ({
          id: r.id || '', projectId: r.project_id || '', seqNumber: r.seq_number || 0,
          title: r.title || '', status: r.status as ADR['status'],
          context: r.context || '', decision: r.decision || '', rationale: r.rationale || '',
          consequences: r.consequences || '',
          alternativesConsidered: r.alternatives_considered ? JSON.parse(r.alternatives_considered) : [],
          modulesAffected: r.modules_affected ? JSON.parse(r.modules_affected) : [],
          tags: r.tags ? JSON.parse(r.tags) : [],
          createdAt: r.created_at || '', updatedAt: r.updated_at || '',
        }));
    } catch { return []; }
  }

  private async getOpenDebts(options: { priority: string[]; limit: number }): Promise<TechDebt[]> {
    try {
      const rows = await this.db.select().from(techDebts)
        .where(eq('status', 'open'))
        .limit(options.limit * 2);

      return (rows as any[])
        .filter((r: any) => options.priority.includes(r.priority || ''))
        .slice(0, options.limit)
        .map((r: any): TechDebt => ({
          id: r.id || '', projectId: r.project_id || '',
          description: r.description || '', module: r.module || '',
          priority: r.priority as Priority,
          effortEstimate: r.effort_estimate as TechDebt['effortEstimate'],
          status: r.status as TechDebt['status'],
          tags: r.tags ? JSON.parse(r.tags) : [],
          discoveredAt: r.discovered_at || '', createdAt: r.created_at || '', updatedAt: r.updated_at || '',
        }));
    } catch { return []; }
  }

  private mapBug(r: any): BugRecord {
    return {
      id: r.id || '', projectId: r.project_id || 'default',
      symptom: r.symptom || '', symptomEmbedding: [],
      rootCause: r.root_cause || '', fixSummary: r.fix_summary || '',
      filesInvolved: r.files_involved ? JSON.parse(r.files_involved) : [],
      tags: r.tags ? JSON.parse(r.tags) : [],
      severity: r.severity || 'medium', status: r.status || 'resolved',
      sessionId: r.session_id || '', agentTool: r.agent_tool || '',
      hitCount: r.hit_count || 0, createdAt: r.created_at || '', updatedAt: r.updated_at || '',
    };
  }

  private assembleContext(options: { bugs: BugRecord[]; adrs: ADR[]; debts: TechDebt[]; maxTokens: number }): string {
    const { bugs, adrs: adrList, debts, maxTokens } = options;

    const bugSection = bugs.length > 0
      ? `\n🐛 **近期 BUG 模式（${bugs.length}条）**\n${bugs.map(b => `- [${this.fmt(b.createdAt)}] ${b.symptom.slice(0, 50)} → ${b.fixSummary.slice(0, 50)}`).join('\n')}`
      : '';

    const adrSection = adrList.length > 0
      ? `\n📋 **架构决策（${adrList.length}条）**\n${adrList.map(a => `- [${a.id}] ${a.title} - ${a.rationale.slice(0, 80)}`).join('\n')}`
      : '';

    const debtSection = debts.length > 0
      ? `\n⚠️ **技术债 Top ${debts.length}**\n${debts.map(d => `- [${d.priority}] ${d.description.slice(0, 60)}`).join('\n')}`
      : '';

    const context = `---\n📚 KnowCode 上下文注入 (v1.0 | 项目: default | 节省 ~8,000 tokens)${bugSection}${adrSection}${debtSection}\n---`;

    return context.slice(0, maxTokens * 3);
  }

  private fmt(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    } catch { return '--'; }
  }
}