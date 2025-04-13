import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Search,
  FilterX,
  SortDesc,
  SortAsc,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../utils/auth';
import { getJournalEntries } from '../utils/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useTheme } from 'next-themes';

// Helper function to get color based on mood score
const getMoodColor = (score: number) => {
  if (score <= 3) return "text-red-500 bg-red-100 dark:bg-red-900/30";
  if (score <= 5) return "text-amber-500 bg-amber-100 dark:bg-amber-900/30";
  if (score <= 7) return "text-blue-500 bg-blue-100 dark:bg-blue-900/30";
  return "text-green-500 bg-green-100 dark:bg-green-900/30";
};

// Helper function to get mood label
const getMoodLabel = (score: number) => {
  if (score <= 2) return "Very Unpleasant";
  if (score <= 4) return "Slightly Unpleasant";
  if (score <= 6) return "Neutral";
  if (score <= 8) return "Slightly Pleasant";
  return "Very Pleasant";
};

// Format date based on how recent it is
const formatEntryDate = (date: Date) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const entryDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffTime = today.getTime() - entryDate.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  
  if (diffDays === 0) {
    return `Today, ${format(date, 'h:mm a')}`;
  } else if (diffDays === 1) {
    return `Yesterday, ${format(date, 'h:mm a')}`;
  } else if (diffDays < 7) {
    return format(date, 'EEEE, h:mm a');
  } else {
    return format(date, 'MMM d, yyyy, h:mm a');
  }
};

interface JournalEntryData {
  timestamp: Date;
  question: string;
  notes: string;
  level: number;
  emotions: string[];
}

const ENTRIES_PER_PAGE = 5;

const JournalEntries = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [entries, setEntries] = useState<JournalEntryData[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const { theme, setTheme } = useTheme();

  // Calculate pagination
  const totalPages = Math.ceil(filteredEntries.length / ENTRIES_PER_PAGE);
  const currentEntries = filteredEntries.slice(
    (currentPage - 1) * ENTRIES_PER_PAGE,
    currentPage * ENTRIES_PER_PAGE
  );

  useEffect(() => {
    const fetchEntries = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        setIsLoading(true);
        const journalData = await getJournalEntries(currentUser.uid);
        
        // Convert Firebase timestamps to Date objects
        const formattedData = journalData.map(entry => ({
          ...entry,
          timestamp: entry.timestamp instanceof Date ? entry.timestamp : new Date(entry.timestamp)
        }));
        
        setEntries(formattedData);
        setFilteredEntries(formattedData);
      } catch (error) {
        console.error("Error fetching journal entries:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, [currentUser, navigate]);

  // Filter and sort entries based on search term and sort direction
  useEffect(() => {
    let filtered = [...entries];
    
    // Apply search filter if there is a search term
    if (searchTerm) {
      filtered = entries.filter(entry => 
        entry.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.emotions.some(emotion => 
          emotion.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Apply sort direction
    filtered.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredEntries(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [entries, searchTerm, sortDirection]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="container max-w-3xl py-8 px-4 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/journal')}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Journal Entries</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/journal')}
          >
            New Entry
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search entries..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
              onClick={clearSearch}
            >
              <FilterX className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'} found
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSortDirection}
          className="text-xs flex items-center"
        >
          {sortDirection === 'desc' ? (
            <>
              <SortDesc className="h-4 w-4 mr-1" />
              Newest first
            </>
          ) : (
            <>
              <SortAsc className="h-4 w-4 mr-1" />
              Oldest first
            </>
          )}
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : filteredEntries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-xl font-medium mb-2">No journal entries found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm 
                ? "No entries match your search. Try different keywords." 
                : "Start journaling to track your feelings and progress."}
            </p>
            <Button onClick={() => navigate('/journal')}>
              Create Your First Entry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {currentEntries.map((entry, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <h3 className="font-medium">{entry.question}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatEntryDate(entry.timestamp)}
                      </p>
                    </div>
                    <Badge className={`${getMoodColor(entry.level)} font-medium`}>
                      {getMoodLabel(entry.level)}
                    </Badge>
                  </div>
                  
                  <div className="mt-2">
                    <p className="whitespace-pre-wrap">{entry.notes}</p>
                  </div>
                  
                  {entry.emotions && entry.emotions.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1">
                      {entry.emotions.map((emotion, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {emotion}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    isDisabled={currentPage === 1}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  // Calculate page numbers for pagination based on current page
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNum)}
                        isActive={pageNum === currentPage}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                )}
                
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    isDisabled={currentPage === totalPages}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
};

export default JournalEntries;
