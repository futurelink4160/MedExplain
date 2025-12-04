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
    pdf?: {
      info?: {
        Title?: string;
        Author?: string;
      };
      metadata?: {
        _metadata?: {
          'dc:title'?: string;
        };
      };
    };
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

  function getDocumentTitle(doc: Document): string {
    if (doc.metadata.pdf?.metadata?._metadata?.['dc:title']) {
      return doc.metadata.pdf.metadata._metadata['dc:title'];
    }
    if (doc.metadata.pdf?.info?.Title) {
      return doc.metadata.pdf.info.Title;
    }
    return 'Pharmacogenomics Document';
  }

  function getDocumentType(doc: Document): string {
    if (doc.metadata.blobType === 'application/pdf') return 'PDF';
    if (doc.metadata.blobType === 'application/json') return 'Data';
    return 'Document';
  }

  function highlightText(text: string, searchTerm: string): JSX.Element {
    if (!searchTerm.trim()) return <>{text}</>;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-yellow-200 text-gray-900 px-1 rounded">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-1 mb-8">
            <div className="bg-white rounded-[22px] p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-10 -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-10 -ml-16 -mb-16"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Database className="w-9 h-9 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                      Evidence Base
                    </h1>
                    <p className="text-gray-700 text-lg">Search our comprehensive pharmacogenomics knowledge base</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-purple-100">
                  <h3 className="text-gray-900 font-bold mb-3 flex items-center text-lg">
                    <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
                    How to Use This Tool
                  </h3>
                  <ul className="text-gray-700 text-sm space-y-2 ml-7">
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      <span>Enter a medication name, gene symbol, or specific pharmacogenomic term</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      <span>Click "Search Evidence" or press Enter to find relevant documents</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      <span>Review the results to access detailed pharmacogenomic information</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      <span>Click on URLs to access original source materials</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Search Terms
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter medication, gene, or pharmacogenomic term..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition text-gray-900 placeholder-gray-400 bg-white"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  disabled={!searchTerm.trim() || searching}
                  className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg transform hover:scale-105 flex items-center justify-center space-x-2"
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
              <div className="mt-6 pt-6 border-t border-purple-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-700 flex items-center font-medium">
                    <FileText className="w-4 h-4 mr-2 text-purple-600" />
                    Found <span className="font-bold mx-1 text-purple-600">{documents.length}</span> document{documents.length !== 1 ? 's' : ''} matching "{searchTerm}"
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
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Start Your Search</h3>
              <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                Enter a search term above to explore our database of over 18,000 pharmacogenomic documents including guidelines, research papers, and clinical annotations.
              </p>
            </div>
          ) : documents.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Results Found</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6 leading-relaxed">
                No documents match your search term "{searchTerm}". Try different keywords or broader search terms.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDocuments([]);
                  setSearchPerformed(false);
                }}
                className="text-purple-600 hover:text-purple-800 font-semibold underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="group bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border border-purple-100 hover:border-purple-300 transform hover:-translate-y-1"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform">
                          <FileText className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              {getDocumentTitle(doc)}
                            </h3>
                            <span className="px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold rounded-lg">
                              {getDocumentType(doc)}
                            </span>
                          </div>
                          {doc.metadata.pdf?.info?.Author && (
                            <p className="text-sm text-gray-600 mb-3">
                              By {doc.metadata.pdf.info.Author}
                            </p>
                          )}
                          {isUrl(doc.content.trim()) ? (
                            <a
                              href={doc.content.trim()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-purple-600 hover:underline font-medium flex items-center group/link transition-colors"
                            >
                              <span className="break-all">{doc.content.trim()}</span>
                              <ExternalLink className="w-4 h-4 ml-2 flex-shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                            </a>
                          ) : (
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                              {highlightText(doc.content, searchTerm)}
                            </p>
                          )}
                          {doc.metadata.source && isUrl(doc.metadata.source) && (
                            <div className="mt-3 pt-3 border-t border-purple-100">
                              <p className="text-xs text-gray-600 mb-1 font-semibold">Source Article:</p>
                              <a
                                href={doc.metadata.source}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-purple-600 hover:underline text-sm font-medium flex items-center group/link transition-colors"
                              >
                                <span className="break-all">{doc.metadata.source}</span>
                                <ExternalLink className="w-4 h-4 ml-2 flex-shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-purple-100">
                      <div className="flex items-center space-x-4 text-xs text-gray-600">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1 text-purple-500" />
                          {formatDate(doc.created_at)}
                        </span>
                        {doc.metadata.pdf?.info?.Title && (
                          <span className="flex items-center text-gray-500">
                            <span className="mr-1">Pages:</span>
                            {doc.metadata.pdf.totalPages || 'N/A'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-purple-400 font-mono">
                        ID: {doc.id.substring(0, 8)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
