import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-d1-sqlite'

type QueryRow = Record<string, unknown>
type QueryResult = { rows?: QueryRow[]; results?: QueryRow[] }

const rows = (result: QueryResult): QueryRow[] => result.rows ?? result.results ?? []

async function tableExists(db: MigrateUpArgs['db'] | MigrateDownArgs['db'], tableName: string): Promise<boolean> {
  const result = (await db.run(
    sql.raw(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = '${tableName}' LIMIT 1;`),
  )) as QueryResult

  return rows(result).length > 0
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
  return rows(result).some((row) => String(row.name) === columnName)
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

const seoLocalesTables = [
  'articles_locales',
  'questions_locales',
  'articles_page_locales',
  'contracting_page_locales',
  'contractors_page_locales',
  'home_page_locales',
  'privacy_page_locales',
  'projects_page_locales',
  'questions_page_locales',
  'recruitment_page_locales',
] as const

const seoExtraColumns: Array<{ name: string; type: string }> = [
  { name: 'meta_canonical_url', type: 'text' },
  { name: 'meta_robots_index', type: 'numeric DEFAULT 1' },
  { name: 'meta_robots_follow', type: 'numeric DEFAULT 1' },
  { name: 'meta_open_graph_type', type: 'text' },
  { name: 'meta_twitter_card', type: 'text' },
  { name: 'meta_structured_data_json', type: 'text' },
]

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)

  for (const tableName of seoLocalesTables) {
    for (const column of seoExtraColumns) {
      await ensureColumn(db, tableName, column.name, column.type)
    }
  }

  await db.run(sql`PRAGMA foreign_keys=ON;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  // SQLite/D1 does not safely support generic DROP COLUMN across all deployed states.
  await db.run(sql`PRAGMA foreign_keys=ON;`)
}
