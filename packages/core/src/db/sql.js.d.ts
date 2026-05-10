declare module 'sql.js' {
  interface SqlJsStatic {
    Database: new (data?: ArrayLike<number> | Buffer | null) => Database;
  }

  interface Database {
    run(sql: string, params?: unknown[]): void;
    exec(sql: string): QueryExecResult[];
    prepare(sql: string): Statement;
    each(sql: string, params: unknown[], callback: (row: Record<string, unknown>) => void, done: () => void): void;
    each(sql: string, callback: (row: Record<string, unknown>) => void, done: () => void): void;
    export(): Uint8Array;
    close(): void;
    getRowsModified(): number;
    create_function(name: string, func: (...args: unknown[]) => unknown): void;
  }

  interface Statement {
    bind(params?: unknown[]): boolean;
    step(): boolean;
    getAsObject(): Record<string, unknown>;
    get(): unknown[];
    free(): boolean;
    reset(): void;
    getColumnNames(): string[];
  }

  interface QueryExecResult {
    columns: string[];
    values: unknown[][];
  }

  function initSqlJs(config?: { locateFile?: (file: string) => string }): Promise<SqlJsStatic>;

  export { initSqlJs, type Database, type SqlJsStatic, type Statement, type QueryExecResult };
  export default initSqlJs;
}