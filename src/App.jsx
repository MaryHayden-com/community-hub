import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from './components/Layout';
import Directory from './pages/Directory';
import CountyPage from './pages/CountyPage';
import TownPage from './pages/TownPage';
import ListingDetail from './pages/ListingDetail';
import Admin from './pages/Admin';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Billing from './pages/Billing';
import OwnerDashboard from './pages/OwnerDashboard';
import GroupAdminDashboard from './pages/GroupAdminDashboard.jsx';
import Survey from './pages/Survey';
import CalendarView from './pages/CalendarView';

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
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
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