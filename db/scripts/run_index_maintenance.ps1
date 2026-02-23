#!/usr/bin/env pwsh
# run_index_maintenance.ps1
# Runs index-check and (optionally) applies create index SQL templates.
# Requirements: `psql` (or use `supabase db query`), a Postgres connection string in $env:DATABASE_URL

param(
  [switch]$applyTemplates
)

if (-not $env:DATABASE_URL) {
  Write-Error "Set environment variable DATABASE_URL (Postgres connection string) first."
  exit 2
}

$psql = 'psql'
try {
  & $psql -c "SELECT version();" $env:DATABASE_URL | Out-Null
} catch {
  Write-Error "psql not found or cannot connect. Ensure psql is installed and DATABASE_URL is correct."
  exit 3
}

Write-Output "Running index usage check..."
& $psql $env:DATABASE_URL -f "db/scripts/check_unused_indexes.sql"

if ($applyTemplates) {
  Write-Output "Applying CREATE INDEX templates (edit db/scripts/create_covering_indexes.sql and replace COLUMN_NAME placeholders before running in production)."
  & $psql $env:DATABASE_URL -f "db/scripts/create_covering_indexes.sql"
  Write-Output "ANALYZE affected tables next (manually run ANALYZE statements)."
}

Write-Output "Done. Review output and proceed carefully."
