
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, query, where, GeoPoint, Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';

// Define user profile interface
export interface UserProfile {
  id: string;
  username?: string;
  email?: string;
  location?: GeoPoint;
  role?: 'admin' | 'member';
  joinedAt?: Timestamp;
  streakDays?: number;
  lastCheckIn?: Timestamp;
}

// Firebase configuration - users will need to add their own config
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth functions
export const login = async (email: string, password: string) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    toast.success('Welcome back to PurePath');
    return true;
  } catch (error: any) {
    toast.error('Login failed: ' + error.message);
    return false;
  }
};

export const register = async (email: string, password: string, username: string, location?: { lat: number, lng: number }) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user profile in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      username,
      email,
      location: location ? new GeoPoint(location.lat, location.lng) : null,
      role: 'member', // Default role
      joinedAt: Timestamp.now(),
      streakDays: 0,
      lastCheckIn: Timestamp.now()
    });
    
    toast.success('Welcome to PurePath');
    return true;
  } catch (error: any) {
    toast.error('Registration failed: ' + error.message);
    return false;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    toast.success('You have been logged out');
    return true;
  } catch (error: any) {
    toast.error('Logout failed: ' + error.message);
    return false;
  }
};

// User data functions
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as UserProfile;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const checkUserRole = async (userId: string): Promise<'admin' | 'member' | null> => {
  try {
    const userProfile = await getUserProfile(userId);
    return userProfile?.role as 'admin' | 'member' | null;
  } catch (error) {
    console.error('Error checking user role:', error);
    return null;
  }
};

// Streaks and check-ins
export const updateStreak = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const lastCheckIn = userData.lastCheckIn?.toDate() || new Date(0);
      const now = new Date();
      
      // Check if the last check-in was yesterday (maintaining streak)
      const isYesterday = 
        lastCheckIn.getDate() === now.getDate() - 1 && 
        lastCheckIn.getMonth() === now.getMonth() && 
        lastCheckIn.getFullYear() === now.getFullYear();
        
      // Check if already checked in today
      const isToday = 
        lastCheckIn.getDate() === now.getDate() && 
        lastCheckIn.getMonth() === now.getMonth() && 
        lastCheckIn.getFullYear() === now.getFullYear();
      
      if (isToday) {
        return { success: true, streakDays: userData.streakDays, message: 'Already checked in today' };
      }
      
      let streakDays = userData.streakDays || 0;
      
      if (isYesterday) {
        // Maintain streak
        streakDays += 1;
      } else if (!isToday) {
        // Reset streak if more than a day has been missed
        streakDays = 1;
      }
      
      // Update user data
      await updateDoc(userRef, {
        lastCheckIn: Timestamp.now(),
        streakDays
      });
      
      return { success: true, streakDays, message: 'Streak updated successfully' };
    }
    
    return { success: false, message: 'User not found' };
  } catch (error: any) {
    console.error('Error updating streak:', error);
    return { success: false, message: error.message };
  }
};

// Log relapse (used for analytics)
export const logRelapse = async (userId: string, notes?: string) => {
  try {
    await setDoc(doc(collection(db, 'relapses')), {
      userId,
      timestamp: Timestamp.now(),
      notes: notes || ''
    });
    
    // Reset streak
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      streakDays: 0,
      lastCheckIn: Timestamp.now()
    });
    
    return { success: true, message: 'Progress reset. Remember: every moment is a new opportunity.' };
  } catch (error: any) {
    console.error('Error logging relapse:', error);
    return { success: false, message: error.message };
  }
};

// Community map data (anonymized)
export const getCommunityLocations = async () => {
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    
    const locations: { id: string; location: GeoPoint }[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.location) {
        // Only include location data, not user identifiable information
        locations.push({
          id: doc.id,
          location: data.location
        });
      }
    });
    
    return locations;
  } catch (error) {
    console.error('Error fetching community locations:', error);
    return [];
  }
};

export default app;
