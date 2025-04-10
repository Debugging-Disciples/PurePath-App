import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AuthProvider, { useAuth } from './utils/auth';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from '@/hooks/use-toast';

// Import all pages
import Navbar from '@/components/Navbar';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import Community from '@/pages/Community';
import Meditations from '@/pages/Meditations';
import Analytics from '@/pages/Analytics';
import MapPage from '@/pages/Map';
import Journal from '@/pages/Journal';
import JournalEntries from '@/pages/JournalEntries';
import Challenges from '@/pages/Challenges';
import Achievements from '@/pages/Achievements';
import Referrals from '@/pages/Referrals';
import Friends from '@/pages/Friends';
import Admin from '@/pages/Admin';
import Goodbye from '@/pages/Goodbye';
import NotFound from '@/pages/NotFound';

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

const queryClient = new QueryClient()

function AuthWrapper({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { currentUser, isLoading, isAdmin } = useAuth();
  const { toast } = useToast();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setHasCheckedAuth(true);
    }
  }, [isLoading]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!hasCheckedAuth) {
    return null;
  }

  if (!currentUser) {
    toast({
      title: "Unauthorized",
      description: "You must be logged in to view this page.",
    })
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    toast({
      title: "Unauthorized",
      description: "You do not have permission to view this page.",
    })
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <AuthWrapper>
              <Dashboard />
            </AuthWrapper>
          } />
          
          <Route path="/profile" element={
            <AuthWrapper>
              <Profile />
            </AuthWrapper>
          } />
          
          <Route path="/community" element={
            <AuthWrapper>
              <Community />
            </AuthWrapper>
          } />
          
          <Route path="/meditations" element={
            <AuthWrapper>
              <Meditations />
            </AuthWrapper>
          } />
          
          <Route path="/analytics" element={
            <AuthWrapper>
              <Analytics />
            </AuthWrapper>
          } />
          
          <Route path="/map" element={
            <AuthWrapper>
              <MapPage />
            </AuthWrapper>
          } />
          
          <Route path="/journal" element={
            <AuthWrapper>
              <Journal />
            </AuthWrapper>
          } />
          
          <Route path="/journal/entries" element={
            <AuthWrapper>
              <JournalEntries />
            </AuthWrapper>
          } />
          
          <Route path="/challenges" element={
            <AuthWrapper>
              <Challenges />
            </AuthWrapper>
          } />
          
          <Route path="/achievements" element={
            <AuthWrapper>
              <Achievements />
            </AuthWrapper>
          } />
          
          <Route path="/referrals" element={
            <AuthWrapper>
              <Referrals />
            </AuthWrapper>
          } />
          
          <Route path="/friends" element={
            <AuthWrapper>
              <Friends />
            </AuthWrapper>
          } />
          
          {/* Admin route */}
          <Route path="/admin" element={
            <AuthWrapper adminOnly>
              <Admin />
            </AuthWrapper>
          } />
          
          {/* Misc routes */}
          <Route path="/goodbye" element={<Goodbye />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
      <Toaster />
    </Router>
  );
}

export default App;
