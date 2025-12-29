import { useState, useRef } from 'react';
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
import html2pdf from 'html2pdf.js';

interface DrugLabel {
  medication: string;
  side_effects: string;
  metabolism: string;
  dosing_guideline: string;
}

interface GeneInfo {
  gene: string;
  role: string;
  variants?: string[];
  interpretation: string;
}

interface PhenotypeInfo {
  gene: string;
  phenotype: string;
  clinical_implications: string;
}

interface PgxResults {
  drug_labels: DrugLabel[];
  genes: GeneInfo[];
  phenotypes: PhenotypeInfo[];
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

  const [showPgx, setShowPgx] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('My MedExplain Educational Summary');
  const [emailBody, setEmailBody] = useState(data.final_answer_markdown || '');
  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;

    const opt = {
      margin: 0.5,
      filename: `MedExplain-Summary-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(contentRef.current).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
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

    // Try ### headers first
    let regex = new RegExp(`###\\s*${title}([\\s\\S]*?)(?=###|##|#|$)`, 'i');
    let match = cleanedMarkdown.match(regex);
    if (match) {
      console.log(`Extracted section "${title}" (###):`, match[1].trim().substring(0, 100) + '...');
      return match[1].trim();
    }

    // Try ## headers
    regex = new RegExp(`##\\s*${title}([\\s\\S]*?)(?=##|#|$)`, 'i');
    match = cleanedMarkdown.match(regex);
    if (match) {
      console.log(`Extracted section "${title}" (##):`, match[1].trim().substring(0, 100) + '...');
      return match[1].trim();
    }

    // Try # headers
    regex = new RegExp(`#\\s*${title}([\\s\\S]*?)(?=#|$)`, 'i');
    match = cleanedMarkdown.match(regex);
    if (match) {
      console.log(`Extracted section "${title}" (#):`, match[1].trim().substring(0, 100) + '...');
      return match[1].trim();
    }

    console.log(`Section "${title}" not found in markdown`);
    return '';
  };

