import { ReactNode, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { LogOut, User, BookmarkCheck, Shield, Home, LayoutDashboard, MessageSquare, FileText, Stethoscope, Clock } from 'lucide-react';

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
      return location.pathname === '/home';
    }
    return location.pathname === path;
  };

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-background-main flex flex-col">
      <header className="sticky top-0 z-50 bg-primary border-b border-primary-dark shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/home" className="flex items-center space-x-3">
              <img
                src="/medexplain_logo.png"
                alt="MedExplain Logo"
                className="h-10 w-10 object-contain"
              />
              <h1 className="text-xl font-bold text-white">
                MedExplain
              </h1>
            </Link>

{user && (
              <nav className="hidden md:flex items-center space-x-2">
                <Link
                  to="/home"
                  className={`font-semibold transition-all flex items-center space-x-1.5 px-4 py-2 rounded-lg ${
                    isActive('/home')
                      ? 'bg-secondary text-white shadow-lg scale-105'
                      : 'text-white hover:bg-white/20 hover:scale-105'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>
                <Link
                  to="/dashboard"
                  className={`font-semibold transition-all flex items-center space-x-1.5 px-4 py-2 rounded-lg ${
                    isActive('/dashboard')
                      ? 'bg-secondary text-white shadow-lg scale-105'
                      : 'text-white hover:bg-white/20 hover:scale-105'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/chat"
                  className={`font-semibold transition-all flex items-center space-x-1.5 px-4 py-2 rounded-lg ${
                    isActive('/chat')
                      ? 'bg-secondary text-white shadow-lg scale-105'
                      : 'text-white hover:bg-white/20 hover:scale-105'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat</span>
                </Link>
                <Link
                  to="/history"
                  className={`font-semibold transition-all flex items-center space-x-1.5 px-4 py-2 rounded-lg ${
                    isActive('/history')
                      ? 'bg-secondary text-white shadow-lg scale-105'
                      : 'text-white hover:bg-white/20 hover:scale-105'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>History</span>
                </Link>
                <Link
                  to="/evidence"
                  className={`font-semibold transition-all flex items-center space-x-1.5 px-4 py-2 rounded-lg ${
                    isActive('/evidence')
                      ? 'bg-secondary text-white shadow-lg scale-105'
                      : 'text-white hover:bg-white/20 hover:scale-105'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Evidence</span>
                </Link>
                <Link
                  to="/cases"
                  className={`font-semibold transition-all flex items-center space-x-1.5 px-4 py-2 rounded-lg ${
                    isActive('/cases')
                      ? 'bg-secondary text-white shadow-lg scale-105'
                      : 'text-white hover:bg-white/20 hover:scale-105'
                  }`}
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Ask Pharmacist</span>
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`font-semibold transition-all flex items-center space-x-1.5 px-4 py-2 rounded-lg ${
                      isActive('/admin')
                        ? 'bg-status-warning text-white shadow-lg scale-105'
                        : 'text-white hover:bg-white/20 hover:scale-105'
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
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-primary-light transition text-white"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm hidden sm:block">{user.email}</span>
                </button>

                {showDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-background-card rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                      <Link
                        to="/cases"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-text-primary hover:bg-gray-100"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Stethoscope className="w-4 h-4" />
                        <span>Ask Pharmacist</span>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-status-alert hover:bg-red-50"
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

        <div className="bg-secondary py-2 px-4">
          <p className="text-white text-center text-sm font-medium">
            Educational only. US sources (FDA, CPIC, PharmGKB). Not medical advice.
          </p>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-primary border-t border-primary-dark mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-300">
            © MedExplain 2025. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
