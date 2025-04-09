
import React, { useState } from 'react';
import { useAuth } from "../utils/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, UserPlus, X, Check, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { 
  searchUsers, 
  sendFriendRequest, 
  removeFriend, 
  setAccountabilityPartner, 
  removeAccountabilityPartner 
} from '../utils/firebase';

const FriendsList: React.FC = () => {
  const { friends, accountabilityPartners, friendRequests, refreshUserData } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSearch = async () => {
    if (searchTerm.trim().length < 3) {
      toast.error('Please enter at least 3 characters');
      return;
    }

    setIsSearching(true);
    const results = await searchUsers(searchTerm);
    
    // Filter out the current user and existing friends
    const filteredResults = results.filter(user => {
      return user.id !== auth.currentUser?.uid && 
             !friends.some(friend => friend.id === user.id) &&
             !friendRequests.outgoing.includes(user.id);
    });
    
    setSearchResults(filteredResults);
    setIsSearching(false);
  };

  const handleAddFriend = async (userId: string) => {
    if (!auth.currentUser?.uid) return;
    
    const result = await sendFriendRequest(auth.currentUser.uid, userId);
    if (result) {
      toast.success('Friend request sent');
      await refreshUserData();
      setSearchResults(prev => prev.filter(user => user.id !== userId));
    } else {
      toast.error('Failed to send friend request');
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!auth.currentUser?.uid) return;
    
    const result = await removeFriend(auth.currentUser.uid, friendId);
    if (result) {
      toast.success('Friend removed');
      refreshUserData();
    } else {
      toast.error('Failed to remove friend');
    }
  };

  const handleSetAccountabilityPartner = async (friendId: string) => {
    if (!auth.currentUser?.uid) return;
    
    const result = await setAccountabilityPartner(auth.currentUser.uid, friendId);
    if (result) {
      toast.success('Accountability partner added');
      refreshUserData();
    } else {
      toast.error('Failed to add accountability partner');
    }
  };

  const handleRemoveAccountabilityPartner = async (friendId: string) => {
    if (!auth.currentUser?.uid) return;
    
    const result = await removeAccountabilityPartner(auth.currentUser.uid, friendId);
    if (result) {
      toast.success('Accountability partner removed');
      refreshUserData();
    } else {
      toast.error('Failed to remove accountability partner');
    }
  };

  const getInitials = (user: any) => {
    if (!user) return 'U';
    
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
  };

  const isAccountabilityPartner = (userId: string) => {
    return accountabilityPartners.some(partner => partner.id === userId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5" />
          Friends & Accountability Partners
        </CardTitle>
        <CardDescription>
          Connect with others and share your journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">My Friends</h3>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center">
                <UserPlus className="h-4 w-4 mr-1" />
                Add Friend
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Find Friends</DialogTitle>
                <DialogDescription>
                  Search for users by email address
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex gap-2 my-4">
                <Input
                  placeholder="Search by email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </div>
              
              <div className="max-h-60 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback>{getInitials(user)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddFriend(user.id)}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    {isSearching ? 'Searching...' : searchTerm ? 'No users found' : 'Search for users by email'}
                  </p>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {friendRequests.incoming.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Friend Requests</h4>
            <div className="space-y-2">
              {friendRequests.incoming.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-2 border rounded bg-muted/20">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback>{getInitials(request)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{request.firstName} {request.lastName}</p>
                      <p className="text-xs text-muted-foreground">{request.email}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        // Handle accept friend request
                      }}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        // Handle decline friend request
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          {friends.length > 0 ? (
            friends.map((friend) => (
              <div key={friend.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback>{getInitials(friend)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center">
                      <p className="font-medium">{friend.firstName} {friend.lastName}</p>
                      {isAccountabilityPartner(friend.id) && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded">
                          Accountability Partner
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{friend.email}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {isAccountabilityPartner(friend.id) ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveAccountabilityPartner(friend.id)}
                      title="Remove as accountability partner"
                    >
                      <EyeOff className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSetAccountabilityPartner(friend.id)}
                      title="Make accountability partner"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveFriend(friend.id)}
                    title="Remove friend"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-4 border rounded bg-muted/10">
              <Users className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">You don't have any friends yet</p>
              <p className="text-xs text-muted-foreground mt-1">Click "Add Friend" to connect with others</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FriendsList;
