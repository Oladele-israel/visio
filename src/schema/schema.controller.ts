import { Controller, Get, Headers, BadRequestException } from '@nestjs/common'
import { SchemaService } from './schema.service'
import { DbContext } from 'src/db/db.context'

@Controller('schema')
export class SchemaController {
  constructor(
    private readonly schemaService: SchemaService,
    private readonly dbContext: DbContext,
  ) {}

  /**
   * Returns all tables and their columns
   */
  @Get()
  async getSchema(@Headers('x-session-id') sessionId: string) {
    if (!sessionId) {
      throw new BadRequestException('Missing X-Session-Id header')
    }

    this.dbContext.setSession(sessionId)
    return this.schemaService.loadSchema()
  }
}
