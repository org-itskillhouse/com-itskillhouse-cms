import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`articles_page_locales\` DROP COLUMN \`intro\`;`)
  await db.run(sql`ALTER TABLE \`contracting_page_locales\` DROP COLUMN \`intro\`;`)
  await db.run(sql`ALTER TABLE \`questions_page_locales\` DROP COLUMN \`intro\`;`)
  await db.run(sql`ALTER TABLE \`recruitment_page_locales\` DROP COLUMN \`intro\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`articles_page_locales\` ADD \`intro\` text;`)
  await db.run(sql`ALTER TABLE \`contracting_page_locales\` ADD \`intro\` text;`)
  await db.run(sql`ALTER TABLE \`questions_page_locales\` ADD \`intro\` text;`)
  await db.run(sql`ALTER TABLE \`recruitment_page_locales\` ADD \`intro\` text;`)
}
