
import React from 'react';
import CommunityMap from '@/components/CommunityMap';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

const Map: React.FC = () => {
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
        <h1 className="text-3xl font-bold mb-2">Community Map</h1>
        <p className="text-muted-foreground">
          See where members are located around the world
        </p>
      </motion.div>
      
      <div className="bg-muted/30 p-4 rounded-lg flex items-start gap-3 mb-6">
        <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <p className="mb-1">
            <strong>Privacy note:</strong> For privacy and security, only approximate locations are shown. 
            No personal information is ever displayed on the map.
          </p>
          <p>
            You can update your location preferences in your profile settings.
          </p>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <CommunityMap className="w-full h-[70vh]" />
      </motion.div>
      
      <div className="mt-8 bg-card border border-border rounded-lg p-6">
        <h3 className="text-xl font-medium mb-3">About Our Community</h3>
        <p className="text-muted-foreground mb-6">
          PurePath's global community spans across 130+ countries. Each pin represents 
          a member on their journey to freedom. Remember, you're never alone in this journey.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline">Join a Local Group</Button>
          <Button variant="outline">Connect with Members</Button>
        </div>
      </div>
    </motion.div>
  );
};

export default Map;