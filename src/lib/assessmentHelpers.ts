import { supabase } from './supabase';
import type { DbAssessment } from './supabase';

// ─── Types mirroring the SymptomChecker wizard form ──────────────────────────

export interface PersonalInfo {
  fullName: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  occupation: string;
}

export interface SymptomDetail {
  startedWhen: string;
  severity: number;
  frequency: string;
  trend: string;
  notes: string;
}

export interface LifestyleInfo {
  sleepHours: string;
  sleepQuality: string;
  waterIntake: string;
  exerciseDays: string;
  smoking: string;
  alcohol: string;
  dietType: string;
  screenTime: string;
  stressLevel: string;
}

export interface MedicalHistoryInfo {
  diabetes: boolean;
  hypertension: boolean;
  heartDisease: boolean;
  asthma: boolean;
  thyroid: boolean;
  allergies: string;
  currentMedications: string;
  previousSurgeries: string;
}

export interface AssessmentFormData {
  personal: PersonalInfo;
  chiefComplaint: string;
  symptoms: string[];
  symptomDetails: Record<string, SymptomDetail>;
  lifestyle: LifestyleInfo;
  medicalHistory: MedicalHistoryInfo;
}

// ─── Calculation helpers ─────────────────────────────────────────────────────

export function calculateBMI(heightCm: number, weightKg: number): number {
  if (!heightCm || !weightKg) return 0;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function getRiskLevel(healthScore: number): string {
  if (healthScore >= 75) return 'Low';
  if (healthScore >= 50) return 'Moderate';
  return 'High';
}

function sleepScore(val: string): number {
  const map: Record<string, number> = {
    'less-4': 20, '4-5': 35, '5-6': 50, '6-7': 70, '7-8': 100, '8-9': 90, '9-plus': 75,
  };
  return map[val] ?? 60;
}

function exerciseScore(val: string): number {
  const map: Record<string, number> = {
    '0': 20, '1-2': 55, '3-4': 85, '5-6': 100, '7': 90,
  };
  return map[val] ?? 60;
}

function waterScore(val: string): number {
  const map: Record<string, number> = {
    'less-1L': 30, '1-2L': 65, '2-3L': 100, '3-plus': 90,
  };
  return map[val] ?? 60;
}

function stressScore(val: string): number {
  const map: Record<string, number> = {
    'very-low': 100, 'low': 85, 'moderate': 65, 'high': 40, 'very-high': 20,
  };
  return map[val] ?? 60;
}

function smokingScore(val: string): number {
  const map: Record<string, number> = {
    'never': 100, 'former': 70, 'occasional': 45, 'regular': 25, 'heavy': 10,
  };
  return map[val] ?? 80;
}

function conditionPenalty(med: MedicalHistoryInfo): number {
  const conditions = [med.diabetes, med.hypertension, med.heartDisease, med.asthma, med.thyroid];
  const active = conditions.filter(Boolean).length;
  return active * 8;
}

function symptomSeverityPenalty(details: Record<string, SymptomDetail>, symptoms: string[]): number {
  if (!symptoms.length) return 0;
  const avgSeverity = symptoms.reduce((sum, s) => sum + (details[s]?.severity ?? 5), 0) / symptoms.length;
  return Math.round(avgSeverity * 2.5);
}

export function calculateHealthScore(form: AssessmentFormData): number {
  const { lifestyle, medicalHistory, symptoms, symptomDetails } = form;

  const scores = [
    sleepScore(lifestyle.sleepHours) * 0.20,
    exerciseScore(lifestyle.exerciseDays) * 0.20,
    waterScore(lifestyle.waterIntake) * 0.15,
    stressScore(lifestyle.stressLevel) * 0.20,
    smokingScore(lifestyle.smoking) * 0.10,
    (lifestyle.alcohol === 'none' ? 100 : lifestyle.alcohol === 'occasional' ? 80 : 50) * 0.05,
    (lifestyle.dietType === 'vegan' || lifestyle.dietType === 'mediterranean' ? 90 : 70) * 0.10,
  ];

  const rawScore = scores.reduce((a, b) => a + b, 0);
  const penalty = conditionPenalty(medicalHistory) + symptomSeverityPenalty(symptomDetails, symptoms);

  return Math.max(10, Math.min(100, Math.round(rawScore - penalty)));
}

// ─── Condition determination ──────────────────────────────────────────────────

function hasSymptom(symptoms: string[], name: string): boolean {
  return symptoms.some((s) => s.toLowerCase() === name.toLowerCase());
}

export function determineCondition(symptoms: string[]): { condition: string; confidence: number } {
  if (hasSymptom(symptoms, 'Fever') && hasSymptom(symptoms, 'Cough')) {
    return { condition: 'Flu (Influenza)', confidence: 85 };
  }
  if (hasSymptom(symptoms, 'Headache') && hasSymptom(symptoms, 'Fatigue')) {
    return { condition: 'Migraine', confidence: 80 };
  }
  if (hasSymptom(symptoms, 'Sore throat') && hasSymptom(symptoms, 'Cough')) {
    return { condition: 'Common Cold', confidence: 75 };
  }
  if (hasSymptom(symptoms, 'Chest pain') || hasSymptom(symptoms, 'Heart palpitations')) {
    return { condition: 'Cardiovascular Concern', confidence: 70 };
  }
  if (hasSymptom(symptoms, 'Anxiety') || hasSymptom(symptoms, 'Depression')) {
    return { condition: 'Mental Health Concern', confidence: 72 };
  }
  if (hasSymptom(symptoms, 'Abdominal pain') || hasSymptom(symptoms, 'Nausea') || hasSymptom(symptoms, 'Diarrhea')) {
    return { condition: 'Gastrointestinal Issue', confidence: 74 };
  }
  return { condition: 'General Viral Infection', confidence: 70 };
}

// ─── Recommendation generation ────────────────────────────────────────────────

interface RecommendationInput {
  condition: string;
  healthScore: number;
  lifestyle: LifestyleInfo;
  medicalHistory: MedicalHistoryInfo;
  symptoms: string[];
}

export function generateRecommendations(input: RecommendationInput): Array<{
  category: string;
  title: string;
  description: string;
  priority: number;
}> {
  const recs: Array<{ category: string; title: string; description: string; priority: number }> = [];

  // Symptom-based
  if (input.symptoms.some(s => ['Fever', 'Cough', 'Sore throat'].includes(s))) {
    recs.push({
      category: 'Immediate Care',
      title: 'Rest & Hydration',
      description: 'Get plenty of rest and stay hydrated with water and warm fluids to help your body recover.',
      priority: 1,
    });
  }

  // Lifestyle
  if (['less-4', '4-5', '5-6'].includes(input.lifestyle.sleepHours)) {
    recs.push({
      category: 'Lifestyle',
      title: 'Improve Sleep Duration',
      description: 'Aim for 7–8 hours of sleep per night. Establish a consistent sleep schedule and limit screen time before bed.',
      priority: 2,
    });
  }

  if (input.lifestyle.exerciseDays === '0' || input.lifestyle.exerciseDays === '1-2') {
    recs.push({
      category: 'Lifestyle',
      title: 'Increase Physical Activity',
      description: 'Try to exercise at least 3–5 days per week. Start with 20–30 minute walks and gradually increase intensity.',
      priority: 2,
    });
  }

  if (['less-1L', '1-2L'].includes(input.lifestyle.waterIntake)) {
    recs.push({
      category: 'Nutrition',
      title: 'Increase Water Intake',
      description: 'Aim to drink 2–3 litres of water daily. Carry a water bottle as a reminder throughout the day.',
      priority: 2,
    });
  }

  if (['high', 'very-high'].includes(input.lifestyle.stressLevel)) {
    recs.push({
      category: 'Mental Health',
      title: 'Manage Stress Levels',
      description: 'Practice stress-reduction techniques such as meditation, deep breathing, or yoga for at least 10 minutes daily.',
      priority: 1,
    });
  }

  if (['regular', 'heavy'].includes(input.lifestyle.smoking)) {
    recs.push({
      category: 'Lifestyle',
      title: 'Quit Smoking',
      description: 'Smoking significantly increases your risk of serious health conditions. Speak to your doctor about cessation programmes.',
      priority: 1,
    });
  }

  // Medical history
  if (input.medicalHistory.diabetes) {
    recs.push({
      category: 'Medical',
      title: 'Monitor Blood Sugar',
      description: 'Keep blood glucose levels within target range. Follow a low-glycemic diet and take prescribed medications consistently.',
      priority: 1,
    });
  }

  if (input.medicalHistory.hypertension) {
    recs.push({
      category: 'Medical',
      title: 'Manage Blood Pressure',
      description: 'Reduce sodium intake, maintain a healthy weight, and take blood pressure medications as prescribed.',
      priority: 1,
    });
  }

  // General
  recs.push({
    category: 'Preventive Care',
    title: 'Schedule a Medical Check-up',
    description: 'Visit your healthcare provider for a comprehensive evaluation based on your assessment results.',
    priority: 3,
  });

  if (input.healthScore < 60) {
    recs.push({
      category: 'Immediate Care',
      title: 'Seek Professional Advice',
      description: 'Your health score indicates areas that need attention. We recommend consulting a healthcare professional soon.',
      priority: 1,
    });
  }

  return recs;
}

// ─── Main submission function ─────────────────────────────────────────────────

async function saveProfile(form: AssessmentFormData, bmi: number): Promise<string> {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      full_name: form.personal.fullName,
      age: parseInt(form.personal.age),
      gender: form.personal.gender,
      height_cm: parseFloat(form.personal.height),
      weight_kg: parseFloat(form.personal.weight),
      occupation: form.personal.occupation || null,
      bmi,
    })
    .select('id')
    .single();

  if (error) throw new Error(`Profile save failed: ${error.message}`);
  return data.id;
}

