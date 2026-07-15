#!/usr/bin/env node
/**
 * Database migration runner.
 * Reads migration files from src/db/migrations/ and applies them.
 * Currently logs what would run — actual migration requires Supabase CLI.
 */

const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, '..', 'src', 'db', 'migrations');

if (!fs.existsSync(migrationsDir)) {
  console.log('No migrations directory found.');
  process.exit(0);
}

const files = fs.readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort();

if (files.length === 0) {
  console.log('No migration files found.');
  process.exit(0);
}

console.log(`Found ${files.length} migration(s):`);
files.forEach(f => console.log(`  - ${f}`));
console.log('\nTo apply:');
console.log(`  supabase db push`);
console.log(`  -- or upload ${migrationsDir}/${files[0]} via Supabase SQL Editor`);
