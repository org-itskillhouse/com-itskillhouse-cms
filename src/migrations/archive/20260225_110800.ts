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

async function indexExists(db: MigrateUpArgs['db'] | MigrateDownArgs['db'], indexName: string): Promise<boolean> {
  const result = (await db.run(
    sql.raw(`SELECT name FROM sqlite_master WHERE type = 'index' AND name = '${indexName}' LIMIT 1;`),
  )) as QueryResult

  return rows(result).length > 0
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

  await ensureColumn(db, 'users', 'email_verified', 'text')
  await ensureColumn(db, 'users', 'name', 'text')
  await ensureColumn(db, 'users', 'image', 'text')

  if (!(await tableExists(db, 'users_accounts'))) {
    await db.run(sql`CREATE TABLE \`users_accounts\` (
      \`_order\` integer NOT NULL,
      \`_parent_id\` integer NOT NULL,
      \`id\` text PRIMARY KEY NOT NULL,
      \`provider\` text NOT NULL,
      \`provider_account_id\` text NOT NULL,
      \`type\` text NOT NULL,
      \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
      \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
      FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`)
  }

  if (!(await indexExists(db, 'users_accounts_order_idx'))) {
    await db.run(sql`CREATE INDEX \`users_accounts_order_idx\` ON \`users_accounts\` (\`_order\`);`)
  }

  if (!(await indexExists(db, 'users_accounts_parent_id_idx'))) {
    await db.run(sql`CREATE INDEX \`users_accounts_parent_id_idx\` ON \`users_accounts\` (\`_parent_id\`);`)
  }

  if (!(await indexExists(db, 'users_accounts_provider_account_id_idx'))) {
    await db.run(
      sql`CREATE INDEX \`users_accounts_provider_account_id_idx\` ON \`users_accounts\` (\`provider\`, \`provider_account_id\`);`,
    )
  }

  await db.run(sql`PRAGMA foreign_keys=ON;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  // Intentionally no-op for safety on existing environments.
  await db.run(sql`PRAGMA foreign_keys=ON;`)
}

