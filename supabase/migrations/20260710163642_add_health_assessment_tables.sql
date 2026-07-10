/*
# Add full health assessment support tables

## Summary
Extends the GoHealthy AI database with all tables needed to persist the multi-step
assessment wizard. Existing tables (assessments, assessment_symptoms, symptoms,
conditions, health_scores) are left untouched.

## New Tables

1. **profiles** – one row per patient capturing personal demographics.
   - id, full_name, age, gender, height_cm, weight_cm, occupation, bmi, created_at, updated_at

2. **lifestyle** – lifestyle habits captured in Step 4 of the wizard.
   - id, assessment_id (FK → assessments), sleep_hours, sleep_quality, water_intake,
     exercise_days, smoking, alcohol, diet_type, screen_time, stress_level, created_at

3. **medical_history** – pre-existing conditions and medication history (Step 5).
   - id, assessment_id (FK → assessments), diabetes, hypertension, heart_disease, asthma,
     thyroid, allergies, current_medications, previous_surgeries, created_at

4. **mental_health** – optional mental health data if collected.
   - id, assessment_id (FK → assessments), anxiety_level, depression_level, notes, created_at

5. **health_history** – one summary row per completed assessment for trend tracking.
   - id, assessment_id (FK → assessments), patient_name, health_score, bmi, risk_level,
     condition_name, symptom_count, created_at

6. **recommendations** – AI-generated action items per assessment.
   - id, assessment_id (FK → assessments), category, title, description, priority, created_at

## Modified Tables

- **assessments** – adds columns: chief_complaint (text), bmi (numeric), health_score (int),
  risk_level (text), patient_height (numeric), patient_weight (numeric), patient_occupation (text)

## Security
All tables use RLS with anon + authenticated policies (no auth required – single-tenant app).
*/

-- ── Extend assessments ───────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assessments' AND column_name='chief_complaint') THEN
    ALTER TABLE assessments ADD COLUMN chief_complaint text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assessments' AND column_name='bmi') THEN
    ALTER TABLE assessments ADD COLUMN bmi numeric;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assessments' AND column_name='health_score') THEN
    ALTER TABLE assessments ADD COLUMN health_score integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assessments' AND column_name='risk_level') THEN
    ALTER TABLE assessments ADD COLUMN risk_level text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assessments' AND column_name='patient_height') THEN
    ALTER TABLE assessments ADD COLUMN patient_height numeric;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assessments' AND column_name='patient_weight') THEN
    ALTER TABLE assessments ADD COLUMN patient_weight numeric;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assessments' AND column_name='patient_occupation') THEN
    ALTER TABLE assessments ADD COLUMN patient_occupation text;
  END IF;
END $$;

-- Also extend assessment_symptoms with severity + detail columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assessment_symptoms' AND column_name='symptom_name') THEN
    ALTER TABLE assessment_symptoms ADD COLUMN symptom_name text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assessment_symptoms' AND column_name='severity') THEN
    ALTER TABLE assessment_symptoms ADD COLUMN severity integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assessment_symptoms' AND column_name='started_when') THEN
    ALTER TABLE assessment_symptoms ADD COLUMN started_when text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assessment_symptoms' AND column_name='frequency') THEN
    ALTER TABLE assessment_symptoms ADD COLUMN frequency text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assessment_symptoms' AND column_name='trend') THEN
    ALTER TABLE assessment_symptoms ADD COLUMN trend text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assessment_symptoms' AND column_name='notes') THEN
    ALTER TABLE assessment_symptoms ADD COLUMN notes text;
  END IF;
END $$;

-- ── profiles ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  age integer NOT NULL,
  gender text NOT NULL,
  height_cm numeric NOT NULL,
  weight_kg numeric NOT NULL,
  occupation text,
  bmi numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_profiles" ON profiles;
CREATE POLICY "anon_select_profiles" ON profiles FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_profiles" ON profiles;
CREATE POLICY "anon_insert_profiles" ON profiles FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_profiles" ON profiles;
CREATE POLICY "anon_update_profiles" ON profiles FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_profiles" ON profiles;
CREATE POLICY "anon_delete_profiles" ON profiles FOR DELETE TO anon, authenticated USING (true);

