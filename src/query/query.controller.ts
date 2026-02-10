import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Headers,
  BadRequestException,
} from '@nestjs/common'
import { QueryService } from './query.service'
import type { QueryParams, RelationQueryInput } from './query.types'
import { DbContext } from 'src/db/db.context'

@Controller('query')
export class QueryController {
  constructor(
    private readonly queryService: QueryService,
    private readonly dbContext: DbContext,  // Inject request-scoped DbContext
  ) {}

  // Helper to extract sessionId header and set DbContext session
  private setDbSession(sessionId: string | undefined) {
    if (!sessionId) {
      throw new BadRequestException('Missing X-Session-Id header')
    }
    this.dbContext.setSession(sessionId)
  }

  @Post('relations/query')
  async queryRelations(
    @Headers('x-session-id') sessionId: string,
    @Body() body: RelationQueryInput,
  ) {
    this.setDbSession(sessionId)
    return this.queryService.fetchRelated(body)
  }

  @Post(':table/query')
  async queryTable(
    @Headers('x-session-id') sessionId: string,
    @Param('table') table: string,
    @Body() body: Omit<QueryParams, 'tableName'>,
  ) {
    this.setDbSession(sessionId)
    return this.queryService.queryTable({
      tableName: table,
      ...body,
    })
  }

  @Get(':table/rows/:pk/relations/:relationTable')
  async getRowRelations(
    @Headers('x-session-id') sessionId: string,
    @Param('table') table: string,
    @Param('pk') pk: string,
    @Param('relationTable') relationTable: string,
  ) {
    this.setDbSession(sessionId)
    return this.queryService.fetchRelated({
      sourceTable: table,
      sourceWhere: { pk: Number(pk) },
      targetTable: relationTable,
    })
  }
}
