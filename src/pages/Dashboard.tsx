
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/auth';
import { updateStreak, getUserProfile, updateStreakStart } from '../utils/firebase';
import { cn } from '@/lib/utils';
import { 
  ArrowRight, 
  Calendar, 
  Trophy, 
  TrendingUp,
  MessageCircle,
  Map,
  HeartPulse,
  CheckIcon,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PanicButton from '@/components/PanicButton';
import MeditationCard from '@/components/MeditationCard';
import CommunityMap from '@/components/CommunityMap';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import DatePicker from '@/components/ui/date-picker';
import DailyTasks from '@/components/DailyTasks';
import { useIsMobile } from "@/hooks/use-mobile";

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  }).format(date);
};

const Dashboard: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [streak, setStreak] = useState(0);
  const [lastCheckIn, setLastCheckIn] = useState<Date | null>(null);
  const [isCheckedInToday, setIsCheckedInToday] = useState(false);
  const [isCheckInSide, setIsCheckInSide] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const isMobile = useIsMobile();
  
  const featuredMeditations = [
    {
      id: '1',
      title: 'Urge Surfing',
      description: 'Learn to ride the wave of desire without giving in',
      duration: 10,
      category: 'Beginner',
      favorite: false,
      imageUrl: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&q=80&w=500'
    },
    {
      id: '2',
      title: 'Morning Clarity',
      description: 'Start your day with purpose and clear intentions',
      duration: 5,
      category: 'Daily',
      favorite: false,
      imageUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&q=80&w=500'
    }
  ];
  
  useEffect(() => {
    if (currentUser && userProfile) {
      setStreak(userProfile.streakDays || 0);
      
      if (userProfile.lastCheckIn) {
        const lastCheckInDate = userProfile.lastCheckIn.toDate();
        setLastCheckIn(lastCheckInDate);
        
        const today = new Date();
        setIsCheckedInToday(
          lastCheckInDate.getDate() === today.getDate() &&
          lastCheckInDate.getMonth() === today.getMonth() &&
          lastCheckInDate.getFullYear() === today.getFullYear()
        );
      }
    }
  }, [currentUser, userProfile]);
  
  const handleCheckIn = async () => {
    if (!currentUser) return;
    
    try {
      const result = await updateStreak(currentUser.uid);
      
      if (result.success) {
        const updatedProfile = await getUserProfile(currentUser.uid);
        
        if (updatedProfile) {
          setStreak(updatedProfile.streakDays || 0);
          setLastCheckIn(updatedProfile.lastCheckIn?.toDate() || null);
          setIsCheckedInToday(true);
        }
        
        if (result.message === 'Already checked in today') {
          toast("You've already checked in today", {
            description: "Remember to come back tomorrow to continue your streak!",
          });
        } else {
          toast.success("Streak updated!", {
            description: `You're now on a ${result.streakDays} day streak. Keep going!`,
          });
        }
      }
    } catch (error) {
      console.error('Error updating streak:', error);
      toast.error("Failed to update streak", {
        description: "Please try again later.",
      });
    }
  };

  const handleStreakSet = async () => {
    if (!currentUser) return;

    try {
      const result = await updateStreakStart(currentUser.uid, selectedDate);
      
      if (result.success) {
        const updatedProfile = await getUserProfile(currentUser.uid);
        
        if (updatedProfile) {
          setStreak(updatedProfile.streakDays || 0);
        }

        if (result.message === 'Streak start updated successfully') {
          toast.success("Streak start updated!", {
            description: `Your streak has been reset to start from ${formatDate(selectedDate)}.`,
          });
        }
      }

      if (!result.success && result.message === 'Invalid Date') {
        toast.error("Invalid date selected", {
          description: "Please select a valid date to start your streak.",
        });
      }

    } catch (error) {
      console.error('Error updating streak:', error);
      toast.error("Failed to set streak start date", {
        description: "Please try again later.",
      });
    } finally {
      setIsCheckInSide(true);
    }
  };
  
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
          Welcome back, {userProfile?.username || 'Friend'}
        </motion.h1>
        <motion.p 
          className="text-muted-foreground"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {formatDate(new Date())} • Keep moving forward
        </motion.p>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-8"
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Access your most used features quickly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto flex flex-col py-4" asChild>
                <Link to="/meditations">
                  <HeartPulse className="h-8 w-8 mb-2 text-primary" />
                  <span>Meditations</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex flex-col py-4" asChild>
                <Link to="/journal">
                  <BookOpen className="h-8 w-8 mb-2 text-primary" />
                  <span>Journal</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex flex-col py-4" asChild>
                <Link to="/community">
                  <MessageCircle className="h-8 w-8 mb-2 text-primary" />
                  <span>Community</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex flex-col py-4" asChild>
                <Link to="/analytics">
                  <TrendingUp className="h-8 w-8 mb-2 text-primary" />
                  <span>Analytics</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className={cn(
            "border-primary/20 h-full",
            streak > 0 && "bg-gradient-to-br from-primary/10 to-transparent"
          )}>
            {isCheckInSide ? (
              <motion.div
                key="check-in-side"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-primary" />
                    Your Current Streak
                  </CardTitle>
                  <CardDescription>
                    {isCheckedInToday 
                      ? 'You\'ve checked in today. Great job!' 
                      : 'Remember to check in daily to maintain your streak'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold mb-2 text-primary">
                        {streak}
                      </div>
                      <div className="text-muted-foreground">
                        consecutive {streak === 1 ? 'day' : 'days'}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col items-center space-y-2">
                  <Button 
                    onClick={handleCheckIn} 
                    disabled={isCheckedInToday}
                    variant={isCheckedInToday ? "outline" : "default"}
                    className="w-full"
                  >
                    {isCheckedInToday ? 'Already Checked In Today' : 'Check In for Today'}
                    {!isCheckedInToday && <Calendar className="ml-2 h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => setIsCheckInSide(false)}
                  >
                    Edit Streak Start Date
                  </Button>
                </CardFooter>
              </motion.div>
            ) : (
              <motion.div
                key="streak-start-side"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-primary" />
                    Set Your Streak
                  </CardTitle>
                  <CardDescription>
                    Change Your Streak Start Date
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center">
                    <DatePicker onDateChange={setSelectedDate} preselectedDate={new Date(Date.now() - streak * 24 * 60 * 60 * 1000)} />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col items-center space-y-2">
                  <Button 
                    onClick={handleStreakSet} 
                    className="w-full"
                  >
                    Set Streak Start Date <CheckIcon className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => setIsCheckInSide(true)}
                  >
                    Cancel
                  </Button>
                </CardFooter>
              </motion.div>
            )}
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <DailyTasks className="h-full" />
        </motion.div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mb-8"
      >
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Emergency Support</CardTitle>
            <CardDescription>
              Need immediate help? Click below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PanicButton className="w-full" />
          </CardContent>
        </Card>
      </motion.div>
      
      <div className={`mb-8 ${isMobile ? "overflow-hidden" : ""}`}>
        <Tabs defaultValue="meditations" className="w-full">
          <TabsList className={`mb-6 ${isMobile ? "w-full overflow-x-auto flex" : "w-full flex"}`}>
            <TabsTrigger value="meditations" className="flex-1">Featured Meditations</TabsTrigger>
            <TabsTrigger value="community" className="flex-1">Global Community</TabsTrigger>
          </TabsList>
          
          <TabsContent value="meditations">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredMeditations.map((meditation, index) => (
                <motion.div
                  key={meditation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <MeditationCard {...meditation} />
                </motion.div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button variant="outline" asChild>
                <Link to="/meditations">
                  View All Meditations
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="community">
            <div className="space-y-6">
              <div className={`${isMobile ? "h-48" : ""}`}>
                <CommunityMap />
              </div>
              <div className="text-center">
                <Button variant="outline" asChild>
                  <Link to="/map">
                    View Full Map
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
};

export default Dashboard;
