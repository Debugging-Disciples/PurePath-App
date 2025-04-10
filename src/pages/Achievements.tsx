
import React from 'react';
import { motion } from 'framer-motion';
import AchievementSystem from '@/components/AchievementSystem';
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <AchievementSystem className="w-full" showAll={true} filter="all" />
        </TabsContent>
        <TabsContent value="in-progress">
          <AchievementSystem className="w-full" showAll={true} filter="in-progress" />
        </TabsContent>
        <TabsContent value="completed">
          <AchievementSystem className="w-full" showAll={true} filter="completed" />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Achievements;
