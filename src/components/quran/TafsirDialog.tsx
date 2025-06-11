
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen } from "lucide-react";
import { getTafsirForVerse } from "@/data/quranData";

interface TafsirDialogProps {
  surah: number;
  ayah: number;
  verseKey: string;
}

export const TafsirDialog: React.FC<TafsirDialogProps> = ({ surah, ayah, verseKey }) => {
  const tafsir = getTafsirForVerse(surah, ayah);
  
  if (!tafsir) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-amber-200 text-amber-700 hover:bg-amber-50 bg-amber-25 text-xs">
          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          Tafsir
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] w-full">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-green-700">
            Tafsir for Verse {verseKey}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Commentary and explanation of this verse
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
          <div 
            className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: tafsir.text }}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
