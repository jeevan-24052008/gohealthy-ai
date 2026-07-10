/*
# Make symptom_id nullable in assessment_symptoms

The assessment wizard stores symptoms by name (free-text from the UI list),
not by FK reference to the symptoms table. Making symptom_id nullable allows
inserts that carry symptom_name without a corresponding symptoms row.
*/

ALTER TABLE assessment_symptoms ALTER COLUMN symptom_id DROP NOT NULL;
