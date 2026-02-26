import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-d1-sqlite'

type QueryResultRow = Record<string, unknown>
type QueryResult = {
  rows?: QueryResultRow[]
  results?: QueryResultRow[]
}

const getRows = (result: QueryResult): QueryResultRow[] => result.rows ?? result.results ?? []

const tableExists = async (db: MigrateUpArgs['db'] | MigrateDownArgs['db'], tableName: string): Promise<boolean> => {
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

const indexExists = async (db: MigrateUpArgs['db'] | MigrateDownArgs['db'], indexName: string): Promise<boolean> => {
  const result = (await db.run(
    sql.raw(`SELECT name FROM sqlite_master WHERE type = 'index' AND name = '${indexName}' LIMIT 1;`),
  )) as QueryResult

  return getRows(result).length > 0
}

const detectArticleTables = async (db: MigrateUpArgs['db'] | MigrateDownArgs['db']) => {
  if (await tableExists(db, 'articles')) {
    return {
      articlesTable: 'articles',
      localesTable: 'articles_locales',
      localizedSlugIndex: 'articles_slug_idx',
    } as const
  }

  if (await tableExists(db, 'news_articles')) {
    return {
      articlesTable: 'news_articles',
      localesTable: 'news_articles_locales',
      localizedSlugIndex: 'news_articles_slug_idx',
    } as const
  }

  return null
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const tables = await detectArticleTables(db)
  if (!tables || !(await tableExists(db, tables.localesTable))) {
    return
  }

  if (!(await columnExists(db, tables.localesTable, 'slug'))) {
    await db.run(sql.raw(`ALTER TABLE \`${tables.localesTable}\` ADD \`slug\` text;`))
  }

  const parentHasSlug = await columnExists(db, tables.articlesTable, 'slug')
  if (parentHasSlug) {
    await db.run(
      sql.raw(`
        UPDATE \`${tables.localesTable}\`
        SET slug = (
          SELECT a.slug
          FROM \`${tables.articlesTable}\` a
          WHERE a.id = \`${tables.localesTable}\`._parent_id
        )
        WHERE slug IS NULL OR slug = '';
      `),
    )
  }

  await db.run(
    sql.raw(`
      UPDATE \`${tables.localesTable}\`
      SET slug = 'article-' || _parent_id || '-' || _locale
      WHERE slug IS NULL OR slug = '';
    `),
  )

  if (!(await indexExists(db, tables.localizedSlugIndex))) {
    await db.run(
      sql.raw(
        `CREATE UNIQUE INDEX \`${tables.localizedSlugIndex}\` ON \`${tables.localesTable}\` (\`slug\`,\`_locale\`);`,
      ),
    )
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  const tables = await detectArticleTables(db)
  if (!tables) {
    return
  }

  if (await indexExists(db, tables.localizedSlugIndex)) {
    await db.run(sql.raw(`DROP INDEX \`${tables.localizedSlugIndex}\`;`))
  }
}
