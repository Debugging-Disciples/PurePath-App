
import React, { useState, useEffect } from 'react';
import { useAuth } from "../utils/auth";
import { getRelapseData, getJournalEntries } from '../utils/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart,
  Bar 
} from 'recharts';
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from 'date-fns';

const PartnerProgress: React.FC = () => {
  const { accountabilityPartners } = useAuth();
  const [selectedPartner, setSelectedPartner] = useState('');
  const [partnerData, setPartnerData] = useState<any>(null);
  const [journalData, setJournalData] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState('weekly');
  const isMobile = useIsMobile();

  // Get initials from name
  const getInitials = (user: any) => {
    if (!user) return 'U';
    
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
  };

  // Fetch partner data when selected partner changes
  useEffect(() => {
    const fetchPartnerData = async () => {
      if (!selectedPartner) return;
      
      const data = await getRelapseData(selectedPartner, timeframe);
      setPartnerData(data);
      
      const journalEntries = await getJournalEntries(selectedPartner);
      const formattedJournalData = journalEntries.map(entry => ({
        date: format(entry.timestamp, 'MMM d'),
        level: entry.level,
        emotions: entry.emotions || []
      }));
      
      setJournalData(formattedJournalData);
    };
    
    fetchPartnerData();
  }, [selectedPartner, timeframe]);

  // Set first partner as selected partner when component mounts
  useEffect(() => {
    if (accountabilityPartners.length > 0 && !selectedPartner) {
      setSelectedPartner(accountabilityPartners[0].id);
    }
  }, [accountabilityPartners, selectedPartner]);

  // Find the selected partner object
  const partner = accountabilityPartners.find(p => p.id === selectedPartner);

  if (accountabilityPartners.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Partner Progress</CardTitle>
          <CardDescription>
            View your accountability partner's progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4">
            <p className="text-muted-foreground">
              You don't have any accountability partners yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Add accountability partners from your friends list
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Partner Progress</CardTitle>
        <CardDescription>
          View your accountability partner's progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-4 items-start">
          <div className="w-full md:w-1/3">
            {/* Partner selection dropdown */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">
                Select Partner
              </label>
              <Select
                value={selectedPartner}
                onValueChange={setSelectedPartner}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a partner" />
                </SelectTrigger>
                <SelectContent>
                  {accountabilityPartners.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarFallback>{getInitials(p)}</AvatarFallback>
                        </Avatar>
                        {p.firstName} {p.lastName}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Partner details */}
            {partner && (
              <div className="p-4 border rounded-md bg-muted/10">
                <div className="flex items-center mb-4">
                  <Avatar className="h-12 w-12 mr-3">
                    <AvatarFallback className="text-lg">
                      {getInitials(partner)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{partner.firstName} {partner.lastName}</h3>
                    <p className="text-sm text-muted-foreground">{partner.email}</p>
                  </div>
                </div>
                
                {partnerData && (
                  <>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="p-2 bg-secondary/50 rounded-md text-center">
                        <p className="text-sm text-muted-foreground">Clean Days</p>
                        <p className="text-xl font-bold">{partnerData.cleanDays}</p>
                      </div>
                      <div className="p-2 bg-secondary/50 rounded-md text-center">
                        <p className="text-sm text-muted-foreground">Current Streak</p>
                        <p className="text-xl font-bold">{partnerData.streakData[partnerData.streakData.length - 1]?.streak || 0}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-secondary/50 rounded-md text-center">
                        <p className="text-sm text-muted-foreground">Longest Streak</p>
                        <p className="text-xl font-bold">{partnerData.longestStreak}</p>
                      </div>
                      <div className="p-2 bg-secondary/50 rounded-md text-center">
                        <p className="text-sm text-muted-foreground">Net Growth</p>
                        <p className={`text-xl font-bold ${partnerData.netGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {partnerData.netGrowth}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            
            {/* Timeframe selection */}
            <div className="mt-4">
              <label className="text-sm font-medium mb-1 block">
                Timeframe
              </label>
              <Select
                value={timeframe}
                onValueChange={setTimeframe}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Last 7 days</SelectItem>
                  <SelectItem value="monthly">Last 30 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="w-full md:w-2/3">
            {/* Data visualization tabs */}
            <Tabs defaultValue="streak" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="streak" className="flex-1">Streak</TabsTrigger>
                <TabsTrigger value="mood" className="flex-1">Mood</TabsTrigger>
              </TabsList>
              
              <TabsContent value="streak">
                {partnerData ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={partnerData.streakData}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          interval={isMobile ? 2 : 1}
                        />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="streak"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="mood">
                {journalData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={journalData}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          interval={isMobile ? 2 : 1}
                        />
                        <YAxis domain={[0, 10]} />
                        <Tooltip />
                        <Bar dataKey="level" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-muted-foreground">No mood data available</p>
                  </div>
                )}
                
                {journalData.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Recent Emotions</h4>
                    <div className="flex flex-wrap gap-2">
                      {journalData.slice(0, 3).flatMap(entry => 
                        entry.emotions.map((emotion: string, i: number) => (
                          <span key={`${entry.date}-${i}`} className="px-2 py-1 bg-secondary/50 rounded-full text-xs">
                            {emotion}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PartnerProgress;
