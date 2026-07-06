import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SuperAdminLayout } from './layouts/SuperAdminLayout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Users } from './pages/Users';
import { Merchants } from './pages/Merchants';
import Orders from './pages/Orders';
import { Zones } from './pages/Zones';
import { Settings } from './pages/Settings';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Routes protégées */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<SuperAdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="merchants" element={<Merchants />} />
              <Route path="orders" element={<Orders />} />
              <Route path="zones" element={<Zones />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
