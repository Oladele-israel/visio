import { BadRequestException, Injectable, Logger, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DbConfig, DbDriver } from './db.types'
import { DriverFactory } from './drivers/driver.factory'
import { randomUUID } from 'crypto'
import { createCrypto } from 'src/common/clients/crypto/crytpo'
import { CacheService } from 'src/common/clients/cache/cache.service'

interface PersistedDbSession {
  sessionId: string
  dbType: string
  encryptedConfig: string
  createdAt: number
  lastUsedAt: number
}


@Injectable()
export class DbService {
  private readonly logger = new Logger(DbService.name)
  private readonly runtimeSessions = new Map<string, DbDriver>()
  private readonly encrypt: (plainText: string) => string
  private readonly decrypt: (payload: string) => string


  private static readonly SESSION_TTL = 60 * 30 // 30 minutes
  private static readonly SESSION_PREFIX = 'db:session:'


  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
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
    const sessionKey = `${DbService.SESSION_PREFIX}${sessionId}`

    const driver = DriverFactory.create(config)

    try {
      await driver.connect(config)
      await driver.query('SELECT 1')
      const encryptedConfig = this.encrypt(JSON.stringify(config))
      const session: PersistedDbSession = {
        sessionId,
        dbType: config.type,
        encryptedConfig,
        createdAt: Date.now(),
        lastUsedAt: Date.now(),
      }

      await this.cacheService.set(
        sessionKey,
        session,
        DbService.SESSION_TTL,
      )

      this.runtimeSessions.set(sessionId, driver)

      this.logger.log(`DB session ${sessionId} successfully established`)

      return {
        status: 'connected',
        sessionId,
      }

    } catch (error: any) {
      this.logger.error(
        `Failed to establish DB session`,
        error?.stack || error,
      )

      try {
        await driver.close()
      } catch { }

      const message = error?.message || 'Unknown database error'
      if (message.includes('does not exist')) {
        throw new BadRequestException({
          error: 'Invalid database',
          message: `Database "${config.database}" does not exist`,
        })
      }

      if (message.includes('password authentication failed')) {
        throw new UnauthorizedException({
          error: 'Authentication failed',
          message: 'Invalid database credentials',
        })
      }

      if (
        message.includes('ECONNREFUSED') ||
        message.includes('connect ECONNREFUSED')
      ) {
        throw new ServiceUnavailableException({
          error: 'Database unreachable',
          message: 'Unable to reach database server',
        })
      }

      throw new ServiceUnavailableException({
        error: 'Connection failed',
        message: 'Unable to establish database connection',
      })
    }
  }

  async query<T>(sessionId: string, sql: string, params?: any[]) {
    let driver = this.runtimeSessions.get(sessionId)

    if (!driver) {
      driver = await this.rehydrate(sessionId)
    }

    await this.validateConnection(driver)

    return driver.query<T>(sql, params)
  }

  private async rehydrate(sessionId: string): Promise<DbDriver> {
    const session = await this.cacheService.get<PersistedDbSession>(
      `${DbService.SESSION_PREFIX}${sessionId}`,
    )

    if (!session) {
      throw new Error('Session expired or invalid')
    }

    const config = JSON.parse(
      this.decrypt(session.encryptedConfig),
    ) as DbConfig

    const driver = DriverFactory.create(config)

    await driver.connect(config)

    this.runtimeSessions.set(sessionId, driver)

    this.logger.log(`Rehydrated DB session ${sessionId}`)

    return driver
  }

  private async validateConnection(driver: DbDriver) {
    await driver.query('SELECT 1')
  }
}
