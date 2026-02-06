import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe, Post, Param, Body } from '@nestjs/common'
import { QueryService } from './query.service'
import type { QueryParams, RelationQueryInput } from './query.types'

@Controller('query')
export class QueryController {
  constructor(private readonly queryService: QueryService) {}

  @Post('relations/query')
  async queryRelations(
    @Body() body: RelationQueryInput,
  ) {
    return this.queryService.fetchRelated(body)
  }

  @Post(':table/query')
  async queryTable(
    @Param('table') table: string,
    @Body() body: Omit<QueryParams, 'tableName'>,
  ) {
    return this.queryService.queryTable({
      tableName: table,
      ...body,
    })
  }

  @Get(':table/rows/:pk/relations/:relationTable')
  async getRowRelations(
    @Param('table') table: string,
    @Param('pk') pk: string,
    @Param('relationTable') relationTable: string,
  ) {
    return this.queryService.fetchRelated({
      sourceTable: table,
      sourceWhere: { pk: Number(pk) },
      targetTable: relationTable,
    })
  }
}
