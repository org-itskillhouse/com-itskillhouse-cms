import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-d1-sqlite'

type QueryResultRow = Record<string, unknown>
type QueryResult = {
  rows?: QueryResultRow[]
  results?: QueryResultRow[]
}

const getRows = (result: QueryResult): QueryResultRow[] => result.rows ?? result.results ?? []

const tableExists = async (db: MigrateUpArgs['db'], tableName: string): Promise<boolean> => {
  const result = (await db.run(
    sql.raw(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = '${tableName}' LIMIT 1;`),
  )) as QueryResult

  return getRows(result).length > 0
}

const columnExists = async (db: MigrateUpArgs['db'], tableName: string, columnName: string): Promise<boolean> => {
  if (!(await tableExists(db, tableName))) {
    return false
  }

  const result = (await db.run(sql.raw(`PRAGMA table_info(${tableName});`))) as QueryResult
  return getRows(result).some((row) => String(row.name) === columnName)
}

export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  if (!(await tableExists(db, 'payload_mcp_api_keys'))) {
    return
  }

  const hasEnableApiKey = await columnExists(db, 'payload_mcp_api_keys', 'enable_api_key')
  const hasEnableAPIKey = await columnExists(db, 'payload_mcp_api_keys', 'enable_a_p_i_key')
  const enableKeyAssignments = [hasEnableApiKey ? '`enable_api_key` = 0' : '', hasEnableAPIKey ? '`enable_a_p_i_key` = 0' : '']
    .filter(Boolean)
    .join(',\n      ')

  // Existing rows may contain non-decryptable API key ciphertext from previous
  // secret/config states. Reset key material so list views can render again.
  await db.run(sql.raw(`
    UPDATE \`payload_mcp_api_keys\`
    SET
      ${enableKeyAssignments}${enableKeyAssignments ? ',' : ''}
      \`api_key\` = NULL,
      \`api_key_index\` = NULL
    WHERE \`api_key\` IS NOT NULL OR \`api_key_index\` IS NOT NULL;
  `))

  payload.logger.info('Reset existing MCP API key material to resolve invalid IV decryption errors.')
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  payload.logger.warn('Down migration intentionally not implemented for MCP API key reset.')
}
