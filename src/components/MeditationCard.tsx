
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Play, Pause, Heart, Volume2, VolumeX, AlertCircle } from 'lucide-react';
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
import { toast } from 'sonner';

export interface MeditationCardProps {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  category: string;
  favorite: boolean;
  imageUrl?: string;
  audioUrl?: string;
  type?: 'meditation' | 'breathing' | 'prayer' | 'devotional' | string;
  className?: string;
  tags?: string[];
  breathInDuration?: number;
  holdDuration?: number;
  breathOutDuration?: number;
}

// Fallback audio URLs in case the provided ones don't work
const FALLBACK_AUDIO = {
  meditation: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_1b1256f8c0.mp3',
  breathing: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d1718beae7.mp3', 
  prayer: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3',
  devotional: 'https://cdn.pixabay.com/download/audio/2021/08/08/audio_dc39bde808.mp3'
};

// Default fallback image URL if none is provided
const DEFAULT_IMAGE_URL = "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=500";

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
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [audioChecked, setAudioChecked] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { currentUser } = useAuth();

  useEffect(() => {
    let url = audioUrl;
    
    // Use fallback audio if no URL is provided based on content type
    if (!url || url.trim() === '') {
      url = FALLBACK_AUDIO[type as keyof typeof FALLBACK_AUDIO] || FALLBACK_AUDIO.meditation;
    }
    
    if (url) {
      audioRef.current = new Audio(url);
      audioRef.current.volume = volume;
      
      // Add event listeners for better error handling
      audioRef.current.addEventListener('canplaythrough', () => {
        console.log('Audio can play through:', url);
        setAudioLoaded(true);
        setAudioError(false);
        setAudioChecked(true);
      });
      
      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio loading error:', e);
        setAudioError(true);
        setAudioChecked(true);
        
        // Try fallback if original URL fails
        if (audioUrl === url && FALLBACK_AUDIO[type as keyof typeof FALLBACK_AUDIO]) {
          console.log('Trying fallback audio');
          const fallbackUrl = FALLBACK_AUDIO[type as keyof typeof FALLBACK_AUDIO] || FALLBACK_AUDIO.meditation;
          
          audioRef.current = new Audio(fallbackUrl);
          audioRef.current.volume = volume;
          
          // Set up new listeners for fallback
          audioRef.current.addEventListener('canplaythrough', () => {
            console.log('Fallback audio can play through');
            setAudioLoaded(true);
            setAudioError(false);
          });
          
          audioRef.current.addEventListener('error', () => {
            console.error('Fallback audio also failed');
            toast.error('Could not load audio. Please try again later.');
            setAudioError(true);
          });
          
          audioRef.current.load();
        } else {
          toast.error('Could not load audio. Please try again.');
        }
      });
      
      // Preload the audio
      audioRef.current.load();
      
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.removeEventListener('canplaythrough', () => {});
          audioRef.current.removeEventListener('error', () => {});
          audioRef.current.src = "";
        }
      };
    }
  }, [audioUrl, type, volume]);

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

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioRef.current) audioRef.current.pause();
    } else {
      setIsPlaying(true);
      
      if (audioRef.current) {
        audioRef.current.currentTime = elapsedTime;
        
        // Log before play attempt to help with debugging
        console.log('Attempting to play audio:', audioRef.current.src);
        
        audioRef.current.play()
          .then(() => {
            console.log('Audio playing successfully');
          })
          .catch(error => {
            console.error("Audio playback error:", error);
            
            // Try to recover with user interaction
            toast.error('Audio playback failed. Trying to recover...');
            
            // If there's an error, try to recreate the audio element
            const currentSrc = audioRef.current?.src;
            if (currentSrc) {
              audioRef.current = new Audio(currentSrc);
              audioRef.current.volume = isMuted ? 0 : volume;
              audioRef.current.currentTime = elapsedTime;
              
              // Try playing again with slightly delayed second attempt
              setTimeout(() => {
                if (audioRef.current) {
                  audioRef.current.play()
                    .catch(() => {
                      setIsPlaying(false);
                      toast.error('Could not play audio. Check your browser settings or try another meditation.');
                    });
                }
              }, 500);
            }
          });
      }
      
      const totalSeconds = duration * 60;
      const incrementPerInterval = 100 / (totalSeconds / 0.1);

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

  const getBadgeVariant = () => {
    const typeStr = String(type).toLowerCase();
    switch (typeStr) {
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
      <div className="relative">
        {imageUrl && (
          <div className="h-48 overflow-hidden">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 ease-apple hover:scale-105"
            />
          </div>
        )}
        
        {/* Coming soon overlay for cards with audio errors */}
        {audioChecked && audioError && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive mb-2" />
            <span className="font-medium">Audio Coming Soon</span>
          </div>
        )}
      </div>
      
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
          disabled={audioError}
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
