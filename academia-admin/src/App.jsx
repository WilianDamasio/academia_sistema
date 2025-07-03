import { AuthProvider, useAuth } from '@/contexts/AuthContext'; // Importe o Provider
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/components/LoginPage';
import Dashboard from '@/components/Dashboard';
import './App.css'

// Componente para proteger rotas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // Pode mostrar um spinner/loading aqui
    return <div>A carregar...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppContent() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/*" // Qualquer outra rota
          element={
            <ProtectedRoute>
              <Dashboard /> {/* Ou o seu layout principal */}
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

// O seu componente principal que envolve tudo
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;