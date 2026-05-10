import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  rootPath: text('root_path').notNull(),
  gitRemote: text('git_remote'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  settings: text('settings').default('{}'),
});

export const bugRecords = sqliteTable('bug_records', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  symptom: text('symptom').notNull(),
  rootCause: text('root_cause'),
  fixSummary: text('fix_summary'),
  fixDiff: text('fix_diff'),
  filesInvolved: text('files_involved').default('[]'),
  tags: text('tags').default('[]'),
  severity: text('severity').default('medium'),
  resolutionMinutes: integer('resolution_minutes'),
  status: text('status').default('resolved'),
  sessionId: text('session_id'),
  agentTool: text('agent_tool'),
  gitCommit: text('git_commit'),
  hitCount: integer('hit_count').default(0),
  lastHitAt: text('last_hit_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const adrs = sqliteTable('adrs', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  seqNumber: integer('seq_number').notNull(),
  title: text('title').notNull(),
  status: text('status').default('proposed'),
  context: text('context'),
  decision: text('decision'),
  rationale: text('rationale'),
  consequences: text('consequences'),
  alternativesConsidered: text('alternatives').default('[]'),
  modulesAffected: text('modules_affected').default('[]'),
  tags: text('tags').default('[]'),
  supersededBy: text('superseded_by'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const techDebts = sqliteTable('tech_debts', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  description: text('description').notNull(),
  module: text('module'),
  priority: text('priority').default('medium'),
  effortEstimate: text('effort_estimate').default('medium'),
  status: text('status').default('open'),
  tags: text('tags').default('[]'),
  discoveredAt: text('discovered_at').notNull(),
  resolvedAt: text('resolved_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const notes = sqliteTable('notes', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  content: text('content').notNull(),
  tags: text('tags').default('[]'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  agentTool: text('agent_tool'),
  startedAt: text('started_at').notNull(),
  endedAt: text('ended_at'),
  tokensInjected: integer('tokens_injected').default(0),
  tokensSavedEstimate: integer('tokens_saved_estimate').default(0),
  bugsRecorded: integer('bugs_recorded').default(0),
  adrsRecorded: integer('adrs_recorded').default(0),
  hits: integer('hits').default(0),
});

export const hitEvents = sqliteTable('hit_events', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull(),
  knowledgeType: text('knowledge_type').notNull(),
  knowledgeId: text('knowledge_id').notNull(),
  similarityScore: text('similarity_score').notNull(),
  userFeedback: text('user_feedback'),
  createdAt: text('created_at').notNull(),
});

export const bugRecordsProjectIdx = index('bug_records_project_idx').on(bugRecords.projectId);
export const adrsProjectIdx = index('adrs_project_idx').on(adrs.projectId);
export const techDebtsProjectIdx = index('tech_debts_project_idx').on(techDebts.projectId);