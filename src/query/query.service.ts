import { Injectable, BadRequestException } from '@nestjs/common'
import { DbService } from 'src/db/db.service'
import { QueryParams, QueryResult, RelationQueryInput } from './query.types'
import { RelationsService } from 'src/relation/relation.service'

@Injectable()
export class QueryService {
  constructor(private readonly db: DbService,
    private readonly relationService: RelationsService,
  ) { }

  async queryTable(params: QueryParams): Promise<QueryResult> {
    const { tableName, limit = 20, offset = 0, orderBy, filters } = params

    // Basic validation
    if (!tableName) {
      throw new BadRequestException('Table name is required')
    }
    if (limit > 100) {
      throw new BadRequestException('Limit too large, max 100')
    }

    // Build WHERE clause from filters
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

    // Build ORDER BY clause
    let orderSql = ''
    if (orderBy) {
      // Sanitize column name (basic)
      if (!/^[a-zA-Z0-9_]+$/.test(orderBy.column)) {
        throw new BadRequestException('Invalid order by column')
      }
      orderSql = `ORDER BY "${orderBy.column}" ${orderBy.direction === 'desc' ? 'DESC' : 'ASC'}`
    }

    // Final query
    const sql = `
      SELECT *
      FROM "${tableName}"
      ${whereSql}
      ${orderSql}
      LIMIT $${idx++}
      OFFSET $${idx++}
    `

    values.push(limit, offset)

    const result = await this.db.query(sql, values)

    // Get columns from the first row or empty array
    const columns = result.length > 0 ? Object.keys(result[0]) : []

    return {
      columns,
      rows: result,
    }
  }

  async fetchRelated(input: RelationQueryInput): Promise<QueryResult> {
  const {
    sourceTable,
    sourceWhere,
    targetTable,
    options,
  } = input

  const { relations } = await this.relationService.getRelations(sourceTable)

  const relation = relations.find(r =>
    r.fromTable === targetTable || r.toTable === targetTable
  )

  if (!relation) {
    throw new BadRequestException(
      `No relation between ${sourceTable} and ${targetTable}`,
    )
  }

  // 1️⃣ Fetch source rows
  const sourceResult = await this.queryTable({
    tableName: sourceTable,
    filters: sourceWhere,
    limit: 100, // safe upper bound
  })

  if (!sourceResult.rows.length) {
    return { columns: [], rows: [] }
  }

  // 2️⃣ Extract FK values
  const fkValues = sourceResult.rows.map(
    row => row[relation.fromColumn],
  )

  // 3️⃣ Fetch related rows
  const filters = {
    [relation.toColumn]: fkValues[0], // single-row for now
  }

  return this.queryTable({
    tableName: targetTable,
    filters,
    limit: options?.limit,
    offset: options?.offset,
  })
}

}