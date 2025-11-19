import { useState } from 'react';
import { useAuth } from '../lib/auth';
import Layout from '../components/Layout';
import { Send, Upload, AlertCircle, CheckCircle } from 'lucide-react';

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

      const response = await fetch('YOUR_N8N_WEBHOOK_URL_HERE', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

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

    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting the form');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Side Effects & Medication Questions — Educational Help Form
          </h2>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6 mt-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-blue-900 mb-1">Educational Information Only</h3>
                <p className="text-sm text-blue-800 leading-relaxed">
                  The information you receive from this tool is for general educational purposes only.
                  It is <strong>not</strong> medical advice, diagnosis, or treatment. Always contact a doctor,
                  pharmacist, or qualified healthcare professional for medical decisions or emergencies.
                </p>
              </div>
            </div>
          </div>

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900">Form Submitted Successfully!</h3>
                <p className="text-sm text-green-700 mt-1">
                  Your educational inquiry has been received. You will receive information based on your submission.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="age" className="block text-sm font-semibold text-gray-700 mb-2">
                Your Age <span className="text-red-600">*</span>
              </label>
              <input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                min="0"
                max="120"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                placeholder="Enter your age"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                Who Are You? <span className="text-red-600">*</span>
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition bg-white"
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

            <div>
              <label htmlFor="medication" className="block text-sm font-semibold text-gray-700 mb-2">
                Medication You Want Information About
              </label>
              <input
                id="medication"
                type="text"
                value={medication}
                onChange={(e) => setMedication(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                placeholder="Example: Sertraline, Metformin, Amoxicillin"
              />
            </div>

            <div>
              <label htmlFor="question" className="block text-sm font-semibold text-gray-700 mb-2">
                Your Question or Concern <span className="text-red-600">*</span>
              </label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition resize-none"
                placeholder="Describe your question or what you're curious about"
              />
            </div>

            <div>
              <label htmlFor="symptoms" className="block text-sm font-semibold text-gray-700 mb-2">
                Any Symptoms or Side Effects You Want to Mention (optional)
              </label>
              <input
                id="symptoms"
                type="text"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                placeholder="Example: dizziness, nausea, headache, rash, no symptoms"
              />
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-semibold text-gray-700 mb-2">
                How Long Has This Been Going On? (optional)
              </label>
              <input
                id="duration"
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                placeholder="Example: 2 days, 1 week, just started"
              />
            </div>

            <div>
              <label htmlFor="other-meds" className="block text-sm font-semibold text-gray-700 mb-2">
                Other Medications or Supplements (optional)
              </label>
              <textarea
                id="other-meds"
                value={otherMeds}
                onChange={(e) => setOtherMeds(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition resize-none"
                placeholder="Include anything else you're taking, if applicable"
              />
            </div>

            <div>
              <label htmlFor="file-upload" className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Files (optional)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-purple-400 transition">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                    >
                      <span>Upload files</span>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) => setFiles(e.target.files)}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, JPG, PNG, DOC up to 10MB each
                  </p>
                  {files && files.length > 0 && (
                    <p className="text-sm text-purple-600 font-medium mt-2">
                      {files.length} file(s) selected
                    </p>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Upload related files (prescriptions, notes, reports, if you want)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Get Educational Insights</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 leading-relaxed">
              <strong>Disclaimer:</strong> This tool provides educational information only.
              It does not diagnose conditions, provide medical advice, or replace professional care.
              Always consult a licensed healthcare provider for medical questions or emergencies.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
