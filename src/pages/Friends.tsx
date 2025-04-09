
import React from 'react';
import { motion } from 'framer-motion';
import FriendsList from '@/components/FriendsList';
import PartnerProgress from '@/components/PartnerProgress';
import { useIsMobile } from "@/hooks/use-mobile";

const Friends: React.FC = () => {
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
          Friends & Accountability
        </motion.h1>
        <motion.p 
          className="text-muted-foreground"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          Connect with others and share your recovery journey
        </motion.p>
      </div>
      
      <div className="space-y-8">
        <FriendsList />
        <PartnerProgress />
      </div>
    </motion.div>
  );
};

export default Friends;
