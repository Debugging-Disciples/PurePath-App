import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ChevronRight, 
  HelpCircle,
  BookOpen,
  Sun,
  Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../utils/auth';
import { addJournalEntry, getJournalEntries } from '../utils/firebase';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

const DAILY_PROMPTS = [
  "What's one thing you're grateful for today?",
  "How did you handle urges or challenges today?",
  "What's something that brought you joy today?",
  "What's something you learned about yourself today?",
  "What's one small victory you had today?",
  "What's something you're looking forward to tomorrow?",
  "What's a way you showed kindness to yourself today?",
  "What's something that challenged you today and how did you respond?",
  "What's one positive change you've noticed in yourself recently?",
  "What did you do for self-care today?"
];

const NEGATIVE_EMOTIONS = [
  "Angry", "Anxious", "Scared", "Overwhelmed", "Ashamed", 
  "Disgusted", "Embarrassed", "Frustrated", "Annoyed", 
  "Jealous", "Stressed", "Worried", "Guilty", "Surprised",
  "Hopeless", "Irritated", "Lonely", "Discouraged", 
  "Disappointed", "Drained", "Sad"
];

const POSITIVE_EMOTIONS = [
  "Amazed", "Excited", "Surprised", "Passionate", "Happy", 
  "Joyful", "Brave", "Proud", "Confident", "Hopeful", 
  "Amused", "Satisfied", "Relieved", "Grateful", "Content",
  "Calm", "Peaceful", "Inspired", "Loved", "Refreshed"
];

const getMoodLabel = (score: number): string => {
  if (score <= 2) return "Very Unpleasant";
  if (score <= 4) return "Slightly Unpleasant";
  if (score <= 6) return "Neutral";
  if (score <= 8) return "Slightly Pleasant";
  return "Very Pleasant";
};

const getMoodBackground = (score: number, theme: string): string => {
  if (theme === 'light') {
    if (score <= 2) return "bg-slate-200";
    if (score <= 4) return "bg-slate-100";
    if (score <= 6) return "bg-white";
    if (score <= 8) return "bg-emerald-50";
    return "bg-emerald-100";
  } else {
    if (score <= 2) return "bg-slate-800";
    if (score <= 4) return "bg-slate-700";
    if (score <= 6) return "bg-slate-600";
    if (score <= 8) return "bg-emerald-900";
    return "bg-emerald-800";
  }
};

const getMoodColor = (score: number, theme: string): string => {
  if (theme === 'light') {
    if (score <= 4) return "text-blue-700";
    if (score <= 6) return "text-slate-700";
    return "text-green-700";
  } else {
    if (score <= 4) return "text-blue-300";
    if (score <= 6) return "text-slate-200";
    return "text-green-300";
  }
};