async function saveAssessmentRow(
  form: AssessmentFormData,
  bmi: number,
  healthScore: number,
  riskLevel: string,
  _conditionName: string,
  confidenceScore: number,
): Promise<string> {
  const { data, error } = await supabase
    .from('assessments')
    .insert({
      patient_name: form.personal.fullName,
      patient_age: parseInt(form.personal.age),
      patient_gender: form.personal.gender,
      patient_height: parseFloat(form.personal.height),
      patient_weight: parseFloat(form.personal.weight),
      patient_occupation: form.personal.occupation || null,
      chief_complaint: form.chiefComplaint || null,
      bmi,
      health_score: healthScore,
      risk_level: riskLevel,
      confidence_score: confidenceScore,
      status: 'completed',
    })
    .select('id')
    .single();

  if (error) throw new Error(`Assessment save failed: ${error.message}`);

  // Store condition name in a record if the conditions table doesn't have it yet
  // We just store the condition name inline on assessments for simplicity
  // (conditions table is linked by UUID FK which we leave null here)
  return data.id;
}

async function saveAssessmentSymptoms(
  assessmentId: string,
  form: AssessmentFormData,
): Promise<void> {
  if (!form.symptoms.length) return;

  const rows = form.symptoms.map((name) => {
    const detail = form.symptomDetails[name];
    return {
      assessment_id: assessmentId,
      symptom_name: name,
      severity: detail?.severity ?? null,
      started_when: detail?.startedWhen || null,
      frequency: detail?.frequency || null,
      trend: detail?.trend || null,
      notes: detail?.notes || null,
    };
  });

  const { error } = await supabase.from('assessment_symptoms').insert(rows);
  if (error) throw new Error(`Symptoms save failed: ${error.message}`);
}

