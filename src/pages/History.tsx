import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import ResultsDisplay from '../components/ResultsDisplay';
import ClinicalResultsDisplay from '../components/ClinicalResultsDisplay';
import { Clock, Pill, MessageSquare, ChevronRight, Trash2, Loader2, AlertCircle, Calendar, Eye, X } from 'lucide-react';

interface QueryHistory {
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
  const [queries, setQueries] = useState<QueryHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingQuery, setViewingQuery] = useState<QueryHistory | null>(null);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  async function fetchHistory() {
    try {
      setLoading(true);
      setError('');

      const { data, error: fetchError } = await supabase
        .from('query_history')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setQueries(data || []);
    } catch (err: any) {
      console.error('Error fetching history:', err);
      setError('Failed to load your history. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function deleteQuery(id: string) {
    if (!confirm('Are you sure you want to delete this query from your history?')) {
      return;
    }

    try {
      setDeletingId(id);
      setError('');

      const { error: deleteError } = await supabase
        .from('query_history')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setQueries(queries.filter(q => q.id !== id));
    } catch (err: any) {
      console.error('Error deleting query:', err);
      setError('Failed to delete query. Please try again.');
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full mb-4 shadow-sm">
              <Clock className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">
                Your Query History
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Your History
            </h1>
            <p className="text-base text-gray-600">
              View and manage all your previous inquiries
            </p>
          </div>

          {error && (
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 rounded-lg p-4 mb-6 shadow-sm">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-red-900 text-base">Error</h3>
                  <p className="text-red-700 mt-0.5 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
              <p className="text-gray-600 text-lg">Loading your history...</p>
            </div>
          ) : queries.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">No History Yet</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                You haven't submitted any queries yet. Start by asking a question about your medications.
              </p>
              <button
                onClick={() => navigate('/chat')}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Ask Your First Question</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {queries.map((query) => (
                <div
                  key={query.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border-2 border-transparent hover:border-purple-200"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <MessageSquare className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <p className="text-sm font-semibold text-gray-900">
                              {formatDate(query.created_at)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <p className="text-xs text-gray-500">
                              {formatTime(query.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setViewingQuery(query)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="View results"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteQuery(query.id)}
                          disabled={deletingId === query.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                          title="Delete query"
                        >
                          {deletingId === query.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <span className="text-xs font-bold text-gray-500 uppercase min-w-[80px]">Question:</span>
                        <p className="text-sm text-gray-900 font-medium flex-1">
                          {query.question || 'No question provided'}
                        </p>
                      </div>

                      {query.medication && (
                        <div className="flex items-start space-x-2">
                          <Pill className="w-4 h-4 text-purple-600 mt-0.5" />
                          <span className="text-xs font-bold text-gray-500 uppercase min-w-[80px]">Medication:</span>
                          <p className="text-sm text-gray-700 flex-1">{query.medication}</p>
                        </div>
                      )}

                      {query.symptoms && (
                        <div className="flex items-start space-x-2">
                          <span className="text-xs font-bold text-gray-500 uppercase min-w-[80px]">Symptoms:</span>
                          <p className="text-sm text-gray-700 flex-1">{query.symptoms}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Age</p>
                          <p className="text-sm font-semibold text-gray-900">{query.age || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Gender</p>
                          <p className="text-sm font-semibold text-gray-900">{query.gender || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Role</p>
                          <p className="text-sm font-semibold text-gray-900">{query.role || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Duration</p>
                          <p className="text-sm font-semibold text-gray-900">{query.duration || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {viewingQuery && viewingQuery.response_data && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto relative">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-2xl font-bold text-gray-900">Query Results</h2>
              <button
                onClick={() => setViewingQuery(null)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {viewingQuery.role === 'Doctor' || viewingQuery.role === 'Clinician' ? (
                <ClinicalResultsDisplay
                  data={viewingQuery.response_data}
                  role={viewingQuery.role}
                  patientData={{
                    age: viewingQuery.age?.toString(),
                    gender: viewingQuery.gender,
                    role: viewingQuery.role,
                    medication: viewingQuery.medication,
                    question: viewingQuery.question,
                    symptoms: viewingQuery.symptoms,
                    duration: viewingQuery.duration,
                    otherMeds: viewingQuery.other_meds,
                    medicalHistory: viewingQuery.medical_history
                  }}
                />
              ) : (
                <ResultsDisplay
                  data={viewingQuery.response_data}
                  patientData={{
                    age: viewingQuery.age?.toString(),
                    gender: viewingQuery.gender,
                    role: viewingQuery.role,
                    medication: viewingQuery.medication,
                    question: viewingQuery.question,
                    symptoms: viewingQuery.symptoms,
                    duration: viewingQuery.duration,
                    otherMeds: viewingQuery.other_meds,
                    medicalHistory: viewingQuery.medical_history
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
