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

async function indexExists(db: MigrateUpArgs['db'] | MigrateDownArgs['db'], indexName: string): Promise<boolean> {
  const result = (await db.run(
    sql.raw(`SELECT name FROM sqlite_master WHERE type = 'index' AND name = '${indexName}' LIMIT 1;`),
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

async function createProjectsGlobals(db: MigrateUpArgs['db']): Promise<void> {
  await db.run(sql.raw(`
    CREATE TABLE IF NOT EXISTS \`projects_page\` (
      \`id\` integer PRIMARY KEY NOT NULL,
      \`updated_at\` text,
      \`created_at\` text
    );
  `))

  await db.run(sql.raw(`
    CREATE TABLE IF NOT EXISTS \`projects_page_locales\` (
      \`title\` text NOT NULL,
      \`intro\` text,
      \`id\` integer PRIMARY KEY NOT NULL,
      \`_locale\` text NOT NULL,
      \`_parent_id\` integer NOT NULL,
      FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );
  `))

  if (!(await indexExists(db, 'projects_page_locales_locale_parent_id_unique'))) {
    await db.run(
      sql.raw(
        'CREATE UNIQUE INDEX `projects_page_locales_locale_parent_id_unique` ON `projects_page_locales` (`_locale`,`_parent_id`);',
      ),
    )
  }
}

async function createContractorsGlobals(db: MigrateUpArgs['db']): Promise<void> {
  await db.run(sql.raw(`
    CREATE TABLE IF NOT EXISTS \`contractors_page\` (
      \`id\` integer PRIMARY KEY NOT NULL,
      \`updated_at\` text,
      \`created_at\` text
    );
  `))

  await db.run(sql.raw(`
    CREATE TABLE IF NOT EXISTS \`contractors_page_locales\` (
      \`title\` text NOT NULL,
      \`intro\` text,
      \`id\` integer PRIMARY KEY NOT NULL,
      \`_locale\` text NOT NULL,
      \`_parent_id\` integer NOT NULL,
      FOREIGN KEY (\`_parent_id\`) REFERENCES \`contractors_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );
  `))

  if (!(await indexExists(db, 'contractors_page_locales_locale_parent_id_unique'))) {
    await db.run(
      sql.raw(
        'CREATE UNIQUE INDEX `contractors_page_locales_locale_parent_id_unique` ON `contractors_page_locales` (`_locale`,`_parent_id`);',
      ),
    )
  }
}

async function createContractingGlobals(db: MigrateUpArgs['db']): Promise<void> {
  await db.run(sql.raw(`
    CREATE TABLE IF NOT EXISTS \`contracting_page\` (
      \`id\` integer PRIMARY KEY NOT NULL,
      \`updated_at\` text,
      \`created_at\` text
    );
  `))

  await db.run(sql.raw(`
    CREATE TABLE IF NOT EXISTS \`contracting_page_locales\` (
      \`title\` text NOT NULL,
      \`intro\` text,
      \`body\` text,
      \`id\` integer PRIMARY KEY NOT NULL,
      \`_locale\` text NOT NULL,
      \`_parent_id\` integer NOT NULL,
      FOREIGN KEY (\`_parent_id\`) REFERENCES \`contracting_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );
  `))

  if (!(await indexExists(db, 'contracting_page_locales_locale_parent_id_unique'))) {
    await db.run(
      sql.raw(
        'CREATE UNIQUE INDEX `contracting_page_locales_locale_parent_id_unique` ON `contracting_page_locales` (`_locale`,`_parent_id`);',
      ),
    )
  }
}

async function createRecruitmentGlobals(db: MigrateUpArgs['db']): Promise<void> {
  await db.run(sql.raw(`
    CREATE TABLE IF NOT EXISTS \`recruitment_page\` (
      \`id\` integer PRIMARY KEY NOT NULL,
      \`updated_at\` text,
      \`created_at\` text
    );
  `))

  await db.run(sql.raw(`
    CREATE TABLE IF NOT EXISTS \`recruitment_page_locales\` (
      \`title\` text NOT NULL,
      \`intro\` text,
      \`body\` text,
      \`id\` integer PRIMARY KEY NOT NULL,
      \`_locale\` text NOT NULL,
      \`_parent_id\` integer NOT NULL,
      FOREIGN KEY (\`_parent_id\`) REFERENCES \`recruitment_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );
  `))

  if (!(await indexExists(db, 'recruitment_page_locales_locale_parent_id_unique'))) {
    await db.run(
      sql.raw(
        'CREATE UNIQUE INDEX `recruitment_page_locales_locale_parent_id_unique` ON `recruitment_page_locales` (`_locale`,`_parent_id`);',
      ),
    )
  }
}

async function createQuestionsGlobals(db: MigrateUpArgs['db']): Promise<void> {
  await db.run(sql.raw(`
    CREATE TABLE IF NOT EXISTS \`questions_page\` (
      \`id\` integer PRIMARY KEY NOT NULL,
      \`updated_at\` text,
      \`created_at\` text
    );
  `))

  await db.run(sql.raw(`
    CREATE TABLE IF NOT EXISTS \`questions_page_locales\` (
      \`title\` text NOT NULL,
      \`intro\` text,
      \`id\` integer PRIMARY KEY NOT NULL,
      \`_locale\` text NOT NULL,
      \`_parent_id\` integer NOT NULL,
      FOREIGN KEY (\`_parent_id\`) REFERENCES \`questions_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );
  `))

  if (!(await indexExists(db, 'questions_page_locales_locale_parent_id_unique'))) {
    await db.run(
      sql.raw(
        'CREATE UNIQUE INDEX `questions_page_locales_locale_parent_id_unique` ON `questions_page_locales` (`_locale`,`_parent_id`);',
      ),
    )
  }
}

async function createArticlesGlobals(db: MigrateUpArgs['db']): Promise<void> {
  await db.run(sql.raw(`
    CREATE TABLE IF NOT EXISTS \`articles_page\` (
      \`id\` integer PRIMARY KEY NOT NULL,
      \`updated_at\` text,
      \`created_at\` text
    );
  `))

  await db.run(sql.raw(`
    CREATE TABLE IF NOT EXISTS \`articles_page_locales\` (
      \`title\` text NOT NULL,
      \`intro\` text,
      \`id\` integer PRIMARY KEY NOT NULL,
      \`_locale\` text NOT NULL,
      \`_parent_id\` integer NOT NULL,
      FOREIGN KEY (\`_parent_id\`) REFERENCES \`articles_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );
  `))

  if (!(await indexExists(db, 'articles_page_locales_locale_parent_id_unique'))) {
    await db.run(
      sql.raw(
        'CREATE UNIQUE INDEX `articles_page_locales_locale_parent_id_unique` ON `articles_page_locales` (`_locale`,`_parent_id`);',
      ),
    )
  }
}

async function ensureSeoColumns(db: MigrateUpArgs['db'], localesTable: string, metaImageIndexName: string): Promise<void> {
  if (!(await tableExists(db, localesTable))) {
    return
  }

  if (!(await columnExists(db, localesTable, 'meta_title'))) {
    await db.run(sql.raw(`ALTER TABLE \`${localesTable}\` ADD \`meta_title\` text;`))
  }

  if (!(await columnExists(db, localesTable, 'meta_description'))) {
    await db.run(sql.raw(`ALTER TABLE \`${localesTable}\` ADD \`meta_description\` text;`))
  }

  if (!(await columnExists(db, localesTable, 'meta_image_id'))) {
    await db.run(sql.raw(`ALTER TABLE \`${localesTable}\` ADD \`meta_image_id\` integer REFERENCES media(id);`))
  }

  if (!(await indexExists(db, metaImageIndexName))) {
    await db.run(sql.raw(`CREATE INDEX \`${metaImageIndexName}\` ON \`${localesTable}\` (\`meta_image_id\`,\`_locale\`);`))
  }
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)

  await createProjectsGlobals(db)
  await createContractorsGlobals(db)
  await createContractingGlobals(db)
  await createRecruitmentGlobals(db)
  await createQuestionsGlobals(db)
  await createArticlesGlobals(db)

  // SEO plugin columns for all page globals
  await ensureSeoColumns(db, 'home_page_locales', 'home_page_meta_meta_image_idx')
  await ensureSeoColumns(db, 'privacy_page_locales', 'privacy_page_meta_meta_image_idx')
  await ensureSeoColumns(db, 'projects_page_locales', 'projects_page_meta_meta_image_idx')
  await ensureSeoColumns(db, 'contractors_page_locales', 'contractors_page_meta_meta_image_idx')
  await ensureSeoColumns(db, 'contracting_page_locales', 'contracting_page_meta_meta_image_idx')
  await ensureSeoColumns(db, 'recruitment_page_locales', 'recruitment_page_meta_meta_image_idx')
  await ensureSeoColumns(db, 'questions_page_locales', 'questions_page_meta_meta_image_idx')
  await ensureSeoColumns(db, 'articles_page_locales', 'articles_page_meta_meta_image_idx')

  // SEO plugin columns for content collections
  await ensureSeoColumns(db, 'questions_locales', 'questions_meta_meta_image_idx')
  await ensureSeoColumns(db, 'articles_locales', 'articles_meta_meta_image_idx')

  await db.run(sql`PRAGMA foreign_keys=ON;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  // Intentionally no destructive rollback of content/SEO schema.
  await db.run(sql`PRAGMA foreign_keys=ON;`)
}
