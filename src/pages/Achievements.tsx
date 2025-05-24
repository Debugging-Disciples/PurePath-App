
import React from 'react';
import { motion } from 'framer-motion';
import AchievementSystem from '@/components/AchievementSystem';
import { useIsMobile } from "@/hooks/use-mobile";

const Achievements: React.FC = () => {
  const isMobile = useIsMobile();
  
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
      
      <div className="grid gap-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-xl font-semibold mb-4">In Progress</h2>
          <AchievementSystem className="w-full" showAll={true} filter="inProgress" defaultLevel={1} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold mb-4">Completed</h2>
          <AchievementSystem className="w-full" showAll={true} filter="completed" defaultLevel={1} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Achievements;
