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

const columnExists = async (
    db: MigrateUpArgs['db'],
    tableName: string,
    columnName: string,
): Promise<boolean> => {
    if (!(await tableExists(db, tableName))) {
        return false
    }

    const result = (await db.run(sql.raw(`PRAGMA table_info(${tableName});`))) as QueryResult
    return getRows(result).some((row) => String(row.name) === columnName)
}

const ensureColumn = async (
    db: MigrateUpArgs['db'],
    tableName: string,
    columnName: string,
    definition: string,
): Promise<void> => {
    if (await columnExists(db, tableName, columnName)) {
        return
    }

    await db.run(sql.raw(`ALTER TABLE \`${tableName}\` ADD \`${columnName}\` ${definition};`))
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
    if (!(await tableExists(db, 'payload_mcp_api_keys'))) {
        return
    }

    await ensureColumn(db, 'payload_mcp_api_keys', 'questions_create', 'numeric DEFAULT 1')
    await ensureColumn(db, 'payload_mcp_api_keys', 'questions_update', 'numeric DEFAULT 1')
    await ensureColumn(db, 'payload_mcp_api_keys', 'questions_delete', 'numeric DEFAULT 1')
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
    payload.logger.warn('Down migration intentionally not implemented for D1 additive columns.')
}
