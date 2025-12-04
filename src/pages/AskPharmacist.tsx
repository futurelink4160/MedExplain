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

  const extractKeywords = (query: string): { drugs: string[]; genes: string[] } => {
    const words = query.toLowerCase().split(/\s+/);
    const commonGenes = ['cyp2d6', 'cyp2c19', 'cyp2c9', 'cyp3a4', 'cyp3a5', 'slco1b1', 'vkorc1', 'dpyd', 'tpmt', 'ugt1a1'];

    const foundGenes = words.filter(word =>
      commonGenes.some(gene => word.includes(gene) || gene.includes(word))
    );

    const drugKeywords = words.filter(word => word.length > 3);

    return { drugs: drugKeywords, genes: foundGenes };
  };

  const searchDocuments = async (query: string): Promise<DocumentMatch[]> => {
    try {
      const keywords = extractKeywords(query);
      const allMatches: DocumentMatch[] = [];

      if (keywords.drugs.length > 0 || keywords.genes.length > 0) {
        const { data: drugData } = await supabase
          .from('drugs')
          .select('name, trade_names, generic_names')
          .or(keywords.drugs.map(drug => `name.ilike.%${drug}%,trade_names.ilike.%${drug}%,generic_names.ilike.%${drug}%`).join(','))
          .limit(3);

        const { data: geneData } = await supabase
          .from('genes')
          .select('symbol, name')
          .or(keywords.genes.map(gene => `symbol.ilike.%${gene}%`).join(','))
          .limit(3);

        if (drugData && drugData.length > 0) {
          const drugNames = drugData.map(d => d.name).join(', ');
          allMatches.push({
            id: 'drug-info',
            content: `**Drug Information Found:**\n\nThe following medications were found: ${drugNames}.\n\nThese medications may have pharmacogenomic associations that affect how they work in your body.`,
            similarity: 0.9
          });

          const drugName = drugData[0].name;
          const { data: effectsData } = await supabase
            .from('pgx_variant_effects')
            .select('drug_name, gene_symbol, significance, notes, sentence')
            .ilike('drug_name', `%${drugName}%`)
            .limit(5);

          if (effectsData && effectsData.length > 0) {
            const uniqueGenes = [...new Set(effectsData.map(e => e.gene_symbol))];
            let effectsContent = `**Pharmacogenomic Information for ${drugName}:**\n\n`;
            effectsContent += `This medication has known interactions with genes: **${uniqueGenes.join(', ')}**.\n\n`;

            effectsData.slice(0, 3).forEach(effect => {
              if (effect.sentence) {
                effectsContent += `- ${effect.sentence}\n`;
              } else if (effect.notes) {
                effectsContent += `- ${effect.notes}\n`;
              }
            });

            effectsContent += `\n**Clinical Significance:** Genetic variations in these genes may affect how your body processes this medication, potentially influencing effectiveness and side effects.`;

            allMatches.push({
              id: 'effects-info',
              content: effectsContent,
              similarity: 0.95
            });
          }
        }

        if (geneData && geneData.length > 0) {
          const geneSymbols = geneData.map(g => g.symbol).join(', ');
          allMatches.push({
            id: 'gene-info',
            content: `**Gene Information Found:**\n\nGenes identified: ${geneSymbols}.\n\nThese genes encode enzymes that metabolize medications. Variations in these genes can affect drug response.`,
            similarity: 0.9
          });
        }
      }

      const { data: docData } = await supabase
        .from('documents')
        .select('id, content, metadata')
        .textSearch('content', query.split(' ').join(' | '))
        .limit(3);

      if (docData && docData.length > 0) {
        docData.forEach(doc => {
          allMatches.push({
            id: doc.id,
            content: doc.content,
            similarity: 0.85
          });
        });
      }

      return allMatches;
    } catch (err) {
      console.error('Error in searchDocuments:', err);
      return [];
    }
  };

  const generateResponse = (query: string, matches: DocumentMatch[]): string => {
    if (matches.length === 0) {
      return `I don't have specific information about that in my database yet.

To get accurate information, I recommend:
- Consulting with your pharmacist or healthcare provider
- Asking about official drug information resources
- Discussing any concerns about your medications

Try asking about specific medications (e.g., "warfarin", "clopidogrel") or genes (e.g., "CYP2D6", "CYP2C19").`;
    }

    let response = '';

    matches.forEach((match, index) => {
      if (index > 0) response += '\n\n---\n\n';

      const maxLength = 800;
      if (match.content.length > maxLength) {
        response += match.content.substring(0, maxLength) + '...';
      } else {
        response += match.content;
      }
    });

    response += `\n\n---\n\n**Important Reminder:**\n`;
    response += `This information is for educational purposes only. Genetic testing results should be interpreted by a qualified healthcare provider. Always consult your doctor or pharmacist before making any changes to your medications.`;

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
      <div className="min-h-[calc(100vh-200px)] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4YjViZjYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6bTAgNDBjMC02LjYyNyA1LjM3My0xMiAxMi0xMnMxMiA1LjM3MyAxMiAxMi01LjM3MyAxMi0xMiAxMi0xMi01LjM3My0xMi0xMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>

        <div className="relative max-w-5xl mx-auto px-4 pt-8 pb-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full mb-4 shadow-sm">
              <Shield className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">
                Educational Only - Not Medical Advice
              </span>
            </div>

            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Ask My Pharmacist
              </h1>
            </div>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-2">
              Get educational information about medications, genes, and pharmacogenomics
            </p>

            <p className="text-sm text-gray-500 italic">
              Ask questions by typing or using voice input
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-purple-100 h-[calc(100vh-480px)] min-h-[400px]">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-md ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white'
                      : message.type === 'safety_alert'
                      ? 'bg-red-50 border-2 border-red-500 text-red-900'
                      : message.type === 'warning'
                      ? 'bg-amber-50 border-2 border-amber-400 text-amber-900'
                      : 'bg-white border border-purple-100 text-gray-800'
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
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <span className="font-bold text-purple-700">Welcome</span>
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
                <div className="bg-white border border-purple-100 rounded-2xl px-5 py-3 shadow-md">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
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

            <div className="p-4 border-t border-purple-100 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
              <div className="flex items-center space-x-2">
              <button
                onClick={toggleVoiceInput}
                disabled={isLoading}
                className={`p-3 rounded-xl transition-all ${
                  isListening
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-purple-200 shadow-sm'
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
                className="flex-1 px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed shadow-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading || isListening}
                className="p-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105"
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
      </div>
    </Layout>
  );
}
