export interface QueryParams {
  tableName: string
  limit?: number
  offset?: number
  orderBy?: {
    column: string
    direction: 'asc' | 'desc'
  }
  filters?: {
    [columnName: string]: any
  }
}

export interface QueryResult {
  columns: string[]
  rows: any[]
}


export interface RelationQueryInput {
  sourceTable: string
  sourceWhere: Record<string, any>
  targetTable: string
  options?: {
    limit?: number
    offset?: number
    orderBy?: string
  }
}