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
  User,
  X,
  Clock,
  Shield,
  BookOpen,
  ArrowRight,
  ChevronRight,
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
  const [expandedQuery, setExpandedQuery] = useState<string | null>(null);

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
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  }

  function getUsageBarColor(): string {
    const percentage = getUsagePercentage();
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  }

  function getUrgencyColor(urgency: string): string {
    switch (urgency?.toLowerCase()) {
      case 'high':
      case 'emergency':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.display_name || user?.email?.split('@')[0] || 'there'}!
          </h1>
          <p className="text-gray-600">
            Here's your personalized health inquiry overview
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Subscription</h3>
                  <p className="text-2xl font-bold text-gray-900">Free Plan</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                Active
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <p>Unlimited access to all features</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Monthly Usage</h3>
                <p className={`text-2xl font-bold ${getUsageColor()}`}>
                  {subscription?.queries_used_this_month || 0} / {subscription?.queries_per_month_limit || 50}
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full transition-all ${getUsageBarColor()}`}
                style={{ width: `${Math.min(getUsagePercentage(), 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">Queries used this month</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Account Age</h3>
                <p className="text-2xl font-bold text-gray-900">{accountAge} days</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">Member since {new Date(user?.created_at || '').toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Health Insights
              </h2>
            </div>

            {insights.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No insights yet</p>
                <button
                  onClick={() => navigate('/chat')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Start your first inquiry
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {insight.icon === 'Pill' && <Pill className="w-5 h-5 text-blue-600" />}
                        {insight.icon === 'AlertCircle' && <AlertCircle className="w-5 h-5 text-blue-600" />}
                        {insight.icon === 'MessageSquare' && <MessageSquare className="w-5 h-5 text-blue-600" />}
                        {insight.icon === 'Activity' && <Activity className="w-5 h-5 text-blue-600" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                        <p className="text-2xl font-bold text-blue-600 my-1">{insight.value}</p>
                        <p className="text-sm text-gray-600">{insight.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Recent Activity
              </h2>
              {recentQueries.length > 0 && (
                <button
                  onClick={() => navigate('/history')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {recentQueries.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No inquiries yet</p>
                <button
                  onClick={() => navigate('/chat')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Start Your First Inquiry
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentQueries.map((query) => (
                  <div
                    key={query.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition cursor-pointer"
                    onClick={() => setExpandedQuery(expandedQuery === query.id ? null : query.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {query.medication && (
                            <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                              <Pill className="w-4 h-4" />
                              {query.medication}
                            </div>
                          )}
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded border ${getUrgencyColor(
                              query.response_data?.urgency_level || 'moderate'
                            )}`}
                          >
                            {query.response_data?.urgency_level || 'Moderate'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {query.question || 'No question provided'}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatRelativeTime(query.created_at)}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>

                    {expandedQuery === query.id && query.symptoms && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Symptoms:</span> {query.symptoms}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Personalized Recommendations
            </h2>
            {recommendations.length > 0 && (
              <button
                onClick={handleDownloadRecommendations}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            )}
          </div>

          {recommendations.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No recommendations yet</p>
              <p className="text-sm text-gray-400">
                Make more inquiries to receive personalized recommendations
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 relative"
                >
                  <button
                    onClick={() => handleDismissRecommendation(rec.id)}
                    className="absolute top-2 right-2 p-1 hover:bg-white rounded-full transition"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>

                  <div className="mb-3">
                    <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
                      {rec.recommendation_type.charAt(0).toUpperCase() + rec.recommendation_type.slice(1)}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2">{rec.title}</h3>
                  <p className="text-sm text-gray-700 mb-3">{rec.description}</p>

                  {(rec.related_medication || rec.related_gene) && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {rec.related_medication && (
                        <span className="px-2 py-1 bg-white text-gray-700 text-xs rounded border border-gray-300">
                          <Pill className="w-3 h-3 inline mr-1" />
                          {rec.related_medication}
                        </span>
                      )}
                      {rec.related_gene && (
                        <span className="px-2 py-1 bg-white text-gray-700 text-xs rounded border border-gray-300">
                          {rec.related_gene}
                        </span>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => navigate('/evidence')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-md p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/chat')}
              className="p-4 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition text-left"
            >
              <MessageSquare className="w-8 h-8 mb-2" />
              <h3 className="font-semibold mb-1">Start New Inquiry</h3>
              <p className="text-sm text-blue-100">Ask about medications and genetics</p>
            </button>

            <button
              onClick={() => navigate('/evidence')}
              className="p-4 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition text-left"
            >
              <BookOpen className="w-8 h-8 mb-2" />
              <h3 className="font-semibold mb-1">Browse Evidence</h3>
              <p className="text-sm text-blue-100">Explore clinical guidelines</p>
            </button>

            <button
              onClick={() => navigate('/ask-pharmacist')}
              className="p-4 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition text-left"
            >
              <User className="w-8 h-8 mb-2" />
              <h3 className="font-semibold mb-1">Ask a Pharmacist</h3>
              <p className="text-sm text-blue-100">Get expert guidance</p>
            </button>

            <button
              onClick={() => navigate('/history')}
              className="p-4 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition text-left"
            >
              <FileText className="w-8 h-8 mb-2" />
              <h3 className="font-semibold mb-1">View Full History</h3>
              <p className="text-sm text-blue-100">Review past inquiries</p>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
