import { Pool } from 'pg'
import { DbDriver, DbConfig } from '../db.types'

// when using supabase db use session pooler instead of direct database connection

export class PostgresDriver implements DbDriver {
  private pool!: Pool

  async connect(config: DbConfig) {
    if (!config.host) {
      throw new Error('Postgres config error: host is required')
    }

    const ssl = this.resolveSsl(config.ssl)

    this.pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl,
      max: 5,
      idleTimeoutMillis: 10_000,
      statement_timeout: 30_000,
      connectionTimeoutMillis: 10_000,
      // family: config.family || 4,
    })

    try {
      await this.pool.query('select 1')
      console.log(
        `[PostgresDriver] Connected to ${config.host}:${config.port}/${config.database}`
      )
    } catch (err: any) {
      console.error('[PostgresDriver] Connection failed', {
        host: config.host,
        port: config.port,
        database: config.database,
        ssl: !!ssl,
        error: err.message,
      })
      throw err
    }
  }

  private resolveSsl(
    ssl?: boolean | { rejectUnauthorized?: boolean; [key: string]: any }
  ): false | { rejectUnauthorized: boolean } {
    if (!ssl) return false
    if (ssl === true) return { rejectUnauthorized: false }
    return {
      rejectUnauthorized: ssl.rejectUnauthorized ?? false,
      ...ssl,
    }
  }

  getPool() {
    return this.pool
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const { rows } = await this.pool.query(sql, params)
    return rows
  }

  async close() {
    await this.pool.end()
  }
}
