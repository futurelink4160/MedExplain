import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import Layout from '../components/Layout';
import {
  Activity,
  AlertCircle,
  Calendar,
  Download,
  FileText,
  MessageSquare,
  Pill,
  Sparkles,
  TrendingUp,
  Clock,
  Shield,
  BookOpen,
  ArrowRight,
  BarChart3,
  Zap,
  Target,
  X,
} from 'lucide-react';
import {
  getUserProfile,
  getUserSubscription,
  getQueryHistory,
  getUserRecommendations,
  analyzeHealthInsights,
  generateRecommendations,
  dismissRecommendation,
  downloadRecommendationsAsText,
  type UserProfile,
  type UserSubscription,
  type QueryHistoryItem,
  type UserRecommendation,
  type HealthInsight,
} from '../utils/dashboard';
import { formatRelativeTime } from '../utils/format';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [recentQueries, setRecentQueries] = useState<QueryHistoryItem[]>([]);
  const [recommendations, setRecommendations] = useState<UserRecommendation[]>([]);
  const [insights, setInsights] = useState<HealthInsight[]>([]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  async function loadDashboardData() {
    if (!user) return;

    setLoading(true);
    try {
      const [profileData, subscriptionData, historyData, recommendationsData, insightsData] = await Promise.all([
        getUserProfile(user.id),
        getUserSubscription(user.id),
        getQueryHistory(user.id, 5),
        getUserRecommendations(user.id),
        analyzeHealthInsights(user.id),
      ]);

      setProfile(profileData);
      setSubscription(subscriptionData);
      setRecentQueries(historyData);
      setRecommendations(recommendationsData);
      setInsights(insightsData);

      if (recommendationsData.length === 0) {
        await generateRecommendations(user.id);
        const newRecs = await getUserRecommendations(user.id);
        setRecommendations(newRecs);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDismissRecommendation(recommendationId: string) {
    const success = await dismissRecommendation(recommendationId);
    if (success) {
      setRecommendations(prev => prev.filter(r => r.id !== recommendationId));
    }
  }

  function handleDownloadRecommendations() {
    const userName = profile?.display_name || user?.email || 'User';
    downloadRecommendationsAsText(recommendations, userName);
  }

  function getUsagePercentage(): number {
    if (!subscription) return 0;
    return (subscription.queries_used_this_month / subscription.queries_per_month_limit) * 100;
  }

  function getUsageColor(): string {
    const percentage = getUsagePercentage();
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-orange-600';
    return 'text-emerald-600';
  }

  function getUsageBarColor(): string {
    const percentage = getUsagePercentage();
    if (percentage >= 90) return 'bg-gradient-to-r from-red-500 to-red-600';
    if (percentage >= 70) return 'bg-gradient-to-r from-orange-500 to-orange-600';
    return 'bg-gradient-to-r from-emerald-500 to-emerald-600';
  }

  function getUrgencyColor(urgency: string): string {
    switch (urgency?.toLowerCase()) {
      case 'high':
      case 'emergency':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'moderate':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }

  function getInsightIcon(icon: string) {
    switch (icon) {
      case 'Pill':
        return <Pill className="w-5 h-5 text-blue-600" />;
      case 'AlertCircle':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      case 'MessageSquare':
        return <MessageSquare className="w-5 h-5 text-blue-600" />;
      case 'Activity':
        return <Activity className="w-5 h-5 text-blue-600" />;
      default:
        return <Activity className="w-5 h-5 text-blue-600" />;
    }
  }

  const accountAge = user?.created_at
    ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gradient-to-br from-blue-50 via-white to-teal-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-10">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
              Welcome back, {profile?.display_name || user?.email?.split('@')[0] || 'there'}!
            </h1>
            <p className="text-gray-600 text-lg">
              Here's your personalized health inquiry overview
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-100 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Plan</h3>
                    <p className="text-2xl font-bold text-gray-900">Free</p>
                  </div>
                </div>
                <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wide">
                  Active
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <p>Full access to all features</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-100 hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Usage</h3>
                  <p className={`text-2xl font-bold ${getUsageColor()}`}>
                    {subscription?.queries_used_this_month || 0} / {subscription?.queries_per_month_limit || 50}
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-500 shadow-sm ${getUsageBarColor()}`}
                  style={{ width: `${Math.min(getUsagePercentage(), 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 font-medium">Queries this month</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-teal-100 hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Member</h3>
                  <p className="text-2xl font-bold text-gray-900">{accountAge} days</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">Since {new Date(user?.created_at || '').toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  Health Insights
                </h2>
              </div>

              {insights.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-gray-500 mb-4 font-medium">No insights yet</p>
                  <button
                    onClick={() => navigate('/chat')}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 font-medium transition-all transform hover:scale-105"
                  >
                    Start Your First Inquiry
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <div key={index} className="p-5 bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl border border-blue-100 hover:shadow-md transition-all">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                          {getInsightIcon(insight.icon)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{insight.title}</h3>
                          <p className="text-3xl font-bold text-blue-600 mb-2">{insight.value}</p>
                          <p className="text-sm text-gray-600">{insight.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  Recent Activity
                </h2>
                {recentQueries.length > 0 && (
                  <button
                    onClick={() => navigate('/history')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 hover:underline"
                  >
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {recentQueries.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-gray-500 mb-4 font-medium">No inquiries yet</p>
                  <button
                    onClick={() => navigate('/chat')}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium transition-all transform hover:scale-105"
                  >
                    Start Your First Inquiry
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentQueries.map((query) => (
                    <div
                      key={query.id}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => navigate('/history')}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {query.medication && (
                              <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                                <Pill className="w-4 h-4 text-blue-600" />
                                {query.medication}
                              </div>
                            )}
                            <span
                              className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getUrgencyColor(
                                query.response_data?.urgency_level || 'moderate'
                              )}`}
                            >
                              {query.response_data?.urgency_level || 'Moderate'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {query.question || 'No question provided'}
                          </p>
                          <p className="text-xs text-gray-500 font-medium">
                            {formatRelativeTime(query.created_at)}
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {recommendations.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  Personalized Recommendations
                </h2>
                <button
                  onClick={handleDownloadRecommendations}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-5 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-xl border-2 border-amber-200 relative hover:shadow-lg transition-all group"
                  >
                    <button
                      onClick={() => handleDismissRecommendation(rec.id)}
                      className="absolute top-3 right-3 p-1.5 hover:bg-white rounded-full transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                    </button>

                    <div className="mb-3">
                      <span className="px-3 py-1 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                        {rec.recommendation_type}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 mb-2 pr-6">{rec.title}</h3>
                    <p className="text-sm text-gray-700 mb-3 leading-relaxed">{rec.description}</p>

                    {(rec.related_medication || rec.related_gene) && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {rec.related_medication && (
                          <span className="px-2.5 py-1 bg-white text-gray-700 text-xs font-semibold rounded-lg border border-gray-300 flex items-center gap-1">
                            <Pill className="w-3 h-3" />
                            {rec.related_medication}
                          </span>
                        )}
                        {rec.related_gene && (
                          <span className="px-2.5 py-1 bg-white text-gray-700 text-xs font-semibold rounded-lg border border-gray-300">
                            {rec.related_gene}
                          </span>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => navigate('/evidence')}
                      className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Learn More
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gradient-to-r from-blue-600 via-teal-600 to-cyan-600 rounded-2xl shadow-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Zap className="w-8 h-8" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => navigate('/chat')}
                className="p-6 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl transition-all text-left backdrop-blur-sm border border-white border-opacity-20 hover:scale-105 transform"
              >
                <MessageSquare className="w-10 h-10 mb-3" />
                <h3 className="font-bold text-lg mb-1">New Inquiry</h3>
                <p className="text-sm text-blue-100">Ask about medications</p>
              </button>

              <button
                onClick={() => navigate('/evidence')}
                className="p-6 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl transition-all text-left backdrop-blur-sm border border-white border-opacity-20 hover:scale-105 transform"
              >
                <BookOpen className="w-10 h-10 mb-3" />
                <h3 className="font-bold text-lg mb-1">Evidence</h3>
                <p className="text-sm text-blue-100">Clinical guidelines</p>
              </button>

              <button
                onClick={() => navigate('/ask-pharmacist')}
                className="p-6 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl transition-all text-left backdrop-blur-sm border border-white border-opacity-20 hover:scale-105 transform"
              >
                <Target className="w-10 h-10 mb-3" />
                <h3 className="font-bold text-lg mb-1">Pharmacist</h3>
                <p className="text-sm text-blue-100">Expert guidance</p>
              </button>

              <button
                onClick={() => navigate('/history')}
                className="p-6 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl transition-all text-left backdrop-blur-sm border border-white border-opacity-20 hover:scale-105 transform"
              >
                <FileText className="w-10 h-10 mb-3" />
                <h3 className="font-bold text-lg mb-1">History</h3>
                <p className="text-sm text-blue-100">Past inquiries</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
