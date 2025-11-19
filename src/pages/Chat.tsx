import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import Layout from '../components/Layout';
import { Send, Upload, AlertCircle, CheckCircle, Mic, MicOff, Sparkles, FileText, User, Calendar, Pill, MessageSquare, Activity, Clock, Plus } from 'lucide-react';

export default function Chat() {
  const { user } = useAuth();
  const [age, setAge] = useState('');
  const [role, setRole] = useState('');
  const [medication, setMedication] = useState('');
  const [question, setQuestion] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('');
  const [otherMeds, setOtherMeds] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

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
        'Profession/Role': role,
        'Medication Name': medication || 'Not specified',
        'Your Question/Inquiry': question,
        'Current Symptoms': symptoms || 'None mentioned',
        'Duration of Symptoms': duration || 'Not specified',
        'Other Medications/Supplements': otherMeds || 'None mentioned',
        Attachments: fileData.length > 0 ? fileData : 'No files uploaded',
        user_id: user?.id,
        submitted_at: new Date().toISOString()
      };

      console.log('Sending payload to n8n:', payload);

      const response = await fetch('https://ftlteam4160.app.n8n.cloud/webhook-test/medexplain-query', {
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

      const responseData = await response.json();
      console.log('Success response:', responseData);

      setSuccess(true);
      setAge('');
      setRole('');
      setMedication('');
      setQuestion('');
      setSymptoms('');
      setDuration('');
      setOtherMeds('');
      setFiles(null);

      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      setTimeout(() => setSuccess(false), 5000);

    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting the form');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full mb-4 shadow-lg">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold">AI-Powered Educational Tool</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
              Side Effects & Medication Questions
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get personalized educational insights about your medications
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6">
              <div className="flex items-start text-white">
                <AlertCircle className="w-6 h-6 mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg mb-2">Educational Information Only</h3>
                  <p className="text-sm text-blue-50 leading-relaxed">
                    The information you receive from this tool is for general educational purposes only.
                    It is <strong>not</strong> medical advice, diagnosis, or treatment. Always contact a doctor,
                    pharmacist, or qualified healthcare professional for medical decisions or emergencies.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 md:p-12">
              {success && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-xl p-6 mb-8 shadow-md animate-fadeIn">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-green-900 text-lg">Form Submitted Successfully!</h3>
                      <p className="text-green-700 mt-1">
                        Your educational inquiry has been received. You will receive information based on your submission.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 rounded-xl p-6 mb-8 shadow-md">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-red-900 text-lg">Error</h3>
                      <p className="text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="group">
                    <label htmlFor="age" className="flex items-center text-sm font-bold text-gray-800 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                        <User className="w-4 h-4 text-white" />
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
                        className="w-full px-5 py-4 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all text-lg font-medium"
                        placeholder="Enter your age"
                      />
                      <button
                        type="button"
                        onClick={() => isListening && activeField === 'age' ? stopListening() : startListening('age')}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                          isListening && activeField === 'age'
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        }`}
                      >
                        {isListening && activeField === 'age' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="group">
                    <label htmlFor="role" className="flex items-center text-sm font-bold text-gray-800 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      Who Are You? <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                      className="w-full px-5 py-4 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all text-lg font-medium"
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
                </div>

                <div className="group">
                  <label htmlFor="medication" className="flex items-center text-sm font-bold text-gray-800 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                      <Pill className="w-4 h-4 text-white" />
                    </div>
                    Medication You Want Information About
                  </label>
                  <div className="relative">
                    <input
                      id="medication"
                      type="text"
                      value={medication}
                      onChange={(e) => setMedication(e.target.value)}
                      className="w-full px-5 py-4 bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 rounded-xl focus:ring-4 focus:ring-pink-200 focus:border-pink-500 outline-none transition-all text-lg"
                      placeholder="Example: Sertraline, Metformin, Amoxicillin"
                    />
                    <button
                      type="button"
                      onClick={() => isListening && activeField === 'medication' ? stopListening() : startListening('medication')}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                        isListening && activeField === 'medication'
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-pink-100 text-pink-600 hover:bg-pink-200'
                      }`}
                    >
                      {isListening && activeField === 'medication' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="question" className="flex items-center text-sm font-bold text-gray-800 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    Your Question or Concern <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      id="question"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      required
                      rows={5}
                      className="w-full px-5 py-4 bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-xl focus:ring-4 focus:ring-cyan-200 focus:border-cyan-500 outline-none transition-all resize-none text-lg"
                      placeholder="Describe your question or what you're curious about..."
                    />
                    <button
                      type="button"
                      onClick={() => isListening && activeField === 'question' ? stopListening() : startListening('question')}
                      className={`absolute right-3 top-3 p-2 rounded-lg transition-all ${
                        isListening && activeField === 'question'
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-cyan-100 text-cyan-600 hover:bg-cyan-200'
                      }`}
                    >
                      {isListening && activeField === 'question' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="group">
                    <label htmlFor="symptoms" className="flex items-center text-sm font-bold text-gray-800 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                        <Activity className="w-4 h-4 text-white" />
                      </div>
                      Symptoms or Side Effects
                    </label>
                    <div className="relative">
                      <input
                        id="symptoms"
                        type="text"
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        className="w-full px-5 py-4 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all text-lg"
                        placeholder="dizziness, nausea, headache..."
                      />
                      <button
                        type="button"
                        onClick={() => isListening && activeField === 'symptoms' ? stopListening() : startListening('symptoms')}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                          isListening && activeField === 'symptoms'
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                        }`}
                      >
                        {isListening && activeField === 'symptoms' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="group">
                    <label htmlFor="duration" className="flex items-center text-sm font-bold text-gray-800 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      How Long Has This Been Going On?
                    </label>
                    <div className="relative">
                      <input
                        id="duration"
                        type="text"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full px-5 py-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 outline-none transition-all text-lg"
                        placeholder="2 days, 1 week, just started..."
                      />
                      <button
                        type="button"
                        onClick={() => isListening && activeField === 'duration' ? stopListening() : startListening('duration')}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                          isListening && activeField === 'duration'
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                      >
                        {isListening && activeField === 'duration' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="other-meds" className="flex items-center text-sm font-bold text-gray-800 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                    Other Medications or Supplements
                  </label>
                  <div className="relative">
                    <textarea
                      id="other-meds"
                      value={otherMeds}
                      onChange={(e) => setOtherMeds(e.target.value)}
                      rows={4}
                      className="w-full px-5 py-4 bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-200 rounded-xl focus:ring-4 focus:ring-violet-200 focus:border-violet-500 outline-none transition-all resize-none text-lg"
                      placeholder="Include anything else you're taking, if applicable..."
                    />
                    <button
                      type="button"
                      onClick={() => isListening && activeField === 'otherMeds' ? stopListening() : startListening('otherMeds')}
                      className={`absolute right-3 top-3 p-2 rounded-lg transition-all ${
                        isListening && activeField === 'otherMeds'
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-violet-100 text-violet-600 hover:bg-violet-200'
                      }`}
                    >
                      {isListening && activeField === 'otherMeds' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="group">
                  <label className="flex items-center text-sm font-bold text-gray-800 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                      <Upload className="w-4 h-4 text-white" />
                    </div>
                    Upload Files (optional)
                  </label>
                  <div className="relative border-2 border-dashed border-indigo-300 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 hover:border-indigo-500 transition-all overflow-hidden">
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => setFiles(e.target.files)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="px-8 py-10 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-lg font-semibold text-gray-800 mb-2">
                        Drop files here or click to upload
                      </p>
                      <p className="text-sm text-gray-600">
                        PDF, JPG, PNG, DOC up to 10MB each
                      </p>
                      {files && files.length > 0 && (
                        <div className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-full font-semibold">
                          <CheckCircle className="w-5 h-5" />
                          <span>{files.length} file(s) selected</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-5 px-8 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-3 group"
                >
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      <span>Get Educational Insights</span>
                      <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-10 p-6 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl">
                <div className="flex items-start">
                  <AlertCircle className="w-6 h-6 text-gray-600 mr-4 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-gray-700 leading-relaxed">
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
      </div>
    </Layout>
  );
}
