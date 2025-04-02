
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Play, Pause, Heart, Volume2, VolumeX } from 'lucide-react';
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
import { Slider } from '@/components/ui/slider';

interface MeditationCardProps {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  category: string;
  favorite: boolean;
  imageUrl?: string;
  audioUrl?: string;
  type?: 'meditation' | 'breathing' | 'prayer' | 'devotional';
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
  audioUrl,
  type = 'meditation',
  className,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { currentUser } = useAuth();

  // Set up audio element if audioUrl is provided
  useEffect(() => {
    if (audioUrl) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.volume = volume;
      
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = "";
        }
      };
    }
  }, [audioUrl]);

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
  }, [currentUser, id]);

  // Update audio volume when volume state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle play/pause for both timer and audio
  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioRef.current) audioRef.current.pause();
    } else {
      setIsPlaying(true);
      
      // Start audio if available
      if (audioRef.current) {
        audioRef.current.currentTime = elapsedTime;
        audioRef.current.play().catch(error => {
          console.error("Audio playback error:", error);
          // Fall back to timer-only mode if audio fails
        });
      }
      
      const totalSeconds = duration * 60;
      const incrementPerInterval = 100 / (totalSeconds / 0.1); // Update every 100ms

      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + incrementPerInterval;
          if (newProgress >= 100) {
            setIsPlaying(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (audioRef.current) audioRef.current.pause();
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

      setIsFavorited(!isFavorited);
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setIsMuted(value[0] === 0);
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Get the appropriate badge color based on meditation type
  const getBadgeVariant = () => {
    switch (type) {
      case 'breathing':
        return 'secondary';
      case 'prayer':
        return 'outline';
      case 'devotional':
        return 'default';
      default:
        return undefined; // Use default variant
    }
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
            <Badge className="mb-2" variant={getBadgeVariant()}>
              {type === 'meditation' ? category : type.charAt(0).toUpperCase() + type.slice(1)}
            </Badge>
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
        <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
          <div>{isPlaying ? formatTime(elapsedTime) : "0:00"} / {duration}:00</div>
          
          {audioUrl && (
            <div 
              className="relative"
              onMouseEnter={() => setShowVolumeControl(true)}
              onMouseLeave={() => setShowVolumeControl(false)}
            >
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </Button>
              
              {showVolumeControl && (
                <div className="absolute bottom-full right-0 bg-background border rounded-md p-3 shadow-md mb-2 w-32">
                  <Slider
                    value={[volume]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                  />
                </div>
              )}
            </div>
          )}
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
