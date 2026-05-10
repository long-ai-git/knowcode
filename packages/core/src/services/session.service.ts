import { nanoid } from 'nanoid';
import type { Session, HitEvent } from '../types';
import { sessions, hitEvents, type DrizzleDB, eq } from '../db';

export class SessionService {
  constructor(private db: DrizzleDB) {}

  async createSession(projectId: string, agentTool: string): Promise<Session> {
    const session: Session = {
      id: `kc-sess-${nanoid(8)}`, projectId, agentTool,
      startedAt: new Date().toISOString(),
      tokensInjected: 0, tokensSavedEstimate: 0,
      bugsRecorded: 0, adrsRecorded: 0, hits: 0,
    };

    this.db.insert(sessions).values({
      id: session.id, project_id: session.projectId,
      agent_tool: session.agentTool, started_at: session.startedAt,
      tokens_injected: session.tokensInjected,
      tokens_saved_estimate: session.tokensSavedEstimate,
      bugs_recorded: session.bugsRecorded, adrs_recorded: session.adrsRecorded,
      hits: session.hits,
    }).exec();

    return session;
  }

  async getSession(id: string): Promise<Session | null> {
    const records = await this.db.select().from(sessions).where(eq('id', id));
    if (records.length === 0) return null;
    return this.mapSession(records[0] as any);
  }

  async updateSession(id: string, updates: Partial<Session>): Promise<Session | null> {
    const existing = await this.getSession(id);
    if (!existing) return null;
    const merged = { ...existing, ...updates };

    this.db.update(sessions)
      .set({
        ended_at: merged.endedAt,
        tokens_injected: merged.tokensInjected,
        tokens_saved_estimate: merged.tokensSavedEstimate,
        bugs_recorded: merged.bugsRecorded,
        adrs_recorded: merged.adrsRecorded,
        hits: merged.hits,
      })
      .where(eq('id', id))
      .exec();

    return merged;
  }

  async endSession(id: string): Promise<Session | null> {
    return this.updateSession(id, { endedAt: new Date().toISOString() });
  }

  async recordHit(sessionId: string, knowledgeType: string, knowledgeId: string, similarityScore: number): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) await this.updateSession(sessionId, { hits: session.hits + 1 });

    this.db.insert(hitEvents).values({
      id: `kc-hit-${nanoid(8)}`, session_id: sessionId,
      knowledge_type: knowledgeType, knowledge_id: knowledgeId,
      similarity_score: String(similarityScore),
      created_at: new Date().toISOString(),
    }).exec();
  }

  async incrementBugRecorded(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) await this.updateSession(sessionId, { bugsRecorded: session.bugsRecorded + 1 });
  }

  async incrementAdrRecorded(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) await this.updateSession(sessionId, { adrsRecorded: session.adrsRecorded + 1 });
  }

  async listRecentSessions(projectId: string, limit: number = 10): Promise<Session[]> {
    const records = await this.db.select().from(sessions)
      .where(eq('project_id', projectId))
      .limit(limit);

    return (records as any[]).map((r: any) => this.mapSession(r));
  }

  private mapSession(r: any): Session {
    return {
      id: r.id || '', projectId: r.project_id || '',
      agentTool: r.agent_tool || '', startedAt: r.started_at || '',
      endedAt: r.ended_at ?? undefined,
      tokensInjected: r.tokens_injected || 0,
      tokensSavedEstimate: r.tokens_saved_estimate || 0,
      bugsRecorded: r.bugs_recorded || 0,
      adrsRecorded: r.adrs_recorded || 0,
      hits: r.hits || 0,
    };
  }
}