async function saveLifestyle(assessmentId: string, lifestyle: LifestyleInfo): Promise<void> {
  const { error } = await supabase.from('lifestyle').insert({
    assessment_id: assessmentId,
    sleep_hours: lifestyle.sleepHours || null,
    sleep_quality: lifestyle.sleepQuality || null,
    water_intake: lifestyle.waterIntake || null,
    exercise_days: lifestyle.exerciseDays || null,
    smoking: lifestyle.smoking || null,
    alcohol: lifestyle.alcohol || null,
    diet_type: lifestyle.dietType || null,
    screen_time: lifestyle.screenTime || null,
    stress_level: lifestyle.stressLevel || null,
  });
  if (error) throw new Error(`Lifestyle save failed: ${error.message}`);
}

async function saveMedicalHistory(assessmentId: string, med: MedicalHistoryInfo): Promise<void> {
  const { error } = await supabase.from('medical_history').insert({
    assessment_id: assessmentId,
    diabetes: med.diabetes,
    hypertension: med.hypertension,
    heart_disease: med.heartDisease,
    asthma: med.asthma,
    thyroid: med.thyroid,
    allergies: med.allergies || null,
    current_medications: med.currentMedications || null,
    previous_surgeries: med.previousSurgeries || null,
  });
  if (error) throw new Error(`Medical history save failed: ${error.message}`);
}

