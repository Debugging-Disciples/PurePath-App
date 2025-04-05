import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  ArrowLeft,
  Search,
  MoreVertical,
  BookOpen,
  Calendar,
  MessageSquareText,
  SortDesc,
  SortAsc,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useAuth } from "../utils/auth";
import { getJournalEntries, JournalEntry } from "../utils/firebase";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

const getMoodLabel = (score: number): string => {
  if (score <= 2) return "Very Unpleasant";
  if (score <= 4) return "Slightly Unpleasant";
  if (score <= 6) return "Neutral";
  if (score <= 8) return "Slightly Pleasant";
  return "Very Pleasant";
};

const getMoodColor = (score: number): string => {
  if (score <= 4) return "text-blue-600 dark:text-blue-400";
  if (score <= 6) return "text-slate-600 dark:text-slate-200";
  return "text-green-600 dark:text-green-400";
};

const getMoodBgColor = (score: number): string => {
  if (score <= 4) return "bg-blue-100 dark:bg-blue-400/20";
  if (score <= 6) return "bg-slate-100 dark:bg-slate-400/20";
  return "bg-green-100 dark:bg-green-400/20";
};

const JournalEntries: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const entriesPerPage = 10;

  useEffect(() => {
    // Check system preference for dark mode
    if (document.documentElement.classList.contains("dark")) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    const fetchEntries = async () => {
      if (!currentUser) {
        toast.error("You must be logged in to view journal entries");
        navigate("/login");
        return;
      }

      setIsLoading(true);
      try {
        const fetchedEntries = await getJournalEntries(currentUser.uid);
        setEntries(fetchedEntries);
        setFilteredEntries(fetchedEntries);

        if (fetchedEntries.length > 0) {
          const latestEntry = fetchedEntries[0];
          const latestMonth = format(latestEntry.timestamp, "MMMM yyyy");
          setSelectedMonth(latestMonth);
        }
      } catch (error) {
        console.error("Error fetching journal entries:", error);
        toast.error("Failed to load journal entries");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, [currentUser, navigate]);

  useEffect(() => {
    let filtered = entries;

    if (searchQuery) {
      filtered = filtered.filter(
        (entry) =>
          entry.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.emotions.some((emotion) =>
            emotion.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    if (selectedMonth) {
      filtered = filtered.filter(
        (entry) => format(entry.timestamp, "MMMM yyyy") === selectedMonth
      );
    }

    setFilteredEntries(filtered);
    setCurrentPage(1);
  }, [searchQuery, selectedMonth, entries]);

  const toggleSortDirection = () => {
    setSortDirection((prev) => {
      const newDirection = prev === "desc" ? "asc" : "desc";
      const sortedEntries = [...entries].sort((a, b) => {
        return newDirection === "desc"
          ? b.timestamp.getTime() - a.timestamp.getTime()
          : a.timestamp.getTime() - b.timestamp.getTime();
      });
      setEntries(sortedEntries);
      return newDirection;
    });
  };
  const months = React.useMemo(() => {
    const uniqueMonths = new Set<string>();
    entries.forEach((entry) => {
      const month = format(entry.timestamp, "MMMM yyyy");
      uniqueMonths.add(month);
    });
    return Array.from(uniqueMonths).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateB.getTime() - dateA.getTime();
    });
  }, [entries]);

  const stats = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    const entriesThisYear = entries.filter(
      (entry) => entry.timestamp.getFullYear() === currentYear
    );

    const totalWords = entriesThisYear.reduce((sum, entry) => {
      const wordCount = entry.notes.split(/\s+/).filter(Boolean).length;
      return sum + wordCount;
    }, 0);

    const uniqueDays = new Set(
      entriesThisYear.map((entry) => format(entry.timestamp, "yyyy-MM-dd"))
    ).size;

    return {
      entriesCount: entriesThisYear.length,
      wordsWritten: totalWords,
      daysJournaled: uniqueDays,
    };
  }, [entries]);

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredEntries.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );
  const totalPages = Math.ceil(filteredEntries.length / entriesPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const groupedEntries = React.useMemo(() => {
    const groups: Record<string, JournalEntry[]> = {};

    currentEntries.forEach((entry) => {
      const date = format(entry.timestamp, "EEEE, MMM d, yyyy");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(entry);
    });

    return groups;
  }, [currentEntries]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
      <div className="container py-8 px-4 mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/journal")}
              className="text-slate-800 dark:text-white"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-4xl font-bold tracking-tight text-slate-800 dark:text-white">
              Journal
            </h1>
          </div>
          <div className="flex gap-2 items-center">
            <Button variant="outline" size="icon" className="rounded-full">
              <Search className="h-5 w-5" />
            </Button>

            <div className="flex items-center justify-between">

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSortDirection}
                className="text-xs flex items-center"
              >
                {sortDirection === "desc" ? (
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
            <Button variant="outline" size="icon" className="rounded-full">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-none">
            <CardContent className="flex items-center p-4">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2 mr-4">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.entriesCount}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Entries This Year
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-none">
            <CardContent className="flex items-center p-4">
              <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-2 mr-4">
                <MessageSquareText className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {stats.wordsWritten.toLocaleString()}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Words Written
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-none">
            <CardContent className="flex items-center p-4">
              <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-2 mr-4">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.daysJournaled}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Days Journaled
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search journal entries..."
              className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue={selectedMonth || months[0]} className="mb-6">
          <TabsList className="bg-slate-100 dark:bg-slate-800 w-full h-auto flex overflow-x-auto p-1">
            {months.map((month) => (
              <TabsTrigger
                key={month}
                value={month}
                onClick={() => setSelectedMonth(month)}
                className="flex-shrink-0"
              >
                {month}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-8 w-8 border-4 border-t-blue-500 border-slate-200 rounded-full"></div>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-500" />
            <h3 className="text-xl font-semibold mb-2 text-slate-800 dark:text-white">
              No entries found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {entries.length === 0
                ? "You haven't written any journal entries yet."
                : "No entries match your current filters."}
            </p>
            {entries.length === 0 && (
              <Button onClick={() => navigate("/journal")}>
                Write your first entry
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {Object.entries(groupedEntries).map(([date, entriesForDate]) => (
                <div key={date} className="space-y-4">
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                    {date}
                  </h2>

                  {entriesForDate.map((entry, index) => (
                    <Card
                      key={index}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-none overflow-hidden"
                    >
                      <CardContent className="p-0">
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-full ${getMoodBgColor(
                                  entry.level
                                )} flex items-center justify-center`}
                              >
                                <div
                                  className={`w-5 h-5 rounded-full ${
                                    entry.level > 5
                                      ? "bg-green-600 dark:bg-green-400"
                                      : "bg-blue-600 dark:bg-blue-400"
                                  }`}
                                ></div>
                              </div>
                              <div>
                                <p
                                  className={`font-medium ${getMoodColor(
                                    entry.level
                                  )}`}
                                >
                                  {getMoodLabel(entry.level)}
                                </p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {entry.emotions.map((emotion) => (
                                    <Badge
                                      key={emotion}
                                      variant="outline"
                                      className="text-xs bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                                    >
                                      {emotion}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {format(entry.timestamp, "h:mm a")}
                            </p>
                          </div>

                          <div className="mb-4">
                            <h3 className="text-lg font-medium mb-2 text-slate-800 dark:text-white">
                              {entry.question}
                            </h3>
                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
                              {entry.notes}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      isDisabled={currentPage === 1}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                    )
                    .map((page, index, array) => {
                      if (index > 0 && page > array[index - 1] + 1) {
                        return (
                          <React.Fragment key={`ellipsis-${page}`}>
                            <PaginationItem>
                              <span className="flex h-9 w-9 items-center justify-center text-sm">
                                ...
                              </span>
                            </PaginationItem>
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => paginate(page)}
                                isActive={page === currentPage}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          </React.Fragment>
                        );
                      }

                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => paginate(page)}
                            isActive={page === currentPage}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        paginate(Math.min(totalPages, currentPage + 1))
                      }
                      isDisabled={currentPage === totalPages}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default JournalEntries;
