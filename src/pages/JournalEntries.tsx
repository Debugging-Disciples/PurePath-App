
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, PenSquare, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const JournalEntries: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const isMobile = useIsMobile();
  
  // Mock data for journal entries
  const mockEntries = [
    { id: 1, title: "First Day of Recovery", date: "2025-04-09", mood: "Hopeful", preview: "Today marks the beginning of my journey..." },
    { id: 2, title: "Overcoming a Challenge", date: "2025-04-08", mood: "Proud", preview: "I faced a difficult situation today but managed to..." },
    { id: 3, title: "Weekly Reflection", date: "2025-04-07", mood: "Calm", preview: "Looking back at this past week, I've made progress in..." },
    { id: 4, title: "Dealing with Triggers", date: "2025-04-05", mood: "Anxious", preview: "I encountered several triggers today. I noticed that..." },
    { id: 5, title: "Gratitude List", date: "2025-04-02", mood: "Grateful", preview: "Today I'm focusing on being grateful for..." },
  ];

  const filteredEntries = mockEntries.filter(entry => 
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.preview.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.mood.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-6 max-w-3xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Journal Entries</h1>
        <Link to="/journal">
          <Button variant="default" className="flex items-center gap-2">
            <PenSquare className="h-4 w-4" />
            <span className={isMobile ? "sr-only" : ""}>New Entry</span>
          </Button>
        </Link>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search entries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-4">
        {filteredEntries.length > 0 ? (
          filteredEntries.map(entry => (
            <Card key={entry.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{entry.title}</h3>
                <div className="flex flex-col items-end">
                  <span className="text-sm text-muted-foreground">{entry.date}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{entry.mood}</span>
                </div>
              </div>
              <p className="text-muted-foreground line-clamp-2">{entry.preview}</p>
              <div className="mt-3 flex justify-end">
                <Button variant="ghost" size="sm">Read More</Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No entries found matching your search.</p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <Link to="/journal">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Journal
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default JournalEntries;
