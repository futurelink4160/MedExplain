import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import Layout from '../components/Layout';
import { Send, Mic, MicOff, AlertCircle, Loader2, MessageSquare, Sparkles, Shield, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'safety_alert' | 'info' | 'warning';
}

interface DocumentMatch {
  id: string;
  content: string;
  similarity: number;
}

export default function AskPharmacist() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        setError('Voice recognition error. Please try again.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `Hello! I'm here to provide educational information about medications, genes, and pharmacogenomics.

**What I can help with:**
- Explaining how medications work
- Describing common side effects
- Discussing genetic factors in drug response
- Providing safety awareness

**Important:** This information is for educational purposes only and is not medical advice. Always consult your licensed healthcare provider for any treatment decisions.

What would you like to learn about today?`,
        type: 'info'
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      setError('Voice recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      setError(null);
      recognitionRef.current.start();
    }
  };

  const checkForSafetyIssues = (query: string): boolean => {
    const safetyKeywords = [
      'chest pain',
      'severe bleeding',
      'trouble breathing',
      'stroke',
      'suicidal',
      'suicide',
      'unconscious',
      'loss of consciousness',
      'severe allergic reaction',
      'anaphylaxis',
      'heart attack',
      'seizure'
    ];

    const lowerQuery = query.toLowerCase();
    return safetyKeywords.some(keyword => lowerQuery.includes(keyword));
  };

  const checkForRestrictedQuery = (query: string): { isRestricted: boolean; type: string } => {
    const lowerQuery = query.toLowerCase();

    if (
      lowerQuery.includes('should i take') ||
      lowerQuery.includes('can i stop') ||
      lowerQuery.includes('increase dose') ||
      lowerQuery.includes('decrease dose') ||
      lowerQuery.includes('change dose') ||
      lowerQuery.includes('what dose')
    ) {
      return { isRestricted: true, type: 'dosing' };
    }

    if (
      lowerQuery.includes('do i have') ||
      lowerQuery.includes('diagnose') ||
      lowerQuery.includes('is this')
    ) {
      return { isRestricted: true, type: 'diagnosis' };
    }

    return { isRestricted: false, type: '' };
  };

  const getAIResponse = async (question: string): Promise<string> => {
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ask-pharmacist`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI assistant');
      }

      const data = await response.json();
      return data.answer || 'I was unable to process that question. Please try again.';
    } catch (err) {
      console.error('Error getting AI response:', err);
      return `I'm having trouble connecting to the assistant right now. Please try again in a moment.`;
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    setError(null);
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (checkForSafetyIssues(input)) {
        const safetyMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `**⚠️ This sounds urgent**

Please seek emergency care or contact a licensed healthcare professional immediately by:
- Calling 911
- Going to the nearest emergency room
- Contacting your doctor's emergency line

This is not medical advice, and I cannot provide emergency care instructions. Your safety is the top priority.`,
          type: 'safety_alert'
        };
        setMessages(prev => [...prev, safetyMessage]);
        setIsLoading(false);
        return;
      }

      const restricted = checkForRestrictedQuery(input);
      if (restricted.isRestricted) {
        const restrictedMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `I understand you have questions about ${restricted.type}, but I can only provide educational information.

**Only your licensed healthcare provider can:**
- Prescribe or adjust medication doses
- Make diagnoses
- Interpret your personal medical tests
- Recommend starting or stopping medications

Please contact your doctor or pharmacist for personalized medical guidance.

I'm happy to provide general educational information about how medications work or common considerations. What would you like to learn?`,
          type: 'warning'
        };
        setMessages(prev => [...prev, restrictedMessage]);
        setIsLoading(false);
        return;
      }

      const response = await getAIResponse(input);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error processing message:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background-main overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyRkI3QTQiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6bTAgNDBjMC02LjYyNyA1LjM3My0xMiAxMi0xMnMxMiA1LjM3MyAxMiAxMi01LjM3MyAxMi0xMiAxMi0xMi01LjM3My0xMi0xMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>

        <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

        <div className="relative max-w-6xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full mb-6 shadow-sm">
              <Shield className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-gray-700">
                Educational Only - Not Medical Advice
              </span>
            </div>

            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center shadow-lg">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary">
                Ask My Pharmacist
              </h1>
            </div>

            <p className="text-lg sm:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
              Get educational information about medications, genes, and pharmacogenomics
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/20 h-[calc(100vh-380px)] min-h-[500px]">
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                    message.role === 'user'
                      ? 'bg-primary text-white shadow-lg'
                      : message.type === 'safety_alert'
                      ? 'bg-red-50 border-l-4 border-status-alert text-red-900 shadow-md'
                      : message.type === 'warning'
                      ? 'bg-amber-50 border-l-4 border-status-warning text-amber-900 shadow-md'
                      : 'bg-white border border-gray-100 text-gray-900 shadow-md'
                  }`}
                >
                  {message.type === 'safety_alert' && (
                    <div className="flex items-center space-x-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <span className="font-bold text-red-800">Safety Alert</span>
                    </div>
                  )}
                  {message.type === 'info' && (
                    <div className="flex items-center space-x-2 mb-3">
                      <Sparkles className="w-5 h-5 text-secondary flex-shrink-0" />
                      <span className="font-bold text-gray-800">Welcome</span>
                    </div>
                  )}
                  {message.type === 'warning' && (
                    <div className="flex items-center space-x-2 mb-3">
                      <BookOpen className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <span className="font-bold text-amber-800">Educational Guidance</span>
                    </div>
                  )}
                  <div className={`prose prose-sm max-w-none ${
                    message.role === 'user'
                      ? 'prose-invert'
                      : 'prose-gray'
                  }`}
                  style={message.role !== 'user' ? {
                    color: '#1f2937',
                    fontSize: '15px',
                    lineHeight: '1.75'
                  } : { fontSize: '15px', lineHeight: '1.65' }}
                  >
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
              ))}
              {isLoading && (
              <div className="flex justify-start animate-fadeIn">
                <div className="bg-white border border-gray-100 rounded-2xl px-6 py-4 shadow-md">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="w-5 h-5 text-secondary animate-spin" />
                    <span className="text-gray-700 font-medium">Thinking...</span>
                  </div>
                </div>
              </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {error && (
              <div className="px-6 py-3 bg-red-50 border-t border-red-200">
                <div className="flex items-center space-x-2 text-red-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            <div className="p-5 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
              <div className="flex items-end space-x-3">
              <button
                onClick={toggleVoiceInput}
                disabled={isLoading}
                className={`p-3.5 rounded-xl transition-all flex-shrink-0 ${
                  isListening
                    ? 'bg-status-alert text-white animate-pulse shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-sm'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={isListening ? 'Stop recording' : 'Start voice input'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <div className="flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading || isListening}
                  placeholder="Ask about medications, genes, or side effects..."
                  className="w-full px-5 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed shadow-sm text-gray-900 placeholder-gray-400"
                />
                <div className="mt-2 flex items-center space-x-1.5 text-xs text-gray-500">
                  <Shield className="w-3 h-3 flex-shrink-0" />
                  <span>Educational purposes only - Always consult your healthcare provider</span>
                </div>
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading || isListening}
                className="p-3.5 bg-primary text-white rounded-xl hover:shadow-xl hover:bg-primary-light transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105 flex-shrink-0"
                title="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
