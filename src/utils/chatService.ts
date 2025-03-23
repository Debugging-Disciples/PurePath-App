
import { db, auth } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  Timestamp
} from 'firebase/firestore';
import { UserProfile } from './firebase';
import { toast } from 'sonner';

// Interface for chat message
export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: Timestamp;
  reactions?: Record<string, string[]>; // emoji -> userId[]
  replyTo?: string; // messageId being replied to
  replyToText?: string; // Content of message being replied to
}

// Interface for chat room
export interface ChatRoom {
  id: string;
  name: string;
  participants: string[];
  createdAt: Timestamp;
  createdBy: string;
  type: 'main' | 'men' | 'women' | 'group';
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: Timestamp;
  };
}

// // Create default chat rooms if they don't exist
// export const initializeDefaultChatRooms = async () => {
//   try {
//     // Check if main chat room exists
//     const mainRoomRef = doc(db, 'rooms', 'main');
//     const mainRoomDoc = await getDoc(mainRoomRef);
    
//     if (!mainRoomDoc.exists()) {
//       // Create main chat room
//       await setDoc(mainRoomRef, {
//         name: "Main Chat",
//         participants: [],
//         createdAt: serverTimestamp(),
//         createdBy: 'system',
//         type: 'main'
//       });
//       console.log("Main chat room created");
//     }
    
//     // Check if men's chat room exists
//     const menRoomRef = doc(db, 'rooms', 'men');
//     const menRoomDoc = await getDoc(menRoomRef);
    
//     if (!menRoomDoc.exists()) {
//       // Create men's chat room
//       await setDoc(menRoomRef, {
//         name: "Men's Chat",
//         participants: [],
//         createdAt: serverTimestamp(),
//         createdBy: 'system',
//         type: 'men'
//       });
//       console.log("Men's chat room created");
//     }
    
//     // Check if women's chat room exists
//     const womenRoomRef = doc(db, 'rooms', 'women');
//     const womenRoomDoc = await getDoc(womenRoomRef);
    
//     if (!womenRoomDoc.exists()) {
//       // Create women's chat room
//       await setDoc(womenRoomRef, {
//         name: "Women's Chat",
//         participants: [],
//         createdAt: serverTimestamp(),
//         createdBy: 'system',
//         type: 'women'
//       });
//       console.log("Women's chat room created");
//     }
    
//     return true;
//   } catch (error) {
//     console.error("Error initializing default chat rooms:", error);
//     return false;
//   }
// };

// Get available chat rooms for a user based on their gender
export const getAvailableRooms = (userId: string, gender?: string) => {
  return new Promise<ChatRoom[]>((resolve, reject) => {
    try {
      // Query for rooms where the user is a participant or public rooms
      const roomsQuery = query(
        collection(db, 'rooms')
      );
      
      onSnapshot(roomsQuery, (snapshot) => {
        const rooms: ChatRoom[] = [];
        
        snapshot.forEach((doc) => {
          const roomData = doc.data() as Omit<ChatRoom, 'id'>;
          const room: ChatRoom = {
            id: doc.id,
            ...roomData,
            createdAt: roomData.createdAt as Timestamp
          };
          
          // Filter rooms based on user's gender for gender-specific rooms
          if (
            room.type === 'main' || 
            (room.type === 'men' && gender === 'male') || 
            (room.type === 'women' && gender === 'female') || 
            (room.type === 'group' && (room.participants.includes(userId) || room.createdBy === userId))
          ) {
            rooms.push(room);
          }
        });
        
        // Sort rooms by last message timestamp or creation time
        rooms.sort((a, b) => {
          const timeA = a.lastMessage?.timestamp || a.createdAt;
          const timeB = b.lastMessage?.timestamp || b.createdAt;
          return timeB.toMillis() - timeA.toMillis();
        });
        
        resolve(rooms);
      }, (error) => {
        console.error("Error getting chat rooms:", error);
        reject(error);
      });
    } catch (error) {
      console.error("Error in getAvailableRooms:", error);
      reject(error);
    }
  });
};

