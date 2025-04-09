import React from 'react';
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useAuth } from '../utils/auth';
import { toast } from 'sonner';
import { notifyAccountabilityPartners } from '../utils/firebase';

interface PanicButtonProps {
  onEmergencyClick: () => void;
}

const PanicButton: React.FC<PanicButtonProps> = ({ onEmergencyClick }) => {
  const { currentUser } = useAuth();

  const handleEmergencyClick = async () => {
    if (currentUser && currentUser.uid) {
      // Notify accountability partners
      await notifyAccountabilityPartners(
        currentUser.uid,
        'emergency',
        'has pressed the emergency button and needs support'
      );
      
      // Call the provided callback function
      onEmergencyClick();
      toast.error('Emergency support triggered!');
    } else {
      toast.error('You must be logged in to use this feature.');
    }
  };

  return (
    <Button variant="destructive" onClick={handleEmergencyClick}>
      <AlertTriangle className="mr-2 h-4 w-4" />
      Emergency Support
    </Button>
  );
};

export default PanicButton;
