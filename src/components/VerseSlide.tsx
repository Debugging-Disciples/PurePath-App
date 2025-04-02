
import React from "react";
import { cn } from "@/lib/utils";
import { Heart, MessageSquare, Share2, Expand } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VerseSlideProps {
  className?: string;
  verseReference?: string;
  verseText?: string;
  style?: React.CSSProperties;
}

const VerseSlide: React.FC<VerseSlideProps> = ({
  className,
  verseReference,
  verseText,
  style
}) => {
  const [liked, setLiked] = React.useState(false);
  const likeCount = React.useMemo(() => Math.floor(Math.random() * 200000) + 1000, []);
  const shareCount = React.useMemo(() => Math.floor(Math.random() * 60000) + 1000, []);
  const commentCount = React.useMemo(() => Math.floor(Math.random() * 500) + 10, []);
  
  return (
    <div 
      className={cn(
        "rounded-xl overflow-hidden flex flex-col", 
        className
      )}
      style={style || {
        background: "linear-gradient(109.6deg, rgba(223,234,247,1) 11.2%, rgba(244,248,252,1) 91.1%)"
      }}
    >
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-semibold mb-2">{verseReference}</h3>
          <p className="text-2xl font-medium mt-6">{verseText}</p>
        </div>
        
        <div className="mt-8 flex justify-between items-center pt-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center space-x-1 hover:bg-black/5 px-2"
            onClick={() => setLiked(!liked)}
          >
            <Heart 
              className={cn(
                "h-5 w-5 transition-colors", 
                liked ? "fill-red-500 text-red-500" : ""
              )} 
            />
            <span className="text-sm font-medium">{(liked ? likeCount + 1 : likeCount).toLocaleString()}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center space-x-1 hover:bg-black/5 px-2"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-sm font-medium">{commentCount.toLocaleString()}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center space-x-1 hover:bg-black/5 px-2"
          >
            <Share2 className="h-5 w-5" />
            <span className="text-sm font-medium">{shareCount.toLocaleString()}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center space-x-1 hover:bg-black/5 px-2"
          >
            <Expand className="h-5 w-5" />
            <span className="text-sm font-medium">Expand</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerseSlide;
