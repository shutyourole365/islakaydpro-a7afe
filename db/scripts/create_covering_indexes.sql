-- create_covering_indexes.sql
-- Usage: fill the column names where indicated and run with psql or supabase CLI.

-- Example: create index for bookings.payout_id
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_payout_id
--   ON public.bookings (payout_id);

-- Template section: replace COLUMN_NAME placeholders with actual column names
-- 1) bookings -> fk_booking_payout (assumed column: payout_id)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_payout_id
  ON public.bookings (payout_id);

-- 2) conversations -> conversations_booking_id_fkey (assumed column: booking_id)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_booking_id
  ON public.conversations (booking_id);

-- 3) conversations -> conversations_equipment_id_fkey (assumed column: equipment_id)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_equipment_id
  ON public.conversations (equipment_id);

-- 4) equipment_availability -> equipment_availability_booking_id_fkey (assumed column: booking_id)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_equipment_availability_booking_id
  ON public.equipment_availability (booking_id);

-- 5) platform_settings -> platform_settings_updated_by_fkey (assumed column: updated_by)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_platform_settings_updated_by
  ON public.platform_settings (updated_by);

-- 6) verification_requests -> verification_requests_reviewed_by_fkey (assumed column: reviewed_by)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_verification_requests_reviewed_by
  ON public.verification_requests (reviewed_by);

-- After running, run ANALYZE on affected tables to update planner stats:
-- ANALYZE public.bookings;
-- ANALYZE public.conversations;
-- ANALYZE public.equipment_availability;
-- ANALYZE public.platform_settings;
-- ANALYZE public.verification_requests;
