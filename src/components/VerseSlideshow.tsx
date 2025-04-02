
import React from "react";
import { cn } from "@/lib/utils";
import VerseSlide from "./VerseSlide";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VerseSlideshowProps {
  className?: string;
}

const verseReferences = {
  "John 3:16":
    "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
  "Philippians 4:13": "I can do all this through him who gives me strength.",
  "Psalm 23:1": "The Lord is my shepherd, I lack nothing.",
  "1 John 4:11": "Dear friends, since God loved us that much, we surely ought to love each other.",
  "Romans 8:38-39": "Nothing can ever separate us from God's love. Neither death nor life, neither angels nor demons, neither our fears for today nor our worries about tomorrow."
};

// Add some nice gradient backgrounds for each verse
const verseBackgrounds = [
  { background: "linear-gradient(109.6deg, rgba(223,234,247,1) 11.2%, rgba(244,248,252,1) 91.1%)" },
  { background: "linear-gradient(to top, #accbee 0%, #e7f0fd 100%)" },
  { background: "linear-gradient(to top, #d299c2 0%, #fef9d7 100%)" },
  { background: "linear-gradient(to right, #ffc3a0 0%, #ffafbd 100%)" },
  { background: "linear-gradient(184.1deg, rgba(249,255,182,1) 44.7%, rgba(226,255,172,1) 67.2%)" }
];

const VerseSlideshow: React.FC<VerseSlideshowProps> = ({ className }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const verseKeys = Object.keys(verseReferences);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % verseKeys.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [verseKeys.length]);

  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      <h3 className="text-xl font-semibold mb-2">Verse of the Day</h3>
      <AnimatePresence mode="wait">
        {Object.entries(verseReferences).map(
          ([reference, text], index) =>
            index === currentIndex && (
              <motion.div
                key={reference}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <VerseSlide 
                  verseReference={reference} 
                  verseText={text} 
                  style={verseBackgrounds[index % verseBackgrounds.length]}
                />
              </motion.div>
            )
        )}
      </AnimatePresence>
      
      <div className="flex justify-center mt-4">
        {verseKeys.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 mx-1 rounded-full ${
              index === currentIndex ? "bg-primary" : "bg-gray-300"
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default VerseSlideshow;
