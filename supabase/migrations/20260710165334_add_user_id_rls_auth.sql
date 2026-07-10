/*
# Add user_id ownership to all health assessment tables

## Summary
Converts GoHealthy AI from a single-tenant (open) data model to a multi-user
model where each authenticated user can only read and write their own rows.

## Changes

### Modified Tables (user_id column added)
All of the following tables get a new `user_id uuid NOT NULL DEFAULT auth.uid()`
column referencing `auth.users(id)`. The DEFAULT means frontend inserts that
omit user_id still work — Supabase fills it from the authenticated session.

Tables modified:
- `profiles`
- `assessments`
- `assessment_symptoms` (scoped through assessments via EXISTS)
- `lifestyle` (scoped through assessments)
- `medical_history` (scoped through assessments)
- `mental_health` (scoped through assessments)
- `health_history` (scoped through assessments)
- `recommendations` (scoped through assessments)
- `health_scores` (scoped through assessments)

### RLS Policy Replacement
All existing `anon_*` open policies are dropped. New `authenticated`-only
owner-scoped policies are created for every table.

Child tables (assessment_symptoms, lifestyle, medical_history, mental_health,
health_history, recommendations, health_scores) scope access through the parent
`assessments.user_id` using an EXISTS subquery, so they don't need their own
user_id column.

### Important Notes
1. Existing rows (if any) will have NULL user_id — they will be invisible to
   all users but will not be deleted.
2. Email confirmation remains OFF. Users sign in immediately after sign-up.
3. The `profiles` table gets a direct user_id (users own their profile directly).
4. The `assessments` table gets a direct user_id (top-level owner).
5. All other tables chain through assessments.user_id.
*/

-- ── Add user_id to profiles ───────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE profiles
      ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    ALTER TABLE profiles
      ALTER COLUMN user_id SET DEFAULT auth.uid();
  END IF;
END $$;

-- ── Add user_id to assessments ────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assessments' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE assessments
      ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    ALTER TABLE assessments
      ALTER COLUMN user_id SET DEFAULT auth.uid();
  END IF;
END $$;

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);

-- ══════════════════════════════════════════════════════════════════════════════
-- RLS POLICIES — drop all old open policies, create owner-scoped ones
-- ══════════════════════════════════════════════════════════════════════════════

-- ── profiles ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "anon_select_profiles" ON profiles;
DROP POLICY IF EXISTS "anon_insert_profiles" ON profiles;
DROP POLICY IF EXISTS "anon_update_profiles" ON profiles;
DROP POLICY IF EXISTS "anon_delete_profiles" ON profiles;

CREATE POLICY "select_own_profiles" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_profiles" ON profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_profiles" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_profiles" ON profiles
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ── assessments ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "anon_select_assessments" ON assessments;
DROP POLICY IF EXISTS "anon_insert_assessments" ON assessments;
DROP POLICY IF EXISTS "anon_update_assessments" ON assessments;
DROP POLICY IF EXISTS "anon_delete_assessments" ON assessments;

CREATE POLICY "select_own_assessments" ON assessments
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_assessments" ON assessments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_assessments" ON assessments
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_assessments" ON assessments
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ── assessment_symptoms (scoped via parent assessments.user_id) ───────────────
DROP POLICY IF EXISTS "anon_select_assessment_symptoms" ON assessment_symptoms;
DROP POLICY IF EXISTS "anon_insert_assessment_symptoms" ON assessment_symptoms;
DROP POLICY IF EXISTS "anon_update_assessment_symptoms" ON assessment_symptoms;
DROP POLICY IF EXISTS "anon_delete_assessment_symptoms" ON assessment_symptoms;

CREATE POLICY "select_own_assessment_symptoms" ON assessment_symptoms
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = assessment_symptoms.assessment_id AND a.user_id = auth.uid()
  ));
CREATE POLICY "insert_own_assessment_symptoms" ON assessment_symptoms
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = assessment_symptoms.assessment_id AND a.user_id = auth.uid()
  ));
CREATE POLICY "update_own_assessment_symptoms" ON assessment_symptoms
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = assessment_symptoms.assessment_id AND a.user_id = auth.uid()
  ));
CREATE POLICY "delete_own_assessment_symptoms" ON assessment_symptoms
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = assessment_symptoms.assessment_id AND a.user_id = auth.uid()
  ));

-- ── lifestyle ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "anon_select_lifestyle" ON lifestyle;
DROP POLICY IF EXISTS "anon_insert_lifestyle" ON lifestyle;
DROP POLICY IF EXISTS "anon_update_lifestyle" ON lifestyle;
DROP POLICY IF EXISTS "anon_delete_lifestyle" ON lifestyle;

CREATE POLICY "select_own_lifestyle" ON lifestyle
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = lifestyle.assessment_id AND a.user_id = auth.uid()
  ));
CREATE POLICY "insert_own_lifestyle" ON lifestyle
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = lifestyle.assessment_id AND a.user_id = auth.uid()
  ));
CREATE POLICY "update_own_lifestyle" ON lifestyle
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = lifestyle.assessment_id AND a.user_id = auth.uid()
  ));
CREATE POLICY "delete_own_lifestyle" ON lifestyle
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = lifestyle.assessment_id AND a.user_id = auth.uid()
  ));

