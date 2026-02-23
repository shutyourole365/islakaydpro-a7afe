# DB scripts

Purpose
- Helper scripts for inspecting index usage and creating covering indexes for foreign keys.

Included files
- `create_covering_indexes.sql` — templates (uses CONCURRENTLY) to add covering indexes for FKs. Edit column names if needed before applying.
- `check_unused_indexes.sql` — queries `pg_stat_user_indexes` for `idx_scan` to help identify unused indexes.
- `run_index_maintenance.ps1` — PowerShell helper to run the checks and (optionally) apply the templates. Requires `psql` or `supabase` CLI and a `DATABASE_URL` environment variable.

Quick usage

1) Inspect index usage (safe, read-only):
```powershell
$env:DATABASE_URL='postgres://USER:PASS@HOST:5432/DBNAME'
.\db\scripts\run_index_maintenance.ps1
```

2) Apply the CREATE INDEX templates (edit `create_covering_indexes.sql` first to confirm columns):
```powershell
$env:DATABASE_URL='postgres://USER:PASS@HOST:5432/DBNAME'
.\db\scripts\run_index_maintenance.ps1 -applyTemplates
```

Notes & Safety
- `CREATE INDEX CONCURRENTLY` is used to avoid locks; run during low-traffic windows.
- Always verify FK column names before creating indexes. Use the SQL in the Performance Advisor or the FK lookup query provided in the project to fetch exact column names.
- Confirm `idx_scan` values over a period before dropping indexes.
- Take a snapshot/backup before making structural changes.

If you prefer a PR for review instead of direct commits, revert the direct commit on `main` and open a feature branch with these files for review.
