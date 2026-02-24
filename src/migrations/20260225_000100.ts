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

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)

  if ((await tableExists(db, 'articles_page_locales')) && !(await columnExists(db, 'articles_page_locales', 'body'))) {
    await db.run(sql.raw('ALTER TABLE `articles_page_locales` ADD `body` text;'))
  }

  await db.run(sql`PRAGMA foreign_keys=ON;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  // No safe generic DROP COLUMN for D1 across mixed deployed states.
  await db.run(sql`PRAGMA foreign_keys=ON;`)
}
