export type DbType = 'postgres' | 'mysql'

export interface DbConfig {
  type: DbType
  host: string
  port: number
  database: string
  user: string
  password: string
  ssl?: boolean
}


export interface DbDriver {
  connect(config: DbConfig): Promise<void>
  getPool(): unknown
  query<T = any>(sql: string, params?: any[]): Promise<T[]>
  close(): Promise<void>
}
