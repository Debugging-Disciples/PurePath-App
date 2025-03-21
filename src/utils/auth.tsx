
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { auth, getUserProfile, UserProfile, isUserAdmin } from './firebase';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  userRole: 'admin' | 'member' | null;
  isAdmin: boolean;
  isLoading: boolean;
  firebaseInitialized: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  userRole: null,
  isAdmin: false,
  isLoading: true,
  firebaseInitialized: false
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'member' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseInitialized, setFirebaseInitialized] = useState(!!auth);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if Firebase is initialized
    if (!auth) {
      console.error("Firebase auth not initialized in AuthProvider");
      setIsLoading(false);
      setFirebaseInitialized(false);
      return () => {};
    } else {
      setFirebaseInitialized(true);
    }
    
    console.log("Setting up auth state listener");
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log("Auth state changed:", user ? "User logged in" : "No user");
      setCurrentUser(user);
      
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          console.log("User profile:", profile);
          setUserProfile(profile);
          
          // Check if user is admin
          const adminStatus = await isUserAdmin(user.email || '');
          setIsAdmin(adminStatus);
          
          // Set role based on admin status or profile
          if (adminStatus) {
            setUserRole('admin');
          } else {
            setUserRole(profile?.role || 'member');
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
          setUserRole(null);
          setIsAdmin(false);
        }
      } else {
        setUserProfile(null);
        setUserRole(null);
        setIsAdmin(false);
      }
      
      setIsLoading(false);
    }, (error) => {
      console.error("Auth state listener error:", error);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    userRole,
    isAdmin,
    isLoading,
    firebaseInitialized
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
