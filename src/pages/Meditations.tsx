import React, { useState, useEffect } from 'react'; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import MeditationCard from '@/components/MeditationCard';
import BreathingExerciseCard from '@/components/BreathingExerciseCard';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useAuth } from '@/utils/auth'; 
import { db } from '@/utils/firebase'; 
import { doc, getDoc } from 'firebase/firestore';

// Enhanced meditation data with better audio sources
const MEDITATIONS_DATA = [
    // Original meditations with updated audio
    {
        id: '1',
        title: 'Urge Surfing',
        description: 'Learn to ride the wave of desire without giving in',
        duration: 10,
        category: 'Beginner',
        favorite: false,
        type: 'meditation',
        imageUrl: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&q=80&w=500',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_1b1256f8c0.mp3',
        tags: ['urges', 'beginner', 'recovery']
    },
    {
        id: '2',
        title: 'Morning Clarity',
        description: 'Start your day with purpose and clear intentions',
        duration: 5,
        category: 'Daily',
        favorite: false,
        type: 'meditation',
        imageUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&q=80&w=500',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/14/audio_31743b0353.mp3',
        tags: ['morning', 'routine', 'focus']
    },
    {
        id: '3',
        title: 'Body Scan For Relaxation',
        description: 'Release tension and find deep relaxation through this guided practice',
        duration: 15,
        category: 'Relaxation',
        favorite: false,
        type: 'meditation',
        imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=500',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_a4dc4156e5.mp3',
        tags: ['relaxation', 'stress', 'sleep']
    },
    {
        id: '4',
        title: 'Emotional Awareness',
        description: 'Identify and process difficult emotions without acting on them',
        duration: 12,
        category: 'Intermediate',
        favorite: false,
        type: 'meditation',
        imageUrl: 'https://images.unsplash.com/photo-1519834556553-a080ee817e1f?auto=format&fit=crop&q=80&w=500',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/20/audio_d16da7a9c7.mp3',
        tags: ['emotions', 'awareness', 'intermediate']
    },
    {
        id: '5',
        title: 'Loving Kindness',
        description: 'Cultivate compassion for yourself and others through this heart-centered practice',
        duration: 8,
        category: 'Compassion',
        favorite: false,
        type: 'meditation',
        imageUrl: 'https://images.unsplash.com/photo-1518002171953-8e4385a41802?auto=format&fit=crop&q=80&w=500',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/08/04/audio_2dde898d0f.mp3',
        tags: ['compassion', 'kindness', 'healing']
    },
    {
        id: '6',
        title: 'Before Sleep Relaxation',
        description: 'Prepare your mind and body for restful sleep with this calming meditation',
        duration: 10,
        category: 'Sleep',
        favorite: false,
        type: 'meditation',
        imageUrl: 'https://images.unsplash.com/photo-1566305977571-5666677c6e56?auto=format&fit=crop&q=80&w=500',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_f93e793eb8.mp3',
        tags: ['sleep', 'evening', 'relaxation']
    },
    {
        id: '7',
        title: 'Balloon Breathing',
        description: 'Visualize your lungs as balloons inflating and deflating with each breath',
        duration: 5,
        category: 'Beginner',
        favorite: false,
        type: 'breathing',
        imageUrl: 'https://images.unsplash.com/photo-1586034679970-cb7b5fc4928a?auto=format&fit=crop&q=80&w=500',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d1718beae7.mp3',
        tags: ['breathing', 'anxiety', 'stress-relief'],
        breathInDuration: 4,
        holdDuration: 4,
        breathOutDuration: 6
    },
    {
        id: '8',
        title: '4-7-8 Breathing',
        description: 'A powerful technique to calm your nervous system quickly',
        duration: 7,
        category: 'Intermediate',
        favorite: false,
        type: 'breathing',
        imageUrl: 'https://images.unsplash.com/photo-1517898717281-8e4385a41802?auto=format&fit=crop&q=80&w=500',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2021/04/07/audio_401b8d8d0b.mp3',
        tags: ['breathing', 'sleep', 'anxiety']
    },
    {
        id: '9',
        title: 'Serenity Prayer',
        description: 'Find peace in acceptance and courage to change what you can',
        duration: 3,
        category: 'Daily',
        favorite: false,
        type: 'prayer',
        imageUrl: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80&w=500',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2021/10/10/audio_81b31aaeca.mp3',
        tags: ['prayer', 'serenity', 'acceptance']
    },
    {
        id: '10',
        title: 'Prayer for Strength',
        description: 'Draw on a higher power to help you through temptation',
        duration: 5,
        category: 'Support',
        favorite: false,
        type: 'prayer',
        imageUrl: 'https://images.unsplash.com/photo-1475137979732-b349acb6b7e3?auto=format&fit=crop&q=80&w=500',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3',
        tags: ['prayer', 'strength', 'temptation']
    },
    {
        id: '11',
        title: 'Daily Scripture',
        description: 'Reflect on Biblical passages about overcoming temptation',
        duration: 8,
        category: 'Daily',
        favorite: false,
        type: 'devotional',
        imageUrl: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=500',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/08/03/audio_1b2fbeb6e6.mp3',
        tags: ['devotional', 'scripture', 'reflection']
    },
    {
        id: '12',
        title: 'Weekly Reflection',
        description: 'A deeper devotional to strengthen your spiritual foundation',
        duration: 15,
        category: 'Advanced',
        favorite: false,
        type: 'devotional',
        imageUrl: 'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&q=80&w=500',
        audioUrl: 'https://cdn.pixabay.com/download/audio/2022/02/07/audio_cca8a4d351.mp3',
        tags: ['devotional', 'reflection', 'spirituality']
    }
];