async function saveMentalHealth(
  assessmentId: string,
  symptoms: string[],
): Promise<void> {
  const hasAnxiety = symptoms.some(s => s.toLowerCase() === 'anxiety');
  const hasDepression = symptoms.some(s => s.toLowerCase() === 'depression');
  if (!hasAnxiety && !hasDepression) return;

  const { error } = await supabase.from('mental_health').insert({
    assessment_id: assessmentId,
    anxiety_level: hasAnxiety ? 1 : null,
    depression_level: hasDepression ? 1 : null,
    notes: 'Inferred from reported symptoms.',
  });
  if (error) throw new Error(`Mental health save failed: ${error.message}`);
}

async function saveRecommendations(
  assessmentId: string,
  recs: Array<{ category: string; title: string; description: string; priority: number }>,
): Promise<void> {
  const rows = recs.map((r) => ({ ...r, assessment_id: assessmentId }));
  const { error } = await supabase.from('recommendations').insert(rows);
  if (error) throw new Error(`Recommendations save failed: ${error.message}`);
}

async function saveHealthHistory(
  assessmentId: string,
  patientName: string,
  healthScore: number,
  bmi: number,
  riskLevel: string,
  conditionName: string,
  symptomCount: number,
): Promise<void> {
  const { error } = await supabase.from('health_history').insert({
    assessment_id: assessmentId,
    patient_name: patientName,
    health_score: healthScore,
    bmi,
    risk_level: riskLevel,
    condition_name: conditionName,
    symptom_count: symptomCount,
  });
  if (error) throw new Error(`Health history save failed: ${error.message}`);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface SubmitAssessmentResult {
  assessmentId: string;
  healthScore: number;
  bmi: number;
  riskLevel: string;
  condition: string;
  confidence: number;
  recommendations: Array<{ category: string; title: string; description: string; priority: number }>;
}

export async function submitAssessment(form: AssessmentFormData): Promise<SubmitAssessmentResult> {
  const height = parseFloat(form.personal.height);
  const weight = parseFloat(form.personal.weight);
  const bmi = calculateBMI(height, weight);
  const healthScore = calculateHealthScore(form);
  const riskLevel = getRiskLevel(healthScore);
  const { condition } = determineCondition(form.symptoms);
  const confidence = 70;
  const recs = generateRecommendations({
    condition,
    healthScore,
    lifestyle: form.lifestyle,
    medicalHistory: form.medicalHistory,
    symptoms: form.symptoms,
  });

  // Sequential writes – each depends on the assessment id
  await saveProfile(form, bmi);
  const assessmentId = await saveAssessmentRow(form, bmi, healthScore, riskLevel, condition, confidence);
  // Parallel independent writes
  await Promise.all([
    saveAssessmentSymptoms(assessmentId, form),
    saveLifestyle(assessmentId, form.lifestyle),
    saveMedicalHistory(assessmentId, form.medicalHistory),
    saveMentalHealth(assessmentId, form.symptoms),
    saveRecommendations(assessmentId, recs),
    saveHealthHistory(assessmentId, form.personal.fullName, healthScore, bmi, riskLevel, condition, form.symptoms.length),
  ]);

  return { assessmentId, healthScore, bmi, riskLevel, condition, confidence, recommendations: recs };
}

// ─── Dashboard query helpers ──────────────────────────────────────────────────

export interface DashboardStats {
  totalAssessments: number;
  avgHealthScore: number;
  mostCommonCondition: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data, error } = await supabase
    .from('health_history')
    .select('health_score, condition_name')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const total = rows.length;
  if (total === 0) {
    return { totalAssessments: 0, avgHealthScore: 0, mostCommonCondition: 'N/A' };
  }

  const avgHealthScore = Math.round(
    rows.reduce((sum, r) => sum + (r.health_score ?? 0), 0) / total,
  );

  const conditionMap: Record<string, number> = {};
  rows.forEach((r) => {
    if (r.condition_name) {
      conditionMap[r.condition_name] = (conditionMap[r.condition_name] ?? 0) + 1;
    }
  });
  const mostCommonCondition =
    Object.entries(conditionMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A';

  return { totalAssessments: total, avgHealthScore, mostCommonCondition };
}

export interface SymptomCount {
  name: string;
  count: number;
  percentage: number;
}

export async function getSymptomCountsFromDB(): Promise<SymptomCount[]> {
  const { data, error } = await supabase
    .from('assessment_symptoms')
    .select('symptom_name');

  if (error) throw new Error(error.message);

  const rows = data ?? [];
  if (!rows.length) return [];

  const counts: Record<string, number> = {};
  rows.forEach((r) => {
    if (r.symptom_name) counts[r.symptom_name] = (counts[r.symptom_name] ?? 0) + 1;
  });

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const max = sorted[0]?.[1] ?? 1;
  return sorted.map(([name, count]) => ({
    name,
    count,
    percentage: Math.round((count / max) * 100),
  }));
}

export interface RecentAssessmentRow {
  id: string;
  patient: string;
  age: number;
  condition: string;
  score: number;
  riskLevel: string;
  date: string;
}

export async function getRecentAssessments(limit = 10): Promise<RecentAssessmentRow[]> {
  const { data, error } = await supabase
    .from('health_history')
    .select(`
      id,
      assessment_id,
      patient_name,
      health_score,
      risk_level,
      condition_name,
      created_at,
      assessments!inner(patient_age)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return (data ?? []).map((r: any) => ({
    id: r.assessment_id,
    patient: r.patient_name,
    age: r.assessments?.patient_age ?? 0,
    condition: r.condition_name ?? 'Unknown',
    score: r.health_score ?? 0,
    riskLevel: r.risk_level ?? 'Unknown',
    date: r.created_at.split('T')[0],
  }));
}

// ─── Results page query helper ────────────────────────────────────────────────

export interface AssessmentResult {
  id: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  chiefComplaint: string;
  condition: string;
  confidence: number;
  healthScore: number;
  bmi: number;
  riskLevel: string;
  symptoms: Array<{ name: string; severity: number | null; trend: string | null }>;
  recommendations: Array<{ category: string; title: string; description: string; priority: number }>;
  createdAt: string;
}

export async function getAssessmentResult(assessmentId: string): Promise<AssessmentResult | null> {
  const [assessmentRes, symptomsRes, recsRes] = await Promise.all([
    supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .maybeSingle(),
    supabase
      .from('assessment_symptoms')
      .select('symptom_name, severity, trend')
      .eq('assessment_id', assessmentId),
    supabase
      .from('recommendations')
      .select('category, title, description, priority')
      .eq('assessment_id', assessmentId)
      .order('priority', { ascending: true }),
  ]);

  if (assessmentRes.error) throw new Error(assessmentRes.error.message);
  if (!assessmentRes.data) return null;

  const a = assessmentRes.data as DbAssessment;

  return {
    id: a.id,
    patientName: a.patient_name,
    patientAge: a.patient_age,
    patientGender: a.patient_gender,
    chiefComplaint: a.chief_complaint ?? '',
    condition: '',
    confidence: a.confidence_score ?? 0,
    healthScore: a.health_score ?? 0,
    bmi: a.bmi ?? 0,
    riskLevel: a.risk_level ?? 'Unknown',
    symptoms: (symptomsRes.data ?? []).map((s: any) => ({
      name: s.symptom_name,
      severity: s.severity,
      trend: s.trend,
    })),
    recommendations: (recsRes.data ?? []).map((r: any) => ({
      category: r.category,
      title: r.title,
      description: r.description,
      priority: r.priority,
    })),
    createdAt: a.created_at,
  };
}

// Kept for backward compat with legacy storage.ts consumers
export { getDashboardStats as getAssessmentStats };
