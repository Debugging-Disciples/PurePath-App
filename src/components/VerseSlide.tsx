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
        <blockquote className="text-lg">{verseReference}</blockquote>
        <blockquote className="text-muted-foreground italic">{verseText}</blockquote>
    </div>
  );
};

export default VerseSlide;
