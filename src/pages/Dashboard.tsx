import { useState, useEffect } from 'react';
import { Activity, Users, BarChart3, AlertCircle, TrendingUp } from 'lucide-react';
import Card from '../components/Card';
import {
  getDashboardStats,
  getSymptomCountsFromDB,
  getRecentAssessments,
  type DashboardStats,
  type SymptomCount,
  type RecentAssessmentRow,
} from '../lib/assessmentHelpers';

const Dashboard = () => {
  const [dashStats, setDashStats] = useState<DashboardStats | null>(null);
  const [symptomsData, setSymptomsData] = useState<SymptomCount[]>([]);
  const [recentAssessments, setRecentAssessments] = useState<RecentAssessmentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [stats, symptoms, recent] = await Promise.all([
          getDashboardStats(),
          getSymptomCountsFromDB(),
          getRecentAssessments(10),
        ]);
        setDashStats(stats);
        setSymptomsData(symptoms);
        setRecentAssessments(recent);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data.');
        console.error('Dashboard load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const stats = dashStats
    ? [
        {
          label: 'Total Assessments',
          value: dashStats.totalAssessments.toString(),
          icon: Activity,
          trend: dashStats.totalAssessments > 0 ? 'All time' : 'No data',
          color: 'emerald',
        },
        {
          label: 'Total Users',
          value: dashStats.totalAssessments.toString(),
          icon: Users,
          trend: 'Active users',
          color: 'blue',
        },
        {
          label: 'Avg Health Score',
          value: dashStats.avgHealthScore > 0 ? `${dashStats.avgHealthScore}/100` : '—',
          icon: TrendingUp,
          trend: dashStats.avgHealthScore >= 75 ? 'Good' : dashStats.avgHealthScore >= 50 ? 'Moderate' : dashStats.avgHealthScore > 0 ? 'Needs care' : 'No data',
          color: 'amber',
        },
        {
          label: 'Most Common',
          value: dashStats.mostCommonCondition,
          icon: AlertCircle,
          trend: 'Condition',
          color: 'rose',
        },
      ]
    : [
        { label: 'Total Assessments', value: '—', icon: Activity, trend: 'Loading...', color: 'emerald' },
        { label: 'Total Users', value: '—', icon: Users, trend: 'Loading...', color: 'blue' },
        { label: 'Avg Health Score', value: '—', icon: TrendingUp, trend: 'Loading...', color: 'amber' },
        { label: 'Most Common', value: 'N/A', icon: AlertCircle, trend: 'Condition', color: 'rose' },
      ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-white to-teal-50/50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 animate-fadeIn">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Dashboard</h1>
          <p className="text-gray-600 text-lg">
            Monitor health trends and assessment statistics across the platform.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center space-x-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-5 py-4 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

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
                  <p className="text-2xl font-bold text-gray-900 truncate">{stat.value}</p>
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
                          <span className="text-sm text-gray-500">{symptom.count} case{symptom.count !== 1 ? 's' : ''}</span>
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
                  <h2 className="text-lg font-semibold text-gray-900">Health Score Distribution</h2>
                </div>
                {recentAssessments.length > 0 ? (
                  <div className="flex items-end justify-between h-48 px-2">
                    {recentAssessments.slice(0, 7).map((a, idx) => {
                      const pct = a.score;
                      const maxH = 140;
                      const barH = Math.max(8, Math.round((pct / 100) * maxH));
                      return (
                        <div key={idx} className="flex flex-col items-center flex-1">
                          <div className="relative w-full flex justify-center mb-2">
                            <div
                              className={`w-8 rounded-t-lg transition-all duration-500 hover:opacity-80 ${
                                pct >= 75
                                  ? 'bg-gradient-to-t from-emerald-500 to-teal-400'
                                  : pct >= 50
                                  ? 'bg-gradient-to-t from-amber-500 to-yellow-400'
                                  : 'bg-gradient-to-t from-rose-500 to-red-400'
                              }`}
                              style={{ height: `${barH}px` }}
                            >
                              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity text-xs font-medium text-gray-600 whitespace-nowrap">
                                {pct}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 font-medium truncate max-w-full px-0.5">
                            {a.patient.split(' ')[0]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No score history yet. Complete an assessment to see data here.
                  </p>
                )}
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
                          Risk
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
                          <td className="px-6 py-4 text-sm text-gray-600">{assessment.age || '—'}</td>
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
                                    assessment.score >= 75
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
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                assessment.riskLevel === 'Low'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : assessment.riskLevel === 'Moderate'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {assessment.riskLevel}
                            </span>
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