  const parseAllSections = (markdown: string | undefined): Array<{ title: string; content: string }> => {
    if (!markdown) return [];

    const cleanedMarkdown = markdown.replace(/\\n/g, '\n');
    const sections: Array<{ title: string; content: string }> = [];

    // Match all headers (###, ##, #) and their content
    const regex = /(#{1,3})\s*([^\n]+)\n([\s\S]*?)(?=#{1,3}\s|$)/g;
    let match;

    while ((match = regex.exec(cleanedMarkdown)) !== null) {
      const title = match[2].trim();
      const content = match[3].trim();
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
    extractSection(markdown, 'Genetic Considerations') ||
    extractSection(markdown, 'How Common Is This');

  // Check if this is clinical format response
  const isClinicalFormat = data.clinical_summary || data.pgx_interpretation || data.clinical_recommendations;

  if (isClinicalFormat) {
    return (
      <div ref={contentRef} className="space-y-6 mb-8">
        <div className="bg-primary rounded-2xl shadow-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Clinical Pharmacogenomics Summary</h1>
              <p className="text-gray-200 text-lg">Professional clinical insight for healthcare providers</p>
            </div>
            <Activity className="w-20 h-20 text-secondary opacity-80 hidden md:block" />
          </div>
        </div>

        {data.clinical_summary && (
          <div className="bg-background-card rounded-xl shadow-lg p-6 border-l-4 border-primary">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-primary mb-4">Clinical Summary</h2>
                <div className="prose max-w-none text-text-primary">
                  <p>{data.clinical_summary}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {data.pgx_interpretation && (
          <div className="bg-background-card rounded-xl shadow-lg p-6 border-l-4 border-accent">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-accent-dark mb-4">Pharmacogenomic Interpretation</h2>
                <div className="prose max-w-none text-text-primary">
                  <p>{data.pgx_interpretation}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {data.clinical_recommendations && data.clinical_recommendations.length > 0 && (
          <div className="bg-background-card rounded-xl shadow-lg p-6 border-l-4 border-status-success">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-status-success rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-status-success mb-4">Clinical Recommendations</h2>
                <ol className="space-y-3">
                  {data.clinical_recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-status-success text-white rounded-full flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-text-primary pt-1">{rec}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}

        {data.disclaimer && (
          <div className="bg-background-card rounded-xl shadow-lg p-6 border-l-4 border-text-secondary">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-text-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                <Info className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-text-primary mb-4">Disclaimer</h2>
                <div className="prose max-w-none text-text-secondary italic">
                  <p>{data.disclaimer}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-primary-light transition-all transform hover:scale-105"
          >
            <Download className="w-5 h-5" />
            <span>Download Summary</span>
          </button>

          <button
            onClick={() => setShowEmailModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-secondary text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-secondary-dark transition-all transform hover:scale-105"
          >
            <Mail className="w-5 h-5" />
            <span>Email This Summary</span>
          </button>

          {onNewQuery && (
            <button
              onClick={onNewQuery}
              className="flex items-center space-x-2 px-6 py-3 bg-status-success text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:brightness-110 transition-all transform hover:scale-105"
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
                  className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:shadow-lg hover:bg-primary-light transition"
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
      <div className="bg-background-card rounded-2xl shadow-xl overflow-hidden mb-8">
        <div className="bg-red-50 border-4 border-status-alert rounded-2xl p-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-status-alert rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <AlertTriangle className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-status-alert mb-4">EMERGENCY WARNING</h1>
            <p className="text-xl text-text-primary mb-6 leading-relaxed">
              Your symptoms may represent a serious medical issue.
            </p>
            <p className="text-2xl font-bold text-status-alert mb-6">
              Please call 911 or go to the nearest emergency room immediately.
            </p>
            <p className="text-sm text-text-secondary italic">
              This information is for educational purposes only.
            </p>
            {onNewQuery && (
              <button
                onClick={onNewQuery}
                className="mt-6 flex items-center space-x-2 px-6 py-3 bg-background-card text-status-alert border-2 border-status-alert rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-red-50 transition-all mx-auto"
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
      return { bg: 'bg-background-card', border: 'border-accent', iconBg: 'bg-accent', icon: Activity };
    }
    if (lowerTitle.includes('summary') || lowerTitle.includes('overview')) {
      return { bg: 'bg-background-card', border: 'border-primary', iconBg: 'bg-primary', icon: BookOpen };
    }
    if (lowerTitle.includes('interpretation') || lowerTitle.includes('analysis')) {
      return { bg: 'bg-background-card', border: 'border-secondary', iconBg: 'bg-secondary', icon: Activity };
    }
    if (lowerTitle.includes('recommendation') || lowerTitle.includes('action')) {
      return { bg: 'bg-background-card', border: 'border-status-success', iconBg: 'bg-status-success', icon: CheckCircle2 };
    }
    if (lowerTitle.includes('warning') || lowerTitle.includes('alert') || lowerTitle.includes('emergency')) {
      return { bg: 'bg-background-card', border: 'border-status-alert', iconBg: 'bg-status-alert', icon: AlertTriangle };
    }
    if (lowerTitle.includes('medication') || lowerTitle.includes('drug')) {
      return { bg: 'bg-background-card', border: 'border-status-warning', iconBg: 'bg-status-warning', icon: Pill };
    }
    if (lowerTitle.includes('safety') || lowerTitle.includes('precaution')) {
      return { bg: 'bg-background-card', border: 'border-status-warning', iconBg: 'bg-status-warning', icon: Shield };
    }
    if (lowerTitle.includes('disclaimer') || lowerTitle.includes('note')) {
      return { bg: 'bg-background-card', border: 'border-text-secondary', iconBg: 'bg-text-secondary', icon: Info };
    }
    if (lowerTitle.includes('contact') || lowerTitle.includes('doctor') || lowerTitle.includes('call')) {
      return { bg: 'bg-background-card', border: 'border-primary', iconBg: 'bg-primary', icon: Phone };
    }

    // Default style
    return { bg: 'bg-background-card', border: 'border-text-secondary', iconBg: 'bg-text-secondary', icon: BookOpen };
  };

  // If sections found, show them beautifully
  if (hasSections && !hasPatientSections) {
    return (
      <div ref={contentRef} className="space-y-6 mb-8">
        <div className="bg-primary rounded-2xl shadow-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Your Pharmacogenomic Report</h1>
              <p className="text-gray-200 text-lg">Personalized medication and genetic information</p>
            </div>
            <Activity className="w-20 h-20 text-secondary opacity-80 hidden md:block" />
          </div>
        </div>

        {allSections.map((section, idx) => {
          const style = getSectionStyle(section.title);
          const IconComponent = style.icon;

          return (
            <div key={idx} className={`${style.bg} rounded-xl shadow-lg p-6 border-l-4 ${style.border}`}>
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 ${style.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-text-primary mb-4">{section.title}</h2>
                  <div className="prose max-w-none text-text-primary">
                    <ReactMarkdown>{section.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {data.pgx_results && (
          <div className="bg-background-card rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <button
              onClick={() => setShowPgx(!showPgx)}
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-text-primary">
                  Additional Genomic Details (Genes, Variants & Drug Labels)
                </h2>
              </div>
              {showPgx ? (
                <ChevronUp className="w-6 h-6 text-text-secondary" />
              ) : (
                <ChevronDown className="w-6 h-6 text-text-secondary" />
              )}
            </button>

            {showPgx && (
              <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-6">
                {/* Show message if no PGX data is available */}
                {(!data.pgx_results.drug_labels || data.pgx_results.drug_labels.length === 0) &&
                 (!data.pgx_results.genes || data.pgx_results.genes.length === 0) &&
                 (!data.pgx_results.phenotypes || data.pgx_results.phenotypes.length === 0) && (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No additional genomic data available for this query at this time.</p>
                    <p className="text-sm text-gray-500 mt-2">Genomic information may be added as more research becomes available.</p>
                  </div>
                )}

                {data.pgx_results.drug_labels && data.pgx_results.drug_labels.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Drug Label Information</h3>
                    <div className="space-y-4">
                      {data.pgx_results.drug_labels.map((label, idx) => (
                        <div key={idx} className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <h4 className="font-bold text-gray-900 text-lg">{label.medication}</h4>

                          {label.side_effects && (
                            <div>
                              <h5 className="font-semibold text-gray-800 mb-1">Side Effects:</h5>
                              <p className="text-gray-700">{label.side_effects}</p>
                            </div>
                          )}

                          {label.metabolism && (
                            <div>
                              <h5 className="font-semibold text-gray-800 mb-1">Metabolism:</h5>
                              <p className="text-gray-700">{label.metabolism}</p>
                            </div>
                          )}

                          {label.dosing_guideline && (
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                              <h5 className="font-semibold text-blue-900 mb-1">Dosing Guideline:</h5>
                              <p className="text-blue-800">{label.dosing_guideline}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {data.pgx_results.genes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Genes Associated With This Medication</h3>
                    <div className="space-y-4">
                      {data.pgx_results.genes.map((gene, idx) => (
                        <div key={idx} className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                          <h4 className="font-bold text-emerald-900 mb-2">{gene.gene}</h4>

                          <div className="space-y-2 text-gray-700">
                            <p><span className="font-semibold">Role:</span> {gene.role}</p>

                            {gene.variants && gene.variants.length > 0 && (
                              <div>
                                <span className="font-semibold">Variants:</span>
                                <ul className="list-disc list-inside ml-4 mt-1">
                                  {gene.variants.map((variant, vIdx) => (
                                    <li key={vIdx}>{variant}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <p><span className="font-semibold">Interpretation:</span> {gene.interpretation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {data.pgx_results.phenotypes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Phenotype Information</h3>
                    <div className="space-y-4">
                      {data.pgx_results.phenotypes.map((phenotype, idx) => (
                        <div key={idx} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <h4 className="font-bold text-purple-900 mb-2">{phenotype.gene}</h4>
                          <div className="space-y-2 text-gray-700">
                            <p><span className="font-semibold">Phenotype:</span> {phenotype.phenotype}</p>
                            <p><span className="font-semibold">Clinical Implications:</span> {phenotype.clinical_implications}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-primary-light transition-all transform hover:scale-105"
          >
            <Download className="w-5 h-5" />
            <span>Download Report</span>
          </button>

          <button
            onClick={() => setShowEmailModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-secondary text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-secondary-dark transition-all transform hover:scale-105"
          >
            <Mail className="w-5 h-5" />
            <span>Email This Report</span>
          </button>

          {onNewQuery && (
            <button
              onClick={onNewQuery}
              className="flex items-center space-x-2 px-6 py-3 bg-status-success text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:brightness-110 transition-all transform hover:scale-105"
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
                  className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:shadow-lg hover:bg-primary-light transition"
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
    <div ref={contentRef} className="space-y-6 mb-8">
      <div className="bg-primary rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Your Medication Insight Summary</h1>
            <p className="text-gray-200 text-lg">Educational information to support your understanding</p>
          </div>
          <Activity className="w-20 h-20 text-secondary opacity-80 hidden md:block" />
        </div>
      </div>

      {/* Patient Information */}
      {patientData && (patientData.hasStructuredOverview || patientData.age || patientData.medication || patientData.question || patientData.symptoms || patientData.duration) && (
        <div className="bg-background-card rounded-xl shadow-lg p-6 border-l-4 border-primary">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-primary mb-4">Your Information</h2>
              <div className="prose max-w-none text-text-primary">
                {patientData.hasStructuredOverview ? (
                  <ReactMarkdown>{patientData.overview}</ReactMarkdown>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {patientData.age && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <strong className="text-primary">Age:</strong> <span className="text-text-primary">{patientData.age}</span>
                      </div>
                    )}
                    {patientData.gender && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <strong className="text-primary">Gender:</strong> <span className="text-text-primary">{patientData.gender}</span>
                      </div>
                    )}
                    {patientData.role && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <strong className="text-primary">Role:</strong> <span className="text-text-primary">{patientData.role}</span>
                      </div>
                    )}
                    {patientData.medication && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <strong className="text-primary">Medication:</strong> <span className="text-text-primary">{patientData.medication}</span>
                      </div>
                    )}
                    {patientData.question && (
                      <div className="bg-gray-50 p-3 rounded-lg md:col-span-2">
                        <strong className="text-primary">Question/Concern:</strong> <span className="text-text-primary">{patientData.question}</span>
                      </div>
                    )}
                    {patientData.symptoms && (
                      <div className="bg-gray-50 p-3 rounded-lg md:col-span-2">
                        <strong className="text-primary">Current Symptoms:</strong> <span className="text-text-primary">{patientData.symptoms}</span>
                      </div>
                    )}
                    {patientData.duration && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <strong className="text-primary">Duration:</strong> <span className="text-text-primary">{patientData.duration}</span>
                      </div>
                    )}
                    {patientData.otherMeds && patientData.otherMeds !== 'None mentioned' && patientData.otherMeds !== 'None reported' && (
                      <div className="bg-gray-50 p-3 rounded-lg md:col-span-2">
                        <strong className="text-primary">Other Medications:</strong> <span className="text-text-primary">{patientData.otherMeds}</span>
                      </div>
                    )}
                    {patientData.medicalHistory && patientData.medicalHistory !== 'None mentioned' && (
                      <div className="bg-gray-50 p-3 rounded-lg md:col-span-2">
                        <strong className="text-primary">Medical History:</strong> <span className="text-text-primary">{patientData.medicalHistory}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-background-card rounded-xl shadow-lg p-6 border-l-4 border-secondary">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-secondary mb-4">Understanding Your Concern</h2>
            <div className="prose max-w-none text-text-primary">
              <ReactMarkdown>{extractSection(markdown, 'Understanding Your Concern')}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-background-card rounded-xl shadow-lg p-6 border-l-4 border-status-warning">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-status-warning rounded-xl flex items-center justify-center flex-shrink-0">
            <Pill className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-status-warning mb-4">About This Medication</h2>
            <div className="prose max-w-none text-text-primary">
              <ReactMarkdown>{extractSection(markdown, 'About This Medication')}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      {(() => {
        const geneticInfo = extractSection(markdown, 'Genetic Considerations') ||
                           extractSection(markdown, 'Relevant Genetic Information') ||
                           extractSection(markdown, 'Genetic Information') ||
                           extractSection(markdown, 'Pharmacogenomic Information') ||
                           extractSection(markdown, 'Genetic Factors') ||
                           extractSection(markdown, 'Pharmacogenomic Context') ||
                           extractSection(markdown, 'How Your Genes May Play a Role');

        if (geneticInfo) {
          return (
            <div className="bg-background-card rounded-xl shadow-lg p-6 border-l-4 border-accent">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-accent mb-4">Genetic Considerations</h2>
                  <div className="prose max-w-none text-text-primary">
                    <ReactMarkdown>{geneticInfo}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        return null;
      })()}

      {(() => {
        const howCommon = extractSection(markdown, 'How Common Is This');
        if (!howCommon) return null;

        return (
          <div className="bg-background-card rounded-xl shadow-lg p-6 border-l-4 border-secondary">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-secondary mb-4">How Common Is This?</h2>
                <div className="prose max-w-none text-text-primary">
                  <ReactMarkdown>{howCommon}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="bg-background-card rounded-xl shadow-lg p-6 border-l-4 border-status-success">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-status-success rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-status-success mb-4">What You Can Do Now</h2>
            <div className="prose max-w-none text-text-primary">
              <ReactMarkdown
                components={{
                  li: ({ children }) => (
                    <li className="flex items-start space-x-2">
                      <CheckCircle2 className="w-5 h-5 text-status-success mt-0.5 flex-shrink-0" />
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

      <div className="bg-background-card rounded-xl shadow-lg p-6 border-l-4 border-primary">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-primary mb-4">When to Contact Your Doctor</h2>
            <div className="prose max-w-none text-text-primary">
              <ReactMarkdown>{extractSection(markdown, 'When to Contact Your Doctor')}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-background-card rounded-xl shadow-lg p-6 border-l-4 border-status-alert">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-status-alert rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-status-alert mb-4">When to Seek Emergency Care</h2>
            <div className="prose max-w-none text-text-primary">
              <ReactMarkdown>{extractSection(markdown, 'When to Seek Emergency Care')}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-background-card rounded-xl shadow-lg p-6 border-l-4 border-text-secondary">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-text-secondary rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-text-primary mb-4">Important Safety Reminders</h2>
            <div className="prose max-w-none text-text-primary">
              <ReactMarkdown>{extractSection(markdown, 'Important Safety Reminders')}</ReactMarkdown>
            </div>
            <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-status-warning rounded">
              <p className="font-bold text-text-primary">
                Do not stop taking your medication without medical guidance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {(() => {
        const expectationInfo = extractSection(markdown, 'What to Expect Moving Forward') ||
                               extractSection(markdown, 'What to Expect Going Forward') ||
                               extractSection(markdown, 'Moving Forward') ||
                               extractSection(markdown, 'Going Forward') ||
                               extractSection(markdown, 'What to Expect');

        if (expectationInfo) {
          return (
            <div className="bg-background-card rounded-xl shadow-lg p-6 border-l-4 border-secondary">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-secondary mb-4">What to Expect Moving Forward</h2>
                  <div className="prose max-w-none text-text-primary">
                    <ReactMarkdown>{expectationInfo}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        return null;
      })()}

      {(() => {
        const educationalNote = extractSection(markdown, 'Educational Purpose Only') ||
                               extractSection(markdown, 'Disclaimer') ||
                               extractSection(markdown, 'Important Note');

        if (educationalNote) {
          return (
            <div className="bg-background-card rounded-xl shadow-lg p-6 border-l-4 border-text-secondary">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-text-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-text-primary mb-4">Educational Purpose Only</h2>
                  <div className="prose max-w-none text-text-secondary italic">
                    <ReactMarkdown>{educationalNote}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        return null;
      })()}

      {data.pgx_results && (
        <div className="bg-background-card rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <button
            onClick={() => setShowPgx(!showPgx)}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                <Info className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">
                Additional Educational Insights (Genes, Drug Labels & Phenotypes)
              </h2>
            </div>
            {showPgx ? (
              <ChevronUp className="w-6 h-6 text-text-secondary" />
            ) : (
              <ChevronDown className="w-6 h-6 text-text-secondary" />
            )}
          </button>

          {showPgx && (
            <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-6">
              {data.pgx_results.drug_labels && data.pgx_results.drug_labels.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Drug Label Information</h3>
                  <div className="space-y-4">
                    {data.pgx_results.drug_labels.map((label, idx) => (
                      <div key={idx} className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="font-bold text-gray-900 text-lg">{label.medication}</h4>

                        {label.side_effects && (
                          <div>
                            <h5 className="font-semibold text-gray-800 mb-1">Side Effects:</h5>
                            <p className="text-gray-700">{label.side_effects}</p>
                          </div>
                        )}

                        {label.metabolism && (
                          <div>
                            <h5 className="font-semibold text-gray-800 mb-1">Metabolism:</h5>
                            <p className="text-gray-700">{label.metabolism}</p>
                          </div>
                        )}

                        {label.dosing_guideline && (
                          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                            <h5 className="font-semibold text-blue-900 mb-1">Dosing Guideline:</h5>
                            <p className="text-blue-800">{label.dosing_guideline}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.pgx_results.genes && data.pgx_results.genes.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Genes Associated With This Medication</h3>
                  <div className="space-y-4">
                    {data.pgx_results.genes.map((gene, idx) => (
                      <div key={idx} className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                        <h4 className="font-bold text-emerald-900 mb-2">{gene.gene}</h4>

                        <div className="space-y-2 text-gray-700">
                          <p><span className="font-semibold">Role:</span> {gene.role}</p>

                          {gene.variants && gene.variants.length > 0 && (
                            <div>
                              <span className="font-semibold">Variants:</span>
                              <ul className="list-disc list-inside ml-4 mt-1">
                                {gene.variants.map((variant, vIdx) => (
                                  <li key={vIdx}>{variant}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <p><span className="font-semibold">Interpretation:</span> {gene.interpretation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.pgx_results.phenotypes && data.pgx_results.phenotypes.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Phenotype Categories (General Info Only)</h3>
                  <div className="space-y-4">
                    {data.pgx_results.phenotypes.map((phenotype, idx) => (
                      <div key={idx} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <h4 className="font-bold text-purple-900 mb-2">{phenotype.gene}</h4>
                        <div className="space-y-2 text-gray-700">
                          <p><span className="font-semibold">Phenotype:</span> {phenotype.phenotype}</p>
                          <p><span className="font-semibold">Clinical Implications:</span> {phenotype.clinical_implications}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Show message if no PGX data is available */}
              {(!data.pgx_results.drug_labels || data.pgx_results.drug_labels.length === 0) &&
               (!data.pgx_results.genes || data.pgx_results.genes.length === 0) &&
               (!data.pgx_results.phenotypes || data.pgx_results.phenotypes.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-gray-600">No additional genomic data available for this medication at this time.</p>
                  <p className="text-sm text-gray-500 mt-2">This information may be added as more research becomes available.</p>
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
          className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-primary-light transition-all transform hover:scale-105"
        >
          <Download className="w-5 h-5" />
          <span>Download Summary</span>
        </button>

        <button
          onClick={() => setShowEmailModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-secondary text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-secondary-dark transition-all transform hover:scale-105"
        >
          <Mail className="w-5 h-5" />
          <span>Email This Summary</span>
        </button>

        {onNewQuery && (
          <button
            onClick={onNewQuery}
            className="flex items-center space-x-2 px-6 py-3 bg-status-success text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:brightness-110 transition-all transform hover:scale-105"
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
                className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:shadow-lg hover:bg-primary-light transition"
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
