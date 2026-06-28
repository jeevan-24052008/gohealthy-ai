import { Brain, Shield, HeartPulse, Smartphone, Stethoscope } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';

const Home = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description:
        'Advanced machine learning algorithms analyze your symptoms to provide accurate health insights.',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description:
        'Your health data is encrypted and protected with enterprise-grade security measures.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: HeartPulse,
      title: 'Health Recommendations',
      description:
        'Get personalized health tips and recommendations based on your unique health profile.',
      color: 'from-rose-500 to-pink-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-white to-teal-50/50 pt-20 pb-16">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slideUp">
              <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium">
                <Brain className="w-4 h-4" />
                <span>Powered by Advanced AI</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Your Health,{' '}
                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  Our Priority
                </span>
              </h1>

              <p className="text-xl text-emerald-600 font-semibold">AI-Powered Health Assistant</p>

              <p className="text-gray-600 text-lg leading-relaxed max-w-xl">
                Experience the future of healthcare with our intelligent symptom analysis system.
                Get instant health insights, personalized recommendations, and track your wellness
                journey with cutting-edge AI technology.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button to="/symptom-checker" size="lg" icon>
                  Start Health Assessment
                </Button>
                <Button to="/about" variant="secondary" size="lg">
                  Learn More
                </Button>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative w-full max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-3xl transform rotate-6 opacity-20 blur-2xl" />

                <div className="relative bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl p-8 shadow-2xl shadow-emerald-500/25 transform hover:scale-105 transition-transform duration-500">
                  <div className="bg-white rounded-2xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Health Monitor</span>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    </div>

                    <div className="flex items-center justify-center py-8">
                      <div className="relative">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="12"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="12"
                            strokeDasharray="352"
                            strokeDashoffset="88"
                            strokeLinecap="round"
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#10b981" />
                              <stop offset="100%" stopColor="#14b8a6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl font-bold text-gray-900">75</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-emerald-50 rounded-lg p-2">
                        <p className="text-xs text-gray-500">Heart</p>
                        <p className="font-semibold text-emerald-600">72</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-2">
                        <p className="text-xs text-gray-500">O2</p>
                        <p className="font-semibold text-blue-600">98%</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-2">
                        <p className="text-xs text-gray-500">Sleep</p>
                        <p className="font-semibold text-purple-600">7h</p>
                      </div>
                    </div>
                  </div>

                  <Smartphone className="absolute -top-6 -right-6 w-16 h-16 text-white opacity-20" />
                </div>

                <div className="absolute -bottom-8 -left-8 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 transform hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">AI Analysis</p>
                      <p className="text-xs text-gray-500">Symptom checker</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} hover className="p-8 transition-transform duration-300 hover:-translate-y-1">
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 shadow-lg`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
