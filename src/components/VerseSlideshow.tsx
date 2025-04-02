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
};

const VerseSlideshow: React.FC<VerseSlideshowProps> = ({ className }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const verseKeys = Object.keys(verseReferences);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % verseKeys.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [verseKeys.length]);

  return (
    <div className={cn("default-class", className)}>
      <AnimatePresence mode="wait">
        {Object.entries(verseReferences).map(
          ([reference, text], index) =>
            index === currentIndex && (
              <motion.div
                key={reference}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <VerseSlide verseReference={reference} verseText={text} />
              </motion.div>
            )
        )}
      </AnimatePresence>
    </div>
  );
};

export default VerseSlideshow;
