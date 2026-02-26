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

  const hasLegacy = await columnExists(db, 'payload_mcp_api_keys', 'enable_api_key')
  const hasCurrent = await columnExists(db, 'payload_mcp_api_keys', 'enable_a_p_i_key')

  if (!hasCurrent) {
    await db.run(sql.raw('ALTER TABLE `payload_mcp_api_keys` ADD `enable_a_p_i_key` numeric DEFAULT 1;'))
  }

  if (hasLegacy) {
    await db.run(sql.raw(`
      UPDATE \`payload_mcp_api_keys\`
      SET \`enable_a_p_i_key\` = COALESCE(\`enable_a_p_i_key\`, \`enable_api_key\`, 1);
    `))
  }

  payload.logger.info('Ensured payload_mcp_api_keys.enable_a_p_i_key exists and is synchronized.')
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  payload.logger.warn('Down migration intentionally not implemented for MCP enable API key column fix.')
}
