
import React from "react";
import { cn } from "@/lib/utils";
import VerseSlide from "./VerseSlide";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

interface VerseSlideshowProps {
  className?: string;
}

const verseReferences = {
  "John 3:16":
    "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
  "1 John 4:11": 
    "Dear friends, since God loved us that much, we surely ought to love each other.",
  "Philippians 4:13": "I can do all this through him who gives me strength.",
  "Psalm 23:1": "The Lord is my shepherd, I lack nothing.",
};

const VerseSlideshow: React.FC<VerseSlideshowProps> = ({ className }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const verseKeys = Object.keys(verseReferences);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % verseKeys.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [verseKeys.length]);

  return (
    <div className={cn("", className)}>
      <Carousel className="w-full">
        <CarouselContent>
          {Object.entries(verseReferences).map(
            ([reference, text], index) => (
              <CarouselItem key={reference}>
                <VerseSlide verseReference={reference} verseText={text} />
              </CarouselItem>
            )
          )}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default VerseSlideshow;
