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
  const result = (await db.run(sql.raw(`PRAGMA table_info(${tableName});`))) as QueryResult
  return getRows(result).some((row) => String(row.name) === columnName)
}

async function renameTableIfExists(
  db: MigrateUpArgs['db'] | MigrateDownArgs['db'],
  from: string,
  to: string,
): Promise<void> {
  if ((await tableExists(db, from)) && !(await tableExists(db, to))) {
    await db.run(sql.raw(`ALTER TABLE \`${from}\` RENAME TO \`${to}\`;`))
  }
}

async function renameColumnIfExists(
  db: MigrateUpArgs['db'] | MigrateDownArgs['db'],
  tableName: string,
  from: string,
  to: string,
): Promise<void> {
  if ((await columnExists(db, tableName, from)) && !(await columnExists(db, tableName, to))) {
    await db.run(sql.raw(`ALTER TABLE \`${tableName}\` RENAME COLUMN \`${from}\` TO \`${to}\`;`))
  }
}

async function recreateIndex(
  db: MigrateUpArgs['db'] | MigrateDownArgs['db'],
  oldIndex: string,
  newIndex: string,
  tableName: string,
  columnName: string,
): Promise<void> {
  if (await indexExists(db, oldIndex)) {
    await db.run(sql.raw(`DROP INDEX \`${oldIndex}\`;`))
  }

  if (!(await indexExists(db, newIndex))) {
    await db.run(sql.raw(`CREATE INDEX \`${newIndex}\` ON \`${tableName}\` (\`${columnName}\`);`))
  }
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)

  // Collections
  await renameTableIfExists(db, 'news_articles', 'articles')
  await renameTableIfExists(db, 'news_articles_locales', 'articles_locales')
  await renameTableIfExists(db, 'faq_items', 'questions')
  await renameTableIfExists(db, 'faq_items_locales', 'questions_locales')

  // Globals
  await renameTableIfExists(db, 'it_contracting_page', 'contracting_page')
  await renameTableIfExists(db, 'it_contracting_page_locales', 'contracting_page_locales')
  await renameTableIfExists(db, 'it_recruitment_page', 'recruitment_page')
  await renameTableIfExists(db, 'it_recruitment_page_locales', 'recruitment_page_locales')

  // Locked docs relation columns + indexes
  const relTable = 'payload_locked_documents_rels'
  if (await tableExists(db, relTable)) {
    await renameColumnIfExists(db, relTable, 'news_articles_id', 'articles_id')
    await renameColumnIfExists(db, relTable, 'faq_items_id', 'questions_id')
    await renameColumnIfExists(db, relTable, 'it_contracting_page_id', 'contracting_page_id')
    await renameColumnIfExists(db, relTable, 'it_recruitment_page_id', 'recruitment_page_id')

    await recreateIndex(
      db,
      'payload_locked_documents_rels_news_articles_id_idx',
      'payload_locked_documents_rels_articles_id_idx',
      relTable,
      'articles_id',
    )
    await recreateIndex(
      db,
      'payload_locked_documents_rels_faq_items_id_idx',
      'payload_locked_documents_rels_questions_id_idx',
      relTable,
      'questions_id',
    )
    await recreateIndex(
      db,
      'payload_locked_documents_rels_it_contracting_page_id_idx',
      'payload_locked_documents_rels_contracting_page_id_idx',
      relTable,
      'contracting_page_id',
    )
    await recreateIndex(
      db,
      'payload_locked_documents_rels_it_recruitment_page_id_idx',
      'payload_locked_documents_rels_recruitment_page_id_idx',
      relTable,
      'recruitment_page_id',
    )
  }

  await db.run(sql`PRAGMA foreign_keys=ON;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)

  // Collections
  await renameTableIfExists(db, 'articles', 'news_articles')
  await renameTableIfExists(db, 'articles_locales', 'news_articles_locales')
  await renameTableIfExists(db, 'questions', 'faq_items')
  await renameTableIfExists(db, 'questions_locales', 'faq_items_locales')

  // Globals
  await renameTableIfExists(db, 'contracting_page', 'it_contracting_page')
  await renameTableIfExists(db, 'contracting_page_locales', 'it_contracting_page_locales')
  await renameTableIfExists(db, 'recruitment_page', 'it_recruitment_page')
  await renameTableIfExists(db, 'recruitment_page_locales', 'it_recruitment_page_locales')

  // Locked docs relation columns + indexes
  const relTable = 'payload_locked_documents_rels'
  if (await tableExists(db, relTable)) {
    await renameColumnIfExists(db, relTable, 'articles_id', 'news_articles_id')
    await renameColumnIfExists(db, relTable, 'questions_id', 'faq_items_id')
    await renameColumnIfExists(db, relTable, 'contracting_page_id', 'it_contracting_page_id')
    await renameColumnIfExists(db, relTable, 'recruitment_page_id', 'it_recruitment_page_id')

    await recreateIndex(
      db,
      'payload_locked_documents_rels_articles_id_idx',
      'payload_locked_documents_rels_news_articles_id_idx',
      relTable,
      'news_articles_id',
    )
    await recreateIndex(
      db,
      'payload_locked_documents_rels_questions_id_idx',
      'payload_locked_documents_rels_faq_items_id_idx',
      relTable,
      'faq_items_id',
    )
    await recreateIndex(
      db,
      'payload_locked_documents_rels_contracting_page_id_idx',
      'payload_locked_documents_rels_it_contracting_page_id_idx',
      relTable,
      'it_contracting_page_id',
    )
    await recreateIndex(
      db,
      'payload_locked_documents_rels_recruitment_page_id_idx',
      'payload_locked_documents_rels_it_recruitment_page_id_idx',
      relTable,
      'it_recruitment_page_id',
    )
  }

  await db.run(sql`PRAGMA foreign_keys=ON;`)
}
