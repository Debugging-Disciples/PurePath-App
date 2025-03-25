import React, { useState, useEffect } from 'react'; // Import useEffect
import { cn } from '@/lib/utils';
import { Play, Pause, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/utils/auth';
import { db } from '@/utils/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';

interface MeditationCardProps {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  category: string;
  favorite: boolean;
  imageUrl?: string;
  className?: string;
}

const MeditationCard: React.FC<MeditationCardProps> = ({
  id,
  title,
  description,
  duration,
  category,
  favorite,
  imageUrl,
  className,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  let intervalRef: NodeJS.Timeout | null = null;
  const { currentUser } = useAuth(); // Get the current user from auth context

  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setIsFavorited(userData.meditations?.includes(id) || false);
        }
      }
    };

    fetchFavoriteStatus();
  }, [currentUser, id]); // Re-run when currentUser or id changes

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (intervalRef) clearInterval(intervalRef);
    } else {
      setIsPlaying(true);
      const totalSeconds = duration * 60;
      const incrementPerInterval = 100 / (totalSeconds / 0.1); // Update every 100ms

      intervalRef = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + incrementPerInterval;
          if (newProgress >= 100) {
            setIsPlaying(false);
            if (intervalRef) clearInterval(intervalRef);
            return 100;
          }
          return newProgress;
        });

        setElapsedTime(prev => {
          const newTime = prev + 0.1;
          return newTime;
        });
      }, 100);
    }
  };

  const handleFavorite = async () => {
    if (!currentUser) {
      console.error('User not authenticated');
      return;
    }

    const userDocRef = doc(db, 'users', currentUser.uid);

    try {
      if (!isFavorited) {
        await updateDoc(userDocRef, {
          meditations: arrayUnion(id),
        });
        console.log('Added to favorites');
      } else {
        await updateDoc(userDocRef, {
          meditations: arrayRemove(id),
        });
        console.log('Removed from favorites');
      }

      setIsFavorited(!isFavorited); // Update local state *after* Firebase update
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <Card className={cn("overflow-hidden transition-all duration-300 ease-apple hover:shadow-md", className)}>
      {imageUrl && (
        <div className="h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 ease-apple hover:scale-105"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <Badge className="mb-2">{category}</Badge>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">{description}</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavorite}
            className="mt-0"
          >
            <Heart
              className={cn(
                "h-5 w-5 transition-all duration-300 ease-apple",
                isFavorited ? "fill-destructive text-destructive" : "text-muted-foreground"
              )}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-2">
          {isPlaying ? formatTime(elapsedTime) : "0:00"} / {duration}:00
        </div>
        <Progress value={progress} className="h-1.5" />
      </CardContent>
      <CardFooter className="pt-2 justify-between">
        <div className="text-sm text-muted-foreground">
          {duration} min
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handlePlayPause}
          className="transition-all duration-200 ease-apple flex items-center"
        >
          {isPlaying ? (
            <>
              <Pause className="mr-1 h-4 w-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="mr-1 h-4 w-4" />
              Start
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MeditationCard;