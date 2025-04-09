
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  UserPlus,
  Award,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '../utils/auth';
import { acceptFriendRequest, declineFriendRequest, markNotificationAsRead, auth } from '../utils/firebase';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

const NotificationsDropdown: React.FC = () => {
  const { notifications, unreadNotifications, refreshUserData } = useAuth();
  const navigate = useNavigate();

  const handleAcceptFriendRequest = async (senderId: string) => {
    const result = await acceptFriendRequest(auth.currentUser?.uid || '', senderId);
    if (result) {
      toast.success('Friend request accepted');
      refreshUserData();
    } else {
      toast.error('Failed to accept friend request');
    }
  };

  const handleDeclineFriendRequest = async (senderId: string) => {
    const result = await declineFriendRequest(auth.currentUser?.uid || '', senderId);
    if (result) {
      toast.success('Friend request declined');
      refreshUserData();
    } else {
      toast.error('Failed to decline friend request');
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markNotificationAsRead(auth.currentUser?.uid || '', notification.id);
    }
    
    // Navigate based on notification type
    if (notification.type === 'achievement') {
      navigate('/achievements');
    } else if (notification.type === 'emergency') {
      navigate(`/profile?friend=${notification.senderInfo?.id}`);
    }
    
    refreshUserData();
  };

  const renderNotificationIcon = (type: string) => {
    switch (type) {
      case 'friendRequest':
        return <UserPlus className="h-4 w-4 mr-2 text-blue-500" />;
      case 'achievement':
        return <Award className="h-4 w-4 mr-2 text-green-500" />;
      case 'emergency':
        return <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 mr-2 text-gray-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadNotifications > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadNotifications}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[400px] overflow-y-auto">
          {notifications && notifications.length > 0 ? (
            <DropdownMenuGroup>
              {notifications
                .sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate())
                .map((notification, index) => (
                  <React.Fragment key={notification.id || index}>
                    {notification.type === 'friendRequest' && notification.senderInfo ? (
                      <div className="px-2 py-2 hover:bg-accent flex items-center justify-between">
                        <div className="flex items-center">
                          {renderNotificationIcon(notification.type)}
                          <div>
                            <p className={`text-sm ${!notification.read ? 'font-semibold' : ''}`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(notification.timestamp.toDate(), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleAcceptFriendRequest(notification.senderInfo.id)}
                            className="h-7 w-7 p-0"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDeclineFriendRequest(notification.senderInfo.id)}
                            className="h-7 w-7 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <DropdownMenuItem 
                        className={`${!notification.read ? 'font-semibold bg-accent/40' : ''}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start w-full">
                          {renderNotificationIcon(notification.type)}
                          <div className="flex-1">
                            <p className="text-sm">{notification.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(notification.timestamp.toDate(), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    )}
                    {index < notifications.length - 1 && <DropdownMenuSeparator />}
                  </React.Fragment>
                ))}
            </DropdownMenuGroup>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No notifications
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;
