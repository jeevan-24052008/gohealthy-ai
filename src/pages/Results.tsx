import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Activity, CheckCircle, AlertTriangle, Stethoscope, TrendingUp, Heart } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';

interface LocationState {
  assessmentId: string;
  healthScore: number;
  bmi: number;
  riskLevel: string;
  condition: string;
  confidence: number;
  recommendations: Array<{ category: string; title: string; description: string; priority: number }>;
  symptoms: string[];
  fullName: string;
  age: string;
  gender: string;
}

const riskColors: Record<string, { bg: string; text: string; badge: string }> = {
  Low: {
    bg: 'from-emerald-500 to-teal-500',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  Moderate: {
    bg: 'from-amber-500 to-orange-500',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
  },
  High: {
    bg: 'from-rose-500 to-red-500',
    text: 'text-rose-700',
    badge: 'bg-rose-100 text-rose-700',
  },
};

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [animatedConfidence, setAnimatedConfidence] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);

  const state = location.state as LocationState | null;

  useEffect(() => {
    if (!state?.symptoms?.length) {
      navigate('/symptom-checker');
    }
  }, [state, navigate]);

  useEffect(() => {
    if (!state) return;
    const targetConf = state.confidence;
    const targetScore = state.healthScore;
    let conf = 0;
    let score = 0;

    const interval = setInterval(() => {
      let done = true;
      if (conf < targetConf) { conf = Math.min(conf + 2, targetConf); done = false; }
      if (score < targetScore) { score = Math.min(score + 2, targetScore); done = false; }
      setAnimatedConfidence(conf);
      setAnimatedScore(score);
      if (done) clearInterval(interval);
    }, 20);

    return () => clearInterval(interval);
  }, [state]);

  if (!state?.symptoms?.length) return null;

  const { condition, healthScore, bmi, riskLevel, recommendations, symptoms, fullName, age, gender } = state;

  const risk = riskColors[riskLevel] ?? riskColors.Moderate;

  const bmiCategory = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';

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
          {/* Main column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Condition card */}
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
                  <span className="text-lg font-bold text-emerald-600">{animatedConfidence}%</span>
                </div>
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
                    style={{ width: `${animatedConfidence}%` }}
                  />
                </div>
              </div>

              <div className="bg-emerald-50 rounded-xl p-4 flex items-start space-x-3">
                <Activity className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-emerald-800">AI Analysis Complete</p>
                  <p className="text-sm text-emerald-600 mt-1">
                    Our system analysed {symptoms.length} symptom{symptoms.length !== 1 ? 's' : ''} to determine this result.
                  </p>
                </div>
              </div>
            </Card>

            {/* Symptoms summary */}
            <Card className="p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Symptoms Summary</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {symptoms.map((symptom, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium"
                  >
                    {symptom}
                  </span>
                ))}
              </div>
              <div className="text-sm text-gray-500">
                Patient: <strong className="text-gray-700">{fullName}</strong> &nbsp;|&nbsp; Age: <strong className="text-gray-700">{age}</strong> &nbsp;|&nbsp; Gender: <strong className="text-gray-700">{gender}</strong>
              </div>
            </Card>

            {/* Recommendations */}
            <Card className="p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Personalised Recommendations</h3>
              <ul className="space-y-4">
                {recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-0.5">{rec.category}</p>
                      <p className="text-sm font-semibold text-gray-800">{rec.title}</p>
                      <p className="text-sm text-gray-600">{rec.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Disclaimer */}
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

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Health Score */}
              <Card className={`p-8 bg-gradient-to-br ${risk.bg} text-white`}>
                <div className="text-center mb-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-3">
                    <span className="text-3xl font-bold">{animatedScore}</span>
                  </div>
                  <h3 className="text-lg font-semibold">Health Score</h3>
                  <p className="text-white/80 text-sm mt-1">out of 100</p>
                </div>

                <div className="mt-4 bg-white/20 rounded-xl px-4 py-3 text-center">
                  <p className="text-xs text-white/70 uppercase tracking-wide font-medium">Risk Level</p>
                  <p className="text-lg font-bold mt-0.5">{riskLevel}</p>
                </div>

                <div className="mt-3 bg-white/20 rounded-xl px-4 py-3 text-center">
                  <p className="text-xs text-white/70 uppercase tracking-wide font-medium">BMI</p>
                  <p className="text-lg font-bold mt-0.5">{bmi > 0 ? `${bmi} – ${bmiCategory}` : 'N/A'}</p>
                </div>
              </Card>

              {/* Score breakdown bar */}
              <Card className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-semibold text-gray-700">Score Breakdown</h3>
                </div>
                <div className="space-y-2">
                  {['Excellent (75–100)', 'Good (50–74)', 'Needs attention (<50)'].map((label, i) => {
                    const colors = ['bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];
                    const ranges = [[75, 100], [50, 74], [0, 49]];
                    const inRange = healthScore >= ranges[i][0] && healthScore <= ranges[i][1];
                    return (
                      <div key={i} className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${inRange ? 'bg-gray-50 ring-1 ring-gray-200' : ''}`}>
                        <div className={`w-3 h-3 rounded-full ${colors[i]}`} />
                        <span className={`text-xs font-medium ${inRange ? 'text-gray-900' : 'text-gray-500'}`}>{label}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <h3 className="text-sm font-semibold text-gray-700">Next Steps</h3>
                </div>
                <div className="space-y-2">
                  <Button to="/dashboard" variant="primary" className="w-full text-sm" size="sm">
                    View Dashboard
                  </Button>
                  <Button to="/symptom-checker" variant="outline" className="w-full text-sm" size="sm">
                    New Assessment
                  </Button>
                </div>
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
