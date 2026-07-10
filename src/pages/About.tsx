import { Brain, Shield, Heart, Activity, Bot } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';

const About = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered',
      description:
        'Our advanced artificial intelligence system analyzes thousands of medical data points to deliver accurate health insights.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description:
        'We use enterprise-grade encryption and follow strict privacy protocols to protect your personal health information.',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Heart,
      title: 'Trusted Guidance',
      description:
        'Our AI is trained on verified medical data and reviewed by healthcare professionals for reliable recommendations.',
      color: 'from-rose-500 to-pink-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-white to-teal-50/50 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="animate-slideUp">
            <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Activity className="w-4 h-4" />
              <span>About GoHealthy AI</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Your Intelligent{' '}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Health Companion
              </span>
            </h1>

            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              GoHealthy AI is a revolutionary healthcare assistant that leverages cutting-edge
              artificial intelligence to help you understand and monitor your health. Our platform
              provides instant symptom analysis, personalized recommendations, and comprehensive
              health tracking.
            </p>

            <p className="text-gray-600 leading-relaxed mb-8">
              Whether you're experiencing symptoms or simply want to maintain optimal wellness,
              our AI-powered tools guide you through every step of your health journey. We believe
              that everyone deserves access to reliable health information and personalized care
              guidance.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button to="/symptom-checker" icon>
                Try Symptom Checker
              </Button>
              <Button to="/dashboard" variant="secondary">
                View Dashboard
              </Button>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-3xl transform -rotate-6 opacity-20 blur-2xl" />
            <div className="relative bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl p-8 shadow-2xl shadow-emerald-500/25">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-16 h-16 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white text-center mb-2">AI Healthcare Assistant</h3>
              <p className="text-emerald-100 text-center">
                Powered by advanced machine learning algorithms
              </p>
            </div>
          </div>
        </div>

        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose GoHealthy AI?</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Our platform combines the power of AI with medical expertise to deliver
              accurate and helpful health insights.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <Card key={idx} hover className="p-8 transition-transform duration-300 hover:-translate-y-1">
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
        </section>

        <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-10 text-white">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold mb-2">50K+</p>
              <p className="text-gray-400">Happy Users</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">100K+</p>
              <p className="text-gray-400">Assessments Done</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">95%</p>
              <p className="text-gray-400">Accuracy Rate</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">24/7</p>
              <p className="text-gray-400">Availability</p>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <Card className="p-8 bg-amber-50 border-amber-100">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-800 mb-2">Medical Disclaimer</h3>
                <p className="text-amber-700">
                  GoHealthy AI provides general health information and symptom analysis for
                  educational purposes only. This service is not intended to replace professional
                  medical advice, diagnosis, or treatment. Always seek the advice of your physician
                  or other qualified health provider with any questions you may have regarding a
                  medical condition. If you think you may have a medical emergency, call your
                  doctor or emergency services immediately.
                </p>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default About;
