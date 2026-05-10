export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type Priority = Severity;
export type Effort = 'small' | 'medium' | 'large';

export interface BugRecord {
  id: string;
  projectId: string;
  symptom: string;
  symptomEmbedding: number[];
  rootCause: string;
  fixSummary: string;
  fixDiff?: string;
  filesInvolved: string[];
  tags: string[];
  severity: Severity;
  resolutionMinutes?: number;
  status: 'open' | 'in-progress' | 'resolved';
  sessionId: string;
  agentTool: string;
  gitCommit?: string;
  hitCount: number;
  lastHitAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ADR {
  id: string;
  projectId: string;
  seqNumber: number;
  title: string;
  status: 'proposed' | 'accepted' | 'deprecated' | 'superseded';
  context: string;
  decision: string;
  rationale: string;
  consequences: string;
  alternativesConsidered: string[];
  modulesAffected: string[];
  tags: string[];
  supersededBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TechDebt {
  id: string;
  projectId: string;
  description: string;
  module: string;
  priority: Priority;
  effortEstimate: Effort;
  status: 'open' | 'in-progress' | 'resolved';
  tags: string[];
  discoveredAt: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  projectId: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  rootPath: string;
  gitRemote?: string;
  createdAt: string;
  updatedAt: string;
  settings: Record<string, unknown>;
}

export interface Session {
  id: string;
  projectId: string;
  agentTool: string;
  startedAt: string;
  endedAt?: string;
  tokensInjected: number;
  tokensSavedEstimate: number;
  bugsRecorded: number;
  adrsRecorded: number;
  hits: number;
}

export interface HitEvent {
  id: string;
  sessionId: string;
  knowledgeType: 'bug' | 'adr' | 'note' | 'debt';
  knowledgeId: string;
  similarityScore: number;
  userFeedback?: 'useful' | 'not_useful';
  createdAt: string;
}

export interface SearchOptions {
  query: string;
  types?: KnowledgeType[];
  threshold?: number;
  limit?: number;
  module?: string;
  dateRange?: { from: Date; to: Date };
  useHybrid?: boolean;
}

export type KnowledgeType = 'bug' | 'adr' | 'debt' | 'note';

export interface SearchResult<T> {
  item: T;
  score: number;
  vectorScore: number;
  textScore?: number;
  matchedFields: string[];
}