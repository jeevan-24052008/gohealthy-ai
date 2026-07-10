import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Database row types ───────────────────────────────────────────────────────

export interface DbAssessment {
  id: string;
  patient_name: string;
  patient_age: number;
  patient_gender: string;
  patient_height: number | null;
  patient_weight: number | null;
  patient_occupation: string | null;
  chief_complaint: string | null;
  condition_id: string | null;
  confidence_score: number | null;
  bmi: number | null;
  health_score: number | null;
  risk_level: string | null;
  status: string;
  created_at: string;
}

export interface DbSymptom {
  id: string;
  name: string;
  icon: string | null;
  created_at: string;
}

export interface DbAssessmentSymptom {
  id: string;
  assessment_id: string;
  symptom_id: string | null;
  symptom_name: string | null;
  severity: number | null;
  started_when: string | null;
  frequency: string | null;
  trend: string | null;
  notes: string | null;
  created_at: string;
}

export interface DbLifestyle {
  id: string;
  assessment_id: string;
  sleep_hours: string | null;
  sleep_quality: string | null;
  water_intake: string | null;
  exercise_days: string | null;
  smoking: string | null;
  alcohol: string | null;
  diet_type: string | null;
  screen_time: string | null;
  stress_level: string | null;
  created_at: string;
}

export interface DbMedicalHistory {
  id: string;
  assessment_id: string;
  diabetes: boolean;
  hypertension: boolean;
  heart_disease: boolean;
  asthma: boolean;
  thyroid: boolean;
  allergies: string | null;
  current_medications: string | null;
  previous_surgeries: string | null;
  created_at: string;
}

export interface DbRecommendation {
  id: string;
  assessment_id: string;
  category: string;
  title: string;
  description: string;
  priority: number;
  created_at: string;
}

export interface DbHealthHistory {
  id: string;
  assessment_id: string;
  patient_name: string;
  health_score: number | null;
  bmi: number | null;
  risk_level: string | null;
  condition_name: string | null;
  symptom_count: number | null;
  created_at: string;
}

export interface DbProfile {
  id: string;
  full_name: string;
  age: number;
  gender: string;
  height_cm: number;
  weight_kg: number;
  occupation: string | null;
  bmi: number | null;
  created_at: string;
  updated_at: string;
}
