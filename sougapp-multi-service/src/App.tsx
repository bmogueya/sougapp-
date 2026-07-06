import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

const SuperAdminLayout = lazy(() => import('./layouts/SuperAdminLayout').then(m => ({ default: m.SuperAdminLayout })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Users = lazy(() => import('./pages/Users').then(m => ({ default: m.Users })));
const Merchants = lazy(() => import('./pages/Merchants').then(m => ({ default: m.Merchants })));
const Orders = lazy(() => import('./pages/Orders'));
const Zones = lazy(() => import('./pages/Zones').then(m => ({ default: m.Zones })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const Modules = lazy(() => import('./pages/Modules').then(m => ({ default: m.Modules })));
const Drivers = lazy(() => import('./pages/Drivers').then(m => ({ default: m.Drivers })));
const Finance = lazy(() => import('./pages/Finance').then(m => ({ default: m.Finance })));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Routes protégées */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Suspense fallback={<div className="min-h-screen bg-bg flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}><SuperAdminLayout /></Suspense>}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="drivers" element={<Drivers />} />
              <Route path="merchants" element={<Merchants />} />
              <Route path="orders" element={<Orders />} />
              <Route path="zones" element={<Zones />} />
              <Route path="modules" element={<Modules />} />
              <Route path="finance" element={<Finance />} />
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
