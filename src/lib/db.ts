import { Pool, type QueryResult, type QueryResultRow } from 'pg'
import { env } from '@/lib/env'

/**
 * PostgreSQL connection pool for server actions and API routes.
 * Uses local socket connection by default (trust auth for dev).
 * Configurable via DATABASE_URL env var.
 */
let pool: Pool | null = null

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    })

    pool.on('error', (err) => {
      console.error('Unexpected PostgreSQL pool error:', err.message)
    })
  }
  return pool
}

/**
 * Execute a single query with optional params.
 * Automatically acquires and releases a connection from the pool.
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  const client = await getPool().connect()
  try {
    return await client.query<T>(sql, params)
  } finally {
    client.release()
  }
}

/**
 * Execute a callback within a transaction.
 * Auto-rollbacks on error, auto-commits on success.
 */
export async function transaction<T>(
  callback: (query: typeof query) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect()
  try {
    await client.query('BEGIN')
    const result = await callback(
      async <R extends QueryResultRow = QueryResultRow>(
        sql: string,
        params?: unknown[],
      ) => client.query<R>(sql, params),
    )
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

/**
 * Enable pgvector extension (run once at migration time).
 */
export async function enableVectorExtension(): Promise<void> {
  await query('CREATE EXTENSION IF NOT EXISTS vector')
}

/**
 * Check database connectivity and pgvector support.
 */
export async function healthCheck(): Promise<{
  connected: boolean
  vectorSupported: boolean
}> {
  try {
    const result = await query('SELECT 1 as alive')
    const vectorResult = await query(
      "SELECT extname FROM pg_extension WHERE extname = 'vector'",
    )
    return {
      connected: result.rowCount === 1,
      vectorSupported: vectorResult.rowCount === 1,
    }
  } catch {
    return { connected: false, vectorSupported: false }
  }
}

/**
 * Gracefully shut down the pool.
 */
export async function endPool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}

export type { QueryResultRow } from 'pg'
