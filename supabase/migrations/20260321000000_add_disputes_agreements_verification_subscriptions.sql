-- ================================================================
-- New Feature Migrations: Disputes, Rental Agreements,
-- ID Verification, Recurring Rentals
-- ================================================================

-- 1. DISPUTES TABLE
CREATE TABLE IF NOT EXISTS disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  equipment_id uuid REFERENCES equipment(id) ON DELETE SET NULL,
  opened_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  against_user uuid REFERENCES profiles(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('damage', 'no_show', 'late_return', 'wrong_item', 'payment', 'other')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved_renter', 'resolved_owner', 'resolved_split', 'closed')),
  title text NOT NULL,
  description text NOT NULL,
  evidence_urls text[] DEFAULT '{}',
  resolution_notes text,
  deposit_action text CHECK (deposit_action IN ('full_refund', 'partial_refund', 'owner_keeps', 'split')),
  deposit_split_percent integer CHECK (deposit_split_percent BETWEEN 0 AND 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

CREATE TABLE IF NOT EXISTS dispute_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id uuid REFERENCES disputes(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  content text NOT NULL,
  attachments text[] DEFAULT '{}',
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view disputes they are party to"
  ON disputes FOR SELECT
  USING (auth.uid() = opened_by OR auth.uid() = against_user);

CREATE POLICY "Authenticated users can open disputes"
  ON disputes FOR INSERT
  WITH CHECK (auth.uid() = opened_by);

CREATE POLICY "Dispute parties can update disputes"
  ON disputes FOR UPDATE
  USING (auth.uid() = opened_by OR auth.uid() = against_user);

CREATE POLICY "Dispute parties can view messages"
  ON dispute_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM disputes d
      WHERE d.id = dispute_id
        AND (d.opened_by = auth.uid() OR d.against_user = auth.uid())
    )
  );

CREATE POLICY "Dispute parties can send messages"
  ON dispute_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM disputes d
      WHERE d.id = dispute_id
        AND (d.opened_by = auth.uid() OR d.against_user = auth.uid())
    )
  );

-- 2. RENTAL AGREEMENTS TABLE
CREATE TABLE IF NOT EXISTS rental_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE UNIQUE,
  owner_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  renter_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  equipment_title text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_amount numeric(10,2) NOT NULL,
  deposit_amount numeric(10,2) NOT NULL DEFAULT 0,
  daily_rate numeric(10,2) NOT NULL,
  insurance_plan text,
  special_terms text,
  owner_signed_at timestamptz,
  renter_signed_at timestamptz,
  owner_signature text,
  renter_signature text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'owner_signed', 'fully_signed', 'voided')),
  pdf_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE rental_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agreement parties can view agreements"
  ON rental_agreements FOR SELECT
  USING (auth.uid() = owner_id OR auth.uid() = renter_id);

CREATE POLICY "System can create agreements"
  ON rental_agreements FOR INSERT
  WITH CHECK (auth.uid() = owner_id OR auth.uid() = renter_id);

CREATE POLICY "Parties can sign agreements"
  ON rental_agreements FOR UPDATE
  USING (auth.uid() = owner_id OR auth.uid() = renter_id);

-- 3. ID VERIFICATION DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS id_verification_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('drivers_license', 'passport', 'national_id', 'state_id')),
  document_url text NOT NULL,
  selfie_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  rejection_reason text,
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE id_verification_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own verification docs"
  ON id_verification_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can submit verification docs"
  ON id_verification_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. RECURRING RENTALS (SUBSCRIPTIONS) TABLE
CREATE TABLE IF NOT EXISTS recurring_rentals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  renter_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  equipment_id uuid REFERENCES equipment(id) ON DELETE CASCADE,
  frequency text NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly')),
  rental_days integer NOT NULL DEFAULT 1,
  rate_per_period numeric(10,2) NOT NULL,
  start_date date NOT NULL,
  end_date date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'completed')),
  next_billing_date date,
  total_periods_completed integer DEFAULT 0,
  total_amount_paid numeric(10,2) DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE recurring_rentals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Renter can view their recurring rentals"
  ON recurring_rentals FOR SELECT
  USING (auth.uid() = renter_id OR auth.uid() = owner_id);

CREATE POLICY "Renter can create recurring rentals"
  ON recurring_rentals FOR INSERT
  WITH CHECK (auth.uid() = renter_id);

CREATE POLICY "Parties can update recurring rentals"
  ON recurring_rentals FOR UPDATE
  USING (auth.uid() = renter_id OR auth.uid() = owner_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_disputes_booking_id ON disputes(booking_id);
CREATE INDEX IF NOT EXISTS idx_disputes_opened_by ON disputes(opened_by);
CREATE INDEX IF NOT EXISTS idx_disputes_against_user ON disputes(against_user);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_dispute_messages_dispute_id ON dispute_messages(dispute_id);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_booking_id ON rental_agreements(booking_id);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_renter_id ON rental_agreements(renter_id);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_owner_id ON rental_agreements(owner_id);
CREATE INDEX IF NOT EXISTS idx_id_verifications_user_id ON id_verification_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_rentals_renter_id ON recurring_rentals(renter_id);
CREATE INDEX IF NOT EXISTS idx_recurring_rentals_equipment_id ON recurring_rentals(equipment_id);
CREATE INDEX IF NOT EXISTS idx_recurring_rentals_status ON recurring_rentals(status);
