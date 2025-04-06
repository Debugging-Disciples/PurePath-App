
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Circle, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../utils/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { CustomBadge } from './ui/custom-badge';

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: string;
  link: string;
}

interface DailyTasksProps {
  className?: string;
}

const defaultTasks: Task[] = [
  {
    id: 'daily-meditation',
    title: 'Complete a Meditation',
    description: 'Take 5 minutes for mindfulness',
    completed: false,
    icon: 'heart-pulse',
    link: '/meditations'
  },
  {
    id: 'journal-entry',
    title: 'Write in Journal',
    description: 'Document your thoughts and progress',
    completed: false,
    icon: 'book-open',
    link: '/journal'
  },
  {
    id: 'check-community',
    title: 'Connect with Community',
    description: 'Share or find support with others',
    completed: false,
    icon: 'message-circle',
    link: '/community'
  }
];

const DailyTasks: React.FC<DailyTasksProps> = ({ className }) => {
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [progress, setProgress] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchTasks = async () => {
      if (!currentUser) return;
      
      try {
        const userTasksRef = doc(db, 'users', currentUser.uid, 'userData', 'dailyTasks');
        const userTasksSnap = await getDoc(userTasksRef);
        
        if (userTasksSnap.exists()) {
          // Check if we need to reset tasks (new day)
          const lastUpdated = userTasksSnap.data().lastUpdated?.toDate();
          const today = new Date();
          const isNewDay = !lastUpdated || 
            lastUpdated.getDate() !== today.getDate() ||
            lastUpdated.getMonth() !== today.getMonth() ||
            lastUpdated.getFullYear() !== today.getFullYear();
          
          if (isNewDay) {
            // Reset tasks for new day
            const resetTasks = defaultTasks.map(task => ({...task, completed: false}));
            await setDoc(userTasksRef, {
              tasks: resetTasks,
              lastUpdated: new Date()
            });
            setTasks(resetTasks);
            setProgress(0);
          } else {
            // Use existing tasks for today
            const fetchedTasks = userTasksSnap.data().tasks;
            setTasks(fetchedTasks);
            
            // Calculate progress
            const completedCount = fetchedTasks.filter((t: Task) => t.completed).length;
            setProgress((completedCount / fetchedTasks.length) * 100);
            
            // Check if all tasks are completed
            if (completedCount === fetchedTasks.length && fetchedTasks.length > 0) {
              setShowCelebration(true);
            }
          }
        } else {
          // First time setup
          await setDoc(userTasksRef, {
            tasks: defaultTasks,
            lastUpdated: new Date()
          });
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    
    fetchTasks();
  }, [currentUser]);
  
  const toggleTask = async (taskId: string) => {
    if (!currentUser) return;
    
    try {
      // Update local state
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      
      setTasks(updatedTasks);
      
      // Calculate new progress
      const completedCount = updatedTasks.filter(t => t.completed).length;
      const newProgress = (completedCount / updatedTasks.length) * 100;
      setProgress(newProgress);
      
      // Update in Firestore
      const userTasksRef = doc(db, 'users', currentUser.uid, 'userData', 'dailyTasks');
      await updateDoc(userTasksRef, {
        tasks: updatedTasks,
        lastUpdated: new Date()
      });
      
      // Show celebration if all tasks completed
      if (newProgress === 100 && completedCount === updatedTasks.length) {
        setShowCelebration(true);
        
        // Also update user's XP or points if using gamification
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const currentXP = userData.xp || 0;
          const dailyXP = 50; // Award 50 XP for completing all daily tasks
          
          await updateDoc(userRef, {
            xp: currentXP + dailyXP,
            lastDailyTaskCompletion: new Date()
          });
          
          // Show toast with XP gain
          toast.success(`🎉 Daily tasks completed! +${dailyXP} XP`, {
            description: "Great job completing all your tasks for today!",
            duration: 5000
          });
        }
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };
  
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'heart-pulse':
        return <div className="bg-primary/10 p-2 rounded-full"><CheckCircle className="h-4 w-4 text-primary" /></div>;
      case 'book-open':
        return <div className="bg-blue-500/10 p-2 rounded-full"><CheckCircle className="h-4 w-4 text-blue-500" /></div>;
      case 'message-circle': 
        return <div className="bg-green-500/10 p-2 rounded-full"><CheckCircle className="h-4 w-4 text-green-500" /></div>;
      default:
        return <div className="bg-gray-500/10 p-2 rounded-full"><CheckCircle className="h-4 w-4 text-gray-500" /></div>;
    }
  };

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center justify-between">
          <span>Daily Tasks</span>
          <span className="text-sm font-normal text-muted-foreground">
            {Math.round(progress)}% Complete
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 mt-2">
          <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
        
        <div className="space-y-3">
          {tasks.map(task => (
            <div 
              key={task.id}
              className={cn(
                "flex items-start justify-between p-3 rounded-md transition-colors",
                task.completed ? "bg-primary/5" : "hover:bg-secondary/30"
              )}
            >
              <div className="flex items-start space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "rounded-full p-0 h-6 w-6 flex items-center justify-center",
                    task.completed ? "text-primary" : "text-muted-foreground"
                  )}
                  onClick={() => toggleTask(task.id)}
                >
                  {task.completed ? <CheckCircle className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                </Button>
                <div>
                  <p className={cn(
                    "font-medium leading-none", 
                    task.completed ? "text-muted-foreground line-through" : ""
                  )}>
                    {task.title}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {task.description}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2"
                asChild
              >
                <Link to={task.link}>
                  Go
                </Link>
              </Button>
            </div>
          ))}
        </div>
        
        {/* Celebration Animation */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div 
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onAnimationComplete={() => {
                setTimeout(() => setShowCelebration(false), 3000);
              }}
            >
              <div className="relative">
                {/* Confetti effect */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ 
                    scale: [0.8, 1.2, 1], 
                    opacity: [0, 1, 1] 
                  }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="bg-primary/90 text-white rounded-full p-6 shadow-lg">
                    <Trophy className="h-12 w-12 animate-pulse" />
                  </div>
                </motion.div>
                
                {/* Flying particles */}
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute h-2 w-2 rounded-full bg-yellow-400"
                    initial={{ 
                      x: 0, 
                      y: 0, 
                      opacity: 1 
                    }}
                    animate={{ 
                      x: Math.random() > 0.5 ? Math.random() * 100 : Math.random() * -100,
                      y: Math.random() > 0.5 ? Math.random() * 100 : Math.random() * -100,
                      opacity: 0
                    }}
                    transition={{ duration: 1.5, delay: i * 0.05 }}
                  />
                ))}
                
                {/* Celebration message */}
                <motion.div
                  className="absolute top-28 left-1/2 transform -translate-x-1/2 bg-white text-primary font-bold px-4 py-2 rounded-lg shadow-lg"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  All tasks completed!
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default DailyTasks;
