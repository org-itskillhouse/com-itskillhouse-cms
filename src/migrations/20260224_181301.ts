import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_news_articles_locales\` (
  	\`title\` text NOT NULL,
  	\`excerpt\` text,
  	\`body\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`news_articles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_news_articles_locales\`("title", "excerpt", "body", "id", "_locale", "_parent_id") SELECT "title", "excerpt", "body", "id", "_locale", "_parent_id" FROM \`news_articles_locales\`;`)
  await db.run(sql`DROP TABLE \`news_articles_locales\`;`)
  await db.run(sql`ALTER TABLE \`__new_news_articles_locales\` RENAME TO \`news_articles_locales\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE UNIQUE INDEX \`news_articles_locales_locale_parent_id_unique\` ON \`news_articles_locales\` (\`_locale\`,\`_parent_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`news_articles_locales\` ADD \`meta_title\` text;`)
  await db.run(sql`ALTER TABLE \`news_articles_locales\` ADD \`meta_description\` text;`)
  await db.run(sql`ALTER TABLE \`news_articles_locales\` ADD \`meta_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`news_articles_meta_meta_image_idx\` ON \`news_articles_locales\` (\`meta_image_id\`,\`_locale\`);`)
}
