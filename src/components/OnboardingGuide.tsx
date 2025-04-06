
import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ChevronRight, Book, HeartPulse, MessageCircle, BarChart, Map, Award } from 'lucide-react';
import { toast } from 'sonner';
import { CustomBadge } from '@/components/ui/custom-badge';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  link: string;
  icon: React.ReactNode;
  completed: boolean;
}

const defaultSteps: OnboardingStep[] = [
  {
    id: 'profile',
    title: 'Complete Your Profile',
    description: 'Add personal details and preferences',
    link: '/profile',
    icon: <Award className="h-5 w-5 text-purple-500" />,
    completed: false
  },
  {
    id: 'meditation',
    title: 'Try Your First Meditation',
    description: 'Complete a quick guided session',
    link: '/meditations',
    icon: <HeartPulse className="h-5 w-5 text-blue-500" />,
    completed: false
  },
  {
    id: 'journal',
    title: 'Write in Your Journal',
    description: 'Record your thoughts and progress',
    link: '/journal',
    icon: <Book className="h-5 w-5 text-green-500" />,
    completed: false
  },
  {
    id: 'community',
    title: 'Join the Community',
    description: 'Connect with others on similar journeys',
    link: '/community',
    icon: <MessageCircle className="h-5 w-5 text-orange-500" />,
    completed: false
  },
  {
    id: 'map',
    title: 'Explore the Global Map',
    description: 'See others around the world on this journey',
    link: '/map',
    icon: <Map className="h-5 w-5 text-teal-500" />,
    completed: false
  }
];

const OnboardingGuide: React.FC<{ className?: string }> = ({ className }) => {
  const [steps, setSteps] = useState<OnboardingStep[]>(defaultSteps);
  const [progress, setProgress] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchOnboardingStatus = async () => {
      if (!currentUser) return;
      
      try {
        const onboardingRef = doc(db, 'users', currentUser.uid, 'userData', 'onboarding');
        const onboardingSnap = await getDoc(onboardingRef);
        
        if (onboardingSnap.exists()) {
          const data = onboardingSnap.data();
          setSteps(data.steps || defaultSteps);
          setDismissed(data.dismissed || false);
          
          // Calculate progress
          const completedCount = data.steps.filter((step: OnboardingStep) => step.completed).length;
          setProgress((completedCount / data.steps.length) * 100);
        } else {
          // Initialize onboarding data
          await updateDoc(onboardingRef, {
            steps: defaultSteps,
            dismissed: false,
            lastUpdated: new Date()
          });
        }
      } catch (error) {
        console.error('Error fetching onboarding status:', error);
      }
    };
    
    fetchOnboardingStatus();
  }, [currentUser]);
  
  const markStepCompleted = async (stepId: string) => {
    if (!currentUser) return;
    
    try {
      const updatedSteps = steps.map(step => 
        step.id === stepId ? { ...step, completed: true } : step
      );
      
      // Update local state
      setSteps(updatedSteps);
      
      // Calculate new progress
      const completedCount = updatedSteps.filter(step => step.completed).length;
      const newProgress = (completedCount / updatedSteps.length) * 100;
      setProgress(newProgress);
      
      // Update in Firestore
      const onboardingRef = doc(db, 'users', currentUser.uid, 'userData', 'onboarding');
      await updateDoc(onboardingRef, {
        steps: updatedSteps,
        lastUpdated: new Date()
      });
      
      // Show toast notification
      toast.success(`Step completed: ${steps.find(s => s.id === stepId)?.title}`, {
        description: "Your progress has been saved",
      });
      
      // If all steps completed
      if (newProgress === 100) {
        toast.success("🎉 Onboarding complete!", {
          description: "You've completed all steps. Your journey begins now!",
          duration: 5000
        });
        
        // Add XP bonus for completing onboarding
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          await updateDoc(userRef, {
            xp: (userData.xp || 0) + 200,
            onboardingCompleted: true
          });
        }
      }
    } catch (error) {
      console.error('Error updating onboarding step:', error);
    }
  };
  
  const dismissOnboarding = async () => {
    if (!currentUser) return;
    
    try {
      setDismissed(true);
      
      const onboardingRef = doc(db, 'users', currentUser.uid, 'userData', 'onboarding');
      await updateDoc(onboardingRef, {
        dismissed: true
      });
    } catch (error) {
      console.error('Error dismissing onboarding:', error);
    }
  };
  
  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={className}>
          <CardHeader className="pb-4">
            <CardTitle className="flex justify-between items-center">
              <span>Getting Started</span>
              <CustomBadge variant="success">{Math.round(progress)}% Complete</CustomBadge>
            </CardTitle>
            <Progress value={progress} className="h-2 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div 
                  key={step.id}
                  className={`flex items-start p-3 rounded-md ${
                    step.completed ? 'bg-secondary/20' : 'border border-border'
                  }`}
                >
                  <div className="mr-3 mt-1">
                    {step.completed ? (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    ) : (
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-secondary text-xs font-bold">
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  <div className="ml-2">
                    {step.completed ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        disabled
                        className="text-muted-foreground"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        asChild
                        onClick={() => markStepCompleted(step.id)}
                      >
                        <Link to={step.link}>
                          Go <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="justify-end pt-2">
            <Button variant="ghost" size="sm" onClick={dismissOnboarding}>
              Dismiss
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingGuide;
