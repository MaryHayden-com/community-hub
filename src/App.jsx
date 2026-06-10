import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from './components/Layout';

const Directory = lazy(() => import('./pages/Directory'));
const CountyPage = lazy(() => import('./pages/CountyPage'));
const TownPage = lazy(() => import('./pages/TownPage'));
const ListingDetail = lazy(() => import('./pages/ListingDetail'));
const Admin = lazy(() => import('./pages/Admin'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Billing = lazy(() => import('./pages/Billing'));
const OwnerDashboard = lazy(() => import('./pages/OwnerDashboard'));
const GroupAdminDashboard = lazy(() => import('./pages/GroupAdminDashboard'));
const Survey = lazy(() => import('./pages/Survey'));
const CalendarView = lazy(() => import('./pages/CalendarView'));
const WhatsOn = lazy(() => import('./pages/WhatsOn'));

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Suspense fallback={
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    }>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Directory />} />
          <Route path="/directory" element={<Directory />} />
          <Route path="/county/:county" element={<CountyPage />} />
          <Route path="/town/:county/:town" element={<TownPage />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/dashboard" element={<OwnerDashboard />} />
          <Route path="/group-dashboard" element={<GroupAdminDashboard />} />
          <Route path="/survey" element={<Survey />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/whats-on" element={<WhatsOn />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App