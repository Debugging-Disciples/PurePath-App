
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { useAuth } from './utils/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { auth, logout } from './utils/firebase';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import ProfilePage from './pages/Profile';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return currentUser ? <>{children}</> : <Navigate to="/login" />;
};

const Navbar = () => {
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="bg-background border-b">
      <div className="container flex h-16 items-center justify-between py-4">
        <Link to="/" className="font-bold text-2xl">PurePath</Link>
        <nav className="flex items-center space-x-4">
          <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
            Home
          </Link>
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg" alt="User" />
                    <AvatarFallback>{currentUser.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium transition-colors hover:text-primary">
                Login
              </Link>
              <Link to="/register" className="text-sm font-medium transition-colors hover:text-primary">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { firebaseInitialized } = useAuth();

  useEffect(() => {
    if (!firebaseInitialized) {
      console.log("Firebase not initialized. Check your environment variables and Firebase configuration.");
    }
  }, [firebaseInitialized]);

  if (!firebaseInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-[600px] p-6">
          <CardHeader>
            <CardTitle className="text-2xl">Firebase Configuration Missing</CardTitle>
            <CardDescription>
              Your Firebase credentials are missing or invalid. Please follow these steps to set up Firebase:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal ml-6 space-y-2">
              <li>Create a Firebase project at <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Firebase Console</a></li>
              <li>Register your app in the Firebase project</li>
              <li>Copy the configuration from Firebase into your environment variables</li>
              <li>Create a <code className="bg-muted px-1 py-0.5 rounded">.env</code> file in the root of your project (use the <code>.env.sample</code> file as a template)</li>
              <li>Restart your application</li>
            </ol>
            <div className="bg-muted p-4 rounded-md mt-4">
              <p className="font-medium">Required environment variables:</p>
              <ul className="mt-2 space-y-1">
                <li><code>VITE_FIREBASE_API_KEY</code></li>
                <li><code>VITE_FIREBASE_AUTH_DOMAIN</code></li>
                <li><code>VITE_FIREBASE_PROJECT_ID</code></li>
                <li><code>VITE_FIREBASE_STORAGE_BUCKET</code></li>
                <li><code>VITE_FIREBASE_MESSAGING_SENDER_ID</code></li>
                <li><code>VITE_FIREBASE_APP_ID</code></li>
                <li><code>VITE_FIREBASE_MEASUREMENT_ID</code> (optional)</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              The application will not function correctly until Firebase is properly configured.
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
