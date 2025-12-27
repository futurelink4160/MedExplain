import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import ResultsDisplay from './ResultsDisplay';
import ClinicalResultsDisplay from './ClinicalResultsDisplay';
import { Send, Upload, AlertCircle, CheckCircle, Mic, MicOff, Sparkles, FileText, User, Calendar, Pill, MessageSquare, Activity, Clock, Plus, MicIcon, XCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

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

interface ClinicalSummary {
  patient_profile?: {
    age?: number;
    sex?: string;
    current_medications?: string[];
    symptoms?: string[];
    symptom_duration_days?: number;
    urgency_level?: string;
    emergency_red_flags?: boolean;
    genetic_marker?: string;
  };
  clinical_context?: string[];
  pharmacogenomic_interpretation?: {
    summary?: string;
    relevance?: string;
    clinical_implications?: string[];
    guideline_reference?: string;
  };
  management_considerations?: string[];
}

interface ResponseData {
  response_type: string;
  emergency_detected: boolean;
  urgency_level: string;
  rag_results?: string;
  pgx_results?: PgxResults;
  final_answer_markdown?: string;
  clinical_summary?: string | ClinicalSummary;
  pgx_interpretation?: string;
  clinical_recommendations?: string[];
  disclaimer?: string;
}

interface InquiryFormProps {
  defaultRole?: string;
  pageTitle?: string;
  pageSubtitle?: string;
  allowedRoles?: string[];
}

export default function InquiryForm({ defaultRole = '', pageTitle, pageSubtitle, allowedRoles }: InquiryFormProps) {
  const { user } = useAuth();
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [role, setRole] = useState(defaultRole);
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
  const [isDictatingFullForm, setIsDictatingFullForm] = useState(false);
  const [fullFormTranscript, setFullFormTranscript] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [parsingTranscript, setParsingTranscript] = useState(false);
  const fullFormRecognitionRef = useRef<any>(null);

  useEffect(() => {
    if (defaultRole && !role) {
      setRole(defaultRole);
    }
  }, [defaultRole]);

  useEffect(() => {
    console.log('responseData changed:', responseData ? 'HAS DATA' : 'NULL/UNDEFINED');
    if (responseData) {
      console.log('responseData type:', responseData.response_type);
      console.log('responseData has final_answer_markdown:', !!responseData.final_answer_markdown);
    }
  }, [responseData]);

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

  function clearAllFields() {
    setAge('');
    setGender('');
    setRole(defaultRole);
    setMedication('');
    setQuestion('');
    setSymptoms('');
    setDuration('');
    setOtherMeds('');
    setMedicalHistory('');
    setFiles(null);
    setFullFormTranscript('');
    setError('');
    setSuccess(false);

    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  function startFullFormDictation() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      fullFormRecognitionRef.current = new SpeechRecognition();
      fullFormRecognitionRef.current.continuous = true;
      fullFormRecognitionRef.current.interimResults = true;

      fullFormRecognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setFullFormTranscript(prev => {
          const updated = prev + finalTranscript;
          return updated;
        });
      };

      fullFormRecognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsDictatingFullForm(false);
      };

      fullFormRecognitionRef.current.onend = () => {
        if (isDictatingFullForm) {
          fullFormRecognitionRef.current.start();
        }
      };

      setIsDictatingFullForm(true);
      setFullFormTranscript('');
      fullFormRecognitionRef.current.start();
    } else {
      setError('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
    }
  }

  function stopFullFormDictation() {
    if (fullFormRecognitionRef.current) {
      setIsDictatingFullForm(false);
      fullFormRecognitionRef.current.stop();
    }
  }

  async function parseAndFillForm() {
    if (!fullFormTranscript.trim()) {
      setError('No transcript to parse. Please dictate your information first.');
      return;
    }

    setParsingTranscript(true);
    setError('');

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/parse-dictation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript: fullFormTranscript }),
      });

      if (!response.ok) {
        throw new Error('Failed to parse dictation');
      }

      const data = await response.json();

      if (data.success && data.fields) {
        const fields = data.fields;

        if (fields.age) setAge(fields.age);
        if (fields.gender) setGender(fields.gender);
        if (fields.role && !defaultRole) setRole(fields.role);
        if (fields.medication) setMedication(fields.medication);
        if (fields.question) setQuestion(fields.question);
        if (fields.symptoms) setSymptoms(fields.symptoms);
        if (fields.duration) setDuration(fields.duration);
        if (fields.otherMeds) setOtherMeds(fields.otherMeds);
        if (fields.medicalHistory) setMedicalHistory(fields.medicalHistory);

        setSuccess(true);
        setError('');
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error(data.error || 'Failed to parse transcript');
      }
    } catch (err: any) {
      console.error('Parse error:', err);
      setError(err.message || 'Failed to parse dictation. Please try again.');
    } finally {
      setParsingTranscript(false);
    }
  }

  async function saveQueryToHistory(responseData: ResponseData) {
    if (!user) return;

    try {
      const { error: insertError } = await supabase.from('query_history').insert([
        {
          user_id: user.id,
          age: parseInt(age) || null,
          gender: gender || null,
          role: role || null,
          medication: medication || null,
          question: question || null,
          symptoms: symptoms || null,
          duration: duration || null,
          other_meds: otherMeds || null,
          medical_history: medicalHistory || null,
          response_data: responseData,
        },
      ]);

      if (insertError) {
        console.error('Error saving to history:', insertError);
      } else {
        console.log('Query saved to history successfully');

        const { error: usageError } = await supabase.rpc('increment_query_usage', {
          p_user_id: user.id,
        });

        if (usageError) {
          console.error('Error incrementing query usage:', usageError);
        }
      }
    } catch (err) {
      console.error('Failed to save query to history:', err);
    }
  }

  function handleNewQuery() {
    setResponseData(null);
    setAge('');
    setGender('');
    setRole(defaultRole);
    setMedication('');
    setQuestion('');
    setSymptoms('');
    setDuration('');
    setOtherMeds('');
    setMedicalHistory('');
    setFiles(null);
    setError('');
    setSuccess(false);
    setFullFormTranscript('');
    setIsDictatingFullForm(false);

    if (fullFormRecognitionRef.current) {
      fullFormRecognitionRef.current.stop();
    }

    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';

    window.scrollTo({ top: 0, behavior: 'smooth' });
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

      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://ftlteam4160.app.n8n.cloud/webhook/medexplain-query';

      console.log('=== WEBHOOK REQUEST DEBUG ===');
      console.log('Webhook URL:', webhookUrl);
      console.log('Payload keys:', Object.keys(payload));
      console.log('Payload Age:', payload.Age);
      console.log('Payload Gender:', payload.Gender);
      console.log('Payload Role:', payload['Profession/Role']);
      console.log('Payload Question:', payload['Your Question/Inquiry']);
      console.log('Payload Attachments type:', typeof payload.Attachments);
      console.log('Payload Attachments value:', payload.Attachments);
      console.log('Full payload:', JSON.stringify(payload, null, 2));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600000);

      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        console.log('=== WEBHOOK RESPONSE DEBUG ===');
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.error('=== WEBHOOK ERROR ===');
          console.error('Error status:', response.status);
          console.error('Error response:', errorText);
          console.error('Was trying to send to:', webhookUrl);
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

      if (Array.isArray(data)) {
        console.log('Response is an array, extracting first item');
        if (data.length > 0) {
          data = data[0];
          console.log('Extracted data:', data);
        } else {
          throw new Error('n8n returned empty array');
        }
      }

      if (data.output && typeof data.output === 'string') {
        console.log('Response has "output" field, attempting to unwrap...');
        try {
          const unwrapped = JSON.parse(data.output);
          console.log('Successfully parsed output field as JSON');
          data = unwrapped;
        } catch (parseError) {
          console.log('Output field is not JSON, checking if it is markdown or plain text...');
          if (data.output.trim().startsWith('###') || data.output.trim().startsWith('#')) {
            console.log('Output field contains markdown, treating as final_answer_markdown');
            data.final_answer_markdown = data.output;
            delete data.output;
          } else {
            console.error('Failed to parse output field:', parseError);
            throw new Error('Response wrapped in output field but could not parse it');
          }
        }
      }

      console.log('=== RESPONSE STRUCTURE CHECK ===');
      console.log('- Has final_answer_markdown:', !!data.final_answer_markdown);
      console.log('- Has markdown_answer:', !!data.markdown_answer);
      console.log('- Has pgx_results:', !!data.pgx_results);
      console.log('- Has clinical_summary:', !!data.clinical_summary);
      console.log('- Has pgx_interpretation:', !!data.pgx_interpretation);
      console.log('- Has clinical_recommendations:', !!data.clinical_recommendations);
      console.log('- Has emergency_detected:', !!data.emergency_detected);
      console.log('- Has response_type:', !!data.response_type);
      console.log('- Has urgency_level:', !!data.urgency_level);
      console.log('- Has rag_results:', !!data.rag_results);

      if (data.final_answer_markdown) {
        console.log('final_answer_markdown preview:', data.final_answer_markdown.substring(0, 500));
      }
      if (data.markdown_answer) {
        console.log('markdown_answer preview:', typeof data.markdown_answer === 'string' ? data.markdown_answer.substring(0, 500) : data.markdown_answer);
      }

      if (data.markdown_answer && !data.final_answer_markdown) {
        console.log('Converting markdown_answer to final_answer_markdown');

        if (typeof data.markdown_answer === 'string' && data.markdown_answer.trim().startsWith('{')) {
          try {
            console.log('markdown_answer appears to be JSON, attempting to parse...');
            const parsedMarkdown = JSON.parse(data.markdown_answer);
            console.log('Successfully parsed markdown_answer as JSON:', parsedMarkdown);

            Object.assign(data, parsedMarkdown);
          } catch (e) {
            console.log('Could not parse markdown_answer as JSON, using as-is');
            data.final_answer_markdown = data.markdown_answer;
          }
        } else {
          data.final_answer_markdown = data.markdown_answer;
        }
        delete data.markdown_answer;
      }

      const fixNewlines = (text: string | undefined): string => {
        if (!text) return '';
        return text.replace(/\\n/g, '\n');
      };

      if (data.clinical_summary && typeof data.clinical_summary === 'string') {
        data.clinical_summary = fixNewlines(data.clinical_summary);
      }
      if (data.pgx_interpretation && typeof data.pgx_interpretation === 'string') {
        data.pgx_interpretation = fixNewlines(data.pgx_interpretation);
      }
      if (data.disclaimer && typeof data.disclaimer === 'string') {
        data.disclaimer = fixNewlines(data.disclaimer);
      }
      if (data.final_answer_markdown && typeof data.final_answer_markdown === 'string') {
        data.final_answer_markdown = fixNewlines(data.final_answer_markdown);
      }

      if (data.clinical_summary && typeof data.clinical_summary === 'object' && !data.final_answer_markdown) {
        console.log('clinical_summary is an object, converting to markdown format...');
        let markdown = '';

        const cs = data.clinical_summary;

        if (cs.patient_profile) {
          markdown += `**Patient Profile:**\n`;
          const profile = cs.patient_profile;
          if (profile.age) markdown += `- **Age:** ${profile.age}\n`;
          if (profile.sex) markdown += `- **Gender:** ${profile.sex}\n`;
          if (profile.current_medications && Array.isArray(profile.current_medications)) {
            markdown += `- **Current Medications:** ${profile.current_medications.join(', ')}\n`;
          }
          if (profile.symptoms && Array.isArray(profile.symptoms)) {
            markdown += `- **Current Symptoms:** ${profile.symptoms.join(', ')}\n`;
          }
          if (profile.symptom_duration_days) {
            markdown += `- **Duration of Symptoms:** ${profile.symptom_duration_days} days\n`;
          }
          if (profile.urgency_level) markdown += `- **Urgency Level:** ${profile.urgency_level}\n`;
          if (profile.genetic_marker) markdown += `- **Genetic Marker:** ${profile.genetic_marker}\n`;
          markdown += `\n---\n\n`;
        }

        markdown += `### Pharmacogenomic Context\n\n`;
        if (data.rag_results) {
          markdown += `${data.rag_results}\n\n`;
        }
        if (cs.pharmacogenomic_interpretation) {
          const pgx = cs.pharmacogenomic_interpretation;
          if (pgx.summary) markdown += `${pgx.summary}\n\n`;
          if (pgx.relevance) markdown += `${pgx.relevance}\n\n`;
          if (pgx.clinical_implications && Array.isArray(pgx.clinical_implications)) {
            pgx.clinical_implications.forEach((impl: string) => {
              markdown += `- ${impl}\n`;
            });
            markdown += `\n`;
          }
          if (pgx.guideline_reference) {
            markdown += `**Guideline Reference:** ${pgx.guideline_reference}\n\n`;
          }
        }

        if (cs.clinical_context && Array.isArray(cs.clinical_context)) {
          markdown += `### Clinical Interpretation\n\n`;
          cs.clinical_context.forEach((context: string) => {
            markdown += `${context}\n\n`;
          });
        }

        if (cs.management_considerations && Array.isArray(cs.management_considerations)) {
          markdown += `### Recommendations for Clinical Action\n\n`;
          cs.management_considerations.forEach((rec: string, idx: number) => {
            markdown += `${idx + 1}. ${rec}\n\n`;
          });
        }

        data.final_answer_markdown = markdown;
        console.log('Successfully converted clinical_summary to markdown');
        console.log('Generated markdown preview:', markdown.substring(0, 500));
      }

      if (!data.pgx_results) {
        console.log('Creating empty pgx_results structure');
        data.pgx_results = {
          drug_labels: [],
          genes: [],
          variants: [],
          phenotypes: []
        };
      } else {
        console.log('Validating pgx_results structure...');
        if (!Array.isArray(data.pgx_results.drug_labels)) {
          console.log('Converting drug_labels to array');
          data.pgx_results.drug_labels = data.pgx_results.drug_labels ? [data.pgx_results.drug_labels] : [];
        }
        if (!Array.isArray(data.pgx_results.genes)) {
          console.log('Converting genes to array');
          data.pgx_results.genes = data.pgx_results.genes ? [data.pgx_results.genes] : [];
        }
        if (!Array.isArray(data.pgx_results.variants)) {
          console.log('Converting variants to array');
          data.pgx_results.variants = data.pgx_results.variants ? [data.pgx_results.variants] : [];
        }
        if (!Array.isArray(data.pgx_results.phenotypes)) {
          console.log('Converting phenotypes to array');
          data.pgx_results.phenotypes = data.pgx_results.phenotypes ? [data.pgx_results.phenotypes] : [];
        }
        console.log('After validation, pgx_results:', data.pgx_results);
      }

      if (data.final_answer_markdown && !data.response_type) {
        console.log('Adding default response_type');
        data.response_type = 'CLINICAL_PATIENT_SUMMARY';
      }
      if (data.final_answer_markdown && !data.urgency_level) {
        console.log('Adding default urgency_level');
        data.urgency_level = 'MEDIUM';
      }
      if (data.final_answer_markdown && data.emergency_detected === undefined) {
        console.log('Adding default emergency_detected');
        data.emergency_detected = false;
      }

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
        console.log('Response data being set:', data);
        setResponseData(data);
        console.log('Response data set complete');
        setSuccess(true);

        await saveQueryToHistory(data);

        setTimeout(() => {
          console.log('Scrolling to results, responseData is:', data ? 'present' : 'missing');
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out after 10 minutes. The workflow may still be processing. Please try again or contact support if this persists.');
        }
        throw fetchError;
      }

    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'An error occurred while submitting the form');
    } finally {
      setLoading(false);
    }
  }

  console.log('=== RENDER: responseData status:', responseData ? 'EXISTS' : 'NULL');
  if (responseData) {
    console.log('RENDER: responseData.response_type =', responseData.response_type);
    console.log('RENDER: Will show results div:', true);
  }

  return (
    <div className="min-h-screen bg-background-main py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-secondary text-white rounded-full mb-3 shadow-lg">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">AI-Powered Educational Tool</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            {pageTitle || 'Side Effects & Medication Questions'}
          </h1>
          <p className="text-base text-text-secondary">
            {pageSubtitle || 'Get personalized educational insights about your medications'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-primary p-4">
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

            <div className="bg-blue-50 border-2 border-secondary rounded-xl p-5 mb-6 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                    <MicIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Voice Dictation</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="text-secondary hover:text-secondary-dark text-sm font-semibold flex items-center space-x-1"
                >
                  <span>{showInstructions ? 'Hide' : 'Show'} Instructions</span>
                  {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {showInstructions && (
                <div className="bg-white rounded-lg p-4 mb-4 border border-blue-200">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center">
                    <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
                    How to Use Full-Form Dictation
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Speak naturally and include all the information below. The AI will automatically fill in the form fields for you.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-3 mb-3">
                    <p className="text-sm font-semibold text-gray-800 mb-2">Example Script:</p>
                    <p className="text-sm text-gray-700 italic">
                      "Hi, I'm 45 years old, female, and I'm a patient. I'm taking sertraline and experiencing headaches and dizziness.
                      This has been happening for about 2 weeks. I also take vitamin D supplements. I have a history of anxiety and depression."
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-800">Required Information:</p>
                    <ul className="text-xs text-gray-600 space-y-0.5 ml-4 list-disc">
                      <li>Your age</li>
                      <li>Your role (Patient, Caregiver, Doctor, or Clinician)</li>
                      <li>Your main question or concern</li>
                    </ul>
                    <p className="text-xs font-bold text-gray-800 mt-2">Optional but Helpful:</p>
                    <ul className="text-xs text-gray-600 space-y-0.5 ml-4 list-disc">
                      <li>Gender</li>
                      <li>Medication name</li>
                      <li>Symptoms or side effects</li>
                      <li>How long symptoms have lasted</li>
                      <li>Other medications or supplements</li>
                      <li>Medical history or conditions</li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                {!isDictatingFullForm ? (
                  <button
                    type="button"
                    onClick={startFullFormDictation}
                    className="flex-1 bg-secondary text-white py-3 px-5 rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl hover:bg-secondary-dark transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <Mic className="w-5 h-5" />
                    <span>Start Full Dictation</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopFullFormDictation}
                    className="flex-1 bg-red-600 text-white py-3 px-5 rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 animate-pulse"
                  >
                    <MicOff className="w-5 h-5" />
                    <span>Stop Dictation</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={clearAllFields}
                  className="flex-1 bg-gray-600 text-white py-3 px-5 rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <XCircle className="w-5 h-5" />
                  <span>Clear All Fields</span>
                </button>
              </div>

              {fullFormTranscript && (
                <div className="bg-white rounded-lg p-4 border-2 border-blue-300 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-900 text-sm flex items-center">
                      <Activity className="w-4 h-4 text-blue-600 mr-2" />
                      Live Transcript
                    </h4>
                    {isDictatingFullForm && (
                      <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full animate-pulse font-semibold">
                        Recording...
                      </span>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded p-3 max-h-32 overflow-y-auto">
                    <p className="text-sm text-gray-700">{fullFormTranscript}</p>
                  </div>
                  {!isDictatingFullForm && (
                    <button
                      type="button"
                      onClick={parseAndFillForm}
                      disabled={parsingTranscript}
                      className="mt-3 w-full bg-status-success text-white py-2 px-4 rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {parsingTranscript ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Fill Form with AI</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {isDictatingFullForm && (
                <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800">
                    <strong>Listening:</strong> Speak clearly and naturally. When finished, click "Stop Dictation" and then "Fill Form with AI" to auto-populate the fields.
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="group">
                  <label htmlFor="age" className="flex items-center text-xs font-bold text-gray-800 mb-2">
                    <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                    Your Age <span className="text-status-alert ml-1">*</span>
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
                      className="w-full px-4 py-2.5 bg-blue-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all text-sm font-medium"
                      placeholder="Enter your age"
                    />
                    <button
                      type="button"
                      onClick={() => isListening && activeField === 'age' ? stopListening() : startListening('age')}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                        isListening && activeField === 'age'
                          ? 'bg-status-alert text-white animate-pulse'
                          : 'bg-secondary-light text-white hover:bg-secondary'
                      }`}
                    >
                      {isListening && activeField === 'age' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="gender" className="flex items-center text-xs font-bold text-gray-800 mb-2">
                    <div className="w-6 h-6 bg-secondary rounded-lg flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                    Gender
                  </label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-2.5 bg-blue-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all text-sm font-medium"
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
                    <div className="w-6 h-6 bg-accent rounded-lg flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                      <FileText className="w-3.5 h-3.5 text-white" />
                    </div>
                    Who Are You? <span className="text-status-alert ml-1">*</span>
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-blue-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all text-sm font-medium"
                  >
                    <option value="">Select your role</option>
                    {(!allowedRoles || allowedRoles.includes('Patient')) && <option value="Patient">Patient</option>}
                    {(!allowedRoles || allowedRoles.includes('Caregiver')) && <option value="Caregiver">Caregiver</option>}
                    {(!allowedRoles || allowedRoles.includes('Doctor')) && <option value="Doctor">Doctor</option>}
                    {(!allowedRoles || allowedRoles.includes('Clinician')) && <option value="Clinician">Clinician</option>}
                  </select>
                </div>

                <div className="group">
                  <label htmlFor="medication" className="flex items-center text-xs font-bold text-gray-800 mb-2">
                    <div className="w-6 h-6 bg-status-warning rounded-lg flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
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
                      className="w-full px-4 py-2.5 bg-blue-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all text-sm"
                      placeholder="Example: Sertraline, Metformin, Amoxicillin"
                    />
                    <button
                      type="button"
                      onClick={() => isListening && activeField === 'medication' ? stopListening() : startListening('medication')}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                        isListening && activeField === 'medication'
                          ? 'bg-status-alert text-white animate-pulse'
                          : 'bg-secondary-light text-white hover:bg-secondary'
                      }`}
                    >
                      {isListening && activeField === 'medication' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="group">
                <label htmlFor="question" className="flex items-center text-xs font-bold text-gray-800 mb-2">
                  <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-3.5 h-3.5 text-white" />
                  </div>
                  Your Question or Concern <span className="text-status-alert ml-1">*</span>
                </label>
                <div className="relative">
                  <textarea
                    id="question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    required
                    rows={3}
                    className="w-full px-4 py-2.5 bg-blue-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all resize-none text-sm"
                    placeholder="Describe your question or what you're curious about..."
                  />
                  <button
                    type="button"
                    onClick={() => isListening && activeField === 'question' ? stopListening() : startListening('question')}
                    className={`absolute right-2 top-2 p-1.5 rounded-lg transition-all ${
                      isListening && activeField === 'question'
                        ? 'bg-status-alert text-white animate-pulse'
                        : 'bg-secondary-light text-white hover:bg-secondary'
                    }`}
                  >
                    {isListening && activeField === 'question' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="group">
                  <label htmlFor="symptoms" className="flex items-center text-xs font-bold text-gray-800 mb-2">
                    <div className="w-6 h-6 bg-status-alert rounded-lg flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
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
                      className="w-full px-4 py-2.5 bg-blue-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all text-sm"
                      placeholder="dizziness, nausea, headache..."
                    />
                    <button
                      type="button"
                      onClick={() => isListening && activeField === 'symptoms' ? stopListening() : startListening('symptoms')}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                        isListening && activeField === 'symptoms'
                          ? 'bg-status-alert text-white animate-pulse'
                          : 'bg-secondary-light text-white hover:bg-secondary'
                      }`}
                    >
                      {isListening && activeField === 'symptoms' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="duration" className="flex items-center text-xs font-bold text-gray-800 mb-2">
                    <div className="w-6 h-6 bg-status-success rounded-lg flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
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
                      className="w-full px-4 py-2.5 bg-blue-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all text-sm"
                      placeholder="2 days, 1 week, just started..."
                    />
                    <button
                      type="button"
                      onClick={() => isListening && activeField === 'duration' ? stopListening() : startListening('duration')}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                        isListening && activeField === 'duration'
                          ? 'bg-status-alert text-white animate-pulse'
                          : 'bg-secondary-light text-white hover:bg-secondary'
                      }`}
                    >
                      {isListening && activeField === 'duration' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="group">
                <label htmlFor="other-meds" className="flex items-center text-xs font-bold text-gray-800 mb-2">
                  <div className="w-6 h-6 bg-accent rounded-lg flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
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
                    className="w-full px-4 py-2.5 bg-blue-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all resize-none text-sm"
                    placeholder="Include anything else you're taking, if applicable..."
                  />
                  <button
                    type="button"
                    onClick={() => isListening && activeField === 'otherMeds' ? stopListening() : startListening('otherMeds')}
                    className={`absolute right-2 top-2 p-1.5 rounded-lg transition-all ${
                      isListening && activeField === 'otherMeds'
                        ? 'bg-status-alert text-white animate-pulse'
                        : 'bg-secondary-light text-white hover:bg-secondary'
                    }`}
                  >
                    {isListening && activeField === 'otherMeds' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="group">
                <label htmlFor="medical-history" className="flex items-center text-xs font-bold text-gray-800 mb-2">
                  <div className="w-6 h-6 bg-secondary rounded-lg flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
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
                    className="w-full px-4 py-2.5 bg-blue-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all resize-none text-sm"
                    placeholder="Medical conditions, allergies, surgeries, family history, or other relevant information..."
                  />
                  <button
                    type="button"
                    onClick={() => isListening && activeField === 'medicalHistory' ? stopListening() : startListening('medicalHistory')}
                    className={`absolute right-2 top-2 p-1.5 rounded-lg transition-all ${
                      isListening && activeField === 'medicalHistory'
                        ? 'bg-status-alert text-white animate-pulse'
                        : 'bg-secondary-light text-white hover:bg-secondary'
                    }`}
                  >
                    {isListening && activeField === 'medicalHistory' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="group">
                <label className="flex items-center text-xs font-bold text-gray-800 mb-2">
                  <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                    <Upload className="w-3.5 h-3.5 text-white" />
                  </div>
                  Upload Files (optional)
                </label>
                <div className="relative border-2 border-dashed border-secondary rounded-lg bg-blue-50 hover:border-secondary-dark transition-all overflow-hidden">
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => setFiles(e.target.files)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="px-6 py-6 text-center">
                    <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800 mb-1">
                      Drop files here or click to upload
                    </p>
                    <p className="text-xs text-gray-600">
                      PDF, JPG, PNG, DOC up to 10MB each
                    </p>
                    {files && files.length > 0 && (
                      <div className="mt-3 inline-flex items-center space-x-2 px-3 py-1.5 bg-status-success text-white rounded-full text-sm font-semibold">
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
                className="w-full bg-primary text-white py-3 px-6 rounded-xl font-bold text-base shadow-xl hover:shadow-2xl hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-secondary transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 group"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing... This may take 1-5 minutes</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    <span>Get Educational Insights</span>
                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  </>
                )}
              </button>

              {loading && (
                <div className="mt-3 text-center space-y-2">
                  <p className="text-sm text-gray-600 italic">
                    Please wait while we analyze your query. This typically takes 1-5 minutes.
                  </p>
                  <p className="text-xs text-gray-500">
                    Please do not close or refresh this page. Your results will appear below when ready.
                  </p>
                </div>
              )}
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
          {console.log('=== RENDERING RESULTS SECTION ===')}
          {console.log('User role:', role)}
          {console.log('Response type:', responseData.response_type)}
          {role === 'Doctor' || role === 'Clinician' ? (
            <ClinicalResultsDisplay
              data={responseData}
              onNewQuery={handleNewQuery}
              role={role}
              patientData={{
                age,
                gender,
                role,
                medication,
                question,
                symptoms,
                duration,
                otherMeds,
                medicalHistory
              }}
            />
          ) : (
            <ResultsDisplay
              data={responseData}
              onNewQuery={handleNewQuery}
              patientData={{
                age,
                gender,
                role,
                medication,
                question,
                symptoms,
                duration,
                otherMeds,
                medicalHistory
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
