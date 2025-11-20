import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import {
  AlertTriangle,
  Pill,
  Shield,
  Phone,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Download,
  Mail,
  Activity,
  CheckCircle2,
  Clock,
  Info
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface PgxResults {
  drug_labels: string[];
  genes: string[];
  variants: string[];
  phenotypes: string[];
}

interface ResponseData {
  response_type: string;
  emergency_detected: boolean;
  urgency_level: string;
  rag_results: string;
  pgx_results: PgxResults;
  final_answer_markdown: string;
}

export default function Results() {
  const location = useLocation();
  const [data, setData] = useState<ResponseData | null>(null);
  const [showPgx, setShowPgx] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('My MedExplain Educational Summary');
  const [emailBody, setEmailBody] = useState('');

  useEffect(() => {
    const responseData = location.state?.responseData;
    if (responseData) {
      setData(responseData);
      setEmailBody(responseData.final_answer_markdown || '');
    }
  }, [location]);

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleSendEmail = () => {
    const mailtoLink = `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;
    setShowEmailModal(false);
  };

  const extractSection = (markdown: string, title: string): string => {
    const regex = new RegExp(`###\\s*${title}([\\s\\S]*?)(?=###|$)`, 'i');
    const match = markdown.match(regex);
    return match ? match[1].trim() : '';
  };

  if (!data) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600">Loading your medication insights...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (data.emergency_detected) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-red-50 border-4 border-red-600 rounded-2xl p-8 shadow-2xl">
            <div className="text-center">
              <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <AlertTriangle className="w-16 h-16 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-red-900 mb-4">EMERGENCY WARNING</h1>
              <p className="text-xl text-red-800 mb-6 leading-relaxed">
                Your symptoms may represent a serious medical issue.
              </p>
              <p className="text-2xl font-bold text-red-900 mb-6">
                Please call 911 or go to the nearest emergency room immediately.
              </p>
              <p className="text-sm text-red-700 italic">
                This information is for educational purposes only.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const markdown = data.final_answer_markdown;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Your Medication Insight Summary</h1>
                <p className="text-blue-100 text-lg">Educational information to support your understanding</p>
              </div>
              <Activity className="w-20 h-20 text-white opacity-80 hidden md:block" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-green-900 mb-4">Understanding Your Concern</h2>
                  <div className="prose prose-green max-w-none text-gray-700">
                    <ReactMarkdown>{extractSection(markdown, 'Understanding Your Concern')}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Pill className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-yellow-900 mb-4">About This Medication</h2>
                  <div className="prose prose-yellow max-w-none text-gray-700">
                    <ReactMarkdown>{extractSection(markdown, 'About This Medication')}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-purple-900 mb-4">Why These Symptoms May Happen</h2>
                  <div className="prose prose-purple max-w-none text-gray-700">
                    <ReactMarkdown>{extractSection(markdown, 'Why These Symptoms May Happen')}</ReactMarkdown>
                  </div>
                  <div className="mt-6">
                    <h3 className="text-xl font-bold text-purple-900 mb-3">How Common Is This?</h3>
                    <div className="prose prose-purple max-w-none text-gray-700">
                      <ReactMarkdown>{extractSection(markdown, 'How Common Is This')}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl shadow-lg p-6 border-l-4 border-green-600">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-green-900 mb-4">What You Can Do Now</h2>
                  <div className="prose prose-green max-w-none text-gray-700">
                    <ReactMarkdown
                      components={{
                        li: ({ children }) => (
                          <li className="flex items-start space-x-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{children}</span>
                          </li>
                        ),
                      }}
                    >
                      {extractSection(markdown, 'What You Can Do Now')}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-blue-900 mb-4">When to Contact Your Doctor</h2>
                  <div className="prose prose-blue max-w-none text-gray-700">
                    <ReactMarkdown>{extractSection(markdown, 'When to Contact Your Doctor')}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl shadow-lg p-6 border-l-4 border-red-600">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-red-900 mb-4">When to Seek Emergency Care</h2>
                  <div className="prose prose-red max-w-none text-gray-700">
                    <ReactMarkdown>{extractSection(markdown, 'When to Seek Emergency Care')}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl shadow-lg p-6 border-l-4 border-gray-500">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Important Safety Reminders</h2>
                  <div className="prose prose-gray max-w-none text-gray-700">
                    <ReactMarkdown>{extractSection(markdown, 'Important Safety Reminders')}</ReactMarkdown>
                  </div>
                  <div className="mt-4 p-4 bg-yellow-100 border-l-4 border-yellow-600 rounded">
                    <p className="font-bold text-gray-900">
                      Do not stop taking your medication without medical guidance.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-lg p-6 border-l-4 border-amber-500">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-amber-900 mb-4">What to Expect Moving Forward</h2>
                  <div className="prose prose-amber max-w-none text-gray-700">
                    <ReactMarkdown>{extractSection(markdown, 'What to Expect Going Forward')}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 border-l-4 border-blue-400">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-blue-900 mb-4">Educational Purpose Only</h2>
                  <div className="prose prose-blue max-w-none text-gray-700 italic">
                    <ReactMarkdown>{extractSection(markdown, 'Educational Purpose Only')}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>

            {data.pgx_results && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <button
                  onClick={() => setShowPgx(!showPgx)}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center">
                      <Info className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Additional Educational Insights (Genes, Drug Labels & Phenotypes)
                    </h2>
                  </div>
                  {showPgx ? (
                    <ChevronUp className="w-6 h-6 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-600" />
                  )}
                </button>

                {showPgx && (
                  <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-6">
                    {data.pgx_results.drug_labels.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3">Drug Label Notes</h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                          {data.pgx_results.drug_labels.map((label, idx) => (
                            <li key={idx}>{label}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {data.pgx_results.genes.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3">Genes Associated With This Medication</h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                          {data.pgx_results.genes.map((gene, idx) => (
                            <li key={idx}>{gene}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {data.pgx_results.variants.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3">Relevant Variants (General Education Only)</h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                          {data.pgx_results.variants.map((variant, idx) => (
                            <li key={idx}>{variant}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {data.pgx_results.phenotypes.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3">Phenotype Categories (General Info Only)</h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                          {data.pgx_results.phenotypes.map((phenotype, idx) => (
                            <li key={idx}>{phenotype}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-600 rounded">
                      <p className="text-sm text-gray-700 italic">
                        <strong>Note:</strong> These genetic insights are general education only — they are NOT your genetic results.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <Download className="w-5 h-5" />
              <span>Download Summary as PDF</span>
            </button>

            <button
              onClick={() => setShowEmailModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <Mail className="w-5 h-5" />
              <span>Email This Summary</span>
            </button>
          </div>
        </div>
      </div>

      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Summary</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">To:</label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Subject:</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Message:</label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:shadow-lg transition"
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
