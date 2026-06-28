import { useState, useEffect } from 'react';
import { Moon, Droplets, Dumbbell, Utensils, Brain, Lightbulb, Star } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';

interface HealthCategory {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  rating: number;
  color: string;
  bgColor: string;
}

const HealthScore = () => {
  const [sleepHours, setSleepHours] = useState(7);
  const [waterIntake, setWaterIntake] = useState(2);
  const [exerciseDays, setExerciseDays] = useState(3);
  const [animatedScore, setAnimatedScore] = useState(0);

  const calculateScore = () => {
    const sleepScore = Math.min((sleepHours / 8) * 40, 40);
    const waterScore = Math.min((waterIntake / 3) * 30, 30);
    const exerciseScore = Math.min((exerciseDays / 5) * 30, 30);
    return Math.round(sleepScore + waterScore + exerciseScore);
  };

  const score = calculateScore();

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      if (current >= score) {
        clearInterval(interval);
      } else {
        current += 1;
        setAnimatedScore(Math.min(current, score));
      }
    }, 25);

    return () => clearInterval(interval);
  }, [score]);

  const categories: HealthCategory[] = [
    { name: 'Sleep', icon: Moon, rating: Math.round(sleepHours / 2), color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
    { name: 'Water Intake', icon: Droplets, rating: Math.round(waterIntake), color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { name: 'Exercise', icon: Dumbbell, rating: Math.round(exerciseDays / 1.4), color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { name: 'Diet', icon: Utensils, rating: 4, color: 'text-amber-600', bgColor: 'bg-amber-50' },
    { name: 'Stress Level', icon: Brain, rating: 3, color: 'text-rose-600', bgColor: 'bg-rose-50' },
  ];

  const getHealthStatus = () => {
    if (score >= 80) return 'Excellent! Keep up the great work!';
    if (score >= 60) return 'Good health! Some areas for improvement.';
    return 'Needs Improvement. Consider lifestyle changes.';
  };

  const tips = [
    {
      title: 'Improve Sleep Quality',
      description: 'Try to maintain a consistent sleep schedule, aiming for 7-9 hours each night.',
      icon: Moon,
    },
    {
      title: 'Stay Hydrated',
      description: 'Drink at least 8 glasses of water daily to maintain optimal hydration.',
      icon: Droplets,
    },
    {
      title: 'Regular Exercise',
      description: 'Aim for 30 minutes of moderate exercise at least 5 days a week.',
      icon: Dumbbell,
    },
  ];

  const getScoreColor = () => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#14b8a6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const circumference = 2 * Math.PI * 120;
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-white to-teal-50/50 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Health Score</h1>
          <p className="text-gray-600 text-lg">
            Your personalized wellness assessment based on various health factors.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <Card className="p-10 text-center">
              <div className="relative inline-flex items-center justify-center mb-6">
                <svg className="w-64 h-64 transform -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="16"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    fill="none"
                    stroke={getScoreColor()}
                    strokeWidth="16"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-6xl font-bold text-gray-900">{animatedScore}</span>
                  <span className="text-gray-500 font-medium">out of 100</span>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-xl p-4 mb-6">
                <p className="text-emerald-800 font-medium">{getHealthStatus()}</p>
              </div>

              <Button to="/symptom-checker" icon>
                Start New Assessment
              </Button>
            </Card>

            <Card className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Health Inputs</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                        <Moon className="w-5 h-5 text-indigo-600" />
                      </div>
                      <span className="font-medium text-gray-900">Sleep Hours</span>
                    </div>
                    <span className="text-lg font-bold text-indigo-600">{sleepHours} hrs</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="12"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0 hrs</span>
                    <span>12 hrs</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Droplets className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-900">Water Intake</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">{waterIntake} L</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={waterIntake}
                    onChange={(e) => setWaterIntake(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0 L</span>
                    <span>5 L</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <Dumbbell className="w-5 h-5 text-emerald-600" />
                      </div>
                      <span className="font-medium text-gray-900">Exercise Days</span>
                    </div>
                    <span className="text-lg font-bold text-emerald-600">{exerciseDays} days</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="7"
                    value={exerciseDays}
                    onChange={(e) => setExerciseDays(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0 days</span>
                    <span>7 days</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Score Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sleep (max 40 pts)</span>
                    <span className="font-medium text-indigo-600">{Math.round(Math.min((sleepHours / 8) * 40, 40))} pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Water (max 30 pts)</span>
                    <span className="font-medium text-blue-600">{Math.round(Math.min((waterIntake / 3) * 30, 30))} pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Exercise (max 30 pts)</span>
                    <span className="font-medium text-emerald-600">{Math.round(Math.min((exerciseDays / 5) * 30, 30))} pts</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-medium text-gray-900">Total Score</span>
                    <span className="font-bold text-emerald-600">{score} pts</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Health Categories</h2>
              <div className="space-y-4">
                {categories.map((category, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl ${category.bgColor} flex items-center justify-center`}>
                        <category.icon className={`w-6 h-6 ${category.color}`} />
                      </div>
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= category.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Tips for Improvement</h2>
              </div>
              <div className="space-y-4">
                {tips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-4 p-4 rounded-xl bg-gray-50 hover:bg-emerald-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                      <tip.icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">{tip.title}</h3>
                      <p className="text-sm text-gray-600">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="hidden lg:block">
              <img
                src="https://images.pexels.com/photos/305565/pexels-photo-305565.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Wellness illustration"
                className="w-full h-48 object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthScore;
