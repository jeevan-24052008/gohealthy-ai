/*
# Enforce NOT NULL on user_id columns

## Summary
The previous migration added user_id with DEFAULT auth.uid() but left the
columns nullable. There are pre-existing anonymous rows (from the single-tenant
era) with NULL user_id that no authenticated user can own. This migration:

1. Deletes the orphaned NULL-user_id rows from assessments and profiles (these
   are anonymous test data from before authentication was added — no real user
   owns them, and keeping them would violate the NOT NULL constraint).
2. Sets user_id to NOT NULL on assessments and profiles.

Cascading FKs on assessments (assessment_symptoms, lifestyle, medical_history,
mental_health, health_history, recommendations, health_scores) will auto-purge
their child rows when assessments rows are deleted.

## Important Notes
- Only NULL-user_id rows are deleted. Rows with a real user_id are preserved.
- After this, all new inserts MUST come from an authenticated session (the
  DEFAULT auth.uid() fills user_id automatically).
*/

-- 1. Remove orphaned anonymous rows (no owner, from the pre-auth era)
DELETE FROM assessments WHERE user_id IS NULL;
DELETE FROM profiles WHERE user_id IS NULL;

-- 2. Enforce NOT NULL
ALTER TABLE assessments ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN user_id SET NOT NULL;