-- ── lifestyle ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lifestyle (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  sleep_hours text,
  sleep_quality text,
  water_intake text,
  exercise_days text,
  smoking text,
  alcohol text,
  diet_type text,
  screen_time text,
  stress_level text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lifestyle ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_lifestyle" ON lifestyle;
CREATE POLICY "anon_select_lifestyle" ON lifestyle FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_lifestyle" ON lifestyle;
CREATE POLICY "anon_insert_lifestyle" ON lifestyle FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_lifestyle" ON lifestyle;
CREATE POLICY "anon_update_lifestyle" ON lifestyle FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_lifestyle" ON lifestyle;
CREATE POLICY "anon_delete_lifestyle" ON lifestyle FOR DELETE TO anon, authenticated USING (true);

-- ── medical_history ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS medical_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  diabetes boolean DEFAULT false,
  hypertension boolean DEFAULT false,
  heart_disease boolean DEFAULT false,
  asthma boolean DEFAULT false,
  thyroid boolean DEFAULT false,
  allergies text,
  current_medications text,
  previous_surgeries text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE medical_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_medical_history" ON medical_history;
CREATE POLICY "anon_select_medical_history" ON medical_history FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_medical_history" ON medical_history;
CREATE POLICY "anon_insert_medical_history" ON medical_history FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_medical_history" ON medical_history;
CREATE POLICY "anon_update_medical_history" ON medical_history FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_medical_history" ON medical_history;
CREATE POLICY "anon_delete_medical_history" ON medical_history FOR DELETE TO anon, authenticated USING (true);

-- ── mental_health ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mental_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  anxiety_level integer,
  depression_level integer,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mental_health ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_mental_health" ON mental_health;
CREATE POLICY "anon_select_mental_health" ON mental_health FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_mental_health" ON mental_health;
CREATE POLICY "anon_insert_mental_health" ON mental_health FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_mental_health" ON mental_health;
CREATE POLICY "anon_update_mental_health" ON mental_health FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_mental_health" ON mental_health;
CREATE POLICY "anon_delete_mental_health" ON mental_health FOR DELETE TO anon, authenticated USING (true);

-- ── health_history ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS health_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  patient_name text NOT NULL,
  health_score integer,
  bmi numeric,
  risk_level text,
  condition_name text,
  symptom_count integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE health_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_health_history" ON health_history;
CREATE POLICY "anon_select_health_history" ON health_history FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_health_history" ON health_history;
CREATE POLICY "anon_insert_health_history" ON health_history FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_health_history" ON health_history;
CREATE POLICY "anon_update_health_history" ON health_history FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_health_history" ON health_history;
CREATE POLICY "anon_delete_health_history" ON health_history FOR DELETE TO anon, authenticated USING (true);

-- ── recommendations ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  category text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  priority integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_recommendations" ON recommendations;
CREATE POLICY "anon_select_recommendations" ON recommendations FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_recommendations" ON recommendations;
CREATE POLICY "anon_insert_recommendations" ON recommendations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_recommendations" ON recommendations;
CREATE POLICY "anon_update_recommendations" ON recommendations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_recommendations" ON recommendations;
CREATE POLICY "anon_delete_recommendations" ON recommendations FOR DELETE TO anon, authenticated USING (true);

-- ── indexes ────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_lifestyle_assessment_id ON lifestyle(assessment_id);
CREATE INDEX IF NOT EXISTS idx_medical_history_assessment_id ON medical_history(assessment_id);
CREATE INDEX IF NOT EXISTS idx_mental_health_assessment_id ON mental_health(assessment_id);
CREATE INDEX IF NOT EXISTS idx_health_history_assessment_id ON health_history(assessment_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_assessment_id ON recommendations(assessment_id);
CREATE INDEX IF NOT EXISTS idx_health_history_created_at ON health_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments(created_at DESC);
