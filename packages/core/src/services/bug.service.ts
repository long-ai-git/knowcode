import { nanoid } from 'nanoid';
import type { BugRecord, SearchOptions, SearchResult, Severity } from '../types';
import type { KnowCodeConfig } from '../config';
import type { Embedder } from '../embedding';
import type { VectorStore } from '../vector';
import { Sanitizer } from '../security';
import { bugRecords, type DrizzleDB, eq, inArray, like, desc, sql } from '../db';

export interface RecordBugInput {
  symptom: string;
  rootCause: string;
  fixSummary: string;
  filesInvolved?: string[];
  tags?: string[];
  severity?: Severity;
  resolutionMinutes?: number;
  sessionId: string;
  agentTool: string;
}

export class BugService {
  private sanitizer: Sanitizer;

  constructor(
    private config: KnowCodeConfig,
    private embedder: Embedder,
    private vectorStore: VectorStore,
    private db: DrizzleDB
  ) {
    this.sanitizer = new Sanitizer();
  }

  async recordBugFix(input: RecordBugInput): Promise<BugRecord> {
    const sanitizedInput = this.config.security.sanitizeOnWrite 
      ? this.sanitizeInput(input) 
      : input;

    const embeddingText = `${sanitizedInput.symptom} ${sanitizedInput.rootCause}`;
    const embedding = await this.embedder.embed(embeddingText);

    const bugRecord: BugRecord = {
      id: `kc-bug-${nanoid(8)}`,
      projectId: 'default',
      symptom: sanitizedInput.symptom,
      symptomEmbedding: embedding,
      rootCause: sanitizedInput.rootCause,
      fixSummary: sanitizedInput.fixSummary,
      filesInvolved: sanitizedInput.filesInvolved || [],
      tags: sanitizedInput.tags || [],
      severity: sanitizedInput.severity || 'medium',
      resolutionMinutes: sanitizedInput.resolutionMinutes,
      status: 'resolved',
      sessionId: sanitizedInput.sessionId,
      agentTool: sanitizedInput.agentTool,
      hitCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.db.insert(bugRecords).values({
      id: bugRecord.id,
      project_id: bugRecord.projectId,
      symptom: bugRecord.symptom,
      root_cause: bugRecord.rootCause,
      fix_summary: bugRecord.fixSummary,
      files_involved: JSON.stringify(bugRecord.filesInvolved),
      tags: JSON.stringify(bugRecord.tags),
      severity: bugRecord.severity,
      resolution_minutes: bugRecord.resolutionMinutes,
      status: bugRecord.status,
      session_id: bugRecord.sessionId,
      agent_tool: bugRecord.agentTool,
      hit_count: bugRecord.hitCount,
      created_at: bugRecord.createdAt,
      updated_at: bugRecord.updatedAt,
    }).exec();

    await this.vectorStore.add({
      id: bugRecord.id,
      vector: embedding,
      metadata: { type: 'bug', module: bugRecord.filesInvolved[0] },
    });

    return bugRecord;
  }

  private sanitizeInput(input: RecordBugInput): RecordBugInput {
    return {
      symptom: this.sanitizer.sanitizeString(input.symptom),
      rootCause: this.sanitizer.sanitizeString(input.rootCause),
      fixSummary: this.sanitizer.sanitizeString(input.fixSummary),
      filesInvolved: input.filesInvolved,
      tags: input.tags,
      severity: input.severity,
      resolutionMinutes: input.resolutionMinutes,
      sessionId: this.sanitizer.sanitizeString(input.sessionId),
      agentTool: this.sanitizer.sanitizeString(input.agentTool),
    };
  }

  async searchSimilarBugs(options: SearchOptions): Promise<SearchResult<BugRecord>[]> {
    const { query, threshold = this.config.similarity.threshold, limit = 5 } = options;
    
    const embedding = await this.embedder.embed(query);
    const vectorResults = await this.vectorStore.search(embedding, Math.min(limit * 2, 100));
    
    const filteredResults = vectorResults.filter(r => r.score >= threshold);
    
    const ids = filteredResults.slice(0, 50).map(r => r.id);
    if (ids.length === 0) return [];

    const records = await this.db.select().from(bugRecords).where(inArray('id', ids));

    return filteredResults
      .map(r => {
        const record = records.find((rec: any) => rec.id === r.id);
        return {
          item: record ? this.mapRow(record) : this.createEmptyBugRecord(r.id),
          score: r.score,
          vectorScore: r.score,
          matchedFields: [],
        };
      })
      .slice(0, limit);
  }

  async getBugById(id: string): Promise<BugRecord | null> {
    const records = await this.db.select().from(bugRecords).where(eq('id', id));
    if (records.length === 0) return null;
    return this.mapRow(records[0] as any);
  }

  async listBugs(options?: { module?: string; status?: string; limit?: number; offset?: number }): Promise<BugRecord[]> {
    const rows = await this.db.select().from(bugRecords).orderBy(desc('created_at'));
    
    let records = rows as any[];
    if (options?.status) {
      records = records.filter(r => r.status === options.status);
    }
    if (options?.module) {
      records = records.filter((r: any) => {
        try {
          const files: string[] = r.files_involved ? JSON.parse(r.files_involved) : [];
          return files.some((f: string) => f.includes(options.module!));
        } catch { return false; }
      });
    }
    if (options?.offset) records = records.slice(options.offset);
    if (options?.limit) records = records.slice(0, options.limit);

    return records.map((r: any) => this.mapRow(r));
  }

  async updateBugHitCount(id: string): Promise<void> {
    this.db.update(bugRecords)
      .set({ 
        hit_count: sql`hit_count + 1`,
        last_hit_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .where(eq('id', id))
      .exec();
  }

  async onErrorDetected(errorOutput: string, context: { cwd: string; toolName: string; exitCode?: number }): Promise<{
    hasMatches: boolean;
    suggestion?: string;
    matches: SearchResult<BugRecord>[];
  }> {
    const normalized = this.normalizeError(errorOutput);
    const matches = await this.searchSimilarBugs({
      query: normalized,
      threshold: this.config.similarity.threshold,
      limit: 3,
    });

    if (matches.length === 0) return { hasMatches: false, matches: [] };

    await this.updateBugHitCount(matches[0].item.id);

    const suggestion = this.formatSuggestion(matches[0]);
    return { hasMatches: true, suggestion, matches };
  }

  private normalizeError(raw: string): string {
    return raw
      .replace(/:\d+:\d+/g, '')
      .replace(/\/[^\s]+\//g, '/')
      .replace(/\d{4}-\d{2}-\d{2}T[\d:.]+Z/g, '[timestamp]')
      .replace(/0x[0-9a-fA-F]+/g, '[addr]')
      .slice(0, 2000);
  }

  private formatSuggestion(match: SearchResult<BugRecord>): string {
    const { item, score } = match;
    const confidence = Math.round(score * 100);
    return [
      `💡 KnowCode 发现相似历史 BUG（置信度: ${confidence}%）`,
      `症状: ${item.symptom.slice(0, 100)}`,
      `根因: ${item.rootCause}`,
      `修复: ${item.fixSummary}`,
      item.filesInvolved.length > 0 ? `涉及文件: ${item.filesInvolved.slice(0, 3).join(', ')}` : '',
    ].filter(Boolean).join('\n');
  }

  private mapRow(r: any): BugRecord {
    return {
      id: r.id || '',
      projectId: r.project_id || 'default',
      symptom: r.symptom || '',
      symptomEmbedding: [],
      rootCause: r.root_cause || '',
      fixSummary: r.fix_summary || '',
      fixDiff: r.fix_diff ?? undefined,
      filesInvolved: r.files_involved ? JSON.parse(r.files_involved) : [],
      tags: r.tags ? JSON.parse(r.tags) : [],
      severity: r.severity || 'medium',
      resolutionMinutes: r.resolution_minutes ?? undefined,
      status: r.status || 'resolved',
      sessionId: r.session_id || '',
      agentTool: r.agent_tool || '',
      gitCommit: r.git_commit ?? undefined,
      hitCount: r.hit_count || 0,
      lastHitAt: r.last_hit_at ?? undefined,
      createdAt: r.created_at || '',
      updatedAt: r.updated_at || '',
    };
  }

  private createEmptyBugRecord(id: string): BugRecord {
    return {
      id, projectId: 'default', symptom: '', symptomEmbedding: [],
      rootCause: '', fixSummary: '', filesInvolved: [], tags: [],
      severity: 'medium', status: 'resolved', sessionId: '', agentTool: '',
      hitCount: 0, createdAt: '', updatedAt: '',
    };
  }
}