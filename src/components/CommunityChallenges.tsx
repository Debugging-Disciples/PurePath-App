
import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/auth';
import { collection, getDocs, query, where, doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CustomBadge } from '@/components/ui/custom-badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Trophy, Users, Calendar, Target, ArrowRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  startDate: Timestamp;
  endDate: Timestamp;
  category: 'meditation' | 'journal' | 'streak' | 'community';
  target: number;
  participants: number;
  xpReward: number;
  imageUrl?: string;
}

interface UserChallenge extends Challenge {
  joined: boolean;
  progress: number;
  completed: boolean;
}

const CommunityChallenges: React.FC<{ className?: string }> = ({ className }) => {
  const [challenges, setChallenges] = useState<UserChallenge[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<UserChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchChallenges = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        // Get all available challenges
        const challengesRef = collection(db, 'challenges');
        const challengeQuery = query(challengesRef, where('endDate', '>', Timestamp.now()));
        const challengeSnap = await getDocs(challengeQuery);
        
        // Get user's challenge progress
        const userChallengesRef = doc(db, 'users', currentUser.uid, 'userData', 'challenges');
        const userChallengesSnap = await getDoc(userChallengesRef);
        
        const userChallenges = userChallengesSnap.exists() ? userChallengesSnap.data().joined || [] : [];
        
        const userChallengeMap = new Map();
        if (userChallenges.length > 0) {
          userChallenges.forEach((challenge: any) => {
            userChallengeMap.set(challenge.id, {
              progress: challenge.progress || 0,
              completed: challenge.completed || false
            });
          });
        }
        
        // Map challenges with user progress
        const allChallenges: UserChallenge[] = [];
        challengeSnap.forEach((doc) => {
          const challengeData = doc.data() as Challenge;
          const userProgress = userChallengeMap.get(doc.id);
          
          allChallenges.push({
            ...challengeData,
            id: doc.id,
            joined: userChallengeMap.has(doc.id),
            progress: userProgress ? userProgress.progress : 0,
            completed: userProgress ? userProgress.completed : false
          });
        });
        
        setChallenges(allChallenges);
        setActiveChallenges(allChallenges.filter(c => c.joined && !c.completed));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching challenges:', error);
        setLoading(false);
      }
    };
    
    fetchChallenges();
  }, [currentUser]);
  
  const joinChallenge = async (challenge: UserChallenge) => {
    if (!currentUser) return;
    
    try {
      // Update user's challenges
      const userChallengesRef = doc(db, 'users', currentUser.uid, 'userData', 'challenges');
      await updateDoc(userChallengesRef, {
        joined: arrayUnion({
          id: challenge.id,
          joinedAt: new Date(),
          progress: 0,
          completed: false
        })
      });
      
      // Update challenge participants count
      const challengeRef = doc(db, 'challenges', challenge.id);
      await updateDoc(challengeRef, {
        participants: challenge.participants + 1
      });
      
      // Update local state
      const updatedChallenges = challenges.map(c => {
        if (c.id === challenge.id) {
          return {
            ...c,
            joined: true,
            participants: c.participants + 1
          };
        }
        return c;
      });
      
      setChallenges(updatedChallenges);
      setActiveChallenges(updatedChallenges.filter(c => c.joined && !c.completed));
      
      toast.success(`Joined challenge: ${challenge.title}`, {
        description: "Track your progress in the Active Challenges section.",
      });
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast.error("Failed to join challenge", {
        description: "Please try again later.",
      });
    }
  };
  
  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  };
  
  const getDaysLeft = (endDate: Timestamp) => {
    const end = endDate.toDate();
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
  
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'meditation':
        return <CustomBadge variant="secondary" className="bg-purple-100 text-purple-800">Meditation</CustomBadge>;
      case 'journal':
        return <CustomBadge variant="secondary" className="bg-blue-100 text-blue-800">Journal</CustomBadge>;
      case 'streak':
        return <CustomBadge variant="secondary" className="bg-yellow-100 text-yellow-800">Streak</CustomBadge>;
      case 'community':
        return <CustomBadge variant="secondary" className="bg-green-100 text-green-800">Community</CustomBadge>;
      default:
        return <CustomBadge variant="secondary">Challenge</CustomBadge>;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="h-5 w-5 mr-2 text-primary" />
          Community Challenges
        </CardTitle>
        <CardDescription>
          Join challenges and grow together with the community
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full"></div>
          </div>
        ) : (
          <>
            {activeChallenges.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Your Active Challenges</h3>
                <div className="space-y-4">
                  {activeChallenges.map((challenge) => (
                    <motion.div 
                      key={challenge.id} 
                      className="p-4 bg-secondary/20 rounded-lg"
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{challenge.title}</h4>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{getDaysLeft(challenge.endDate)} days left</span>
                          </div>
                        </div>
                        {getCategoryBadge(challenge.category)}
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{challenge.progress} / {challenge.target}</span>
                          <span>{Math.round((challenge.progress / challenge.target) * 100)}%</span>
                        </div>
                        <Progress value={(challenge.progress / challenge.target) * 100} className="h-2" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            <h3 className="text-sm font-medium mb-2">Available Challenges</h3>
            <div className="space-y-4">
              {challenges.filter(c => !c.joined).slice(0, 3).map((challenge) => (
                <motion.div 
                  key={challenge.id} 
                  className="border rounded-lg p-4 hover:bg-secondary/10 transition-colors"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{challenge.title}</h4>
                    {getCategoryBadge(challenge.category)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-2">{challenge.description}</p>
                  
                  <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      <span>{challenge.participants} participants</span>
                    </div>
                    <div className="flex items-center">
                      <Trophy className="h-3 w-3 mr-1" />
                      <span>{challenge.xpReward} XP</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-4"
                    size="sm"
                    onClick={() => joinChallenge(challenge)}
                  >
                    Join Challenge
                  </Button>
                </motion.div>
              ))}
              
              {challenges.filter(c => !c.joined).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No new challenges available right now. Check back soon!
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="outline" size="sm" className="w-full">
          View All Challenges
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CommunityChallenges;
