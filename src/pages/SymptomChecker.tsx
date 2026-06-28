import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Thermometer,
  Wind,
  Brain,
  Heart,
  Zap,
  Activity,
  CircleDot,
  MoreHorizontal,
  Check,
  AlertCircle,
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';

interface Symptom {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  selected: boolean;
}

interface FormErrors {
  fullName?: string;
  age?: string;
  gender?: string;
  symptoms?: string;
}

const SymptomChecker = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState({ fullName: false, age: false, gender: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [symptoms, setSymptoms] = useState<Symptom[]>([
    { id: 'fever', label: 'Fever', icon: Thermometer, selected: false },
    { id: 'cough', label: 'Cough', icon: Wind, selected: false },
    { id: 'headache', label: 'Headache', icon: Brain, selected: false },
    { id: 'sore-throat', label: 'Sore Throat', icon: Heart, selected: false },
    { id: 'fatigue', label: 'Fatigue', icon: Zap, selected: false },
    { id: 'body-pain', label: 'Body Pain', icon: Activity, selected: false },
    { id: 'nausea', label: 'Nausea', icon: CircleDot, selected: false },
    { id: 'others', label: 'Others', icon: MoreHorizontal, selected: false },
  ]);

  const selectedCount = symptoms.filter((s) => s.selected).length;

  const validateField = (name: string, value: string) => {
    if (!value || value.trim() === '') {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }
    if (name === 'age') {
      const age = parseInt(value);
      if (isNaN(age) || age < 1 || age > 120) {
        return 'Please enter a valid age (1-120)';
      }
    }
    return undefined;
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field as keyof typeof touched]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const toggleSymptom = (id: string) => {
    setSymptoms(
      symptoms.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s))
    );
    if (errors.symptoms) {
      setErrors((prev) => ({ ...prev, symptoms: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      fullName: validateField('fullName', formData.fullName),
      age: validateField('age', formData.age),
      gender: validateField('gender', formData.gender),
      symptoms: selectedCount === 0 ? 'Please select at least one symptom' : undefined,
    };
    setErrors(newErrors);
    setTouched({ fullName: true, age: true, gender: true });
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const selectedSymptoms = symptoms.filter((s) => s.selected);
    navigate('/results', {
      state: {
        ...formData,
        symptoms: selectedSymptoms.map((s) => s.label),
      },
    });
  };

  const getInputClasses = (field: keyof typeof touched, hasValue: boolean = false) => {
    const baseClasses = 'w-full px-4 py-3 rounded-xl border transition-all outline-none';
    const hasError = touched[field] && errors[field];
    const isValid = touched[field] && !errors[field] && hasValue;

    if (hasError) {
      return `${baseClasses} border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-red-50/50`;
    }
    if (isValid) {
      return `${baseClasses} border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20`;
    }
    return `${baseClasses} border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20`;
  };

  const selectClasses = `w-full px-4 py-3 rounded-xl border transition-all outline-none bg-white ${
    touched.gender && errors.gender
      ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-red-50/50'
      : touched.gender && !errors.gender && formData.gender
      ? 'border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
      : 'border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
  }`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-white to-teal-50/50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Symptom Checker
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Tell us about your symptoms and our AI will analyze them to provide
            personalized health insights.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <Card className="p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Personal Information
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  onBlur={() => handleBlur('fullName')}
                  className={getInputClasses('fullName', !!formData.fullName)}
                  placeholder="Enter your name"
                />
                {touched.fullName && errors.fullName && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.fullName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                  onBlur={() => handleBlur('age')}
                  className={getInputClasses('age', !!formData.age)}
                  placeholder="Enter your age"
                  min="1"
                  max="120"
                />
                {touched.age && errors.age && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.age}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  onBlur={() => handleBlur('gender')}
                  className={selectClasses}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {touched.gender && errors.gender && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.gender}
                  </p>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Select Your Symptoms <span className="text-red-500">*</span>
              </h2>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                selectedCount > 0
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-gray-500 bg-gray-100'
              }`}>
                {selectedCount} selected
              </span>
            </div>

            {errors.symptoms && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {errors.symptoms}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {symptoms.map((symptom) => (
                <button
                  key={symptom.id}
                  type="button"
                  onClick={() => toggleSymptom(symptom.id)}
                  className={`relative p-6 rounded-xl border-2 transition-all duration-300 text-left group ${
                    symptom.selected
                      ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/10'
                      : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                  }`}
                >
                  {symptom.selected && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <symptom.icon
                    className={`w-10 h-10 mb-3 transition-colors ${
                      symptom.selected ? 'text-emerald-500' : 'text-gray-400 group-hover:text-emerald-500'
                    }`}
                  />
                  <p
                    className={`font-medium transition-colors ${
                      symptom.selected ? 'text-emerald-700' : 'text-gray-700'
                    }`}
                  >
                    {symptom.label}
                  </p>
                </button>
              ))}
            </div>
          </Card>

          <div className="flex justify-center">
            <Button
              type="submit"
              size="lg"
              icon={!isSubmitting}
              loading={isSubmitting}
              disabled={selectedCount === 0 || isSubmitting}
              className="w-full md:w-auto min-w-[200px]"
            >
              Analyze Symptoms
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SymptomChecker;
