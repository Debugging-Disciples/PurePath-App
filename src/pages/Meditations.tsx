import React, { useState, useEffect } from 'react'; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import MeditationCard from '@/components/MeditationCard';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useAuth } from '@/utils/auth'; 
import { db } from '@/utils/firebase'; 
import { doc, getDoc } from 'firebase/firestore';

// Mock data for meditations (remove this after integrating Firebase)
const MOCK_MEDITATIONS = [
    {
        id: '1',
        title: 'Urge Surfing',
        description: 'Learn to ride the wave of desire without giving in',
        duration: 10,
        category: 'Beginner',
        favorite: false,
        imageUrl: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&q=80&w=500',
        tags: ['urges', 'beginner', 'recovery']
    },
    {
        id: '2',
        title: 'Morning Clarity',
        description: 'Start your day with purpose and clear intentions',
        duration: 5,
        category: 'Daily',
        favorite: false,
        imageUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&q=80&w=500',
        tags: ['morning', 'routine', 'focus']
    },
    {
        id: '3',
        title: 'Body Scan For Relaxation',
        description: 'Release tension and find deep relaxation through this guided practice',
        duration: 15,
        category: 'Relaxation',
        favorite: false,
        imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=500',
        tags: ['relaxation', 'stress', 'sleep']
    },
    {
        id: '4',
        title: 'Emotional Awareness',
        description: 'Identify and process difficult emotions without acting on them',
        duration: 12,
        category: 'Intermediate',
        favorite: false,
        imageUrl: 'https://images.unsplash.com/photo-1519834556553-597c23b0a9c5?auto=format&fit=crop&q=80&w=500',
        tags: ['emotions', 'awareness', 'intermediate']
    },
    {
        id: '5',
        title: 'Loving Kindness',
        description: 'Cultivate compassion for yourself and others through this heart-centered practice',
        duration: 8,
        category: 'Compassion',
        favorite: false,
        imageUrl: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=500',
        tags: ['compassion', 'kindness', 'healing']
    },
    {
        id: '6',
        title: 'Before Sleep Relaxation',
        description: 'Prepare your mind and body for restful sleep with this calming meditation',
        duration: 10,
        category: 'Sleep',
        favorite: false,
        imageUrl: 'https://images.unsplash.com/photo-1566305977571-5666677c6e56?auto=format&fit=crop&q=80&w=500',
        tags: ['sleep', 'evening', 'relaxation']
    }
];


const Meditations: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [favoriteMeditations, setFavoriteMeditations] = useState<typeof MOCK_MEDITATIONS>([]); 
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
          const favoriteMeditationObjects = MOCK_MEDITATIONS.filter(meditation =>
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
  const filteredMeditations = MOCK_MEDITATIONS.filter(meditation =>
    meditation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meditation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meditation.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group meditations by category
  const meditationsByCategory: Record<string, typeof MOCK_MEDITATIONS> = {};

  MOCK_MEDITATIONS.forEach(meditation => {
    if (!meditationsByCategory[meditation.category]) {
      meditationsByCategory[meditation.category] = [];
    }
    meditationsByCategory[meditation.category].push(meditation);
  });

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
              {filteredMeditations.map((meditation, index) => (
                <motion.div
                  key={meditation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <MeditationCard {...meditation} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Meditations</TabsTrigger>
            <TabsTrigger value="beginner">For Beginners</TabsTrigger>
            <TabsTrigger value="favorites">My Favorites</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {Object.entries(meditationsByCategory).map(([category, meditations], categoryIndex) => (
              <div key={category} className="mb-10">
                <div className="flex items-center mb-4">
                  <h2 className="text-xl font-medium">{category}</h2>
                  <Badge variant="outline" className="ml-2">
                    {meditations.length}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {meditations.map((meditation, index) => (
                    <motion.div
                      key={meditation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: (categoryIndex * 0.1) + (index * 0.05) }}
                    >
                      <MeditationCard {...meditation} />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="beginner">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_MEDITATIONS.filter(m => m.category === 'Beginner').map((meditation, index) => (
                <motion.div
                  key={meditation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <MeditationCard {...meditation} />
                </motion.div>
              ))}
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
                {favoriteMeditations.map((meditation, index) => (
                  <motion.div
                    key={meditation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <MeditationCard {...meditation} />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </motion.div>
  );
};

export default Meditations;