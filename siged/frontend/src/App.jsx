import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Instituciones from './pages/Instituciones';
import MisInstituciones from './pages/MisInstituciones';
import DashboardInstitucion from './pages/DashboardInstitucion';
import PlanesEstudio from './pages/PlanesEstudio';
import GradosEscolares from './pages/GradosEscolares';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instituciones"
            element={
              <ProtectedRoute roles={['ADMINISTRADOR']}>
                <Instituciones />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mis-instituciones"
            element={
              <ProtectedRoute roles={['AUTORIDAD_ACADEMICA']}>
                <MisInstituciones />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instituciones/:institucionId"
            element={
              <ProtectedRoute roles={['AUTORIDAD_ACADEMICA']}>
                <DashboardInstitucion />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instituciones/:institucionId/planes"
            element={
              <ProtectedRoute roles={['AUTORIDAD_ACADEMICA']}>
                <PlanesEstudio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instituciones/:institucionId/planes/:planId/grados"
            element={
              <ProtectedRoute roles={['AUTORIDAD_ACADEMICA']}>
                <GradosEscolares />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
