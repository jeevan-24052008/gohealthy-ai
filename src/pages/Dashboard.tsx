import { useState, useEffect } from 'react';
import { Activity, Users, BarChart3, AlertCircle, TrendingUp } from 'lucide-react';
import Card from '../components/Card';
import {
  getAssessments,
  getAssessmentStats,
  getSymptomCounts,
} from '../lib/storage';

interface Assessment {
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

const Dashboard = () => {
  const [stats, setStats] = useState([
    { label: 'Total Assessments', value: '0', icon: Activity, trend: 'Loading...', color: 'emerald' },
    { label: 'Total Users', value: '0', icon: Users, trend: 'Loading...', color: 'blue' },
    { label: 'Avg Health Score', value: '0', icon: TrendingUp, trend: 'Loading...', color: 'amber' },
    { label: 'Most Common', value: 'N/A', icon: AlertCircle, trend: 'Condition', color: 'rose' },
  ]);
  const [symptomsData, setSymptomsData] = useState<
    { name: string; count: number; percentage: number }[]
  >([]);
  const [recentAssessments, setRecentAssessments] = useState<
    { id: string; patient: string; age: number; condition: string; score: number; date: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const weeklyData = [
    { day: 'Mon', assessments: 45 },
    { day: 'Tue', assessments: 52 },
    { day: 'Wed', assessments: 38 },
    { day: 'Thu', assessments: 65 },
    { day: 'Fri', assessments: 78 },
    { day: 'Sat', assessments: 42 },
    { day: 'Sun', assessments: 35 },
  ];

  const maxAssessments = Math.max(...weeklyData.map((d) => d.assessments));

  useEffect(() => {
    const loadData = async () => {
      try {
        const [assessmentStats, symptomCounts, assessments] = await Promise.all([
          getAssessmentStats(),
          getSymptomCounts(),
          getAssessments(),
        ]);

        setStats([
          {
            label: 'Total Assessments',
            value: assessmentStats.totalAssessments.toString(),
            icon: Activity,
            trend: '+12%',
            color: 'emerald',
          },
          {
            label: 'Total Users',
            value: assessmentStats.totalAssessments.toString(),
            icon: Users,
            trend: '+8%',
            color: 'blue',
          },
          {
            label: 'Avg Health Score',
            value: assessmentStats.avgHealthScore.toString(),
            icon: TrendingUp,
            trend: '+3%',
            color: 'amber',
          },
          {
            label: 'Most Common',
            value: assessmentStats.mostCommonCondition,
            icon: AlertCircle,
            trend: 'Condition',
            color: 'rose',
          },
        ]);

        setSymptomsData(symptomCounts);

        const recentData = assessments.slice(0, 5).map((a: Assessment) => ({
          id: a.id,
          patient: a.patient_name,
          age: a.patient_age,
          condition: a.condition_name,
          score: a.health_score,
          date: a.created_at.split('T')[0],
        }));

        setRecentAssessments(recentData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-white to-teal-50/50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 animate-fadeIn">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Dashboard</h1>
          <p className="text-gray-600 text-lg">
            Monitor health trends and assessment statistics across the platform.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, idx) => (
                <Card key={idx} hover className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl ${
                        stat.color === 'emerald'
                          ? 'bg-emerald-100'
                          : stat.color === 'blue'
                          ? 'bg-blue-100'
                          : stat.color === 'amber'
                          ? 'bg-amber-100'
                          : 'bg-rose-100'
                      } flex items-center justify-center`}
                    >
                      <stat.icon
                        className={`w-6 h-6 ${
                          stat.color === 'emerald'
                            ? 'text-emerald-600'
                            : stat.color === 'blue'
                            ? 'text-blue-600'
                            : stat.color === 'amber'
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}
                      />
                    </div>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                      {stat.trend}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </Card>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Common Symptoms</h2>
                </div>
                {symptomsData.length > 0 ? (
                  <div className="space-y-4">
                    {symptomsData.map((symptom, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">{symptom.name}</span>
                          <span className="text-sm text-gray-500">{symptom.count} cases</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                            style={{ width: `${symptom.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No symptom data yet. Complete an assessment to see data here.
                  </p>
                )}
              </Card>

              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Weekly Health Trends</h2>
                </div>
                <div className="flex items-end justify-between h-48 px-2">
                  {weeklyData.map((data, idx) => (
                    <div key={idx} className="flex flex-col items-center flex-1">
                      <div className="relative w-full flex justify-center mb-2">
                        <div
                          className="w-8 rounded-t-lg bg-gradient-to-t from-emerald-500 to-teal-400 transition-all duration-500 hover:from-emerald-600 hover:to-teal-500"
                          style={{ height: `${(data.assessments / maxAssessments) * 140}px` }}
                        >
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity text-xs font-medium text-gray-600 whitespace-nowrap">
                            {data.assessments}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">{data.day}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card className="overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Recent Assessments</h2>
              </div>
              {recentAssessments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Patient
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Age
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Condition
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentAssessments.map((assessment) => (
                        <tr key={assessment.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white text-sm font-medium mr-3">
                                {assessment.patient.charAt(0)}
                              </div>
                              <span className="font-medium text-gray-900">{assessment.patient}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{assessment.age}</td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700">
                              {assessment.condition}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden mr-2">
                                <div
                                  className={`h-full rounded-full ${
                                    assessment.score >= 70
                                      ? 'bg-emerald-500'
                                      : assessment.score >= 50
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${assessment.score}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {assessment.score}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{assessment.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p>No assessments yet. Complete a symptom check to see data here.</p>
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
