
import React, { useState, useEffect } from 'react';
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
import { Users, UserPlus, X, Check, AlertTriangle, Eye, EyeOff, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { 
  searchUsersByUsername, 
  getAllUsernames,
  sendFriendRequest, 
  cancelFriendRequest,
  removeFriend, 
  setAccountabilityPartner,
  removeAccountabilityPartner,
  auth 
} from '../utils/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { MultiSelect } from "@/components/ui/multi-select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

const FriendsList: React.FC = () => {
  const { friends, accountabilityPartners, friendRequests, refreshUserData, userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [typingTimer, setTypingTimer] = useState<NodeJS.Timeout | null>(null);
  const [allUsernames, setAllUsernames] = useState<any[]>([]);
  const [isLoadingUsernames, setIsLoadingUsernames] = useState(false);
  const isMobile = useIsMobile();
  
  const referralLink = window.location.origin + '?ref=' + userProfile?.id;
  const emailSubject = "Join me on PurePath";
  const emailBody = `Hey, I'm using PurePath to help with my recovery journey and I'd like you to join me as an accountability partner. Sign up using this link: ${referralLink}`;

  // Fetch all usernames on component mount
  useEffect(() => {
    const fetchAllUsernames = async () => {
      setIsLoadingUsernames(true);
      try {
        const usernamesData = await getAllUsernames();
        // Filter out current user and existing friends/requests
        const filteredUsernames = usernamesData.filter((user: any) => {
          return user.id !== auth.currentUser?.uid && 
                 !friends.some(friend => friend.id === user.id) &&
                 !friendRequests.outgoing.includes(user.id);
        });
        setAllUsernames(filteredUsernames);
      } catch (error) {
        console.error("Error fetching usernames:", error);
      } finally {
        setIsLoadingUsernames(false);
      }
    };
    
    fetchAllUsernames();
  }, [friends, friendRequests.outgoing]);

  useEffect(() => {
    // Clear previous timer
    if (typingTimer) clearTimeout(typingTimer);
    
    // Only search if we have at least 3 characters
    if (searchTerm.length >= 3) {
      const timer = setTimeout(() => {
        performLiveSearch();
      }, 300);
      
      setTypingTimer(timer);
    } else {
      setSearchResults([]);
      setDropdownOpen(false);
    }
    
    return () => {
      if (typingTimer) clearTimeout(typingTimer);
    };
  }, [searchTerm]);
  
  const performLiveSearch = () => {
    if (searchTerm.length < 3) return;
    
    setIsSearching(true);
    
    // Filter from the already fetched usernames list
    const results = allUsernames.filter((user: any) => 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setSearchResults(results);
    setIsSearching(false);
    setDropdownOpen(results.length > 0);
  };

  const handleSearch = async () => {
    if (searchTerm.trim().length < 3) {
      toast.error('Please enter at least 3 characters');
      return;
    }

    setIsSearching(true);
    await performLiveSearch();
    setDropdownOpen(false);
  };

  const handleUserSelect = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleAddFriend = async (userId: string) => {
    if (!auth.currentUser?.uid) return;
    
    const result = await sendFriendRequest(auth.currentUser.uid, userId);
    if (result) {
      toast.success('Friend request sent');
      await refreshUserData();
      setSearchResults(prev => prev.filter(user => user.id !== userId));
      setSelectedUsers(prev => prev.filter(id => id !== userId));
      
      // Remove the user from allUsernames as well
      setAllUsernames(prev => prev.filter(user => user.id !== userId));
    } else {
      toast.error('Failed to send friend request');
    }
  };
  
  const handleAddMultipleFriends = async () => {
    if (!auth.currentUser?.uid || selectedUsers.length === 0) return;
    
    let successCount = 0;
    for (const userId of selectedUsers) {
      const result = await sendFriendRequest(auth.currentUser.uid, userId);
      if (result) {
        successCount++;
      }
    }
    
    if (successCount > 0) {
      toast.success(`Sent ${successCount} friend request${successCount > 1 ? 's' : ''}`);
      await refreshUserData();
      
      // Remove all selected users from both search results and allUsernames
      setSearchResults(prev => prev.filter(user => !selectedUsers.includes(user.id)));
      setAllUsernames(prev => prev.filter(user => !selectedUsers.includes(user.id)));
      setSelectedUsers([]);
    } else {
      toast.error('Failed to send friend requests');
    }
  };

  const handleCancelFriendRequest = async (userId: string) => {
    if (!auth.currentUser?.uid) return;
    
    const result = await cancelFriendRequest(auth.currentUser.uid, userId);
    if (result) {
      toast.success('Friend request canceled');
      await refreshUserData();
    } else {
      toast.error('Failed to cancel friend request');
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

  const handleSendInvite = () => {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    window.location.href = `mailto:${inviteEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    toast.success('Email client opened with invitation');
    setInviteEmail('');
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
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Connect with Friends</DialogTitle>
                <DialogDescription>
                  Find users by username or invite by email
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="search" value={activeTab} onValueChange={setActiveTab} className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="search">Search Username</TabsTrigger>
                  <TabsTrigger value="invite">Invite by Email</TabsTrigger>
                </TabsList>
                
                <TabsContent value="search" className="mt-4 space-y-4">
                  <div className="relative">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          placeholder="Search by username (min. 3 characters)..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                          className="w-full"
                        />
                        
                        {dropdownOpen && searchResults.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
                            <div className="p-1 max-h-60 overflow-y-auto">
                              {searchResults.map((user) => (
                                <div 
                                  key={user.id} 
                                  className={`flex items-center justify-between p-2 ${
                                    selectedUsers.includes(user.id) 
                                      ? 'bg-primary/10' 
                                      : 'hover:bg-secondary/50'
                                  } rounded-md cursor-pointer`}
                                  onClick={() => handleUserSelect(user.id)}
                                >
                                  <div className="flex items-center">
                                    <Avatar className="h-7 w-7 mr-2">
                                      <AvatarFallback>{getInitials(user)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium text-sm">{user.firstName} {user.lastName}</p>
                                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center">
                                    {selectedUsers.includes(user.id) && (
                                      <Check className="h-4 w-4 text-primary" />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <Button onClick={handleSearch} disabled={isSearching}>
                        {isSearching ? 'Searching...' : 'Search'}
                      </Button>
                    </div>
                  </div>
                  
                  {selectedUsers.length > 0 && (
                    <div className="mt-2 p-2 border rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">{selectedUsers.length} user(s) selected</p>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setSelectedUsers([])}
                        >
                          Clear
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {selectedUsers.map(userId => {
                          const user = searchResults.find(u => u.id === userId);
                          return user ? (
                            <Badge 
                              key={userId} 
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {user.firstName} {user.lastName}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUserSelect(userId);
                                }}
                                className="rounded-full"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ) : null;
                        })}
                      </div>
                      <Button 
                        className="w-full" 
                        size="sm"
                        onClick={handleAddMultipleFriends}
                      >
                        Send Friend Requests
                      </Button>
                    </div>
                  )}
                  
                  <div className="max-h-60 overflow-y-auto">
                    {searchResults.length > 0 && !dropdownOpen ? (
                      <div className="space-y-2">
                        {searchResults.map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarFallback>{getInitials(user)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.firstName} {user.lastName}</p>
                                <p className="text-xs text-muted-foreground">@{user.username}</p>
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
                        {isSearching ? 'Searching...' : searchTerm.length >= 3 ? 'No users found' : 'Type at least 3 characters to search'}
                      </p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="invite" className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email-invite" className="text-sm font-medium">
                      Invite a friend via email
                    </label>
                    <Input
                      id="email-invite"
                      placeholder="friend@example.com"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                    <div className="pt-2">
                      <label className="text-sm font-medium">Invitation message</label>
                      <Textarea 
                        className="mt-1 min-h-[100px]" 
                        value={emailBody}
                        readOnly
                      />
                    </div>
                    <Button 
                      className="w-full mt-2" 
                      onClick={handleSendInvite}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Invitation
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
              
              <DialogFooter className="mt-4">
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
                      <p className="text-xs text-muted-foreground">@{request.username}</p>
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
        
        {/* Display outgoing friend requests */}
        {friendRequests.outgoing.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Pending Requests</h4>
            <div className="space-y-2">
              {friendRequests.outgoing.map((userId) => {
                // Find the user details from allUsernames array
                const user = allUsernames.find(u => u.id === userId);
                return (
                  <div key={userId} className="flex items-center justify-between p-2 border rounded bg-muted/10">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback>{user ? getInitials(user) : 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center">
                          <p className="font-medium">{user ? `${user.firstName} ${user.lastName}` : 'User'}</p>
                          <span className="ml-2 px-1.5 py-0.5 text-xs bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 rounded">
                            Pending
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{user ? `@${user.username}` : ''}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancelFriendRequest(userId)}
                      title="Cancel request"
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
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
                    <div className="flex items-center flex-wrap">
                      <p className="font-medium">{friend.firstName} {friend.lastName}</p>
                      {isAccountabilityPartner(friend.id) && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded">
                          Accountability Partner
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">@{friend.username}</p>
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

