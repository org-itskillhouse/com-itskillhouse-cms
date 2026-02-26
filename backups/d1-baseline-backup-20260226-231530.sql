PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE `users_sessions` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text,
	`expires_at` text NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "users_sessions" VALUES(1,1,'8ebefeea-71ce-4511-b1f0-44673d734d61','2026-02-23T23:18:32.645Z','2026-02-24T01:18:32.645Z');
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`email` text NOT NULL,
	`reset_password_token` text,
	`reset_password_expiration` text,
	`salt` text,
	`hash` text,
	`login_attempts` numeric DEFAULT 0,
	`lock_until` text
);
INSERT INTO "users" VALUES(1,'2026-02-23T23:18:32.517Z','2026-02-23T23:18:32.517Z','zygimantas@itskillhouse.com',NULL,NULL,'1c67c6146ea46dea90baa8d86995dfb31f2bfb5198d907f6d25fd7c4ce99a562','de49cdb189c63e4d5bc58a297d8fcd73080d7e5051855fe2f34f378eb769d0c61922518961967ff5702b57748c1287f3636498cab6cd87fe25139af24c48c7477063c6a33a37999267838d1c3564a8e0310a272366a5944321c6ac2a832cb3775a35b50ee5cd58d99a35eccf4f61d89f768d70cae3a858da95da09c44c463ed95d6140aab3d1de18434882c4b9a887fbb39a8b2864fe15d01bc991a6bc72669f6f3379e0763c65cdca116d3512261e35fbf12e72b068c9c5cd85ded9caa87675a5deb387161a6cf1b6a2df68bdf98674bc267bf4a1842f2de667a30e8e6e2f3ba530b8f462bd70176a4646e1f8105d281876b275d595d9414fb9aa4763797dcfa0177c5fadc550b5044c14c77b24ff0e898e76a838d746270985ac9e3195378d05188440b10e787e0b58b3f2cca98250a037f5331bbb50cc0d866280633667c96c59eabf8813387190093c30f4e7025ba10f4dd34596039aab38a9c0c5f077df50782b60efedf27f23b0b5313db0b659ba3444553d6db19bcd8c425410728a958fb044b9f2d273f1c195aaf30acb701c8e4c626f9bb79ff2bd1994573f946dcbea1cfe089afa4f4f1adf25e32fc8fdf1650bf7a9a25c1d633c1a74c982f9083ec2dab5a50b0d1edde7e7a5a5d2b4e20fd3bba88b4d559db0e3f3d4b6bf27e1d8f028faa991f795bab9b2d39db00d5601bc224774bc66e080aa9ff69478d7ca21',0,NULL);
CREATE TABLE `media` (
	`id` integer PRIMARY KEY NOT NULL,
	`alt` text NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`url` text,
	`thumbnail_u_r_l` text,
	`filename` text,
	`mime_type` text,
	`filesize` numeric,
	`width` numeric,
	`height` numeric
);
CREATE TABLE `payload_kv` (
	`id` integer PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`data` text NOT NULL
);
CREATE TABLE `payload_locked_documents` (
	`id` integer PRIMARY KEY NOT NULL,
	`global_slug` text,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
CREATE TABLE `payload_preferences` (
	`id` integer PRIMARY KEY NOT NULL,
	`key` text,
	`value` text,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
INSERT INTO "payload_preferences" VALUES(1,'collection-faq-items','{}','2026-02-23T23:21:09.898Z','2026-02-23T23:21:09.896Z');
INSERT INTO "payload_preferences" VALUES(2,'collection-news-articles','{}','2026-02-23T23:21:10.956Z','2026-02-23T23:21:10.956Z');
CREATE TABLE `payload_preferences_rels` (
	`id` integer PRIMARY KEY NOT NULL,
	`order` integer,
	`parent_id` integer NOT NULL,
	`path` text NOT NULL,
	`users_id` integer, `payload_mcp_api_keys_id` integer,
	FOREIGN KEY (`parent_id`) REFERENCES `payload_preferences`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "payload_preferences_rels" VALUES(1,NULL,1,'user',1,NULL);
INSERT INTO "payload_preferences_rels" VALUES(2,NULL,2,'user',1,NULL);
CREATE TABLE `payload_migrations` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`batch` numeric,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
INSERT INTO "payload_migrations" VALUES(1,'dev',-1,'2026-02-24 18:07:44','2026-02-23T23:17:58.659Z');
INSERT INTO "payload_migrations" VALUES(2,'20260226_133500',1,'2026-02-26T11:55:07.307Z','2026-02-26T11:55:07.307Z');
INSERT INTO "payload_migrations" VALUES(3,'20260226_140500',2,'2026-02-26T12:02:48.376Z','2026-02-26T12:02:48.375Z');
CREATE TABLE `home_page` (
	`id` integer PRIMARY KEY NOT NULL,
	`cta_href` text,
	`updated_at` text,
	`created_at` text
);
CREATE TABLE `home_page_locales` (
	`title` text NOT NULL,
	`subtitle` text,
	`cta_label` text,
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text NOT NULL,
	`_parent_id` integer NOT NULL, `meta_title` text, `meta_description` text, `meta_image_id` integer,
	FOREIGN KEY (`_parent_id`) REFERENCES `home_page`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `privacy_page` (
	`id` integer PRIMARY KEY NOT NULL,
	`version` text,
	`updated_at` text,
	`created_at` text
);
CREATE TABLE `privacy_page_locales` (
	`title` text NOT NULL,
	`body` text NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text NOT NULL,
	`_parent_id` integer NOT NULL, `meta_title` text, `meta_description` text, `meta_image_id` integer,
	FOREIGN KEY (`_parent_id`) REFERENCES `privacy_page`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `faq_items` (
	`id` integer PRIMARY KEY NOT NULL,
	`order` numeric DEFAULT 10 NOT NULL,
	`is_published` integer DEFAULT true NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
CREATE TABLE `faq_items_locales` (
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text NOT NULL,
	`_parent_id` integer NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `faq_items`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `news_articles` (
	`id` integer PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`hero_image_id` integer,
	`published_at` text NOT NULL,
	`is_published` integer DEFAULT true NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`hero_image_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null
);
CREATE TABLE `news_articles_locales` (
	`title` text NOT NULL,
	`excerpt` text,
	`body` text NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
	`_locale` text NOT NULL,
	`_parent_id` integer NOT NULL, `meta_title` text, `meta_description` text, `meta_image_id` integer, `slug` text,
	FOREIGN KEY (`_parent_id`) REFERENCES `news_articles`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE IF NOT EXISTS "payload_locked_documents_rels" (
	`id` integer PRIMARY KEY NOT NULL,
	`order` integer,
	`parent_id` integer NOT NULL,
	`path` text NOT NULL,
	`users_id` integer,
	`media_id` integer,
	`faq_items_id` integer,
	`news_articles_id` integer, `payload_mcp_api_keys_id` integer,
	FOREIGN KEY (`parent_id`) REFERENCES `payload_locked_documents`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`faq_items_id`) REFERENCES `faq_items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`news_articles_id`) REFERENCES `news_articles`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `payload_mcp_api_keys` (
      `id` integer PRIMARY KEY NOT NULL,
      `user_id` text NOT NULL,
      `label` text,
      `description` text,
      `articles_find` numeric DEFAULT 1,
      `articles_create` numeric DEFAULT 1,
      `articles_update` numeric DEFAULT 1,
      `articles_delete` numeric DEFAULT 1,
      `media_find` numeric DEFAULT 1,
      `questions_find` numeric DEFAULT 1,
      `enable_api_key` numeric DEFAULT 1,
      `api_key` text,
      `api_key_index` text,
      `updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
      `created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
      FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
    );
CREATE INDEX `users_sessions_order_idx` ON `users_sessions` (`_order`);
CREATE INDEX `users_sessions_parent_id_idx` ON `users_sessions` (`_parent_id`);
CREATE INDEX `users_updated_at_idx` ON `users` (`updated_at`);
CREATE INDEX `users_created_at_idx` ON `users` (`created_at`);
CREATE UNIQUE INDEX `users_email_idx` ON `users` (`email`);
CREATE INDEX `media_updated_at_idx` ON `media` (`updated_at`);
CREATE INDEX `media_created_at_idx` ON `media` (`created_at`);
CREATE UNIQUE INDEX `media_filename_idx` ON `media` (`filename`);
CREATE UNIQUE INDEX `payload_kv_key_idx` ON `payload_kv` (`key`);
CREATE INDEX `payload_locked_documents_global_slug_idx` ON `payload_locked_documents` (`global_slug`);
CREATE INDEX `payload_locked_documents_updated_at_idx` ON `payload_locked_documents` (`updated_at`);
CREATE INDEX `payload_locked_documents_created_at_idx` ON `payload_locked_documents` (`created_at`);
CREATE INDEX `payload_preferences_key_idx` ON `payload_preferences` (`key`);
CREATE INDEX `payload_preferences_updated_at_idx` ON `payload_preferences` (`updated_at`);
CREATE INDEX `payload_preferences_created_at_idx` ON `payload_preferences` (`created_at`);
CREATE INDEX `payload_preferences_rels_order_idx` ON `payload_preferences_rels` (`order`);
CREATE INDEX `payload_preferences_rels_parent_idx` ON `payload_preferences_rels` (`parent_id`);
CREATE INDEX `payload_preferences_rels_path_idx` ON `payload_preferences_rels` (`path`);
CREATE INDEX `payload_preferences_rels_users_id_idx` ON `payload_preferences_rels` (`users_id`);
CREATE INDEX `payload_migrations_updated_at_idx` ON `payload_migrations` (`updated_at`);
CREATE INDEX `payload_migrations_created_at_idx` ON `payload_migrations` (`created_at`);
CREATE UNIQUE INDEX `home_page_locales_locale_parent_id_unique` ON `home_page_locales` (`_locale`,`_parent_id`);
CREATE UNIQUE INDEX `privacy_page_locales_locale_parent_id_unique` ON `privacy_page_locales` (`_locale`,`_parent_id`);
CREATE INDEX `faq_items_updated_at_idx` ON `faq_items` (`updated_at`);
CREATE INDEX `faq_items_created_at_idx` ON `faq_items` (`created_at`);
CREATE UNIQUE INDEX `faq_items_locales_locale_parent_id_unique` ON `faq_items_locales` (`_locale`,`_parent_id`);
CREATE UNIQUE INDEX `news_articles_slug_idx` ON `news_articles` (`slug`);
CREATE INDEX `news_articles_hero_image_idx` ON `news_articles` (`hero_image_id`);
CREATE INDEX `news_articles_updated_at_idx` ON `news_articles` (`updated_at`);
CREATE INDEX `news_articles_created_at_idx` ON `news_articles` (`created_at`);
CREATE UNIQUE INDEX `news_articles_locales_locale_parent_id_unique` ON `news_articles_locales` (`_locale`,`_parent_id`);
CREATE INDEX `payload_locked_documents_rels_order_idx` ON `payload_locked_documents_rels` (`order`);
CREATE INDEX `payload_locked_documents_rels_parent_idx` ON `payload_locked_documents_rels` (`parent_id`);
CREATE INDEX `payload_locked_documents_rels_path_idx` ON `payload_locked_documents_rels` (`path`);
CREATE INDEX `payload_locked_documents_rels_users_id_idx` ON `payload_locked_documents_rels` (`users_id`);
CREATE INDEX `payload_locked_documents_rels_media_id_idx` ON `payload_locked_documents_rels` (`media_id`);
CREATE INDEX `payload_locked_documents_rels_faq_items_id_idx` ON `payload_locked_documents_rels` (`faq_items_id`);
CREATE INDEX `payload_locked_documents_rels_news_articles_id_idx` ON `payload_locked_documents_rels` (`news_articles_id`);
CREATE INDEX `home_page_meta_meta_image_idx` ON `home_page_locales` (`meta_image_id`,`_locale`);
CREATE INDEX `privacy_page_meta_meta_image_idx` ON `privacy_page_locales` (`meta_image_id`,`_locale`);
CREATE INDEX `news_articles_meta_meta_image_idx` ON `news_articles_locales` (`meta_image_id`,`_locale`);
CREATE INDEX `payload_mcp_api_keys_user_id_idx` ON `payload_mcp_api_keys` (`user_id`);
CREATE INDEX `payload_mcp_api_keys_updated_at_idx` ON `payload_mcp_api_keys` (`updated_at`);
CREATE INDEX `payload_mcp_api_keys_created_at_idx` ON `payload_mcp_api_keys` (`created_at`);
CREATE UNIQUE INDEX `payload_mcp_api_keys_api_key_index_idx` ON `payload_mcp_api_keys` (`api_key_index`);
CREATE INDEX `payload_locked_documents_rels_payload_mcp_api_keys_id_idx` ON `payload_locked_documents_rels` (`payload_mcp_api_keys_id`);
CREATE INDEX `payload_preferences_rels_payload_mcp_api_keys_id_idx` ON `payload_preferences_rels` (`payload_mcp_api_keys_id`);