import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, query, where, GeoPoint, Timestamp, addDoc, orderBy, limit } from 'firebase/firestore';
import { toast } from 'sonner';

// Define user profile interface
export interface UserProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  location?: GeoPoint;
  role?: 'admin' | 'member';
  joinedAt?: Timestamp;
  streakDays?: number;
  lastCheckIn?: Timestamp;
  socialMedia?: {
    discord?: string;
    instagram?: string;
    other?: {
      name: string;
      url: string;
    };
  };
}

// Firebase configuration with provided credentials
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

console.log("Firebase config:", firebaseConfig);

// Initialize Firebase with better error handling
let app, auth, db;
try {
  console.log("Initializing Firebase app...");
  app = initializeApp(firebaseConfig);
  console.log("Firebase app initialized successfully");
  
  console.log("Initializing Firebase auth...");
  auth = getAuth(app);
  console.log("Firebase auth initialized successfully");
  
  console.log("Initializing Firestore...");
  db = getFirestore(app);
  console.log("Firestore initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

export { app, auth, db };

// Auth functions with conditional checks to prevent errors
export const login = async (email: string, password: string) => {
  if (!auth) {
    console.error("Firebase auth not initialized");
    toast.error('Firebase not configured. Please add your Firebase credentials in environment variables.');
    return false;
  }
  
  try {
    await signInWithEmailAndPassword(auth, email, password);
    toast.success('Welcome back to PurePath');
    return true;
  } catch (error) {
    toast.error('Login failed: ' + error.message);
    return false;
  }
};

export const register = async (email: string, password: string, username: string, firstName: string, lastName: string, gender: string, location?: { lat: number, lng: number }) => {
  try {
    console.log('Registering user with gender:', gender);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user profile in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      username,
      firstName,
      lastName,
      email,
      gender,
      location: location ? new GeoPoint(location.lat, location.lng) : null,
      role: 'member', // Default role
      joinedAt: Timestamp.now(),
      streakDays: 0,
      streakStart: Timestamp.now(),
      lastCheckIn: Timestamp.now()
    });
    
    toast.success('Welcome to PurePath');
    return true;
  } catch (error) {
    console.error('Registration error:', error);
    toast.error('Registration failed: ' + error.message);
    return false;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    toast.success('You have been logged out');
    return true;
  } catch (error) {
    toast.error('Logout failed: ' + error.message);
    return false;
  }
};

// User data functions
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!db) {
    console.error("Firebase db not initialized");
    return { id: userId };
  }
  
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as UserProfile;
    } else {
      return { id: userId };
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { id: userId };
  }
};

export const updateUserProfile = async (userId: string, profileData: Partial<UserProfile>): Promise<boolean> => {
  if (!db) {
    console.error("Firebase db not initialized");
    toast.error('Firebase not configured properly');
    return false;
  }
  
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, profileData);
    toast.success('Profile updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    toast.error('Failed to update profile: ' + error.message);
    return false;
  }
};

export const updateUserPassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
  if (!auth || !auth.currentUser) {
    console.error("User not logged in or auth not initialized");
    toast.error('You must be logged in to change your password');
    return false;
  }
  
  try {
    // Re-authenticate user before changing password
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email || '',
      currentPassword
    );
    
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, newPassword);
    toast.success('Password updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating password:', error);
    
    // Handle specific error codes
    if (error.code === 'auth/wrong-password') {
      toast.error('Current password is incorrect');
    } else if (error.code === 'auth/weak-password') {
      toast.error('New password is too weak');
    } else {
      toast.error('Failed to update password: ' + error.message);
    }
    
    return false;
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
      const yesterdayDate = new Date(now);
      yesterdayDate.setDate(now.getDate() - 1);
      
      const isYesterday = 
        lastCheckIn.getDate() === yesterdayDate.getDate() && 
        lastCheckIn.getMonth() === yesterdayDate.getMonth() && 
        lastCheckIn.getFullYear() === yesterdayDate.getFullYear();
        
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
  } catch (error) {
    console.error('Error updating streak:', error);
    return { success: false, message: error.message };
  }
};

export const updateStreakStart = async (userId: string, startDate: Date) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const lastCheckIn = userData.lastCheckIn?.toDate() || new Date(0);

      const diffInMilliseconds = startDate.getTime() - lastCheckIn.getTime();
      const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

      await updateDoc(userRef, {
        streakDays: diffInDays > 0 ? diffInDays : 0, // Ensure streakDays is not negative
      });
      
      return { success: true, diffInDays, message: 'Streak start updated successfully' };
    }

    return { success: false, message: 'User not found' };
  } catch (error) {
    console.error('Error setting streak:', error);
    return { success: false, message: error.message };
  }
};

// Log relapse with multiple triggers (used for analytics)
export const logRelapse = async (userId: string, triggers: string[], notes?: string) => {
  try {
    await addDoc(collection(db, 'relapses'), {
      userId,
      timestamp: Timestamp.now(),
      triggers: triggers,
      notes: notes || ''
    });
    
    // Reset streak
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      streakDays: 0,
      lastCheckIn: Timestamp.now()
    });
    
    return { success: true, message: 'Progress reset. Remember: every moment is a new opportunity.' };
  } catch (error) {
    console.error('Error logging relapse:', error);
    return { success: false, message: error.message };
  }
};

// Get user triggers from the last 7 days
export const getUserTriggers = async (userId: string): Promise<{ name: string; count: number; }[]> => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const relapsesRef = collection(db, 'relapses');
    const q = query(
      relapsesRef,
      where('userId', '==', userId),
      where('timestamp', '>=', Timestamp.fromDate(sevenDaysAgo)),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    // Count the triggers
    const triggerCounts: Record<string, number> = {};
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.triggers && Array.isArray(data.triggers)) {
        data.triggers.forEach(trigger => {
          triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
        });
      }
    });
    
    // Convert to array format for chart
    const triggers = Object.entries(triggerCounts).map(([name, count]) => ({
      name,
      count
    }));
    
    // Sort by count (descending)
    triggers.sort((a, b) => b.count - a.count);
    
    return triggers;
  } catch (error) {
    console.error('Error fetching user triggers:', error);
    return [];
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
