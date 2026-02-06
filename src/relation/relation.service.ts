import { Injectable } from "@nestjs/common"
import { DbService } from "src/db/db.service"

@Injectable()
export class RelationsService {
  constructor(private readonly db: DbService) {}

  async getRelations(tableName: string) {
    const outgoing = await this.getOutgoingRelations(tableName)
    const incoming = await this.getIncomingRelations(tableName)

    return {
      table: tableName,
      relations: [...outgoing, ...incoming],
    }
  }

private async getOutgoingRelations(table: string) {
  const result = await this.db.query(`
    SELECT
      con.conname AS constraint_name,
      src.relname AS from_table,
      src_col.attname AS from_column,
      tgt.relname AS to_table,
      tgt_col.attname AS to_column
    FROM pg_constraint con
    JOIN pg_class src ON con.conrelid = src.oid
    JOIN pg_class tgt ON con.confrelid = tgt.oid
    JOIN pg_attribute src_col
      ON src_col.attrelid = src.oid AND src_col.attnum = ANY(con.conkey)
    JOIN pg_attribute tgt_col
      ON tgt_col.attrelid = tgt.oid AND tgt_col.attnum = ANY(con.confkey)
    WHERE con.contype = 'f'
      AND src.relname = $1
  `, [table])

  return result.map(r => ({
    type: 'belongsTo',
    fromTable: r.from_table,
    fromColumn: r.from_column,
    toTable: r.to_table,
    toColumn: r.to_column,
    constraint: r.constraint_name,
  }))
}

private async getIncomingRelations(table: string) {
  const result = await this.db.query(`
    SELECT
      con.conname AS constraint_name,
      src.relname AS from_table,
      src_col.attname AS from_column,
      tgt.relname AS to_table,
      tgt_col.attname AS to_column
    FROM pg_constraint con
    JOIN pg_class src ON con.conrelid = src.oid
    JOIN pg_class tgt ON con.confrelid = tgt.oid
    JOIN pg_attribute src_col
      ON src_col.attrelid = src.oid AND src_col.attnum = ANY(con.conkey)
    JOIN pg_attribute tgt_col
      ON tgt_col.attrelid = tgt.oid AND tgt_col.attnum = ANY(con.confkey)
    WHERE con.contype = 'f'
      AND tgt.relname = $1
  `, [table])

  return result.map(r => ({
    type: 'hasMany',
    fromTable: r.to_table,
    fromColumn: r.to_column,
    toTable: r.from_table,
    toColumn: r.from_column,
    constraint: r.constraint_name,
  }))
}

}
