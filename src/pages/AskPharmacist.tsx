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

  const searchDocuments = async (query: string): Promise<DocumentMatch[]> => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('id, content, metadata')
        .ilike('content', `%${query.toLowerCase()}%`)
        .limit(5);

      if (error) {
        console.error('Error searching documents:', error);
        return [];
      }

      return (data || []).map(doc => ({
        id: doc.id,
        content: doc.content,
        similarity: 0.8
      }));
    } catch (err) {
      console.error('Error in searchDocuments:', err);
      return [];
    }
  };

  const generateResponse = (query: string, matches: DocumentMatch[]): string => {
    if (matches.length === 0) {
      return `I may not have specific information about that in my database yet, but I can provide some general educational guidance.

To get the most accurate and personalized information, I recommend:
- Consulting with your pharmacist or healthcare provider
- Asking about official drug information resources
- Discussing any concerns about your medications

Is there something else I can help explain?`;
    }

    let response = '**Based on educational resources:**\n\n';

    const topMatch = matches[0].content;
    const maxLength = 600;

    if (topMatch.length > maxLength) {
      response += topMatch.substring(0, maxLength) + '...\n\n';
    } else {
      response += topMatch + '\n\n';
    }

    response += `**Would you like to know more about:**\n`;
    response += `- Common side effects\n`;
    response += `- How this medication works\n`;
    response += `- When to contact your doctor\n`;
    response += `- Genetic factors that may affect this medication`;

    return response;
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

      const matches = await searchDocuments(input);
      const response = generateResponse(input, matches);

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
      <div className="max-w-5xl mx-auto px-4 py-8 h-[calc(100vh-200px)] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Ask My Pharmacist
              </h2>
              <p className="text-sm text-gray-600">Educational information about medications and genes</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
            <Shield className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">Educational Only</span>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white'
                      : message.type === 'safety_alert'
                      ? 'bg-red-50 border-2 border-red-500 text-red-900'
                      : message.type === 'warning'
                      ? 'bg-amber-50 border-2 border-amber-400 text-amber-900'
                      : 'bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200 text-gray-800'
                  }`}
                >
                  {message.type === 'safety_alert' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="font-bold">Safety Alert</span>
                    </div>
                  )}
                  {message.type === 'info' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="w-5 h-5 text-teal-600" />
                      <span className="font-bold text-teal-700">Welcome</span>
                    </div>
                  )}
                  {message.type === 'warning' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <BookOpen className="w-5 h-5 text-amber-600" />
                      <span className="font-bold">Educational Guidance</span>
                    </div>
                  )}
                  <div className={`prose prose-sm max-w-none ${message.role === 'user' ? 'prose-invert' : ''}`}>
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200 rounded-2xl px-5 py-3">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-5 h-5 text-teal-600 animate-spin" />
                    <span className="text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div className="px-6 py-3 bg-red-50 border-t border-red-200">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50">
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleVoiceInput}
                disabled={isLoading}
                className={`p-3 rounded-xl transition-all ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={isListening ? 'Stop recording' : 'Start voice input'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading || isListening}
                placeholder="Ask about medications, genes, or side effects..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading || isListening}
                className="p-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl hover:from-teal-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                title="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-2 flex items-center justify-center space-x-1 text-xs text-gray-500">
              <Shield className="w-3 h-3" />
              <span>Educational purposes only - Always consult your healthcare provider</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
