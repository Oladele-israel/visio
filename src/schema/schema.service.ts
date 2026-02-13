// src/schema/schema.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { DbContext } from 'src/db/db.context';
import { Table, ForeignKey, Column } from './types';
import { CacheService } from 'src/common/clients/cache/cache.service';

@Injectable()
export class SchemaService {
  private readonly logger = new Logger(SchemaService.name);
  private tables: Table[] = [];
  private foreignKeys: ForeignKey[] = [];

  private static readonly CACHE_KEY = 'schema:graph';
  private static readonly CACHE_TTL_SEC = 2 * 60 * 60; // 2 hours

  constructor(
    private readonly db: DbContext,
    private readonly cacheService: CacheService,
  ) {}

  async loadSchema(): Promise<Table[]> {
    // Try cache first
    const cached = await this.cacheService.get<Table[]>(SchemaService.CACHE_KEY);
    if (cached) {
      this.logger.log(`Schema cache hit for key: ${SchemaService.CACHE_KEY}`);
      return cached;
    }

    this.logger.log(`Schema cache miss for key: ${SchemaService.CACHE_KEY}. Loading from DB...`);
    const schema = await this.buildSchema();

    // Save to cache
    await this.cacheService.set(SchemaService.CACHE_KEY, schema, SchemaService.CACHE_TTL_SEC);
    this.logger.log(`Schema cached for key: ${SchemaService.CACHE_KEY} (TTL: ${SchemaService.CACHE_TTL_SEC} sec)`);

    return schema;
  }

  async invalidateSchema(): Promise<void> {
    await this.cacheService.del(SchemaService.CACHE_KEY);
    this.logger.warn(`Schema cache invalidated for key: ${SchemaService.CACHE_KEY}`);
  }

  private async buildSchema(): Promise<Table[]> {
    const tables = await this.loadTables();
    this.foreignKeys = await this.loadForeignKeys();

    for (const table of tables) {
      table.columns = await this.loadColumns(table.name);
    }

    this.tables = tables;
    return tables;
  }

  private async loadTables(): Promise<Table[]> {
    const sql = `
      SELECT relname AS table_name
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relkind = 'r'
    `;
    const rows = await this.db.query<{ table_name: string }>(sql);
    return rows.map(r => ({ name: r.table_name, columns: [] }));
  }

  private async loadColumns(tableName: string): Promise<Column[]> {
    const sql = `
      SELECT
        a.attname AS column_name,
        format_type(a.atttypid, a.atttypmod) AS data_type,
        NOT a.attnotnull AS is_nullable,
        EXISTS (
          SELECT 1
          FROM pg_index i
          WHERE i.indrelid = a.attrelid
            AND i.indisprimary
            AND a.attnum = ANY (i.indkey)
        ) AS is_primary_key
      FROM pg_attribute a
      JOIN pg_class c ON c.oid = a.attrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relname = $1
        AND a.attnum > 0
        AND NOT a.attisdropped
      ORDER BY a.attnum
    `;
    const rows = await this.db.query<{ column_name: string; data_type: string; is_nullable: boolean; is_primary_key: boolean }>(sql, [tableName]);

    return rows.map(r => ({
      name: r.column_name,
      dataType: r.data_type,
      isNullable: r.is_nullable,
      isPrimaryKey: r.is_primary_key,
    }));
  }

  private async loadForeignKeys(): Promise<ForeignKey[]> {
    const sql = `
      SELECT
        conrelid::regclass::text AS table_name,
        a.attname AS column_name,
        confrelid::regclass::text AS foreign_table_name,
        af.attname AS foreign_column_name
      FROM pg_constraint c
      JOIN pg_attribute a
        ON a.attnum = ANY (c.conkey)
        AND a.attrelid = c.conrelid
      JOIN pg_attribute af
        ON af.attnum = ANY (c.confkey)
        AND af.attrelid = c.confrelid
      WHERE c.contype = 'f'
    `;
    return this.db.query<ForeignKey>(sql);
  }

  getForeignKeys(): ForeignKey[] {
    return this.foreignKeys;
  }

  getTable(name: string): Table | undefined {
    return this.tables.find(t => t.name === name);
  }
}
