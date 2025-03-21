import React from "react";
import { cn } from "@/lib/utils";

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
