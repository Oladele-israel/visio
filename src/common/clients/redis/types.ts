export interface SessionStore<T> {
  save(key: string, value: T, ttlSeconds: number): Promise<void>
  get(key: string): Promise<T | null>
  delete(key: string): Promise<void>
}

export interface PersistedDbSession {
  sessionId: string
  dbType: 'postgres' | 'mysql'
  encryptedConfig: string
  createdAt: number
  lastUsedAt: number
}