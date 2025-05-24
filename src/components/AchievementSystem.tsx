import React, { useEffect, useState } from 'react';
import { useAuth } from '../utils/auth';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomBadge } from '@/components/ui/custom-badge';
import { Trophy, Award, Star, Circle, CheckCircle, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'meditation' | 'journal' | 'community' | 'special';
  requirement: number;
  xp: number;
  unlocked: boolean;
  progress: number;
}

const defaultAchievements: Achievement[] = [
  {
    id: 'streak-3',
    title: 'Getting Started',
    description: 'Maintain a 3-day streak',
    icon: 'flame',
    category: 'streak',
    requirement: 3,
    xp: 50,
    unlocked: false,
    progress: 0
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
    progress: 0
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
    progress: 0
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
    progress: 0
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
    progress: 0
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
    progress: 0
  }
];

export const levelThresholds = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250];

export const calculateLevel = (xp: number): number => {
  if (xp < levelThresholds[1]) {
    return 1;
  }
  
  for (let i = 1; i < levelThresholds.length; i++) {
    if (xp < levelThresholds[i]) {
      return i;
    }
  }
  return levelThresholds.length;
};

export const calculateLevelProgress = (xp: number): number => {
  const currentLevel = calculateLevel(xp);
  if (currentLevel === 1) {
    return (xp / levelThresholds[1]) * 100;
  }
  
  const prevThreshold = levelThresholds[currentLevel - 1];
  const nextThreshold = levelThresholds[currentLevel] || prevThreshold * 1.5;
  
  return ((xp - prevThreshold) / (nextThreshold - prevThreshold)) * 100;
};

interface AchievementSystemProps {
  className?: string;
  showAll?: boolean;
  filter?: "inProgress" | "completed" | "all";
  defaultLevel?: number;
}

