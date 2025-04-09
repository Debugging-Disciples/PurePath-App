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
  friendRequests: {
    incoming: UserProfile[];
    outgoing: string[];
  };
  friends: UserProfile[];
  accountabilityPartners: UserProfile[];
  notifications: any[];
  unreadNotifications: number;
  refreshUserData: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  userRole: null,
  isAdmin: false,
  isLoading: true,
  firebaseInitialized: false,
  friendRequests: {
    incoming: [],
    outgoing: []
  },
  friends: [],
  accountabilityPartners: [],
  notifications: [],
  unreadNotifications: 0,
  refreshUserData: () => Promise.resolve()
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'member' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseInitialized, setFirebaseInitialized] = useState(!!auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [friendRequests, setFriendRequests] = useState<{ incoming: UserProfile[], outgoing: string[] }>({
    incoming: [],
    outgoing: []
  });
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [accountabilityPartners, setAccountabilityPartners] = useState<UserProfile[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const fetchUserProfile = async (user: User) => {
    try {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
      
      const adminStatus = await isUserAdmin(user.email || '');
      setIsAdmin(adminStatus);
      
      if (adminStatus) {
        setUserRole('admin');
      } else {
        setUserRole(profile?.role || 'member');
      }
      
      if (profile) {
        const incomingRequests: UserProfile[] = [];
        if (profile.friendRequests?.incoming?.length) {
          for (const requesterId of profile.friendRequests.incoming) {
            const requesterProfile = await getUserProfile(requesterId);
            if (requesterProfile) {
              incomingRequests.push(requesterProfile);
            }
          }
        }
        
        setFriendRequests({
          incoming: incomingRequests,
          outgoing: profile.friendRequests?.outgoing || []
        });
        
        const friendsList: UserProfile[] = [];
        if (profile.friends?.length) {
          for (const friendId of profile.friends) {
            const friendProfile = await getUserProfile(friendId);
            if (friendProfile) {
              friendsList.push(friendProfile);
            }
          }
        }
        setFriends(friendsList);
        
        const partnersList: UserProfile[] = [];
        if (profile.accountabilityPartners?.length) {
          for (const partnerId of profile.accountabilityPartners) {
            const partnerProfile = await getUserProfile(partnerId);
            if (partnerProfile) {
              partnersList.push(partnerProfile);
            }
          }
        }
        setAccountabilityPartners(partnersList);
        
        if (profile.notifications) {
          setNotifications(profile.notifications);
          
          const unread = profile.notifications.filter((notification: any) => !notification.read).length;
          setUnreadNotifications(unread);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
      setUserRole(null);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
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
        await fetchUserProfile(user);
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

  const refreshUserData = async () => {
    if (currentUser) {
      await fetchUserProfile(currentUser);
    }
  };

  const value = {
    currentUser,
    userProfile,
    userRole,
    isAdmin,
    isLoading,
    firebaseInitialized,
    friendRequests,
    friends,
    accountabilityPartners,
    notifications,
    unreadNotifications,
    refreshUserData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
