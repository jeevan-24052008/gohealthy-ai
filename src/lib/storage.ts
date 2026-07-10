export interface HealthAssessment {
  id: string;
  patient_name: string;
  patient_age: number;
  patient_gender: string;
  condition_name: string;
  confidence_score: number;
  health_score: number;
  symptoms: string[];
  created_at: string;
}

export interface AssessmentInput {
  fullName: string;
  age: string;
  gender: string;
  symptoms: string[];
  condition: string;
  confidenceScore: number;
  healthScore: number;
}

const STORAGE_KEY = 'health_assessments';

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const saveAssessment = async (
  assessment: AssessmentInput
): Promise<{ success: boolean; id?: string }> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const assessments: HealthAssessment[] = stored ? JSON.parse(stored) : [];

    const newAssessment: HealthAssessment = {
      id: generateId(),
      patient_name: assessment.fullName,
      patient_age: parseInt(assessment.age),
      patient_gender: assessment.gender,
      condition_name: assessment.condition,
      confidence_score: assessment.confidenceScore,
      health_score: assessment.healthScore,
      symptoms: assessment.symptoms,
      created_at: new Date().toISOString(),
    };

    assessments.unshift(newAssessment);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assessments));

    return { success: true, id: newAssessment.id };
  } catch (err) {
    console.error('Error saving assessment:', err);
    return { success: false };
  }
};

export const getAssessments = async (): Promise<HealthAssessment[]> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error('Error fetching assessments:', err);
    return [];
  }
};

export const getAssessmentStats = async () => {
  const assessments = await getAssessments();

  if (assessments.length === 0) {
    return {
      totalAssessments: 0,
      avgHealthScore: 0,
      mostCommonCondition: 'N/A',
    };
  }

  const avgHealthScore = Math.round(
    assessments.reduce((sum, a) => sum + a.health_score, 0) / assessments.length
  );

  const conditionCounts: Record<string, number> = {};
  assessments.forEach((a) => {
    conditionCounts[a.condition_name] = (conditionCounts[a.condition_name] || 0) + 1;
  });

  const mostCommonCondition = Object.entries(conditionCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  return {
    totalAssessments: assessments.length,
    avgHealthScore,
    mostCommonCondition,
  };
};

export const getSymptomCounts = async (): Promise<{ name: string; count: number; percentage: number }[]> => {
  const assessments = await getAssessments();

  if (assessments.length === 0) {
    return [];
  }

  const symptomCounts: Record<string, number> = {};
  assessments.forEach((a) => {
    a.symptoms.forEach((s) => {
      symptomCounts[s] = (symptomCounts[s] || 0) + 1;
    });
  });

  const sortedSymptoms = Object.entries(symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const maxSymptomCount = sortedSymptoms.length > 0 ? sortedSymptoms[0].count : 1;
  return sortedSymptoms.map((s) => ({
    name: s.name,
    count: s.count,
    percentage: Math.round((s.count / maxSymptomCount) * 100),
  }));
};
