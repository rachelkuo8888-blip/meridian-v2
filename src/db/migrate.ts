import fs from 'fs'
import path from 'path'
import { query, enableVectorExtension, endPool } from '@/lib/db'

/**
 * Migration runner for Meridian V2.
 * Reads SQL files from src/db/migrations/ and executes them in order.
 *
 * Usage:
 *   npx tsx src/db/migrate.ts        # Run pending migrations
 *   npx tsx src/db/migrate.ts --all  # Force re-run all (dev only)
 */

const MIGRATIONS_DIR = path.resolve(__dirname, 'migrations')

interface MigrationRecord {
  id: string
  filename: string
  applied_at: string
}

async function getAppliedMigrations(): Promise<Set<string>> {
  try {
    // Ensure tracking table exists
    await query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id          serial PRIMARY KEY,
        filename    text UNIQUE NOT NULL,
        applied_at  timestamptz NOT NULL DEFAULT now()
      )
    `)

    const result = await query<MigrationRecord>('SELECT filename FROM _migrations ORDER BY id')
    return new Set(result.rows.map((r) => r.filename))
  } catch (error) {
    console.error('[Migration] Failed to read migration state:', error)
    process.exit(1)
  }
}

async function runMigration(filename: string, sql: string): Promise<void> {
  try {
    // Split on semicolons to run statements individually
    // but first check for CREATE EXTENSION to run outside transactions
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    for (const statement of statements) {
      await query(statement)
    }

    await query('INSERT INTO _migrations (filename) VALUES ($1)', [filename])
    console.log(`[Migration] ✓ ${filename}`)
  } catch (error) {
    console.error(`[Migration] ✗ ${filename} failed:`, error)
    process.exit(1)
  }
}

async function main() {
  console.log('[Migration] Starting Meridian V2 schema migration...')
  console.log(`[Migration] Directory: ${MIGRATIONS_DIR}`)

  // Enable pgvector extension first (must be done outside transaction)
  try {
    await enableVectorExtension()
    console.log('[Migration] ✓ pgvector extension ready')
  } catch (error) {
    console.error('[Migration] ✗ Failed to enable pgvector extension:', error)
    console.log('[Migration] Ensure PostgreSQL has pgvector installed.')
    console.log('[Migration]   sudo apt install postgresql-16-pgvector  (or equivalent)')
    process.exit(1)
  }

  const applied = await getAppliedMigrations()
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  let count = 0
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`[Migration] - ${file} (already applied)`)
      continue
    }

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8')
    await runMigration(file, sql)
    count++
  }

  console.log(`[Migration] Done. ${count} new migration(s) applied, ${files.length - count - applied.size} already applied.`)
  console.log(`[Migration] Total migrations: ${files.length}`)

  await endPool()
  process.exit(0)
}

main().catch((err) => {
  console.error('[Migration] Fatal error:', err)
  process.exit(1)
})
