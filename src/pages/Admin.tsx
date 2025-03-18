import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { CustomBadge } from '@/components/ui/custom-badge';
import { 
  Users, 
  Lock, 
  AlertTriangle, 
  FileText, 
  Settings,
  Search,
  ChevronDown,
  HeartPulse
} from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_USERS = [
  { id: '1', name: 'Sarah K.', email: 'sarah@example.com', role: 'member', status: 'active', streak: 45, joinDate: '2022-05-15' },
  { id: '2', name: 'Michael T.', email: 'michael@example.com', role: 'member', status: 'active', streak: 30, joinDate: '2022-06-22' },
  { id: '3', name: 'David W.', email: 'david@example.com', role: 'admin', status: 'active', streak: 120, joinDate: '2022-01-10' },
  { id: '4', name: 'Emma J.', email: 'emma@example.com', role: 'member', status: 'inactive', streak: 0, joinDate: '2022-07-05' },
  { id: '5', name: 'Thomas P.', email: 'thomas@example.com', role: 'member', status: 'active', streak: 15, joinDate: '2022-09-18' }
];

const MOCK_FLAGGED_CONTENT = [
  { id: '1', content: 'Is there a way to access adult content without triggering...', user: 'Anonymous User', date: '2023-01-15', status: 'pending' },
  { id: '2', content: 'I keep having thoughts about my ex and it\'s making me want to...', user: 'User5932', date: '2023-01-14', status: 'reviewed' }
];

const Admin: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredUsers = MOCK_USERS.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users, content, and application settings
        </p>
      </motion.div>
      
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-8 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-yellow-800 dark:text-yellow-300">Admin Access</h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            You have elevated privileges. Changes made here will affect all users.
            Please use these tools responsibly.
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="users">
        <TabsList className="mb-6">
          <TabsTrigger value="users" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center">
            <HeartPulse className="mr-2 h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="moderation" className="flex items-center">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Moderation
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View and manage all registered users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name or email..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Name</th>
                        <th className="text-left py-3 px-4 font-medium">Email</th>
                        <th className="text-left py-3 px-4 font-medium">Role</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Streak</th>
                        <th className="text-left py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">{user.name}</td>
                          <td className="py-3 px-4">{user.email}</td>
                          <td className="py-3 px-4">
                            <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                              {user.role}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <CustomBadge variant={user.status === 'active' ? 'success' : 'secondary'}>
                              {user.status}
                            </CustomBadge>
                          </td>
                          <td className="py-3 px-4">{user.streak} days</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">Edit</Button>
                              <Button variant="ghost" size="sm" className="text-destructive">Suspend</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Meditation Management</CardTitle>
                <CardDescription>
                  Add, edit, or remove meditation content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Meditations (6)</h3>
                    <Button>Add New Meditation</Button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Title</th>
                          <th className="text-left py-3 px-4 font-medium">Category</th>
                          <th className="text-left py-3 px-4 font-medium">Duration</th>
                          <th className="text-left py-3 px-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">Urge Surfing</td>
                          <td className="py-3 px-4">Beginner</td>
                          <td className="py-3 px-4">10 min</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">Edit</Button>
                              <Button variant="ghost" size="sm" className="text-destructive">Delete</Button>
                            </div>
                          </td>
                        </tr>
                        <tr className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">Morning Clarity</td>
                          <td className="py-3 px-4">Daily</td>
                          <td className="py-3 px-4">5 min</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">Edit</Button>
                              <Button variant="ghost" size="sm" className="text-destructive">Delete</Button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Add New Meditation</CardTitle>
                <CardDescription>
                  Create a new guided meditation for users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" placeholder="Meditation title" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="sleep">Sleep</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input id="duration" type="number" min="1" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="image">Image URL</Label>
                      <Input id="image" placeholder="Link to cover image" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" rows={3} placeholder="Brief description of this meditation" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="audio">Audio File</Label>
                    <Input id="audio" type="file" accept="audio/*" />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch id="featured" />
                    <Label htmlFor="featured">Feature on dashboard</Label>
                  </div>
                  
                  <Button type="submit">Create Meditation</Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="moderation">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Content Moderation</CardTitle>
                <CardDescription>
                  Review flagged content and messages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Flagged Content</h3>
                    
                    <div className="space-y-4">
                      {MOCK_FLAGGED_CONTENT.map(item => (
                        <Card key={item.id}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-base">{item.user}</CardTitle>
                                <CardDescription>{new Date(item.date).toLocaleDateString()}</CardDescription>
                              </div>
                              <Badge variant={item.status === 'pending' ? 'outline' : 'secondary'}>
                                {item.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <p className="text-sm">{item.content}</p>
                          </CardContent>
                          <CardContent className="flex gap-2 pt-0">
                            <Button variant="outline" size="sm">Allow</Button>
                            <Button variant="destructive" size="sm">Remove</Button>
                            <Button variant="ghost" size="sm">Contact User</Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Moderation Settings</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base">Auto-flag sensitive words</Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically flag messages containing sensitive content
                          </p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base">Require message approval</Label>
                          <p className="text-sm text-muted-foreground">
                            All messages require admin approval before posting
                          </p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base">Allow image sharing</Label>
                          <p className="text-sm text-muted-foreground">
                            Enable users to share images in the community
                          </p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="settings">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Application Settings</CardTitle>
                <CardDescription>
                  Configure global settings for the application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">General Settings</h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="app-name">Application Name</Label>
                        <Input id="app-name" defaultValue="PurePath" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="contact-email">Support Email</Label>
                        <Input id="contact-email" type="email" defaultValue="support@purepath.app" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                        <Select defaultValue="off">
                          <SelectTrigger id="maintenance-mode">
                            <SelectValue placeholder="Select mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="off">Off</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="on">On (Site Unavailable)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Features</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base">Community Chat</Label>
                          <p className="text-sm text-muted-foreground">
                            Enable chat features for all users
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base">Community Map</Label>
                          <p className="text-sm text-muted-foreground">
                            Show approximate locations of community members
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base">Analytics Tracking</Label>
                          <p className="text-sm text-muted-foreground">
                            Track relapses and progress for all users
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Security</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base">Two-Factor Authentication</Label>
                          <p className="text-sm text-muted-foreground">
                            Require 2FA for admin accounts
                          </p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base">Require Strong Passwords</Label>
                          <p className="text-sm text-muted-foreground">
                            Enforce strong password requirements
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                        <Input id="session-timeout" type="number" defaultValue="60" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button>Save Settings</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Admin;
