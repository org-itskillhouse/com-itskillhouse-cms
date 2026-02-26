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

export async function up({ db }: MigrateUpArgs): Promise<void> {
  if (!(await tableExists(db, 'articles'))) {
    return
  }

  // Localized slug is stored in `articles_locales.slug`. Legacy root `articles.slug`
  // (NOT NULL + unique) can break saves after enabling localization.
  if (await columnExists(db, 'articles', 'slug')) {
    await db.run(sql`PRAGMA foreign_keys=OFF;`)

    await db.run(sql.raw(`
      CREATE TABLE \`articles_tmp_localized_slug\` (
        \`id\` integer PRIMARY KEY NOT NULL,
        \`hero_image_id\` integer,
        \`published_at\` text NOT NULL,
        \`is_published\` integer DEFAULT true NOT NULL,
        \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
        \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
        \`meta_title\` text,
        \`meta_description\` text,
        \`meta_image_id\` integer,
        FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
        FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
      );
    `))

    await db.run(sql.raw(`
      INSERT INTO \`articles_tmp_localized_slug\` (
        \`id\`, \`hero_image_id\`, \`published_at\`, \`is_published\`,
        \`updated_at\`, \`created_at\`, \`meta_title\`, \`meta_description\`, \`meta_image_id\`
      )
      SELECT
        \`id\`, \`hero_image_id\`, \`published_at\`, \`is_published\`,
        \`updated_at\`, \`created_at\`, \`meta_title\`, \`meta_description\`, \`meta_image_id\`
      FROM \`articles\`;
    `))

    await db.run(sql.raw('DROP TABLE `articles`;'))
    await db.run(sql.raw('ALTER TABLE `articles_tmp_localized_slug` RENAME TO `articles`;'))

    await db.run(sql.raw('CREATE INDEX IF NOT EXISTS `articles_hero_image_idx` ON `articles` (`hero_image_id`);'))
    await db.run(sql.raw('CREATE INDEX IF NOT EXISTS `articles_meta_image_idx` ON `articles` (`meta_image_id`);'))
    await db.run(sql.raw('CREATE INDEX IF NOT EXISTS `articles_updated_at_idx` ON `articles` (`updated_at`);'))
    await db.run(sql.raw('CREATE INDEX IF NOT EXISTS `articles_created_at_idx` ON `articles` (`created_at`);'))

    await db.run(sql`PRAGMA foreign_keys=ON;`)
  }

  if ((await tableExists(db, 'articles_locales')) && !(await indexExists(db, 'articles_slug_idx'))) {
    await db.run(sql.raw('CREATE UNIQUE INDEX `articles_slug_idx` ON `articles_locales` (`slug`,`_locale`);'))
  }
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  payload.logger.warn('Down migration intentionally not implemented for localized slug cleanup.')
}
