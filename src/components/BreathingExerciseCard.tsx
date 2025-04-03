
import React, { useState, useRef, useEffect } from 'react';
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
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface BreathingExerciseCardProps {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  category: string;
  favorite: boolean;
  imageUrl?: string;
  audioUrl?: string;
  className?: string;
  breathInDuration?: number; // in seconds
  holdDuration?: number; // in seconds
  breathOutDuration?: number; // in seconds
}

// Fallback audio URLs
const FALLBACK_AUDIO = {
  ambient: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d1718beae7.mp3',
  inhale: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3',
  exhale: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_c8a329b5aa.mp3'
};

const BreathingExerciseCard: React.FC<BreathingExerciseCardProps> = ({
  id,
  title,
  description,
  duration,
  category,
  favorite,
  imageUrl,
  audioUrl,
  className,
  breathInDuration = 4,
  holdDuration = 4,
  breathOutDuration = 6,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorited, setIsFavorited] = useState(favorite);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [breathState, setBreathState] = useState<'in' | 'hold' | 'out'>('in');
  const [breathProgress, setBreathProgress] = useState(0);
  const [instruction, setInstruction] = useState('Breathe In');
  const [audioError, setAudioError] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const breathIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const inhaleAudioRef = useRef<HTMLAudioElement | null>(null);
  const exhaleAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const { currentUser } = useAuth();

  // Initialize audio
  useEffect(() => {
    // Set up ambient background audio
    const ambientUrl = audioUrl || FALLBACK_AUDIO.ambient;
    
    audioRef.current = new Audio(ambientUrl);
    audioRef.current.volume = volume;
    audioRef.current.loop = true;
    
    audioRef.current.addEventListener('error', (e) => {
      console.error('Ambient audio loading error:', e);
      setAudioError(true);
      
      // Try fallback if original URL fails
      if (audioUrl === ambientUrl) {
        console.log('Trying fallback ambient audio');
        audioRef.current = new Audio(FALLBACK_AUDIO.ambient);
        audioRef.current.volume = volume;
        audioRef.current.loop = true;
        audioRef.current.load();
      }
    });
    
    // Set up inhale sound
    inhaleAudioRef.current = new Audio(FALLBACK_AUDIO.inhale);
    inhaleAudioRef.current.volume = volume;
    
    // Set up exhale sound
    exhaleAudioRef.current = new Audio(FALLBACK_AUDIO.exhale);
    exhaleAudioRef.current.volume = volume;
    
    // Preload all audios
    [audioRef, inhaleAudioRef, exhaleAudioRef].forEach(ref => {
      if (ref.current) ref.current.load();
    });
    
    return () => {
      [audioRef, inhaleAudioRef, exhaleAudioRef].forEach(ref => {
        if (ref.current) {
          ref.current.pause();
          ref.current.removeEventListener('canplaythrough', () => {});
          ref.current.removeEventListener('error', () => {});
          ref.current.src = "";
        }
      });
    };
  }, [audioUrl, volume]);

  // Check if this meditation is favorited
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

  // Handle volume changes
  useEffect(() => {
    [audioRef, inhaleAudioRef, exhaleAudioRef].forEach(ref => {
      if (ref.current) {
        ref.current.volume = isMuted ? 0 : volume;
      }
    });
  }, [volume, isMuted]);

  // Handle breathing cycle
  const startBreathingCycle = () => {
    if (breathIntervalRef.current) {
      clearInterval(breathIntervalRef.current);
    }

    setBreathState('in');
    setInstruction('Breathe In');
    setBreathProgress(0);

    let cycleTime = 0;
    const totalCycleTime = breathInDuration + holdDuration + breathOutDuration;

    if (inhaleAudioRef.current) {
      inhaleAudioRef.current.play().catch(e => {
        console.error("Could not play inhale audio:", e);
        // Try to reload the audio
        if (inhaleAudioRef.current) {
          inhaleAudioRef.current.load();
          setTimeout(() => inhaleAudioRef.current?.play().catch(() => {}), 500);
        }
      });
    }

    breathIntervalRef.current = setInterval(() => {
      cycleTime += 0.1;
      
      if (cycleTime < breathInDuration) {
        // Breathing in phase
        setBreathState('in');
        setInstruction('Breathe In');
        setBreathProgress((cycleTime / breathInDuration) * 100);
      } else if (cycleTime < breathInDuration + holdDuration) {
        // Holding phase
        if (breathState !== 'hold') {
          setBreathState('hold');
          setInstruction('Hold');
          setBreathProgress(100);
        }
      } else if (cycleTime < totalCycleTime) {
        // Breathing out phase
        if (breathState !== 'out') {
          setBreathState('out');
          setInstruction('Breathe Out');
          if (exhaleAudioRef.current) {
            exhaleAudioRef.current.play().catch(e => {
              console.error("Could not play exhale audio:", e);
              // Try to reload the audio
              if (exhaleAudioRef.current) {
                exhaleAudioRef.current.load();
                setTimeout(() => exhaleAudioRef.current?.play().catch(() => {}), 500);
              }
            });
          }
        }
        setBreathProgress(100 - ((cycleTime - breathInDuration - holdDuration) / breathOutDuration) * 100);
      } else {
        // Reset cycle
        cycleTime = 0;
        setBreathState('in');
        setInstruction('Breathe In');
        setBreathProgress(0);
        if (inhaleAudioRef.current) {
          inhaleAudioRef.current.play().catch(() => {});
        }
      }
    }, 100);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
      if (audioRef.current) audioRef.current.pause();
    } else {
      setIsPlaying(true);
      
      // Start ambient audio if available
      if (audioRef.current) {
        audioRef.current.play().catch(error => {
          console.error("Ambient audio playback error:", error);
          
          // Try alternative approach to get audio playing
          const currentSrc = audioRef.current?.src;
          audioRef.current = new Audio(currentSrc || FALLBACK_AUDIO.ambient);
          audioRef.current.volume = isMuted ? 0 : volume;
          audioRef.current.loop = true;
          
          setTimeout(() => {
            audioRef.current?.play().catch(() => {
              console.log("Still can't play audio after retry");
            });
          }, 500);
        });
      }
      
      // Start breathing visualization
      startBreathingCycle();
      
      // Start progress tracking
      const totalSeconds = duration * 60;
      const incrementPerInterval = 100 / (totalSeconds / 0.1);

      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + incrementPerInterval;
          if (newProgress >= 100) {
            setIsPlaying(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
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

  return (
    <Card className={cn("overflow-hidden transition-all duration-300 ease-apple hover:shadow-md", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <Badge className="mb-2" variant="secondary">
              Breathing Exercise
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
        <div className="flex flex-col items-center mb-6">
          <AnimatePresence mode="wait">
            <motion.div 
              className="relative flex items-center justify-center"
              key={breathState}
            >
              <motion.div
                className="w-32 h-32 rounded-full bg-gradient-to-r from-cyan-100 to-blue-200 dark:from-cyan-900 dark:to-blue-800"
                animate={{
                  scale: breathState === 'in' ? [1, 1.8] : 
                         breathState === 'hold' ? 1.8 : 
                         [1.8, 1],
                  opacity: [0.8, 1, 0.8],
                  backgroundColor: 
                    breathState === 'in' ? ['#bae6fd', '#93c5fd'] : 
                    breathState === 'hold' ? ['#93c5fd', '#93c5fd'] : 
                    ['#93c5fd', '#bae6fd']
                }}
                transition={{
                  duration: breathState === 'in' ? breathInDuration : 
                           breathState === 'hold' ? holdDuration : 
                           breathOutDuration,
                  ease: breathState === 'hold' ? 'easeInOut' : 'easeInOut'
                }}
              />
            </motion.div>
          </AnimatePresence>
          
          <div className="mt-4 text-lg font-medium">{instruction}</div>
        </div>

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

export default BreathingExerciseCard;

