
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Send, Users, MessageCircle } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import {db, UserProfile } from '../utils/firebase';
import { useAuth } from '../utils/auth';

// Mock data for messages
const MOCK_MESSAGES = [
  { id: '1', userId: '2', text: 'I just wanted to share that I hit 30 days today! It\'s been tough but so worth it.', timestamp: new Date(Date.now() - 60 * 60 * 1000) },
  { id: '2', userId: '1', text: 'Congratulations Michael! That\'s a huge milestone. What helped you the most?', timestamp: new Date(Date.now() - 55 * 60 * 1000) },
  { id: '3', userId: '2', text: 'Honestly, the daily meditations and checking in with this community. Having accountability made all the difference.', timestamp: new Date(Date.now() - 50 * 60 * 1000) },
  { id: '4', userId: '3', text: 'I remember struggling at the 30-day mark. Push through, it gets easier!', timestamp: new Date(Date.now() - 45 * 60 * 1000) }
];

const Community: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const userSnapshot = await getDocs(usersCollection);
        const usersList: UserProfile[] = [];
        
        userSnapshot.forEach((doc) => {
          usersList.push({ 
            id: doc.id, 
            ...doc.data() as Omit<UserProfile, 'id'> 
          });
        });
        
        setUsers(usersList);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    // Adding a new mock message
    const newMessage = {
      id: Date.now().toString(),
      userId: currentUser?.uid || '1', // Use current user's ID if available
      text: message,
      timestamp: new Date()
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
  };
  
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };
  
  // Function to get a user's display name
  const getUserDisplayName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user && user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user && user.username) {
      return user.username;
    } else {
      return 'Anonymous';
    }
  };
  
  // Function to get user's initials for avatar
  const getUserInitials = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user && user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    } else if (user && user.username) {
      return user.username[0];
    } else {
      return 'U';
    }
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
        <h1 className="text-3xl font-bold mb-2">Community</h1>
        <p className="text-muted-foreground">
          Connect with others on the same journey
        </p>
      </motion.div>
      
      <Tabs defaultValue="chat">
        <TabsList className="mb-6">
          <TabsTrigger value="chat" className="flex items-center">
            <MessageCircle className="mr-2 h-4 w-4" />
            Discussion
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            Members
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle>Community Chat</CardTitle>
                <CardDescription>
                  A safe space to share experiences and support each other
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-[60vh] overflow-y-auto space-y-4 p-2">
                  {messages.map((msg, index) => {
                    const isCurrentUser = msg.userId === currentUser?.uid;
                    
                    return (
                      <motion.div
                        key={msg.id}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <div className={`flex max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                          <Avatar className={`h-8 w-8 ${isCurrentUser ? 'ml-2' : 'mr-2'}`}>
                            <AvatarImage src="" />
                            <AvatarFallback>{getUserInitials(msg.userId)}</AvatarFallback>
                          </Avatar>
                          
                          <div className={`space-y-1 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm font-medium">{getUserDisplayName(msg.userId)}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(msg.timestamp)}
                              </span>
                            </div>
                            
                            <div className={`rounded-lg px-4 py-2 ${
                              isCurrentUser 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-secondary'
                            }`}>
                              {msg.text}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
              <CardFooter>
                <form onSubmit={handleSendMessage} className="w-full flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
            
            <div className="bg-muted/30 p-4 rounded-lg text-sm text-muted-foreground">
              <p className="font-medium mb-1">Community Guidelines</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Be respectful and supportive of all members</li>
                <li>Share your experiences but avoid graphic details</li>
                <li>Respect everyone's privacy</li>
                <li>Report any inappropriate content to moderators</li>
              </ul>
            </div>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="members">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {loading ? (
              <div className="text-center py-8">Loading members...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src="" />
                              <AvatarFallback>
                                {user.firstName && user.lastName 
                                  ? `${user.firstName[0]}${user.lastName[0]}`
                                  : user.username ? user.username[0] : 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">
                                {user.firstName && user.lastName 
                                  ? `${user.firstName} ${user.lastName}`
                                  : user.username || 'Anonymous'}
                              </CardTitle>
                              <CardDescription>
                                <Badge variant="outline" className="mt-1">
                                  {user.streakDays || 0} day streak
                                </Badge>
                              </CardDescription>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardFooter className="pt-2">
                        <Button variant="ghost" size="sm" className="w-full">
                          Message
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Community;
