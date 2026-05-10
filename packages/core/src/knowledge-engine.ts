import type { BugRecord, ADR, TechDebt, SearchOptions, SearchResult, Priority } from './types';
import type { KnowCodeConfig } from './config';
import type { Embedder } from './embedding';
import type { VectorStore } from './vector';
import { Sanitizer } from './security';
import { BugService, type RecordBugInput } from './services/bug.service';
import { AdrService, type RecordADRInput } from './services/adr.service';
import { ContextService } from './services/context.service';
import { DebtService, type RecordDebtInput } from './services/debt.service';
import { SessionService } from './services/session.service';
import { initDB, type DrizzleDB } from './db';

export class KnowledgeEngine {
  private sanitizer: Sanitizer;
  private db!: DrizzleDB;
  public bugService!: BugService;
  public adrService!: AdrService;
  public contextService!: ContextService;
  public debtService!: DebtService;
  public sessionService!: SessionService;

  constructor(
    private config: KnowCodeConfig,
    private embedder: Embedder,
    private vectorStore: VectorStore
  ) {
    this.sanitizer = new Sanitizer();
  }

  async init(): Promise<void> {
    this.db = await initDB();
    this.bugService = new BugService(this.config, this.embedder, this.vectorStore, this.db);
    this.adrService = new AdrService(this.db);
    this.contextService = new ContextService(this.db, this.config);
    this.debtService = new DebtService(this.db);
    this.sessionService = new SessionService(this.db);
  }

  async recordBugFix(input: RecordBugInput): Promise<BugRecord> {
    return this.bugService.recordBugFix(input);
  }

  async searchSimilarBugs(options: SearchOptions): Promise<SearchResult<BugRecord>[]> {
    return this.bugService.searchSimilarBugs(options);
  }

  async recordADR(input: RecordADRInput): Promise<ADR> {
    return this.adrService.recordADR(input);
  }

  async recordTechDebt(input: RecordDebtInput): Promise<TechDebt> {
    return this.debtService.recordTechDebt(input);
  }

  async searchKnowledge(options: SearchOptions): Promise<SearchResult<unknown>[]> {
    const { types } = options;
    const results: SearchResult<unknown>[] = [];

    if (types?.includes('bug') || !types) {
      const bugs = await this.bugService.searchSimilarBugs(options);
      results.push(...bugs.map(b => ({ ...b, item: b.item as unknown })));
    }

    if (types?.includes('adr')) {
      const found = await this.adrService.searchADRs(options);
      results.push(...found.map(a => ({ ...a, item: a.item as unknown })));
    }

    if (types?.includes('debt')) {
      const debts = await this.debtService.listDebts({ priority: options.module as Priority | undefined });
      const filtered = debts.filter(d =>
        d.description.toLowerCase().includes(options.query.toLowerCase())
      ).slice(0, options.limit || 5);
      results.push(...filtered.map(d => ({
        item: d as unknown, score: 0.3, vectorScore: 0, matchedFields: ['description'],
      })));
    }

    return results;
  }

  async generateSessionContext(options: { cwd: string; maxTokens?: number }): Promise<string> {
    return this.contextService.generateSessionContext(options);
  }

  async createSession(projectId: string, agentTool: string) {
    return this.sessionService.createSession(projectId, agentTool);
  }

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 3.5);
  }
}