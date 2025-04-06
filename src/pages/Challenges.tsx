
import React from 'react';
import { motion } from 'framer-motion';
import CommunityChallenges from '@/components/CommunityChallenges';
import { useIsMobile } from "@/hooks/use-mobile";

const Challenges: React.FC = () => {
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
          Community Challenges
        </motion.h1>
        <motion.p 
          className="text-muted-foreground"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          Participate in challenges with the PurePath community
        </motion.p>
      </div>
      
      <CommunityChallenges className="w-full" />
    </motion.div>
  );
};

export default Challenges;
