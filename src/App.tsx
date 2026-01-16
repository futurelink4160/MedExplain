import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { isSupabaseConfigured } from './lib/supabase';
import ProtectedRoute from './components/ProtectedRoute';
import ConfigurationError from './components/ConfigurationError';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import PatientInquiry from './pages/PatientInquiry';
import ClinicalInquiry from './pages/ClinicalInquiry';
import History from './pages/History';
import Evidence from './pages/Evidence';
import AskPharmacist from './pages/AskPharmacist';
import Admin from './pages/Admin';
import Results from './pages/Results';
import ResultsDemo from './pages/ResultsDemo';

function HomeRedirect() {
  return <Navigate to="/home" replace />;
}

function App() {
  if (!isSupabaseConfigured) {
    return <ConfigurationError />;
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient-inquiry"
            element={
              <ProtectedRoute>
                <PatientInquiry />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clinical-inquiry"
            element={
              <ProtectedRoute>
                <ClinicalInquiry />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/evidence"
            element={
              <ProtectedRoute>
                <Evidence />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cases"
            element={
              <ProtectedRoute>
                <AskPharmacist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results-demo"
            element={<ResultsDemo />}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
