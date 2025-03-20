import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className={cn("default-class", className)}>
      <Card>
        <CardHeader>
          <CardTitle>{verseReference}</CardTitle>
        </CardHeader>
        {/* <AnimatePresence mode="wait">
          <motion.div
            key="verse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          > */}
        <CardContent>
          <blockquote className="text-lg italic mb-4">{verseText}</blockquote>
        </CardContent>
          {/* </motion.div>
        </AnimatePresence> */}
      </Card>
    </div>
  );
};

export default VerseSlide;
