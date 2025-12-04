import { useState } from 'react';
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
  Info,
  RefreshCw,
  User
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface DrugLabel {
  drug_id?: string;
  known_side_effects?: string[];
  box_warnings?: string[];
  pharmacogenomic_considerations?: string[];
  safety_notes?: string[];
  when_to_call_doctor?: string[];
}

interface PgxResults {
  drug_labels: (string | DrugLabel)[];
  genes: string[];
  variants: string[];
  phenotypes: string[];
}

interface ResponseData {
  response_type: string;
  emergency_detected: boolean;
  urgency_level: string;
  rag_results?: string;
  pgx_results: PgxResults;
  final_answer_markdown: string;
  clinical_summary?: string;
  pgx_interpretation?: string;
  clinical_recommendations?: string[];
  disclaimer?: string;
}

interface PatientQueryData {
  age?: string;
  gender?: string;
  role?: string;
  medication?: string;
  question?: string;
  symptoms?: string;
  duration?: string;
  otherMeds?: string;
  medicalHistory?: string;
  hasStructuredOverview?: boolean;
  overview?: string;
}

interface ResultsDisplayProps {
  data: ResponseData;
  onNewQuery?: () => void;
  patientData?: PatientQueryData;
}

export default function ResultsDisplay({ data, onNewQuery, patientData }: ResultsDisplayProps) {
  console.log('ResultsDisplay received data:', data);
  console.log('ResultsDisplay data.final_answer_markdown:', data?.final_answer_markdown?.substring(0, 200));
  console.log('ResultsDisplay data.pgx_results:', data?.pgx_results);
  console.log('ResultsDisplay pgx_results.genes:', data?.pgx_results?.genes);
  console.log('ResultsDisplay pgx_results.variants:', data?.pgx_results?.variants);
  console.log('ResultsDisplay pgx_results.phenotypes:', data?.pgx_results?.phenotypes);
  console.log('ResultsDisplay pgx_results.drug_labels:', data?.pgx_results?.drug_labels);

  const [showPgx, setShowPgx] = useState(true); // Changed to true to show by default
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('My MedExplain Educational Summary');
  const [emailBody, setEmailBody] = useState(data.final_answer_markdown || '');

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleSendEmail = () => {
    const mailtoLink = `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;
    setShowEmailModal(false);
  };

  if (!data || !data.final_answer_markdown) {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 p-8">
        <div className="text-center">
          <p className="text-gray-600">No results data available.</p>
          <p className="text-sm text-gray-500 mt-2">Debug: {JSON.stringify(data)}</p>
        </div>
      </div>
    );
  }

  const markdown = data.final_answer_markdown;

  const extractSection = (markdown: string | undefined, title: string): string => {
    if (!markdown) return '';

    const cleanedMarkdown = markdown.replace(/\\n/g, '\n');
    const regex = new RegExp(`###\\s*${title}([\\s\\S]*?)(?=###|$)`, 'i');
    const match = cleanedMarkdown.match(regex);
    const extracted = match ? match[1].trim() : '';

    if (extracted) {
      console.log(`Extracted section "${title}":`, extracted.substring(0, 100) + '...');
    } else {
      console.log(`Section "${title}" not found in markdown`);
    }

    return extracted;
  };

  const parseAllSections = (markdown: string | undefined): Array<{ title: string; content: string }> => {
    if (!markdown) return [];

    const cleanedMarkdown = markdown.replace(/\\n/g, '\n');
    const sections: Array<{ title: string; content: string }> = [];

    const regex = /###\s*([^\n]+)\n([\s\S]*?)(?=###|$)/g;
    let match;

    while ((match = regex.exec(cleanedMarkdown)) !== null) {
      const title = match[1].trim();
      const content = match[2].trim();
      if (content) {
        sections.push({ title, content });
      }
    }

    console.log('Parsed sections:', sections.map(s => s.title));
    return sections;
  };

  const allSections = parseAllSections(markdown);
  const hasSections = allSections.length > 0;

  const hasPatientSections = extractSection(markdown, 'Understanding Your Concern') ||
    extractSection(markdown, 'About This Medication') ||
    extractSection(markdown, 'Why These Symptoms May Happen');

  // Check if this is clinical format response
  const isClinicalFormat = data.clinical_summary || data.pgx_interpretation || data.clinical_recommendations;

  if (isClinicalFormat) {
    return (
      <div className="space-y-6 mb-8">
        <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Clinical Pharmacogenomics Summary</h1>
              <p className="text-blue-100 text-lg">Professional clinical insight for healthcare providers</p>
            </div>
            <Activity className="w-20 h-20 text-white opacity-80 hidden md:block" />
          </div>
        </div>

        {data.clinical_summary && (
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-blue-900 mb-4">Clinical Summary</h2>
                <div className="prose prose-blue max-w-none text-gray-700">
                  <p>{data.clinical_summary}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {data.pgx_interpretation && (
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-purple-900 mb-4">Pharmacogenomic Interpretation</h2>
                <div className="prose prose-purple max-w-none text-gray-700">
                  <p>{data.pgx_interpretation}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {data.clinical_recommendations && data.clinical_recommendations.length > 0 && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border-l-4 border-green-600">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-green-900 mb-4">Clinical Recommendations</h2>
                <ol className="space-y-3">
                  {data.clinical_recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-gray-700 pt-1">{rec}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}

        {data.disclaimer && (
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl shadow-lg p-6 border-l-4 border-gray-500">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Info className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Disclaimer</h2>
                <div className="prose prose-gray max-w-none text-gray-700 italic">
                  <p>{data.disclaimer}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
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

          {onNewQuery && (
            <button
              onClick={onNewQuery}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Start New Query</span>
            </button>
          )}
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
      </div>
    );
  }

  if (data.emergency_detected) {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
        <div className="bg-red-50 border-4 border-red-600 rounded-2xl p-8">
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
            {onNewQuery && (
              <button
                onClick={onNewQuery}
                className="mt-6 flex items-center space-x-2 px-6 py-3 bg-white text-red-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all mx-auto"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Start New Query</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Extract patient data from markdown
  // Extract patient overview from the beginning
  const patientOverviewMatch = markdown.match(/\*\*Patient (?:Overview|Profile|Details|Information):\*\*([\s\S]*?)(?=---|###)/i);
  const patientOverview = patientOverviewMatch ? patientOverviewMatch[1].trim() : '';

  const extractPatientData = () => {
    // If there's a structured patient overview section, use ReactMarkdown to display it
    if (patientOverview) {
      return { hasStructuredOverview: true, overview: patientOverview };
    }

    // Otherwise, try to extract individual fields
    // Try structured format first
    let ageMatch = markdown.match(/\*\*Age:\*\*\s*(\d+)[- ]?year[- ]?old\s+(\w+)/i) ||
                   markdown.match(/\*\*Patient:\*\*\s*(\d+)[- ]?year[- ]?old\s+(\w+)/i);

    // Try natural language format from Understanding Your Concern section
    if (!ageMatch) {
      ageMatch = markdown.match(/(\d+)[- ]?year[- ]?old\s+(\w+)/i);
    }

    // Try structured format for medication
    let medicationMatch = markdown.match(/\*\*(?:Current )?Medication(?:s)?:\*\*\s*([^\n*]+)/i) ||
                          markdown.match(/\*\*Drug:\*\*\s*([^\n*]+)/i);

    // Try natural language format: "taking [Medication]" or "while taking [Medication]"
    if (!medicationMatch) {
      medicationMatch = markdown.match(/(?:taking|started|prescribed)\s+([A-Z][a-z]+(?:\s*\([A-Z][a-z]+\))?)/i) ||
                       markdown.match(/while taking\s+([^\n,.]+?)(?:\s*\(|,|\.|for)/i);
    }

    // Try structured format for symptoms
    let symptomsMatch = markdown.match(/\*\*(?:Chief Complaint|Symptoms?|Presenting Symptoms?):\*\*\s*([^\n*]+)/i);

    // Try natural language format: "experiencing [symptoms]"
    if (!symptomsMatch) {
      symptomsMatch = markdown.match(/experiencing\s+([^.]+?)(?:\s+while taking|\s+with|\.)/i);
    }

    // Try structured format for duration
    let durationMatch = markdown.match(/\*\*Duration:\*\*\s*([^\n*]+)/i);

    // Try natural language format
    if (!durationMatch) {
      durationMatch = markdown.match(/for\s+(\d+\s+(?:days?|weeks?|months?))/i) ||
                     markdown.match(/(\d+\s+(?:days?|weeks?|months?))\s+(?:ago|of)/i);
    }

    // Try structured format for other medications
    let otherMedsMatch = markdown.match(/\*\*(?:Other|Concomitant) Medications?:\*\*\s*([^\n*]+)/i);

    return {
      hasStructuredOverview: false,
      age: ageMatch ? `${ageMatch[1]}-year-old ${ageMatch[2]}` : null,
      medication: medicationMatch ? medicationMatch[1].trim().replace(/\s*\(.*?\)\s*$/, '') : null,
      symptoms: symptomsMatch ? symptomsMatch[1].trim() : null,
      duration: durationMatch ? durationMatch[1].trim() : null,
      otherMeds: otherMedsMatch ? otherMedsMatch[1].trim() : 'None reported'
    };
  };

  const extractedPatientData = extractPatientData();

  // Get color scheme based on section title
  const getSectionStyle = (title: string) => {
    const lowerTitle = title.toLowerCase();

    if (lowerTitle.includes('gene') || lowerTitle.includes('genetic') || lowerTitle.includes('pharmacogenomic') || lowerTitle.includes('pgx')) {
      return { bg: 'from-teal-50 to-cyan-50', border: 'border-teal-500', iconBg: 'bg-teal-500', icon: Activity };
    }
    if (lowerTitle.includes('summary') || lowerTitle.includes('overview')) {
      return { bg: 'from-blue-50 to-slate-50', border: 'border-blue-500', iconBg: 'bg-blue-500', icon: BookOpen };
    }
    if (lowerTitle.includes('interpretation') || lowerTitle.includes('analysis')) {
      return { bg: 'from-cyan-50 to-sky-50', border: 'border-cyan-500', iconBg: 'bg-cyan-500', icon: Activity };
    }
    if (lowerTitle.includes('recommendation') || lowerTitle.includes('action')) {
      return { bg: 'from-green-50 to-emerald-50', border: 'border-green-600', iconBg: 'bg-green-600', icon: CheckCircle2 };
    }
    if (lowerTitle.includes('warning') || lowerTitle.includes('alert') || lowerTitle.includes('emergency')) {
      return { bg: 'from-red-50 to-rose-50', border: 'border-red-600', iconBg: 'bg-red-600', icon: AlertTriangle };
    }
    if (lowerTitle.includes('medication') || lowerTitle.includes('drug')) {
      return { bg: 'from-yellow-50 to-amber-50', border: 'border-yellow-500', iconBg: 'bg-yellow-500', icon: Pill };
    }
    if (lowerTitle.includes('safety') || lowerTitle.includes('precaution')) {
      return { bg: 'from-orange-50 to-red-50', border: 'border-orange-500', iconBg: 'bg-orange-500', icon: Shield };
    }
    if (lowerTitle.includes('disclaimer') || lowerTitle.includes('note')) {
      return { bg: 'from-gray-50 to-slate-50', border: 'border-gray-500', iconBg: 'bg-gray-600', icon: Info };
    }
    if (lowerTitle.includes('contact') || lowerTitle.includes('doctor') || lowerTitle.includes('call')) {
      return { bg: 'from-blue-50 to-cyan-50', border: 'border-blue-600', iconBg: 'bg-blue-600', icon: Phone };
    }

    // Default style
    return { bg: 'from-slate-50 to-gray-50', border: 'border-slate-500', iconBg: 'bg-slate-500', icon: BookOpen };
  };

  // If sections found, show them beautifully
  if (hasSections && !hasPatientSections) {
    return (
      <div className="space-y-6 mb-8">
        <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Your Pharmacogenomic Report</h1>
              <p className="text-blue-100 text-lg">Personalized medication and genetic information</p>
            </div>
            <Activity className="w-20 h-20 text-white opacity-80 hidden md:block" />
          </div>
        </div>

        {allSections.map((section, idx) => {
          const style = getSectionStyle(section.title);
          const IconComponent = style.icon;

          return (
            <div key={idx} className={`bg-gradient-to-br ${style.bg} rounded-xl shadow-lg p-6 border-l-4 ${style.border}`}>
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 ${style.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
                  <div className="prose prose-blue max-w-none text-gray-700">
                    <ReactMarkdown>{section.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {data.pgx_results && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <button
              onClick={() => setShowPgx(!showPgx)}
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Additional Genomic Details (Genes, Variants & Drug Labels)
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
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Drug Label Information</h3>
                    <div className="space-y-4">
                      {data.pgx_results.drug_labels.map((label, idx) => {
                        if (typeof label === 'string') {
                          return (
                            <div key={idx} className="text-gray-700">
                              <p>{label}</p>
                            </div>
                          );
                        }

                        return (
                          <div key={idx} className="space-y-3">
                            {label.known_side_effects && label.known_side_effects.length > 0 && (
                              <div>
                                <h4 className="font-bold text-gray-800 mb-2">Known Side Effects:</h4>
                                <ul className="list-disc list-inside space-y-1 text-gray-700">
                                  {label.known_side_effects.map((effect, i) => (
                                    <li key={i}>{effect}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {label.box_warnings && label.box_warnings.length > 0 && (
                              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                                <h4 className="font-bold text-red-900 mb-2">Important Warnings:</h4>
                                <ul className="list-disc list-inside space-y-1 text-red-800">
                                  {label.box_warnings.map((warning, i) => (
                                    <li key={i}>{warning}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {label.pharmacogenomic_considerations && label.pharmacogenomic_considerations.length > 0 && (
                              <div>
                                <h4 className="font-bold text-gray-800 mb-2">Genetic Considerations:</h4>
                                <ul className="list-disc list-inside space-y-1 text-gray-700">
                                  {label.pharmacogenomic_considerations.map((consideration, i) => (
                                    <li key={i}>{consideration}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {label.safety_notes && label.safety_notes.length > 0 && (
                              <div>
                                <h4 className="font-bold text-gray-800 mb-2">Safety Notes:</h4>
                                <ul className="list-disc list-inside space-y-1 text-gray-700">
                                  {label.safety_notes.map((note, i) => (
                                    <li key={i}>{note}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {label.when_to_call_doctor && label.when_to_call_doctor.length > 0 && (
                              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
                                <h4 className="font-bold text-yellow-900 mb-2">When to Call Your Doctor:</h4>
                                <ul className="list-disc list-inside space-y-1 text-yellow-800">
                                  {label.when_to_call_doctor.map((when, i) => (
                                    <li key={i}>{when}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
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
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Relevant Variants</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      {data.pgx_results.variants.map((variant, idx) => (
                        <li key={idx}>{variant}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {data.pgx_results.phenotypes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Phenotype Information</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      {data.pgx_results.phenotypes.map((phenotype, idx) => (
                        <li key={idx}>{phenotype}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <Download className="w-5 h-5" />
            <span>Download Report as PDF</span>
          </button>

          <button
            onClick={() => setShowEmailModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-green-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <Mail className="w-5 h-5" />
            <span>Email This Report</span>
          </button>

          {onNewQuery && (
            <button
              onClick={onNewQuery}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Start New Query</span>
            </button>
          )}
        </div>

        {showEmailModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Report</h2>

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
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg font-bold hover:shadow-lg transition"
                >
                  Send Email
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      <div className="bg-gradient-to-r from-blue-600 via-teal-600 to-green-600 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
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

      {/* Patient Information */}
      {patientData && (patientData.hasStructuredOverview || patientData.age || patientData.medication || patientData.question || patientData.symptoms || patientData.duration) && (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">Your Information</h2>
              <div className="prose prose-blue max-w-none text-gray-700">
                {patientData.hasStructuredOverview ? (
                  <ReactMarkdown>{patientData.overview}</ReactMarkdown>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {patientData.age && (
                      <div className="bg-white p-3 rounded-lg">
                        <strong className="text-blue-800">Age:</strong> <span className="text-gray-700">{patientData.age}</span>
                      </div>
                    )}
                    {patientData.gender && (
                      <div className="bg-white p-3 rounded-lg">
                        <strong className="text-blue-800">Gender:</strong> <span className="text-gray-700">{patientData.gender}</span>
                      </div>
                    )}
                    {patientData.role && (
                      <div className="bg-white p-3 rounded-lg">
                        <strong className="text-blue-800">Role:</strong> <span className="text-gray-700">{patientData.role}</span>
                      </div>
                    )}
                    {patientData.medication && (
                      <div className="bg-white p-3 rounded-lg">
                        <strong className="text-blue-800">Medication:</strong> <span className="text-gray-700">{patientData.medication}</span>
                      </div>
                    )}
                    {patientData.question && (
                      <div className="bg-white p-3 rounded-lg md:col-span-2">
                        <strong className="text-blue-800">Question/Concern:</strong> <span className="text-gray-700">{patientData.question}</span>
                      </div>
                    )}
                    {patientData.symptoms && (
                      <div className="bg-white p-3 rounded-lg md:col-span-2">
                        <strong className="text-blue-800">Current Symptoms:</strong> <span className="text-gray-700">{patientData.symptoms}</span>
                      </div>
                    )}
                    {patientData.duration && (
                      <div className="bg-white p-3 rounded-lg">
                        <strong className="text-blue-800">Duration:</strong> <span className="text-gray-700">{patientData.duration}</span>
                      </div>
                    )}
                    {patientData.otherMeds && patientData.otherMeds !== 'None mentioned' && patientData.otherMeds !== 'None reported' && (
                      <div className="bg-white p-3 rounded-lg md:col-span-2">
                        <strong className="text-blue-800">Other Medications:</strong> <span className="text-gray-700">{patientData.otherMeds}</span>
                      </div>
                    )}
                    {patientData.medicalHistory && patientData.medicalHistory !== 'None mentioned' && (
                      <div className="bg-white p-3 rounded-lg md:col-span-2">
                        <strong className="text-blue-800">Medical History:</strong> <span className="text-gray-700">{patientData.medicalHistory}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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

      {extractSection(markdown, 'Relevant Genetic Information') && (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-indigo-900 mb-4">Relevant Genetic Information</h2>
              <div className="prose prose-indigo max-w-none text-gray-700">
                <ReactMarkdown>{extractSection(markdown, 'Relevant Genetic Information')}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Drug Label Information</h3>
                  <div className="space-y-4">
                    {data.pgx_results.drug_labels.map((label, idx) => {
                      if (typeof label === 'string') {
                        return (
                          <div key={idx} className="text-gray-700">
                            <p>{label}</p>
                          </div>
                        );
                      }

                      return (
                        <div key={idx} className="space-y-3">
                          {label.known_side_effects && label.known_side_effects.length > 0 && (
                            <div>
                              <h4 className="font-bold text-gray-800 mb-2">Known Side Effects:</h4>
                              <ul className="list-disc list-inside space-y-1 text-gray-700">
                                {label.known_side_effects.map((effect, i) => (
                                  <li key={i}>{effect}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {label.box_warnings && label.box_warnings.length > 0 && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                              <h4 className="font-bold text-red-900 mb-2">⚠️ Important Warnings:</h4>
                              <ul className="list-disc list-inside space-y-1 text-red-800">
                                {label.box_warnings.map((warning, i) => (
                                  <li key={i}>{warning}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {label.pharmacogenomic_considerations && label.pharmacogenomic_considerations.length > 0 && (
                            <div>
                              <h4 className="font-bold text-gray-800 mb-2">Genetic Considerations:</h4>
                              <ul className="list-disc list-inside space-y-1 text-gray-700">
                                {label.pharmacogenomic_considerations.map((consideration, i) => (
                                  <li key={i}>{consideration}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {label.safety_notes && label.safety_notes.length > 0 && (
                            <div>
                              <h4 className="font-bold text-gray-800 mb-2">Safety Notes:</h4>
                              <ul className="list-disc list-inside space-y-1 text-gray-700">
                                {label.safety_notes.map((note, i) => (
                                  <li key={i}>{note}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {label.when_to_call_doctor && label.when_to_call_doctor.length > 0 && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
                              <h4 className="font-bold text-yellow-900 mb-2">When to Call Your Doctor:</h4>
                              <ul className="list-disc list-inside space-y-1 text-yellow-800">
                                {label.when_to_call_doctor.map((when, i) => (
                                  <li key={i}>{when}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
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

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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

        {onNewQuery && (
          <button
            onClick={onNewQuery}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Start New Query</span>
          </button>
        )}
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
    </div>
  );
}
