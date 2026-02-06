export interface Table {
  name: string
  columns: Column[]
}

export interface Column {
  name: string
  dataType: string
  isPrimaryKey: boolean
  isNullable: boolean
}

export interface ForeignKey {
  table: string           // table that has the FK
  column: string          // FK column name
  foreignTable: string    // referenced table
  foreignColumn: string   // referenced column
}
