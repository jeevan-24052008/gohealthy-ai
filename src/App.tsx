import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AuthModal from './components/AuthModal';
import Home from './pages/Home';
import SymptomChecker from './pages/SymptomChecker';
import Results from './pages/Results';
import HealthScore from './pages/HealthScore';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import { AuthProvider, useAuth } from './context/AuthContext';

function AuthRedirectHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const state = location.state as { requireAuth?: boolean; from?: Location } | null;

  useEffect(() => {
    if (state?.requireAuth && !session) {
      setShowModal(true);
    }
  }, [state, session]);

  useEffect(() => {
    if (session && state?.from) {
      navigate((state.from as any).pathname, { replace: true });
    }
  }, [session, state, navigate]);

  if (!showModal) return null;

  return <AuthModal onClose={() => setShowModal(false)} />;
}

function AppRoutes() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <AuthRedirectHandler />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/health-score" element={<HealthScore />} />
          <Route
            path="/symptom-checker"
            element={
              <ProtectedRoute>
                <SymptomChecker />
              </ProtectedRoute>
            }
          />
          <Route path="/results" element={<Results />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
