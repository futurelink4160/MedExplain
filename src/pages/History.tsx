import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import ResultsDisplay from '../components/ResultsDisplay';
import ClinicalResultsDisplay from '../components/ClinicalResultsDisplay';
import { Clock, Trash2, ChevronDown, ChevronUp, AlertCircle, FileText, Calendar, Pill, Activity, Search, Loader2, Archive } from 'lucide-react';

interface QueryHistoryItem {
  id: string;
  age: number;
  gender: string;
  role: string;
  medication: string;
  question: string;
  symptoms: string;
  duration: string;
  other_meds: string;
  medical_history: string;
  response_data: any;
  created_at: string;
}

export default function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [user]);

  async function fetchHistory() {
    if (!user) return;

    try {
      setLoading(true);
      setError('');

      const { data, error: fetchError } = await supabase
        .from('query_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setHistory(data || []);
    } catch (err: any) {
      console.error('Error fetching history:', err);
      setError(err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this inquiry from your history?')) {
      return;
    }

    try {
      setDeleteLoading(id);
      const { error: deleteError } = await supabase
        .from('query_history')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setHistory(prev => prev.filter(item => item.id !== id));
      if (expandedId === id) {
        setExpandedId(null);
      }
    } catch (err: any) {
      console.error('Error deleting history item:', err);
      alert('Failed to delete item: ' + err.message);
    } finally {
      setDeleteLoading(null);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today at ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday at ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays < 7) {
      return diffDays + ' days ago';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  }

  function getUrgencyColor(urgencyLevel?: string) {
    switch (urgencyLevel?.toLowerCase()) {
      case 'high':
      case 'emergency':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
      case 'routine':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }

  const filteredHistory = history.filter(item => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.medication?.toLowerCase().includes(term) ||
      item.question?.toLowerCase().includes(term) ||
      item.symptoms?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background-main py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background-main py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-text-primary">Inquiry History</h1>
            </div>
            <p className="text-text-secondary">
              View and manage your past medical inquiries and responses.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {history.length > 0 && (
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by medication, question, or symptoms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition"
                />
              </div>
            </div>
          )}

          {filteredHistory.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <Archive className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                {searchTerm ? 'No matching inquiries found' : 'No inquiry history yet'}
              </h3>
              <p className="text-text-secondary mb-6">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Your past inquiries will appear here after you submit questions in the Chat page.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => navigate('/chat')}
                  className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-light transition-all transform hover:scale-105"
                >
                  Start Your First Inquiry
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((item) => {
                const isExpanded = expandedId === item.id;
                const urgencyLevel = item.response_data?.urgency_level;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all hover:shadow-lg"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Pill className="w-5 h-5 text-primary flex-shrink-0" />
                            <h3 className="text-lg font-semibold text-text-primary">
                              {item.medication || 'No medication specified'}
                            </h3>
                            {urgencyLevel && (
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${getUrgencyColor(
                                  urgencyLevel
                                )}`}
                              >
                                {urgencyLevel}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-text-secondary mb-3">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(item.created_at)}</span>
                          </div>
                          {item.question && (
                            <p className="text-text-secondary line-clamp-2">{item.question}</p>
                          )}
                        </div>
                        <div className="flex items-start space-x-2 ml-4">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : item.id)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition"
                            title={isExpanded ? 'Collapse' : 'Expand'}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deleteLoading === item.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                            title="Delete"
                          >
                            {deleteLoading === item.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-4">
                              <h4 className="font-semibold text-text-primary flex items-center space-x-2">
                                <FileText className="w-4 h-4" />
                                <span>Patient Information</span>
                              </h4>
                              {item.age && (
                                <div>
                                  <span className="text-sm font-medium text-text-secondary">Age:</span>
                                  <span className="ml-2 text-text-primary">{item.age}</span>
                                </div>
                              )}
                              {item.gender && (
                                <div>
                                  <span className="text-sm font-medium text-text-secondary">Gender:</span>
                                  <span className="ml-2 text-text-primary">{item.gender}</span>
                                </div>
                              )}
                              {item.role && (
                                <div>
                                  <span className="text-sm font-medium text-text-secondary">Role:</span>
                                  <span className="ml-2 text-text-primary">{item.role}</span>
                                </div>
                              )}
                            </div>

                            <div className="space-y-4">
                              <h4 className="font-semibold text-text-primary flex items-center space-x-2">
                                <Activity className="w-4 h-4" />
                                <span>Clinical Details</span>
                              </h4>
                              {item.symptoms && (
                                <div>
                                  <span className="text-sm font-medium text-text-secondary">Symptoms:</span>
                                  <p className="text-text-primary mt-1">{item.symptoms}</p>
                                </div>
                              )}
                              {item.duration && (
                                <div>
                                  <span className="text-sm font-medium text-text-secondary">Duration:</span>
                                  <span className="ml-2 text-text-primary">{item.duration}</span>
                                </div>
                              )}
                              {item.other_meds && (
                                <div>
                                  <span className="text-sm font-medium text-text-secondary">
                                    Other Medications:
                                  </span>
                                  <p className="text-text-primary mt-1">{item.other_meds}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {item.response_data && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                              <h4 className="font-semibold text-text-primary mb-4">Response</h4>
                              {item.role === 'Clinical' || item.role === 'Clinician' ? (
                                <ClinicalResultsDisplay data={item.response_data} />
                              ) : (
                                <ResultsDisplay data={item.response_data} />
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
