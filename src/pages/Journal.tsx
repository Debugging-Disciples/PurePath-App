
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ChevronRight, ChevronLeft, Save, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/hooks/use-toast";

const Journal: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [mood, setMood] = useState<string>("");
  const [triggers, setTriggers] = useState<string>("");
  const [gratitude, setGratitude] = useState<string>("");
  const isMobile = useIsMobile();

  const moods = ["Happy", "Calm", "Anxious", "Stressed", "Angry", "Sad", "Hopeful", "Grateful"];

  const handleSubmit = async () => {
    try {
      // Submit logic would go here
      toast({
        title: "Journal entry saved",
        description: "Your journal entry has been saved successfully.",
      });
      // Reset form
      setTitle("");
      setContent("");
      setMood("");
      setTriggers("");
      setGratitude("");
      setStep(1);
    } catch (error) {
      toast({
        title: "Error saving entry",
        description: "There was a problem saving your journal entry.",
        variant: "destructive",
      });
    }
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex justify-center items-center gap-2 mb-4">
        {[1, 2, 3, 4].map((s) => (
          <div 
            key={s} 
            className={`h-2 w-2 rounded-full ${step === s ? 'bg-primary' : 'bg-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Entry Title</Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Give your entry a title" 
              />
            </div>
            <div>
              <Label htmlFor="content">What's on your mind today?</Label>
              <Textarea 
                id="content" 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                placeholder="Write your thoughts here..." 
                className="min-h-[150px]"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <Label>How are you feeling today?</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {moods.map((m) => (
                <Button
                  key={m}
                  type="button"
                  variant={mood === m ? "default" : "outline"}
                  onClick={() => setMood(m)}
                  className="w-full"
                >
                  {m}
                </Button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="triggers">Did you encounter any triggers today?</Label>
              <Textarea
                id="triggers"
                value={triggers}
                onChange={(e) => setTriggers(e.target.value)}
                placeholder="Describe any triggers or challenges you faced..."
                className="min-h-[150px]"
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="gratitude">What are you grateful for today?</Label>
              <Textarea
                id="gratitude"
                value={gratitude}
                onChange={(e) => setGratitude(e.target.value)}
                placeholder="List three things you're grateful for..."
                className="min-h-[150px]"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderNavButtons = () => {
    return (
      <div className="flex justify-between items-center mt-6">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={step === 1}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        
        <div className="flex space-x-2">
          {step === 4 ? (
            <Button onClick={handleSubmit} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Entry
            </Button>
          ) : (
            <Button onClick={nextStep} className="flex items-center gap-2">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container py-6 max-w-3xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Journal Entry</h1>
        <Link to="/journal-entries">
          <Button variant="outline" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className={isMobile ? "sr-only" : ""}>Past Entries</span>
          </Button>
        </Link>
      </div>
      
      <Card className="p-4 md:p-6">
        {renderStepIndicator()}
        {renderStepContent()}
        {renderNavButtons()}
      </Card>
    </div>
  );
};

export default Journal;