const Meditations: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [favoriteMeditations, setFavoriteMeditations] = useState<typeof MEDITATIONS_DATA>([]); 
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchFavoriteMeditations = async () => {
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const favoriteIds = userData.meditations || []; // Get array of favorite IDs

          // Fetch the full meditation objects based on IDs
          const favoriteMeditationObjects = MEDITATIONS_DATA.filter(meditation =>
            favoriteIds.includes(meditation.id)
          );

          setFavoriteMeditations(favoriteMeditationObjects);
        } else {
          setFavoriteMeditations([]); // Handle case where user doc doesn't exist
        }
      } else {
        setFavoriteMeditations([]); // Handle case where user is not logged in
      }
    };

    fetchFavoriteMeditations();
  }, [currentUser]);

  // Filter meditations based on search term
  const filteredMeditations = MEDITATIONS_DATA.filter(meditation =>
    meditation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meditation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meditation.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
    meditation.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group meditations by category
  const meditationsByCategory: Record<string, typeof MEDITATIONS_DATA> = {};

  MEDITATIONS_DATA.forEach(meditation => {
    if (!meditationsByCategory[meditation.category]) {
      meditationsByCategory[meditation.category] = [];
    }
    meditationsByCategory[meditation.category].push(meditation);
  });

  // Group meditations by type
  const meditationsByType: Record<string, typeof MEDITATIONS_DATA> = {};

  MEDITATIONS_DATA.forEach(meditation => {
    const type = meditation.type || 'meditation';
    if (!meditationsByType[type]) {
      meditationsByType[type] = [];
    }
    meditationsByType[type].push(meditation);
  });

  // Function to render the appropriate card component based on meditation type
  const renderMeditationCard = (meditation: any, index: number, delay: number = 0) => {
    return (
      <motion.div
        key={meditation.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: delay + (index * 0.05) }}
      >
        {meditation.type === 'breathing' ? (
          <BreathingExerciseCard {...meditation} />
        ) : (
          <MeditationCard {...meditation} />
        )}
      </motion.div>
    );
  };

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
        <h1 className="text-3xl font-bold mb-2">Meditations</h1>
        <p className="text-muted-foreground">
          Guided practices to build awareness and resilience
        </p>
      </motion.div>

      <div className="mb-8 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search meditations..."
          className="pl-10"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {searchTerm ? (
        <div>
          <h2 className="text-xl font-medium mb-4">Search Results</h2>

          {filteredMeditations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No meditations found matching "{searchTerm}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMeditations.map((meditation, index) => 
                renderMeditationCard(meditation, index)
              )}
            </div>
          )}
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Content</TabsTrigger>
            <TabsTrigger value="meditation">Meditations</TabsTrigger>
            <TabsTrigger value="breathing">Breathing</TabsTrigger>
            <TabsTrigger value="prayer">Prayers</TabsTrigger>
            <TabsTrigger value="devotional">Devotionals</TabsTrigger>
            <TabsTrigger value="favorites">My Favorites</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {Object.entries(meditationsByType).map(([type, meditations], typeIndex) => (
              <div key={type} className="mb-10">
                <div className="flex items-center mb-4">
                  <h2 className="text-xl font-medium capitalize">{type}s</h2>
                  <Badge variant="outline" className="ml-2">
                    {meditations.length}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {meditations.map((meditation, index) => 
                    renderMeditationCard(meditation, index, typeIndex * 0.1)
                  )}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="meditation">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MEDITATIONS_DATA.filter(m => m.type === 'meditation').map((meditation, index) => 
                renderMeditationCard(meditation, index)
              )}
            </div>
          </TabsContent>

          <TabsContent value="breathing">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MEDITATIONS_DATA.filter(m => m.type === 'breathing').map((meditation, index) => 
                renderMeditationCard(meditation, index)
              )}
            </div>
          </TabsContent>

          <TabsContent value="prayer">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MEDITATIONS_DATA.filter(m => m.type === 'prayer').map((meditation, index) => 
                renderMeditationCard(meditation, index)
              )}
            </div>
          </TabsContent>

          <TabsContent value="devotional">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MEDITATIONS_DATA.filter(m => m.type === 'devotional').map((meditation, index) => 
                renderMeditationCard(meditation, index)
              )}
            </div>
          </TabsContent>

          <TabsContent value="favorites">
            {favoriteMeditations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>You haven't saved any favorites yet.</p>
                <p className="mt-2">Click the heart icon on any meditation to save it here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteMeditations.map((meditation, index) => 
                  renderMeditationCard(meditation, index)
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </motion.div>
  );
};

export default Meditations;
