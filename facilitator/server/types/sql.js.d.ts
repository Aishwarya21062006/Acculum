declare module 'sql.js' {
  export interface Statement {
    bind(values?: any[]): boolean;
    step(): boolean;
    get(params?: any[]): any[];
    getAsObject(params?: any[]): Record<string, any>;
    free(): boolean;
  }
  export interface Database {
    run(sql: string, params?: any[]): void;
    exec(sql: string, params?: any[]): Array<{ columns: string[]; values: any[][] }>;
    prepare(sql: string, params?: any[]): Statement;
    export(): Uint8Array;
    close(): void;
  }
  export type SqlValue = number | string | Uint8Array | null;
  export default function initSqlJs(config?: any): Promise<{
    Database: new (data?: ArrayLike<number> | Buffer | null) => Database;
  }>;
}