const AchievementSystem: React.FC<AchievementSystemProps> = ({ 
  className, 
  showAll = false, 
  filter = "all", 
  defaultLevel = 1 
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [xp, setXP] = useState(0);
  const [level, setLevel] = useState(defaultLevel);
  const [levelProgress, setLevelProgress] = useState(0);
  const [recentAchievement, setRecentAchievement] = useState<Achievement | null>(null);
  const { currentUser, userProfile } = useAuth();

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!currentUser) return;
      
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const userXP = userData.xp || 0;
          setXP(userXP);
          
          const userLevel = calculateLevel(userXP);
          setLevel(userLevel);
          
          const progress = calculateLevelProgress(userXP);
          setLevelProgress(progress);
        }
        
        const achievementsRef = doc(db, 'users', currentUser.uid, 'userData', 'achievements');
        const achievementsSnap = await getDoc(achievementsRef);
        
        if (achievementsSnap.exists()) {
          setAchievements(achievementsSnap.data().achievements);
        } else {
          try {
            await updateDoc(userRef, { 
              xp: userProfile?.xp || 0
            });
            
            await updateDoc(achievementsRef, {
              achievements: defaultAchievements
            });
            
            setAchievements(defaultAchievements);
          } catch (error) {
            console.error("Error initializing achievements:", error);
            setAchievements(defaultAchievements);
          }
        }
      } catch (error) {
        console.error('Error fetching achievements:', error);
        setAchievements(defaultAchievements);
      }
    };
    
    fetchAchievements();
  }, [currentUser, userProfile]);

  const checkAndUpdateAchievements = async () => {
    if (!currentUser || !userProfile) return;
    
    try {
      const updatedAchievements = [...achievements];
      let xpGained = 0;
      let newlyUnlocked = null;
      
      const streakAchievements = updatedAchievements.filter(a => a.category === 'streak');
      for (let achievement of streakAchievements) {
        const streakProgress = userProfile.streakDays || 0;
        if (!achievement.unlocked && streakProgress >= achievement.requirement) {
          achievement.unlocked = true;
          achievement.progress = achievement.requirement;
          xpGained += achievement.xp;
          newlyUnlocked = achievement;
        } else if (!achievement.unlocked) {
          achievement.progress = streakProgress;
        }
      }
      
      const meditationAchievements = updatedAchievements.filter(a => a.category === 'meditation');
      const meditationCount = userProfile.meditations?.length || 0;
      for (let achievement of meditationAchievements) {
        if (!achievement.unlocked && meditationCount >= achievement.requirement) {
          achievement.unlocked = true;
          achievement.progress = achievement.requirement;
          xpGained += achievement.xp;
          newlyUnlocked = achievement;
        } else if (!achievement.unlocked) {
          achievement.progress = meditationCount;
        }
      }
      
      const journalAchievements = updatedAchievements.filter(a => a.category === 'journal');
      const journalCount = userProfile.journal?.length || 0;
      for (let achievement of journalAchievements) {
        if (!achievement.unlocked && journalCount >= achievement.requirement) {
          achievement.unlocked = true;
          achievement.progress = achievement.requirement;
          xpGained += achievement.xp;
          newlyUnlocked = achievement;
        } else if (!achievement.unlocked) {
          achievement.progress = journalCount;
        }
      }
      
      const communityAchievements = updatedAchievements.filter(a => a.category === 'community');
      const hasFriends = (userProfile.friends?.length || 0) > 0;
      for (let achievement of communityAchievements) {
        if (achievement.id === 'community-first' && !achievement.unlocked && hasFriends) {
          achievement.unlocked = true;
          achievement.progress = achievement.requirement;
          xpGained += achievement.xp;
          newlyUnlocked = achievement;
        }
      }
      
      if (xpGained > 0) {
        const userRef = doc(db, 'users', currentUser.uid);
        const achievementsRef = doc(db, 'users', currentUser.uid, 'userData', 'achievements');
        
        await updateDoc(userRef, {
          xp: (userProfile.xp || 0) + xpGained
        });
        
        await updateDoc(achievementsRef, {
          achievements: updatedAchievements
        });
        
        setAchievements(updatedAchievements);
        setXP((prev) => prev + xpGained);
        
        const newLevel = calculateLevel(xp + xpGained);
        setLevel(newLevel);
        setLevelProgress(calculateLevelProgress(xp + xpGained));
        
        if (newlyUnlocked) {
          setRecentAchievement(newlyUnlocked);
          toast.success(`🏆 Achievement Unlocked: ${newlyUnlocked.title}`, {
            description: `${newlyUnlocked.description} (+${newlyUnlocked.xp} XP)`,
            duration: 5000
          });
        }
      }
    } catch (error) {
      console.error('Error updating achievements:', error);
    }
  };
  
  useEffect(() => {
    if (currentUser && userProfile) {
      checkAndUpdateAchievements();
    }
  }, [currentUser, userProfile]);
  
  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'flame':
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'heart-pulse':
        return <Star className="h-5 w-5 text-purple-500" />;
      case 'book-open':
        return <Award className="h-5 w-5 text-blue-500" />;
      case 'message-circle':
        return <Target className="h-5 w-5 text-green-500" />;
      default:
        return <Trophy className="h-5 w-5 text-primary" />;
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (filter === "inProgress") {
      return !achievement.unlocked && achievement.progress > 0;
    } else if (filter === "completed") {
      return achievement.unlocked;
    }
    return true;
  });

  const displayedAchievements = showAll 
    ? filteredAchievements 
    : filteredAchievements.slice(0, 3);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Level {level}</span>
          <span className="text-sm font-normal">{xp} XP</span>
        </CardTitle>
        <CardDescription>
          <div className="w-full mt-2">
            <Progress value={levelProgress} className="h-2" />
            <div className="flex justify-between text-xs mt-1">
              <span>Level {level}</span>
              <span>Level {level + 1}</span>
            </div>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <h3 className="font-medium mb-3">
          {showAll ? (filter === "inProgress" ? 'In Progress' : filter === "completed" ? 'Completed' : 'All Achievements') : 'Recent Achievements'}
        </h3>
        
        {displayedAchievements.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <p>No achievements {filter === "inProgress" ? "in progress" : filter === "completed" ? "completed" : ""} yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedAchievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                className={`flex items-center p-3 rounded-md ${achievement.unlocked ? 'bg-primary/10' : 'bg-secondary/20'}`}
                whileHover={{ scale: 1.02 }}
                initial={achievement === recentAchievement ? { scale: 0.9, opacity: 0 } : { scale: 1, opacity: 1 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mr-3">
                  {getAchievementIcon(achievement.icon)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{achievement.title}</p>
                    {achievement.unlocked ? (
                      <CustomBadge variant="success">Unlocked</CustomBadge>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {achievement.progress}/{achievement.requirement}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                  {!achievement.unlocked && (
                    <div className="w-full mt-2">
                      <div className="h-1 bg-secondary/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(achievement.progress / achievement.requirement) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {!showAll && achievements.length > 3 && (
              <div className="text-center mt-2">
                <CustomBadge variant="outline" className="cursor-pointer hover:bg-secondary">
                  View all achievements
                </CustomBadge>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AchievementSystem;
