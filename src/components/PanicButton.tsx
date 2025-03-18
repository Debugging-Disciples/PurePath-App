
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

interface PanicButtonProps {
  className?: string;
}

const PanicButton: React.FC<PanicButtonProps> = ({ className }) => {
  const [isActivated, setIsActivated] = useState(false);
  
  const handleActivate = () => {
    setIsActivated(true);
  };
  
  const handleDeactivate = () => {
    setIsActivated(false);
  };
  
  const emergencyTips = [
    "Take slow, deep breaths. Inhale for 4 seconds, hold for 4, exhale for 6.",
    "Step away from your device immediately.",
    "Do 20 pushups or jumping jacks to redirect the energy.",
    "Call or text someone you trust right now.",
    "Go for a walk outside - even just around the block.",
    "Remind yourself of your 'why' - why are you committed to this journey?",
    "Visualize how you'll feel tomorrow if you stay strong today.",
    "Splash cold water on your face.",
    "Focus on a productive task or hobby for the next 30 minutes."
  ];
  
  return (
    <div className={cn("relative", className)}>
      <AnimatePresence mode="wait">
        {!isActivated ? (
          <motion.div
            key="button"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Button 
              variant="destructive" 
              size="lg" 
              onClick={handleActivate}
              className="group w-full h-14 text-lg font-medium transition-all duration-300 ease-apple"
            >
              <AlertTriangle className="mr-2 h-5 w-5 transition-transform duration-300 ease-apple group-hover:scale-110" />
              Emergency Help
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="emergency-card"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Card className="border-destructive">
              <CardHeader className="bg-destructive text-destructive-foreground rounded-t-lg">
                <CardTitle className="flex items-center text-xl">
                  <AlertTriangle className="mr-2 h-6 w-6" />
                  Emergency Response
                </CardTitle>
                <CardDescription className="text-destructive-foreground/80">
                  Take immediate action to overcome this urge
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-3">Do these right now:</h3>
                <ul className="space-y-3">
                  {emergencyTips.map((tip, index) => (
                    <motion.li 
                      key={index}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start"
                    >
                      <span className="bg-destructive/10 text-destructive rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">
                        {index + 1}
                      </span>
                      <span>{tip}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  onClick={handleDeactivate}
                  className="w-full"
                >
                  I'm Better Now
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PanicButton;
