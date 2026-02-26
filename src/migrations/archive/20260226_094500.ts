import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-d1-sqlite'

type QueryResultRow = Record<string, unknown>
type QueryResult = {
  rows?: QueryResultRow[]
  results?: QueryResultRow[]
}

const getRows = (result: QueryResult): QueryResultRow[] => result.rows ?? result.results ?? []

async function tableExists(db: MigrateUpArgs['db'] | MigrateDownArgs['db'], tableName: string): Promise<boolean> {
  const result = (await db.run(
    sql.raw(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = '${tableName}' LIMIT 1;`),
  )) as QueryResult

  return getRows(result).length > 0
}

async function indexExists(db: MigrateUpArgs['db'] | MigrateDownArgs['db'], indexName: string): Promise<boolean> {
  const result = (await db.run(
    sql.raw(`SELECT name FROM sqlite_master WHERE type = 'index' AND name = '${indexName}' LIMIT 1;`),
  )) as QueryResult

  return getRows(result).length > 0
}

async function columnExists(
  db: MigrateUpArgs['db'] | MigrateDownArgs['db'],
  tableName: string,
  columnName: string,
): Promise<boolean> {
  if (!(await tableExists(db, tableName))) {
    return false
  }

  const result = (await db.run(sql.raw(`PRAGMA table_info(${tableName});`))) as QueryResult
  return getRows(result).some((row) => String(row.name) === columnName)
}

async function ensureIndex(
  db: MigrateUpArgs['db'] | MigrateDownArgs['db'],
  indexName: string,
  statement: string,
): Promise<void> {
  if (!(await indexExists(db, indexName))) {
    await db.run(sql.raw(statement))
  }
}

async function ensureColumn(
  db: MigrateUpArgs['db'] | MigrateDownArgs['db'],
  tableName: string,
  columnName: string,
  columnSqlType: string,
): Promise<void> {
  if (!(await tableExists(db, tableName))) {
    return
  }

  if (!(await columnExists(db, tableName, columnName))) {
    await db.run(sql.raw(`ALTER TABLE \`${tableName}\` ADD \`${columnName}\` ${columnSqlType};`))
  }
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)

  if (!(await tableExists(db, 'payload_mcp_api_keys'))) {
    await db.run(sql`CREATE TABLE \`payload_mcp_api_keys\` (
      \`id\` integer PRIMARY KEY NOT NULL,
      \`user_id\` text NOT NULL,
      \`label\` text,
      \`description\` text,
      \`articles_find\` numeric DEFAULT 1,
      \`articles_create\` numeric DEFAULT 1,
      \`articles_update\` numeric DEFAULT 1,
      \`articles_delete\` numeric DEFAULT 1,
      \`media_find\` numeric DEFAULT 1,
      \`questions_find\` numeric DEFAULT 1,
      \`enable_api_key\` numeric DEFAULT 1,
      \`api_key\` text,
      \`api_key_index\` text,
      \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
      \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
      FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`)
  }

  await ensureColumn(db, 'payload_mcp_api_keys', 'user_id', 'text')
  await ensureColumn(db, 'payload_mcp_api_keys', 'label', 'text')
  await ensureColumn(db, 'payload_mcp_api_keys', 'description', 'text')
  await ensureColumn(db, 'payload_mcp_api_keys', 'articles_find', 'numeric DEFAULT 1')
  await ensureColumn(db, 'payload_mcp_api_keys', 'articles_create', 'numeric DEFAULT 1')
  await ensureColumn(db, 'payload_mcp_api_keys', 'articles_update', 'numeric DEFAULT 1')
  await ensureColumn(db, 'payload_mcp_api_keys', 'articles_delete', 'numeric DEFAULT 1')
  await ensureColumn(db, 'payload_mcp_api_keys', 'media_find', 'numeric DEFAULT 1')
  await ensureColumn(db, 'payload_mcp_api_keys', 'questions_find', 'numeric DEFAULT 1')
  await ensureColumn(db, 'payload_mcp_api_keys', 'enable_api_key', 'numeric DEFAULT 1')
  await ensureColumn(db, 'payload_mcp_api_keys', 'api_key', 'text')
  await ensureColumn(db, 'payload_mcp_api_keys', 'api_key_index', 'text')
  await ensureColumn(
    db,
    'payload_mcp_api_keys',
    'updated_at',
    `text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL`,
  )
  await ensureColumn(
    db,
    'payload_mcp_api_keys',
    'created_at',
    `text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL`,
  )

  await ensureIndex(
    db,
    'payload_mcp_api_keys_user_id_idx',
    'CREATE INDEX `payload_mcp_api_keys_user_id_idx` ON `payload_mcp_api_keys` (`user_id`);',
  )
  await ensureIndex(
    db,
    'payload_mcp_api_keys_updated_at_idx',
    'CREATE INDEX `payload_mcp_api_keys_updated_at_idx` ON `payload_mcp_api_keys` (`updated_at`);',
  )
  await ensureIndex(
    db,
    'payload_mcp_api_keys_created_at_idx',
    'CREATE INDEX `payload_mcp_api_keys_created_at_idx` ON `payload_mcp_api_keys` (`created_at`);',
  )
  await ensureIndex(
    db,
    'payload_mcp_api_keys_api_key_index_idx',
    'CREATE UNIQUE INDEX `payload_mcp_api_keys_api_key_index_idx` ON `payload_mcp_api_keys` (`api_key_index`);',
  )

  await ensureColumn(db, 'payload_locked_documents_rels', 'payload_mcp_api_keys_id', 'integer')
  await ensureIndex(
    db,
    'payload_locked_documents_rels_payload_mcp_api_keys_id_idx',
    'CREATE INDEX `payload_locked_documents_rels_payload_mcp_api_keys_id_idx` ON `payload_locked_documents_rels` (`payload_mcp_api_keys_id`);',
  )

  await ensureColumn(db, 'payload_preferences_rels', 'payload_mcp_api_keys_id', 'integer')
  await ensureIndex(
    db,
    'payload_preferences_rels_payload_mcp_api_keys_id_idx',
    'CREATE INDEX `payload_preferences_rels_payload_mcp_api_keys_id_idx` ON `payload_preferences_rels` (`payload_mcp_api_keys_id`);',
  )

  await db.run(sql`PRAGMA foreign_keys=ON;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`DROP TABLE IF EXISTS \`payload_mcp_api_keys\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
}
