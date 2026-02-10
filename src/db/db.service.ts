import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DbConfig, DbDriver } from './db.types'
import { DriverFactory } from './drivers/driver.factory'
import { RedisSessionStore } from 'src/common/clients/redis/redis-session.store'
import { randomUUID } from 'crypto'
import { PersistedDbSession } from 'src/common/clients/redis/types'
import { createCrypto } from 'src/common/clients/crypto/crytpo'

@Injectable()
export class DbService {
  private readonly runtimeSessions = new Map<string, DbDriver>()
  private readonly encrypt: (plainText: string) => string
  private readonly decrypt: (payload: string) => string

  constructor(
    private readonly sessionStore: RedisSessionStore<PersistedDbSession>,
    private readonly configService: ConfigService,
  ) {
    const key = this.configService.get<string>('DB_SESSION_KEY')
    if (!key) {
      throw new Error('Missing DB_SESSION_KEY environment variable')
    }
    const cryptoHelpers = createCrypto(key)
    this.encrypt = cryptoHelpers.encrypt
    this.decrypt = cryptoHelpers.decrypt
  }

  async connect(config: DbConfig) {
    const sessionId = randomUUID()

    const encryptedConfig = this.encrypt(JSON.stringify(config))

    const session: PersistedDbSession = {
      sessionId,
      dbType: config.type,
      encryptedConfig,
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
    }

    await this.sessionStore.save(
      `db:session:${sessionId}`,
      session,
      60 * 30, // 30 minutes
    )

      return {
          status: "connected",
          sessionId: sessionId
      }
  }

  async query<T>(sessionId: string, sql: string, params?: any[]) {
    let driver = this.runtimeSessions.get(sessionId)

    if (!driver) {
      driver = await this.rehydrate(sessionId)
    }

    return driver.query<T>(sql, params)
  }

  private async rehydrate(sessionId: string): Promise<DbDriver> {
    const session = await this.sessionStore.get(`db:session:${sessionId}`)

    if (!session) {
      throw new Error('Session expired or invalid')
    }

    const config = JSON.parse(this.decrypt(session.encryptedConfig)) as DbConfig
    const driver = DriverFactory.create(config)

    await driver.connect(config)
    this.runtimeSessions.set(sessionId, driver)

    return driver
  }
}
