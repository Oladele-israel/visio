import { Injectable, BadRequestException } from '@nestjs/common'
import { DbContext } from 'src/db/db.context'  // Request-scoped DbContext, NOT DbService
import { QueryParams, QueryResult, RelationQueryInput } from './query.types'
import { RelationsService } from 'src/relation/relation.service'

@Injectable()
export class QueryService {
  constructor(
    private readonly db: DbContext,
    private readonly relationService: RelationsService,
  ) { }

  async queryTable(params: QueryParams): Promise<QueryResult> {
    const { tableName, limit = 20, offset = 0, orderBy, filters } = params

    if (!tableName) {
      throw new BadRequestException('Table name is required')
    }
    if (limit > 100) {
      throw new BadRequestException('Limit too large, max 100')
    }

    // Build WHERE clause and parameter array
    let whereClauses: string[] = []
    let values: any[] = []
    let idx = 1

    if (filters) {
      for (const [col, val] of Object.entries(filters)) {
        whereClauses.push(`"${col}" = $${idx++}`)
        values.push(val)
      }
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''

    // Build ORDER BY clause, basic sanitization
    let orderSql = ''
    if (orderBy) {
      if (!/^[a-zA-Z0-9_]+$/.test(orderBy.column)) {
        throw new BadRequestException('Invalid order by column')
      }
      orderSql = `ORDER BY "${orderBy.column}" ${orderBy.direction === 'desc' ? 'DESC' : 'ASC'}`
    }

    // Compose final SQL query with LIMIT and OFFSET
    const sql = `
      SELECT *
      FROM "${tableName}"
      ${whereSql}
      ${orderSql}
      LIMIT $${idx++}
      OFFSET $${idx++}
    `

    values.push(limit, offset)

    const result = await this.db.query<Record<string, any>>(sql, values)

    const columns = result.length > 0 ? Object.keys(result[0]) : []


    return { columns, rows: result }
  }

  async fetchRelated(input: RelationQueryInput): Promise<QueryResult> {
    const { sourceTable, sourceWhere, targetTable, options } = input

    const { relations } = await this.relationService.getRelations(sourceTable)

    // Find relation where either end matches targetTable
    const relation = relations.find(
      r => r.fromTable === targetTable || r.toTable === targetTable,
    )

    if (!relation) {
      throw new BadRequestException(`No relation between ${sourceTable} and ${targetTable}`)
    }

    // Fetch source rows to extract FK values
    const sourceResult = await this.queryTable({
      tableName: sourceTable,
      filters: sourceWhere,
      limit: 100,
    })

    if (!sourceResult.rows.length) {
      return { columns: [], rows: [] }
    }

    // Extract FK from first row (single-row for now)
    const fkValue = sourceResult.rows[0][relation.fromColumn]

    const filters = { [relation.toColumn]: fkValue }

    return this.queryTable({
      tableName: targetTable,
      filters,
      limit: options?.limit,
      offset: options?.offset,
    })
  }
}
