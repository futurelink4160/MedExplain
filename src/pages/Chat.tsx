import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import Layout from '../components/Layout';
import ResultsDisplay from '../components/ResultsDisplay';
import { Send, Upload, AlertCircle, CheckCircle, Mic, MicOff, Sparkles, FileText, User, Calendar, Pill, MessageSquare, Activity, Clock, Plus, TestTube } from 'lucide-react';
import { mockResponseData } from '../test-data';

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
  pgx_results?: PgxResults;
  final_answer_markdown?: string;
  clinical_summary?: string;
  pgx_interpretation?: string;
  clinical_recommendations?: string[];
  disclaimer?: string;
}

export default function Chat() {
  const { user } = useAuth();
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [role, setRole] = useState('');
  const [medication, setMedication] = useState('');
  const [question, setQuestion] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('');
  const [otherMeds, setOtherMeds] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<ResponseData | null>(null);
  const recognitionRef = useRef<any>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;

        if (activeField) {
          switch(activeField) {
            case 'age':
              const ageMatch = transcript.match(/\d+/);
              if (ageMatch) setAge(ageMatch[0]);
              break;
            case 'medication':
              setMedication(transcript);
              break;
            case 'question':
              setQuestion(prev => prev ? prev + ' ' + transcript : transcript);
              break;
            case 'symptoms':
              setSymptoms(transcript);
              break;
            case 'duration':
              setDuration(transcript);
              break;
            case 'otherMeds':
              setOtherMeds(prev => prev ? prev + ' ' + transcript : transcript);
              break;
            case 'medicalHistory':
              setMedicalHistory(prev => prev ? prev + ' ' + transcript : transcript);
              break;
          }
        }

        setIsListening(false);
        setActiveField(null);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        setActiveField(null);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setActiveField(null);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [activeField]);

  function startListening(field: string) {
    if (recognitionRef.current) {
      setActiveField(field);
      setIsListening(true);
      recognitionRef.current.start();
    }
  }

  function stopListening() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setActiveField(null);
    }
  }

  function handleNewQuery() {
    setResponseData(null);
    setAge('');
    setGender('');
    setRole('');
    setMedication('');
    setQuestion('');
    setSymptoms('');
    setDuration('');
    setOtherMeds('');
    setMedicalHistory('');
    setFiles(null);
    setError('');
    setSuccess(false);

    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleTestWithMockData() {
    setResponseData(mockResponseData as ResponseData);
    setSuccess(true);

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const fileData: string[] = [];

      if (files) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const reader = new FileReader();

          const fileContent = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          fileData.push(fileContent);
        }
      }

      const payload = {
        Age: parseInt(age),
        Gender: gender || 'Not specified',
        'Profession/Role': role,
        'Medication Name': medication || 'Not specified',
        'Your Question/Inquiry': question,
        'Current Symptoms': symptoms || 'None mentioned',
        'Duration of Symptoms': duration || 'Not specified',
        'Other Medications/Supplements': otherMeds || 'None mentioned',
        'Additional Relevant History': medicalHistory || 'None mentioned',
        Attachments: fileData.length > 0 ? fileData : 'No files uploaded',
        user_id: user?.id,
        submitted_at: new Date().toISOString()
      };

      console.log('Sending payload to n8n:', payload);

      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://ftlteam4160.app.n8n.cloud/webhook-test/medexplain-query';
      console.log('Webhook URL:', webhookUrl);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to submit form: ${response.status} - ${errorText}`);
      }

      const responseText = await response.text();
      console.log('=== N8N RESPONSE DEBUG ===');
      console.log('Raw response text:', responseText);
      console.log('Response text length:', responseText.length);
      console.log('First 200 chars:', responseText.substring(0, 200));
      console.log('Last 200 chars:', responseText.substring(Math.max(0, responseText.length - 200)));
      console.log('Response content type:', response.headers.get('content-type'));

      if (!responseText || responseText.length === 0) {
        console.error('ERROR: Empty response from n8n webhook');
        throw new Error('Empty response from n8n webhook. Check your n8n "Respond to Webhook" node configuration.');
      }

      let data;
      try {
        let cleanedText = responseText.trim();

        // Handle double-encoded JSON (if n8n returns JSON as a string)
        if (cleanedText.startsWith('"') && cleanedText.endsWith('"')) {
          console.log('Response appears to be double-encoded, removing outer quotes');
          cleanedText = cleanedText.slice(1, -1);
          cleanedText = cleanedText.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        }

        console.log('Cleaned text first 200 chars:', cleanedText.substring(0, 200));
        data = JSON.parse(cleanedText);
        console.log('Successfully parsed JSON');
        console.log('Parsed data type:', typeof data);
        console.log('Parsed data keys:', Object.keys(data));
        console.log('Full parsed response data:', JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.error('===== JSON PARSE ERROR =====');
        console.error('Parse error:', parseError);
        console.error('Failed text (first 1000 chars):', responseText.substring(0, 1000));
        throw new Error(`Invalid JSON response from n8n: ${parseError.message}`);
      }

      if (!data || typeof data !== 'object') {
        console.error('Invalid response structure:', data);
        throw new Error('Invalid response structure from server');
      }

      // Handle case where n8n returns an array with one item
      if (Array.isArray(data)) {
        console.log('Response is an array, extracting first item');
        if (data.length > 0) {
          data = data[0];
          console.log('Extracted data:', data);
        } else {
          throw new Error('n8n returned empty array');
        }
      }

      // Handle case where n8n wraps the response in an "output" field
      if (data.output && typeof data.output === 'string') {
        console.log('Response has "output" field, attempting to unwrap...');
        try {
          // Try parsing as JSON first
          const unwrapped = JSON.parse(data.output);
          console.log('Successfully parsed output field as JSON');
          data = unwrapped;
        } catch (parseError) {
          console.log('Output field is not JSON, checking if it is markdown or plain text...');
          // If it's not JSON, check if it looks like markdown/text content
          if (data.output.trim().startsWith('###') || data.output.trim().startsWith('#')) {
            console.log('Output field contains markdown, treating as final_answer_markdown');
            // It's markdown content - use it as final_answer_markdown
            data.final_answer_markdown = data.output;
            delete data.output;
          } else {
            // Try one more time - maybe it's double-encoded JSON string
            console.error('Failed to parse output field:', parseError);
            throw new Error('Response wrapped in output field but could not parse it');
          }
        }
      }

      console.log('=== RESPONSE STRUCTURE CHECK ===');
      console.log('- Has final_answer_markdown:', !!data.final_answer_markdown);
      console.log('- Has pgx_results:', !!data.pgx_results);
      console.log('- Has clinical_summary:', !!data.clinical_summary);
      console.log('- Has pgx_interpretation:', !!data.pgx_interpretation);
      console.log('- Has clinical_recommendations:', !!data.clinical_recommendations);
      console.log('- Has emergency_detected:', !!data.emergency_detected);
      console.log('- Has response_type:', !!data.response_type);
      console.log('- Has urgency_level:', !!data.urgency_level);
      console.log('- Has rag_results:', !!data.rag_results);

      // Convert clinical format to UI format if needed
      if (data.clinical_summary && !data.final_answer_markdown) {
        console.log('Converting clinical format to UI format...');

        let markdown = `### Clinical Summary\n\n${data.clinical_summary}\n\n`;

        if (data.pgx_interpretation) {
          markdown += `### Pharmacogenomic Interpretation\n\n${data.pgx_interpretation}\n\n`;
        }

        if (data.clinical_recommendations && Array.isArray(data.clinical_recommendations)) {
          markdown += `### Clinical Recommendations\n\n`;
          data.clinical_recommendations.forEach((rec, index) => {
            markdown += `${index + 1}. ${rec}\n`;
          });
          markdown += `\n`;
        }

        if (data.disclaimer) {
          markdown += `### Disclaimer\n\n${data.disclaimer}\n\n`;
        }

        data.final_answer_markdown = markdown;
        console.log('Converted to markdown format');
      }

      // Create empty pgx_results if not present
      if (!data.pgx_results) {
        console.log('Creating empty pgx_results structure');
        data.pgx_results = {
          drug_labels: [],
          genes: [],
          variants: [],
          phenotypes: []
        };
      }

      // Validate minimum required fields
      const missingFields = [];
      if (!data.final_answer_markdown) missingFields.push('final_answer_markdown or clinical_summary');
      if (!data.response_type) missingFields.push('response_type');
      if (!data.urgency_level) missingFields.push('urgency_level');
      if (data.emergency_detected === undefined) missingFields.push('emergency_detected');

      if (missingFields.length > 0) {
        console.error('===== MISSING REQUIRED FIELDS =====');
        console.error('Missing fields:', missingFields);
        console.error('Available fields:', Object.keys(data));
        console.error('Full response:', JSON.stringify(data, null, 2));
        throw new Error(`n8n response missing required fields: ${missingFields.join(', ')}. Check your n8n "Respond to Webhook" node.`);
      }

      console.log('✓ Response validated and converted successfully');
      console.log('Setting response data and scrolling to results...');
      setResponseData(data);
      setSuccess(true);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'An error occurred while submitting the form');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full mb-3 shadow-lg">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">AI-Powered Educational Tool</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Side Effects & Medication Questions
            </h1>
            <p className="text-base text-gray-600">
              Get personalized educational insights about your medications
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-4">
              <div className="flex items-start text-white">
                <AlertCircle className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-base mb-1">Educational Information Only</h3>
                  <p className="text-xs text-blue-50 leading-relaxed">
                    The information you receive from this tool is for general educational purposes only.
                    It is <strong>not</strong> medical advice, diagnosis, or treatment. Always contact a doctor,
                    pharmacist, or qualified healthcare professional for medical decisions or emergencies.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {success && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg p-4 mb-6 shadow-sm animate-fadeIn">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-green-900 text-base">Form Submitted Successfully!</h3>
                      <p className="text-green-700 mt-0.5 text-sm">
                        Your educational inquiry has been received. You will receive information based on your submission.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 rounded-lg p-4 mb-6 shadow-sm">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-red-900 text-base">Error</h3>
                      <p className="text-red-700 mt-0.5 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="group">
                    <label htmlFor="age" className="flex items-center text-xs font-bold text-gray-800 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                        <User className="w-3.5 h-3.5 text-white" />
                      </div>
                      Your Age <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="age"
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        required
                        min="0"
                        max="120"
                        className="w-full px-4 py-2.5 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                        placeholder="Enter your age"
                      />
                      <button
                        type="button"
                        onClick={() => isListening && activeField === 'age' ? stopListening() : startListening('age')}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                          isListening && activeField === 'age'
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        }`}
                      >
                        {isListening && activeField === 'age' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="group">
                    <label htmlFor="gender" className="flex items-center text-xs font-bold text-gray-800 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                        <User className="w-3.5 h-3.5 text-white" />
                      </div>
                      Gender
                    </label>
                    <select
                      id="gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all text-sm font-medium"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="group">
                    <label htmlFor="role" className="flex items-center text-xs font-bold text-gray-800 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                        <FileText className="w-3.5 h-3.5 text-white" />
                      </div>
                      Who Are You? <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-500 outline-none transition-all text-sm font-medium"
                    >
                      <option value="">Select your role</option>
                      <option value="Patient">Patient</option>
                      <option value="Caregiver">Caregiver</option>
                      <option value="Doctor">Doctor</option>
                      <option value="Nurse">Nurse</option>
                      <option value="Pharmacist">Pharmacist</option>
                      <option value="Clinician">Clinician</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="group">
                    <label htmlFor="medication" className="flex items-center text-xs font-bold text-gray-800 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                        <Pill className="w-3.5 h-3.5 text-white" />
                      </div>
                      Medication You Want Information About
                    </label>
                    <div className="relative">
                      <input
                        id="medication"
                        type="text"
                        value={medication}
                        onChange={(e) => setMedication(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none transition-all text-sm"
                        placeholder="Example: Sertraline, Metformin, Amoxicillin"
                      />
                      <button
                        type="button"
                        onClick={() => isListening && activeField === 'medication' ? stopListening() : startListening('medication')}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                          isListening && activeField === 'medication'
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                        }`}
                      >
                        {isListening && activeField === 'medication' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="question" className="flex items-center text-xs font-bold text-gray-800 mb-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-3.5 h-3.5 text-white" />
                    </div>
                    Your Question or Concern <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      id="question"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      required
                      rows={3}
                      className="w-full px-4 py-2.5 bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-200 focus:border-cyan-500 outline-none transition-all resize-none text-sm"
                      placeholder="Describe your question or what you're curious about..."
                    />
                    <button
                      type="button"
                      onClick={() => isListening && activeField === 'question' ? stopListening() : startListening('question')}
                      className={`absolute right-2 top-2 p-1.5 rounded-lg transition-all ${
                        isListening && activeField === 'question'
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-cyan-100 text-cyan-600 hover:bg-cyan-200'
                      }`}
                    >
                      {isListening && activeField === 'question' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="group">
                    <label htmlFor="symptoms" className="flex items-center text-xs font-bold text-gray-800 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                        <Activity className="w-3.5 h-3.5 text-white" />
                      </div>
                      Symptoms or Side Effects
                    </label>
                    <div className="relative">
                      <input
                        id="symptoms"
                        type="text"
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all text-sm"
                        placeholder="dizziness, nausea, headache..."
                      />
                      <button
                        type="button"
                        onClick={() => isListening && activeField === 'symptoms' ? stopListening() : startListening('symptoms')}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                          isListening && activeField === 'symptoms'
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                        }`}
                      >
                        {isListening && activeField === 'symptoms' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="group">
                    <label htmlFor="duration" className="flex items-center text-xs font-bold text-gray-800 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                        <Clock className="w-3.5 h-3.5 text-white" />
                      </div>
                      How Long Has This Been Going On?
                    </label>
                    <div className="relative">
                      <input
                        id="duration"
                        type="text"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500 outline-none transition-all text-sm"
                        placeholder="2 days, 1 week, just started..."
                      />
                      <button
                        type="button"
                        onClick={() => isListening && activeField === 'duration' ? stopListening() : startListening('duration')}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                          isListening && activeField === 'duration'
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                      >
                        {isListening && activeField === 'duration' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="other-meds" className="flex items-center text-xs font-bold text-gray-800 mb-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                      <Plus className="w-3.5 h-3.5 text-white" />
                    </div>
                    Other Medications or Supplements
                  </label>
                  <div className="relative">
                    <textarea
                      id="other-meds"
                      value={otherMeds}
                      onChange={(e) => setOtherMeds(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-200 rounded-lg focus:ring-2 focus:ring-violet-200 focus:border-violet-500 outline-none transition-all resize-none text-sm"
                      placeholder="Include anything else you're taking, if applicable..."
                    />
                    <button
                      type="button"
                      onClick={() => isListening && activeField === 'otherMeds' ? stopListening() : startListening('otherMeds')}
                      className={`absolute right-2 top-2 p-1.5 rounded-lg transition-all ${
                        isListening && activeField === 'otherMeds'
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-violet-100 text-violet-600 hover:bg-violet-200'
                      }`}
                    >
                      {isListening && activeField === 'otherMeds' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="medical-history" className="flex items-center text-xs font-bold text-gray-800 mb-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                      <FileText className="w-3.5 h-3.5 text-white" />
                    </div>
                    Additional Relevant History
                  </label>
                  <div className="relative">
                    <textarea
                      id="medical-history"
                      value={medicalHistory}
                      onChange={(e) => setMedicalHistory(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-200 focus:border-teal-500 outline-none transition-all resize-none text-sm"
                      placeholder="Medical conditions, allergies, surgeries, family history, or other relevant information..."
                    />
                    <button
                      type="button"
                      onClick={() => isListening && activeField === 'medicalHistory' ? stopListening() : startListening('medicalHistory')}
                      className={`absolute right-2 top-2 p-1.5 rounded-lg transition-all ${
                        isListening && activeField === 'medicalHistory'
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-teal-100 text-teal-600 hover:bg-teal-200'
                      }`}
                    >
                      {isListening && activeField === 'medicalHistory' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="group">
                  <label className="flex items-center text-xs font-bold text-gray-800 mb-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                      <Upload className="w-3.5 h-3.5 text-white" />
                    </div>
                    Upload Files (optional)
                  </label>
                  <div className="relative border-2 border-dashed border-indigo-300 rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 hover:border-indigo-500 transition-all overflow-hidden">
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => setFiles(e.target.files)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="px-6 py-6 text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-sm font-semibold text-gray-800 mb-1">
                        Drop files here or click to upload
                      </p>
                      <p className="text-xs text-gray-600">
                        PDF, JPG, PNG, DOC up to 10MB each
                      </p>
                      {files && files.length > 0 && (
                        <div className="mt-3 inline-flex items-center space-x-2 px-3 py-1.5 bg-indigo-500 text-white rounded-full text-sm font-semibold">
                          <CheckCircle className="w-4 h-4" />
                          <span>{files.length} file(s) selected</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-bold text-base shadow-xl hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 group"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      <span>Get Educational Insights</span>
                      <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleTestWithMockData}
                  className="w-full mt-3 bg-gradient-to-r from-green-600 to-teal-600 text-white py-2 px-4 rounded-xl font-medium text-sm shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-300 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <TestTube className="w-4 h-4" />
                  <span>Test with Mock Data</span>
                </button>
              </form>

              <div className="mt-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-gray-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      <strong className="text-gray-900">Disclaimer:</strong> This tool provides educational information only.
                      It does not diagnose conditions, provide medical advice, or replace professional care.
                      Always consult a licensed healthcare provider for medical questions or emergencies.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {responseData && (
          <div ref={resultsRef} className="mt-8">
            <ResultsDisplay data={responseData} onNewQuery={handleNewQuery} />
          </div>
        )}
      </div>
    </Layout>
  );
}
