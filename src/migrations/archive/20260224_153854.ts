import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`faq_items\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` numeric DEFAULT 10 NOT NULL,
  	\`is_published\` integer DEFAULT true NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`faq_items_updated_at_idx\` ON \`faq_items\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`faq_items_created_at_idx\` ON \`faq_items\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`faq_items_locales\` (
  	\`question\` text NOT NULL,
  	\`answer\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`faq_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`faq_items_locales_locale_parent_id_unique\` ON \`faq_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`news_articles\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text NOT NULL,
  	\`hero_image_id\` integer,
  	\`published_at\` text NOT NULL,
  	\`is_published\` integer DEFAULT true NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`news_articles_slug_idx\` ON \`news_articles\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`news_articles_hero_image_idx\` ON \`news_articles\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`news_articles_updated_at_idx\` ON \`news_articles\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`news_articles_created_at_idx\` ON \`news_articles\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`news_articles_locales\` (
  	\`title\` text NOT NULL,
  	\`excerpt\` text,
  	\`body\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`news_articles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`news_articles_locales_locale_parent_id_unique\` ON \`news_articles_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE \`home_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`cta_href\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`home_page_locales\` (
  	\`title\` text NOT NULL,
  	\`subtitle\` text,
  	\`cta_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`home_page_locales_locale_parent_id_unique\` ON \`home_page_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`privacy_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`privacy_page_locales\` (
  	\`title\` text NOT NULL,
  	\`body\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`privacy_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`privacy_page_locales_locale_parent_id_unique\` ON \`privacy_page_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`faq_items_id\` integer REFERENCES faq_items(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`news_articles_id\` integer REFERENCES news_articles(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_faq_items_id_idx\` ON \`payload_locked_documents_rels\` (\`faq_items_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_news_articles_id_idx\` ON \`payload_locked_documents_rels\` (\`news_articles_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`faq_items\`;`)
  await db.run(sql`DROP TABLE \`faq_items_locales\`;`)
  await db.run(sql`DROP TABLE \`news_articles\`;`)
  await db.run(sql`DROP TABLE \`news_articles_locales\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`home_page\`;`)
  await db.run(sql`DROP TABLE \`home_page_locales\`;`)
  await db.run(sql`DROP TABLE \`privacy_page\`;`)
  await db.run(sql`DROP TABLE \`privacy_page_locales\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
}
