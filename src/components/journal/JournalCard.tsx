import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Tag, Edit } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useExpandable } from "@/hooks/use-expandable";

interface JournalEntry {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface JournalCardProps {
  journal: JournalEntry;
  onClick: () => void;
}

export function JournalCard({ journal, onClick }: JournalCardProps) {
  const { isExpanded, toggleExpand, animatedHeight } = useExpandable();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      animatedHeight.set(isExpanded ? contentRef.current.scrollHeight : 0);
    }
  }, [isExpanded, animatedHeight]);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card 
        className="w-full cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => {
          toggleExpand();
          onClick();
        }}
      >
        <CardHeader className="space-y-1">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">{journal.title}</h3>
              <p className="text-sm text-muted-foreground">{journal.description}</p>
            </div>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {journal.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>

            <motion.div
              style={{ height: animatedHeight }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="overflow-hidden"
            >
              <div ref={contentRef}>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="mt-4 space-y-4"
                    >
                      <p className="text-sm text-gray-600">{journal.content}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </CardContent>

        <CardFooter>
          <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>Created {new Date(journal.createdAt).toLocaleDateString()}</span>
            </div>
            <span>Last updated {new Date(journal.updatedAt).toLocaleDateString()}</span>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}