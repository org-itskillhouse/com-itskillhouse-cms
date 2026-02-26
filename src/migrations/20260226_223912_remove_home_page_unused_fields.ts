import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-d1-sqlite'

type QueryResultRow = Record<string, unknown>
type QueryResult = {
  rows?: QueryResultRow[]
  results?: QueryResultRow[]
}

const getRows = (result: QueryResult): QueryResultRow[] => result.rows ?? result.results ?? []

const tableExists = async (
  db: MigrateUpArgs['db'] | MigrateDownArgs['db'],
  tableName: string,
): Promise<boolean> => {
  const result = (await db.run(
    sql.raw(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = '${tableName}' LIMIT 1;`),
  )) as QueryResult

  return getRows(result).length > 0
}

const columnExists = async (
  db: MigrateUpArgs['db'] | MigrateDownArgs['db'],
  tableName: string,
  columnName: string,
): Promise<boolean> => {
  if (!(await tableExists(db, tableName))) {
    return false
  }

  const result = (await db.run(sql.raw(`PRAGMA table_info(${tableName});`))) as QueryResult
  return getRows(result).some((row) => String(row.name) === columnName)
}

const dropColumnIfExists = async (
  db: MigrateUpArgs['db'],
  tableName: string,
  columnName: string,
): Promise<void> => {
  if (await columnExists(db, tableName, columnName)) {
    await db.run(sql.raw(`ALTER TABLE \`${tableName}\` DROP COLUMN \`${columnName}\`;`))
  }
}

const addColumnIfMissing = async (
  db: MigrateDownArgs['db'],
  tableName: string,
  columnName: string,
  definition: string,
): Promise<void> => {
  if (!(await columnExists(db, tableName, columnName))) {
    await db.run(sql.raw(`ALTER TABLE \`${tableName}\` ADD \`${columnName}\` ${definition};`))
  }
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await dropColumnIfExists(db, 'home_page', 'cta_href')
  await dropColumnIfExists(db, 'home_page_locales', 'subtitle')
  await dropColumnIfExists(db, 'home_page_locales', 'cta_label')
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await addColumnIfMissing(db, 'home_page', 'cta_href', 'text')
  await addColumnIfMissing(db, 'home_page_locales', 'subtitle', 'text')
  await addColumnIfMissing(db, 'home_page_locales', 'cta_label', 'text')
}