-- ── medical_history ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "anon_select_medical_history" ON medical_history;
DROP POLICY IF EXISTS "anon_insert_medical_history" ON medical_history;
DROP POLICY IF EXISTS "anon_update_medical_history" ON medical_history;
DROP POLICY IF EXISTS "anon_delete_medical_history" ON medical_history;

CREATE POLICY "select_own_medical_history" ON medical_history
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = medical_history.assessment_id AND a.user_id = auth.uid()
  ));
CREATE POLICY "insert_own_medical_history" ON medical_history
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = medical_history.assessment_id AND a.user_id = auth.uid()
  ));
CREATE POLICY "update_own_medical_history" ON medical_history
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = medical_history.assessment_id AND a.user_id = auth.uid()
  ));
CREATE POLICY "delete_own_medical_history" ON medical_history
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = medical_history.assessment_id AND a.user_id = auth.uid()
  ));

-- ── mental_health ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "anon_select_mental_health" ON mental_health;
DROP POLICY IF EXISTS "anon_insert_mental_health" ON mental_health;
DROP POLICY IF EXISTS "anon_update_mental_health" ON mental_health;
DROP POLICY IF EXISTS "anon_delete_mental_health" ON mental_health;

CREATE POLICY "select_own_mental_health" ON mental_health
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = mental_health.assessment_id AND a.user_id = auth.uid()
  ));
CREATE POLICY "insert_own_mental_health" ON mental_health
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = mental_health.assessment_id AND a.user_id = auth.uid()
  ));
CREATE POLICY "update_own_mental_health" ON mental_health
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = mental_health.assessment_id AND a.user_id = auth.uid()
  ));
CREATE POLICY "delete_own_mental_health" ON mental_health
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = mental_health.assessment_id AND a.user_id = auth.uid()
  ));

-- ── health_history ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "anon_select_health_history" ON health_history;
DROP POLICY IF EXISTS "anon_insert_health_history" ON health_history;
DROP POLICY IF EXISTS "anon_update_health_history" ON health_history;
DROP POLICY IF EXISTS "anon_delete_health_history" ON health_history;

CREATE POLICY "select_own_health_history" ON health_history
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = health_history.assessment_id AND a.user_id = auth.uid()
  ));
CREATE POLICY "insert_own_health_history" ON health_history
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = health_history.assessment_id AND a.user_id = auth.uid()
  ));
CREATE POLICY "update_own_health_history" ON health_history
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = health_history.assessment_id AND a.user_id = auth.uid()
  ));
CREATE POLICY "delete_own_health_history" ON health_history
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = health_history.assessment_id AND a.user_id = auth.uid()
  ));

-- ── recommendations ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "anon_select_recommendations" ON recommendations;
DROP POLICY IF EXISTS "anon_insert_recommendations" ON recommendations;
DROP POLICY IF EXISTS "anon_update_recommendations" ON recommendations;
DROP POLICY IF EXISTS "anon_delete_recommendations" ON recommendations;

CREATE POLICY "select_own_recommendations" ON recommendations
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = recommendations.assessment_id AND a.user_id = auth.uid()
  ));
CREATE POLICY "insert_own_recommendations" ON recommendations
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = recommendations.assessment_id AND a.user_id = auth.uid()
  ));
CREATE POLICY "update_own_recommendations" ON recommendations
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = recommendations.assessment_id AND a.user_id = auth.uid()
  ));
CREATE POLICY "delete_own_recommendations" ON recommendations
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = recommendations.assessment_id AND a.user_id = auth.uid()
  ));

-- ── health_scores (scoped via parent assessments.user_id) ─────────────────────
DROP POLICY IF EXISTS "anon_select_health_scores" ON health_scores;
DROP POLICY IF EXISTS "anon_insert_health_scores" ON health_scores;
DROP POLICY IF EXISTS "anon_update_health_scores" ON health_scores;
DROP POLICY IF EXISTS "anon_delete_health_scores" ON health_scores;

CREATE POLICY "select_own_health_scores" ON health_scores
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = health_scores.assessment_id AND a.user_id = auth.uid()
  ));
CREATE POLICY "insert_own_health_scores" ON health_scores
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = health_scores.assessment_id AND a.user_id = auth.uid()
  ));
CREATE POLICY "update_own_health_scores" ON health_scores
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = health_scores.assessment_id AND a.user_id = auth.uid()
  ));
CREATE POLICY "delete_own_health_scores" ON health_scores
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = health_scores.assessment_id AND a.user_id = auth.uid()
  ));

-- ── symptoms and conditions remain public read-only ───────────────────────────
-- (These are lookup/reference tables, not user data)
DROP POLICY IF EXISTS "anon_select_symptoms" ON symptoms;
DROP POLICY IF EXISTS "anon_insert_symptoms" ON symptoms;
DROP POLICY IF EXISTS "anon_update_symptoms" ON symptoms;
DROP POLICY IF EXISTS "anon_delete_symptoms" ON symptoms;

CREATE POLICY "public_read_symptoms" ON symptoms
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_conditions" ON conditions;
DROP POLICY IF EXISTS "anon_insert_conditions" ON conditions;
DROP POLICY IF EXISTS "anon_update_conditions" ON conditions;
DROP POLICY IF EXISTS "anon_delete_conditions" ON conditions;

CREATE POLICY "public_read_conditions" ON conditions
  FOR SELECT TO anon, authenticated USING (true);
