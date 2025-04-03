import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from 'framer-motion';
import { Send, Users, MessageCircle, Plus, Smile, Reply, Check } from 'lucide-react';
import { collection, getDocs, Timestamp, onSnapshot } from 'firebase/firestore';
import { db, UserProfile } from '../utils/firebase';
import { useAuth } from '../utils/auth';
import { 
  ChatMessage, 
  ChatRoom, 
  getAvailableRooms, 
  fetchRoomMessages,
  sendMessage, 
  addReaction, 
  removeReaction,
  createGroupChat
} from '../utils/chatService';
import { toast } from 'sonner';

// Common emoji reactions
const COMMON_EMOJIS = ['👍', '❤️', '😊', '🙏', '✨', '💪', '🔥'];

const Community: React.FC = () => {
  const [message, setMessage] = useState('');
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [newRoomName, setNewRoomName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageListenerRef = useRef<() => void>(() => {});
  const { currentUser, userProfile } = useAuth();
  
  // Initialize default chat rooms and fetch available rooms
  useEffect(() => {
    const setupChatRooms = async () => {
      if (!currentUser) return;
      
      try {
        const rooms = await getAvailableRooms(currentUser.uid, userProfile?.gender);
        setChatRooms(rooms);
        
        // Select main chat by default
        const mainRoom = rooms.find(room => room.id === 'main');
        if (mainRoom) {
          setSelectedRoom(mainRoom);
        } else if (rooms.length > 0) {
          setSelectedRoom(rooms[0]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error setting up chat rooms:", error);
        setLoading(false);
      }
    };
    
    setupChatRooms();
  }, [currentUser, userProfile?.gender]);
  
  // Fetch users for displaying names and avatars
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
      }
    };
    
    fetchUsers();
  }, []);
  
  // Set up real-time message listener when room changes
  useEffect(() => {
    // Clean up previous listener if it exists
    if (messageListenerRef.current) {
      messageListenerRef.current();
      messageListenerRef.current = () => {};
    }
    
    if (!selectedRoom) return;
    
    setMessagesLoading(true);
    
    // Initial fetch of messages
    const fetchInitialMessages = async () => {
      try {
        const initialMessages = await fetchRoomMessages(selectedRoom.id);
        setMessages(initialMessages);
        setMessagesLoading(false);
      } catch (error) {
        console.error(`Error fetching initial messages for room ${selectedRoom.id}:`, error);
        setMessagesLoading(false);
      }
    };
    
    fetchInitialMessages();
    
    // Set up real-time listener for messages
    const unsubscribe = messageListenerRef.current;
    
    // Add a custom listener to the messages collection
    const messagesQuery = collection(db, 'rooms', selectedRoom.id, 'messages');
    const realTimeListener = onSnapshot(messagesQuery, (snapshot) => {
      const updatedMessages: ChatMessage[] = [];
      
      snapshot.forEach((doc) => {
        const messageData = doc.data() as Omit<ChatMessage, 'id'>;
        updatedMessages.push({
          id: doc.id,
          ...messageData,
          timestamp: messageData.timestamp as Timestamp
        });
      });
      
      // Sort messages by timestamp
      updatedMessages.sort((a, b) => {
        const aTime = a.timestamp instanceof Timestamp ? a.timestamp.toMillis() : 0;
        const bTime = b.timestamp instanceof Timestamp ? b.timestamp.toMillis() : 0;
        return aTime - bTime;
      });
      
      setMessages(updatedMessages);
      setMessagesLoading(false);
    });
    
    // Updated cleanup function
    return () => {
      if (messageListenerRef.current) {
        messageListenerRef.current();
      }
      realTimeListener();
    };
  }, [selectedRoom]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !selectedRoom || !currentUser) return;
    
    try {
      const replyToId = replyingTo?.id;
      const replyToText = replyingTo?.text;
      
      const success = await sendMessage(
        selectedRoom.id, 
        message, 
        currentUser.uid,
        replyToId,
        replyToText
      );
      
      if (success) {
        setMessage('');
        setReplyingTo(null);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };
  
  const handleCreateRoom = async () => {
    if (!newRoomName.trim() || !currentUser) return;
    
    try {
      const roomId = await createGroupChat(newRoomName, currentUser.uid);
      
      if (roomId) {
        setNewRoomName('');
        // Refresh room list
        const rooms = await getAvailableRooms(currentUser.uid, userProfile?.gender);
        setChatRooms(rooms);
        
        // Select the newly created room
        const newRoom = rooms.find(room => room.id === roomId);
        if (newRoom) {
          setSelectedRoom(newRoom);
        }
      }
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error("Failed to create chat room");
    }
  };
  
  const handleReaction = async (message: ChatMessage, emoji: string) => {
    if (!currentUser || !selectedRoom) return;
    
    const messageReactions = message.reactions || {};
    const hasReacted = messageReactions[emoji]?.includes(currentUser.uid);
    
    try {
      if (hasReacted) {
        await removeReaction(selectedRoom.id, message.id, emoji, currentUser.uid);
      } else {
        await addReaction(selectedRoom.id, message.id, emoji, currentUser.uid);
      }
    } catch (error) {
      console.error("Error handling reaction:", error);
    }
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
  
  // Function to get the correct participant count for gender-specific rooms
  const getParticipantCount = (room: ChatRoom): number => {
    if (room.type === 'men') {
      return users.filter(user => user.gender === 'male').length;
    } else if (room.type === 'women') {
      return users.filter(user => user.gender === 'female').length;
    } else {
      return room.participants.length;
    }
  };
  
  // Get online count (this is a placeholder - in a real app you'd implement presence tracking)
  const getOnlineCount = (room: ChatRoom) => {
    // For demonstration, calculate a reasonable number of online users
    const participantCount = getParticipantCount(room);
    const onlineCount = participantCount > 0 
      ? Math.min(Math.ceil(participantCount * 0.3), 5) // About 30% of users are online, max 5
      : 0;
    
    return onlineCount;
  };

  // Render message reactions
  const renderReactions = (message: ChatMessage) => {
    if (!message.reactions || Object.keys(message.reactions).length === 0) {
      return null;
    }
    
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {Object.entries(message.reactions).map(([emoji, userIds]) => (
          <Badge 
            key={emoji} 
            variant={userIds.includes(currentUser?.uid || '') ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => handleReaction(message, emoji)}
          >
            {emoji} {userIds.length}
          </Badge>
        ))}
      </div>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Chat rooms sidebar */}
              <div className="md:col-span-1">
                <Card className="h-full">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Chat Rooms</CardTitle>
                      <CardDescription>
                        Join conversations
                      </CardDescription>
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Chat Room</DialogTitle>
                          <DialogDescription>
                            Create a new group chat with other community members.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Input
                              placeholder="Chat room name"
                              value={newRoomName}
                              onChange={(e) => setNewRoomName(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleCreateRoom}>Create Room</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  
                  <CardContent>
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                        {chatRooms.map((room) => {
                          // Calculate participant and online count
                          const participantCount = getParticipantCount(room);
                          const onlineCount = getOnlineCount(room);
                          
                          return (
                            <div
                              key={room.id}
                              className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                                selectedRoom?.id === room.id 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'hover:bg-muted'
                              }`}
                              onClick={() => setSelectedRoom(room)}
                            >
                              <div className="flex-1 truncate">
                                <div className="font-medium">{room.name}</div>
                                {room.lastMessage && (
                                  <div className="text-xs truncate opacity-80">
                                    {getUserDisplayName(room.lastMessage.senderId)}: {room.lastMessage.text}
                                  </div>
                                )}
                                <div className="text-xs mt-1">
                                  <span className="font-medium">
                                    {participantCount} members
                                  </span>
                                  {onlineCount > 0 && (
                                    <span className="ml-2">
                                      <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                                      {onlineCount} online
                                    </span>
                                  )}
                                </div>
                              </div>
                              {room.type === 'men' && <Badge variant="outline">👨 Men</Badge>}
                              {room.type === 'women' && <Badge variant="outline">👩 Women</Badge>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Chat messages */}
              <div className="md:col-span-3">
                <Card className="mb-6">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>{selectedRoom?.name || 'Select a chat room'}</CardTitle>
                        <CardDescription>
                          A safe space to share experiences and support each other
                        </CardDescription>
                      </div>
                      
                      {selectedRoom && (
                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{selectedRoom.participants.length} members</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {!selectedRoom ? (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">Select a chat room to start messaging</p>
                      </div>
                    ) : messagesLoading ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
                      </div>
                    ) : (
                      <div className="h-[60vh] overflow-y-auto space-y-4 p-2">
                        {messages.length === 0 ? (
                          <div className="text-center py-12">
                            <p className="text-muted-foreground">No messages yet. Be the first to say hello!</p>
                          </div>
                        ) : (
                          messages.map((msg, index) => {
                            const isCurrentUser = msg.senderId === currentUser?.uid;
                            
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
                                    <AvatarFallback>{getUserInitials(msg.senderId)}</AvatarFallback>
                                  </Avatar>
                                  
                                  <div className={`space-y-1 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-baseline gap-2">
                                      <span className="text-sm font-medium">{getUserDisplayName(msg.senderId)}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {msg.timestamp && msg.timestamp.toDate ? formatTimeAgo(msg.timestamp.toDate()) : 'Just now'}
                                      </span>
                                    </div>
                                    
                                    {/* Reply reference */}
                                    {msg.replyTo && (
                                      <div className={`text-xs rounded px-3 py-1 border-l-2 border-primary ${
                                        isCurrentUser 
                                          ? 'bg-muted/50 text-foreground mr-auto' 
                                          : 'bg-muted/30 text-foreground ml-auto'
                                      }`}>
                                        <span className="font-medium">
                                          {getUserDisplayName(messages.find(m => m.id === msg.replyTo)?.senderId || '')}:
                                        </span> {msg.replyToText}
                                      </div>
                                    )}
                                    
                                    <div className={`relative rounded-lg px-4 py-2 group ${
                                      isCurrentUser 
                                        ? 'bg-primary text-primary-foreground' 
                                        : 'bg-secondary'
                                    }`}>
                                      {msg.text}
                                      
                                      {/* Message actions */}
                                      <div className={`absolute ${isCurrentUser ? 'left-0' : 'right-0'} -translate-y-1/2 top-1/2 opacity-0 group-hover:opacity-100 transition-opacity`}>
                                        <div className={`${isCurrentUser ? '-translate-x-full mr-2' : 'translate-x-full ml-2'} flex items-center gap-1 bg-background shadow-sm rounded-full p-1`}>
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                                <Smile className="h-4 w-4" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align={isCurrentUser ? "start" : "end"}>
                                              <div className="flex flex-wrap p-2 gap-2">
                                                {COMMON_EMOJIS.map(emoji => (
                                                  <div 
                                                    key={emoji}
                                                    className="cursor-pointer p-1 hover:bg-muted rounded"
                                                    onClick={() => handleReaction(msg, emoji)}
                                                  >
                                                    {emoji}
                                                  </div>
                                                ))}
                                              </div>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                          
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-7 w-7"
                                            onClick={() => setReplyingTo(msg)}
                                          >
                                            <Reply className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Reactions */}
                                    {renderReactions(msg)}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </CardContent>
                  
                  {selectedRoom && (
                    <CardFooter>
                      {replyingTo && (
                        <div className="w-full mb-2 flex items-center justify-between bg-muted/50 p-2 rounded-md">
                          <div className="flex-1 truncate">
                            <span className="text-xs font-medium">
                              Replying to {getUserDisplayName(replyingTo.senderId)}:
                            </span>
                            <p className="text-xs truncate">{replyingTo.text}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => setReplyingTo(null)}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      
                      <form onSubmit={handleSendMessage} className="w-full flex gap-2">
                        <Textarea
                          placeholder="Type a message..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="min-h-[40px] flex-1 resize-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage(e);
                            }
                          }}
                        />
                        <Button type="submit" size="icon">
                          <Send className="h-4 w-4" />
                        </Button>
                      </form>
                    </CardFooter>
                  )}
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
              </div>
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