// Get messages for a specific room
export const getRoomMessages = (roomId: string) => {
  return new Promise<ChatMessage[]>((resolve, reject) => {
    try {
      const messagesQuery = query(
        collection(db, 'rooms', roomId, 'messages'),
        orderBy('timestamp', 'asc')
      );
      
      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const messages: ChatMessage[] = [];
        
        snapshot.forEach((doc) => {
          const messageData = doc.data() as Omit<ChatMessage, 'id'>;
          messages.push({
            id: doc.id,
            ...messageData,
            timestamp: messageData.timestamp as Timestamp
          });
        });
        
        resolve(messages);
      }, (error) => {
        console.error(`Error getting messages for room ${roomId}:`, error);
        reject(error);
      });
      
      // Return unsubscribe function so caller can stop listening when needed
      return unsubscribe;
    } catch (error) {
      console.error("Error in getRoomMessages:", error);
      reject(error);
      return () => {};
    }
  });
};

// Send a message to a room
export const sendMessage = async (roomId: string, text: string, userId: string, replyTo?: string, replyToText?: string) => {
  try {
    if (!text.trim()) {
      return false;
    }
    
    // Add message to the room's messages collection
    const messagesRef = collection(db, 'rooms', roomId, 'messages');
    const messageData = {
      senderId: userId,
      text: text.trim(),
      timestamp: serverTimestamp()
    };
    
    // Add reply information if provided
    if (replyTo && replyToText) {
      Object.assign(messageData, {
        replyTo,
        replyToText
      });
    }
    
    await addDoc(messagesRef, messageData);
    
    // Update the room's last message
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      lastMessage: {
        text: text.trim(),
        senderId: userId,
        timestamp: serverTimestamp()
      },
      // Add user to participants if not already there
      participants: arrayUnion(userId)
    });
    
    return true;
  } catch (error) {
    console.error("Error sending message:", error);
    toast.error("Failed to send message");
    return false;
  }
};

// Add a reaction to a message
export const addReaction = async (roomId: string, messageId: string, emoji: string, userId: string) => {
  try {
    const messageRef = doc(db, 'rooms', roomId, 'messages', messageId);
    const messageDoc = await getDoc(messageRef);
    
    if (!messageDoc.exists()) {
      return false;
    }
    
    const messageData = messageDoc.data();
    const reactions = messageData.reactions || {};
    
    // If this emoji reaction doesn't exist yet, initialize it
    if (!reactions[emoji]) {
      reactions[emoji] = [];
    }
    
    // Check if user already reacted with this emoji
    if (!reactions[emoji].includes(userId)) {
      reactions[emoji].push(userId);
      
      await updateDoc(messageRef, {
        reactions
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error adding reaction:", error);
    return false;
  }
};

// Remove a reaction from a message
export const removeReaction = async (roomId: string, messageId: string, emoji: string, userId: string) => {
  try {
    const messageRef = doc(db, 'rooms', roomId, 'messages', messageId);
    const messageDoc = await getDoc(messageRef);
    
    if (!messageDoc.exists()) {
      return false;
    }
    
    const messageData = messageDoc.data();
    const reactions = messageData.reactions || {};
    
    // If this emoji reaction exists and user has reacted
    if (reactions[emoji] && reactions[emoji].includes(userId)) {
      reactions[emoji] = reactions[emoji].filter(id => id !== userId);
      
      // If no more users have this reaction, remove the emoji key
      if (reactions[emoji].length === 0) {
        delete reactions[emoji];
      }
      
      await updateDoc(messageRef, {
        reactions
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error removing reaction:", error);
    return false;
  }
};

// Create a new group chat
export const createGroupChat = async (name: string, userId: string, initialParticipants: string[] = []) => {
  try {
    // Ensure the creator is included in participants
    const participants = [userId, ...initialParticipants.filter(id => id !== userId)];
    
    // Create new room document
    const roomsRef = collection(db, 'rooms');
    const roomData = {
      name: name.trim(),
      participants,
      createdAt: serverTimestamp(),
      createdBy: userId,
      type: 'group'
    };
    
    const roomDoc = await addDoc(roomsRef, roomData);
    
    toast.success(`${name} chat room created`);
    return roomDoc.id;
  } catch (error) {
    console.error("Error creating group chat:", error);
    toast.error("Failed to create chat room");
    return null;
  }
};

// Add a user to a group chat
export const addUserToChat = async (roomId: string, userId: string) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      participants: arrayUnion(userId)
    });
    return true;
  } catch (error) {
    console.error("Error adding user to chat:", error);
    return false;
  }
};

// Remove a user from a group chat
export const removeUserFromChat = async (roomId: string, userId: string) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      participants: arrayRemove(userId)
    });
    return true;
  } catch (error) {
    console.error("Error removing user from chat:", error);
    return false;
  }
};
