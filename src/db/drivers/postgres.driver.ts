import { Pool } from 'pg'
import { DbDriver } from '../db.types'
import { DbConfig } from '../db.types'

export class PostgresDriver implements DbDriver {
  private pool: Pool

  async connect(config: DbConfig) {
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: config.ssl,
      max: 5,
      idleTimeoutMillis: 10_000,
      statement_timeout: 2_000
    })
  }

  getPool() {
    return this.pool
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const result = await this.pool.query(sql, params)
    return result.rows
  }

  async close() {
    await this.pool?.end()
  }
}
