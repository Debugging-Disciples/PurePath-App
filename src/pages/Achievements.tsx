
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import AchievementSystem from '@/components/AchievementSystem';
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from '@/utils/auth';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/utils/firebase';

const Achievements: React.FC = () => {
  const isMobile = useIsMobile();
  const { currentUser, userProfile, refreshUserData } = useAuth();
  
  useEffect(() => {
    // Make sure achievements are initialized when visiting the Achievements page
    const initializeAchievements = async () => {
      if (!currentUser) return;
      
      try {
        const achievementsRef = doc(db, 'users', currentUser.uid, 'userData', 'achievements');
        const achievementsSnap = await getDoc(achievementsRef);
        
        if (!achievementsSnap.exists()) {
          // If no achievements document exists, create a default one
          await setDoc(achievementsRef, {
            achievements: [
              {
                id: 'streak-3',
                title: 'Getting Started',
                description: 'Maintain a 3-day streak',
                icon: 'flame',
                category: 'streak',
                requirement: 3,
                xp: 50,
                unlocked: false,
                progress: userProfile?.streakDays || 0
              },
              {
                id: 'streak-7',
                title: 'One Week Strong',
                description: 'Maintain a 7-day streak',
                icon: 'flame',
                category: 'streak',
                requirement: 7,
                xp: 100,
                unlocked: false,
                progress: userProfile?.streakDays || 0
              },
              {
                id: 'streak-30',
                title: 'Monthly Master',
                description: 'Maintain a 30-day streak',
                icon: 'flame',
                category: 'streak',
                requirement: 30,
                xp: 500,
                unlocked: false,
                progress: userProfile?.streakDays || 0
              },
              {
                id: 'meditation-5',
                title: 'Mindful Beginner',
                description: 'Complete 5 meditations',
                icon: 'heart-pulse',
                category: 'meditation',
                requirement: 5,
                xp: 100,
                unlocked: false,
                progress: userProfile?.meditations?.length || 0
              },
              {
                id: 'journal-5',
                title: 'Journal Enthusiast',
                description: 'Write 5 journal entries',
                icon: 'book-open',
                category: 'journal',
                requirement: 5,
                xp: 100,
                unlocked: false,
                progress: userProfile?.journal?.length || 0
              },
              {
                id: 'community-first',
                title: 'Community Member',
                description: 'Engage with the community for the first time',
                icon: 'message-circle',
                category: 'community',
                requirement: 1,
                xp: 50,
                unlocked: false,
                progress: userProfile?.friends?.length ? 1 : 0
              }
            ]
          });
          
          // Refresh user data to pick up the changes
          refreshUserData();
        }
      } catch (error) {
        console.error('Error initializing achievements:', error);
      }
    };
    
    initializeAchievements();
  }, [currentUser, userProfile]);
  
  return (
    <motion.div 
      className="container py-8 pb-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <motion.h1 
          className="text-3xl font-bold mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Achievements
        </motion.h1>
        <motion.p 
          className="text-muted-foreground"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          Track your progress and unlock rewards
        </motion.p>
      </div>
      
      <AchievementSystem className="w-full" showAll={true} />
    </motion.div>
  );
};

export default Achievements;
