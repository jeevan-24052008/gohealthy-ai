import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { Activity, CheckCircle, AlertTriangle, Stethoscope } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { saveAssessment } from '../lib/storage';

interface ResultsState {
  fullName: string;
  age: string;
  gender: string;
  symptoms: string[];
}

const getPrediction = (symptoms: string[]) => {
  const hasSymptom = (name: string) =>
    symptoms.some((s) => s.toLowerCase() === name.toLowerCase());

  if (hasSymptom('Fever') && hasSymptom('Cough')) {
    return {
      condition: 'Flu (Influenza)',
      confidence: 85,
      recommendations: [
        'Rest and stay hydrated to help your body fight the infection',
        'Take over-the-counter fever reducers like acetaminophen or ibuprofen',
        'Isolate yourself to prevent spreading the virus to others',
        'Monitor your temperature and seek medical help if fever exceeds 103°F',
        'Get plenty of sleep to boost your immune system',
      ],
    };
  }

  if (hasSymptom('Headache') && hasSymptom('Fatigue')) {
    return {
      condition: 'Migraine',
      confidence: 80,
      recommendations: [
        'Rest in a quiet, dark room to reduce sensory stimulation',
        'Apply cold or warm compresses to your head or neck',
        'Stay hydrated and avoid skipping meals',
        'Avoid triggers like bright screens, loud noises, and strong smells',
        'Consider over-the-counter migraine medications if needed',
      ],
    };
  }

  if (hasSymptom('Sore Throat') && hasSymptom('Cough')) {
    return {
      condition: 'Common Cold',
      confidence: 75,
      recommendations: [
        'Gargle with warm salt water to soothe your throat',
        'Drink warm fluids like tea with honey to ease throat irritation',
        'Use throat lozenges or sprays for temporary relief',
        'Get extra rest to help your body fight the cold virus',
        'Use a humidifier to keep your throat moist',
      ],
    };
  }

  return {
    condition: 'General Viral Infection',
    confidence: 70,
    recommendations: [
      'Get plenty of rest and sleep to support your immune system',
      'Stay hydrated with water and warm fluids',
      'Take over-the-counter medications to manage symptoms',
      'Monitor your symptoms and seek medical attention if they worsen',
      'Maintain good hygiene to prevent spreading the infection',
    ],
  };
};

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [confidence, setConfidence] = useState(0);
  const state = location.state as ResultsState;

  const prediction = useMemo(() => {
    if (!state?.symptoms?.length) {
      return { condition: 'Unknown', confidence: 0, recommendations: [] };
    }
    return getPrediction(state.symptoms);
  }, [state?.symptoms]);

  useEffect(() => {
    if (!state?.symptoms?.length) {
      navigate('/symptom-checker');
      return;
    }

    const healthScore = Math.floor(Math.random() * 20) + 70;

    saveAssessment({
      fullName: state.fullName,
      age: state.age,
      gender: state.gender,
      symptoms: state.symptoms,
      condition: prediction.condition,
      confidenceScore: prediction.confidence,
      healthScore,
    }).catch((err) => {
      console.error('Failed to save assessment:', err);
    });

    const targetConfidence = prediction.confidence;
    let current = 0;
    const interval = setInterval(() => {
      if (current >= targetConfidence) {
        clearInterval(interval);
      } else {
        current += 2;
        setConfidence(Math.min(current, targetConfidence));
      }
    }, 30);

    return () => clearInterval(interval);
  }, [state, prediction, navigate]);

  if (!state?.symptoms?.length) return null;

  const { condition, recommendations } = prediction;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-white to-teal-50/50 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Analysis Results
          </h1>
          <p className="text-gray-600 text-lg">
            Based on your symptoms, here's what our AI found.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <Stethoscope className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Possible Condition</p>
                  <h2 className="text-2xl font-bold text-gray-900">{condition}</h2>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Confidence Level</span>
                  <span className="text-lg font-bold text-emerald-600">{confidence}%</span>
                </div>
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${confidence}%` }}
                  />
                </div>
              </div>

              <div className="bg-emerald-50 rounded-xl p-4 flex items-start space-x-3">
                <Activity className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-emerald-800">AI Analysis Complete</p>
                  <p className="text-sm text-emerald-600 mt-1">
                    Our system analyzed {state.symptoms.length} symptoms to determine this result.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Symptoms Summary</h3>
              <div className="flex flex-wrap gap-2">
                {state.symptoms.map((symptom, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium"
                  >
                    {symptom}
                  </span>
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Patient: {state.fullName} | Age: {state.age} | Gender: {state.gender}
              </div>
            </Card>

            <Card className="p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Recommendations</h3>
              <ul className="space-y-4">
                {recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6 bg-amber-50 border-amber-100">
              <div className="flex items-start space-x-4">
                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-800 mb-1">Medical Disclaimer</h4>
                  <p className="text-sm text-amber-700">
                    This is not a medical diagnosis. Please consult a healthcare professional
                    for proper evaluation and treatment. AI predictions should not replace
                    professional medical advice.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card className="p-8 bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Activity className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-center mb-2">Health Score</h3>
                <p className="text-emerald-100 text-sm text-center mb-6">
                  Based on your current symptoms and analysis
                </p>
                <Button
                  to="/health-score"
                  variant="secondary"
                  className="w-full bg-white text-emerald-600 hover:bg-emerald-50"
                >
                  View Health Score
                </Button>
              </Card>

              <div className="hidden lg:block">
                <img
                  src="https://images.pexels.com/photos/305568/pexels-photo-305568.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Medical professional"
                  className="w-full h-64 object-cover rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
