
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./utils/auth";
import AuthWrapper from "./components/AuthWrapper";
import Friends from "./pages/Friends";
import Navbar from "./components/Navbar";

// Import all the page components
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Community from "./pages/Community";
import Meditations from "./pages/Meditations";
import Analytics from "./pages/Analytics";
import MapPage from "./pages/Map"; // Renamed to avoid conflict with JS Map
import Journal from "./pages/Journal";
import JournalEntries from "./pages/JournalEntries";
import Challenges from "./pages/Challenges";
import Achievements from "./pages/Achievements";
import Referrals from "./pages/Referrals";
import Admin from "./pages/Admin";
import Goodbye from "./pages/Goodbye";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Protected member routes */}
                <Route
                  path="/dashboard"
                  element={
                    <AuthWrapper requireAuth>
                      <Dashboard />
                    </AuthWrapper>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <AuthWrapper requireAuth>
                      <Profile />
                    </AuthWrapper>
                  }
                />
                <Route
                  path="/community"
                  element={
                    <AuthWrapper requireAuth>
                      <Community />
                    </AuthWrapper>
                  }
                />
                <Route
                  path="/meditations"
                  element={
                    <AuthWrapper requireAuth>
                      <Meditations />
                    </AuthWrapper>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <AuthWrapper requireAuth>
                      <Analytics />
                    </AuthWrapper>
                  }
                />
                <Route
                  path="/map"
                  element={
                    <AuthWrapper requireAuth>
                      <MapPage />
                    </AuthWrapper>
                  }
                />
                <Route
                  path="/journal"
                  element={
                    <AuthWrapper requireAuth>
                      <Journal />
                    </AuthWrapper>
                  }
                />
                <Route
                  path="/journal-entries"
                  element={
                    <AuthWrapper requireAuth>
                      <JournalEntries />
                    </AuthWrapper>
                  }
                />
                <Route
                  path="/challenges"
                  element={
                    <AuthWrapper requireAuth>
                      <Challenges />
                    </AuthWrapper>
                  }
                />
                <Route
                  path="/achievements"
                  element={
                    <AuthWrapper requireAuth>
                      <Achievements />
                    </AuthWrapper>
                  }
                />
                <Route
                  path="/referrals"
                  element={
                    <AuthWrapper requireAuth>
                      <Referrals />
                    </AuthWrapper>
                  }
                />
                <Route
                  path="/friends"
                  element={
                    <AuthWrapper requireAuth>
                      <Friends />
                    </AuthWrapper>
                  }
                />

                {/* Admin routes */}
                <Route
                  path="/admin"
                  element={
                    <AuthWrapper requireAuth requireAdmin>
                      <Admin />
                    </AuthWrapper>
                  }
                />

                <Route
                  path="/goodbye"
                  element={
                    <AuthWrapper requireAuth>
                      <Goodbye />
                    </AuthWrapper>
                  }
                />

                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
