
import React from "react";
import { cn } from "@/lib/utils";
import { Heart, MessageSquare, Share2, Maximize } from "lucide-react";

interface VerseSlideProps {
  className?: string;
  verseReference?: string;
  verseText?: string;
}

const VerseSlide: React.FC<VerseSlideProps> = ({
  className,
  verseReference,
  verseText,
}) => {
  return (
    <div className={cn("relative p-6 rounded-xl bg-gradient-to-br from-teal-600/90 to-teal-800/90 text-white shadow-lg", className)}>
      <div className="absolute top-4 right-4 flex space-x-1">
        <div className="h-1.5 w-1.5 bg-white/80 rounded-full"></div>
        <div className="h-1.5 w-1.5 bg-white/80 rounded-full"></div>
        <div className="h-1.5 w-1.5 bg-white/80 rounded-full"></div>
      </div>
      
      <div className="mb-1 text-white/90">Verse of the Day</div>
      <h3 className="text-xl font-semibold mb-6">{verseReference}</h3>
      
      <p className="text-lg font-medium mb-8">{verseText}</p>
      
      <div className="flex justify-between items-center mt-auto pt-2">
        <div className="flex items-center gap-1">
          <Heart className="h-5 w-5 text-white/80" />
          <span className="text-sm text-white/80">201.9k</span>
        </div>
        
        <div className="flex items-center gap-1">
          <MessageSquare className="h-5 w-5 text-white/80" />
          <span className="text-sm text-white/80">228</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Share2 className="h-5 w-5 text-white/80" />
          <span className="text-sm text-white/80">53,865</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Maximize className="h-5 w-5 text-white/80" />
          <span className="text-sm text-white/80">Expand</span>
        </div>
      </div>
    </div>
  );
};

export default VerseSlide;
