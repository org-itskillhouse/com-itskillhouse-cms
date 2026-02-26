import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-d1-sqlite'

import * as migration_20250929_111647 from './archive/20250929_111647'
import * as migration_20260224_153854 from './archive/20260224_153854'
import * as migration_20260224_175421 from './archive/20260224_175421'
import * as migration_20260224_181301 from './archive/20260224_181301'
import * as migration_20260224_231500 from './archive/20260224_231500'
import * as migration_20260224_233800 from './archive/20260224_233800'
import * as migration_20260224_235900 from './archive/20260224_235900'
import * as migration_20260225_110800 from './archive/20260225_110800'
import * as migration_20260225_170000 from './archive/20260225_170000'
import * as migration_20260226_094500 from './archive/20260226_094500'

type QueryResultRow = Record<string, unknown>
type QueryResult = {
  rows?: QueryResultRow[]
  results?: QueryResultRow[]
}

const LEGACY_MIGRATION_NAMES = [
  '20250929_111647',
  '20260224_153854',
  '20260224_175421',
  '20260224_181301',
  '20260224_231500',
  '20260224_233800',
  '20260224_235900',
  '20260225_110800',
  '20260225_170000',
  '20260226_094500',
] as const

const getRows = (result: QueryResult): QueryResultRow[] => result.rows ?? result.results ?? []

const tableExists = async (db: MigrateUpArgs['db'], tableName: string): Promise<boolean> => {
  const result = (await db.run(
    sql.raw(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = '${tableName}' LIMIT 1;`),
  )) as QueryResult

  return getRows(result).length > 0
}

const hasLegacyHistory = async (db: MigrateUpArgs['db']): Promise<boolean> => {
  const namesSql = LEGACY_MIGRATION_NAMES.map((name) => `'${name}'`).join(', ')
  const result = (await db.run(
    sql.raw(`SELECT name FROM payload_migrations WHERE name IN (${namesSql}) LIMIT 1;`),
  )) as QueryResult

  return getRows(result).length > 0
}

const hasBootstrappedSchemaWithoutHistory = async (db: MigrateUpArgs['db']): Promise<boolean> => {
  const coreTables = ['users', 'users_sessions', 'payload_locked_documents', 'payload_preferences']
  const checks = await Promise.all(coreTables.map((tableName) => tableExists(db, tableName)))
  return checks.every(Boolean)
}

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  if (await hasLegacyHistory(db)) {
    payload.logger.info('Skipping legacy migration chain (already applied).')
    return
  }

  if (await hasBootstrappedSchemaWithoutHistory(db)) {
    payload.logger.info('Detected existing schema without migration history. Applying only idempotent tail migration.')
    await migration_20260226_094500.up({ db, payload, req })
    return
  }

  await migration_20250929_111647.up({ db, payload, req })
  await migration_20260224_153854.up({ db, payload, req })
  await migration_20260224_175421.up({ db, payload, req })
  await migration_20260224_181301.up({ db, payload, req })
  await migration_20260224_231500.up({ db, payload, req })
  await migration_20260224_233800.up({ db, payload, req })
  await migration_20260224_235900.up({ db, payload, req })
  await migration_20260225_110800.up({ db, payload, req })
  await migration_20260225_170000.up({ db, payload, req })
  await migration_20260226_094500.up({ db, payload, req })
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  payload.logger.warn('Squashed migration down() is intentionally a no-op.')
}
