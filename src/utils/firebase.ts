import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, GeoPoint, Timestamp, addDoc, orderBy, arrayUnion, serverTimestamp, onSnapshot, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { format, subDays, differenceInDays, startOfDay, parseISO, isSameDay, addDays } from 'date-fns';

export interface UserProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  location?: {
    country: string;
    state?: string | null;
  };
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

export interface JournalEntry {
  id?: string;
  userId: string;
  timestamp: Date;
  question: string;    // The prompt that was shown
  notes: string;       // User's journal response
  level: number;       // Mood level (1-10)
  emotions: string[];  // Selected emotions
}

export interface Relapse {
  timestamp: Timestamp;
  triggers: string;
  notes?: string;
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID
};

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

export const isUserAdmin = async (email: string): Promise<boolean> => {
  if (!db) {
    console.error("Firebase db not initialized");
    return false;
  }

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email), where('role', '==', 'admin'));
    const querySnapshot = await getDocs(q);

    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

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

export const register = async (
  email: string, 
  password: string, 
  username: string, 
  firstName: string, 
  lastName: string, 
  gender: string, 
  location?: { country: string; state?: string | null }
) => {
  try {
    console.log('Registering user with gender:', gender);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      username,
      firstName,
      lastName,
      email,
      meditations: [],
      relapses: [],  
      gender,
      location: location || null,
      role: 'member',
      joinedAt: Timestamp.now(),
      streakDays: 0,
      streakStartDate: Timestamp.now(),
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

export const updateStreak = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const lastCheckIn = userData.lastCheckIn?.toDate() || new Date(0);
      const now = new Date();
      
      const yesterdayDate = new Date(now);
      yesterdayDate.setDate(now.getDate() - 1);
      
      const isYesterday = 
        lastCheckIn.getDate() === yesterdayDate.getDate() && 
        lastCheckIn.getMonth() === yesterdayDate.getMonth() && 
        lastCheckIn.getFullYear() === yesterdayDate.getFullYear();
        
      const isToday = 
        lastCheckIn.getDate() === now.getDate() && 
        lastCheckIn.getMonth() === now.getMonth() && 
        lastCheckIn.getFullYear() === now.getFullYear();
      
      if (isToday) {
        return { success: true, streakDays: userData.streakDays, message: 'Already checked in today' };
      }
      
      let streakDays = userData.streakDays || 0;
      
      if (isYesterday) {
        streakDays += 1;
      } else if (!isToday) {
        streakDays = 1;
      }
      
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

      const diffInMilliseconds = lastCheckIn.getTime() - startDate.getTime();
      const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

      if (diffInDays < 0) {
        return { success: false, message: 'Invalid Date' };
      }

      await updateDoc(userRef, {
        streakDays: diffInDays > 0 ? diffInDays : 0,
        streakStartDate: Timestamp.fromDate(startDate)
      });
      
      return { success: true, message: 'Streak start updated successfully' };
    }

    return { success: false, message: 'User not found' };
  } catch (error) {
    console.error('Error setting streak:', error);
    return { success: false, message: error.message };
  }
};

interface LogRelapseResult {
  success: boolean;
  message?: string;
}

export const logRelapse = async (userId: string, triggers: string, notes?: string): Promise<LogRelapseResult> => {
  try {
    const userDocRef = doc(db, 'users', userId);  // Reference to the user's document

    const relapseObject = {
      timestamp: Timestamp.now(),
      triggers: triggers,
      notes: notes || ''
    };

    await updateDoc(userDocRef, {
      relapses: arrayUnion(relapseObject),
      streakDays: 0
    });
    return { success: true, message: 'Progress reset. Remember: every moment is a new opportunity.' };
  } catch (error) {
    console.error('Error logging relapse:', error);
    return { success: false, message: error.message };
  }
};

export const getRelapseData = async (userId: string, timeframe = 'weekly') => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      return {
        streakData: [],
        moodData: [],
        longestStreak: 0,
        cleanDays: 0,
        relapseDays: 0
      };
    }
    
    const userData = userDoc.data();
    const joinDate = userData.joinedAt?.toDate() || new Date();
    const relapses: Relapse[] = userData.relapses || [];
    const journal = userData.journal || [];
    
    const sortedRelapses = [...relapses].sort((a, b) => 
      a.timestamp.toDate().getTime() - b.timestamp.toDate().getTime()
    );
    
    let startDate = new Date();
    const endDate = new Date();
    
    if (timeframe === 'weekly') {
      startDate = subDays(endDate, 7);
    } else if (timeframe === 'monthly') {
      startDate = subDays(endDate, 30);
    } else {
      startDate = joinDate;
    }
    
    const streakData = [];
    const moodData = [];
    const currentDate = startOfDay(startDate);
    const today = startOfDay(new Date());
    let currentStreak = 0;
    let longestStreak = 0;
    
    const historicalLongestStreak = calculateLongestStreak(joinDate, sortedRelapses);
    
    const totalDaysSinceJoining = differenceInDays(today, joinDate) + 1;
    const totalRelapseDays = sortedRelapses.length;
    const totalCleanDays = totalDaysSinceJoining - totalRelapseDays;
    const netGrowth = totalCleanDays - totalRelapseDays;
    
    while (currentDate <= today) {
      const formattedDate = format(currentDate, 'MMM d');
      
      const hadRelapse = sortedRelapses.some(relapse => {
        const relapseDate = startOfDay(relapse.timestamp.toDate());
        return isSameDay(relapseDate, currentDate);
      });
      
      if (hadRelapse) {
        streakData.push({ date: formattedDate, streak: 0 });
        currentStreak = 0;
      } else {
        currentStreak++;
        streakData.push({ date: formattedDate, streak: currentStreak });
        
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
        }
      }
      
      const journalEntry = journal.find(entry => {
        const entryDate = entry.timestamp.toDate();
        return isSameDay(entryDate, currentDate);
      });
      
      moodData.push({
        date: formattedDate,
        streak: hadRelapse ? 0 : currentStreak,
        mood: journalEntry ? journalEntry.level : 5
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return {
      streakData,
      moodData,
      longestStreak: historicalLongestStreak,
      cleanDays: totalCleanDays,
      relapseDays: totalRelapseDays,
      netGrowth
    };
  } catch (error) {
    console.error('Error getting relapse data:', error);
    return {
      streakData: [],
      moodData: [],
      longestStreak: 0,
      cleanDays: 0,
      relapseDays: 0,
      netGrowth: 0
    };
  }
};

