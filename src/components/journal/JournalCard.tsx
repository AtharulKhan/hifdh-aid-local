import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Tag, Edit } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useExpandable } from "@/hooks/use-expandable";
import { Button } from "@/components/ui/button";
import { useJournalStore } from "@/store/useJournalStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const updateJournal = useJournalStore((state) => state.updateJournal);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editedContent, setEditedContent] = React.useState(journal.content);
  const [editedDescription, setEditedDescription] = React.useState(journal.description);
  const [editedTags, setEditedTags] = React.useState(journal.tags.join(", "));

  useEffect(() => {
    if (contentRef.current) {
      animatedHeight.set(isExpanded ? contentRef.current.scrollHeight : 0);
    }
  }, [isExpanded, animatedHeight, journal.content]);

  // Update local state when journal prop changes
  useEffect(() => {
    setEditedContent(journal.content);
    setEditedDescription(journal.description);
    setEditedTags(journal.tags.join(", "));
  }, [journal]);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDialogOpen(true);
    setEditedContent(journal.content);
    setEditedDescription(journal.description);
    setEditedTags(journal.tags.join(", "));
  };

  const handleSave = () => {
    const tags = editedTags.split(",").map((tag) => tag.trim()).filter(Boolean);
    updateJournal(journal.id, { 
      content: editedContent,
      description: editedDescription,
      tags
    });
    setIsDialogOpen(false);
  };

  return (
    <>
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
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleEditClick}
                className="h-8 w-8"
              >
                <Edit className="h-4 w-4 text-muted-foreground" />
              </Button>
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
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{journal.content}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </CardContent>

          <CardFooter>
            <div className="flex items-center justify-between w-full">
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Created {new Date(journal.createdAt).toLocaleDateString()}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Updated {new Date(journal.updatedAt).toLocaleDateString()}
              </Badge>
            </div>
          </CardFooter>
        </Card>
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit Journal Entry</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Enter description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={editedTags}
                onChange={(e) => setEditedTags(e.target.value)}
                placeholder="Enter tags separated by commas"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[300px]"
              />
            </div>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}