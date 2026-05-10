import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';

let SQL: SqlJsStatic | null = null;
let _db: Database | null = null;

export type DrizzleDB = {
  select(): SelectBuilder;
  insert(table: string): InsertBuilder;
  update(table: string): UpdateBuilder;
};

type WhereArg = string | { sql: string; params: unknown[] };

class SelectBuilder {
  private tableName: string = '';
  private conditions: WhereArg[] = [];
  private orderClause: string = '';
  private limitVal: number | null = null;
  private offsetVal: number | null = null;

  from(table: string): this { this.tableName = table; return this; }

  where(...conds: WhereArg[]): this { this.conditions.push(...conds); return this; }

  orderBy(clause: string): this { this.orderClause = clause; return this; }

  limit(n: number): this { this.limitVal = n; return this; }

  offset(n: number): this { this.offsetVal = n; return this; }

  execSync(): Record<string, unknown>[] {
    if (!_db) return [];
    try {
      const { sql: s, params: p } = this.toSQL();
      const stmt = _db.prepare(s);
      if (p.length > 0) stmt.bind(p);
      const rows: Record<string, unknown>[] = [];
      while (stmt.step()) { rows.push({ ...stmt.getAsObject() }); }
      stmt.free();
      return rows;
    } catch { return []; }
  }

  then<TResult1 = Record<string, unknown>[], TResult2 = never>(
    resolve?: ((value: Record<string, unknown>[]) => TResult1 | PromiseLike<TResult1>) | null,
    reject?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve(this.execSync() as any).then(resolve, reject);
  }

  private toSQL(): { sql: string; params: unknown[] } {
    let params: unknown[] = [];
    let whereStr = '';
    for (const c of this.conditions) {
      if (typeof c === 'string') { whereStr += (whereStr ? ' AND ' : '') + c; }
      else { whereStr += (whereStr ? ' AND ' : '') + (c.sql || ''); params.push(...(c.params || [])); }
    }
    let sql = `SELECT * FROM ${this.tableName}`;
    if (whereStr) sql += ` WHERE ${whereStr}`;
    if (this.orderClause) sql += ` ORDER BY ${this.orderClause}`;
    if (this.limitVal !== null) sql += ` LIMIT ${this.limitVal}`;
    if (this.offsetVal !== null) sql += ` OFFSET ${this.offsetVal}`;
    return { sql, params };
  }
}

class InsertBuilder {
  private tableName: string = '';
  private data: Record<string, unknown> = {};

  into(table: string): this { this.tableName = table; return this; }

  values(data: Record<string, unknown>): this { this.data = { ...data }; return this; }

  exec(): void {
    if (!_db) return;
    try {
      const keys = Object.keys(this.data);
      const vals = keys.map(k => this.data[k]);
      const ph = keys.map(() => '?').join(', ');
      _db.run(`INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${ph})`, vals);
    } catch { /* ignore */ }
  }
}

class UpdateBuilder {
  private tableName: string = '';
  private data: Record<string, unknown> = {};
  private conditions: WhereArg[] = [];

  table(table: string): this { this.tableName = table; return this; }

  set(data: Record<string, unknown>): this { this.data = { ...data }; return this; }

  where(...conds: WhereArg[]): this { this.conditions.push(...conds); return this; }

  exec(): void {
    if (!_db) return;
    try {
      const keys = Object.keys(this.data);
      const setVals = keys.map(k => this.data[k]);
      const setParts = keys.map(k => `${k} = ?`);
      let params: unknown[] = [...setVals];
      let whereStr = '';
      for (const c of this.conditions) {
        if (typeof c === 'string') { whereStr += (whereStr ? ' AND ' : '') + c; }
        else { whereStr += (whereStr ? ' AND ' : '') + (c.sql || ''); params.push(...(c.params || [])); }
      }
      let sql = `UPDATE ${this.tableName} SET ${setParts.join(', ')}`;
      if (whereStr) sql += ` WHERE ${whereStr}`;
      _db.run(sql, params);
    } catch { /* ignore */ }
  }
}

function createWrapper(db: Database): DrizzleDB {
  return {
    select() { return new SelectBuilder(); },
    insert(table: string) { const b = new InsertBuilder(); b.into(table); return b; },
    update(table: string) { const b = new UpdateBuilder(); b.table(table); return b; },
  };
}

export async function initDB(): Promise<DrizzleDB> {
  if (_db) return createWrapper(_db);
  if (!SQL) SQL = await initSqlJs();
  _db = new SQL.Database();

  const ddl = [
    `CREATE TABLE IF NOT EXISTS bug_records (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, symptom TEXT NOT NULL, root_cause TEXT, fix_summary TEXT, fix_diff TEXT, files_involved TEXT DEFAULT '[]', tags TEXT DEFAULT '[]', severity TEXT DEFAULT 'medium', resolution_minutes INTEGER, status TEXT DEFAULT 'resolved', session_id TEXT, agent_tool TEXT, git_commit TEXT, hit_count INTEGER DEFAULT 0, last_hit_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS adrs (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, seq_number INTEGER NOT NULL, title TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'proposed', context TEXT, decision TEXT, rationale TEXT, consequences TEXT, alternatives_considered TEXT DEFAULT '[]', modules_affected TEXT DEFAULT '[]', tags TEXT DEFAULT '[]', superseded_by TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS tech_debts (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, description TEXT NOT NULL, module TEXT, priority TEXT DEFAULT 'medium', effort_estimate TEXT DEFAULT 'medium', status TEXT DEFAULT 'open', tags TEXT DEFAULT '[]', discovered_at TEXT NOT NULL, resolved_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, agent_tool TEXT, started_at TEXT NOT NULL, ended_at TEXT, tokens_injected INTEGER DEFAULT 0, tokens_saved_estimate INTEGER DEFAULT 0, bugs_recorded INTEGER DEFAULT 0, adrs_recorded INTEGER DEFAULT 0, hits INTEGER DEFAULT 0)`,
    `CREATE TABLE IF NOT EXISTS hit_events (id TEXT PRIMARY KEY, session_id TEXT NOT NULL, knowledge_type TEXT NOT NULL, knowledge_id TEXT NOT NULL, similarity_score TEXT, created_at TEXT NOT NULL)`,
  ];
  for (const s of ddl) { try { _db.run(s); } catch { /* ignore */ } }

  return createWrapper(_db);
}

let cached: DrizzleDB | null = null;
export function getDB(_path?: string): DrizzleDB {
  if (cached) return cached;
  if (_db) { cached = createWrapper(_db); return cached; }
  throw new Error('数据库未初始化。请先调用 initDB()');
}

export function eq(col: string, val: unknown) { return { sql: `${col} = ?`, params: [val] }; }
export function ne(col: string, val: unknown) { return { sql: `${col} != ?`, params: [val] }; }
export function like(col: string, pattern: string) { return { sql: `${col} LIKE ?`, params: [pattern] }; }
export function desc(col: string) { return `${col} DESC`; }
export function inArray(col: string, vals: string[]) { return { sql: `${col} IN (${vals.map(() => '?').join(', ')})`, params: vals as unknown[] }; }
export function sql(tsa: TemplateStringsArray, ...v: unknown[]) { const s = tsa.reduce((a, b, i) => a + b + (i < v.length ? '?' : ''), ''); return { sql: s, params: v as unknown[] }; }

export const bugRecords = 'bug_records';
export const adrs = 'adrs';
export const techDebts = 'tech_debts';
export const sessions = 'sessions';
export const hitEvents = 'hit_events';
export const notes = 'notes';