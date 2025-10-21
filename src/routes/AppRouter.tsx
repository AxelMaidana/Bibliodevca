import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar, Header } from '../components/layout/Sidebar';
import { NotificationContainer } from '../components/ui/Notification';
import { Dashboard } from '../pages/Dashboard';
import { Libros } from '../pages/Libros';
import { Socios } from '../pages/Socios';
import { Prestamos } from '../pages/Prestamos';
import { Login } from '../pages/Login';
import { SolicitudSocio } from '../pages/SolicitudSocio';
import { AdminAprobaciones } from '../pages/AdminAprobaciones';
import { CambiarPassword } from '../pages/CambiarPassword';
import { CompletarRegistro } from '../pages/CompletarRegistro';
import { MisPrestamos } from '../pages/MisPrestamos';
// import { Register } from '../pages/Register';
import { NotFound } from '../pages/NotFound';
import { useAuth } from '../hooks/useAuth';

export const AppRouter: React.FC = () => {
  const { firebaseUser, loading, profile } = useAuth();

  const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    if (loading) return <div>Cargando...</div>;
    if (!firebaseUser) return <Navigate to="/login" replace />;
    return children;
  };
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />

        <div className="lg:pl-64">
          <Header />

          <main className="p-6">
            <Routes>
              {/* Públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/solicitud" element={<SolicitudSocio />} />
              <Route path="/completar-registro" element={<CompletarRegistro />} />
              {/* <Route path="/register" element={<Register />} /> */}

              {/* Privadas */}
              <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
              <Route path="/libros" element={<RequireAuth><Libros /></RequireAuth>} />
              {/* Solo bibliotecarios */}
              <Route path="/socios" element={
                <RequireAuth>
                  {profile?.role === 'BIBLIOTECARIO' ? <Socios /> : <Navigate to="/" replace />}
                </RequireAuth>
              } />
              <Route path="/prestamos" element={
                <RequireAuth>
                  {profile?.role === 'BIBLIOTECARIO' ? <Prestamos /> : <Navigate to="/" replace />}
                </RequireAuth>
              } />
              <Route path="/aprobaciones" element={
                <RequireAuth>
                  {profile?.role === 'BIBLIOTECARIO' ? <AdminAprobaciones /> : <Navigate to="/" replace />}
                </RequireAuth>
              } />
              {/* Usuarios logueados */}
              <Route path="/cambiar-password" element={<RequireAuth><CambiarPassword /></RequireAuth>} />
              {/* Solo socios */}
              <Route path="/mis-prestamos" element={
                <RequireAuth>
                  {profile?.role === 'SOCIO' ? <MisPrestamos /> : <Navigate to="/" replace />}
                </RequireAuth>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>

        <NotificationContainer />
      </div>
    </Router>
  );
};
