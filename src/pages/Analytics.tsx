
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import ProgressChart from '@/components/ProgressChart';
import { logRelapse, getUserTriggers } from '../utils/firebase';
import { useAuth } from '../utils/auth';
import { motion } from 'framer-motion';
import { AlertTriangle, Trophy, CalendarDays, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { MultiSelect } from '@/components/ui/multi-select';

const mockStreakData = [
  { date: 'Jan 1', streak: 1 },
  { date: 'Jan 2', streak: 2 },
  { date: 'Jan 3', streak: 3 },
  { date: 'Jan 4', streak: 4 },
  { date: 'Jan 5', streak: 5 },
  { date: 'Jan 6', streak: 6 },
  { date: 'Jan 7', streak: 7 },
  { date: 'Jan 8', streak: 8 },
  { date: 'Jan 9', streak: 0 },
  { date: 'Jan 10', streak: 1 },
  { date: 'Jan 11', streak: 2 },
  { date: 'Jan 12', streak: 3 },
  { date: 'Jan 13', streak: 4 },
  { date: 'Jan 14', streak: 5 }
];

const mockMoodData = [
  { date: 'Jan 1', streak: 1, mood: 5 },
  { date: 'Jan 2', streak: 2, mood: 6 },
  { date: 'Jan 3', streak: 3, mood: 7 },
  { date: 'Jan 4', streak: 4, mood: 8 },
  { date: 'Jan 5', streak: 5, mood: 7 },
  { date: 'Jan 6', streak: 6, mood: 9 },
  { date: 'Jan 7', streak: 7, mood: 8 },
  { date: 'Jan 8', streak: 8, mood: 8 },
  { date: 'Jan 9', streak: 0, mood: 3 },
  { date: 'Jan 10', streak: 1, mood: 4 },
  { date: 'Jan 11', streak: 2, mood: 6 },
  { date: 'Jan 12', streak: 3, mood: 7 },
  { date: 'Jan 13', streak: 4, mood: 8 },
  { date: 'Jan 14', streak: 5, mood: 9 }
];

interface TriggerData {
  name: string;
  count: number;
}

const triggerOptions = [
  { value: 'stress', label: 'Stress' },
  { value: 'boredom', label: 'Boredom' },
  { value: 'loneliness', label: 'Loneliness' },
  { value: 'fatigue', label: 'Fatigue' },
  { value: 'social-media', label: 'Social Media' },
  { value: 'peer-pressure', label: 'Peer Pressure' },
  { value: 'emotional-distress', label: 'Emotional Distress' },
  { value: 'other', label: 'Other' },
];

const Analytics: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [notes, setNotes] = useState('');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [triggerData, setTriggerData] = useState<TriggerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchTriggerData = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        const triggers = await getUserTriggers(currentUser.uid);
        setTriggerData(triggers);
      } catch (error) {
        console.error('Error fetching trigger data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTriggerData();
  }, [currentUser]);
  
  const handleRelapseSubmit = async () => {
    if (!currentUser) return;
    if (selectedTriggers.length === 0) {
      toast.error("Please select at least one trigger");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const relapseNotes = notes.trim();
      const result = await logRelapse(currentUser.uid, selectedTriggers, relapseNotes);
      
      if (result.success) {
        toast.success("Progress reset", {
          description: "Remember that every moment is a new opportunity to begin again."
        });
        
        setNotes('');
        setSelectedTriggers([]);
        
        const updatedTriggers = await getUserTriggers(currentUser.uid);
        setTriggerData(updatedTriggers);
      } else {
        toast.error("Failed to log relapse", {
          description: result.message
        });
      }
    } catch (error) {
      console.error('Error logging relapse:', error);
      toast.error("An error occurred", {
        description: "Please try again later."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const currentStreak = userProfile?.streakDays || 0;
  const lastCheckIn = userProfile?.lastCheckIn 
    ? userProfile.lastCheckIn.toDate() 
    : new Date();
  
  const longestStreak = Math.max(...mockStreakData.map(d => d.streak), currentStreak);
  const averageStreak = Math.round(mockStreakData.reduce((acc, curr) => acc + curr.streak, 0) / mockStreakData.length);
  
  const formattedTriggerData = triggerData.map(trigger => {
    const triggerOption = triggerOptions.find(option => option.value === trigger.name);
    return {
      name: triggerOption?.label || trigger.name,
      count: trigger.count
    };
  });
  
  return (
    <motion.div 
      className="container max-w-6xl py-8 pb-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold mb-2">Your Progress</h1>
        <p className="text-muted-foreground">
          Track your journey and identify patterns
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Trophy className="h-5 w-5 mr-2 text-primary" />
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-6">
              <div className="text-center">
                <div className="text-5xl font-bold mb-1 text-primary">
                  {currentStreak}
                </div>
                <div className="text-muted-foreground">
                  days
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                Longest Streak
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-6">
              <div className="text-center">
                <div className="text-5xl font-bold mb-1 text-primary">
                  {longestStreak}
                </div>
                <div className="text-muted-foreground">
                  days
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <CalendarDays className="h-5 w-5 mr-2 text-primary" />
                Last Check-in
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-6">
              <div className="text-center">
                <div className="text-xl font-medium mb-1">
                  {lastCheckIn.toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric'
                  })}
                </div>
                <div className="text-muted-foreground">
                  {lastCheckIn.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <Tabs defaultValue="progress">
        <TabsList className="mb-6">
          <TabsTrigger value="progress">Progress Charts</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="relapse">Report Relapse</TabsTrigger>
        </TabsList>
        
        <TabsContent value="progress">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <ProgressChart data={mockStreakData} type="streak" />
            <ProgressChart data={mockMoodData} type="mood" />
          </motion.div>
        </TabsContent>
        
        <TabsContent value="insights">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Common Triggers</CardTitle>
                <CardDescription>
                  Understanding your patterns helps prevent relapses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    {isLoading ? (
                      <div className="flex justify-center p-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : triggerData.length === 0 ? (
                      <div className="text-center p-6 text-muted-foreground">
                        No trigger data available for the last 7 days
                      </div>
                    ) : (
                      formattedTriggerData.map((trigger, index) => (
                        <div key={trigger.name} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{trigger.name}</span>
                            <span className="text-sm text-muted-foreground">{trigger.count} times</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-primary rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${(trigger.count / Math.max(...formattedTriggerData.map(t => t.count))) * 100}%` }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="p-4 bg-secondary rounded-lg">
                    <h4 className="font-medium mb-2">Personalized Recommendations</h4>
                    <ul className="space-y-2 text-sm">
                      {triggerData.length > 0 ? (
                        <>
                          <li className="flex items-start gap-2">
                            <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">
                              1
                            </span>
                            <span>Try the "Stress Management" meditation series to help cope with your main trigger</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">
                              2
                            </span>
                            <span>Consider developing a structured evening routine to reduce boredom triggers</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">
                              3
                            </span>
                            <span>Your mood is consistently higher when you maintain at least 3 days of streak</span>
                          </li>
                        </>
                      ) : (
                        <li className="text-muted-foreground">
                          Log relapses with triggers to receive personalized recommendations
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="relapse">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
                  Report a Relapse
                </CardTitle>
                <CardDescription>
                  Honesty is critical for true progress. Reporting relapses helps identify patterns.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="trigger">What triggered this relapse? (select all that apply)</Label>
                  <MultiSelect
                    options={triggerOptions}
                    selected={selectedTriggers}
                    onChange={setSelectedTriggers}
                    placeholder="Select triggers..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="What happened? What could you do differently next time?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleRelapseSubmit}
                  disabled={isSubmitting || selectedTriggers.length === 0}
                >
                  {isSubmitting ? 'Submitting...' : 'Report Relapse & Reset Counter'}
                </Button>
                
                <p className="text-sm text-muted-foreground">
                  Remember: this is a journey, not a competition. Every setback is an opportunity to learn.
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Analytics;
