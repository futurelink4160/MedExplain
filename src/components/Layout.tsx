import { ReactNode, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { LogOut, User, BookmarkCheck, Shield, Home, MessageSquare, FileText, Stethoscope, Clock } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  const isActive = (path: string) => {
    if (path === '/home') {
      return location.pathname === '/home' || location.pathname === '/';
    }
    return location.pathname === path;
  };

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/home" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                MedExplain
              </h1>
            </Link>

{user && (
              <nav className="hidden md:flex items-center space-x-6">
                <Link
                  to="/home"
                  className={`font-medium transition flex items-center space-x-1.5 px-3 py-2 rounded-lg ${
                    isActive('/home')
                      ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-md'
                      : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>
                <Link
                  to="/chat"
                  className={`font-medium transition flex items-center space-x-1.5 px-3 py-2 rounded-lg ${
                    isActive('/chat')
                      ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-md'
                      : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat</span>
                </Link>
                <Link
                  to="/evidence"
                  className={`font-medium transition flex items-center space-x-1.5 px-3 py-2 rounded-lg ${
                    isActive('/evidence')
                      ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-md'
                      : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Evidence</span>
                </Link>
                <Link
                  to="/cases"
                  className={`font-medium transition flex items-center space-x-1.5 px-3 py-2 rounded-lg ${
                    isActive('/cases')
                      ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-md'
                      : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                  }`}
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Ask Pharmacist</span>
                </Link>
                <Link
                  to="/history"
                  className={`font-medium transition flex items-center space-x-1.5 px-3 py-2 rounded-lg ${
                    isActive('/history')
                      ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-md'
                      : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>History</span>
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`font-medium transition flex items-center space-x-1.5 px-3 py-2 rounded-lg ${
                      isActive('/admin')
                        ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-md'
                        : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                )}
              </nav>
            )}

            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700 hidden sm:block">{user.email}</span>
                </button>

                {showDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                      <Link
                        to="/cases"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Stethoscope className="w-4 h-4" />
                        <span>Ask Pharmacist</span>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-2 px-4">
          <p className="text-white text-center text-sm font-medium">
            Educational only. US sources (FDA, CPIC, PharmGKB). Not medical advice.
          </p>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-600">
            © MedExplain 2025. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
