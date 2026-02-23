-- check_unused_indexes.sql
-- Lists index usage (idx_scan) for indexes of interest. Run in psql.

SELECT
  schemaname,
  relname AS table_name,
  indexrelname AS index_name,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND indexrelname IN (
    'idx_notification_logs_type_created_at',
    'idx_notification_logs_created_at',
    'idx_notification_preferences_user_id',
    'idx_profiles_stripe_customer',
    'idx_profiles_stripe_connect',
    'idx_bookings_stripe_session',
    'idx_bookings_stripe_payment',
    'idx_push_subscriptions_active',
    'idx_equipment_owner',
    'idx_equipment_location',
    'idx_equipment_daily_rate',
    'idx_equipment_rating',
    'idx_equipment_featured',
    'idx_bookings_equipment',
    'idx_bookings_dates',
    'idx_reviews_equipment',
    'idx_messages_conversation',
    'idx_messages_receiver',
    'idx_messages_equipment_id',
    'idx_messages_sender_id',
    'idx_reviews_booking_id',
    'idx_reviews_reviewee_id',
    'idx_reviews_reviewer_id',
    'idx_audit_logs_user_id',
    'idx_audit_logs_action',
    'idx_audit_logs_created_at',
    'idx_user_sessions_user_id',
    'idx_user_sessions_is_active',
    'idx_notifications_created_at',
    'idx_conversation_participants_user',
    'idx_conversation_participants_conv',
    'idx_equipment_analytics_equipment_id',
    'idx_verification_requests_user',
    'idx_verification_requests_status',
    'idx_email_logs_status',
    'idx_equipment_availability_equipment',
    'idx_equipment_availability_dates',
    'idx_saved_searches_user',
    'idx_bookings_status',
    'idx_profiles_admin',
    'idx_email_logs_recipient',
    'idx_email_logs_created_at',
    'idx_email_preferences_user_id',
    'idx_payments_booking',
    'idx_payments_user',
    'idx_payments_status',
    'idx_payments_stripe_intent',
    'idx_payments_created',
    'idx_payouts_booking',
    'idx_payouts_owner',
    'idx_payouts_status',
    'idx_payouts_created',
    'idx_push_subscriptions_user_id',
    'idx_push_subscriptions_endpoint',
    'idx_mview_equipment_owner_id',
    'idx_notification_analytics_mv_date_type'
  )
ORDER BY idx_scan ASC;

-- If idx_scan = 0 for a long period, consider DROP INDEX CONCURRENTLY
-- DROP INDEX CONCURRENTLY IF EXISTS public.idx_notification_logs_type_created_at;