export const calculateLongestStreak = (joinDate: Date, sortedRelapses: Relapse[]): number => {
  if (sortedRelapses.length === 0) {
    return differenceInDays(new Date(), joinDate);
  }

  let longestStreak = 0;
  let lastRelapseDate = startOfDay(joinDate);
  
  for (const relapse of sortedRelapses) {
    const relapseDate = startOfDay(relapse.timestamp.toDate());
    const streakDays = differenceInDays(relapseDate, lastRelapseDate);
    
    if (streakDays > longestStreak) {
      longestStreak = streakDays;
    }
    
    lastRelapseDate = relapseDate;
  }
  
  const currentStreak = differenceInDays(new Date(), lastRelapseDate);
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }
  
  return longestStreak;
};

export const getRelapseCalendarData = async (userId: string) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      return [];
    }
    
    const userData = userDoc.data();
    const joinDate = userData.joinedAt?.toDate() || new Date();
    const relapses: Relapse[] = userData.relapses || [];
    
    const sortedRelapses = [...relapses].sort((a, b) => 
      a.timestamp.toDate().getTime() - b.timestamp.toDate().getTime()
    );
    
    const calendarData = [];
    const currentDate = startOfDay(joinDate);
    const today = startOfDay(new Date());
    
    while (currentDate <= today) {
      const relapse = sortedRelapses.find(r => {
        const relapseDate = startOfDay(r.timestamp.toDate());
        return isSameDay(relapseDate, currentDate);
      });
      
      calendarData.push({
        date: new Date(currentDate),
        hadRelapse: !!relapse,
        relapseInfo: relapse ? {
          triggers: relapse.triggers,
          notes: relapse.notes || ''
        } : null
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return calendarData;
  } catch (error) {
    console.error('Error getting relapse calendar data:', error);
    return [];
  }
};

export const addJournalEntry = async (entry: JournalEntry): Promise<boolean> => {
  if (!db || !entry.userId) {
    console.error("Firebase db not initialized or missing userId");
    return false;
  }
  
  try {
    const userRef = doc(db, 'users', entry.userId);
    
    const entryWithTimestamp = {
      ...entry,
      timestamp: Timestamp.fromDate(entry.timestamp)
    };
    
    await updateDoc(userRef, {
      journal: arrayUnion(entryWithTimestamp)
    });
    
    return true;
  } catch (error) {
    console.error('Error adding journal entry:', error);
    return false;
  }
};

export const getJournalEntries = async (userId: string): Promise<JournalEntry[]> => {
  if (!db) {
    console.error("Firebase db not initialized");
    return [];
  }
  
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists() && userDoc.data().journal) {
      const entries = userDoc.data().journal;
      
      return entries
        .map((entry) => ({
          ...entry,
          timestamp: entry.timestamp.toDate()
        }))
        .sort((a: JournalEntry, b: JournalEntry) => 
          b.timestamp.getTime() - a.timestamp.getTime()
        );
    }
    
    return [];
  } catch (error) {
    console.error('Error getting journal entries:', error);
    return [];
  }
};

export const getCommunityLocations = async () => {
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    
    const locations: { id: string; location: { country: string; state?: string | null; } }[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.location && data.location.country) {
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

export const generateGeminiResponse = async (prompt: string, options?) => {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    console.error("Gemini API key not found");
    return { error: "API key not configured. Please add VITE_GEMINI_API_KEY to your environment variables." };
  }

  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
    
    const response = await fetch(`${endpoint}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1000,
          ...options
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      return { error: data.error.message || "Error calling Gemini API" };
    }

    return {
      text: data.candidates?.[0]?.content?.parts?.[0]?.text || "",
      finishReason: data.candidates?.[0]?.finishReason || ""
    };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return { error: "Failed to call Gemini API. See console for details." };
  }
};

export default app;
