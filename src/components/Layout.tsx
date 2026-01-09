import { ReactNode, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { LogOut, User, BookmarkCheck, Shield, Home, LayoutDashboard, MessageSquare, FileText, Stethoscope, Clock, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
          <div className="flex justify-between items-center h-16 gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {user && (
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="md:hidden text-white p-2 rounded-lg hover:bg-primary-light transition-all active:scale-95 flex-shrink-0"
                  aria-label="Toggle mobile menu"
                  type="button"
                >
                  {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              )}
              <Link to="/home" className="flex items-center gap-2 min-w-0">
                <img
                  src="/medexplain_logo_updated.png"
                  alt="MedExplain Logo"
                  className="h-10 w-10 object-contain flex-shrink-0"
                />
                <h1 className="text-lg sm:text-xl font-bold text-white truncate">
                  MedExplain
                </h1>
              </Link>
            </div>

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
                  to="/chat"
                  className={`font-semibold transition-all flex items-center space-x-1.5 px-4 py-2 rounded-lg ${
                    isActive('/chat')
                      ? 'bg-secondary text-white shadow-lg scale-105'
                      : 'text-white hover:bg-white/20 hover:scale-105'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>New Inquiry</span>
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
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary-light transition-all text-white active:scale-95"
                  type="button"
                  aria-label="User menu"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm hidden sm:block truncate max-w-[150px]">{user.email}</span>
                </button>

                {showDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-background-card rounded-lg shadow-lg border border-gray-200 py-1 z-20">
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

          {user && showMobileMenu && (
            <>
              <div
                className="fixed inset-0 bg-black/50 z-30 md:hidden"
                onClick={() => setShowMobileMenu(false)}
              />
              <div className="absolute top-16 left-0 right-0 bg-primary border-b border-primary-dark shadow-xl z-40 md:hidden animate-in slide-in-from-top">
                <nav className="flex flex-col p-4 space-y-2">
                  <Link
                    to="/home"
                    className={`font-semibold transition-all flex items-center space-x-2 px-4 py-3 rounded-lg ${
                      isActive('/home')
                        ? 'bg-secondary text-white shadow-lg'
                        : 'text-white hover:bg-white/20'
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Home className="w-5 h-5" />
                    <span>Home</span>
                  </Link>
                  <Link
                    to="/chat"
                    className={`font-semibold transition-all flex items-center space-x-2 px-4 py-3 rounded-lg ${
                      isActive('/chat')
                        ? 'bg-secondary text-white shadow-lg'
                        : 'text-white hover:bg-white/20'
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>New Inquiry</span>
                  </Link>
                  <Link
                    to="/history"
                    className={`font-semibold transition-all flex items-center space-x-2 px-4 py-3 rounded-lg ${
                      isActive('/history')
                        ? 'bg-secondary text-white shadow-lg'
                        : 'text-white hover:bg-white/20'
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Clock className="w-5 h-5" />
                    <span>History</span>
                  </Link>
                  <Link
                    to="/evidence"
                    className={`font-semibold transition-all flex items-center space-x-2 px-4 py-3 rounded-lg ${
                      isActive('/evidence')
                        ? 'bg-secondary text-white shadow-lg'
                        : 'text-white hover:bg-white/20'
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <FileText className="w-5 h-5" />
                    <span>Evidence</span>
                  </Link>
                  <Link
                    to="/cases"
                    className={`font-semibold transition-all flex items-center space-x-2 px-4 py-3 rounded-lg ${
                      isActive('/cases')
                        ? 'bg-secondary text-white shadow-lg'
                        : 'text-white hover:bg-white/20'
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Stethoscope className="w-5 h-5" />
                    <span>Ask Pharmacist</span>
                  </Link>
                  <Link
                    to="/dashboard"
                    className={`font-semibold transition-all flex items-center space-x-2 px-4 py-3 rounded-lg ${
                      isActive('/dashboard')
                        ? 'bg-secondary text-white shadow-lg'
                        : 'text-white hover:bg-white/20'
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className={`font-semibold transition-all flex items-center space-x-2 px-4 py-3 rounded-lg ${
                        isActive('/admin')
                          ? 'bg-status-warning text-white shadow-lg'
                          : 'text-white hover:bg-white/20'
                      }`}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <Shield className="w-5 h-5" />
                      <span>Admin</span>
                    </Link>
                  )}
                  <div className="border-t border-white/20 my-2"></div>
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      handleSignOut();
                    }}
                    className="flex items-center space-x-2 px-4 py-3 text-white hover:bg-red-600/20 rounded-lg transition font-semibold"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </nav>
              </div>
            </>
          )}
        </div>

        <div className="bg-secondary py-2 px-4">
          <p className="text-white text-center text-sm font-medium">
            Educational only, Not medical advice
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
