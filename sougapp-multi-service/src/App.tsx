import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/Toast';

const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const SuperAdminLayout = lazy(() => import('./layouts/SuperAdminLayout').then(m => ({ default: m.SuperAdminLayout })));
const MerchantLayout = lazy(() => import('./layouts/MerchantLayout').then(m => ({ default: m.MerchantLayout })));

const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Users = lazy(() => import('./pages/Users').then(m => ({ default: m.Users })));
const Merchants = lazy(() => import('./pages/Merchants').then(m => ({ default: m.Merchants })));
const Orders = lazy(() => import('./pages/Orders'));
const Zones = lazy(() => import('./pages/Zones').then(m => ({ default: m.Zones })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const Modules = lazy(() => import('./pages/Modules').then(m => ({ default: m.Modules })));
const Drivers = lazy(() => import('./pages/Drivers').then(m => ({ default: m.Drivers })));
const Finance = lazy(() => import('./pages/Finance').then(m => ({ default: m.Finance })));
const Promotions = lazy(() => import('./pages/Promotions').then(m => ({ default: m.Promotions })));
const Dispatch = lazy(() => import('./pages/Dispatch').then(m => ({ default: m.Dispatch })));
const MerchantDashboard = lazy(() => import('./pages/merchant/Dashboard').then(m => ({ default: m.MerchantDashboard })));
const MerchantProducts = lazy(() => import('./pages/merchant/Products').then(m => ({ default: m.MerchantProducts })));
const MerchantOrders = lazy(() => import('./pages/merchant/Orders').then(m => ({ default: m.MerchantOrders })));
const MerchantCategories = lazy(() => import('./pages/merchant/Categories').then(m => ({ default: m.MerchantCategories })));
const MerchantSettings = lazy(() => import('./pages/merchant/Settings').then(m => ({ default: m.MerchantSettings })));

// ... imports existants
const ClientLayout = lazy(() => import('./layouts/ClientLayout').then(m => ({ default: m.ClientLayout })));
const ClientHome = lazy(() => import('./pages/client/Home').then(m => ({ default: m.ClientHome })));
const ClientStoreView = lazy(() => import('./pages/client/StoreView').then(m => ({ default: m.ClientStoreView })));
const ClientCart = lazy(() => import('./pages/client/Cart').then(m => ({ default: m.ClientCart })));
const ClientSearch = lazy(() => import('./pages/client/Search').then(m => ({ default: m.ClientSearch })));
const ClientProfile = lazy(() => import('./pages/client/Profile').then(m => ({ default: m.ClientProfile })));

const DriverLayout = lazy(() => import('./layouts/DriverLayout').then(m => ({ default: m.DriverLayout })));
const DriverDashboard = lazy(() => import('./pages/driver/Dashboard').then(m => ({ default: m.DriverDashboard })));
const DriverHistory = lazy(() => import('./pages/driver/History').then(m => ({ default: m.DriverHistory })));
const DriverProfile = lazy(() => import('./pages/driver/Profile').then(m => ({ default: m.DriverProfile })));

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Si l'utilisateur est connecté et essaie d'accéder à /login, on le redirige selon son rôle
  if (user && location.pathname === '/login') {
    if (user.role === 'super_admin') return <Navigate to="/" replace />;
    if (user.role === 'merchant') return <Navigate to="/merchant" replace />;
    if (user.role === 'customer') return <Navigate to="/app" replace />;
    if (user.role === 'driver') return <Navigate to="/driver" replace />;
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Routes Client (End User) */}
        <Route path="/app" element={
          <Suspense fallback={<div className="min-h-screen bg-bg flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
            <ClientLayout />
          </Suspense>
        }>
          <Route index element={<ClientHome />} />
          <Route path="search" element={<ClientSearch />} />
          <Route path="store/:id" element={<ClientStoreView />} />
          <Route path="cart" element={<ClientCart />} />
          <Route path="profile" element={<ClientProfile />} />
          <Route path="*" element={<ClientHome />} />
        </Route>

        {/* Routes protégées - Super Admin */}
        <Route element={<ProtectedRoute allowedRoles={['super_admin', 'dispatcher']} />}>
          <Route path="/" element={
            <Suspense fallback={<div className="min-h-screen bg-bg flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
              <SuperAdminLayout />
            </Suspense>
          }>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="drivers" element={<Drivers />} />
            <Route path="merchants" element={<Merchants />} />
            <Route path="orders" element={<Orders />} />
            <Route path="dispatch" element={<Dispatch />} />
            <Route path="promotions" element={<Promotions />} />
            <Route path="zones" element={<Zones />} />
            <Route path="modules" element={<Modules />} />
            <Route path="finance" element={<Finance />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Routes protégées - Merchant */}
        <Route element={<ProtectedRoute allowedRoles={['merchant']} />}>
          <Route path="/merchant" element={
            <Suspense fallback={<div className="min-h-screen bg-bg flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
              <MerchantLayout />
            </Suspense>
          }>
            <Route index element={<MerchantDashboard />} />
            <Route path="products" element={<MerchantProducts />} />
            <Route path="categories" element={<MerchantCategories />} />
            <Route path="orders" element={<MerchantOrders />} />
            <Route path="settings" element={<MerchantSettings />} />
          </Route>
        </Route>

        {/* Routes protégées - Driver */}
        <Route element={<ProtectedRoute allowedRoles={['driver']} />}>
          <Route path="/driver" element={
            <Suspense fallback={<div className="min-h-screen bg-bg flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
              <DriverLayout />
            </Suspense>
          }>
            <Route index element={<DriverDashboard />} />
            <Route path="history" element={<DriverHistory />} />
            <Route path="profile" element={<DriverProfile />} />
          </Route>
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function Root() {
  return (
    <Sentry.ErrorBoundary fallback={<div className="p-8 text-center text-text"><h2 className="text-lg font-medium mb-2">Une erreur est survenue</h2><p className="text-muted">Veuillez rafraîchir la page.</p></div>}>
      <AuthProvider>
      <BrowserRouter>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:outline-2 focus:outline-primary"
        >
          Aller au contenu principal
        </a>
        <ToastProvider>
          <App />
        </ToastProvider>
      </BrowserRouter>
    </AuthProvider>
    </Sentry.ErrorBoundary>
  );
}