const Journal: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [moodScore, setMoodScore] = useState(5);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [journalText, setJournalText] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { theme, setTheme } = useTheme();
  const currentTheme = theme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme;

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * DAILY_PROMPTS.length);
    setPrompt(DAILY_PROMPTS[randomIndex]);
  }, []);

  const relevantEmotions = moodScore <= 5 ? NEGATIVE_EMOTIONS : POSITIVE_EMOTIONS;

  const handleEmotionToggle = (emotion: string) => {
    if (selectedEmotions.includes(emotion)) {
      setSelectedEmotions(selectedEmotions.filter(e => e !== emotion));
    } else {
      if (selectedEmotions.length < 3) {
        setSelectedEmotions([...selectedEmotions, emotion]);
      } else {
        toast.info("You can select up to 3 emotions");
      }
    }
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      toast.error("You must be logged in to journal");
      return;
    }

    if (journalText.trim() === '') {
      toast.error("Please write something in your journal");
      return;
    }

    setIsSubmitting(true);

    try {
      await addJournalEntry({
        userId: currentUser.uid,
        timestamp: new Date(),
        question: prompt,
        notes: journalText,
        level: moodScore,
        emotions: selectedEmotions
      });

      toast.success("Journal entry saved!");
      navigate('/dashboard');
    } catch (error) {
      console.error("Error saving journal entry:", error);
      toast.error("Failed to save journal entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  const moodLabel = getMoodLabel(moodScore);
  const backgroundClass = getMoodBackground(moodScore, currentTheme);
  const moodColorClass = getMoodColor(moodScore, currentTheme);

  const toggleTheme = () => {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className={`min-h-screen ${backgroundClass} transition-colors duration-300`}>
      <div className="container max-w-md py-8 px-4 mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            className={currentTheme === 'light' ? 'text-slate-800' : 'text-white'}
            onClick={() => {
              if (step > 1) {
                setStep(step - 1);
              } else {
                navigate('/dashboard');
              }
            }}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          
          <div className={`text-xl font-medium ml-10 ${moodColorClass}`}>
            {step === 1 ? 'How are you feeling?' : step === 2 ? 'Select Emotions' : 'Write in Journal'}
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              className={currentTheme === 'light' ? 'text-slate-800' : 'text-white'}
              disabled={step === 3 ? isSubmitting : false}
              onClick={() => {
                if (step < 3) {
                  setStep(step + 1);
                } else {
                  handleSubmit();
                }
              }}
            >
              {step === 3 ? 'Save' : 'Next'}
              {step < 3 && <ChevronRight className="ml-1 h-4 w-4" />}
            </Button>
          </div>
        </div>

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h1 className={`text-3xl font-bold mb-2 ${currentTheme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                Choose how you're feeling
              </h1>
              <p className={currentTheme === 'light' ? 'text-slate-600' : 'text-white/80'}>right now</p>
            </div>
            
            <div className="flex flex-col items-center justify-center py-2">
              <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                <div className={`absolute inset-0 rounded-full blur-lg bg-${moodScore > 5 ? 'green' : 'blue'}-${currentTheme === 'light' ? '200' : '400'} opacity-20`}></div>
                <div className={`w-36 h-36 rounded-full ${moodScore > 5 ? 'bg-green-400/30' : 'bg-blue-400/30'} flex items-center justify-center`}>
                  <div className={`w-24 h-24 rounded-full ${moodScore > 5 ? 'bg-green-400/50' : 'bg-blue-400/50'} flex items-center justify-center`}>
                    <div className={`w-16 h-16 rounded-full ${moodScore > 5 ? 'bg-green-400/70' : 'bg-blue-400/70'} flex items-center justify-center`}>
                      <div className={`w-8 h-8 rounded-full ${moodScore > 5 ? 'bg-green-400' : 'bg-blue-400'}`}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <h2 className={`text-4xl font-bold mb-12 ${moodColorClass}`}>
                {moodLabel}
              </h2>
              
              <div className="w-full px-4">
                <Slider
                  value={[moodScore]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(values) => setMoodScore(values[0])}
                  className="my-6"
                />
                
                <div className="flex justify-between text-sm">
                  <span className={currentTheme === 'light' ? 'text-slate-600' : 'text-white/70'}>VERY UNPLEASANT</span>
                  <span className={currentTheme === 'light' ? 'text-slate-600' : 'text-white/70'}>VERY PLEASANT</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className={`text-4xl font-bold mb-2 ${moodColorClass}`}>
                {moodLabel}
              </h2>
              <p className={`text-xl mb-8 ${currentTheme === 'light' ? 'text-slate-700' : 'text-white/80'}`}>
                What best describes this feeling?
              </p>
              <p className={`text-sm ${currentTheme === 'light' ? 'text-slate-500' : 'text-white/60'}`}>
                Select up to 3 emotions
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {relevantEmotions.map((emotion) => (
                <Badge
                  key={emotion}
                  variant={selectedEmotions.includes(emotion) ? "default" : "outline"}
                  className={`text-md py-2 px-4 cursor-pointer ${
                    selectedEmotions.includes(emotion) 
                      ? moodScore > 5 
                        ? currentTheme === 'light' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-600 hover:bg-green-700' 
                        : currentTheme === 'light' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700' 
                      : currentTheme === 'light' ? 'hover:bg-slate-200 text-slate-800' : 'hover:bg-white/10'
                  }`}
                  onClick={() => handleEmotionToggle(emotion)}
                >
                  {emotion}
                </Badge>
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <Card className={currentTheme === 'light' ? 'bg-white shadow-md border-slate-200' : 'bg-white/10 border-none'}>
              <CardContent className="p-4">
                <h3 className={`text-xl font-medium mb-2 ${currentTheme === 'light' ? 'text-slate-800' : 'text-white'}`}>Today's Prompt</h3>
                <p className={currentTheme === 'light' ? 'text-slate-700 mb-4' : 'text-white/80 mb-4'}>{prompt}</p>
                <Textarea
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                  placeholder="Write your thoughts here..."
                  className={currentTheme === 'light' 
                    ? 'min-h-[200px] bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400' 
                    : 'min-h-[200px] bg-white/5 border-white/20 text-white placeholder:text-white/50'}
                />
              </CardContent>
            </Card>
            
            <div className="space-y-4">
              <h3 className={`text-xl font-medium ${currentTheme === 'light' ? 'text-slate-800' : 'text-white'}`}>Your mood</h3>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${moodScore > 5 ? 'bg-green-400/70' : 'bg-blue-400/70'} flex-shrink-0`}></div>
                <div>
                  <p className={`font-medium ${moodColorClass}`}>{moodLabel}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedEmotions.map(emotion => (
                      <Badge key={emotion} variant="outline" className={currentTheme === 'light' ? 'text-xs bg-slate-100 text-slate-700' : 'text-xs bg-white/10'}>
                        {emotion}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div className="mt-12 text-center">
          <Button 
            variant="outline" 
            onClick={() => navigate('/journal-entries')}
            className={`w-full py-6 journal-past-entries ${
              currentTheme === 'light' 
                ? 'border-slate-300 hover:bg-slate-100' 
                : 'border-white/20 hover:bg-white/10'
            }`}
          >
            <BookOpen className="mr-2 h-5 w-5" />
            Show Past Entries
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Journal;
