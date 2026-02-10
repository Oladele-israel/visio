import { Controller, Get, Param, Headers, BadRequestException } from '@nestjs/common'
import { RelationsService } from './relation.service'
import { DbContext } from 'src/db/db.context'

@Controller('relation')
export class RelationController {
  constructor(
    private readonly relations: RelationsService,
    private readonly dbContext: DbContext,
  ) {}

  @Get(':table')
  async getRelations(
    @Headers('x-session-id') sessionId: string,
    @Param('table') table: string,
  ) {
    if (!sessionId) {
      throw new BadRequestException('Missing X-Session-Id header')
    }

    this.dbContext.setSession(sessionId)

    return this.relations.getRelations(table)
  }
}
