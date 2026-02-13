export type DbType = 'postgres' | 'mysql'

export interface DbConfig {
  type: DbType
  host: string
  port: number
  database: string
  user: string
  password: string
    ssl?: boolean | {
    rejectUnauthorized?: boolean
    [key: string]: any
  }
  family: number
}


export interface DbDriver {
  connect(config: DbConfig): Promise<void>
  getPool(): unknown
  query<T = any>(sql: string, params?: any[]): Promise<T[]>
  close(): Promise<void>
}


export interface ConnectionSession {
  id: string
  driver: DbDriver
  createdAt: number
  lastUsedAt: number
}


interface PersistedDbSession {
  sessionId: string
  dbType: string
  encryptedConfig: string
  createdAt: number
  lastUsedAt: number
}
