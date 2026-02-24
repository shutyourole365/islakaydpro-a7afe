#!/usr/bin/env pwsh
# run_index_maintenance.ps1
# Runs index-check and (optionally) applies create index SQL templates.
# Requirements: `psql` (or use `supabase db query`), a Postgres connection string in $env:DATABASE_URL

param(
  [switch]$applyTemplates
)

if (-not $env:DATABASE_URL) {
  Write-Error "Set environment variable DATABASE_URL (Postgres connection string) first. Example: $env:DATABASE_URL='postgres://USER:PASS@HOST:5432/DBNAME'"
  exit 2
}

# Prefer psql if available
$psqlCmd = Get-Command psql -ErrorAction SilentlyContinue
if ($psqlCmd) {
  $psql = $psqlCmd.Source
  try {
    & $psql -d $env:DATABASE_URL -c "SELECT version();" | Out-Null
  } catch {
    Write-Error "psql found but cannot connect using DATABASE_URL. Verify the connection string and network access."
    exit 4
  }

  Write-Output "Running index usage check with psql..."
  & $psql -d $env:DATABASE_URL -f "db/scripts/check_unused_indexes.sql"

  if ($applyTemplates) {
    Write-Output "Applying CREATE INDEX templates (edit db/scripts/create_covering_indexes.sql and replace COLUMN_NAME placeholders before running in production)."
    & $psql -d $env:DATABASE_URL -f "db/scripts/create_covering_indexes.sql"
    Write-Output "ANALYZE affected tables next (manually run ANALYZE statements)."
  }

  Write-Output "Done. Review output and proceed carefully."
  exit 0
}

# If psql is not available, provide clear alternatives
Write-Output "psql not found on PATH. You can either install psql or run the SQL manually in the Supabase SQL editor."
Write-Output "Install psql (Windows): choco install postgresql  OR  winget install --id=PostgreSQL.PostgreSQL"
Write-Output "Install psql (macOS): 'brew install libpq' then 'brew link --force libpq'."

# If the Supabase CLI is available we could suggest using it; otherwise print the SQL file paths for copy/paste
$supabaseCmd = Get-Command supabase -ErrorAction SilentlyContinue
if ($supabaseCmd) {
  Write-Output "Detected 'supabase' CLI at $($supabaseCmd.Source). You can run the following command to execute the check SQL file (adjust flags for your environment):"
  Write-Output "supabase db query --file db/scripts/check_unused_indexes.sql"
  if ($applyTemplates) {
    Write-Output "To apply templates with supabase CLI (careful): supabase db query --file db/scripts/create_covering_indexes.sql"
  }
  exit 0
}

Write-Output "No automatic runner found. To run the checks manually:"
Write-Output "- Open the Supabase project SQL editor and paste the contents of 'db/scripts/check_unused_indexes.sql', then run."
if ($applyTemplates) {
  Write-Output "- After verifying output, paste 'db/scripts/create_covering_indexes.sql' into the SQL editor to create indexes (edit COLUMN_NAME placeholders first)."
}

Write-Output "You can print the SQL to the console for easy copy/paste:"
Write-Output "--- check_unused_indexes.sql ---"
Get-Content -Raw "db/scripts/check_unused_indexes.sql"
if ($applyTemplates) {
  Write-Output "--- create_covering_indexes.sql ---"
  Get-Content -Raw "db/scripts/create_covering_indexes.sql"
}

Write-Output "Done. If you want me to attempt to run via the Supabase CLI programmatically, grant permission and I'll try, but I recommend running these files manually in the SQL editor first."
exit 0
