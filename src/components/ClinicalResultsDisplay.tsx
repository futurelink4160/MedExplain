import { useState } from 'react';
import {
  Activity,
  BookOpen,
  Shield,
  FileText,
  Download,
  Mail,
  RefreshCw,
  Dna,
  AlertTriangle,
  CheckCircle,
  Printer,
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
  testing_guidelines?: {
    fda_level?: string;
    cpic_dosing_info?: boolean;
    has_dosing_guideline?: boolean;
  };
}

interface ResponseData {
  response_type: string;
  emergency_detected: boolean;
  urgency_level: string;
  rag_results?: string;
  pgx_results: PgxResults;
  final_answer_markdown: string;
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

interface ClinicalResultsDisplayProps {
  data: ResponseData;
  onNewQuery?: () => void;
  role?: string;
  patientData?: PatientQueryData;
}

export default function ClinicalResultsDisplay({ data, onNewQuery, role, patientData }: ClinicalResultsDisplayProps) {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState('');

  const handleDownloadPDF = () => {
    const content = data.final_answer_markdown || '';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Clinical-Summary-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSendEmail = () => {
    const mailtoLink = `mailto:${emailTo}?subject=${encodeURIComponent('Clinical Pharmacogenomics Summary')}&body=${encodeURIComponent(data.final_answer_markdown || '')}`;
    window.location.href = mailtoLink;
    setShowEmailModal(false);
  };

  const extractSection = (markdown: string | undefined, title: string): string => {
    if (!markdown) return '';
    const cleanedMarkdown = markdown.replace(/\\n/g, '\n');
    const regex = new RegExp(`###\\s*${title}([\\s\\S]*?)(?=###|---|$)`, 'i');
    const match = cleanedMarkdown.match(regex);
    return match ? match[1].trim() : '';
  };

  if (!data || !data.final_answer_markdown) {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 p-8">
        <div className="text-center">
          <p className="text-gray-600">No results data available.</p>
        </div>
      </div>
    );
  }

  const markdown = data.final_answer_markdown.replace(/\\n/g, '\n');

  // Check if user is a clinician
  const isClinician = role === 'Doctor' || role === 'Clinician';

  // Extract sections
  const pgxContext = extractSection(markdown, 'Pharmacogenomic Context') ||
                     extractSection(markdown, 'Pharmacogenomic Overview') ||
                     extractSection(markdown, 'Pharmacogenomic Considerations');
  const clinicalInterpretation = extractSection(markdown, 'Clinical Interpretation') ||
                                  extractSection(markdown, 'Clinical Context and Relevance') ||
                                  extractSection(markdown, 'Clinical Considerations');
  const recommendations = extractSection(markdown, 'Recommendations for Clinical Action') ||
                         extractSection(markdown, 'Recommendations for Clinical Management') ||
                         extractSection(markdown, 'Clinical Recommendations') ||
                         extractSection(markdown, 'Recommendations for Provider Consideration');

  // Patient/Caregiver specific sections
  const nextSteps = extractSection(markdown, 'Next Steps') ||
                   extractSection(markdown, 'Follow-up Actions') ||
                   extractSection(markdown, 'Action Steps');
  const warningSignsSection = extractSection(markdown, 'Warning Signs') ||
                              extractSection(markdown, 'Red Flags') ||
                              extractSection(markdown, 'Emergency Signs') ||
                              extractSection(markdown, 'When to Seek Immediate Care');

  // Clinician specific sections
  const dosingConsiderations = extractSection(markdown, 'Dosing Considerations') ||
                              extractSection(markdown, 'Dosing Recommendations') ||
                              extractSection(markdown, 'Dosage Adjustments');
  const riskAssessment = extractSection(markdown, 'Risk Assessment') ||
                        extractSection(markdown, 'Risk Stratification') ||
                        extractSection(markdown, 'Clinical Risk Factors');
  const monitoringRequirements = extractSection(markdown, 'Monitoring Requirements') ||
                                extractSection(markdown, 'Follow-up Monitoring') ||
                                extractSection(markdown, 'Laboratory Monitoring');
  const drugInteractions = extractSection(markdown, 'Drug Interactions') ||
                          extractSection(markdown, 'Potential Interactions') ||
                          extractSection(markdown, 'Interaction Considerations');

  const summary = extractSection(markdown, 'Summary');
  const references = extractSection(markdown, 'References');

  // Extract patient overview from the beginning
  const patientOverviewMatch = markdown.match(/\*\*Patient (?:Overview|Profile|Details):\*\*([\s\S]*?)(?=---|###)/i);
  const patientOverview = patientOverviewMatch ? patientOverviewMatch[1].trim() : '';

  // Extract medication name from patient overview or markdown
  const extractMedicationName = (): string => {
    // Try to extract from "Current Medications:" line in patient overview
    const medMatch = patientOverview.match(/\*\*Current Medications:\*\*\s*([^\n]+)/i);
    if (medMatch) {
      return medMatch[1].trim();
    }

    // Try to extract from markdown title or first heading
    const titleMatch = markdown.match(/^#\s+(.+)/m);
    if (titleMatch) {
      return titleMatch[1].trim();
    }

    // Default fallback
    return 'Medication Analysis';
  };

  const medicationTitle = extractMedicationName();

  return (
    <div className="space-y-6 mb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Clinical Pharmacogenomics Summary</h1>
            <p className="text-slate-200 text-lg">{medicationTitle}</p>
            <div className="mt-3 flex items-center space-x-4 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full text-white">
                {data.response_type || 'CLINICAL_PGX_SUMMARY'}
              </span>
              <span className={`px-3 py-1 rounded-full ${
                data.urgency_level === 'LOW' ? 'bg-green-500/20 text-green-200' :
                data.urgency_level === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-200' :
                'bg-red-500/20 text-red-200'
              }`}>
                Urgency: {data.urgency_level || 'LOW'}
              </span>
            </div>
          </div>
          <Activity className="w-20 h-20 text-white opacity-80 hidden md:block" />
        </div>
      </div>

      {/* Patient Information */}
      {patientData && (patientData.hasStructuredOverview || patientData.age || patientData.medication || patientData.question || patientData.symptoms || patientData.duration) && (
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl shadow-lg p-6 border-l-4 border-cyan-600">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Patient Information</h2>
              <div className="prose prose-slate max-w-none text-gray-700">
                {patientData.hasStructuredOverview ? (
                  <ReactMarkdown>{patientData.overview}</ReactMarkdown>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {patientData.age && (
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <strong className="text-slate-700">Age:</strong> <span className="text-gray-700">{patientData.age}</span>
                      </div>
                    )}
                    {patientData.gender && (
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <strong className="text-slate-700">Gender:</strong> <span className="text-gray-700">{patientData.gender}</span>
                      </div>
                    )}
                    {patientData.role && (
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <strong className="text-slate-700">Role:</strong> <span className="text-gray-700">{patientData.role}</span>
                      </div>
                    )}
                    {patientData.medication && (
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <strong className="text-slate-700">Medication:</strong> <span className="text-gray-700">{patientData.medication}</span>
                      </div>
                    )}
                    {patientData.question && (
                      <div className="bg-white p-3 rounded-lg border border-slate-200 md:col-span-2">
                        <strong className="text-slate-700">Question/Concern:</strong> <span className="text-gray-700">{patientData.question}</span>
                      </div>
                    )}
                    {patientData.symptoms && (
                      <div className="bg-white p-3 rounded-lg border border-slate-200 md:col-span-2">
                        <strong className="text-slate-700">Current Symptoms:</strong> <span className="text-gray-700">{patientData.symptoms}</span>
                      </div>
                    )}
                    {patientData.duration && (
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <strong className="text-slate-700">Duration:</strong> <span className="text-gray-700">{patientData.duration}</span>
                      </div>
                    )}
                    {patientData.otherMeds && patientData.otherMeds !== 'None mentioned' && patientData.otherMeds !== 'None reported' && (
                      <div className="bg-white p-3 rounded-lg border border-slate-200 md:col-span-2">
                        <strong className="text-slate-700">Other Medications:</strong> <span className="text-gray-700">{patientData.otherMeds}</span>
                      </div>
                    )}
                    {patientData.medicalHistory && patientData.medicalHistory !== 'None mentioned' && (
                      <div className="bg-white p-3 rounded-lg border border-slate-200 md:col-span-2">
                        <strong className="text-slate-700">Medical History:</strong> <span className="text-gray-700">{patientData.medicalHistory}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient Overview */}
      {patientOverview && (
        <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Patient Overview</h2>
              <div className="prose prose-slate max-w-none text-gray-700">
                <ReactMarkdown>{patientOverview}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pharmacogenomic Context */}
      {pgxContext && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl shadow-lg p-6 border-l-4 border-emerald-600">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Dna className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-emerald-900 mb-4">Pharmacogenomic Context</h2>
              <div className="prose prose-emerald max-w-none text-gray-700">
                <ReactMarkdown>{pgxContext}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clinical Interpretation */}
      {clinicalInterpretation && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-lg p-6 border-l-4 border-amber-600">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-amber-900 mb-4">Clinical Interpretation</h2>
              <div className="prose prose-amber max-w-none text-gray-700">
                <ReactMarkdown>{clinicalInterpretation}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && (
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl shadow-lg p-6 border-l-4 border-cyan-600">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-cyan-900 mb-4">Clinical Recommendations</h2>
              <div className="prose prose-cyan max-w-none text-gray-700">
                <ReactMarkdown>{recommendations}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clinician-specific sections */}
      {isClinician && dosingConsiderations && (
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl shadow-lg p-6 border-l-4 border-violet-600">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-violet-900 mb-4">Dosing Considerations</h2>
              <div className="prose prose-violet max-w-none text-gray-700">
                <ReactMarkdown>{dosingConsiderations}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}

      {isClinician && riskAssessment && (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl shadow-lg p-6 border-l-4 border-orange-600">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-orange-900 mb-4">Risk Assessment</h2>
              <div className="prose prose-orange max-w-none text-gray-700">
                <ReactMarkdown>{riskAssessment}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}

      {isClinician && drugInteractions && (
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl shadow-lg p-6 border-l-4 border-rose-600">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-rose-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-rose-900 mb-4">Drug Interactions</h2>
              <div className="prose prose-rose max-w-none text-gray-700">
                <ReactMarkdown>{drugInteractions}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}

      {isClinician && monitoringRequirements && (
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl shadow-lg p-6 border-l-4 border-teal-600">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-teal-900 mb-4">Monitoring Requirements</h2>
              <div className="prose prose-teal max-w-none text-gray-700">
                <ReactMarkdown>{monitoringRequirements}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient/Caregiver-specific sections */}
      {!isClinician && nextSteps && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border-l-4 border-green-600">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-green-900 mb-4">Next Steps</h2>
              <div className="prose prose-green max-w-none text-gray-700">
                <ReactMarkdown>{nextSteps}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning Signs */}
      {!isClinician && warningSignsSection && (
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl shadow-lg p-6 border-l-4 border-red-600">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-red-900 mb-4">Warning Signs</h2>
              <div className="prose prose-red max-w-none text-gray-700">
                <ReactMarkdown>{warningSignsSection}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl shadow-lg p-6 border-l-4 border-slate-600">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-slate-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Summary</h2>
              <div className="prose prose-slate max-w-none text-gray-700">
                <ReactMarkdown>{summary}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pharmacogenomic Results Details - Always visible for all roles */}
      {data.pgx_results && (data.pgx_results.drug_labels?.length > 0 || data.pgx_results.genes?.length > 0 || data.pgx_results.variants?.length > 0 || data.pgx_results.phenotypes?.length > 0) && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
          <div className="w-full px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200">
            <div className="flex items-center space-x-3">
              <Dna className="w-6 h-6 text-emerald-600" />
              <h3 className="text-xl font-bold text-slate-900">Pharmacogenomic Data Details</h3>
            </div>
          </div>

          <div className="p-6 space-y-6">
              {/* Drug Labels */}
              {data.pgx_results.drug_labels && data.pgx_results.drug_labels.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-3 text-lg">Drug Label Information</h4>
                  <div className="space-y-4">
                    {data.pgx_results.drug_labels.map((label, idx) => {
                      if (typeof label === 'string') {
                        return (
                          <div key={idx} className="px-4 py-3 bg-slate-50 rounded border border-slate-200">
                            <p className="text-gray-700">{label}</p>
                          </div>
                        );
                      }

                      return (
                        <div key={idx} className="space-y-3 bg-slate-50 rounded-lg p-4 border border-slate-200">
                          {label.drug_id && (
                            <div className="mb-3">
                              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                                {label.drug_id}
                              </span>
                            </div>
                          )}

                          {label.known_side_effects && label.known_side_effects.length > 0 && (
                            <div>
                              <h5 className="font-bold text-gray-800 mb-2 flex items-center">
                                <AlertTriangle className="w-4 h-4 mr-2 text-amber-600" />
                                Known Side Effects:
                              </h5>
                              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                                {label.known_side_effects.map((effect, i) => (
                                  <li key={i}>{effect}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {label.box_warnings && label.box_warnings.length > 0 && (
                            <div className="bg-red-50 border-l-4 border-red-600 p-3 rounded">
                              <h5 className="font-bold text-red-900 mb-2 flex items-center">
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Box Warnings:
                              </h5>
                              <ul className="list-disc list-inside space-y-1 text-red-800">
                                {label.box_warnings.map((warning, i) => (
                                  <li key={i}>{warning}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {label.pharmacogenomic_considerations && label.pharmacogenomic_considerations.length > 0 && (
                            <div>
                              <h5 className="font-bold text-gray-800 mb-2 flex items-center">
                                <Dna className="w-4 h-4 mr-2 text-emerald-600" />
                                Pharmacogenomic Considerations:
                              </h5>
                              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                                {label.pharmacogenomic_considerations.map((consideration, i) => (
                                  <li key={i}>{consideration}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {label.safety_notes && label.safety_notes.length > 0 && (
                            <div>
                              <h5 className="font-bold text-gray-800 mb-2 flex items-center">
                                <Shield className="w-4 h-4 mr-2 text-blue-600" />
                                Safety Notes:
                              </h5>
                              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                                {label.safety_notes.map((note, i) => (
                                  <li key={i}>{note}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {label.when_to_call_doctor && label.when_to_call_doctor.length > 0 && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
                              <h5 className="font-bold text-yellow-900 mb-2">When to Contact Healthcare Provider:</h5>
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

              {/* Testing Guidelines */}
              {data.pgx_results.testing_guidelines && (
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <h4 className="font-bold text-emerald-900 mb-3 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Testing Guidelines
                  </h4>
                  <div className="space-y-2 text-sm">
                    {data.pgx_results.testing_guidelines.fda_level && (
                      <p><strong>FDA Level:</strong> {data.pgx_results.testing_guidelines.fda_level}</p>
                    )}
                    {data.pgx_results.testing_guidelines.cpic_dosing_info !== undefined && (
                      <p><strong>CPIC Dosing Info:</strong> {data.pgx_results.testing_guidelines.cpic_dosing_info ? 'Available' : 'Not Available'}</p>
                    )}
                    {data.pgx_results.testing_guidelines.has_dosing_guideline !== undefined && (
                      <p><strong>Dosing Guideline:</strong> {data.pgx_results.testing_guidelines.has_dosing_guideline ? 'Available' : 'Not Available'}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Genes */}
              {data.pgx_results.genes && data.pgx_results.genes.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-3">Relevant Genes</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.pgx_results.genes.map((gene, idx) => (
                      <span key={idx} className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                        {gene}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Variants */}
              {data.pgx_results.variants && data.pgx_results.variants.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-3">Genetic Variants</h4>
                  <div className="space-y-2">
                    {data.pgx_results.variants.map((variant, idx) => (
                      <div key={idx} className="px-4 py-2 bg-slate-50 rounded border border-slate-200 text-sm">
                        {variant}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Phenotypes */}
              {data.pgx_results.phenotypes && data.pgx_results.phenotypes.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-3">Phenotypes</h4>
                  <div className="space-y-2">
                    {data.pgx_results.phenotypes.map((phenotype, idx) => (
                      <div key={idx} className="px-4 py-2 bg-blue-50 rounded border border-blue-200 text-sm">
                        {phenotype}
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      {/* References */}
      {references && (
        <div className="bg-slate-50 rounded-xl shadow p-6 border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-3">References</h3>
          <div className="prose prose-slate prose-sm max-w-none text-gray-700">
            <ReactMarkdown>{references}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center pt-6">
        <button
          onClick={handleDownloadPDF}
          className="flex items-center space-x-2 px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium shadow-lg hover:shadow-xl"
        >
          <Download className="w-5 h-5" />
          <span>Download Summary</span>
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
        >
          <Printer className="w-5 h-5" />
          <span>Print</span>
        </button>
        <button
          onClick={() => setShowEmailModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-lg hover:shadow-xl"
        >
          <Mail className="w-5 h-5" />
          <span>Email</span>
        </button>
        {onNewQuery && (
          <button
            onClick={onNewQuery}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Start New Query</span>
          </button>
        )}
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Email Summary</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="doctor@example.com"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleSendEmail}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Send Email
                </button>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
