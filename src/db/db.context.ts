import { Injectable, Scope, BadRequestException } from '@nestjs/common'
import { DbService } from './db.service'

@Injectable({ scope: Scope.REQUEST })
export class DbContext {
  private sessionId: string | null = null

  constructor(private readonly dbService: DbService) {}

  setSession(sessionId: string) {
    this.sessionId = sessionId
  }

  async query<T>(sql: string, params?: any[]): Promise<T[]> {
    if (!this.sessionId) {
      throw new BadRequestException('DB session not initialized')
    }

    return this.dbService.query<T>(this.sessionId, sql, params)
  }
}
