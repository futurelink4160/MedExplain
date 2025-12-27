import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
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
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
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
