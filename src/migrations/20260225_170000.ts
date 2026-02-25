import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)

  // Hard cutover to Auth.js users model.
  // All existing users/sessions/accounts are dropped and recreated.
  await db.run(sql`DROP TABLE IF EXISTS \`users_accounts\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`users_sessions\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`users\`;`)

  await db.run(sql`CREATE TABLE \`users\` (
    \`id\` text PRIMARY KEY NOT NULL,
    \`email\` text NOT NULL,
    \`reset_password_token\` text,
    \`reset_password_expiration\` text,
    \`salt\` text,
    \`hash\` text,
    \`login_attempts\` numeric DEFAULT 0,
    \`lock_until\` text,
    \`email_verified\` text,
    \`name\` text,
    \`image\` text,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );`)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)

  await db.run(sql`CREATE TABLE \`users_sessions\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` text NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`expires_at\` text NOT NULL,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)

  await db.run(sql`CREATE TABLE \`users_accounts\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` text NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`provider\` text NOT NULL,
    \`provider_account_id\` text NOT NULL,
    \`type\` text NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(sql`CREATE INDEX \`users_accounts_order_idx\` ON \`users_accounts\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_accounts_parent_id_idx\` ON \`users_accounts\` (\`_parent_id\`);`)
  await db.run(
    sql`CREATE INDEX \`users_accounts_provider_account_id_idx\` ON \`users_accounts\` (\`provider\`, \`provider_account_id\`);`,
  )

  await db.run(sql`PRAGMA foreign_keys=ON;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  // No automatic rollback: this migration intentionally performs a hard cutover.
  await db.run(sql`PRAGMA foreign_keys=ON;`)
}
