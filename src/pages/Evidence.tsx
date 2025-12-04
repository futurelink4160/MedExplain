import { useState } from 'react';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { Search, BookOpen, FileText, ExternalLink, Calendar, Database } from 'lucide-react';

interface Document {
  id: string;
  content: string;
  metadata: {
    source?: string;
    blobType?: string;
    line?: number;
    [key: string]: unknown;
  };
  created_at: string;
}

export default function Evidence() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);

  async function handleSearch() {
    if (!searchTerm.trim()) return;

    setSearching(true);
    setSearchPerformed(true);

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('id, content, metadata, created_at')
        .ilike('content', `%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      console.error('Error searching documents:', err);
      setDocuments([]);
    } finally {
      setSearching(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  function isUrl(text: string): boolean {
    return text.startsWith('http://') || text.startsWith('https://');
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 rounded-2xl shadow-2xl p-10 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -ml-16 -mb-16"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Database className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Evidence Base</h1>
                <p className="text-slate-200 text-lg">Search our comprehensive pharmacogenomics knowledge base</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mt-6">
              <h3 className="text-white font-semibold mb-2 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                How to Use This Tool
              </h3>
              <ul className="text-slate-200 text-sm space-y-1 ml-7">
                <li>Enter a medication name, gene symbol, or specific pharmacogenomic term</li>
                <li>Click "Search Evidence" or press Enter to find relevant documents</li>
                <li>Review the results to access detailed pharmacogenomic information</li>
                <li>Click on URLs to access original source materials</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Terms
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter medication, gene, or pharmacogenomic term..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={!searchTerm.trim() || searching}
                className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-slate-700 to-slate-900 text-white font-semibold rounded-xl hover:from-slate-800 hover:to-black focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                {searching ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Search Evidence</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {searchPerformed && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Found <span className="font-semibold mx-1">{documents.length}</span> document{documents.length !== 1 ? 's' : ''} matching "{searchTerm}"
                </p>
                {documents.length > 0 && (
                  <p className="text-xs text-gray-500">Showing most recent 50 results</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {!searchPerformed ? (
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Start Your Search</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Enter a search term above to explore our database of over 18,000 pharmacogenomic documents including guidelines, research papers, and clinical annotations.
            </p>
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Results Found</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-4">
              No documents match your search term "{searchTerm}". Try different keywords or broader search terms.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setDocuments([]);
                setSearchPerformed(false);
              }}
              className="text-slate-700 hover:text-slate-900 font-medium underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <FileText className="w-5 h-5 text-slate-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {isUrl(doc.content.trim()) ? (
                          <a
                            href={doc.content.trim()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium flex items-center group"
                          >
                            <span className="break-all">{doc.content.trim()}</span>
                            <ExternalLink className="w-4 h-4 ml-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        ) : (
                          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                            {doc.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      {doc.metadata.source && (
                        <span className="flex items-center">
                          <span className="font-medium text-gray-700 mr-1">Source:</span>
                          {doc.metadata.source}
                        </span>
                      )}
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(doc.created_at)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 font-mono">
                      ID: {doc.id.substring(0, 8)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
